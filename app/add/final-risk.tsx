import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { StepNavigationButtons } from '../components/StepNavigationButtons';
import { CustomDropdown } from '../components/CustomDropdown';
import { HazardWithControls } from '../types/hazard';
import { LIKELIHOOD_OPTIONS, SEVERITY_OPTIONS } from '../types/risk';

interface HazardWithFinalRisk extends HazardWithControls {
  finalLikelihood: number;
  finalSeverity: number;
  finalRiskScore: number;
}

export default function FinalRiskScreen() {
  const router = useRouter();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const [hazardsWithFinalRisk, setHazardsWithFinalRisk] = useState<HazardWithFinalRisk[]>(() => {
    const parsedHazards: HazardWithControls[] = JSON.parse(hazardsParam as string);
    return parsedHazards.map(hazard => ({
      ...hazard,
      finalLikelihood: 1,
      finalSeverity: 1,
      finalRiskScore: 1,
    }));
  });

  const updateFinalRisk = (id: string, field: 'finalLikelihood' | 'finalSeverity', value: number) => {
    setHazardsWithFinalRisk(prev =>
      prev.map(hazard => {
        if (hazard.id === id) {
          const newHazard = { ...hazard, [field]: value };
          newHazard.finalRiskScore = newHazard.finalLikelihood * newHazard.finalSeverity;
          return newHazard;
        }
        return hazard;
      })
    );
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { text: 'Very Low Risk', color: '#4CAF50' };
    if (score <= 6) return { text: 'Low Risk', color: '#8BC34A' };
    if (score <= 12) return { text: 'Medium Risk', color: '#FFEB3B' };
    if (score <= 15) return { text: 'High Risk', color: '#FF9800' };
    return { text: 'Immediately Dangerous', color: '#F44336' };
  };

  const handleGenerateReport = () => {
    // Here we'll add the PDF generation logic
    const assessmentData = {
      activity,
      hazards: hazardsWithFinalRisk,
      date: new Date().toISOString(),
    };

    // For now, just log the data
    console.log('Assessment Data:', assessmentData);
    
    // Navigate to records screen after saving
    router.push('/records');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Final Risk Assessment" onSettingsPress={() => {}} />
        
        <ScrollView style={styles.content}>
          {hazardsWithFinalRisk.map((hazard, index) => {
            const initialRiskLevel = getRiskLevel(hazard.riskScore);
            const finalRiskLevel = getRiskLevel(hazard.finalRiskScore);
            
            return (
              <View key={hazard.id} style={styles.hazardSection}>
                <Text style={styles.hazardTitle}>Hazard {index + 1}</Text>
                <Text style={styles.hazardDescription}>{hazard.description}</Text>
                
                <View style={styles.riskComparison}>
                  <View style={styles.riskBox}>
                    <Text style={styles.riskLabel}>Initial Risk:</Text>
                    <Text style={[styles.riskScore, { color: initialRiskLevel.color }]}>
                      {hazard.riskScore} - {initialRiskLevel.text}
                    </Text>
                  </View>
                </View>

                <CustomDropdown
                  label="Final Likelihood"
                  data={LIKELIHOOD_OPTIONS}
                  value={hazard.finalLikelihood}
                  onChange={(value) => updateFinalRisk(hazard.id, 'finalLikelihood', Number(value))}
                />
                
                <CustomDropdown
                  label="Final Severity"
                  data={SEVERITY_OPTIONS}
                  value={hazard.finalSeverity}
                  onChange={(value) => updateFinalRisk(hazard.id, 'finalSeverity', Number(value))}
                />
                
                <View style={styles.riskBox}>
                  <Text style={styles.riskLabel}>Final Risk:</Text>
                  <Text style={[styles.riskScore, { color: finalRiskLevel.color }]}>
                    {hazard.finalRiskScore} - {finalRiskLevel.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <StepNavigationButtons
          onBack={() => router.back()}
          onContinue={handleGenerateReport}
          isLastStep
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FC7524',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F1F9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  hazardSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  hazardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hazardDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  riskComparison: {
    marginBottom: 16,
  },
  riskBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
