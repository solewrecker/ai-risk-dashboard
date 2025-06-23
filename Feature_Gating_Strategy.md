# Feature Gating Strategy for AI Risk Assessment SaaS

## 🎯 Overview
Transform the current single-file HTML application into a tiered SaaS with strategic feature limitations that drive upgrades.

---

## 🔒 Feature Gate Implementation

### JavaScript Feature Gates
```javascript
// Feature gating system
class FeatureGate {
    constructor(userTier = 'free') {
        this.userTier = userTier;
        this.limits = {
            free: {
                maxTools: 3,
                exports: ['html'],
                search: 'basic',
                apiCalls: 0,
                teamMembers: 1,
                features: ['basic-assessment']
            },
            professional: {
                maxTools: -1, // unlimited
                exports: ['html', 'pdf', 'excel'],
                search: 'advanced',
                apiCalls: 100,
                teamMembers: 5,
                features: ['advanced-search', 'cloud-sync', 'team-sharing']
            },
            enterprise: {
                maxTools: -1,
                exports: ['html', 'pdf', 'excel', 'custom'],
                search: 'ai-powered',
                apiCalls: -1, // unlimited
                teamMembers: -1,
                features: ['all']
            }
        };
    }

    canCreateTool() {
        const limit = this.limits[this.userTier].maxTools;
        if (limit === -1) return true;
        return this.getCurrentToolCount() < limit;
    }

    canExport(format) {
        return this.limits[this.userTier].exports.includes(format);
    }

    canUseAdvancedSearch() {
        return ['advanced', 'ai-powered'].includes(this.limits[this.userTier].search);
    }

    canMakeApiCall() {
        const limit = this.limits[this.userTier].apiCalls;
        if (limit === -1) return true;
        if (limit === 0) return false;
        return this.getCurrentApiCalls() < limit;
    }

    getUpgradeMessage(feature) {
        const messages = {
            'max-tools': `You've reached the limit of ${this.limits[this.userTier].maxTools} tools. Upgrade to Pro for unlimited tools.`,
            'pdf-export': 'PDF exports are available in Pro and Enterprise plans.',
            'advanced-search': 'Advanced search features require a Pro subscription.',
            'api-access': 'API access is available starting with the Pro plan.',
            'team-features': 'Team collaboration requires a Pro or Enterprise plan.'
        };
        return messages[feature] || 'This feature requires a paid subscription.';
    }
}
```

### UI Feature Gates
```javascript
// Modified tool creation with limits
function addTool() {
    const featureGate = new FeatureGate(getCurrentUserTier());
    
    if (!featureGate.canCreateTool()) {
        showUpgradeModal('max-tools', featureGate.getUpgradeMessage('max-tools'));
        return;
    }
    
    // Proceed with tool creation...
}

// Modified export with format restrictions
function exportReport() {
    const featureGate = new FeatureGate(getCurrentUserTier());
    const selectedFormat = getSelectedExportFormat();
    
    if (!featureGate.canExport(selectedFormat)) {
        showUpgradeModal('export-format', featureGate.getUpgradeMessage('pdf-export'));
        return;
    }
    
    // Proceed with export...
}

// Advanced search gating
function performAdvancedSearch(query) {
    const featureGate = new FeatureGate(getCurrentUserTier());
    
    if (!featureGate.canUseAdvancedSearch()) {
        showUpgradeModal('advanced-search', featureGate.getUpgradeMessage('advanced-search'));
        return performBasicSearch(query);
    }
    
    // Perform advanced search with AI/ML features
}
```

---

## 🔍 Search & Filter Feature Tiers

### Free Tier - Basic Search
```javascript
function basicSearch(query) {
    return tools.filter(tool => 
        tool.name.toLowerCase().includes(query.toLowerCase())
    );
}

function basicFilter(riskLevel, category) {
    return tools.filter(tool => {
        const matchesRisk = riskLevel === 'all' || getRiskLevel(calculateTotalScore(tool)) === riskLevel;
        const matchesCategory = category === 'all' || tool.category === category;
        return matchesRisk && matchesCategory;
    });
}
```

### Pro Tier - Advanced Search
```javascript
function advancedSearch(query, options = {}) {
    const {
        searchFields = ['name', 'category', 'details'],
        dateRange = null,
        scoreRange = null,
        tags = []
    } = options;
    
    return tools.filter(tool => {
        // Multi-field search
        const matchesQuery = searchFields.some(field => {
            if (field === 'details') {
                return Object.values(tool.details).some(detail => 
                    detail.toLowerCase().includes(query.toLowerCase())
                );
            }
            return tool[field]?.toLowerCase().includes(query.toLowerCase());
        });
        
        // Date range filtering
        const matchesDate = !dateRange || (
            new Date(tool.lastUpdated) >= new Date(dateRange.start) &&
            new Date(tool.lastUpdated) <= new Date(dateRange.end)
        );
        
        // Score range filtering
        const matchesScore = !scoreRange || (
            calculateTotalScore(tool) >= scoreRange.min &&
            calculateTotalScore(tool) <= scoreRange.max
        );
        
        return matchesQuery && matchesDate && matchesScore;
    });
}

// Saved searches for Pro users
class SavedSearches {
    constructor() {
        this.searches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    }
    
    save(name, query, filters) {
        if (!new FeatureGate(getCurrentUserTier()).canUseAdvancedSearch()) {
            throw new Error('Saved searches require Pro subscription');
        }
        
        this.searches.push({
            id: Date.now(),
            name,
            query,
            filters,
            created: new Date().toISOString()
        });
        
        localStorage.setItem('savedSearches', JSON.stringify(this.searches));
    }
}
```

### Enterprise Tier - AI-Powered Search
```javascript
function aiPoweredSearch(naturalLanguageQuery) {
    // Simulate AI search (would use actual AI service in production)
    const intentMap = {
        'gdpr': tool => tool.details.complianceRisk.includes('GDPR'),
        'hipaa': tool => tool.details.complianceRisk.includes('HIPAA'),
        'high risk': tool => getRiskLevel(calculateTotalScore(tool)) === 'high',
        'encryption': tool => tool.details.dataStorage.includes('encryption'),
        'training data': tool => tool.trainingUsage > 15
    };
    
    const intent = Object.keys(intentMap).find(key => 
        naturalLanguageQuery.toLowerCase().includes(key)
    );
    
    if (intent) {
        return tools.filter(intentMap[intent]);
    }
    
    // Fallback to advanced search
    return advancedSearch(naturalLanguageQuery);
}
```

---

## 📊 Export Feature Tiers

### Free Tier - Basic HTML Export
```javascript
function generateBasicReport(tools) {
    // Watermarked, simplified HTML report
    const reportHTML = `
        <div style="position: fixed; bottom: 10px; right: 10px; opacity: 0.7; font-size: 12px; color: #999;">
            Generated with AI Risk Assessment Tool - Upgrade for full features
        </div>
        <!-- Simplified report content -->
    `;
    return reportHTML;
}
```

### Pro Tier - Advanced Exports
```javascript
function generatePDFReport(tools) {
    // Full-featured PDF with custom branding
    const pdfOptions = {
        format: 'A4',
        margin: { top: '1in', bottom: '1in' },
        header: { height: '0.5in', contents: getCustomHeader() },
        footer: { height: '0.5in', contents: getCustomFooter() }
    };
    
    return generatePDF(tools, pdfOptions);
}

function generateExcelReport(tools) {
    // Excel export with formulas and charts
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Risk Assessment');
    
    // Add data with formulas
    tools.forEach((tool, index) => {
        worksheet.addRow([
            tool.name,
            tool.category,
            calculateTotalScore(tool),
            `=VLOOKUP(C${index + 2}, RiskLevels, 2, FALSE)` // Risk level formula
        ]);
    });
    
    return workbook;
}
```

### Enterprise Tier - Custom Templates
```javascript
function generateCustomReport(tools, template) {
    // White-label reports with custom templates
    const customTemplate = getTemplate(template.id);
    
    return customTemplate.generate(tools, {
        branding: template.branding,
        layout: template.layout,
        sections: template.sections
    });
}
```

---

## 🤝 Team & Collaboration Features

### Pro Tier - Basic Team Features
```javascript
class TeamManagement {
    constructor(userTier) {
        this.userTier = userTier;
        this.maxMembers = {
            free: 1,
            professional: 5,
            enterprise: -1
        };
    }
    
    canAddMember() {
        const limit = this.maxMembers[this.userTier];
        if (limit === -1) return true;
        return this.getCurrentMemberCount() < limit;
    }
    
    shareAssessment(assessmentId, memberEmail) {
        if (!this.canAddMember()) {
            throw new Error('Team member limit reached. Upgrade to add more members.');
        }
        
        // Share assessment logic
    }
}
```

### Enterprise Tier - Advanced Permissions
```javascript
class AdvancedPermissions {
    constructor() {
        this.roles = {
            admin: ['create', 'edit', 'delete', 'share', 'manage-users'],
            editor: ['create', 'edit', 'share'],
            viewer: ['view']
        };
    }
    
    hasPermission(userRole, action) {
        return this.roles[userRole]?.includes(action) || false;
    }
    
    auditLog(userId, action, resourceId) {
        // Log all actions for compliance
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId,
            action,
            resourceId,
            ip: getCurrentUserIP()
        };
        
        saveAuditLog(logEntry);
    }
}
```

---

## 📈 Usage Analytics & Limits

### API Usage Tracking
```javascript
class ApiUsageTracker {
    constructor(userId, userTier) {
        this.userId = userId;
        this.userTier = userTier;
        this.monthlyLimit = {
            free: 0,
            professional: 100,
            enterprise: -1
        }[userTier];
    }
    
    async trackApiCall(endpoint) {
        const usage = await this.getCurrentMonthUsage();
        
        if (this.monthlyLimit !== -1 && usage >= this.monthlyLimit) {
            throw new Error(`API limit exceeded. Upgrade to increase limit.`);
        }
        
        await this.recordApiCall(endpoint);
        
        // Warn when approaching limit
        if (usage >= this.monthlyLimit * 0.8) {
            this.sendUsageWarning(usage, this.monthlyLimit);
        }
    }
}
```

### Storage Limits
```javascript
class StorageLimits {
    constructor(userTier) {
        this.limits = {
            free: 10, // MB
            professional: 1000, // 1GB
            enterprise: -1 // unlimited
        };
        this.currentLimit = this.limits[userTier];
    }
    
    canStoreData(dataSize) {
        if (this.currentLimit === -1) return true;
        
        const currentUsage = this.getCurrentUsage();
        return (currentUsage + dataSize) <= this.currentLimit;
    }
}
```

---

## 🎨 Upgrade Prompts & CTAs

### Upgrade Modal Component
```javascript
function showUpgradeModal(feature, message) {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="upgrade-content">
            <h3>🚀 Upgrade Required</h3>
            <p>${message}</p>
            
            <div class="upgrade-options">
                <div class="plan-card professional">
                    <h4>Professional</h4>
                    <div class="price">$99/month</div>
                    <ul>
                        <li>Unlimited tools</li>
                        <li>PDF/Excel exports</li>
                        <li>Advanced search</li>
                        <li>Team collaboration</li>
                    </ul>
                    <button onclick="upgradeTo('professional')">Upgrade Now</button>
                </div>
                
                <div class="plan-card enterprise">
                    <h4>Enterprise</h4>
                    <div class="price">$299/month</div>
                    <ul>
                        <li>Everything in Pro</li>
                        <li>Unlimited API calls</li>
                        <li>SSO integration</li>
                        <li>White-label reports</li>
                    </ul>
                    <button onclick="upgradeTo('enterprise')">Contact Sales</button>
                </div>
            </div>
            
            <button class="close-modal" onclick="closeUpgradeModal()">Maybe Later</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}
```

---

## 💡 Strategic Recommendations

### 1. **Start with Generous Free Tier**
- Give users enough functionality to see value
- 3 tools is enough for evaluation
- Basic exports show the quality

### 2. **Make Pro Tier Compelling**
- $99/month hits the business tool sweet spot
- Unlimited tools removes the main friction
- Team features drive organizational adoption

### 3. **Enterprise Tier for Scale**
- White-labeling for consultants/agencies
- SSO for large organizations
- Custom pricing creates sales conversations

### 4. **Feature Gate Strategically**
- Gate convenience features (advanced search, saved filters)
- Gate collaboration features (team sharing, permissions)
- Gate professional outputs (PDF, branding)

### 5. **Usage-Based Upsells**
- API call overages
- Storage upgrades
- Additional team members

This strategy maximizes revenue while providing clear upgrade paths and maintaining user satisfaction at each tier. 