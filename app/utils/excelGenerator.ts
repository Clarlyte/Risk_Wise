import * as FileSystem from 'expo-file-system';
import { Assessment } from '../types/pdf';
import { HazardWithFinalRisk } from '../types/hazard';

function generateExcelContent(assessment: Assessment): string {
  // Create CSV content
  let csvContent = 'Assessment Details\n';
  csvContent += `Name,${assessment.name}\n`;
  csvContent += `Date,${new Date(assessment.date).toLocaleDateString()}\n`;
  csvContent += `Activity,${assessment.activity}\n\n`;

  // Headers for hazards
  csvContent += 'Hazards Analysis\n';
  csvContent += 'Hazard Description,Effects,Existing Controls,Initial Risk Score,Additional Controls,Point Person,Final Risk Score\n';

  // Add hazard data
  assessment.hazards.forEach((hazard: HazardWithFinalRisk) => {
    const effects = hazard.effects?.map(e => e.description).join('; ') || '';
    const existingControls = hazard.existingControls?.map(c => c.description).join('; ') || '';
    const additionalControls = [
      ...(hazard.additionalControls.ac || []),
      ...(hazard.additionalControls.ec || []),
      ...(hazard.additionalControls.ppe || [])
    ].join('; ');

    csvContent += `"${hazard.description}","${effects}","${existingControls}",`;
    csvContent += `${hazard.riskScore},"${additionalControls}",`;
    csvContent += `"${hazard.pointPerson}",${hazard.finalRiskScore}\n`;
  });

  return csvContent;
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
    const fileName = `RiskWise_${sanitizedName}_${timestamp}.csv`;
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