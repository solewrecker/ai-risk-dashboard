import {
  getRiskLevelClass,
  formatDatabaseDetails,
  getComponentRiskLevel,
  applyMultipliersToComponents,
  extractCriticalFindings,
  extractFormattedDetails
} from './utils.ts';

import { generateRecommendationsHTML } from './recommendations.ts';

export function generateFreePdfHTML(data: any) {
  console.log('🔍 [PDF] Received data structure:', Object.keys(data));
  console.log('🔍 [PDF] Tool name received:', data.toolName);
  
  const dbData = data.databaseContent as any;

  // Apply multipliers to get final component scores
  const adjustedScores = applyMultipliersToComponents(dbData, data);
  
  // Normalize and format data with database content
  const normalizedData = {
    toolName: data.toolName || 'Unknown Tool',
    toolCategory: data.toolCategory || 'AI Platform',
    finalScore: data.finalScore || 0,
    riskLevel: (data.riskLevel || 'unknown').toUpperCase(),
    baseScore: data.baseScore || 0,
    dataClassification: data.dataClassification || 'public',
    useCase: data.useCase || 'general',
    dbData: dbData,
    data_storage_risk_level: getComponentRiskLevel(adjustedScores.dataStorage),
    data_storage_details: extractFormattedDetails('dataStorage', dbData),
    training_usage_risk_level: getComponentRiskLevel(adjustedScores.trainingUsage),
    training_usage_details: extractFormattedDetails('trainingUsage', dbData),
    access_controls_risk_level: getComponentRiskLevel(adjustedScores.accessControls),
    access_controls_details: extractFormattedDetails('accessControls', dbData),
    compliance_risk_level: getComponentRiskLevel(adjustedScores.complianceRisk),
    compliance_details: extractFormattedDetails('complianceRisk', dbData),
    vendor_transparency_risk_level: getComponentRiskLevel(adjustedScores.vendorTransparency),
    vendor_transparency_details: extractFormattedDetails('vendorTransparency', dbData)
  };
  
  console.log('🎯 [PDF] Using database content:', {
    toolName: normalizedData.toolName,
    hasDbData: !!dbData,
    dataStorageLength: normalizedData.data_storage_details?.length || 0
  });
  
  const riskColor = normalizedData.riskLevel === 'LOW' ? '#10b981' : 
                   normalizedData.riskLevel === 'MODERATE' ? '#f59e0b' : 
                   normalizedData.riskLevel === 'HIGH' ? '#ef4444' : '#dc2626';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise AI Risk Assessment - ${normalizedData.toolName}</title>
    <!-- Reliable CDN links without integrity checks -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <!-- Backup CDN in case primary fails -->
    <script>
        window.addEventListener('DOMContentLoaded', function() {
            // Check if libraries loaded, if not try backup
            if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
                console.log('Primary jsPDF failed, loading backup...');
                const script1 = document.createElement('script');
                script1.src = 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js';
                document.head.appendChild(script1);
            }
            if (typeof html2canvas === 'undefined') {
                console.log('Primary html2canvas failed, loading backup...');
                const script2 = document.createElement('script');
                script2.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
                document.head.appendChild(script2);
            }
        });
    </script>
    <style>
        /* === DYNAMIC VARIABLES === */
        :root {
            --risk-color: ${riskColor};
            --risk-color-light: ${riskColor}CC;
        }
        /* === BASE STYLES === */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f8fafc;
        }
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        /* === HEADER === */
        .header {
            background-color: #1a2a45; /* Dark blue-slate base */
            background-image: 
                radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
                linear-gradient(135deg, #1a2a45 0%, #1e3a8a 100%); /* Subtle gradient */
            color: white;
            padding: 3rem 2.5rem;
            position: relative;
            border-bottom: 4px solid #3b82f6; /* Accent border */
        }
        .header-grid { /* New container for a flex layout */
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .header-main { /* Left side */
            flex: 2;
        }
        .report-title {
            font-size: 2.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
            color: #f0f9ff; /* Slightly off-white */
        }
        .report-subtitle {
            font-size: 1.1rem;
            opacity: 0.8;
            font-weight: 300;
            max-width: 400px; /* Constrain line length */
        }
        .header-side { /* Right side */
            flex: 1;
            display: flex;
            justify-content: flex-end;
        }
        .tool-highlight {
            background: rgba(0, 0, 0, 0.15); /* Darker, subtle background */
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            border-radius: 12px;
            text-align: right;
            width: 100%;
            max-width: 350px;
        }
        .tool-highlight .tool-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }
        .tool-highlight .tool-subtitle {
            font-size: 0.9rem;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .report-meta {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            font-size: 0.85rem;
            color: #cbd5e1; /* Lighter grey for meta text */
        }
        .report-meta strong {
            font-weight: 600;
            color: #e2e8f0; /* Slightly brighter for labels */
        }
        /* === EXECUTIVE SUMMARY === */
        .executive-summary {
            padding: 2rem;
            background: white;
            border-bottom: 1px solid #e2e8f0;
        }
        .summary-header {
            margin-bottom: 2rem;
        }
        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            opacity: 1;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 3rem;
            margin-bottom: 2rem;
            align-items: center;
        }
        /* Risk Score Card */
        .risk-score-display {
            background: linear-gradient(135deg, var(--risk-color) 0%, var(--risk-color-light) 100%);
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            color: white;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            min-width: 250px;
        }
        .risk-score-number {
            font-size: 4rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        .risk-score-total {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        .risk-level-badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 700;
            font-size: 1rem;
            display: inline-block;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            backdrop-filter: blur(10px);
        }
        .risk-description {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            line-height: 1.5;
        }
        .summary-insights {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .insight-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .insight-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .insight-text {
            color: #64748b;
            font-size: 0.95rem;
        }
        .key-findings {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 1.5rem;
        }
        .findings-title {
            color: #92400e;
            font-weight: 700;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .findings-list {
            color: #92400e;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        /* === TOOL INFORMATION === */
        .tool-info-section {
            padding: 2rem;
            background: #f8fafc;
        }
        .tool-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .tool-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .tool-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
        }
        .tool-details {
            flex: 1;
        }
        .tool-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.25rem;
        }
        .tool-category {
            color: #64748b;
            font-size: 0.9rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #e2e8f0;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
        }
        .info-value {
            font-weight: 500;
            color: #1f2937;
        }
        .info-value.critical {
            color: #dc2626;
            font-weight: 700;
        }
        /* === SECURITY RISK ANALYSIS === */
        .risk-breakdown {
            padding: 2rem;
            background: #f8fafc;
        }
        .categories-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .category-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-top: 4px solid;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .category-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .category-card.low {
            border-top-color: #10b981;
        }
        .category-card.medium {
            border-top-color: #f59e0b;
        }
        .category-card.high {
            border-top-color: #ef4444;
        }
        .category-card.critical {
            border-top-color: #dc2626;
        }
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .category-name {
            font-weight: 600;
            color: #1e293b;
            flex: 1;
        }
        .category-score {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
            margin-left: 1rem;
        }
        .category-score.low {
            background: #dcfce7;
            color: #166534;
        }
        .category-score.medium {
            background: #fef3c7;
            color: #92400e;
        }
        .category-score.high {
            background: #fecaca;
            color: #991b1b;
        }
        .category-score.critical {
            background: #dc2626;
            color: white;
        }
        .category-description {
            color: #64748b;
            font-size: 0.9rem;
            line-height: 1.6;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #f1f5f9;
        }
        .category-description strong {
            color: #374151;
        }
        .category-description p {
            margin-bottom: 0.75rem;
        }
        .category-description p:last-child {
            margin-bottom: 0;
        }
        /* === RECOMMENDATIONS === */
        .recommendations-section {
            padding: 2rem;
            background: linear-gradient(to right, #f0fdf4, white);
        }
        .recommendations-grid {
            display: grid;
            gap: 1rem;
        }
        .recommendation-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
            transition: transform 0.2s ease;
        }
        .recommendation-card:hover {
            transform: translateX(4px);
        }
        .recommendation-card.priority-high {
            border-left-color: #dc2626;
            background: linear-gradient(to right, #fef2f2, white);
        }
        .recommendation-card.priority-medium {
            border-left-color: #f59e0b;
            background: linear-gradient(to right, #fef9e7, white);
        }
        .recommendation-card.priority-low {
            border-left-color: #16a34a;
            background: linear-gradient(to right, #f0fdf4, white);
        }
        .recommendation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .recommendation-title {
            font-weight: 700;
            color: #1e293b;
        }
        .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .priority-badge.priority-high {
            background: #dc2626;
            color: white;
        }
        .priority-badge.priority-medium {
            background: #f59e0b;
            color: white;
        }
        .priority-badge.priority-low {
            background: #16a34a;
            color: white;
        }
        .recommendation-text {
            color: #64748b;
            line-height: 1.6;
        }
        /* === FOOTER === */
        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            padding: 40px;
            color: white;
            position: relative;
            overflow: hidden;
        }
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 40px;
            position: relative;
            z-index: 1;
        }
        .footer-section {
            display: flex;
            flex-direction: column;
        }
        .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        .footer .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #f1f5f9;
        }
        .section-content {
            line-height: 1.6;
            color: #cbd5e1;
            font-size: 14px;
        }
        .meta-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }
        .meta-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .meta-label {
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
        }
        .meta-value {
            font-size: 13px;
            color: #e2e8f0;
            font-weight: 600;
        }
        .disclaimer-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .disclaimer-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 13px;
            line-height: 1.5;
        }
        .disclaimer-icon {
            width: 16px;
            height: 16px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
            flex-shrink: 0;
        }
        .footer-bottom {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(148, 163, 184, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #94a3b8;
        }
        .ai-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(59, 130, 246, 0.1);
            padding: 6px 12px;
            border-radius: 20px;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .ai-badge-icon {
            width: 16px;
            height: 16px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
        @media (max-width: 768px) {
            .footer-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .footer {
                padding: 24px;
            }
            .footer-bottom {
                flex-direction: column;
                gap: 12px;
                text-align: center;
            }
        }
        .pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border: 1px solid #e9ecef;
        }
        .btn {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0 5px 5px 0;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        }
        .error-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 2000;
            display: none;
        }
        @media print {
            .controls { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .container { box-shadow: none !important; }
        }
        @media (max-width: 768px) {
            .details-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 2rem;
            }
            .risk-score {
                font-size: 3.5rem;
            }
        }
        /* Ensure colors print correctly */
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        /* Unknown risk level styles */
        .category-card.unknown {
            border-top-color: #6b7280;
        }
        .category-score.unknown {
            background: #f3f4f6;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="error-message" id="errorMessage">
        <h3>PDF Generation Error</h3>
        <p id="errorText"></p>
        <button class="btn" onclick="hideError()">Close</button>
    </div>

    <div class="controls">
        <button class="btn" onclick="generatePDF()" id="pdfBtn">📄 Generate PDF</button>
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Print</button>
    </div>

    <div class="report-container" id="reportContent">
        <!-- Header -->
        <div class="header">
            <div class="header-grid">
                <div class="header-main">
                    <h1 class="report-title">AI SECURITY RISK ASSESSMENT</h1>
                    <p class="report-subtitle">Enterprise Security Analysis & Compliance Report</p>
                </div>
                <div class="header-side">
                    <div class="tool-highlight">
                        <div class="tool-name">${normalizedData.toolName}</div>
                        <div class="tool-subtitle">Risk Assessment Report</div>
                    </div>
                </div>
            </div>
            <div class="report-meta">
                <div>
                    <strong>Assessment ID:</strong> ASS-${Date.now().toString().slice(-6)}
                </div>
                <div>
                    <strong>Generated:</strong> ${new Date().toLocaleDateString()}
                </div>
                <div>
                    <strong>Framework:</strong> v2.1
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <div class="summary-header">
                <h2 class="section-title">📊 Executive Summary</h2>
            </div>
            
            <div class="summary-grid">
                <div class="risk-score-display">
                    <div class="risk-score-number">${normalizedData.finalScore}</div>
                    <div class="risk-score-total">/100</div>
                    <div class="risk-level-badge">${normalizedData.riskLevel} RISK</div>
                    <div class="risk-description">
                        ${normalizedData.riskLevel === 'LOW' ? 'Low security risk with recommended monitoring practices.' :
                          normalizedData.riskLevel === 'MODERATE' ? 'Moderate security risk requiring attention and mitigation.' :
                          normalizedData.riskLevel === 'HIGH' ? 'High security risk requiring immediate action and controls.' :
                          'Critical security risk requiring urgent intervention and comprehensive controls.'}
                    </div>
                </div>
                
                <div class="summary-insights">
                    <div class="insight-card">
                        <div class="insight-title">Security Status</div>
                        <div class="insight-text">
                            ${normalizedData.riskLevel === 'LOW' ? 'The tool demonstrates good security practices with minimal enterprise risks.' :
                              normalizedData.riskLevel === 'MODERATE' ? 'The tool has acceptable security with some areas requiring attention.' :
                              'The tool requires significant security improvements before enterprise deployment.'}
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-title">Compliance Impact</div>
                        <div class="insight-text">
                            ${normalizedData.dataClassification === 'PHI' ? 'PHI data processing requires HIPAA compliance measures and enhanced security controls.' :
                              normalizedData.dataClassification === 'PCI' ? 'PCI data handling requires PCI DSS compliance and payment security protocols.' :
                              normalizedData.dataClassification === 'PII' ? 'PII processing requires privacy controls and data protection measures.' :
                              'Public data processing has minimal compliance requirements but should follow security best practices.'}
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-title">Recommendation</div>
                        <div class="insight-text">
                            ${normalizedData.riskLevel === 'LOW' ? 'Approved for enterprise use with standard monitoring and periodic reviews.' :
                              normalizedData.riskLevel === 'MODERATE' ? 'Conditional approval pending implementation of recommended security controls.' :
                              'Not recommended for enterprise use without significant security improvements and additional controls.'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="key-findings">
                <div class="findings-title">
                    ⚠️ Key Security Findings
                </div>
                <div class="findings-list">
                    ${extractCriticalFindings(dbData, normalizedData.finalScore).map(finding => `• ${finding}`).join('<br>')}
                </div>
            </div>
        </div>

        <!-- Tool Information -->
        <div class="tool-info-section">
            <div class="tool-card">
                <div class="tool-header">
                    <div class="tool-icon">
                        ${normalizedData.toolName.substring(0, 2).toUpperCase()}
                    </div>
                    <div class="tool-details">
                        <div class="tool-name">${normalizedData.toolName}</div>
                        <div class="tool-category">${normalizedData.toolCategory.replace('-', ' ').toUpperCase()}</div>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Tool Category</span>
                        <span class="info-value">${normalizedData.toolCategory.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data Classification</span>
                        <span class="info-value">${normalizedData.dataClassification}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Use Case</span>
                        <span class="info-value">${normalizedData.useCase}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Base Score</span>
                        <span class="info-value">${normalizedData.baseScore}/100</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Final Score</span>
                        <span class="info-value">${normalizedData.finalScore}/100</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Risk Level</span>
                        <span class="info-value">${normalizedData.riskLevel}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Security Risk Analysis -->
        <div class="risk-breakdown">
            <h2 class="section-title">🔍 Security Risk Analysis</h2>
            
            <div class="categories-grid">
                <div class="category-card ${getRiskLevelClass(normalizedData.data_storage_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Data Storage & Security</div>
                        <div class="category-score ${getRiskLevelClass(normalizedData.data_storage_risk_level || 'unknown')}">${(normalizedData.data_storage_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(normalizedData.data_storage_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(normalizedData.training_usage_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Training Data Usage</div>
                        <div class="category-score ${getRiskLevelClass(normalizedData.training_usage_risk_level || 'unknown')}">${(normalizedData.training_usage_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(normalizedData.training_usage_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(normalizedData.access_controls_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Access Controls</div>
                        <div class="category-score ${getRiskLevelClass(normalizedData.access_controls_risk_level || 'unknown')}">${(normalizedData.access_controls_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(normalizedData.access_controls_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(normalizedData.compliance_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Compliance Risk</div>
                        <div class="category-score ${getRiskLevelClass(normalizedData.compliance_risk_level || 'unknown')}">${(normalizedData.compliance_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(normalizedData.compliance_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(normalizedData.vendor_transparency_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Vendor Transparency</div>
                        <div class="category-score ${getRiskLevelClass(normalizedData.vendor_transparency_risk_level || 'unknown')}">${(normalizedData.vendor_transparency_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(normalizedData.vendor_transparency_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations-section">
            <h2 class="section-title">🎯 Action Items & Recommendations</h2>
            
            <div class="recommendations-grid">
                ${generateRecommendationsHTML(normalizedData)}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-grid">
                <!-- Assessment Details -->
                <div class="footer-section">
                    <div class="section-header">
                        <div class="icon">📊</div>
                        <h3 class="section-title">Assessment Details</h3>
                    </div>
                    <div class="section-content">
                        <div class="meta-info">
                            <div class="meta-item">
                                <span class="meta-label">Generated</span>
                                <span class="meta-value">${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Framework</span>
                                <span class="meta-value">Enterprise AI Risk v2.1</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Report Type</span>
                                <span class="meta-value">Premium Analysis</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Analysis Scope</span>
                                <span class="meta-value">Commercial & Personal Use</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Important Disclaimers -->
                <div class="footer-section">
                    <div class="section-header">
                        <div class="icon">⚠️</div>
                        <h3 class="section-title">Important Disclaimers</h3>
                    </div>
                    <div class="section-content">
                        <ul class="disclaimer-list">
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>Assessment based on publicly available information and should not be considered exhaustive</span>
                            </li>
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>Consult official security documentation and policies for comprehensive details</span>
                            </li>
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>This analysis does not constitute professional security advice</span>
                            </li>
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>Should be supplemented with vendor-specific security reviews</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Legal Notice -->
                <div class="footer-section">
                    <div class="section-header">
                        <div class="icon">🔒</div>
                        <h3 class="section-title">Legal Notice</h3>
                    </div>
                    <div class="section-content">
                        <p style="margin-bottom: 16px;">This assessment is confidential and proprietary. Distribution is restricted to authorized personnel only.</p>
                        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">© 2024 Enterprise Security Framework</p>
                        
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                            <p style="font-size: 12px; color: #e2e8f0; margin: 0;">
                                <strong>AI-Powered Analysis:</strong> This report utilizes advanced AI algorithms to assess security risks and compliance factors across multiple frameworks.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div>
                    <span>Powered by Enterprise AI Security Framework • Last Updated: June 2025</span>
                </div>
                <div class="ai-badge">
                    <div class="ai-badge-icon pulse">🤖</div>
                    <span>AI-Enhanced Security Assessment</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Check if required libraries are loaded
        function checkLibraries() {
            const jspdfAvailable = (typeof window.jspdf !== 'undefined') || (typeof window.jsPDF !== 'undefined');
            const html2canvasAvailable = typeof html2canvas !== 'undefined';
            
            console.log('Library check:', {
                jspdf: typeof window.jspdf,
                jsPDF: typeof window.jsPDF,
                html2canvas: typeof html2canvas,
                jspdfHasConstructor: !!(window.jspdf && (window.jspdf.jsPDF || typeof window.jspdf === 'function')),
                windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('jspdf') || k.toLowerCase().includes('pdf'))
            });
            
            if (!jspdfAvailable || !html2canvasAvailable) {
                showError('Required PDF libraries failed to load. Please refresh the page and try again.');
                return false;
            }
            return true;
        }
        async function generatePDF() {
            if (!checkLibraries()) return;
            
            const button = document.getElementById('pdfBtn');
            const originalText = button.innerHTML;
            
            try {
                button.innerHTML = '⏳ Generating PDF...';
                button.disabled = true;
                
                // Hide controls for PDF
                const controls = document.querySelector('.controls');
                const originalDisplay = controls.style.display;
                controls.style.display = 'none';
                
                const element = document.getElementById('reportContent');
                
                // Wait for libraries and resources to load properly
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Double-check libraries are available
                if (!checkLibraries()) return;
                
                // Generate high-quality canvas with better error handling
                const canvas = await html2canvas(element, {
                    scale: 2, // Reduced scale for better performance
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: element.scrollWidth,
                    height: element.scrollHeight,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    onclone: (clonedDoc) => {
                        // Ensure all styles are preserved in cloned document
                        const clonedElement = clonedDoc.getElementById('reportContent');
                        if (clonedElement) {
                            clonedElement.style.transform = 'scale(1)';
                            clonedElement.style.transformOrigin = 'top left';
                        }
                    }
                }).catch(error => {
                    console.error('html2canvas error:', error);
                    throw new Error('Failed to capture content. Please try refreshing the page.');
                });
                
                // Create PDF with optimal settings
                let jsPDFLib;
                if (window.jsPDF) {
                    jsPDFLib = window.jsPDF;
                } else if (window.jspdf && window.jspdf.jsPDF) {
                    jsPDFLib = window.jspdf.jsPDF;
                } else if (window.jspdf) {
                    jsPDFLib = window.jspdf;
                } else {
                    throw new Error('jsPDF library not found');
                }
                
                console.log('📄 Using jsPDF constructor:', typeof jsPDFLib);
                const pdf = new jsPDFLib({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });
                
                const imgData = canvas.toDataURL('image/png', 1.0); // PNG for better quality
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Calculate optimal dimensions
                const margin = 10;
                const imgWidth = pdfWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                let heightLeft = imgHeight;
                let position = margin;
                
                // Add first page
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= (pdfHeight - margin * 2);
                
                // Add additional pages if content is long
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight + margin;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
                    heightLeft -= (pdfHeight - margin * 2);
                }
                
                // Save with timestamp and sanitized filename
                const timestamp = new Date().toISOString().slice(0, 10);
                const sanitizedToolName = 'assessment'.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = sanitizedToolName + '-report-' + timestamp + '.pdf';
                
                pdf.save(filename);
                
                // Show success message
                showNotification('PDF generated successfully!', 'success');
                
                // Restore controls
                controls.style.display = originalDisplay;
                
            } catch (error) {
                console.error('PDF generation failed:', error);
                showError('PDF generation failed: ' + error.message + '. Please try the print option instead.');
                
                // Restore controls
                document.querySelector('.controls').style.display = 'block';
            } finally {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            errorText.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        function hideError() {
            document.getElementById('errorMessage').style.display = 'none';
        }
        
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 2000;
                animation: slideIn 0.3s ease;
                background: \${type === 'success' ? '#28a745' : '#dc3545'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            \`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { translateX(100%); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Check if we're in an environment that supports PDF generation
            if (!checkLibraries()) {
                console.warn('PDF libraries not available');
            }
        });
    </script>
</body>
</html>`;
}

export function generatePremiumHTML(data: any) {
  console.log('🔍 [HTML] Received data structure:', Object.keys(data));
  console.log('🔍 [HTML] Tool name received:', data.toolName);
  
  const dbData = data.databaseContent as any;
  
  // Apply multipliers to get final component scores
  const adjustedScores = applyMultipliersToComponents(dbData, data);
  
  // Map component scores to risk levels and create mapped data object with database content
  const mappedData = {
    ...data,
    dbData: dbData,
    data_storage_risk_level: getComponentRiskLevel(adjustedScores.dataStorage),
    data_storage_details: extractFormattedDetails('dataStorage', dbData),
    training_usage_risk_level: getComponentRiskLevel(adjustedScores.trainingUsage),
    training_usage_details: extractFormattedDetails('trainingUsage', dbData),
    access_controls_risk_level: getComponentRiskLevel(adjustedScores.accessControls),
    access_controls_details: extractFormattedDetails('accessControls', dbData),
    compliance_risk_level: getComponentRiskLevel(adjustedScores.complianceRisk),
    compliance_details: extractFormattedDetails('complianceRisk', dbData),
    vendor_transparency_risk_level: getComponentRiskLevel(adjustedScores.vendorTransparency),
    vendor_transparency_details: extractFormattedDetails('vendorTransparency', dbData)
  };
  
  console.log('🎯 [HTML] Using database content:', {
    toolName: mappedData.toolName,
    hasDbData: !!dbData,
    dataStorageLength: mappedData.data_storage_details?.length || 0
  });
  
  const riskColor = mappedData.riskLevel === 'LOW' ? '#10b981' : 
                   mappedData.riskLevel === 'MODERATE' ? '#f59e0b' : 
                   mappedData.riskLevel === 'HIGH' ? '#ef4444' : '#dc2626';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise AI Risk Assessment - ${data.toolName}</title>
    <style>
        /* === DYNAMIC VARIABLES === */
        :root {
            --risk-color: ${riskColor};
        }

        /* === BASE STYLES === */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f8fafc;
        }
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        /* === HEADER === */
        .header {
            background-color: #1a2a45; /* Dark blue-slate base */
            background-image: 
                radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
                linear-gradient(135deg, #1a2a45 0%, #1e3a8a 100%); /* Subtle gradient */
            color: white;
            padding: 3rem 2.5rem;
            position: relative;
            border-bottom: 4px solid #3b82f6; /* Accent border */
        }
        .header-grid { /* New container for a flex layout */
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .header-main { /* Left side */
            flex: 2;
        }
        .report-title {
            font-size: 2.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
            color: #f0f9ff; /* Slightly off-white */
        }
        .report-subtitle {
            font-size: 1.1rem;
            opacity: 0.8;
            font-weight: 300;
            max-width: 400px; /* Constrain line length */
        }
        .header-side { /* Right side */
            flex: 1;
            display: flex;
            justify-content: flex-end;
        }
        .tool-highlight {
            background: rgba(0, 0, 0, 0.15); /* Darker, subtle background */
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            border-radius: 12px;
            text-align: right;
            width: 100%;
            max-width: 350px;
        }
        .tool-highlight .tool-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }
        .tool-highlight .tool-subtitle {
            font-size: 0.9rem;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .report-meta {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            font-size: 0.85rem;
            color: #cbd5e1; /* Lighter grey for meta text */
        }
        .report-meta strong {
            font-weight: 600;
            color: #e2e8f0; /* Slightly brighter for labels */
        }
        /* === EXECUTIVE SUMMARY === */
        .executive-summary {
            padding: 2rem;
            background: white;
            border-bottom: 1px solid #e2e8f0;
        }
        .summary-header {
            margin-bottom: 2rem;
        }
        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            opacity: 1;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 3rem;
            margin-bottom: 2rem;
            align-items: center;
        }
        /* Risk Score Card */
        .risk-score-display {
            background: linear-gradient(135deg, var(--risk-color) 0%, var(--risk-color-light) 100%);
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            color: white;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            min-width: 250px;
        }
        .risk-score-number {
            font-size: 4rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        .risk-score-total {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        .risk-level-badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 700;
            font-size: 1rem;
            display: inline-block;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            backdrop-filter: blur(10px);
        }
        .risk-description {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            line-height: 1.5;
        }
        .summary-insights {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .insight-card {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .insight-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .insight-text {
            color: #64748b;
            font-size: 0.95rem;
        }
        .key-findings {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 1.5rem;
        }
        .findings-title {
            color: #92400e;
            font-weight: 700;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .findings-list {
            color: #92400e;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        /* === TOOL INFORMATION === */
        .tool-info-section {
            padding: 2rem;
            background: #f8fafc;
        }
        .tool-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .tool-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .tool-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
        }
        .tool-details {
            flex: 1;
        }
        .tool-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.25rem;
        }
        .tool-category {
            color: #64748b;
            font-size: 0.9rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #e2e8f0;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 0.9rem;
        }
        .info-value {
            font-weight: 500;
            color: #1f2937;
        }
        .info-value.critical {
            color: #dc2626;
            font-weight: 700;
        }
        /* === SECURITY RISK ANALYSIS === */
        .risk-breakdown {
            padding: 2rem;
            background: #f8fafc;
        }
        .categories-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .category-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-top: 4px solid;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .category-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .category-card.low {
            border-top-color: #10b981;
        }
        .category-card.medium {
            border-top-color: #f59e0b;
        }
        .category-card.high {
            border-top-color: #ef4444;
        }
        .category-card.critical {
            border-top-color: #dc2626;
        }
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .category-name {
            font-weight: 600;
            color: #1e293b;
            flex: 1;
        }
        .category-score {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
            margin-left: 1rem;
        }
        .category-score.low {
            background: #dcfce7;
            color: #166534;
        }
        .category-score.medium {
            background: #fef3c7;
            color: #92400e;
        }
        .category-score.high {
            background: #fecaca;
            color: #991b1b;
        }
        .category-score.critical {
            background: #dc2626;
            color: white;
        }
        .category-description {
            color: #64748b;
            font-size: 0.9rem;
            line-height: 1.6;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #f1f5f9;
        }
        .category-description strong {
            color: #374151;
        }
        .category-description p {
            margin-bottom: 0.75rem;
        }
        .category-description p:last-child {
            margin-bottom: 0;
        }
        /* === RECOMMENDATIONS === */
        .recommendations-section {
            padding: 2rem;
            background: linear-gradient(to right, #f0fdf4, white);
        }
        .recommendations-grid {
            display: grid;
            gap: 1rem;
        }
        .recommendation-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
            transition: transform 0.2s ease;
        }
        .recommendation-card:hover {
            transform: translateX(4px);
        }
        .recommendation-card.priority-high {
            border-left-color: #dc2626;
            background: linear-gradient(to right, #fef2f2, white);
        }
        .recommendation-card.priority-medium {
            border-left-color: #f59e0b;
            background: linear-gradient(to right, #fef9e7, white);
        }
        .recommendation-card.priority-low {
            border-left-color: #16a34a;
            background: linear-gradient(to right, #f0fdf4, white);
        }
        .recommendation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .recommendation-title {
            font-weight: 700;
            color: #1e293b;
        }
        .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .priority-badge.priority-high {
            background: #dc2626;
            color: white;
        }
        .priority-badge.priority-medium {
            background: #f59e0b;
            color: white;
        }
        .priority-badge.priority-low {
            background: #16a34a;
            color: white;
        }
        .recommendation-text {
            color: #64748b;
            line-height: 1.6;
        }
        /* === FOOTER === */
        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            padding: 40px;
            color: white;
            position: relative;
            overflow: hidden;
        }
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 40px;
            position: relative;
            z-index: 1;
        }
        .footer-section {
            display: flex;
            flex-direction: column;
        }
        .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        .footer .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #f1f5f9;
        }
        .section-content {
            line-height: 1.6;
            color: #cbd5e1;
            font-size: 14px;
        }
        .meta-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }
        .meta-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .meta-label {
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
        }
        .meta-value {
            font-size: 13px;
            color: #e2e8f0;
            font-weight: 600;
        }
        .disclaimer-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .disclaimer-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 13px;
            line-height: 1.5;
        }
        .disclaimer-icon {
            width: 16px;
            height: 16px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
            flex-shrink: 0;
        }
        .footer-bottom {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(148, 163, 184, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #94a3b8;
        }
        .ai-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(59, 130, 246, 0.1);
            padding: 6px 12px;
            border-radius: 20px;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .ai-badge-icon {
            width: 16px;
            height: 16px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
        @media (max-width: 768px) {
            .footer-grid {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            .footer {
                padding: 24px;
            }
            .footer-bottom {
                flex-direction: column;
                gap: 12px;
                text-align: center;
            }
        }
        .pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border: 1px solid #e9ecef;
        }
        .btn {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0 5px 5px 0;
            transition: all 0.3s ease;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        }
        .error-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 2000;
            display: none;
        }
        @media print {
            .controls { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .container { box-shadow: none !important; }
        }
        @media (max-width: 768px) {
            .details-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 2rem;
            }
            .risk-score {
                font-size: 3.5rem;
            }
        }
        /* Ensure colors print correctly */
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        /* Unknown risk level styles */
        .category-card.unknown {
            border-top-color: #6b7280;
        }
        .category-score.unknown {
            background: #f3f4f6;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="header">
            <div class="header-grid">
                <div class="header-main">
                    <h1 class="report-title">AI SECURITY RISK ASSESSMENT</h1>
                    <p class="report-subtitle">Enterprise Security Analysis & Compliance Report</p>
                </div>
                <div class="header-side">
                    <div class="tool-highlight">
                        <div class="tool-name">${mappedData.toolName}</div>
                        <div class="tool-subtitle">Risk Assessment Report</div>
                    </div>
                </div>
            </div>
            <div class="report-meta">
                <div>
                    <strong>Assessment ID:</strong> ASS-${Date.now().toString().slice(-6)}
                </div>
                <div>
                    <strong>Generated:</strong> ${new Date().toLocaleDateString()}
                </div>
                <div>
                    <strong>Framework:</strong> v2.1
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <div class="summary-header">
                <h2 class="section-title">📊 Executive Summary</h2>
            </div>
            
            <div class="summary-grid">
                <div class="risk-score-display">
                    <div class="risk-score-number">${mappedData.finalScore}</div>
                    <div class="risk-score-total">/100</div>
                    <div class="risk-level-badge">${mappedData.riskLevel} RISK</div>
                    <div class="risk-description">
                        ${mappedData.riskLevel === 'LOW' ? 'Low security risk with recommended monitoring practices.' :
                          mappedData.riskLevel === 'MODERATE' ? 'Moderate security risk requiring attention and mitigation.' :
                          mappedData.riskLevel === 'HIGH' ? 'High security risk requiring immediate action and controls.' :
                          'Critical security risk requiring urgent intervention and comprehensive controls.'}
                    </div>
                </div>
                
                <div class="summary-insights">
                    <div class="insight-card">
                        <div class="insight-title">Security Status</div>
                        <div class="insight-text">
                            ${mappedData.riskLevel === 'LOW' ? 'The tool demonstrates good security practices with minimal enterprise risks.' :
                              mappedData.riskLevel === 'MODERATE' ? 'The tool has acceptable security with some areas requiring attention.' :
                              'The tool requires significant security improvements before enterprise deployment.'}
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-title">Compliance Impact</div>
                        <div class="insight-text">
                            ${mappedData.dataClassification === 'PHI' ? 'PHI data processing requires HIPAA compliance measures and enhanced security controls.' :
                              mappedData.dataClassification === 'PCI' ? 'PCI data handling requires PCI DSS compliance and payment security protocols.' :
                              mappedData.dataClassification === 'PII' ? 'PII processing requires privacy controls and data protection measures.' :
                              'Public data processing has minimal compliance requirements but should follow security best practices.'}
                        </div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-title">Recommendation</div>
                        <div class="insight-text">
                            ${mappedData.riskLevel === 'LOW' ? 'Approved for enterprise use with standard monitoring and periodic reviews.' :
                              mappedData.riskLevel === 'MODERATE' ? 'Conditional approval pending implementation of recommended security controls.' :
                              'Not recommended for enterprise use without significant security improvements and additional controls.'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="key-findings">
                <div class="findings-title">
                    ⚠️ Key Security Findings
                </div>
                <div class="findings-list">
                    ${extractCriticalFindings(dbData, mappedData.finalScore).map(finding => `• ${finding}`).join('<br>')}
                </div>
            </div>
        </div>

        <!-- Tool Information -->
        <div class="tool-info-section">
            <div class="tool-card">
                <div class="tool-header">
                    <div class="tool-icon">
                        ${mappedData.toolName.substring(0, 2).toUpperCase()}
                    </div>
                    <div class="tool-details">
                        <div class="tool-name">${mappedData.toolName}</div>
                        <div class="tool-category">${mappedData.toolCategory.replace('-', ' ').toUpperCase()}</div>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Tool Category</span>
                        <span class="info-value">${mappedData.toolCategory.replace('-', ' ').toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data Classification</span>
                        <span class="info-value">${mappedData.dataClassification}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Use Case</span>
                        <span class="info-value">${mappedData.useCase}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Base Score</span>
                        <span class="info-value">${mappedData.baseScore}/100</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Final Score</span>
                        <span class="info-value">${mappedData.finalScore}/100</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Risk Level</span>
                        <span class="info-value">${mappedData.riskLevel}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Security Risk Analysis -->
        <div class="risk-breakdown">
            <h2 class="section-title">🔍 Security Risk Analysis</h2>
            
            <div class="categories-grid">
                <div class="category-card ${getRiskLevelClass(mappedData.data_storage_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Data Storage & Security</div>
                        <div class="category-score ${getRiskLevelClass(mappedData.data_storage_risk_level || 'unknown')}">${(mappedData.data_storage_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(mappedData.data_storage_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(mappedData.training_usage_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Training Data Usage</div>
                        <div class="category-score ${getRiskLevelClass(mappedData.training_usage_risk_level || 'unknown')}">${(mappedData.training_usage_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(mappedData.training_usage_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(mappedData.access_controls_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Access Controls</div>
                        <div class="category-score ${getRiskLevelClass(mappedData.access_controls_risk_level || 'unknown')}">${(mappedData.access_controls_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(mappedData.access_controls_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(mappedData.compliance_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Compliance Risk</div>
                        <div class="category-score ${getRiskLevelClass(mappedData.compliance_risk_level || 'unknown')}">${(mappedData.compliance_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(mappedData.compliance_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>

                <div class="category-card ${getRiskLevelClass(mappedData.vendor_transparency_risk_level || 'unknown')}">
                    <div class="category-header">
                        <div class="category-name">Vendor Transparency</div>
                        <div class="category-score ${getRiskLevelClass(mappedData.vendor_transparency_risk_level || 'unknown')}">${(mappedData.vendor_transparency_risk_level || 'UNKNOWN').toUpperCase()}</div>
                    </div>
                    <div class="category-description">
                        ${formatDatabaseDetails(mappedData.vendor_transparency_details) || '<p>Assessment data not available for this category.</p>'}
                    </div>
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations-section">
            <h2 class="section-title">🎯 Action Items & Recommendations</h2>
            
            <div class="recommendations-grid">
                ${generateRecommendationsHTML(mappedData)}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-grid">
                <!-- Assessment Details -->
                <div class="footer-section">
                    <div class="section-header">
                        <div class="icon">📊</div>
                        <h3 class="section-title">Assessment Details</h3>
                    </div>
                    <div class="section-content">
                        <div class="meta-info">
                            <div class="meta-item">
                                <span class="meta-label">Generated</span>
                                <span class="meta-value">${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Framework</span>
                                <span class="meta-value">Enterprise AI Risk v2.1</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Report Type</span>
                                <span class="meta-value">Premium Analysis</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Analysis Scope</span>
                                <span class="meta-value">Commercial & Personal Use</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Important Disclaimers -->
                <div class="footer-section">
                    <div class="section-header">
                        <div class="icon">⚠️</div>
                        <h3 class="section-title">Important Disclaimers</h3>
                    </div>
                    <div class="section-content">
                        <ul class="disclaimer-list">
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>Assessment based on publicly available information and should not be considered exhaustive</span>
                            </li>
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>Consult official security documentation and policies for comprehensive details</span>
                            </li>
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>This analysis does not constitute professional security advice</span>
                            </li>
                            <li class="disclaimer-item">
                                <div class="disclaimer-icon">•</div>
                                <span>Should be supplemented with vendor-specific security reviews</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Legal Notice -->
                <div class="footer-section">
                    <div class="section-header">
                        <div class="icon">🔒</div>
                        <h3 class="section-title">Legal Notice</h3>
                    </div>
                    <div class="section-content">
                        <p style="margin-bottom: 16px;">This assessment is confidential and proprietary. Distribution is restricted to authorized personnel only.</p>
                        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">© 2024 Enterprise Security Framework</p>
                        
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                            <p style="font-size: 12px; color: #e2e8f0; margin: 0;">
                                <strong>AI-Powered Analysis:</strong> This report utilizes advanced AI algorithms to assess security risks and compliance factors across multiple frameworks.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div>
                    <span>Powered by Enterprise AI Security Framework • Last Updated: June 2025</span>
                </div>
                <div class="ai-badge">
                    <div class="ai-badge-icon pulse">🤖</div>
                    <span>AI-Enhanced Security Assessment</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
} 