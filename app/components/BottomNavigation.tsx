import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface BottomNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextIcon?: string;
}

export function BottomNavigation({ onBack, onNext, nextDisabled, nextLabel, nextIcon }: BottomNavigationProps) {
  return (
    <View style={styles.navigationContainer}>
      {onBack && (
        <TouchableOpacity 
          style={[styles.navigationButton, styles.backButton]} 
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={[
          styles.navigationButton, 
          styles.nextButton,
          nextDisabled && styles.disabledButton
        ]} 
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Text style={styles.nextButtonText}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navigationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FC7524',
  },
  nextButton: {
    backgroundColor: '#FC7524',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  backButtonText: {
    color: '#FC7524',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 