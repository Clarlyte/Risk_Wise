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
          <h2>Hazards and Controls</h2>
          ${assessment.hazards.map((hazard, index) => {
            const riskLevel = getRiskLevel(hazard.riskScore);
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

                <div class="risk-score" style="background-color: ${riskLevel.color}20; color: ${riskLevel.color}">
                  Risk Score: ${hazard.riskScore} - ${riskLevel.description}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </body>
    </html>
  `;

  const pdfFileName = `assessment_${assessment.id}.html`;
  const pdfPath = `${FileSystem.documentDirectory}${pdfFileName}`;

  await FileSystem.writeAsStringAsync(pdfPath, htmlContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return pdfPath;
} 