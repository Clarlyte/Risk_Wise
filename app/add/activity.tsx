import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { StepNavigationButtons } from '../components/StepNavigationButtons';

export default function ActivityScreen() {
  const router = useRouter();
  const [activity, setActivity] = useState('');

  const handleContinue = () => {
    if (!activity.trim()) return;
    
    router.push({
      pathname: '/add/hazards',
      params: { 
        activity: activity.trim()
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Work Activity" onSettingsPress={() => {}} />
        
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

        <StepNavigationButtons
          onContinue={handleContinue}
          isFirstStep
          continueDisabled={!activity.trim()}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
});
