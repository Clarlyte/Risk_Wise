import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { CustomDropdown } from '../components/CustomDropdown';
import { HazardWithEffects, HazardWithRisk } from '../types/hazard';
import { LIKELIHOOD_OPTIONS, SEVERITY_OPTIONS } from '../types/risk';
import { BottomNavigation } from '../components/BottomNavigation';
import { useAssessment } from '../contexts/AssessmentContext';
import { inputStyles } from '../styles/input-styles';

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
    try {
      // Validate risk assessment data
      if (!hazardsWithRisk.every(h => h.likelihood && h.severity)) {
        Alert.alert('Error', 'Please complete risk assessment for all hazards');
        return;
      }

      await saveTempAssessment({
        hazardsWithRisk: hazardsWithRisk.map(hazard => ({
          ...hazard,
          riskScore: hazard.likelihood * hazard.severity
        })),
        step: 'riskAssessment'
      });

      router.push({
        pathname: '/add/controls',
        params: { 
          activity,
          hazards: JSON.stringify(hazardsWithRisk)
        }
      });
    } catch (error) {
      console.error('Error saving risk assessment data:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
  };

  return (
    <SafeAreaView style={[inputStyles.safeArea, { paddingBottom: 80 }]}>
      <View style={inputStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Risk Assessment" onSettingsPress={() => {}} />
        
        <View style={inputStyles.scrollContainer}>
          <ScrollView style={inputStyles.content}>
            {hazardsWithRisk.map((hazard, index) => {
              const riskLevel = getRiskLevel(hazard.riskScore);
              return (
                <View key={hazard.id} style={inputStyles.hazardSection}>
                  <Text style={inputStyles.hazardTitle}>Hazard {index + 1}</Text>
                  <Text style={inputStyles.hazardDescription}>{hazard.description}</Text>
                  
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
                  
                  <View style={inputStyles.riskScore}>
                    <Text style={inputStyles.scoreLabel}> Risk Score:</Text>
                    <Text style={[inputStyles.score, { color: riskLevel.color }]}>
                      {hazard.riskScore}
                    </Text>
                    <Text style={[inputStyles.riskLevel, { color: riskLevel.color }]}>
                      {riskLevel.text}
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
