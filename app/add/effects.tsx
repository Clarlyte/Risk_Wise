import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
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
    await saveTempAssessment({
      activity,
      hazardsWithEffects,
      step: 'effects'
    });
    
    router.push({
      pathname: '/add/risk-assessment',
      params: {
        activity,
        hazards: JSON.stringify(hazardsWithEffects),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: 80 }]}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Hazard Effects & Controls" onSettingsPress={() => {}} />
        
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.content}>
            {hazardsWithEffects.map((hazard: HazardWithEffects, index: number) => (
              <View key={hazard.id} style={styles.hazardSection}>
                <Text style={styles.hazardTitle}>Hazard {index + 1}</Text>
                <Text style={styles.hazardDescription}>{hazard.description}</Text>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Effects</Text>
                  {hazard.effects.map((effect: Effect) => (
                    <View key={effect.id} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{effect.description}</Text>
                      <TouchableOpacity 
                        onPress={() => removeEffect(hazard.id, effect.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
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
                      style={styles.input}
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
                    style={styles.addButton}
                    onPress={() => addEffect(hazard.id)}
                  >
                    <Text style={styles.addButtonText}>Add Effect</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Existing Controls</Text>
                  {hazard.existingControls.map((control: Control) => (
                    <View key={control.id} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{control.description}</Text>
                      <TouchableOpacity 
                        onPress={() => removeControl(hazard.id, control.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
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
                      style={styles.input}
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
                    style={styles.addButton}
                    onPress={() => addControl(hazard.id)}
                  >
                    <Text style={styles.addButtonText}>Add Control</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <BottomNavigation
          onBack={() => router.push('/add/activity')}
          onNext={handleNext}
          nextDisabled={!hazardsWithEffects.every(hazard => hazard.effects.length > 0)}
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
  section: {
    marginBottom: 24,
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
    backgroundColor: '#bcf5bc',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
});
