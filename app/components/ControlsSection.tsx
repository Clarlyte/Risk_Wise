import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ControlsSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>CONTROLS</Text>
      <View style={styles.controlCount}>
        <Text style={styles.controlCountText}>1</Text>
      </View>
      <View style={styles.controlGraph}>
        {/* Implement control distribution graph here */}
        <Text>Control Distribution Graph Placeholder</Text>
      </View>
      <Text style={styles.controlDistributionLabel}>Insufficient Control Distribution</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  controlCount: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  controlCountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  controlGraph: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  controlDistributionLabel: {
    textAlign: 'center',
    color: 'red',
    marginTop: 8,
  },
});
