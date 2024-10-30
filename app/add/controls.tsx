import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { CustomDropdown } from '../components/CustomDropdown';
import { HazardWithRisk } from '../types/hazard';
import DateTimePicker from '@react-native-community/datetimepicker';

interface HazardWithControls extends HazardWithRisk {
  additionalControls: {
    ac: string[];
    ec: string[];
    ppe: string[];
  };
  pointPerson: string;
  dueDate: string;
}

function initializeHazards(hazards: HazardWithRisk[]): HazardWithControls[] {
  return hazards.map(hazard => ({
    ...hazard,
    additionalControls: {
      ac: [],
      ec: [],
      ppe: [],
    },
    pointPerson: '',
    dueDate: '',
  }));
}

export default function ControlsScreen() {
  const router = useRouter();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  
  const [hazardsWithControls, setHazardsWithControls] = useState<HazardWithControls[]>(() => {
    const parsedHazards: HazardWithRisk[] = JSON.parse(hazardsParam as string);
    return initializeHazards(parsedHazards);
  });

  // Add states for dropdowns and custom inputs
  const [selectedControls, setSelectedControls] = useState<{ 
    [key: string]: { ac: string; ec: string; ppe: string } 
  }>({});
  const [customControls, setCustomControls] = useState<{ 
    [key: string]: { ac: string; ec: string; ppe: string } 
  }>({});
  const [selectedPointPerson, setSelectedPointPerson] = useState<{ [key: string]: string }>({});
  const [customPointPerson, setCustomPointPerson] = useState<{ [key: string]: string }>({});

  // Control options
  const controlOptions = {
    ac: [
      { label: 'Training Required', value: 'Training Required' },
      { label: 'Supervision Required', value: 'Supervision Required' },
      { label: 'Custom Control', value: 'custom' },
    ],
    ec: [
      { label: 'Guards Required', value: 'Guards Required' },
      { label: 'Barriers Required', value: 'Barriers Required' },
      { label: 'Custom Control', value: 'custom' },
    ],
    ppe: [
      { label: 'Safety Helmet', value: 'Safety Helmet' },
      { label: 'Safety Boots', value: 'Safety Boots' },
      { label: 'Custom PPE', value: 'custom' },
    ],
  };

  const pointPersonOptions = [
    { label: 'Site Supervisor', value: 'Site Supervisor' },
    { label: 'Safety Officer', value: 'Safety Officer' },
    { label: 'Project Manager', value: 'Project Manager' },
    { label: 'Custom Person', value: 'custom' },
  ];

  useEffect(() => {
    if (hazardsParam) {
      const parsedHazards: HazardWithRisk[] = JSON.parse(hazardsParam as string);
      setHazardsWithControls(prevHazards => {
        return parsedHazards.map(newHazard => {
          const existingHazard = prevHazards.find(h => h.id === newHazard.id);
          if (existingHazard) {
            return {
              ...newHazard,
              additionalControls: existingHazard.additionalControls,
              pointPerson: existingHazard.pointPerson,
              dueDate: existingHazard.dueDate,
            };
          }
          return {
            ...newHazard,
            additionalControls: {
              ac: [],
              ec: [],
              ppe: [],
            },
            pointPerson: '',
            dueDate: '',
          };
        });
      });
    }
  }, [hazardsParam]);

  const handleControlChange = (hazardId: string, type: 'ac' | 'ec' | 'ppe', value: string | number) => {
    setSelectedControls(prev => ({
      ...prev,
      [hazardId]: { ...prev[hazardId], [type]: value.toString() }
    }));
  };

  const addControl = (hazardId: string, type: 'ac' | 'ec' | 'ppe') => {
    const selected = selectedControls[hazardId]?.[type];
    if (!selected) return;

    const controlDescription = selected === 'custom' 
      ? customControls[hazardId]?.[type]
      : selected;

    if (!controlDescription?.trim()) return;

    setHazardsWithControls(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            additionalControls: {
              ...hazard.additionalControls,
              [type]: [...hazard.additionalControls[type], controlDescription.trim()],
            },
          };
        }
        return hazard;
      })
    );

    // Reset selections
    setSelectedControls(prev => ({
      ...prev,
      [hazardId]: { ...prev[hazardId], [type]: '' }
    }));
    setCustomControls(prev => ({
      ...prev,
      [hazardId]: { ...prev[hazardId], [type]: '' }
    }));
  };

  const removeControl = (hazardId: string, type: 'ac' | 'ec' | 'ppe', index: number) => {
    setHazardsWithControls(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          const updatedControls = [...hazard.additionalControls[type]];
          updatedControls.splice(index, 1);
          return {
            ...hazard,
            additionalControls: {
              ...hazard.additionalControls,
              [type]: updatedControls,
            },
          };
        }
        return hazard;
      })
    );
  };

  const handlePointPersonChange = (hazardId: string, value: string) => {
    setSelectedPointPerson(prev => ({
      ...prev,
      [hazardId]: value
    }));
  };

  const updatePointPerson = (hazardId: string) => {
    const selected = selectedPointPerson[hazardId];
    if (!selected) return;

    const person = selected === 'custom' 
      ? customPointPerson[hazardId]
      : selected;

    if (!person?.trim()) return;

    setHazardsWithControls(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            pointPerson: person.trim(),
          };
        }
        return hazard;
      })
    );

    setSelectedPointPerson(prev => ({ ...prev, [hazardId]: '' }));
    setCustomPointPerson(prev => ({ ...prev, [hazardId]: '' }));
  };

  const updateDueDate = (hazardId: string, date: string) => {
    setHazardsWithControls(prev =>
      prev.map(hazard => {
        if (hazard.id === hazardId) {
          return {
            ...hazard,
            dueDate: date,
          };
        }
        return hazard;
      })
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: 80 }]}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Additional Controls" onSettingsPress={() => {}} />
        
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.content}>
            {hazardsWithControls.map((hazard, index) => (
              <View key={hazard.id} style={styles.hazardSection}>
                <Text style={styles.hazardTitle}>Hazard {index + 1}</Text>
                <Text style={styles.hazardDescription}>{hazard.description}</Text>

                {/* Administrative Controls */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Administrative Controls</Text>
                  {hazard.additionalControls.ac.map((control, idx) => (
                    <View key={idx} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{control}</Text>
                      <TouchableOpacity 
                        onPress={() => removeControl(hazard.id, 'ac', idx)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <CustomDropdown
                    label="Add Administrative Control"
                    data={controlOptions.ac}
                    value={selectedControls[hazard.id]?.ac || ''}
                    onChange={(value) => handleControlChange(hazard.id, 'ac', value)}
                  />
                  
                  {selectedControls[hazard.id]?.ac === 'custom' && (
                    <TextInput
                      style={styles.input}
                      value={customControls[hazard.id]?.ac || ''}
                      onChangeText={(text) => setCustomControls(prev => ({
                        ...prev,
                        [hazard.id]: { ...prev[hazard.id], ac: text }
                      }))}
                      placeholder="Describe custom control"
                      multiline
                    />
                  )}
                  
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addControl(hazard.id, 'ac')}
                  >
                    <Text style={styles.addButtonText}>Add Control</Text>
                  </TouchableOpacity>
                </View>

                {/* Engineering Controls */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Engineering Controls</Text>
                  {hazard.additionalControls.ec.map((control, idx) => (
                    <View key={idx} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{control}</Text>
                      <TouchableOpacity 
                        onPress={() => removeControl(hazard.id, 'ec', idx)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <CustomDropdown
                    label="Add Engineering Control"
                    data={controlOptions.ec}
                    value={selectedControls[hazard.id]?.ec || ''}
                    onChange={(value) => handleControlChange(hazard.id, 'ec', value)}
                  />
                  
                  {selectedControls[hazard.id]?.ec === 'custom' && (
                    <TextInput
                      style={styles.input}
                      value={customControls[hazard.id]?.ec || ''}
                      onChangeText={(text) => setCustomControls(prev => ({
                        ...prev,
                        [hazard.id]: { ...prev[hazard.id], ec: text }
                      }))}
                      placeholder="Describe custom control"
                      multiline
                    />
                  )}
                  
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addControl(hazard.id, 'ec')}
                  >
                    <Text style={styles.addButtonText}>Add Control</Text>
                  </TouchableOpacity>
                </View>

                {/* PPE Controls */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>PPE Required</Text>
                  {hazard.additionalControls.ppe.map((control, idx) => (
                    <View key={idx} style={styles.itemContainer}>
                      <Text style={styles.itemText}>{control}</Text>
                      <TouchableOpacity 
                        onPress={() => removeControl(hazard.id, 'ppe', idx)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <CustomDropdown
                    label="Add PPE Requirement"
                    data={controlOptions.ppe}
                    value={selectedControls[hazard.id]?.ppe || ''}
                    onChange={(value) => handleControlChange(hazard.id, 'ppe', value)}
                  />
                  
                  {selectedControls[hazard.id]?.ppe === 'custom' && (
                    <TextInput
                      style={styles.input}
                      value={customControls[hazard.id]?.ppe || ''}
                      onChangeText={(text) => setCustomControls(prev => ({
                        ...prev,
                        [hazard.id]: { ...prev[hazard.id], ppe: text }
                      }))}
                      placeholder="Describe custom PPE"
                      multiline
                    />
                  )}
                  
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addControl(hazard.id, 'ppe')}
                  >
                    <Text style={styles.addButtonText}>Add Control</Text>
                  </TouchableOpacity>
                </View>

                {/* Point Person */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Point Person</Text>
                  {hazard.pointPerson && (
                    <View style={styles.itemContainer}>
                      <Text style={styles.itemText}>{hazard.pointPerson}</Text>
                      <TouchableOpacity 
                        onPress={() => setHazardsWithControls(prev =>
                          prev.map(h => h.id === hazard.id ? { ...h, pointPerson: '' } : h)
                        )}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <CustomDropdown
                    label="Select Point Person"
                    data={pointPersonOptions}
                    value={selectedPointPerson[hazard.id] || ''}
                    onChange={(value) => handlePointPersonChange(hazard.id, value.toString())}
                  />
                  
                  {selectedPointPerson[hazard.id] === 'custom' && (
                    <TextInput
                      style={styles.input}
                      value={customPointPerson[hazard.id] || ''}
                      onChangeText={(text) => setCustomPointPerson(prev => ({
                        ...prev,
                        [hazard.id]: text
                      }))}
                      placeholder="Enter point person name"
                    />
                  )}
                  
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => updatePointPerson(hazard.id)}
                  >
                    <Text style={styles.addButtonText}>Set Point Person</Text>
                  </TouchableOpacity>
                </View>

                {/* Due Date */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Due Date</Text>
                  <TextInput
                    style={styles.input}
                    value={hazard.dueDate}
                    onChangeText={(text) => updateDueDate(hazard.id, text)}
                    placeholder="Enter due date"
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <BottomNavigation
          onBack={() => router.push({
            pathname: '/add/risk-assessment',
            params: {
              activity,
              hazards: JSON.stringify(hazardsWithControls),
            }
          })}
          onNext={() => router.push({
            pathname: '/add/final-risk',
            params: {
              activity,
              hazards: JSON.stringify(hazardsWithControls),
            }
          })}
          nextDisabled={!hazardsWithControls.every(
            hazard => 
              hazard.pointPerson.trim() && 
              hazard.dueDate.trim() &&
              (hazard.additionalControls.ac.length > 0 ||
               hazard.additionalControls.ec.length > 0 ||
               hazard.additionalControls.ppe.length > 0)
          )}
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
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    marginBottom: 80,
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
    backgroundColor: '#1294D5',
    alignItems: 'center'
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
});
