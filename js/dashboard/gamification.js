// js/dashboard/gamification.js
// Handles all gamification features, such as achievements,
// progress tracking, and rewards. 

import { getAssessments } from './assessments.js';

export function updateDashboardStats() {
    const assessments = getAssessments();
    const totalCount = assessments.length;
    const highRiskCount = assessments.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length;
    const lowRiskCount = assessments.filter(a => a.risk_level === 'low').length;
    const avgScore = totalCount > 0 ? Math.round(assessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / totalCount) : 0;
    
    // Update stat cards
    const totalEl = document.getElementById('totalAssessments');
    const highEl = document.getElementById('highRiskCount');
    const lowEl = document.getElementById('lowRiskCount');
    const avgEl = document.getElementById('avgScore');
    const badgeEl = document.getElementById('assessmentBadge');
    const remainingEl = document.getElementById('remainingText');
    
    if (totalEl) totalEl.textContent = totalCount;
    if (highEl) highEl.textContent = highRiskCount;
    if (lowEl) lowEl.textContent = lowRiskCount;
    if (avgEl) avgEl.textContent = avgScore;
    if (badgeEl) badgeEl.textContent = totalCount;
    
    // Update remaining text
    const remaining = Math.max(0, 25 - totalCount);
    if (remainingEl) remainingEl.textContent = `${remaining} remaining in free tier`;
}

export function updateProgressTracking() {
    const totalCount = getAssessments().length;
    const limit = 25; // Free tier limit
    const percentage = Math.min((totalCount / limit) * 100, 100);
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('assessmentProgress');
    const remainingText = document.getElementById('remainingCount');
    
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${totalCount}/${limit}`;
    if (remainingText) remainingText.textContent = `${Math.max(0, limit - totalCount)} assessments remaining`;
}

export function loadAchievements() {
    const totalCount = getAssessments().length;
    const achievements = [
        {
            id: 'first-assessment',
            name: 'First Steps',
            description: 'Complete your first risk assessment',
            icon: '🎯',
            unlocked: totalCount >= 1,
            progress: Math.min(totalCount, 1),
            requirement: 1
        },
        {
            id: 'power-user',
            name: 'Power User',
            description: 'Complete 25 risk assessments',
            icon: '⚡',
            unlocked: totalCount >= 25,
            progress: Math.min(totalCount, 25),
            requirement: 25
        },
        {
            id: 'risk-expert',
            name: 'Risk Expert',
            description: 'Complete 50 risk assessments',
            icon: '🔍',
            unlocked: totalCount >= 50,
            progress: Math.min(totalCount, 50),
            requirement: 50
        }
    ];
    
    renderAchievements(achievements);
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    container.innerHTML = achievements.map(achievement => {
        const progressPercent = (achievement.progress / achievement.requirement) * 100;
        const statusClass = achievement.unlocked ? 'unlocked' : 'in-progress';
        
        return `
            <div class="achievement-card ${statusClass}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-lg">${achievement.icon}</span>
                        <h4 class="font-medium">${achievement.name}</h4>
                    </div>
                    ${achievement.unlocked ? '<span class="text-xs text-green-400">✓ Unlocked</span>' : ''}
                </div>
                <p class="text-sm text-gray-400 mb-2">${achievement.description}</p>
                ${!achievement.unlocked ? `
                    <div class="achievement-progress-bar">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="text-xs text-gray-400">${achievement.progress}/${achievement.requirement}</span>
                ` : ''}
            </div>
        `;
    }).join('');
} 