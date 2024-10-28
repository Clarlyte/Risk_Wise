import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { StepNavigationButtons } from '../components/StepNavigationButtons';
import { HazardInput } from '../components/HazardInput';

interface Hazard {
  id: string;
  description: string;
  images: string[];
}

export default function HazardsScreen() {
  const router = useRouter();
  const { activity } = useLocalSearchParams();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHazard = ({ description, images }: { description: string; images: string[] }) => {
    const newHazard: Hazard = {
      id: Date.now().toString(),
      description,
      images,
    };
    setHazards([...hazards, newHazard]);
    setIsAdding(false);
  };

  const handleContinue = () => {
    if (hazards.length === 0) return;
    
    router.push({
      pathname: '/add/effects',
      params: {
        activity,
        hazards: JSON.stringify(hazards),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Identify Hazards" onSettingsPress={() => {}} />
        
        <ScrollView style={styles.content}>
          {hazards.map((hazard) => (
            <View key={hazard.id} style={styles.hazardItem}>
              <Text style={styles.hazardText}>{hazard.description}</Text>
              {hazard.images.length > 0 && (
                <Text style={styles.imagesText}>
                  {hazard.images.length} photo(s) attached
                </Text>
              )}
            </View>
          ))}

          {isAdding ? (
            <HazardInput
              onSave={handleAddHazard}
              onCancel={() => setIsAdding(false)}
            />
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsAdding(true)}
            >
              <FontAwesome5 name="plus" size={16} color="#1294D5" />
              <Text style={styles.addButtonText}>Add Hazard</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <StepNavigationButtons
          onBack={() => router.back()}
          onContinue={handleContinue}
          continueDisabled={hazards.length === 0}
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
  hazardItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  hazardText: {
    fontSize: 16,
    marginBottom: 8,
  },
  imagesText: {
    color: '#666',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#1294D5',
  },
  addButtonText: {
    marginLeft: 8,
    color: '#1294D5',
    fontSize: 16,
    fontWeight: '600',
  },
});
