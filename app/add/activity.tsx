import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { CustomDropdown } from '../components/CustomDropdown';
import { Hazard, Effect, Control } from '../types/risk';
import { useAssessment } from '../contexts/AssessmentContext';
import { inputStyles } from '../styles/input-styles';
import { HazardInput } from '../components/HazardInput';

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
  const [selectedActivity, setSelectedActivity] = useState('');

  const activityOptions = [
    { label: 'Working at Heights', value: 'Working at Heights' },
    { label: 'Manual Handling', value: 'Manual Handling' },
    { label: 'Operating Machinery', value: 'Operating Machinery' },
    { label: 'Custom Activity', value: 'custom' },
  ];

  const hazardOptions = [
    { label: 'Falling Objects', value: 'Falling Objects' },
    { label: 'Electrical Hazards', value: 'Electrical Hazards' },
    { label: 'Slips and Trips', value: 'Slips and Trips' },
    { label: 'Custom Hazard', value: 'custom' },
  ];

  const [selectedHazard, setSelectedHazard] = useState('');
  const [customHazard, setCustomHazard] = useState('');

  const handleActivityChange = (value: string | number) => {
    setSelectedActivity(value.toString());
  };

  const handleAddHazard = (hazard: { description: string; images: string[] }) => {
    const newHazard: HazardWithEffects = {
      id: Date.now().toString(),
      description: hazard.description,
      images: hazard.images,
      effects: [],
      existingControls: [],
    };
    setHazards([...hazards, newHazard]);
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
    try {
      const finalActivity = activity === 'custom' ? customActivity.trim() : activity;
      if (!finalActivity || hazards.length === 0) return;

      // Save activity step data with error handling
      await saveTempAssessment({
        activity: finalActivity,
        hazards: hazards.map(hazard => ({
          ...hazard,
          id: hazard.id || Date.now().toString() // Ensure IDs exist
        })),
        step: 'activity'
      });

      router.push({
        pathname: '/add/effects',
        params: { 
          activity: finalActivity,
          hazards: JSON.stringify(hazards)
        }
      });
    } catch (error) {
      console.error('Error saving activity data:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
  };

  return (
    <SafeAreaView style={[inputStyles.safeArea, { paddingBottom: 80 }]}>
      <View style={inputStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Activity & Hazards" onSettingsPress={() => {}} />
        
        <View style={inputStyles.scrollContainer}>
          <ScrollView style={inputStyles.content}>
            {/* Activity Section */}
            <View style={inputStyles.inputSection}>
              <Text style={inputStyles.sectionTitle}>Work Activity</Text>
              <View style={inputStyles.inputContainer}>
                {activity && (
                  <View style={inputStyles.hazardItemContainer}>
                    <Text style={inputStyles.itemText}>
                      {activity === 'custom' ? customActivity : activity}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setActivity('');
                        setCustomActivity('');
                      }}
                      style={inputStyles.removeButton}
                    >
                      <Text style={inputStyles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!activity && (
                  <>
                    <CustomDropdown
                      label="Select Work Activity"
                      data={activityOptions}
                      value={selectedActivity}
                      onChange={handleActivityChange}
                    />

                    {selectedActivity === 'custom' && (
                      <TextInput
                        style={[inputStyles.input, inputStyles.textArea]}
                        placeholder="Enter custom work activity"
                        value={customActivity}
                        onChangeText={setCustomActivity}
                        multiline
                        numberOfLines={4}
                      />
                    )}

                    {selectedActivity && (
                      <TouchableOpacity
                        style={inputStyles.addButton}
                        onPress={() => {
                          if (selectedActivity === 'custom') {
                            if (!customActivity.trim()) return;
                            setActivity('custom');
                            setCustomActivity(customActivity.trim());
                          } else {
                            setActivity(selectedActivity);
                          }
                          setSelectedActivity('');
                        }}
                      >
                        <Text style={inputStyles.addButtonText}>Set Activity</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Hazards Section */}
            <View style={inputStyles.inputSection}>
              <Text style={inputStyles.sectionTitle}>Identified Hazards</Text>
              <View style={inputStyles.inputContainer}>
                {hazards.map((hazard) => (
                  <View key={hazard.id} style={inputStyles.hazardItemContainer}>
                    <Text style={inputStyles.itemText}>{hazard.description}</Text>
                    {hazard.images.length > 0 && (
                      <Image
                        source={{ uri: hazard.images[0] }} // Display the first image
                        style={{ width: 100, height: 100, borderRadius: 8, marginVertical: 4 }}
                      />
                    )}
                    <TouchableOpacity 
                      onPress={() => {
                        setHazards(hazards.filter(h => h.id !== hazard.id));
                      }}
                      style={inputStyles.removeButton}
                    >
                      <Text style={inputStyles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <HazardInput onSave={handleAddHazard} onCancel={() => {}} />
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
