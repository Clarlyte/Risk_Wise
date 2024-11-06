import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
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

interface Folder {
  id: string;
  name: string;
}

interface Assessment {
  id: string;
  name: string;
  date: string;
  activity: string;
  hazards: any[];
  folderId: string;
  pdfPath?: string;
}

export default function GeneratePDFScreen() {
  const router = useRouter();
  const { resetAssessment } = useAssessment();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const [assessmentName, setAssessmentName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const { folders, addFolder, loadFolders } = useFolders();
  const [isAddFolderVisible, setIsAddFolderVisible] = useState(false);
  const { tempAssessment } = useAssessment();

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
    if (!assessmentName.trim() || !selectedFolderId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

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
        folderId: String(selectedFolderId),
      };

      // Generate PDF
      const pdfPath = await generatePDFContent(assessment);
      
      // Save to permanent storage
      const storedAssessments = await AsyncStorage.getItem('assessments');
      const assessments: Assessment[] = storedAssessments ? JSON.parse(storedAssessments) : [];
      
      // Add the new assessment
      const updatedAssessments = [...assessments, { ...assessment, pdfPath }];
      
      await AsyncStorage.setItem('assessments', JSON.stringify(updatedAssessments));

      Alert.alert('Success', 'Assessment saved successfully', [
        {
          text: 'OK',
          onPress: () => {
            setAssessmentName('');
            setSelectedFolderId('');
            resetAssessment(); 

            router.push('/records');

            loadFolders();
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving assessment:', error);
      Alert.alert('Error', 'Failed to save assessment');
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
              (!assessmentName.trim() || !selectedFolderId) && inputStyles.createButtonDisabled
            ]}
            onPress={saveAssessment}
            disabled={!assessmentName.trim() || !selectedFolderId}
          >
            <FontAwesome5 name="save" size={20} color="white" />
            <Text style={inputStyles.createButtonText}>Create Assessment</Text>
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
          onNext={saveAssessment}
          nextDisabled={!assessmentName.trim() || !selectedFolderId}
          nextLabel="Finish"
          nextIcon="save"
        />
      </View>
    </SafeAreaView>
  );
} 