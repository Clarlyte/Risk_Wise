import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
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
  const { clearAssessmentInputs } = useAssessment();
  const { activity, hazards: hazardsParam } = useLocalSearchParams();
  const [assessmentName, setAssessmentName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const { folders, addFolder, loadFolders } = useFolders();
  const [isAddFolderVisible, setIsAddFolderVisible] = useState(false);

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
        folderId: selectedFolderId,
      };

      // Generate PDF
      const pdfPath = await generatePDFContent(assessment);
      
      // Save to permanent storage
      const storedAssessments = await AsyncStorage.getItem('assessments');
      const assessments = storedAssessments ? JSON.parse(storedAssessments) : [];
      const updatedAssessments = [...assessments, { ...assessment, pdfPath }];
      await AsyncStorage.setItem('assessments', JSON.stringify(updatedAssessments));

      // Clear temporary data using clearAssessmentInputs instead
      await clearAssessmentInputs();

      Alert.alert('Success', 'Assessment saved successfully', [
        {
          text: 'OK',
          onPress: () => {
            router.push('/records');
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving assessment:', error);
      Alert.alert('Error', 'Failed to save assessment');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Save Assessment" onSettingsPress={() => {}} />

        <View style={styles.content}>
          <Text style={styles.label}>Assessment Name</Text>
          <TextInput
            style={styles.input}
            value={assessmentName}
            onChangeText={setAssessmentName}
            placeholder="Enter assessment name"
          />

          <Text style={styles.label}>Select Folder</Text>
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
              styles.createButton,
              (!assessmentName.trim() || !selectedFolderId) && styles.createButtonDisabled
            ]}
            onPress={saveAssessment}
            disabled={!assessmentName.trim() || !selectedFolderId}
          >
            <FontAwesome5 name="save" size={20} color="white" />
            <Text style={styles.createButtonText}>Create Assessment</Text>
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
        />
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
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#1294D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    gap: 12,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 