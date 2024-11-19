import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ControlsSection } from './components/ControlsSection';
import { HazardsSection } from './components/HazardsSection';
import { Assessment } from './types/pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Use useFocusEffect instead of useEffect to reload when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadAssessments = async () => {
        try {
          console.log('Loading assessments in dashboard...');
          const stored = await AsyncStorage.getItem('assessments');
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log('Loaded assessments:', parsed.length);
            setAssessments(parsed);
          }
        } catch (error) {
          console.error('Error loading assessments:', error);
        }
      };
      loadAssessments();
    }, [])
  );

  // Filter assessments based on search
  const filteredAssessments = assessments.filter(assessment =>
    assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
    if (query.length === 0) {
      setSelectedAssessment(null);
    }
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowSearchResults(false);
    setSearchQuery(assessment.name);
  };

  const renderSearchResult = ({ item }: { item: Assessment }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => handleSelectAssessment(item)}
    >
      <FontAwesome5 name="file-alt" size={20} color="#1294D5" />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultTitle}>{item.name}</Text>
        <Text style={styles.searchResultSubtitle}>{item.activity}</Text>
        <Text style={styles.searchResultDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Dashboard" onSettingsPress={() => {}} />
        
        {/* Search Section - Keep outside ScrollView */}
        <View style={styles.searchSection}>
          <SearchBar 
            value={searchQuery} 
            onChangeText={handleSearch}
            placeholder="Search assessments..."
          />
          {selectedAssessment && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSelectedAssessment(null);
                setSearchQuery('');
              }}
            >
              <FontAwesome5 name="times-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results - Keep outside ScrollView */}
        {showSearchResults && (
          <View style={styles.searchResults}>
            <FlatList
              data={filteredAssessments}
              renderItem={renderSearchResult}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <Text style={styles.noResults}>No assessments found</Text>
              }
            />
          </View>
        )}

        {/* Assessment Data */}
        {!showSearchResults && (
          <View style={styles.contentWrapper}>
            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={true}
            >
              {selectedAssessment ? (
                <>
                  <View style={styles.selectedAssessmentHeader}>
                    <Text style={styles.selectedAssessmentName}>
                      {selectedAssessment.name}
                    </Text>
                    <Text style={styles.selectedAssessmentActivity}>
                      {selectedAssessment.activity}
                    </Text>
                  </View>

                  <ControlsSection selectedAssessment={selectedAssessment} />
                  <HazardsSection 
                    selectedAssessment={selectedAssessment} 
                    searchQuery={searchQuery}
                  />
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <FontAwesome5 name="search" size={50} color="#ddd" />
                  <Text style={styles.placeholderTitle}>
                    Welcome to RiskWise Dashboard
                  </Text>
                  <Text style={styles.placeholderText}>
                    Search for an assessment to view detailed analysis and controls
                  </Text>
                  <View style={styles.placeholderFeatures}>
                    <View style={styles.featureItem}>
                      <FontAwesome5 name="chart-bar" size={24} color="#1294D5" />
                      <Text style={styles.featureText}>Control Distribution</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <FontAwesome5 name="exclamation-triangle" size={24} color="#FC7524" />
                      <Text style={styles.featureText}>Hazard Analysis</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <FontAwesome5 name="shield-alt" size={24} color="#4CAF50" />
                      <Text style={styles.featureText}>Risk Assessment</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
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
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  searchResults: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    maxHeight: '50%',
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchResultDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  contentWrapper: {
    flex: 1, // This ensures the wrapper takes remaining space
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20, // Add padding at the bottom
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  placeholderFeatures: {
    width: '100%',
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  selectedAssessmentHeader: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#1294D5',
  },
  selectedAssessmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedAssessmentActivity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
