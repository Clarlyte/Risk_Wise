import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { NavigationButtons } from '../components/NavigationButtons';

export default function AddScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/add/activity');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'New Assessment' }} />
      <NavigationButtons
        onBack={() => router.back()}
        onContinue={handleStart}
        isFirstStep
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
