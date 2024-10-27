import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Hazard {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  riskLevel: 'high' | 'medium' | 'low';
}

const mockHazards: Hazard[] = [
  { id: '1', title: 'Electrical Hazard', description: 'Exposed wiring in break room', timestamp: '9:41 AM', riskLevel: 'high' },
  { id: '2', title: 'Slip Hazard', description: 'Wet floor in lobby', timestamp: '10:15 AM', riskLevel: 'medium' },
  { id: '3', title: 'Chemical Spill', description: 'Small spill in lab area', timestamp: '11:30 AM', riskLevel: 'low' },
];

interface HazardsSectionProps {
  searchQuery: string;
}

export function HazardsSection({ searchQuery }: HazardsSectionProps) {
  const [riskType, setRiskType] = useState('All');

  const filteredHazards = mockHazards.filter(hazard => 
    hazard.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (riskType === 'All' || hazard.riskLevel === riskType.toLowerCase())
  );

  const renderHazardItem = ({ item }: { item: Hazard }) => (
    <TouchableOpacity style={styles.hazardItem} onPress={() => console.log('Hazard details')}>
      <View style={styles.hazardIcon} />
      <View style={styles.hazardInfo}>
        <Text style={styles.hazardTitle}>{item.title}</Text>
        <Text style={styles.hazardDescription}>{item.description}</Text>
        <Text style={styles.hazardTimestamp}>{item.timestamp}</Text>
      </View>
      <View style={[styles.riskIndicator, styles[`risk${item.riskLevel}`]]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>HAZARDS</Text>
      <TouchableOpacity style={styles.riskTypeDropdown} onPress={() => console.log('Open risk type dropdown')}>
        <Text>Risk Type: {riskType}</Text>
        <FontAwesome name="chevron-down" size={16} color="black" />
      </TouchableOpacity>
      <FlatList
        data={filteredHazards}
        renderItem={renderHazardItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  riskTypeDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  hazardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hazardIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#ccc',
    borderRadius: 20,
    marginRight: 12,
  },
  hazardInfo: {
    flex: 1,
  },
  hazardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hazardDescription: {
    fontSize: 14,
    color: '#666',
  },
  hazardTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  riskIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  riskhigh: {
    backgroundColor: 'red',
  },
  riskmedium: {
    backgroundColor: 'orange',
  },
  risklow: {
    backgroundColor: 'green',
  },
});
