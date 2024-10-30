import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { CustomDropdown } from '../components/CustomDropdown';
import { HazardWithEffects, HazardWithRisk } from '../types/hazard';
import { LIKELIHOOD_OPTIONS, SEVERITY_OPTIONS } from '../types/risk';
import { BottomNavigation } from '../components/BottomNavigation';
import { useAssessment } from '../contexts/AssessmentContext';

export default function RiskAssessmentScreen() {
  const router = useRouter();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const { saveTempAssessment } = useAssessment();
  
  const [hazardsWithRisk, setHazardsWithRisk] = useState<HazardWithRisk[]>(() => {
    const parsedHazards: HazardWithEffects[] = JSON.parse(hazardsParam as string);
    return parsedHazards.map(hazard => ({
      ...hazard,
      likelihood: 1,
      severity: 1,
      riskScore: 1,
    }));
  });

  useEffect(() => {
    if (hazardsParam) {
      const parsedHazards: HazardWithEffects[] = JSON.parse(hazardsParam as string);
      setHazardsWithRisk(prev => {
        return parsedHazards.map(newHazard => {
          const existingHazard = prev.find(h => h.id === newHazard.id);
          if (existingHazard) {
            return {
              ...newHazard,
              likelihood: existingHazard.likelihood,
              severity: existingHazard.severity,
              riskScore: existingHazard.riskScore,
            };
          }
          return {
            ...newHazard,
            likelihood: 1,
            severity: 1,
            riskScore: 1,
          };
        });
      });
    }
  }, [hazardsParam]);

  const updateRisk = (id: string, field: 'likelihood' | 'severity', value: number) => {
    setHazardsWithRisk(prev =>
      prev.map(hazard => {
        if (hazard.id === id) {
          const newHazard = { ...hazard, [field]: value };
          newHazard.riskScore = newHazard.likelihood * newHazard.severity;
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

  const handleNext = async () => {
    await saveTempAssessment({
      activity,
      hazardsWithRisk,
      step: 'riskAssessment'
    });
    
    router.push({
      pathname: '/add/controls',
      params: {
        activity,
        hazards: JSON.stringify(hazardsWithRisk),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: 80 }]}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Risk Assessment" onSettingsPress={() => {}} />
        
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.content}>
            {hazardsWithRisk.map((hazard, index) => {
              const riskLevel = getRiskLevel(hazard.riskScore);
              return (
                <View key={hazard.id} style={styles.hazardSection}>
                  <Text style={styles.hazardTitle}>Hazard {index + 1}</Text>
                  <Text style={styles.hazardDescription}>{hazard.description}</Text>
                  
                  <CustomDropdown
                    label="Likelihood"
                    data={LIKELIHOOD_OPTIONS}
                    value={hazard.likelihood}
                    onChange={(value) => updateRisk(hazard.id, 'likelihood', Number(value))}
                  />
                  
                  <CustomDropdown
                    label="Severity"
                    data={SEVERITY_OPTIONS}
                    value={hazard.severity}
                    onChange={(value) => updateRisk(hazard.id, 'severity', Number(value))}
                  />
                  
                  <View style={styles.riskScore}>
                    <Text style={styles.label}>Risk Score: </Text>
                    <Text style={[styles.score, { color: riskLevel.color }]}>
                      {hazard.riskScore} - {riskLevel.text}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <BottomNavigation
          onBack={() => router.push('/add/effects')}
          onNext={handleNext}
          nextDisabled={!hazardsWithRisk.every(
            hazard => hazard.likelihood > 0 && hazard.severity > 0
          )}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  riskScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
