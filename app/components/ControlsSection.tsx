import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Assessment } from '../types/pdf';
import { HazardWithFinalRisk } from '../types/hazard';

interface ControlsSectionProps {
  selectedAssessment: Assessment | null;
}

export function ControlsSection({ selectedAssessment }: ControlsSectionProps) {
  if (!selectedAssessment) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>CONTROLS</Text>
        <Text style={styles.noDataText}>Select an assessment to view controls</Text>
      </View>
    );
  }

  // Calculate control counts
  const controlCounts = selectedAssessment.hazards.reduce(
    (acc, hazard: HazardWithFinalRisk) => {
      acc.ec += hazard.additionalControls.ec.length;
      acc.ac += hazard.additionalControls.ac.length;
      acc.ppe += hazard.additionalControls.ppe.length;
      return acc;
    },
    { ec: 0, ac: 0, ppe: 0 }
  );

  const totalControls = controlCounts.ec + controlCounts.ac + controlCounts.ppe;

  // Calculate percentages for the bar graph
  const maxCount = Math.max(controlCounts.ec, controlCounts.ac, controlCounts.ppe);
  const getBarWidth = (count: number) => (count / maxCount) * 100;

  // Analyze control distribution
  const getDistributionAnalysis = () => {
    if (totalControls === 0) return 'No controls implemented';
    
    const ecPercentage = (controlCounts.ec / totalControls) * 100;
    const acPercentage = (controlCounts.ac / totalControls) * 100;
    const ppePercentage = (controlCounts.ppe / totalControls) * 100;

    if (ecPercentage < 20) {
      return 'Insufficient Engineering Controls - Consider more permanent solutions';
    } else if (ppePercentage > 50) {
      return 'Heavy reliance on PPE - Consider more engineering controls';
    } else if (acPercentage > 60) {
      return 'High administrative control usage - Consider more engineering solutions';
    }
    return 'Balanced control distribution';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>CONTROLS</Text>
      
      {/* Total Controls Circle */}
      <View style={styles.controlCount}>
        <Text style={styles.controlCountText}>{totalControls}</Text>
        <Text style={styles.controlCountLabel}>Total Controls</Text>
      </View>

      {/* Control Distribution Graph */}
      <View style={styles.graphContainer}>
        <View style={styles.barGroup}>
          <Text style={styles.barLabel}>EC</Text>
          <View style={styles.barBackground}>
            <View style={[styles.bar, styles.ecBar, { width: `${getBarWidth(controlCounts.ec)}%` }]} />
          </View>
          <Text style={styles.barCount}>{controlCounts.ec}</Text>
        </View>

        <View style={styles.barGroup}>
          <Text style={styles.barLabel}>AC</Text>
          <View style={styles.barBackground}>
            <View style={[styles.bar, styles.acBar, { width: `${getBarWidth(controlCounts.ac)}%` }]} />
          </View>
          <Text style={styles.barCount}>{controlCounts.ac}</Text>
        </View>

        <View style={styles.barGroup}>
          <Text style={styles.barLabel}>PPE</Text>
          <View style={styles.barBackground}>
            <View style={[styles.bar, styles.ppeBar, { width: `${getBarWidth(controlCounts.ppe)}%` }]} />
          </View>
          <Text style={styles.barCount}>{controlCounts.ppe}</Text>
        </View>
      </View>

      <Text style={[
        styles.analysisText,
        totalControls === 0 ? styles.analysisWarning : styles.analysisNormal
      ]}>
        {getDistributionAnalysis()}
      </Text>
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
    marginBottom: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  controlCount: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1294D5',
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
  controlCountLabel: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
  graphContainer: {
    marginVertical: 16,
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  barLabel: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
  },
  barBackground: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  ecBar: {
    backgroundColor: '#4CAF50',
  },
  acBar: {
    backgroundColor: '#FFC107',
  },
  ppeBar: {
    backgroundColor: '#FF5722',
  },
  barCount: {
    width: 30,
    textAlign: 'right',
    fontSize: 14,
  },
  analysisText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  analysisWarning: {
    color: '#FF3B30',
  },
  analysisNormal: {
    color: '#666',
  },
});
