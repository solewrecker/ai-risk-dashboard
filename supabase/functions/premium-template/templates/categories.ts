import { getComponentRiskLevel, getRiskLevelClass } from '../utils.ts';

// Helper to format sub-category keys into readable names
function formatDetailLabel(key: string): string {
    const words = key.replace(/([A-Z])/g, ' $1').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
}

export function generateCategoriesHTML(componentScores: any, dbData: any): string {
    const categoryMapping: { [key: string]: { name: string; maxScore: number } } = {
        dataStorage: { name: "Data Storage & Security", maxScore: 25 },
        trainingUsage: { name: "Training Data Usage", maxScore: 25 },
        accessControls: { name: "Access Controls", maxScore: 20 },
        complianceRisk: { name: "Compliance Risk", maxScore: 20 },
        vendorTransparency: { name: "Vendor Transparency", maxScore: 10 }
    };

    const categoriesHtml = Object.keys(categoryMapping).map(key => {
        const categoryInfo = categoryMapping[key];
        const score = componentScores[key];
        const riskLevel = getComponentRiskLevel(score, categoryInfo.maxScore);
        const riskClass = getRiskLevelClass(riskLevel);

        // Correctly access the nested subScores from the breakdown object
        const subcategories = dbData?.breakdown?.subScores?.[key];
        let detailsHtml = 'No detailed information available.';

        if (typeof subcategories === 'object' && subcategories !== null) {
            const subCategoryDetails = Object.keys(subcategories).map(subKey => {
                const detailItem = subcategories[subKey];
                
                // Extract the note from the sub-item
                const detailText = (typeof detailItem === 'object' && detailItem !== null && detailItem.note) 
                    ? detailItem.note 
                    : detailItem;

                if (!detailText || typeof detailText === 'object') return '';

                // Special handling for Compliance Risk to highlight critical gaps
                if (key === 'complianceRisk' && typeof detailText === 'string' && detailText.includes('CRITICAL GAP:')) {
                    const [preGap, gapText] = detailText.split('CRITICAL GAP:');
                    return `<div class="detail-row">${preGap}</div>
                            <div class="critical-gap">
                                <div class="gap-title">CRITICAL GAP:</div>
                                <div class="gap-text">${gapText}</div>
                            </div>`;
                }

                return `<div class="detail-row"><span class="detail-label">${formatDetailLabel(subKey)}:</span> ${detailText}</div>`;
            }).join('');
            
            if(subCategoryDetails) {
                 detailsHtml = subCategoryDetails;
            }
        }
        
        // Special container for the entire "Compliance Risk" category
        if (key === 'complianceRisk' && (subcategories || score > 0)) {
             return `<div class="compliance-risk">
                        <div class="category-header">
                            <div class="category-title">${categoryInfo.name}</div>
                            <div class="risk-badge ${riskClass}">${riskLevel}</div>
                        </div>
                        <div class="category-details">${detailsHtml}</div>
                    </div>`;
        }

        // Standard container for all other categories
        return `<div class="risk-category ${riskClass}">
                    <div class="category-header">
                        <h4 class="category-title">${categoryInfo.name}</h4>
                        <span class="risk-badge ${riskClass}">${riskLevel}</span>
                    </div>
                    <div class="category-details">${detailsHtml}</div>
                </div>`;
    }).join('');

    return `<div class="section">
             <div class="section-header">
                 <div class="analysis-icon">🔍</div>
                 <h2 class="section-title">Security Risk Analysis</h2>
             </div>
             <div class="risk-categories">${categoriesHtml}</div>
            </div>`;
} 