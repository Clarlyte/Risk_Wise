import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { NavigationButtons } from '../components/NavigationButtons';
import { WorkActivity } from '../types/risk';

export default function ActivityScreen() {
  const router = useRouter();
  const [activity, setActivity] = useState<string>('');

  const handleContinue = () => {
    if (!activity.trim()) return;

    const workActivity: WorkActivity = {
      id: Date.now().toString(),
      description: activity.trim(),
      hazards: [],
    };

    router.push({
      pathname: '/add/hazards',
      params: { activity: JSON.stringify(workActivity) }
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Work Activity' }} />
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Describe the work activity"
          value={activity}
          onChangeText={setActivity}
          multiline
          numberOfLines={4}
        />
      </View>
      <NavigationButtons
        onBack={() => router.back()}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
