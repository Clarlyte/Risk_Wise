import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { FontAwesome5 } from '@expo/vector-icons';

interface PDFViewerProps {
  uri: string;
}

function PDFViewer({ uri }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Attempting to load PDF from:', uri);
    async function checkFile() {
      try {
        setIsLoading(true);
        const fileInfo = await FileSystem.getInfoAsync(uri.replace('file://', ''));
        console.log('File info:', fileInfo);
        
        if (!fileInfo.exists) {
          setError('PDF file not found');
        }
      } catch (err) {
        console.error('Error checking file:', err);
        setError('Error accessing PDF file');
      } finally {
        setIsLoading(false);
      }
    }
    checkFile();
  }, [uri]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.pdfContainer}>
      <WebView
        source={{ uri }}
        style={styles.pdf}
        onLoadStart={() => {
          console.log('WebView started loading');
          setIsLoading(true);
        }}
        onLoadEnd={() => {
          console.log('WebView finished loading');
          setIsLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
          setError(`Error loading PDF: ${nativeEvent.description}`);
        }}
        cacheEnabled={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        androidHardwareAccelerationDisabled={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FC7524" />
          </View>
        )}
        startInLoadingState={true}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FC7524" />
        </View>
      )}
    </View>
  );
}

export default function ViewPDFScreen() {
  const router = useRouter();
  const { assessmentId, assessmentName } = useLocalSearchParams();
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      const storedAssessments = await AsyncStorage.getItem('assessments');
      if (storedAssessments) {
        const assessments = JSON.parse(storedAssessments);
        const assessment = assessments.find((a: any) => a.id === assessmentId);
        if (assessment && assessment.pdfPath) {
          setPdfUrl(assessment.pdfPath);
        }
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (pdfUrl) {
      try {
        await Share.share({
          url: pdfUrl,
          title: `${assessmentName} Assessment`,
        });
      } catch (error) {
        console.error('Error sharing PDF:', error);
      }
    }
  };

  const handleDownload = async () => {
    // Implement download functionality if needed
    console.log('Download functionality to be implemented');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FC7524" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <Header
          title={assessmentName as string}
          onBackPress={handleBack}
          rightIcon={
            <View style={styles.headerActions}>
              <FontAwesome5 
                name="download" 
                size={20} 
                color="white" 
                style={styles.headerIcon}
                onPress={handleDownload}
              />
              <FontAwesome5 
                name="share-alt" 
                size={20} 
                color="white" 
                onPress={handleShare}
              />
            </View>
          }
        />

        {pdfUrl && <PDFViewer uri={pdfUrl} />}

        <BottomNavigation
          onBack={handleBack}
          onNext={handleShare}
          nextLabel="Share PDF"
          nextIcon="share-alt"
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
  pdfContainer: {
    flex: 1,
    backgroundColor: '#F2F1F9',
    position: 'relative',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#F2F1F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    marginRight: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
}); 