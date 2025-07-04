// Achievement data management and rendering
class AchievementsManager {
    constructor() {
        this.container = document.querySelector('.achievements');
        this.achievementsData = null;
        this.userProgress = null;
    }

    async initialize() {
        await this.fetchAchievementsData();
        await this.fetchUserProgress();
        this.render();
    }

    async fetchAchievementsData() {
        try {
            // TODO: Replace with actual API endpoint
            const response = await fetch('/api/achievements');
            this.achievementsData = await response.json();
        } catch (error) {
            console.error('Error fetching achievements:', error);
            // Fallback to default achievements if API fails
            this.achievementsData = this.getDefaultAchievements();
        }
    }

    async fetchUserProgress() {
        try {
            // TODO: Replace with actual API endpoint
            const response = await fetch('/api/user/progress');
            this.userProgress = await response.json();
        } catch (error) {
            console.error('Error fetching user progress:', error);
            // Fallback to default progress if API fails
            this.userProgress = this.getDefaultProgress();
        }
    }

    getDefaultAchievements() {
        return [
            {
                id: 'rookie',
                name: 'Risk Assessment Rookie',
                description: 'Complete your first assessment',
                icon: 'fa-check-circle',
                requiredCount: 1
            },
            {
                id: 'detective',
                name: 'Risk Detective',
                description: 'Complete 10 assessments',
                icon: 'fa-search',
                requiredCount: 10
            },
            {
                id: 'power_user',
                name: 'Power User',
                description: 'Complete 25 assessments',
                icon: 'fa-bolt',
                requiredCount: 25
            },
            {
                id: 'theme_collector',
                name: 'Theme Collector',
                description: 'Unlock all free themes',
                icon: 'fa-star',
                requiredCount: 5 // Number of available themes
            }
        ];
    }

    getDefaultProgress() {
        return {
            assessmentsCompleted: 18,
            themesUnlocked: 2,
            achievements: ['rookie', 'detective']
        };
    }

    calculateProgress(achievement) {
        const progress = {
            isUnlocked: false,
            percentage: 0,
            current: 0,
            required: achievement.requiredCount
        };

        switch (achievement.id) {
            case 'rookie':
            case 'detective':
            case 'power_user':
                progress.current = this.userProgress.assessmentsCompleted;
                break;
            case 'theme_collector':
                progress.current = this.userProgress.themesUnlocked;
                break;
        }

        progress.percentage = Math.min(100, (progress.current / progress.required) * 100);
        progress.isUnlocked = this.userProgress.achievements.includes(achievement.id);

        return progress;
    }

    renderAchievementCard(achievement) {
        const progress = this.calculateProgress(achievement);
        const status = progress.isUnlocked ? 'unlocked' : progress.percentage > 0 ? 'in-progress' : 'locked';

        return `
            <div class="achievement-card">
                <div class="achievement-header">
                    <div class="achievement-icon ${status}">
                        <i class="fas ${achievement.icon}"></i>
                    </div>
                    <h3 class="achievement-name ${progress.isUnlocked ? 'unlocked' : ''}">${achievement.name}</h3>
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
                    <i class="fas fa-unlock"></i>
                    <span>Unlocked!</span>
                </div>
            `;
        }

        return `
            <div class="achievement-progress">
                <div class="progress-bar in-progress" style="width: ${progress.percentage}%"></div>
            </div>
        `;
    }

    renderAlmostThere() {
        const powerUserAchievement = this.achievementsData.find(a => a.id === 'power_user');
        const progress = this.calculateProgress(powerUserAchievement);
        const remaining = powerUserAchievement.requiredCount - progress.current;

        if (remaining > 0 && !progress.isUnlocked) {
            return `
                <div class="almost-there">
                    <div class="achievement-header">
                        <div class="achievement-icon almost-there-icon">
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <h3 class="achievement-name">Almost There!</h3>
                    </div>
                    <p class="almost-there-text">
                        Complete ${remaining} more assessment${remaining > 1 ? 's' : ''} to unlock the "Power User" achievement and earn the exclusive Neon theme!
                    </p>
                </div>
            `;
        }
        return '';
    }

    render() {
        if (!this.container || !this.achievementsData || !this.userProgress) return;

        const achievementsHTML = this.achievementsData
            .map(achievement => this.renderAchievementCard(achievement))
            .join('');

        const almostThereHTML = this.renderAlmostThere();

        this.container.innerHTML = `
            <div class="achievements-header">
                <h2 class="achievements-title">Achievements</h2>
                <i class="fas fa-trophy trophy-icon"></i>
            </div>
            ${achievementsHTML}
            ${almostThereHTML}
        `;
    }

    // Update achievements when user completes an assessment
    async updateProgress() {
        await this.fetchUserProgress();
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