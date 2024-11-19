import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { FontAwesome5 } from '@expo/vector-icons';
import { useStorage } from '../contexts/storage-context';
import * as Crypto from 'expo-crypto';
import { createClient } from '@supabase/supabase-js';

interface PDFViewerProps {
  uri: string;
}

function PDFViewer({ uri }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    let isMounted = true;
    console.log('Loading HTML attempt:', loadAttempts + 1);

    async function loadHTML() {
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('File info:', fileInfo);
        
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }

        const content = await FileSystem.readAsStringAsync(uri);
        if (!content || content.length === 0) {
          throw new Error('File is empty');
        }

        console.log('Content loaded, length:', content.length);
        if (isMounted) {
          setHtmlContent(content);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading HTML:', err);
        if (isMounted) {
          if (loadAttempts < MAX_ATTEMPTS - 1) {
            setLoadAttempts(prev => prev + 1);
          } else {
            setError(err instanceof Error ? err.message : 'Error loading file content');
            setIsLoading(false);
          }
        }
      }
    }

    if (isLoading) {
      loadHTML();
    }

    return () => {
      isMounted = false;
    };
  }, [uri, loadAttempts]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            setLoadAttempts(0);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.pdfContainer}>
      {htmlContent ? (
        <WebView
          source={{ 
            html: htmlContent,
            baseUrl: 'file:///'
          }}
          style={styles.pdf}
          onLoadStart={() => {
            console.log('WebView load starting');
            setWebViewLoaded(false);
          }}
          onLoadEnd={() => {
            console.log('WebView load complete');
            setWebViewLoaded(true);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setError(`Error loading content: ${nativeEvent.description}`);
          }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          scrollEnabled={true}
          containerStyle={{ backgroundColor: 'white' }}
          androidLayerType="hardware"
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
        />
      ) : null}
      {(!webViewLoaded || isLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FC7524" />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )}
    </View>
  );
}

export default function ViewPDFScreen() {
  const router = useRouter();
  const storage = useStorage();
  const { assessmentId, assessmentName } = useLocalSearchParams();
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  useEffect(() => {
    console.log('Storage service state:', {
      isInitialized: storage !== null,
      storage
    });
  }, [storage]);

  const loadAssessment = async () => {
    try {
      const storedAssessments = await AsyncStorage.getItem('assessments');
      if (storedAssessments) {
        const assessments = JSON.parse(storedAssessments);
        const assessment = assessments.find((a: any) => a.id === assessmentId);
        if (assessment && assessment.htmlPath) {
          console.log('Found HTML path:', assessment.htmlPath);
          setPdfUrl(assessment.htmlPath);
        } else {
          console.error('No HTML path found for assessment:', assessmentId);
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

  const handleDownload = async () => {
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
            <FontAwesome5 
              name="download" 
              size={20} 
              color="white" 
              onPress={handleDownload}
            />
          }
        />

        <View style={styles.contentContainer}>
          {pdfUrl && <PDFViewer uri={pdfUrl} />}
        </View>

        <View style={styles.bottomNavigationContainer}>
          <BottomNavigation
            onBack={handleBack}
          />
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
    backgroundColor: 'white',
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 80,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  pdf: {
    flex: 1,
    backgroundColor: 'white',
  },
  bottomNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F2F1F9',
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
  },
  hidden: {
    opacity: 0,
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FC7524',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
}); 