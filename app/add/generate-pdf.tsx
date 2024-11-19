import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { CustomDropdown } from '../components/CustomDropdown';
import { FolderNameDialog } from '../components/FolderNameDialog';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFolders } from '../contexts/FolderContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { generatePDFContent } from '../utils/pdfGenerator';
import { inputStyles } from '../styles/input-styles';
import { Assessment } from '../types/pdf';
import * as FileSystem from 'expo-file-system';
import { useStorage } from '../contexts/storage-context';

export default function GeneratePDFScreen() {
  const router = useRouter();
  const { resetAssessment } = useAssessment();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const [assessmentName, setAssessmentName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const { folders, addFolder, loadFolders } = useFolders();
  const [isAddFolderVisible, setIsAddFolderVisible] = useState(false);
  const { tempAssessment } = useAssessment();
  const [isSaving, setIsSaving] = useState(false);
  const storage = useStorage();

  useFocusEffect(
    React.useCallback(() => {
      loadFolders();
    }, [loadFolders])
  );

  useEffect(() => {
    if (selectedFolderId && !folders.some(f => f.id === selectedFolderId)) {
      setSelectedFolderId('');
    }
  }, [folders, selectedFolderId]);

  const handleAddFolder = async (name: string) => {
    const newFolder = await addFolder(name);
    setSelectedFolderId(newFolder.id);
  };

  const saveAssessment = async () => {
    if (!assessmentName.trim() || !selectedFolderId || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const tempData = await AsyncStorage.getItem('tempAssessment');
      if (!tempData) {
        Alert.alert('Error', 'Assessment data not found');
        return;
      }

      const assessmentData = JSON.parse(tempData);
      const assessment: Assessment = {
        id: Date.now().toString(),
        name: assessmentName.trim(),
        date: new Date().toISOString(),
        activity: assessmentData.activity,
        hazards: assessmentData.hazardsWithFinalRisk || [],
        folderId: String(selectedFolderId).trim(),
      };

      // Generate and save PDF
      const pdfPath = await generatePDFContent(assessment);
      
      // Save assessment using storage service
      await storage.saveAssessment({ 
        ...assessment, 
        htmlPath: pdfPath 
      });

      // Clear temp data
      await AsyncStorage.removeItem('tempAssessment');
      await resetAssessment();
      
      setAssessmentName('');
      setSelectedFolderId('');

      setTimeout(() => {
        router.push({
          pathname: '/records/folder',
          params: {
            folderId: selectedFolderId,
            folderName: folders.find(f => f.id === selectedFolderId)?.name,
            refresh: Date.now().toString()
          }
        });
      }, 100);

      Alert.alert('Success', 'Assessment saved successfully');
    } catch (error) {
      console.error('Error saving assessment:', error);
      Alert.alert(
        'Error', 
        error instanceof Error 
          ? error.message 
          : 'Failed to save assessment'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[inputStyles.safeArea, { paddingBottom: 80 }]}>
      <View style={inputStyles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Save Assessment" onSettingsPress={() => {}} />

        <View style={inputStyles.content}>
          <Text style={inputStyles.label}>Assessment Name</Text>
          <TextInput
            style={inputStyles.input}
            value={assessmentName}
            onChangeText={setAssessmentName}
            placeholder="Enter assessment name"
          />
          <CustomDropdown
            label="Select folder"
            data={[
              ...folders.map(folder => ({
                label: folder.name,
                value: folder.id,
              })),
              { label: 'Create New Folder', value: 'new' },
            ]}
            value={selectedFolderId}
            onChange={(value) => {
              if (value === 'new') {
                setIsAddFolderVisible(true);
              } else {
                setSelectedFolderId(value.toString());
              }
            }}
          />

          <TouchableOpacity 
            style={[
              inputStyles.createButton,
              ((!assessmentName.trim() || !selectedFolderId) || isSaving) && inputStyles.createButtonDisabled
            ]}
            onPress={saveAssessment}
            disabled={!assessmentName.trim() || !selectedFolderId || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <FontAwesome5 name="save" size={20} color="white" />
                <Text style={inputStyles.createButtonText}>Create Assessment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <FolderNameDialog
          visible={isAddFolderVisible}
          onClose={() => setIsAddFolderVisible(false)}
          onSubmit={handleAddFolder}
          title="New Folder"
        />

        <BottomNavigation
          onBack={() => router.push({
            pathname: '/add/final-risk',
            params: { activity, hazards: hazardsParam }
          })}
        />
      </View>
    </SafeAreaView>
  );
} 