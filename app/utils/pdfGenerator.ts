import * as FileSystem from 'expo-file-system';
import { Assessment } from '../types/pdf';
import { getRiskLevel } from '../types/risk';

export async function generatePDFContent(assessment: Assessment): Promise<string> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 16px;
            line-height: 1.4;
            color: #000;
            margin: 0;
            font-size: 12px;
          }
          .header {
            border-bottom: 1px solid #000;
            margin-bottom: 16px;
            padding-bottom: 8px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .meta {
            display: flex;
            gap: 16px;
            font-size: 12px;
          }
          .hazard {
            border: 1px solid #ddd;
            padding: 12px;
            margin-bottom: 12px;
          }
          .hazard-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #eee;
          }
          .section {
            margin-bottom: 8px;
          }
          .section-heading {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 4px;
          }
          .risk-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
          }
          .risk-box {
            background: #f5f5f5;
            padding: 6px;
            font-size: 11px;
          }
          .controls div {
            margin: 2px 0;
          }
          .implementation {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11px;
          }
          .high-alert {
            color: #d32f2f;
            font-weight: bold;
            margin-top: 8px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${assessment.name}</div>
          <div class="meta">
            <div><strong>Activity:</strong> ${assessment.activity.replace('Hazards Assessment', '').trim()}</div>
            <div><strong>Date:</strong> ${new Date(assessment.date).toLocaleDateString()}</div>
          </div>
        </div>

        ${assessment.hazards.map((hazard, index) => {
          const initialRiskLevel = getRiskLevel(hazard.riskScore);
          const finalRiskLevel = getRiskLevel(hazard.finalRiskScore);
          
          return `
            <div class="hazard">
              <div class="hazard-name">${index + 1}. ${hazard.description}</div>
              
              <div class="section">
                <div class="section-heading">Risk Assessment</div>
                <div class="risk-grid">
                  <div class="risk-box">
                    <strong>Initial:</strong> ${hazard.riskScore} (${initialRiskLevel.description})
                    L:${hazard.likelihood}, S:${hazard.severity}
                  </div>
                  <div class="risk-box">
                    <strong>Final:</strong> ${hazard.finalRiskScore} (${finalRiskLevel.description})
                    L:${hazard.finalLikelihood}, S:${hazard.finalSeverity}
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-heading">Controls</div>
                <div class="controls">
                  ${hazard.additionalControls.ac.length > 0 ? `
                    <div><strong>Admin:</strong> ${hazard.additionalControls.ac.join(', ')}</div>
                  ` : ''}
                  ${hazard.additionalControls.ec.length > 0 ? `
                    <div><strong>Eng:</strong> ${hazard.additionalControls.ec.join(', ')}</div>
                  ` : ''}
                  ${hazard.additionalControls.ppe.length > 0 ? `
                    <div><strong>PPE:</strong> ${hazard.additionalControls.ppe.join(', ')}</div>
                  ` : ''}
                </div>
              </div>

              <div class="section">
                <div class="implementation">
                  <div><strong>Owner:</strong> ${hazard.pointPerson}</div>
                  <div><strong>Due:</strong> ${hazard.dueDate}</div>
                </div>
              </div>

              ${hazard.finalRiskScore > 12 ? `
                <div class="high-alert">⚠️ High Risk - Immediate action required</div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </body>
    </html>
  `;

  try {
    const directory = `${FileSystem.documentDirectory}ExponentExperienceData/@clarlyte/RiskWise/`;
    const fileName = `${assessment.name}_assessment.html`;
    const filePath = `${directory}${fileName}`;

    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }

    await FileSystem.writeAsStringAsync(filePath, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log('HTML saved at:', filePath);
    return filePath;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
} 