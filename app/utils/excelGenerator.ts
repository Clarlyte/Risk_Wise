import * as FileSystem from 'expo-file-system';
import { Assessment } from '../types/pdf';
import { HazardWithFinalRisk } from '../types/hazard';

function generateExcelContent(assessment: Assessment): string {
  // Create CSV content with HIRAC format
  let csvContent = 'HIRAC - Hazard Identification Risk Assessment & Control\n\n';
  
  // Assessment Details
  csvContent += `Assessment Name,${assessment.name}\n`;
  csvContent += `Activity,${assessment.activity}\n`;
  csvContent += `Date,${new Date(assessment.date).toLocaleDateString()}\n\n`;

  // Headers
  csvContent += '1. Hazard Identification,2. Risk Assessment (Analysis/Evaluation),,,,,3. Control,,4. Final Risk Assessment\n';
  csvContent += 'Work Activity/Hazards,Which can cause (Hazard Effects),Existing Risk Control,Likelihood,Severity,Risk Score,Risk Rating,';
  csvContent += 'Proposed Additional Control Measure,Point Person/Status,Due Date,Likelihood,Severity,Risk Score,Risk Rating\n';

  // Add hazard data
  assessment.hazards.forEach((hazard: HazardWithFinalRisk) => {
    // Format effects and controls with bullet points
    const effects = hazard.effects?.map(e => `• ${e.description}`).join('\n') || '';
    const existingControls = hazard.existingControls?.map(c => `• ${c.description}`).join('\n') || '';
    
    // Format additional controls by type
    const additionalControls = [
      ...(hazard.additionalControls.ec.map(c => `EC: ${c}`) || []),
      ...(hazard.additionalControls.ac.map(c => `AC: ${c}`) || []),
      ...(hazard.additionalControls.ppe.map(c => `PPE: ${c}`) || [])
    ].join('\n');

    // Calculate risk ratings
    const initialRiskRating = getRiskRating(hazard.riskScore);
    const finalRiskRating = getRiskRating(hazard.finalRiskScore);

    // Add row data
    csvContent += `"${hazard.description}",`; // Work Activity/Hazards
    csvContent += `"${effects}",`; // Hazard Effects
    csvContent += `"${existingControls}",`; // Existing Controls
    csvContent += `${hazard.likelihood},`; // Initial Likelihood
    csvContent += `${hazard.severity},`; // Initial Severity
    csvContent += `${hazard.riskScore},`; // Initial Risk Score
    csvContent += `"${initialRiskRating}",`; // Initial Risk Rating
    csvContent += `"${additionalControls}",`; // Additional Controls
    csvContent += `${hazard.pointPerson},`; // Point Person
    csvContent += `${hazard.dueDate},`; // Due Date
    csvContent += `${hazard.finalLikelihood},`; // Final Likelihood
    csvContent += `${hazard.finalSeverity},`; // Final Severity
    csvContent += `${hazard.finalRiskScore},`; // Final Risk Score
    csvContent += `"${finalRiskRating}"\n`; // Final Risk Rating
  });

  return csvContent;
}

// Helper function to determine risk rating
function getRiskRating(score: number): string {
  if (score <= 3) return 'Very Low Risk';
  if (score <= 6) return 'Low Risk';
  if (score <= 12) return 'Medium Risk';
  if (score <= 15) return 'High Risk';
  return 'Immediately Dangerous';
}

export async function generateExcelFile(assessment: Assessment): Promise<string> {
  try {
    console.log('Generating Excel file...');
    const csvContent = generateExcelContent(assessment);
    
    // Use the downloads directory for Android
    const dirPath = `${FileSystem.documentDirectory}Download/`;
    console.log('Directory path:', dirPath);

    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }

    // Generate file path with timestamp to ensure uniqueness
    const sanitizedName = assessment.name.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `HIRAC_${sanitizedName}_${timestamp}.csv`;
    const filePath = `${dirPath}${fileName}`;
    console.log('File path:', filePath);

    // Write file
    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // Verify file was created
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    console.log('File info:', fileInfo);

    if (!fileInfo.exists) {
      throw new Error('File was not created successfully');
    }

    return filePath;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
} 