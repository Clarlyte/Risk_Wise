import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import NetInfo from '@react-native-community/netinfo';
import { z } from 'zod';
import * as Crypto from 'expo-crypto';
import { encode as base64Encode, decode as base64Decode } from 'base-64';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

// Define assessment schema using Zod
const AssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.object({}).passthrough(), // Adjust based on your assessment structure
  createdAt: z.string(),
  updatedAt: z.string(),
  syncedAt: z.string().nullable(),
});

type Assessment = z.infer<typeof AssessmentSchema>;

interface StorageService {
  syncQueue: Assessment[];
  
  initialize(): Promise<void>;
  saveAssessment(assessment: Assessment): Promise<void>;
  getAssessments(): Promise<Assessment[]>;
  syncWithRemote(): Promise<void>;
  shareAssessment(assessmentId: string, recipientEmail: string): Promise<string>;
}

export class HybridStorageService implements StorageService {
  public supabase;
  public syncQueue: Assessment[] = [];
  private encryptionKey: string = '';

  constructor() {
    this.supabase = createClient(
      EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async initialize(): Promise<void> {
    try {
      const storedKey = await SecureStore.getItemAsync('encryptionKey');
      this.encryptionKey = storedKey || await this.generateAndStoreNewKey();
    } catch (error) {
      console.error('Error initializing storage service:', error);
      throw error;
    }
  }

  private async generateAndStoreNewKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const keyString = this.arrayBufferToBase64(randomBytes);
    await SecureStore.setItemAsync('encryptionKey', keyString);
    return keyString;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return base64Encode(binary);
  }

  private async generateSharingToken(assessment: Assessment): Promise<string> {
    const tokenData = `${assessment.id}-${Date.now()}`;
    const tokenBytes = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      tokenData
    );
    return this.arrayBufferToBase64(new TextEncoder().encode(tokenBytes));
  }

  private async encryptAssessment(assessment: Assessment): Promise<string> {
    try {
      const assessmentString = JSON.stringify(assessment);
      return base64Encode(assessmentString);
    } catch (error) {
      console.error('Error encrypting assessment:', error);
      throw error;
    }
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
    try {
      // Save locally first
      const assessments = await this.getLocalAssessments();
      assessments.push(assessment);
      await AsyncStorage.setItem('assessments', JSON.stringify(assessments));

      // Try to sync immediately if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await this.syncWithRemote();
      } else {
        this.syncQueue.push(assessment);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }

  async getAssessments(): Promise<Assessment[]> {
    try {
      // Get local data first
      const localData = await this.getLocalAssessments();
      
      // Try to sync with remote if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await this.syncWithRemote();
      }
      
      return localData;
    } catch (error) {
      console.error('Error getting assessments:', error);
      throw error;
    }
  }

  private async getLocalAssessments(): Promise<Assessment[]> {
    const data = await AsyncStorage.getItem('assessments');
    return data ? JSON.parse(data) : [];
  }

  async syncWithRemote(): Promise<void> {
    try {
      // Get local data
      const localData = await this.getLocalAssessments();
      
      // Get remote data
      const { data: remoteData, error } = await this.supabase
        .from('assessments')
        .select('*');
      
      if (error) throw error;

      // Merge and resolve conflicts (using timestamp-based strategy)
      const mergedData = this.mergeData(localData, remoteData);
      
      // Update local storage
      await AsyncStorage.setItem('assessments', JSON.stringify(mergedData));
      
      // Update remote storage
      await this.supabase.from('assessments').upsert(mergedData);
      
      // Clear sync queue
      this.syncQueue = [];
    } catch (error) {
      console.error('Error syncing with remote:', error);
      throw error;
    }
  }

  async shareAssessment(assessmentId: string, recipientEmail: string): Promise<string> {
    try {
      const assessment = (await this.getLocalAssessments())
        .find(a => a.id === assessmentId);
      
      if (!assessment) throw new Error('Assessment not found');

      // Generate sharing token
      const sharingToken = await this.generateSharingToken(assessment);
      
      // Store encrypted assessment in Supabase
      await this.supabase.from('shared_assessments').insert({
        token: sharingToken,
        assessment: await this.encryptAssessment(assessment),
        recipientEmail,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return sharingToken;
    } catch (error) {
      console.error('Error sharing assessment:', error);
      throw error;
    }
  }

  private mergeData(local: Assessment[], remote: Assessment[]): Assessment[] {
    const merged = [...local, ...remote];
    return merged.reduce((acc, current) => {
      const existing = acc.find(item => item.id === current.id);
      if (!existing || new Date(existing.updatedAt) < new Date(current.updatedAt)) {
        return [...acc.filter(item => item.id !== current.id), current];
      }
      return acc;
    }, [] as Assessment[]);
  }
} 