import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { FontAwesome5 } from '@expo/vector-icons';

interface PDFViewerProps {
  uri: string;
}

function PDFViewer({ uri }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.pdfContainer}>
      <WebView
        source={{ uri }}
        style={styles.pdf}
        onLoadEnd={() => setIsLoading(false)}
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
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    // Implement share functionality
    setIsShareModalVisible(true);
  };

  const handleDownload = () => {
    // Implement download functionality
  };

  // This would be replaced with your actual PDF URL
  const pdfUrl = 'https://your-api-endpoint/assessments/${assessmentId}/pdf';

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

        <PDFViewer uri={pdfUrl} />

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
}); 