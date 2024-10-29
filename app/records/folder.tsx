import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../components/Header';

interface Assessment {
  id: string;
  name: string;
  date: string;
  activity: string;
  hazards: any[];
  folderId: string;
}

export default function FolderScreen() {
  const router = useRouter();
  const { folderId, folderName } = useLocalSearchParams();
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const storedAssessments = await AsyncStorage.getItem('assessments');
      if (storedAssessments) {
        const allAssessments = JSON.parse(storedAssessments);
        setAssessments(allAssessments.filter((a: Assessment) => a.folderId === folderId));
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  };

  const handleBack = () => {
    router.push('/records'); // This will navigate back to the records screen
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
        <TouchableOpacity style={styles.actionButton}>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header 
          title={folderName as string}
          onBackPress={handleBack}
          onSettingsPress={() => {}}
        />

        <FlatList
          style={styles.list}
          data={assessments}
          renderItem={renderAssessmentItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No assessments in this folder</Text>
          }
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
}); 