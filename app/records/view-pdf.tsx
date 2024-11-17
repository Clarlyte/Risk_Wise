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
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  useEffect(() => {
    console.log('Attempting to load HTML from:', uri);
    async function loadHTML() {
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }

        const content = await FileSystem.readAsStringAsync(uri);
        if (!content || content.length === 0) {
          throw new Error('File is empty');
        }

        setHtmlContent(content);
        console.log('HTML content loaded, length:', content.length);
      } catch (err) {
        console.error('Error loading HTML:', err);
        setError(err instanceof Error ? err.message : 'Error loading file content');
        setIsLoading(false);
      }
    }
    loadHTML();
  }, [uri]);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setError('Loading timed out. Please try again.');
          setIsLoading(false);
        }
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

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
        source={{ 
          html: htmlContent,
          baseUrl: 'file:///'
        }}
        style={[
          styles.pdf,
          !webViewLoaded && styles.hidden
        ]}
        onLoadStart={() => {
          setWebViewLoaded(false);
          setIsLoading(true);
        }}
        onLoadEnd={() => {
          setWebViewLoaded(true);
          setIsLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError(`Error loading content: ${nativeEvent.description}`);
          setIsLoading(false);
        }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        scrollEnabled={true}
        containerStyle={{ backgroundColor: 'white' }}
        androidLayerType="software"
        mixedContentMode="always"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
      {isLoading && !webViewLoaded && (
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

        <View style={styles.contentContainer}>
          {pdfUrl && <PDFViewer uri={pdfUrl} />}
        </View>

        <View style={styles.bottomNavigationContainer}>
          <BottomNavigation
            onBack={handleBack}
            onNext={handleShare}
            nextLabel="Share PDF"
            nextIcon="share-alt"
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
    color: 'red',
    textAlign: 'center',
  },
  hidden: {
    opacity: 0,
  },
}); 