import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function InputFlowScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    activity: '',
    hazards: '',
    initialRisk: '',
    controlMeasures: '',
    finalRisk: '',
  });

  const steps = [
    { title: 'Activity Details', field: 'activity' },
    { title: 'Identify Hazards', field: 'hazards' },
    { title: 'Initial Risk Assessment', field: 'initialRisk' },
    { title: 'Control Measures', field: 'controlMeasures' },
    { title: 'Final Risk Assessment', field: 'finalRisk' },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Generate PDF and save to local storage
      // This is a placeholder for the actual PDF generation and storage logic
      console.log('Generating PDF with data:', formData);
      router.push('/records');
    }
  };

  const handleInputChange = (text: string) => {
    setFormData({ ...formData, [steps[step].field]: text });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: steps[step].title }} />
      <Text style={styles.stepTitle}>{steps[step].title}</Text>
      <TextInput
        style={styles.input}
        onChangeText={handleInputChange}
        value={formData[steps[step].field as keyof typeof formData]}
        multiline
      />
      <Button
        title={step === steps.length - 1 ? 'Finish' : 'Next'}
        onPress={handleNext}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
  },
});
