import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface StepNavigationButtonsProps {
  onBack?: () => void;
  onContinue: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  continueDisabled?: boolean;
}

export function StepNavigationButtons({
  onBack,
  onContinue,
  isFirstStep = false,
  isLastStep = false,
  continueDisabled = false,
}: StepNavigationButtonsProps) {
  return (
    <View style={styles.container}>
      {!isFirstStep && (
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={[
          styles.button, 
          styles.continueButton,
          continueDisabled && styles.disabledButton
        ]} 
        onPress={onContinue}
        disabled={continueDisabled}
      >
        <Text style={styles.continueButtonText}>
          {isLastStep ? 'Generate Report' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#1294D5',
  },
  continueButton: {
    backgroundColor: '#1294D5',
    marginLeft: 'auto',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  backButtonText: {
    color: '#1294D5',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
