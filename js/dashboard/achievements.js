import { getAssessments } from './assessments.js';

// Achievement data management and rendering
export class AchievementsManager {
    constructor(containerSelector = '.achievements') {
        this.container = document.querySelector(containerSelector);
        this.achievementsData = this.getAchievementDefinitions();
        this.assessmentsCount = 0;
    }

    initialize() {
        if (!this.container) {
            console.warn('Achievements container not found.');
            return;
        }
        this.updateProgress();
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
        const status = progress.isUnlocked ? 'unlocked' : progress.percentage > 0 ? 'in-progress' : 'locked';

        return `
            <div class="achievement-card ${status}">
                <div class="achievement-header">
                    <div class="achievement-icon ${status}">
                        <i data-lucide="${achievement.icon}"></i>
                    </div>
                    <h3 class="achievement-name">${achievement.name}</h3>
                </div>
                <p class="achievement-description">${achievement.description}</p>
                ${this.renderProgress(progress)}
            </div>
        `;
    }

    renderProgress(progress) {
        if (progress.isUnlocked) {
            return `
                <div class="unlock-status unlocked">
                    <i data-lucide="unlock"></i>
                    <span>Unlocked!</span>
                </div>
            `;
        }

        return `
            <div class="achievement-progress">
                <div class="progress-bar in-progress" style="width: ${progress.percentage}%"></div>
                <span class="progress-text">${progress.current} / ${progress.required}</span>
            </div>
        `;
    }

    render() {
        if (!this.container) return;

        const achievementsHTML = this.achievementsData
            .map(achievement => this.renderAchievementCard(achievement))
            .join('');

        this.container.innerHTML = `
            <div class="achievements-header">
                <h2 class="achievements-title">Achievements</h2>
                <i data-lucide="trophy" class="trophy-icon"></i>
            </div>
            <div class="achievements-grid">
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

    // Example: Update achievements when an assessment is completed
    window.updateAchievements = () => achievementsManager.updateProgress();
}); 