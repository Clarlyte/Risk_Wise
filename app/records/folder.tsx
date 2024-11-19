import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
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
  const [isShareInputVisible, setIsShareInputVisible] = useState(false);
  const [shareId, setShareId] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isProcessingShare, setIsProcessingShare] = useState(false);

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

      // Create a more practical sharing message
      const shareMessage = 
        `RiskWise Assessment Share\n\n` +
        `Assessment Name: ${assessment.name}\n` +
        `Activity: ${assessment.activity}\n` +
        `Date: ${new Date(assessment.date).toLocaleDateString()}\n\n` +
        `To access this assessment in RiskWise app:\n\n` +
        `1. Open RiskWise app\n` +
        `2. Go to "Shared With Me" section\n` +
        `3. Enter these details:\n\n` +
        `Share ID: ${shareId}\n` +
        `Encryption Key: ${encryptionKey}\n\n` +
        `Note: This share will expire in 7 days.`;

      // Show share dialog
      const result = await Share.share({
        message: shareMessage,
        title: `${assessment.name} Assessment`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Successfully shared assessment');
        Alert.alert('Success', 'Assessment shared successfully');
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

  const handleAccessShared = async () => {
    if (!shareId.trim() || !encryptionKey.trim()) {
      Alert.alert('Error', 'Please enter both Share ID and Encryption Key');
      return;
    }

    setIsProcessingShare(true);
    try {
      // Download the shared assessment
      const assessment = await storage.getSharedAssessment(
        shareId.trim(),
        encryptionKey.trim()
      );

      if (!assessment) {
        throw new Error('Assessment not found or expired');
      }

      // Modify the assessment to be in the current folder
      const modifiedAssessment = {
        ...assessment,
        folderId: String(folderId).trim()
      };

      // Save the assessment
      await storage.saveAssessment(modifiedAssessment);

      // Clear inputs and close modal
      setShareId('');
      setEncryptionKey('');
      setIsShareInputVisible(false);

      // Reload assessments
      await loadAssessments();

      Alert.alert('Success', 'Assessment added to folder successfully');
    } catch (error) {
      console.error('Error accessing shared assessment:', error);
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'Failed to access shared assessment'
      );
    } finally {
      setIsProcessingShare(false);
    }
  };

  const handleDelete = async (assessment: Assessment) => {
    Alert.alert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.deleteAssessment(assessment.id);
              await loadAssessments(); // Refresh the list
              Alert.alert('Success', 'Assessment deleted successfully');
            } catch (error) {
              console.error('Error deleting assessment:', error);
              Alert.alert('Error', 'Failed to delete assessment');
            }
          }
        }
      ]
    );
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
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <FontAwesome5 name="trash-alt" size={20} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
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
            contentContainerStyle={styles.listContent}
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

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setIsShareInputVisible(true)}
        >
          <FontAwesome5 name="folder-plus" size={24} color="white" />
        </TouchableOpacity>

        <Modal
          visible={isShareInputVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsShareInputVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Access Shared Assessment</Text>
              <Text style={styles.modalDescription}>
                Enter the Share ID and Encryption Key to add the assessment to this folder.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Share ID</Text>
                <TextInput
                  style={styles.input}
                  value={shareId}
                  onChangeText={setShareId}
                  placeholder="Enter Share ID"
                  placeholderTextColor="#666"
                  editable={!isProcessingShare}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Encryption Key</Text>
                <TextInput
                  style={styles.input}
                  value={encryptionKey}
                  onChangeText={setEncryptionKey}
                  placeholder="Enter Encryption Key"
                  placeholderTextColor="#666"
                  editable={!isProcessingShare}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsShareInputVisible(false)}
                  disabled={isProcessingShare}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.accessButton,
                    (!shareId.trim() || !encryptionKey.trim() || isProcessingShare) && 
                    styles.disabledButton
                  ]}
                  onPress={handleAccessShared}
                  disabled={!shareId.trim() || !encryptionKey.trim() || isProcessingShare}
                >
                  {isProcessingShare ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Add to Folder</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  listContent: {
    paddingBottom: 120,
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
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#FC7524',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  accessButton: {
    backgroundColor: '#1294D5',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#FF3B30', // Red color for delete button
  },
}); 