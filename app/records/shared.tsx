import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Header } from '../components/Header';
import { useStorage } from '../contexts/storage-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SharedScreen() {
  const router = useRouter();
  const storage = useStorage();
  const [shareId, setShareId] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAccessAssessment = async () => {
    if (!shareId.trim() || !encryptionKey.trim()) {
      Alert.alert('Error', 'Please enter both Share ID and Encryption Key');
      return;
    }

    setIsLoading(true);
    try {
      // Download the shared assessment
      const pdfPath = await storage.downloadSharedAssessment(
        shareId.trim(),
        encryptionKey.trim()
      );

      // Clear inputs
      setShareId('');
      setEncryptionKey('');

      // Show success message
      Alert.alert(
        'Success',
        'Assessment downloaded successfully',
        [
          {
            text: 'View Now',
            onPress: () => {
              router.push({
                pathname: '/records/view-pdf',
                params: {
                  assessmentId: shareId,
                  assessmentName: 'Shared Assessment'
                }
              });
            }
          },
          { text: 'Later' }
        ]
      );
    } catch (error) {
      console.error('Error accessing shared assessment:', error);
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'Failed to access shared assessment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <Header
          title="Shared With Me"
          onBackPress={() => router.back()}
        />

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <FontAwesome5 name="info-circle" size={20} color="#1294D5" />
            <Text style={styles.infoText}>
              Enter the Share ID and Encryption Key you received to access a shared assessment.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Share ID</Text>
            <TextInput
              style={styles.input}
              value={shareId}
              onChangeText={setShareId}
              placeholder="Enter Share ID"
              placeholderTextColor="#666"
              editable={!isLoading}
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
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.accessButton,
              (!shareId.trim() || !encryptionKey.trim() || isLoading) && styles.accessButtonDisabled
            ]}
            onPress={handleAccessAssessment}
            disabled={!shareId.trim() || !encryptionKey.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <FontAwesome5 name="download" size={20} color="white" />
                <Text style={styles.accessButtonText}>Access Assessment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#1294D5',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  accessButton: {
    backgroundColor: '#1294D5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  accessButtonDisabled: {
    opacity: 0.5,
  },
  accessButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 