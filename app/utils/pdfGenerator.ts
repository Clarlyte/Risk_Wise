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
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .hazard { 
            background-color: #f5f5f5; 
            padding: 15px; 
            margin-bottom: 15px;
            border-radius: 8px;
          }
          .risk-score {
            font-weight: bold;
            padding: 5px;
            border-radius: 4px;
            display: inline-block;
            margin: 10px 0;
          }
          .controls-section {
            margin: 15px 0;
            padding: 10px;
            background-color: #fff;
            border-radius: 4px;
          }
          .control-type {
            margin: 10px 0;
            padding-left: 10px;
          }
          .recommendations {
            margin-top: 15px;
            padding: 10px;
            background-color: #e3f2fd;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${assessment.name}</h1>
          <p>Generated on: ${new Date(assessment.date).toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Activity: ${assessment.activity}</h2>
        </div>

        <div class="section">
          <h2>Hazards Assessment</h2>
          ${assessment.hazards.map((hazard, index) => {
            const initialRiskLevel = getRiskLevel(hazard.riskScore);
            const finalRiskLevel = getRiskLevel(hazard.finalRiskScore);
            
            return `
              <div class="hazard">
                <h3>Hazard ${index + 1}: ${hazard.description}</h3>
                
                <h4>Effects:</h4>
                <ul>
                  ${hazard.effects.map((effect: any) => `
                    <li>${effect.description}</li>
                  `).join('')}
                </ul>

                <h4>Existing Controls:</h4>
                <ul>
                  ${hazard.existingControls.map((control: any) => `
                    <li>${control.description}</li>
                  `).join('')}
                </ul>

                <h4>Initial Risk Assessment:</h4>
                <div>
                  <p>Likelihood: ${hazard.likelihood}</p>
                  <p>Severity: ${hazard.severity}</p>
                  <div class="risk-score" style="background-color: ${initialRiskLevel.color}20; color: ${initialRiskLevel.color}">
                    Initial Risk Score: ${hazard.riskScore} - ${initialRiskLevel.description}
                  </div>
                </div>

                <div class="controls-section">
                  <h4>Additional Controls:</h4>
                  
                  ${hazard.additionalControls.ac.length > 0 ? `
                    <div class="control-type">
                      <h5>Administrative Controls:</h5>
                      <ul>
                        ${hazard.additionalControls.ac.map((control: string) => `
                          <li>${control}</li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : ''}
                  
                  ${hazard.additionalControls.ec.length > 0 ? `
                    <div class="control-type">
                      <h5>Engineering Controls:</h5>
                      <ul>
                        ${hazard.additionalControls.ec.map((control: string) => `
                          <li>${control}</li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : ''}
                  
                  ${hazard.additionalControls.ppe.length > 0 ? `
                    <div class="control-type">
                      <h5>PPE Required:</h5>
                      <ul>
                        ${hazard.additionalControls.ppe.map((control: string) => `
                          <li>${control}</li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : ''}

                  <div class="control-type">
                    <h5>Implementation:</h5>
                    <p>Point Person: ${hazard.pointPerson}</p>
                    <p>Due Date: ${hazard.dueDate}</p>
                  </div>
                </div>

                <h4>Final Risk Assessment:</h4>
                <div>
                  <p>Likelihood: ${hazard.finalLikelihood}</p>
                  <p>Severity: ${hazard.finalSeverity}</p>
                  <div class="risk-score" style="background-color: ${finalRiskLevel.color}20; color: ${finalRiskLevel.color}">
                    Final Risk Score: ${hazard.finalRiskScore} - ${finalRiskLevel.description}
                  </div>
                </div>

                <div class="recommendations">
                  <h4>Recommendations:</h4>
                  <p>${
                    hazard.finalRiskScore > hazard.riskScore 
                      ? 'Warning: Risk level has increased. Additional controls may be needed.'
                      : hazard.finalRiskScore === hazard.riskScore
                      ? 'Controls have not reduced risk level. Consider implementing additional controls.'
                      : `Risk level has been reduced from ${initialRiskLevel.description} to ${finalRiskLevel.description}. Continue monitoring and maintaining controls.`
                  }</p>
                  ${
                    hazard.finalRiskScore > 12 
                      ? '<p><strong>High Risk Alert:</strong> Immediate action required. Consider stopping activity until additional controls are implemented.</p>'
                      : ''
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
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