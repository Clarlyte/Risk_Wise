import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { StepNavigationButtons } from '../components/StepNavigationButtons';
import { HazardWithRisk, HazardWithControls } from '../types/hazard';

interface ControlInputProps {
  label: string;
  values: string[];
  onAdd: (value: string) => void;
}

function ControlInput({ label, values, onAdd }: ControlInputProps) {
  const [newControl, setNewControl] = useState('');

  const handleAdd = () => {
    if (!newControl.trim()) return;
    onAdd(newControl.trim());
    setNewControl('');
  };

  return (
    <View style={styles.controlSection}>
      <Text style={styles.controlLabel}>{label}</Text>
      {values.map((value, index) => (
        <Text key={index} style={styles.controlItem}>• {value}</Text>
      ))}
      <View style={styles.addControlContainer}>
        <TextInput
          style={styles.controlInput}
          value={newControl}
          onChangeText={setNewControl}
          placeholder={`Add ${label}`}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAdd}
        >
          <FontAwesome5 name="plus" size={16} color="#1294D5" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ControlsScreen() {
  const router = useRouter();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const [hazardsWithControls, setHazardsWithControls] = useState<HazardWithControls[]>(() => {
    const parsedHazards: HazardWithRisk[] = JSON.parse(hazardsParam as string);
    return parsedHazards.map(hazard => ({
      ...hazard,
      additionalControls: {
        ac: [],
        ec: [],
        ppe: [],
      },
      pointPerson: '',
    }));
  });

  const addControl = (hazardId: string, type: 'ac' | 'ec' | 'ppe', value: string) => {
    setHazardsWithControls(prev =>
      prev.map(hazard =>
        hazard.id === hazardId
          ? {
              ...hazard,
              additionalControls: {
                ...hazard.additionalControls,
                [type]: [...hazard.additionalControls[type], value],
              },
            }
          : hazard
      )
    );
  };

  const updatePointPerson = (hazardId: string, value: string) => {
    setHazardsWithControls(prev =>
      prev.map(hazard =>
        hazard.id === hazardId
          ? { ...hazard, pointPerson: value }
          : hazard
      )
    );
  };

  const handleContinue = () => {
    const isValid = hazardsWithControls.every(
      hazard => hazard.pointPerson.trim() &&
      (hazard.additionalControls.ac.length > 0 ||
       hazard.additionalControls.ec.length > 0 ||
       hazard.additionalControls.ppe.length > 0)
    );
    
    if (!isValid) return;

    router.push({
      pathname: '/add/final-risk',
      params: {
        activity,
        hazards: JSON.stringify(hazardsWithControls),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Additional Controls" onSettingsPress={() => {}} />
        
        <ScrollView style={styles.content}>
          {hazardsWithControls.map((hazard, index) => (
            <View key={hazard.id} style={styles.hazardSection}>
              <Text style={styles.hazardTitle}>Hazard {index + 1}</Text>
              <Text style={styles.hazardDescription}>{hazard.description}</Text>
              
              <ControlInput
                label="Administrative Controls"
                values={hazard.additionalControls.ac}
                onAdd={(value) => addControl(hazard.id, 'ac', value)}
              />
              
              <ControlInput
                label="Engineering Controls"
                values={hazard.additionalControls.ec}
                onAdd={(value) => addControl(hazard.id, 'ec', value)}
              />
              
              <ControlInput
                label="PPE Required"
                values={hazard.additionalControls.ppe}
                onAdd={(value) => addControl(hazard.id, 'ppe', value)}
              />
              
              <Text style={styles.label}>Point Person</Text>
              <TextInput
                style={styles.input}
                value={hazard.pointPerson}
                onChangeText={(text) => updatePointPerson(hazard.id, text)}
                placeholder="Enter responsible person"
              />
            </View>
          ))}
        </ScrollView>

        <StepNavigationButtons
          onBack={() => router.back()}
          onContinue={handleContinue}
          continueDisabled={!hazardsWithControls.every(
            hazard => hazard.pointPerson.trim() &&
            (hazard.additionalControls.ac.length > 0 ||
             hazard.additionalControls.ec.length > 0 ||
             hazard.additionalControls.ppe.length > 0)
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
  controlSection: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  controlItem: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
  addControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  addButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#1294D5',
    borderRadius: 8,
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
  },
});
