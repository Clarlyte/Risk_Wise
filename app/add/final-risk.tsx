import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { HazardWithControls } from '../types/hazard';
import { CustomDropdown } from '../components/CustomDropdown';
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
      finalLikelihood: hazard.likelihood,
      finalSeverity: hazard.severity,
      finalRiskScore: hazard.riskScore,
    }));
  });

  // Update state when hazards param changes
  useEffect(() => {
    if (hazardsParam) {
      const parsedHazards: HazardWithControls[] = JSON.parse(hazardsParam as string);
      setHazardsWithFinalRisk(prev => {
        return parsedHazards.map(newHazard => {
          const existingHazard = prev.find(h => h.id === newHazard.id);
          if (existingHazard) {
            return {
              ...newHazard,
              finalLikelihood: existingHazard.finalLikelihood,
              finalSeverity: existingHazard.finalSeverity,
              finalRiskScore: existingHazard.finalRiskScore,
            };
          }
          return {
            ...newHazard,
            finalLikelihood: newHazard.likelihood,
            finalSeverity: newHazard.severity,
            finalRiskScore: newHazard.riskScore,
          };
        });
      });
    }
  }, [hazardsParam]);

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { text: 'Very Low Risk', color: '#4CAF50' };
    if (score <= 6) return { text: 'Low Risk', color: '#8BC34A' };
    if (score <= 12) return { text: 'Medium Risk', color: '#FFEB3B' };
    if (score <= 15) return { text: 'High Risk', color: '#FF9800' };
    return { text: 'Immediately Dangerous', color: '#F44336' };
  };

  const handleContinue = () => {
    router.push({
      pathname: '/add/generate-pdf',
      params: {
        activity,
        hazards: JSON.stringify(hazardsWithFinalRisk),
      },
    });
  };

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

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: 80 }]}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Final Risk Assessment" onSettingsPress={() => {}} />
        
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.content}>
            {hazardsWithFinalRisk.map((hazard, index) => {
              const initialRiskLevel = getRiskLevel(hazard.riskScore);
              const finalRiskLevel = getRiskLevel(hazard.finalRiskScore);
              
              return (
                <View key={hazard.id} style={styles.hazardSection}>
                  <Text style={styles.hazardTitle}>Hazard {index + 1}</Text>
                  <Text style={styles.hazardDescription}>{hazard.description}</Text>
                  
                  {/* Initial Risk Section */}
                  <View style={styles.riskSection}>
                    <Text style={styles.riskSectionTitle}>Initial Risk</Text>
                    <Text style={[styles.riskScore, { color: initialRiskLevel.color }]}>
                      {hazard.riskScore} - {initialRiskLevel.text}
                    </Text>
                  </View>

                  {/* Final Risk Assessment Section */}
                  <View style={styles.riskSection}>
                    <Text style={styles.riskSectionTitle}>Final Risk Assessment</Text>
                    
                    <CustomDropdown
                      label="Likelihood"
                      data={LIKELIHOOD_OPTIONS}
                      value={hazard.finalLikelihood}
                      onChange={(value) => updateFinalRisk(hazard.id, 'finalLikelihood', Number(value))}
                    />
                    
                    <CustomDropdown
                      label="Severity"
                      data={SEVERITY_OPTIONS}
                      value={hazard.finalSeverity}
                      onChange={(value) => updateFinalRisk(hazard.id, 'finalSeverity', Number(value))}
                    />
                    
                    <View style={styles.finalScoreContainer}>
                      <Text style={styles.label}>Final Risk Score: </Text>
                      <Text style={[styles.riskScore, { color: finalRiskLevel.color }]}>
                        {hazard.finalRiskScore} - {finalRiskLevel.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <BottomNavigation
          onBack={() => router.push({
            pathname: '/add/controls',
            params: {
              activity,
              hazards: JSON.stringify(hazardsWithFinalRisk),
            }
          })}
          onNext={handleContinue}
          nextDisabled={!hazardsWithFinalRisk.length}
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    marginBottom: 80,
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
  riskSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  riskSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  finalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  riskScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
