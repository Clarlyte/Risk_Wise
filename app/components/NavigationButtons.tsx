import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface NavigationButtonsProps {
  onBack: () => void;
  onContinue: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function NavigationButtons({ 
  onBack, 
  onContinue, 
  isFirstStep,
  isLastStep 
}: NavigationButtonsProps) {
  return (
    <View style={styles.container}>
      {!isFirstStep && (
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={onContinue}
      >
        <Text style={[styles.buttonText, styles.primaryButtonText]}>
          {isLastStep ? 'Finish' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1294D5',
  },
  primaryButton: {
    backgroundColor: '#1294D5',
    marginLeft: 16,
  },
  buttonText: {
    color: '#1294D5',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
});
