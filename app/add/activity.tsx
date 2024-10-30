import React, { useState } from 'react';
import { View, TextInput, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { CustomDropdown } from '../components/CustomDropdown';
import { Hazard, Effect, Control } from '../types/risk';
import { useAssessment } from '../contexts/AssessmentContext';

interface HazardWithEffects extends Hazard {
  effects: Effect[];
  existingControls: Control[];
}

export default function ActivityHazardScreen() {
  const router = useRouter();
  const {
    activity,
    setActivity,
    customActivity,
    setCustomActivity,
    hazards,
    setHazards,
    saveTempAssessment
  } = useAssessment();
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
    const newHazard: HazardWithEffects = {
      id: Date.now().toString(),
      description,
      images,
      effects: [],
      existingControls: [],
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

  const handleNext = async () => {
    await saveTempAssessment({
      activity,
      hazards,
      step: 'activity'
    });
    
    const finalActivity = activity === 'custom' ? customActivity.trim() : activity;
    router.push({
      pathname: '/add/effects',
      params: {
        activity: finalActivity,
        hazards: JSON.stringify(hazards),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: 80 }]}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Activity & Hazards" onSettingsPress={() => {}} />
        
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.content}>
            {/* Activity Section */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Work Activity</Text>
              <View style={styles.inputContainer}>
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
            </View>

            {/* Hazards Section */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Identified Hazards</Text>
              <View style={styles.inputContainer}>
                {hazards.map((hazard) => (
                  <View key={hazard.id} style={styles.itemContainer}>
                    <Text style={styles.itemText}>{hazard.description}</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setHazards(hazards.filter(h => h.id !== hazard.id));
                      }}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
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
            </View>
          </ScrollView>
        </View>

        <BottomNavigation
          onBack={() => router.push('/')}
          onNext={handleNext}
          nextDisabled={!isFormValid()}
          nextLabel="Next"
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
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    marginBottom: 80,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    paddingHorizontal: 4,
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
