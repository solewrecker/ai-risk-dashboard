import { getAssessments } from './assessments.js';

// Achievement data management and rendering
export class AchievementsManager {
    constructor(containerSelector = '.dashboard-achievements') {
        this.container = document.querySelector(containerSelector);
        this.achievementsData = this.getAchievementDefinitions();
        this.assessmentsCount = 0;
    }

    initialize() {
        if (!this.container) {
            console.warn('Achievements container not found.');
            return;
        }
        
        // Initial update
        this.updateProgress();
        
        // Listen for assessment changes
        document.addEventListener('assessmentsUpdated', () => {
            this.updateProgress();
        });
    }

    getAchievementDefinitions() {
        return [
            {
                id: 'rookie',
                name: 'Risk Assessment Rookie',
                description: 'Complete your first assessment',
                icon: 'check-circle',
                requiredCount: 1
            },
            {
                id: 'detective',
                name: 'Risk Detective',
                description: 'Complete 10 assessments',
                icon: 'search',
                requiredCount: 10
            },
            {
                id: 'power_user',
                name: 'Power User',
                description: 'Complete 25 assessments',
                icon: 'zap',
                requiredCount: 25
            },
            {
                id: 'risk_master',
                name: 'Risk Master',
                description: 'Complete 50 assessments',
                icon: 'shield',
                requiredCount: 50
            }
        ];
    }

    calculateProgress(achievement) {
        const current = this.assessmentsCount;
        const required = achievement.requiredCount;
        const isUnlocked = current >= required;
        const percentage = Math.min(100, (current / required) * 100);

        return {
            isUnlocked,
            percentage,
            current,
            required
        };
    }

    renderAchievementCard(achievement) {
        const progress = this.calculateProgress(achievement);
        const isUnlocked = progress.isUnlocked;
        const percentage = progress.percentage;
        let status = '';
        if (isUnlocked) status = 'unlocked';
        else if (percentage > 0) status = 'in-progress';
        else status = 'locked';

        // Icon color class
        const iconClass = `achievement-icon ${status}`;
        const nameClass = `achievement-name ${status}`;

        return `
            <div class="achievement-card ${status}">
                <div class="achievement-content">
                    <div class="achievement-header">
                        <i data-lucide="${achievement.icon}" class="${iconClass}"></i>
                        <span class="${nameClass}">${achievement.name}</span>
                    </div>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-progress-wrapper">
                        <div class="achievement-progress">
                            <div class="progress-bar ${status}" style="width: ${percentage}%;"></div>
                        </div>
                        <span class="progress-numbers">${progress.current}/${progress.required}</span>
                    </div>
                    <div class="unlock-status">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Unlocked!</span>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        if (!this.container) return;

        const achievementsHTML = this.achievementsData
            .map(achievement => this.renderAchievementCard(achievement))
            .join('');

        this.container.innerHTML = `
            <div class="dashboard-achievements__list">
                ${achievementsHTML}
            </div>
        `;

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateProgress() {
        this.assessmentsCount = getAssessments().length;
        this.render();
    }
}

// Initialize achievements on page load
document.addEventListener('DOMContentLoaded', () => {
    const achievementsManager = new AchievementsManager();
    achievementsManager.initialize();
});

function renderAchievements(completedCount) {
    const container = document.querySelector('.dashboard-achievements');
    if (!container) return;

    const achievements = getAchievements();

    const content = achievements.map(achievement => {
        const isUnlocked = completedCount >= achievement.goal;
        const progress = Math.min(completedCount, achievement.goal);
        const percentage = achievement.goal > 0 ? (progress / achievement.goal) * 100 : 0;
        
        const status = isUnlocked ? 'unlocked' : (progress > 0 ? 'in-progress' : 'locked');
        const icon = isUnlocked ? 'check-circle-2' : achievement.icon;

        return `
            <div class="achievement-card ${status}">
                <div class="achievement-content">
                    <div class="achievement-header">
                        <i data-lucide="${icon}" class="achievement-icon ${status}"></i>
                        <span class="achievement-name ${status}">${achievement.name}</span>
                    </div>
                    <p class="achievement-description">${achievement.description}</p>
                    
                    <div class="achievement-progress-wrapper">
                        <div class="achievement-progress">
                            <div class="progress-bar ${status}" style="width: ${percentage}%"></div>
                        </div>
                        <span class="progress-numbers">${progress}/${achievement.goal}</span>
                    </div>
                    <div class="unlock-status">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        <span>Unlocked!</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="achievements-header">
            <h2 class="achievements-title">Achievements</h2>
            <i data-lucide="trophy" class="trophy-icon"></i>
        </div>
        <div class="achievements-grid">
            ${content}
        </div>
    `;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
} 