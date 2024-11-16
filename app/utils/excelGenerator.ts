import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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

export async function generateExcelFile(assessment: Assessment): Promise<void> {
  try {
    const csvContent = generateExcelContent(assessment);
    
    // Create directory if it doesn't exist
    const dirPath = `${FileSystem.documentDirectory}excel/`;
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }

    // Generate file path with a more user-friendly name
    const sanitizedName = assessment.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${sanitizedName}.csv`;
    const filePath = `${dirPath}${fileName}`;

    // Write file
    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Share the file
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Download Assessment Excel File',
      UTI: 'public.comma-separated-values-text' // for iOS
    });

  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
} 