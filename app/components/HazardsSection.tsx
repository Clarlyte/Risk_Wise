import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Assessment } from '../types/pdf';
import { HazardWithFinalRisk } from '../types/hazard';
import { getRiskLevel } from '../types/risk';

interface HazardsSectionProps {
  searchQuery: string;
  selectedAssessment: Assessment | null;
}

export function HazardsSection({ searchQuery, selectedAssessment }: HazardsSectionProps) {
  const [riskType, setRiskType] = useState('All');

  console.log('Selected Assessment:', selectedAssessment);
  console.log('Hazards:', selectedAssessment?.hazards);

  if (!selectedAssessment) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>HAZARDS</Text>
        <Text style={styles.noDataText}>Select an assessment to view hazards</Text>
      </View>
    );
  }

  // Sort hazards by final risk score (descending)
  const sortedHazards = selectedAssessment.hazards ? [...selectedAssessment.hazards].sort(
    (a: HazardWithFinalRisk, b: HazardWithFinalRisk) => b.finalRiskScore - a.finalRiskScore
  ) : [];

  console.log('Sorted Hazards:', sortedHazards);

  // Simplified filtering logic - just filter by risk type
  const filteredHazards = sortedHazards.filter((hazard: HazardWithFinalRisk) => {
    if (riskType === 'All') {
      return true; // Show all hazards when 'All' is selected
    }

    const score = hazard.finalRiskScore;
    switch (riskType) {
      case 'High':
        return score >= 15;
      case 'Medium':
        return score >= 7 && score <= 14;
      case 'Low':
        return score <= 6;
      default:
        return true;
    }
  });

  console.log('Risk Type:', riskType);
  console.log('Filtered Hazards:', filteredHazards);

  // Add the renderHazardItem function
  const renderHazardItem = ({ item }: { item: HazardWithFinalRisk }) => {
    const riskLevel = getRiskLevel(item.finalRiskScore);
    return (
      <View style={styles.hazardItem}>
        <View style={styles.hazardHeader}>
          <Text style={styles.hazardTitle}>{item.description}</Text>
          <View style={[styles.riskIndicator, { backgroundColor: riskLevel.color }]} />
        </View>
        
        <View style={styles.riskScores}>
          <View style={styles.riskScoreItem}>
            <Text style={styles.riskScoreLabel}>Initial Risk:</Text>
            <Text style={styles.riskScoreValue}>{item.riskScore}</Text>
          </View>
          <View style={styles.riskScoreItem}>
            <Text style={styles.riskScoreLabel}>Final Risk:</Text>
            <Text style={styles.riskScoreValue}>{item.finalRiskScore}</Text>
          </View>
          <View style={styles.riskScoreItem}>
            <Text style={styles.riskScoreLabel}>Risk Level:</Text>
            <Text style={[
              styles.riskScoreValue, 
              { color: riskLevel.color }
            ]}>{riskLevel.level}</Text>
          </View>
        </View>

        <View style={styles.controlsList}>
          {item.additionalControls.ec.length > 0 && (
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>EC:</Text>
              <Text style={styles.controlText}>
                {item.additionalControls.ec.join(', ')}
              </Text>
            </View>
          )}
          {item.additionalControls.ac.length > 0 && (
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>AC:</Text>
              <Text style={styles.controlText}>
                {item.additionalControls.ac.join(', ')}
              </Text>
            </View>
          )}
          {item.additionalControls.ppe.length > 0 && (
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>PPE:</Text>
              <Text style={styles.controlText}>
                {item.additionalControls.ppe.join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.hazardFooter}>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerLabel}>Owner:</Text>
            <Text style={styles.ownerText}>{item.pointPerson}</Text>
          </View>
          <View style={styles.dueInfo}>
            <Text style={styles.dueLabel}>Due:</Text>
            <Text style={styles.dueText}>{item.dueDate}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Also fix the VirtualizedList nesting error by using a ScrollView instead of FlatList
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>HAZARDS</Text>
      
      <View style={styles.filterContainer}>
        {['All', 'High', 'Medium', 'Low'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              riskType === type && styles.filterButtonActive
            ]}
            onPress={() => setRiskType(type)}
          >
            <Text style={[
              styles.filterButtonText,
              riskType === type && styles.filterButtonTextActive
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.hazardsList} contentContainerStyle={styles.hazardsContent}>
        {filteredHazards.length > 0 ? (
          filteredHazards.map((hazard) => (
            <View key={hazard.id}>
              {renderHazardItem({ item: hazard })}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No hazards found</Text>
        )}
      </ScrollView>
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
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#1294D5',
  },
  filterButtonText: {
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  hazardItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  hazardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hazardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  riskScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  riskScoreItem: {
    alignItems: 'center',
  },
  riskScoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  riskScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  controlsList: {
    marginVertical: 12,
  },
  controlItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 45,
  },
  controlText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  hazardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  ownerText: {
    fontSize: 12,
    color: '#333',
  },
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  dueText: {
    fontSize: 12,
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  hazardsList: {
    flex: 1,
  },
  hazardsContent: {
    paddingBottom: 150,
  },
});
