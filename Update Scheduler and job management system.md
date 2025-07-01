import asyncio
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional, Dict
import psycopg2
from celery import Celery
import redis

# Initialize Celery for distributed task processing
celery_app = Celery('ai_security_scheduler', 
                   broker='redis://localhost:6379/0',
                   backend='redis://localhost:6379/0')

class UpdatePriority(Enum):
    CRITICAL = 1      # Instant paid updates
    HIGH = 2          # Popular apps (>100 queries/month)
    MEDIUM = 3        # Regular monthly updates
    LOW = 4           # Rarely queried apps
    MAINTENANCE = 5   # Cleanup/optimization tasks

class UpdateType(Enum):
    MONTHLY_BATCH = "monthly_batch"
    INSTANT_PAID = "instant_paid"
    POPULARITY_DRIVEN = "popularity_driven"
    USER_REQUESTED = "user_requested"
    VERSION_CHANGE = "version_change"

@dataclass
class UpdateJob:
    app_id: str
    priority: UpdatePriority
    update_type: UpdateType
    scheduled_for: datetime
    estimated_cost_cents: int
    user_id: Optional[str] = None  # For paid instant updates

class SmartUpdateScheduler:
    def __init__(self, db_connection, redis_client):
        self.db = db_connection
        self.redis = redis_client
        self.daily_budget_cents = 50000  # $500/day budget
        self.logger = logging.getLogger(__name__)
        
    def schedule_monthly_updates(self):
        """Schedule all monthly batch updates with smart prioritization"""
        
        # Get apps that need monthly updates
        query = """
        SELECT 
            a.id, a.app_identifier, a.query_count, a.last_analyzed_at,
            COUNT(q.id) as recent_queries,
            a.current_risk_score
        FROM analyzed_applications a
        LEFT JOIN app_query_logs q ON a.id = q.app_id 
            AND q.created_at > NOW() - INTERVAL '30 days'
        WHERE 
            a.update_frequency = 'monthly'
            AND (a.last_analyzed_at < NOW() - INTERVAL '25 days' 
                 OR a.needs_update = true)
        GROUP BY a.id
        ORDER BY 
            recent_queries DESC,  -- Prioritize frequently queried apps
            a.current_risk_score DESC,  -- High-risk apps get priority
            a.last_analyzed_at ASC  -- Oldest updates first
        """
        
        cursor = self.db.cursor()
        cursor.execute(query)
        apps_to_update = cursor.fetchall()
        
        # Calculate priorities and spread updates across the month
        jobs = []
        for i, app_data in enumerate(apps_to_update):
            app_id, app_identifier, total_queries, last_analyzed, recent_queries, risk_score = app_data
            
            # Determine priority based on usage and risk
            if recent_queries > 100:  # Popular apps
                priority = UpdatePriority.HIGH
                # Schedule popular apps early in the month
                days_offset = min(5, i // 20)  # First 100 apps in first 5 days
            elif recent_queries > 20:
                priority = UpdatePriority.MEDIUM
                days_offset = 5 + (i // 10)  # Spread medium priority over remaining days
            else:
                priority = UpdatePriority.LOW
                days_offset = 15 + (i // 5)  # Low priority apps later in month
            
            # Don't schedule beyond month end
            days_offset = min(days_offset, 28)
            
            scheduled_time = datetime.now().replace(day=1) + timedelta(days=days_offset)
            
            jobs.append(UpdateJob(
                app_id=app_id,
                priority=priority,
                update_type=UpdateType.MONTHLY_BATCH,
                scheduled_for=scheduled_time,
                estimated_cost_cents=55  # Average cost
            ))
        
        # Insert scheduled jobs into database
        self._batch_insert_jobs(jobs)
        self.logger.info(f"Scheduled {len(jobs)} monthly updates")
        
        return jobs
    
    def schedule_instant_update(self, app_id: str, user_id: str) -> bool:
        """Schedule high-priority instant update (user pays)"""
        
        # Check if app already has pending instant update
        existing_check = """
        SELECT id FROM scheduled_updates 
        WHERE app_id = %s 
        AND update_type = 'instant_paid'
        AND status = 'pending'
        AND scheduled_for > NOW() - INTERVAL '1 hour'
        """
        
        cursor = self.db.cursor()
        cursor.execute(existing_check, (app_id,))
        
        if cursor.fetchone():
            self.logger.warning(f"Instant update already pending for app {app_id}")
            return False
        
        # Schedule immediate high-priority update
        job = UpdateJob(
            app_id=app_id,
            priority=UpdatePriority.CRITICAL,
            update_type=UpdateType.INSTANT_PAID,
            scheduled_for=datetime.now(),
            estimated_cost_cents=100,  # Premium cost for instant
            user_id=user_id
        )
        
        self._insert_single_job(job)
        
        # Trigger immediate processing
        process_update_queue.delay(priority_filter=UpdatePriority.CRITICAL.value)
        
        return True
    
    def get_daily_budget_remaining(self) -> int:
        """Check remaining budget for today"""
        today = datetime.now().date()
        
        query = """
        SELECT COALESCE(SUM(cost_cents), 0) as spent_today
        FROM scheduled_updates s
        JOIN ai_analysis_sessions a ON s.new_analysis_id = a.id
        WHERE DATE(s.completed_at) = %s
        AND s.status = 'completed'
        """
        
        cursor = self.db.cursor()
        cursor.execute(query, (today,))
        spent_today = cursor.fetchone()[0]
        
        return max(0, self.daily_budget_cents - spent_today)
    
    def optimize_daily_schedule(self):
        """Dynamically adjust today's schedule based on budget and priorities"""
        
        remaining_budget = self.get_daily_budget_remaining()
        
        if remaining_budget < 100:  # Less than $1 remaining
            self.logger.warning("Daily budget nearly exhausted, pausing low priority updates")
            self._pause_low_priority_updates()
            return
        
        # Get pending jobs for today, ordered by priority
        query = """
        SELECT id, app_id, priority, estimated_cost_cents, update_type
        FROM scheduled_updates
        WHERE DATE(scheduled_for) = CURRENT_DATE
        AND status = 'pending'
        ORDER BY priority ASC, scheduled_for ASC
        """
        
        cursor = self.db.cursor()
        cursor.execute(query)
        pending_jobs = cursor.fetchall()
        
        # Calculate which jobs fit in remaining budget
        affordable_jobs = []
        running_cost = 0
        
        for job in pending_jobs:
            job_id, app_id, priority, cost, update_type = job
            
            if running_cost + cost <= remaining_budget:
                affordable_jobs.append(job_id)
                running_cost += cost
            elif priority <= 2:  # Critical/High priority
                # For important jobs, proceed anyway (budget is a guideline)
                affordable_jobs.append(job_id)
                running_cost += cost
        
        # Mark unaffordable jobs to be rescheduled
        if len(affordable_jobs) < len(pending_jobs):
            unaffordable = [job[0] for job in pending_jobs if job[0] not in affordable_jobs]
            self._reschedule_jobs(unaffordable, days_offset=1)
        
        self.logger.info(f"Approved {len(affordable_jobs)} jobs for today, estimated cost: ${running_cost/100:.2f}")
        
        return affordable_jobs
    
    def _batch_insert_jobs(self, jobs: List[UpdateJob]):
        """Efficiently insert multiple jobs"""
        
        insert_query = """
        INSERT INTO scheduled_updates 
        (app_id, scheduled_for, priority, update_type, estimated_cost_cents, created_by_user_id)
        VALUES %s
        ON CONFLICT (app_id, scheduled_for, update_type) DO NOTHING
        """
        
        values = [(
            job.app_id,
            job.scheduled_for,
            job.priority.value,
            job.update_type.value,
            job.estimated_cost_cents,
            job.user_id
        ) for job in jobs]
        
        cursor = self.db.cursor()
        cursor.executemany(insert_query, values)
        self.db.commit()
    
    def _insert_single_job(self, job: UpdateJob):
        """Insert single job with immediate commit"""
        
        insert_query = """
        INSERT INTO scheduled_updates 
        (app_id, scheduled_for, priority, update_type, estimated_cost_cents, created_by_user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        
        cursor = self.db.cursor()
        cursor.execute(insert_query, (
            job.app_id, job.scheduled_for, job.priority.value,
            job.update_type.value, job.estimated_cost_cents, job.user_id
        ))
        self.db.commit()
        
        return cursor.fetchone()[0]
    
    def _pause_low_priority_updates(self):
        """Pause low priority updates when budget is tight"""
        
        pause_query = """
        UPDATE scheduled_updates 
        SET status = 'paused',
            scheduled_for = scheduled_for + INTERVAL '1 day'
        WHERE priority >= %s 
        AND status = 'pending'
        AND DATE(scheduled_for) = CURRENT_DATE
        """
        
        cursor = self.db.cursor()
        cursor.execute(pause_query, (UpdatePriority.LOW.value,))
        self.db.commit()
    
    def _reschedule_jobs(self, job_ids: List[str], days_offset: int):
        """Reschedule jobs to future date"""
        
        reschedule_query = """
        UPDATE scheduled_updates 
        SET scheduled_for = scheduled_for + INTERVAL '%s days'
        WHERE id = ANY(%s)
        """
        
        cursor = self.db.cursor()
        cursor.execute(reschedule_query, (days_offset, job_ids))
        self.db.commit()

# Celery Tasks for Distributed Processing
@celery_app.task(bind=True, max_retries=3)
def process_update_queue(self, priority_filter=None):
    """Process pending updates from the queue"""
    
    # Get next batch of jobs to process
    query = """
    SELECT id, app_id, update_type, priority
    FROM scheduled_updates
    WHERE status = 'pending'
    AND scheduled_for <= NOW()
    """
    
    if priority_filter:
        query += f" AND priority = {priority_filter}"
    
    query += " ORDER BY priority ASC, scheduled_for ASC LIMIT 10"
    
    # Process each job
    db = get_db_connection()  # Your DB connection function
    cursor = db.cursor()
    cursor.execute(query)
    jobs = cursor.fetchall()
    
    for job_id, app_id, update_type, priority in jobs:
        try:
            # Mark job as processing
            cursor.execute(
                "UPDATE scheduled_updates SET status = 'processing', started_at = NOW() WHERE id = %s",
                (job_id,)
            )
            db.commit()
            
            # Execute the actual AI analysis
            result = execute_ai_analysis.delay(app_id, update_type)
            
            # Update job with results
            cursor.execute("""
                UPDATE scheduled_updates 
                SET status = 'completed', 
                    completed_at = NOW(),
                    new_analysis_id = %s,
                    actual_cost_cents = %s
                WHERE id = %s
            """, (result.analysis_id, result.cost_cents, job_id))
            
            db.commit()
            
        except Exception as e:
            # Mark job as failed and schedule retry
            cursor.execute("""
                UPDATE scheduled_updates 
                SET status = 'failed',
                    error_message = %s,
                    scheduled_for = NOW() + INTERVAL '1 hour'
                WHERE id = %s
            """, (str(e), job_id))
            
            db.commit()
            
            # Retry with exponential backoff
            if self.request.retries < 3:
                raise self.retry(countdown=60 * (2 ** self.request.retries))

@celery_app.task
def execute_ai_analysis(app_id: str, update_type: str):
    """Execute the actual AI analysis with all three providers"""
    
    from your_ai_module import PremiumAICollaboration  # Your existing AI code
    
    # Get app details
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(
        "SELECT app_identifier, app_version FROM analyzed_applications WHERE id = %s",
        (app_id,)
    )
    app_identifier, app_version = cursor.fetchone()
    
    # Perform AI analysis
    ai_analyzer = PremiumAICollaboration()
    app_docs = fetch_app_documentation(app_identifier, app_version)  # Your doc fetching logic
    
    analysis_result = ai_analyzer.collaborative_analysis(app_docs)
    
    # Store results in database
    analysis_id = store_analysis_results(analysis_result, app_id)
    
    # Update app cache
    cursor.execute("""
        UPDATE analyzed_applications 
        SET current_analysis_id = %s,
            current_risk_score = %s,
            current_analysis_date = NOW(),
            last_analyzed_at = NOW(),
            needs_update = FALSE
        WHERE id = %s
    """, (analysis_id, analysis_result.overall_risk_score, app_id))
    
    db.commit()
    
    return {
        'analysis_id': analysis_id,
        'cost_cents': analysis_result.total_cost_cents,
        'risk_score': analysis_result.overall_risk_score
    }

# Daily cron job runner
@celery_app.task
def daily_scheduler_maintenance():
    """Run daily maintenance and optimization"""
    
    db = get_db_connection()
    scheduler = SmartUpdateScheduler(db, redis.Redis())
    
    # Optimize today's schedule based on budget
    scheduler.optimize_daily_schedule()
    
    # Schedule next month's updates (run on 25th of each month)
    if datetime.now().day == 25:
        scheduler.schedule_monthly_updates()
    
    # Clean up old completed jobs
    cleanup_old_jobs(db)
    
    # Update app popularity scores
    update_popularity_metrics(db)

def cleanup_old_jobs(db):
    """Clean up completed jobs older than 90 days"""
    cursor = db.cursor()
    cursor.execute("""
        DELETE FROM scheduled_updates 
        WHERE status IN ('completed', 'failed')
        AND completed_at < NOW() - INTERVAL '90 days'
    """)
    db.commit()

def update_popularity_metrics(db):
    """Update app popularity flags based on recent query patterns"""
    cursor = db.cursor()
    cursor.execute("""
        UPDATE analyzed_applications a
        SET is_popular = (
            SELECT COUNT(*) > 50 
            FROM app_query_logs q 
            WHERE q.app_id = a.id 
            AND q.created_at > NOW() - INTERVAL '30 days'
        ),
        query_count = (
            SELECT COUNT(*) 
            FROM app_query_logs q 
            WHERE q.app_id = a.id 
            AND q.created_at > NOW() - INTERVAL '30 days'
        )
    """)
    db.commit()

# Utility functions
def get_db_connection():
    """Your database connection logic"""
    pass

def fetch_app_documentation(app_identifier, app_version):
    """Your app documentation fetching logic"""
    pass

def store_analysis_results(analysis_result, app_id):
    """Your result storage logic"""
    pass

# Usage Example:
if __name__ == "__main__":
    # Initialize scheduler
    db = get_db_connection()
    redis_client = redis.Redis()
    scheduler = SmartUpdateScheduler(db, redis_client)
    
    # Schedule monthly updates (run this on the 1st of each month)
    scheduler.schedule_monthly_updates()
    
    # Start daily worker processes
    # celery -A update_scheduler worker --loglevel=info --concurrency=4