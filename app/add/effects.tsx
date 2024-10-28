import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { StepNavigationButtons } from '../components/StepNavigationButtons';
import { Hazard } from '../types/risk';

interface HazardWithEffects extends Hazard {
  effects: string;
  existingControls: string;
}

export default function EffectsScreen() {
  const router = useRouter();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const [hazardsWithEffects, setHazardsWithEffects] = useState<HazardWithEffects[]>(() => {
    const parsedHazards: Hazard[] = JSON.parse(hazardsParam as string);
    return parsedHazards.map(hazard => ({
      ...hazard,
      effects: '',
      existingControls: '',
    }));
  });

  const updateHazard = (id: string, field: keyof HazardWithEffects, value: string) => {
    setHazardsWithEffects(prev =>
      prev.map(hazard =>
        hazard.id === id ? { ...hazard, [field]: value } : hazard
      )
    );
  };

  const handleContinue = () => {
    const isValid = hazardsWithEffects.every(
      hazard => hazard.effects.trim() && hazard.existingControls.trim()
    );
    
    if (!isValid) return;

    router.push({
      pathname: '/add/risk-assessment',
      params: {
        activity,
        hazards: JSON.stringify(hazardsWithEffects),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Hazard Effects & Controls" onSettingsPress={() => {}} />
        
        <ScrollView style={styles.content}>
          {hazardsWithEffects.map((hazard, index) => (
            <View key={hazard.id} style={styles.hazardSection}>
              <Text style={styles.hazardTitle}>Hazard {index + 1}</Text>
              <Text style={styles.hazardDescription}>{hazard.description}</Text>
              
              <Text style={styles.label}>Effects</Text>
              <TextInput
                style={styles.input}
                value={hazard.effects}
                onChangeText={(text) => updateHazard(hazard.id, 'effects', text)}
                placeholder="Describe potential effects"
                multiline
              />
              
              <Text style={styles.label}>Existing Controls</Text>
              <TextInput
                style={styles.input}
                value={hazard.existingControls}
                onChangeText={(text) => updateHazard(hazard.id, 'existingControls', text)}
                placeholder="List existing control measures"
                multiline
              />
            </View>
          ))}
        </ScrollView>

        <StepNavigationButtons
          onBack={() => router.back()}
          onContinue={handleContinue}
          continueDisabled={!hazardsWithEffects.every(
            hazard => hazard.effects.trim() && hazard.existingControls.trim()
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
});
