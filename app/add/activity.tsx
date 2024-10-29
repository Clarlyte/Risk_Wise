import React, { useState } from 'react';
import { View, TextInput, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { StepNavigationButtons } from '../components/StepNavigationButtons';
import { CustomDropdown } from '../components/CustomDropdown';

interface Hazard {
  id: string;
  description: string;
  images: string[];
}

export default function ActivityHazardScreen() {
  const router = useRouter();
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState('');
  const [customHazard, setCustomHazard] = useState('');

  const activityOptions = [
    { label: 'Working at Heights', value: 'Working at Heights' },
    { label: 'Manual Handling', value: 'Manual Handling' },
    { label: 'Operating Machinery', value: 'Operating Machinery' },
    { label: 'Custom Activity', value: 'custom' },
  ];

  const hazardOptions = [
    { label: 'Fall from Height', value: 'Fall from Height' },
    { label: 'Electrical Shock', value: 'Electrical Shock' },
    { label: 'Chemical Exposure', value: 'Chemical Exposure' },
    { label: 'Custom Hazard', value: 'custom' },
  ];

  const handleActivityChange = (value: string | number) => {
    if (value === 'custom') {
      setActivity('custom');
      return;
    }
    setActivity(value.toString());
    setCustomActivity('');
  };

  const handleHazardChange = (value: string | number) => {
    setSelectedHazard(value.toString());
    if (value !== 'custom') {
      handleAddHazard({
        description: value.toString(),
        images: [],
      });
      setSelectedHazard('');
    }
  };

  const handleAddHazard = ({ description, images }: { description: string; images: string[] }) => {
    const newHazard: Hazard = {
      id: Date.now().toString(),
      description,
      images,
    };
    setHazards([...hazards, newHazard]);
    setCustomHazard('');
  };

  const handleCustomHazardSave = () => {
    if (!customHazard.trim()) return;
    
    handleAddHazard({
      description: customHazard.trim(),
      images: [],
    });
    setSelectedHazard('');
  };

  const handleContinue = () => {
    const finalActivity = activity === 'custom' ? customActivity.trim() : activity;
    if (!finalActivity || hazards.length === 0) return;
    
    router.push({
      pathname: '/add/effects',
      params: {
        activity: finalActivity,
        hazards: JSON.stringify(hazards),
      },
    });
  };

  const isFormValid = () => {
    const hasValidActivity = activity === 'custom' ? customActivity.trim().length > 0 : activity.length > 0;
    return hasValidActivity && hazards.length > 0;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Activity & Hazards" onSettingsPress={() => {}} />
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <CustomDropdown
              label="Select Work Activity"
              data={activityOptions}
              value={activity}
              onChange={handleActivityChange}
            />

            {activity === 'custom' && (
              <TextInput
                style={styles.input}
                placeholder="Enter custom work activity"
                value={customActivity}
                onChangeText={setCustomActivity}
                multiline
                numberOfLines={4}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identified Hazards</Text>
            {hazards.map((hazard) => (
              <View key={hazard.id} style={styles.hazardItem}>
                <Text style={styles.hazardText}>{hazard.description}</Text>
              </View>
            ))}

            <CustomDropdown
              label="Add Hazard"
              data={hazardOptions}
              value={selectedHazard}
              onChange={handleHazardChange}
            />

            {selectedHazard === 'custom' && (
              <View style={styles.customHazardInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Describe the hazard"
                  value={customHazard}
                  onChangeText={setCustomHazard}
                  multiline
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleCustomHazardSave}
                >
                  <Text style={styles.addButtonText}>Add Hazard</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <StepNavigationButtons
          onBack={() => router.push('/')}
          onContinue={handleContinue}
          continueDisabled={!isFormValid()}
          isFirstStep
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  hazardItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  hazardText: {
    fontSize: 16,
    color: '#333',
  },
  customHazardInput: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#1294D5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
