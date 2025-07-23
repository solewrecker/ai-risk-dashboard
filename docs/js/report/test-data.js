/**
 * test-data.js
 * 
 * This file contains sample data for testing the report system.
 * It provides a realistic assessment data structure that can be used
 * to render reports without needing to connect to Supabase.
 */

const testReportData = {
  primaryAssessment: {
    id: 'test-assessment-1',
    name: 'ChatGPT Enterprise',
    vendor: 'OpenAI',
    description: 'Enterprise version of ChatGPT with enhanced security and privacy features',
    version: '4.0',
    assessment_date: '2023-11-15',
    assessor_name: 'John Smith',
    total_score: 78,
    risk_level: 'Medium',
    summary: 'ChatGPT Enterprise demonstrates good security practices but has some areas for improvement in data governance and transparency.',
    sections_to_generate: ['summary', 'risk_assessment', 'recommendations', 'detailed_analysis'],
    selected_template: 'standard',
    selected_theme: 'theme-corporate',
    categories: [
      {
        name: 'Data Security',
        score: 82,
        max_score: 100,
        risk_level: 'Low',
        criteria: [
          {
            name: 'Encryption',
            score: 9,
            max_score: 10,
            risk_level: 'Low',
            description: 'Uses industry-standard encryption for data in transit and at rest.'
          },
          {
            name: 'Access Controls',
            score: 8,
            max_score: 10,
            risk_level: 'Low',
            description: 'Implements role-based access controls with multi-factor authentication.'
          },
          {
            name: 'Data Retention',
            score: 7,
            max_score: 10,
            risk_level: 'Medium',
            description: 'Has clear data retention policies but limited user control over data deletion.'
          }
        ]
      },
      {
        name: 'Privacy',
        score: 75,
        max_score: 100,
        risk_level: 'Medium',
        criteria: [
          {
            name: 'Data Collection',
            score: 7,
            max_score: 10,
            risk_level: 'Medium',
            description: 'Collects necessary data but could improve transparency about usage.'
          },
          {
            name: 'User Consent',
            score: 8,
            max_score: 10,
            risk_level: 'Low',
            description: 'Clear consent mechanisms for data collection and processing.'
          },
          {
            name: 'Data Sharing',
            score: 6,
            max_score: 10,
            risk_level: 'Medium',
            description: 'Some third-party data sharing with limited user controls.'
          }
        ]
      },
      {
        name: 'Transparency',
        score: 68,
        max_score: 100,
        risk_level: 'Medium',
        criteria: [
          {
            name: 'Model Documentation',
            score: 7,
            max_score: 10,
            risk_level: 'Medium',
            description: 'Good documentation but lacks details on model limitations.'
          },
          {
            name: 'Explainability',
            score: 6,
            max_score: 10,
            risk_level: 'Medium',
            description: 'Limited explainability features for AI decision-making processes.'
          },
          {
            name: 'Audit Trails',
            score: 8,
            max_score: 10,
            risk_level: 'Low',
            description: 'Comprehensive audit logging for system activities.'
          }
        ]
      }
    ],
    recommendations: [
      {
        title: 'Enhance Data Governance Controls',
        description: 'Implement more granular user controls for data retention and deletion.',
        priority: 'High',
        steps: [
          'Develop user-facing dashboard for data management',
          'Add options for automatic data deletion after specified periods',
          'Implement data export functionality in standard formats'
        ]
      },
      {
        title: 'Improve Model Transparency',
        description: 'Provide more detailed documentation about model limitations and potential biases.',
        priority: 'Medium',
        steps: [
          'Create comprehensive model cards with performance characteristics',
          'Document known limitations and edge cases',
          'Publish regular bias assessment reports'
        ]
      },
      {
        title: 'Enhance Third-party Data Sharing Controls',
        description: 'Implement more transparent controls for how data is shared with third parties.',
        priority: 'Medium',
        steps: [
          'Create detailed data sharing agreements',
          'Implement opt-out mechanisms for specific data uses',
          'Provide transparency reports on third-party data access'
        ]
      }
    ],
    detailed_analysis: [
      {
        title: 'Security Testing Results',
        description: 'Results from penetration testing and security assessments.',
        data: {
          type: 'table',
          headers: ['Test Type', 'Date', 'Result', 'Severity', 'Status'],
          rows: [
            ['Penetration Test', '2023-10-01', 'Minor Findings', 'Low', 'Resolved'],
            ['Vulnerability Scan', '2023-10-15', 'No Critical Issues', 'Low', 'Closed'],
            ['Code Review', '2023-09-28', 'Some Technical Debt', 'Medium', 'In Progress']
          ]
        }
      },
      {
        title: 'Privacy Impact Assessment',
        description: 'Analysis of potential privacy risks and mitigations.',
        data: {
          type: 'list',
          items: [
            'Data minimization principles are generally followed',
            'User data is anonymized where possible',
            'Some improvements needed in cross-border data transfer protocols',
            'Privacy by design principles evident in most features'
          ]
        }
      }
    ],
    key_findings: [
      'Strong encryption and access controls',
      'Good consent mechanisms',
      'Limited user control over data retention',
      'Needs improvement in model transparency'
    ],
    executive_summary: 'ChatGPT Enterprise demonstrates strong security practices with industry-standard encryption and robust access controls. Privacy measures are generally good, with clear consent mechanisms, though there is room for improvement in user controls for data retention and third-party sharing. The main areas for enhancement are in transparency around model limitations and data governance controls.'
  },
  selectedData: [
    // This would contain the same assessment data as primaryAssessment
    // In a real scenario, this might include multiple assessments for comparison
  ],
  sectionsToGenerate: ['summary', 'risk_assessment', 'recommendations', 'detailed_analysis'],
  selectedTemplate: 'standard',
  selectedTheme: 'theme-corporate'
};

// Clone the primary assessment into selectedData for this test
testReportData.selectedData = [testReportData.primaryAssessment];

export default testReportData;