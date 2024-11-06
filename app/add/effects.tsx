import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { CustomDropdown } from '../components/CustomDropdown';
import { Hazard, Effect, Control } from '../types/risk';
import { useAssessment } from '../contexts/AssessmentContext';
import { inputStyles } from '../styles/input-styles';

interface HazardWithEffects extends Hazard {
  effects: Effect[];
  existingControls: Control[];
}

export default function EffectsScreen() {
  const router = useRouter();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const [hazardsWithEffects, setHazardsWithEffects] = useState<HazardWithEffects[]>(() => {
    const parsedHazards: HazardWithEffects[] = JSON.parse(hazardsParam as string);
    
    return parsedHazards.map((newHazard: HazardWithEffects): HazardWithEffects => {
      const existingHazard: HazardWithEffects | undefined = hazardsWithEffects?.find(
        (h: HazardWithEffects) => h.id === newHazard.id
      );
      
      if (existingHazard) {
        return {
          ...newHazard,
          effects: existingHazard.effects,
          existingControls: existingHazard.existingControls,
        };
      }
      
      return {
        ...newHazard,
        effects: [],
        existingControls: [],
      };
    });
  });

  useEffect(() => {
    if (hazardsParam) {
      const parsedHazards: HazardWithEffects[] = JSON.parse(hazardsParam as string);
      
      setHazardsWithEffects(prevHazards => {
        return parsedHazards.map(newHazard => {
          const existingHazard: HazardWithEffects | undefined = prevHazards.find(
            (h: HazardWithEffects) => h.id === newHazard.id
          );
          
          if (existingHazard) {
            return {
              ...newHazard,
              effects: existingHazard.effects,
              existingControls: existingHazard.existingControls,
            };
          }
          
          return {
            ...newHazard,
            effects: [],
            existingControls: [],
          };
        });
      });
    }
  }, [hazardsParam]);

  const effectOptions = [
    { label: 'Minor Injury', value: 'Minor injury requiring first aid' },
    { label: 'Serious Injury', value: 'Serious injury requiring medical attention' },
    { label: 'Major Injury', value: 'Major injury requiring hospitalization' },
    { label: 'Custom Effect', value: 'custom' },
  ];

  const controlOptions = [
    { label: 'PPE Required', value: 'Personal Protective Equipment must be worn' },
    { label: 'Training Required', value: 'Proper training must be completed' },
    { label: 'Supervision Required', value: 'Direct supervision required' },
    { label: 'Custom Control', value: 'custom' },
  ];

  const [selectedEffects, setSelectedEffects] = useState<{ [key: string]: string }>({});
  const [selectedControls, setSelectedControls] = useState<{ [key: string]: string }>({});
  const [customEffect, setCustomEffect] = useState<{ [key: string]: string }>({});
  const [customControl, setCustomControl] = useState<{ [key: string]: string }>({});

  const handleEffectChange = (hazardId: string, value: string | number) => {
    setSelectedEffects({ ...selectedEffects, [hazardId]: value.toString() });
  };

  const handleControlChange = (hazardId: string, value: string | number) => {
    setSelectedControls({ ...selectedControls, [hazardId]: value.toString() });
  };

  const addEffect = (hazardId: string) => {
    const selectedEffect = selectedEffects[hazardId];
    if (!selectedEffect) return;

    const effectDescription = selectedEffect === 'custom' 
      ? customEffect[hazardId]
      : selectedEffect;

    if (!effectDescription?.trim()) return;

    setHazardsWithEffects(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            effects: [...hazard.effects, {
              id: Date.now().toString(),
              description: effectDescription.trim(),
            }],
          };
        }
        return hazard;
      })
    );

    setSelectedEffects({ ...selectedEffects, [hazardId]: '' });
    setCustomEffect({ ...customEffect, [hazardId]: '' });
  };

  const addControl = (hazardId: string) => {
    const selectedControl = selectedControls[hazardId];
    if (!selectedControl) return;

    const controlDescription = selectedControl === 'custom' 
      ? customControl[hazardId]
      : selectedControl;

    if (!controlDescription?.trim()) return;

    setHazardsWithEffects(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            existingControls: [...hazard.existingControls, {
              id: Date.now().toString(),
              description: controlDescription.trim(),
            }],
          };
        }
        return hazard;
      })
    );

    setSelectedControls({ ...selectedControls, [hazardId]: '' });
    setCustomControl({ ...customControl, [hazardId]: '' });
  };

  const removeEffect = (hazardId: string, effectId: string) => {
    setHazardsWithEffects(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            effects: hazard.effects.filter(effect => effect.id !== effectId),
          };
        }
        return hazard;
      })
    );
  };

  const removeControl = (hazardId: string, controlId: string) => {
    setHazardsWithEffects(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            existingControls: hazard.existingControls.filter(control => control.id !== controlId),
          };
        }
        return hazard;
      })
    );
  };

  const isFormValid = () => {
    return hazardsWithEffects.every(
      hazard => hazard.effects.length > 0 && hazard.existingControls.length > 0
    );
  };

  const { saveTempAssessment } = useAssessment();

  const handleNext = async () => {
    try {
      // Ensure we have all required data
      if (!hazardsWithEffects.every(h => h.effects?.length > 0)) {
        Alert.alert('Error', 'Please add at least one effect for each hazard');
        return;
      }

      await saveTempAssessment({
        hazardsWithEffects: hazardsWithEffects.map(hazard => ({
          ...hazard,
          effects: hazard.effects || [],
          existingControls: hazard.existingControls || []
        })),
        step: 'effects'
      });

      router.push({
        pathname: '/add/risk-assessment',
        params: { 
          activity,
          hazards: JSON.stringify(hazardsWithEffects)
        }
      });
    } catch (error) {
      console.error('Error saving effects data:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
  };

  return (
    <SafeAreaView style={[inputStyles.safeArea, { paddingBottom: 80 }]}>
      <View style={inputStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Hazard Effects & Controls" onSettingsPress={() => {}} />
        
        <View style={inputStyles.scrollContainer}>
          <ScrollView style={inputStyles.content}>
            {hazardsWithEffects.map((hazard: HazardWithEffects, index: number) => (
              <View key={hazard.id} style={inputStyles.hazardSection}>
                <Text style={inputStyles.hazardTitle}>Hazard {index + 1}</Text>
                <Text style={inputStyles.hazardDescription}>{hazard.description}</Text>
                
                <View style={inputStyles.section}>
                  <Text style={inputStyles.sectionTitle}>Effects</Text>
                  {hazard.effects.map((effect: Effect) => (
                    <View key={effect.id} style={inputStyles.itemContainer}>
                      <Text style={inputStyles.itemText}>{effect.description}</Text>
                      <TouchableOpacity 
                        onPress={() => removeEffect(hazard.id, effect.id)}
                        style={inputStyles.removeButton}
                      >
                        <Text style={inputStyles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <CustomDropdown
                    label="Add Effect"
                    data={effectOptions}
                    value={selectedEffects[hazard.id] || ''}
                    onChange={(value) => handleEffectChange(hazard.id, value)}
                  />
                  
                  {selectedEffects[hazard.id] === 'custom' && (
                    <TextInput
                      style={[inputStyles.input, inputStyles.textArea]}
                      value={customEffect[hazard.id] || ''}
                      onChangeText={(text) => setCustomEffect({
                        ...customEffect,
                        [hazard.id]: text
                      })}
                      placeholder="Describe custom effect"
                      multiline
                    />
                  )}
                  
                  <TouchableOpacity
                    style={inputStyles.addButton}
                    onPress={() => addEffect(hazard.id)}
                  >
                    <Text style={inputStyles.addButtonText}>Add Effect</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={inputStyles.section}>
                  <Text style={inputStyles.sectionTitle}>Existing Controls</Text>
                  {hazard.existingControls.map((control: Control) => (
                    <View key={control.id} style={inputStyles.itemContainer}>
                      <Text style={inputStyles.itemText}>{control.description}</Text>
                      <TouchableOpacity 
                        onPress={() => removeControl(hazard.id, control.id)}
                        style={inputStyles.removeButton}
                      >
                        <Text style={inputStyles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <CustomDropdown
                    label="Add Control"
                    data={controlOptions}
                    value={selectedControls[hazard.id] || ''}
                    onChange={(value) => handleControlChange(hazard.id, value)}
                  />
                  
                  {selectedControls[hazard.id] === 'custom' && (
                    <TextInput
                      style={[inputStyles.input, inputStyles.textArea]}
                      value={customControl[hazard.id] || ''}
                      onChangeText={(text) => setCustomControl({
                        ...customControl,
                        [hazard.id]: text
                      })}
                      placeholder="Describe custom control"
                      multiline
                    />
                  )}
                  
                  <TouchableOpacity
                    style={inputStyles.addButton}
                    onPress={() => addControl(hazard.id)}
                  >
                    <Text style={inputStyles.addButtonText}>Add Control</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <BottomNavigation
          nextLabel="Next"
          onBack={() => router.push('/add/activity')}
          onNext={handleNext}
          nextDisabled={!hazardsWithEffects.every(hazard => hazard.effects.length > 0)}
        />
      </View>
    </SafeAreaView>
  );
}
