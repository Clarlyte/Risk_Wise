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
import { generateExcelFile } from '../utils/excelGenerator';
import { useStorage } from '../contexts/storage-context';
import { Share } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { StorageAccessFramework } from 'expo-file-system';

export default function FolderScreen() {
  const router = useRouter();
  const { folderId, folderName } = useLocalSearchParams();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const storage = useStorage();
  const [sharingId, setSharingId] = useState<string | null>(null);

  const loadAssessments = useCallback(async () => {
    if (!folderId) return;
    
    try {
      setIsLoading(true);
      const storedAssessments = await AsyncStorage.getItem('assessments');
      
      if (storedAssessments) {
        const allAssessments: Assessment[] = JSON.parse(storedAssessments);
        
        // Add validation
        if (!Array.isArray(allAssessments)) {
          console.error('Invalid assessments data');
          setAssessments([]);
          return;
        }

        // Limit the number of assessments if needed
        if (allAssessments.length > 1000) {
          console.warn('Too many assessments, truncating...');
          await AsyncStorage.setItem('assessments', JSON.stringify(allAssessments.slice(-1000)));
        }
        
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

  const handleDownloadExcel = async (assessment: Assessment) => {
    try {
      // Show loading indicator
      Alert.alert('Downloading...', 'Please wait while we generate your file');

      console.log('Starting Excel file generation...');
      const filePath = await generateExcelFile(assessment);
      console.log('Excel file generated at:', filePath);

      try {
        // Get file content
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        
        // Get permission and save file using SAF
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          // Generate file name
          const fileName = `RiskWise_${assessment.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;
          
          // Save file
          const uri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'text/csv'
          );
          
          await FileSystem.writeAsStringAsync(uri, fileContent, {
            encoding: FileSystem.EncodingType.UTF8,
          });

          Alert.alert(
            'Success',
            'Excel file downloaded successfully. You can find it in your selected folder.',
            [{ text: 'OK' }]
          );
        } else {
          throw new Error('Storage permission not granted');
        }
      } catch (error) {
        console.error('Error saving file:', error);
        // Fallback to sharing if saving fails
        await Share.share({
          url: filePath,
          title: `${assessment.name} - Excel Export`,
        });
      } finally {
        // Clean up temp file
        await FileSystem.deleteAsync(filePath, { idempotent: true }).catch(() => {});
      }

    } catch (error) {
      console.error('Error downloading excel:', error);
      Alert.alert('Error', 'Failed to download Excel file');
    }
  };

  const handleShare = async (assessment: Assessment) => {
    console.log('Sharing assessment:', assessment.id);
    setSharingId(assessment.id);
    
    try {
      const { shareId, encryptionKey } = await storage.createShareableAssessment(
        assessment,
        7 // 7 days expiry
      );

      // Create sharing message with links
      const shareMessage = 
        `RiskWise Assessment: ${assessment.name}\n\n` +
        `View Assessment:\n` +
        `https://riskwise.app/shared/${shareId}/view\n\n` +
        `Download Assessment:\n` +
        `https://riskwise.app/shared/${shareId}/download\n\n` +
        `Encryption Key: ${encryptionKey}\n\n` +
        `Note: These links will expire in 7 days.`;

      // Show share dialog
      const result = await Share.share({
        message: shareMessage,
        title: `${assessment.name} Assessment`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Successfully shared assessment');
      }
    } catch (error) {
      console.error('Error sharing assessment:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to share assessment'
      );
    } finally {
      setSharingId(null);
    }
  };

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
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadExcel(item)}
        >
          <FontAwesome5 name="file-excel" size={20} color="#1294D5" />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, sharingId === item.id && styles.actionButtonDisabled]}
          onPress={() => handleShare(item)}
          disabled={sharingId === item.id}
        >
          {sharingId === item.id ? (
            <ActivityIndicator size="small" color="#1294D5" />
          ) : (
            <>
              <FontAwesome5 name="share-alt" size={20} color="#1294D5" />
              <Text style={styles.actionButtonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    color: '#1294D5',
    fontSize: 13,
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
  actionButtonDisabled: {
    opacity: 0.5,
  },
}); 