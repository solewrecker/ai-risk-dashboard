# Multi-AI Security Analysis Platform: Pricing & Database Architecture

## Cost Analysis & Pricing Strategy

## Operational Cost Model

### Monthly Batch Updates (Automated)
- **Cost**: $0.27-0.55 per app (spread across all users querying that app)
- **Frequency**: Automatic monthly scans for all previously analyzed apps
- **Funding**: Covered by monthly subscription fees
- **Benefit**: Keeps database fresh with minimal per-query cost

### Instant Updates (On-Demand)
- **Cost**: $0.50-1.00 per app (user pays directly)
- **Use Case**: User needs immediate analysis of app changes
- **Revenue**: Direct profit center with 200-400% margins
- **SLA**: Results within 15 minutes

### Database Queries (Free)
- **Cost**: ~$0.001 per query (negligible)
- **Unlimited**: No additional charges for accessing cached analyses
- **Value**: Encourages platform adoption and stickiness

### Optimized Pricing Model: "Analyze Once, Query Forever"

#### Startup Tier
- **Price**: $29/month
- **Included**: 50 new app analyses + unlimited database queries
- **Fresh Analysis**: $2.99 per new app (or instant update)
- **Database Queries**: FREE (historical analyses)
- **Monthly Updates**: Included for analyzed apps

#### Professional Tier  
- **Price**: $149/month
- **Included**: 300 new analyses + unlimited queries + priority updates
- **Fresh Analysis**: $1.99 per new app
- **Instant Updates**: $0.99 per app (vs waiting for monthly batch)
- **API Access**: Included for database queries

#### Enterprise Tier
- **Price**: $499/month
- **Included**: 1,500 new analyses + unlimited everything
- **Fresh Analysis**: $0.99 per new app
- **Instant Updates**: $0.49 per app
- **Real-time Monitoring**: Included (daily scans for changes)

#### Enterprise Plus
- **Price**: Custom (starts at $2,000/month)
- **Features**: Unlimited analyses, custom update schedules, dedicated models
- **Real-time**: Live monitoring with webhook alerts

## Database Schema Design

### Core Tables

#### 1. AI Analysis Sessions
```sql
CREATE TABLE ai_analysis_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    app_identifier VARCHAR(255) NOT NULL,
    session_type ENUM('standard', 'premium_council') DEFAULT 'premium_council',
    status ENUM('pending', 'analyzing', 'completed', 'failed') DEFAULT 'pending',
    total_cost_cents INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    consensus_level ENUM('high', 'medium', 'low'),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sessions_user_created ON ai_analysis_sessions(user_id, created_at);
CREATE INDEX idx_sessions_status ON ai_analysis_sessions(status);
```

#### 2. Individual AI Provider Results
```sql
CREATE TABLE ai_provider_analyses (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES ai_analysis_sessions(id) ON DELETE CASCADE,
    provider ENUM('gpt4', 'claude', 'huggingface') NOT NULL,
    model_version VARCHAR(50),
    analysis_type ENUM('vulnerability', 'compliance', 'privacy', 'ethical', 'classification'),
    
    -- Raw response data
    raw_response JSONB NOT NULL,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_cents INTEGER,
    
    -- Structured findings
    risk_score DECIMAL(3,2), -- 0.00 to 1.00
    confidence_level DECIMAL(3,2),
    findings JSONB DEFAULT '[]', -- Array of finding objects
    
    -- Status tracking
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL
);

CREATE INDEX idx_provider_analyses_session ON ai_provider_analyses(session_id);
CREATE INDEX idx_provider_analyses_provider ON ai_provider_analyses(provider, status);
```

#### 3. Consensus Analysis Results
```sql
CREATE TABLE consensus_analyses (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES ai_analysis_sessions(id) ON DELETE CASCADE,
    
    -- Consensus metrics
    overall_risk_score DECIMAL(3,2) NOT NULL,
    consensus_confidence DECIMAL(3,2) NOT NULL,
    agreement_percentage DECIMAL(5,2), -- 0.00 to 100.00
    
    -- Categorized findings
    consensus_findings JSONB DEFAULT '[]', -- Findings all AIs agreed on
    disputed_findings JSONB DEFAULT '[]', -- Findings with disagreement
    unique_findings JSONB DEFAULT '[]',   -- Findings only one AI found
    
    -- Risk categories
    vulnerability_score DECIMAL(3,2),
    privacy_score DECIMAL(3,2),
    compliance_score DECIMAL(3,2),
    ethical_score DECIMAL(3,2),
    
    -- Weights used for consensus
    provider_weights JSONB DEFAULT '{}', -- {"gpt4": 0.4, "claude": 0.35, "hf": 0.25}
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consensus_session ON consensus_analyses(session_id);
CREATE INDEX idx_consensus_risk_score ON consensus_analyses(overall_risk_score);
```

#### 4. Security Findings
```sql
CREATE TABLE security_findings (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES ai_analysis_sessions(id),
    provider_analysis_id UUID REFERENCES ai_provider_analyses(id) NULL,
    consensus_analysis_id UUID REFERENCES consensus_analyses(id) NULL,
    
    -- Finding classification
    finding_type ENUM('vulnerability', 'privacy_concern', 'compliance_issue', 'ethical_concern', 'suspicious_behavior'),
    severity ENUM('critical', 'high', 'medium', 'low', 'info'),
    category VARCHAR(100), -- "data_collection", "permissions", "third_party", etc.
    
    -- Finding details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '{}', -- Supporting evidence/context
    location JSONB DEFAULT '{}', -- Where in app/docs this was found
    
    -- AI consensus data
    detected_by JSONB DEFAULT '[]', -- ["gpt4", "claude"] - which AIs found this
    confidence_scores JSONB DEFAULT '{}', -- {"gpt4": 0.85, "claude": 0.92}
    is_consensus BOOLEAN DEFAULT FALSE, -- True if all AIs agreed
    
    -- Remediation
    remediation_suggestion TEXT,
    false_positive_likelihood DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_findings_session ON security_findings(session_id);
CREATE INDEX idx_findings_severity ON security_findings(severity);
CREATE INDEX idx_findings_type ON security_findings(finding_type);
CREATE INDEX idx_findings_consensus ON security_findings(is_consensus);
```

#### 5. AI Model Performance Tracking
```sql
CREATE TABLE ai_model_performance (
    id UUID PRIMARY KEY,
    provider ENUM('gpt4', 'claude', 'huggingface') NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    analysis_type ENUM('vulnerability', 'compliance', 'privacy', 'ethical', 'classification'),
    
    -- Performance metrics
    avg_processing_time_ms INTEGER,
    avg_cost_cents INTEGER,
    avg_confidence_score DECIMAL(3,2),
    accuracy_score DECIMAL(3,2), -- Based on validated results
    
    -- Usage statistics
    total_analyses INTEGER DEFAULT 0,
    successful_analyses INTEGER DEFAULT 0,
    failed_analyses INTEGER DEFAULT 0,
    
    -- Time period for these metrics
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_model_performance_provider ON ai_model_performance(provider, period_start);
```

#### 6. Cost Optimization Tracking
```sql
CREATE TABLE cost_optimization_logs (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES ai_analysis_sessions(id),
    
    -- Decision making
    initial_risk_assessment JSONB, -- From Hugging Face quick scan
    escalation_triggered BOOLEAN DEFAULT FALSE,
    escalation_reason VARCHAR(255),
    
    -- Cost comparison
    estimated_full_cost_cents INTEGER, -- What full analysis would cost
    actual_cost_cents INTEGER, -- What we actually spent
    savings_cents INTEGER, -- Difference
    
    -- Analysis path taken
    analysis_path JSONB, -- ["huggingface_quick"] or ["huggingface", "gpt4", "claude"]
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Supporting Tables

#### 7. User Billing & Usage
```sql
CREATE TABLE user_billing_cycles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    tier ENUM('startup', 'professional', 'enterprise', 'enterprise_plus'),
    
    -- Billing period
    cycle_start DATE NOT NULL,
    cycle_end DATE NOT NULL,
    
    -- Usage tracking
    included_analyses INTEGER NOT NULL,
    used_analyses INTEGER DEFAULT 0,
    overage_analyses INTEGER DEFAULT 0,
    
    -- Costs
    base_cost_cents INTEGER NOT NULL,
    overage_cost_cents INTEGER DEFAULT 0,
    total_cost_cents INTEGER GENERATED ALWAYS AS (base_cost_cents + overage_cost_cents) STORED,
    
    -- Status
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. Application Cache & Versioning
```sql
CREATE TABLE analyzed_applications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    
    -- App identification
    app_identifier VARCHAR(255) NOT NULL,
    app_name VARCHAR(255),
    app_version VARCHAR(50),
    app_version_hash VARCHAR(64), -- Hash of app binary/metadata for change detection
    platform ENUM('ios', 'android', 'web', 'desktop'),
    
    -- Current cached analysis
    current_analysis_id UUID REFERENCES consensus_analyses(id),
    current_risk_score DECIMAL(3,2),
    current_analysis_date TIMESTAMP,
    
    -- Update tracking
    last_checked_for_updates TIMESTAMP,
    update_frequency ENUM('never', 'monthly', 'weekly', 'daily', 'real_time') DEFAULT 'monthly',
    needs_update BOOLEAN DEFAULT FALSE,
    
    -- Analysis history
    total_analyses INTEGER DEFAULT 0,
    risk_trend ENUM('improving', 'stable', 'degrading'),
    
    -- Cost optimization
    is_popular BOOLEAN DEFAULT FALSE, -- Flag high-query apps for priority updates
    query_count INTEGER DEFAULT 0, -- Track how often this app is queried
    
    -- Metadata
    first_analyzed_at TIMESTAMP DEFAULT NOW(),
    last_analyzed_at TIMESTAMP,
    
    UNIQUE(user_id, app_identifier, app_version)
);

CREATE INDEX idx_apps_needs_update ON analyzed_applications(needs_update, update_frequency);
CREATE INDEX idx_apps_popular ON analyzed_applications(is_popular, query_count);
```

#### 9. Query Cache & Usage Tracking
```sql
CREATE TABLE app_query_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    app_id UUID REFERENCES analyzed_applications(id),
    
    -- Query details
    query_type ENUM('dashboard', 'api', 'report', 'instant_update_request'),
    served_from_cache BOOLEAN DEFAULT TRUE,
    cache_age_hours INTEGER, -- How old was the cached data
    
    -- Response details
    response_time_ms INTEGER,
    data_freshness ENUM('current', 'stale_acceptable', 'stale_warning', 'expired'),
    
    -- Billing
    billable BOOLEAN DEFAULT FALSE, -- Only new analyses are billable
    cost_cents INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_query_logs_user_date ON app_query_logs(user_id, created_at);
CREATE INDEX idx_query_logs_billable ON app_query_logs(billable, created_at);
```

#### 10. Monthly Update Scheduler
```sql
CREATE TABLE scheduled_updates (
    id UUID PRIMARY KEY,
    app_id UUID REFERENCES analyzed_applications(id),
    
    -- Scheduling
    scheduled_for TIMESTAMP NOT NULL,
    priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
    update_type ENUM('monthly_batch', 'instant_paid', 'popularity_driven', 'user_requested'),
    
    -- Status
    status ENUM('pending', 'processing', 'completed', 'failed', 'skipped') DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Results
    new_analysis_id UUID REFERENCES ai_analysis_sessions(id),
    changes_detected BOOLEAN DEFAULT FALSE,
    cost_cents INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_updates_due ON scheduled_updates(scheduled_for, status);
CREATE INDEX idx_scheduled_updates_priority ON scheduled_updates(priority, scheduled_for);
```

## Key Design Considerations

### Performance Optimizations
- **Parallel Processing**: All three AI providers can analyze simultaneously
- **Caching**: Store results for identical app versions to avoid re-analysis
- **Indexing**: Optimized for common query patterns (user sessions, risk scores, consensus data)

### Cost Management Features
- **Smart Escalation**: Only use expensive APIs when Hugging Face detects high risk
- **Budget Controls**: Hard limits on monthly spending per user
- **Usage Analytics**: Detailed cost breakdowns for optimization

### Data Retention
- Keep raw AI responses for 90 days (debugging/appeals)
- Keep structured findings indefinitely
- Archive old sessions after 2 years

### Scalability Considerations
- Use UUID primary keys for horizontal sharding
- JSONB fields for flexible, evolving AI response formats
- Separate tables for performance metrics and billing to avoid joins on hot paths

This architecture supports the "AI Security Council" approach while maintaining cost control and providing detailed analytics for both users and platform optimization.

---

## Frontend Theming and Customization

### Architecture Decision: CSS Swapping

After discussion, the chosen approach for user-facing customization is **CSS swapping**. This method was selected over a more complex database-driven layout system for its simplicity, maintainability, and performance.

The core idea is to maintain a consistent HTML structure for dynamic components and allow users to select different "themes" that apply new styles by loading a different CSS stylesheet.

### Database Schema for Theming

To support this, the following database changes will be implemented:

1.  **`dashboard_themes` Table**: A new table to store available theme options.
    *   `id` (UUID): Primary key for the theme.
    *   `name` (TEXT): A user-friendly name for the theme (e.g., "Default Dark", "Light Mode").
    *   `stylesheet_url` (TEXT): The path to the theme's main CSS file (e.g., `/css/style.css`).

2.  **`profiles` Table Modification**: A new column will be added to the user profiles table.
    *   `selected_theme_id` (UUID): A foreign key that references the `id` in the `dashboard_themes` table. This stores the user's current theme preference.

This setup allows for easy addition of new themes in the future and persists user preferences without altering the core application logic.