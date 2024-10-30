import React, { useState } from 'react';
import { View, TextInput, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { CustomDropdown } from '../components/CustomDropdown';
import { Hazard, Effect, Control } from '../types/risk';
import { useAssessment } from '../contexts/AssessmentContext';
import { inputStyles } from '../styles/input-styles'

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
  const [selectedActivity, setSelectedActivity] = useState('');

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
    setSelectedActivity(value.toString());
  };

  const handleHazardChange = (value: string | number) => {
    setSelectedHazard(value.toString());
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

  const handleAddActivity = () => {
    if (selectedActivity === 'custom') {
      if (!customActivity.trim()) return;
      setActivity('custom');
      setCustomActivity(customActivity.trim());
    } else {
      setActivity(selectedActivity);
    }
    setSelectedActivity('');
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
                        onPress={handleAddActivity}
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

                <CustomDropdown
                  label="Add Hazard"
                  data={hazardOptions}
                  value={selectedHazard}
                  onChange={handleHazardChange}
                />

                {selectedHazard === 'custom' && (
                  <TextInput
                    style={[inputStyles.input, inputStyles.textArea]}
                    placeholder="Describe the hazard"
                    value={customHazard}
                    onChangeText={setCustomHazard}
                    multiline
                  />
                )}

                {selectedHazard && (
                  <TouchableOpacity
                    style={inputStyles.addButton}
                    onPress={() => {
                      if (selectedHazard === 'custom') {
                        if (!customHazard.trim()) return;
                        handleAddHazard({
                          description: customHazard.trim(),
                          images: [],
                        });
                      } else {
                        handleAddHazard({
                          description: selectedHazard,
                          images: [],
                        });
                      }
                      setSelectedHazard('');
                      setCustomHazard('');
                    }}
                  >
                    <Text style={inputStyles.addButtonText}>Add Hazard</Text>
                  </TouchableOpacity>
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
