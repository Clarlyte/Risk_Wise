import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Assessment } from '../types/pdf';
import * as FileSystem from 'expo-file-system';

export default function FolderScreen() {
  const router = useRouter();
  const { folderId, folderName } = useLocalSearchParams();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAssessments = useCallback(async () => {
    if (!folderId) return;
    
    try {
      setIsLoading(true);
      const storedAssessments = await AsyncStorage.getItem('assessments');
      
      if (storedAssessments) {
        const allAssessments: Assessment[] = JSON.parse(storedAssessments);
        
        // Ensure we're comparing strings and they're exactly equal
        const currentFolderId = String(folderId).trim();
        const folderAssessments = allAssessments.filter(assessment => 
          String(assessment.folderId).trim() === currentFolderId
        );
        
        console.log('Current folder ID:', currentFolderId);
        console.log('Found assessments for folder:', folderAssessments.length);
        
        setAssessments(folderAssessments);
      } else {
        setAssessments([]);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  // Load assessments when the folder ID changes
  useEffect(() => {
    loadAssessments();
  }, [loadAssessments, folderId]);

  // Filter assessments based on search query
  const filteredAssessments = assessments.filter(assessment =>
    assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAssessmentItem = ({ item }: { item: Assessment }) => (
    <View style={styles.assessmentItem}>
      <View style={styles.assessmentHeader}>
        <Text style={styles.assessmentName}>{item.name}</Text>
        <Text style={styles.assessmentDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.assessmentActivity}>Activity: {item.activity}</Text>
      <View style={styles.assessmentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewPDF(item)}
        >
          <FontAwesome5 name="file-pdf" size={20} color="#1294D5" />
          <Text style={styles.actionButtonText}>View PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="share-alt" size={20} color="#1294D5" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleBack = () => {
    router.push('/records'); // This will navigate directly to the records screen
  };

  const handleViewPDF = async (item: Assessment) => {
    if (!item.htmlPath) {
      Alert.alert('Error', 'File path not found');
      return;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(item.htmlPath);
      console.log('File info:', fileInfo); // Add this for debugging
      if (!fileInfo.exists) {
        Alert.alert('Error', 'File not found');
        return;
      }

      router.push({
        pathname: '/records/view-pdf',
        params: { 
          assessmentId: item.id,
          assessmentName: item.name
        }
      });
    } catch (error) {
      console.error('Error checking file:', error);
      Alert.alert('Error', 'Unable to access file');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <Header 
          title={folderName as string}
          onBackPress={handleBack}
          onSettingsPress={() => {}}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FC7524" />
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={filteredAssessments}
            renderItem={renderAssessmentItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No matching assessments found'
                  : 'No assessments in this folder'}
              </Text>
            }
          />
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
  list: {
    flex: 1,
    backgroundColor: '#F2F1F9',
  },
  assessmentItem: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assessmentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  assessmentDate: {
    color: '#666',
  },
  assessmentActivity: {
    color: '#333',
    marginBottom: 12,
  },
  assessmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#1294D5',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 