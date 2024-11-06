import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { HazardWithControls } from '../types/hazard';
import { CustomDropdown } from '../components/CustomDropdown';
import { LIKELIHOOD_OPTIONS, SEVERITY_OPTIONS } from '../types/risk';
import { useAssessment } from '../contexts/AssessmentContext';
import { inputStyles } from '../styles/input-styles';

interface HazardWithFinalRisk extends HazardWithControls {
  finalLikelihood: number;
  finalSeverity: number;
  finalRiskScore: number;
}

export default function FinalRiskScreen() {
  const router = useRouter();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const { saveTempAssessment } = useAssessment();
  
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

  const handleNext = async () => {
    try {
      // Validate final risk assessment
      if (!hazardsWithFinalRisk.every(h => h.finalLikelihood && h.finalSeverity)) {
        Alert.alert('Error', 'Please complete final risk assessment for all hazards');
        return;
      }

      await saveTempAssessment({
        hazardsWithFinalRisk: hazardsWithFinalRisk.map(hazard => ({
          ...hazard,
          finalRiskScore: hazard.finalLikelihood * hazard.finalSeverity
        })),
        step: 'finalRisk'
      });

      router.push({
        pathname: '/add/generate-pdf',
        params: { 
          activity,
          hazards: JSON.stringify(hazardsWithFinalRisk)
        }
      });
    } catch (error) {
      console.error('Error saving final risk data:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
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
    <SafeAreaView style={[inputStyles.safeArea, { paddingBottom: 80 }]}>
      <View style={inputStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Final Risk Assessment" onSettingsPress={() => {}} />
        
        <View style={inputStyles.scrollContainer}>
          <ScrollView style={inputStyles.content}>
            {hazardsWithFinalRisk.map((hazard, index) => {
              const initialRiskLevel = getRiskLevel(hazard.riskScore);
              const finalRiskLevel = getRiskLevel(hazard.finalRiskScore);
              
              return (
                <View key={hazard.id} style={inputStyles.hazardSection}>
                  <Text style={inputStyles.hazardTitle}>Hazard {index + 1}</Text>
                  <Text style={inputStyles.hazardDescription}>{hazard.description}</Text>
                  
                  {/* Initial Risk Section */}
                  <View style={inputStyles.riskSection}>
                    <Text style={inputStyles.riskSectionTitle}>Initial Risk</Text>
                    <View style={inputStyles.riskScoreContainer}>
                      <Text style={inputStyles.scoreLabel}>Score:</Text>
                      <Text style={[inputStyles.scoreValue, { color: initialRiskLevel.color }]}>
                        {hazard.riskScore}
                      </Text>
                      <Text style={[inputStyles.riskLevel, { color: initialRiskLevel.color }]}>
                        {initialRiskLevel.text}
                      </Text>
                    </View>
                  </View>

                  {/* Final Risk Assessment Section */}
                  <View style={inputStyles.riskSection}>
                    <Text style={inputStyles.riskSectionTitle}>Final Risk Assessment</Text>
                    
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
                    
                    <View style={inputStyles.riskScoreContainer}>
                      <Text style={inputStyles.scoreLabel}>Score:</Text>
                      <Text style={[inputStyles.scoreValue, { color: finalRiskLevel.color }]}>
                        {hazard.finalRiskScore}
                      </Text>
                      <Text style={[inputStyles.riskLevel, { color: finalRiskLevel.color }]}>
                        {finalRiskLevel.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <BottomNavigation
          onBack={() => router.push('/add/controls')}
          onNext={handleNext}
          nextDisabled={!hazardsWithFinalRisk.every(
            hazard => hazard.finalLikelihood > 0 && hazard.finalSeverity > 0
          )}
        />
      </View>
    </SafeAreaView>
  );
}
