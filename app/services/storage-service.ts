import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Assessment } from '../types/pdf';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class HybridStorageService {
  private deviceId: string | null = null;
  private isCloudEnabled: boolean = false;

  async initialize() {
    // Get or generate device ID
    this.deviceId = await AsyncStorage.getItem('deviceId');
    if (!this.deviceId) {
      this.deviceId = await Crypto.randomUUID();
      await AsyncStorage.setItem('deviceId', this.deviceId);
    }

    // Test Supabase connection without auth
    try {
      const { data, error } = await supabase
        .from('health_check')
        .select('*')
        .limit(1);
      
      this.isCloudEnabled = !error;
      if (error) {
        console.log('Cloud sync disabled - using local storage only:', error.message);
      } else {
        console.log('Cloud sync enabled');
      }
    } catch (error) {
      console.log('Cloud sync initialization failed - using local storage only');
      this.isCloudEnabled = false;
    }
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
    try {
      // Save locally first
      const assessments = await this.getLocalAssessments();
      assessments.push(assessment);
      await AsyncStorage.setItem('assessments', JSON.stringify(assessments));

      // Try to backup to Supabase if enabled
      if (this.isCloudEnabled) {
        const { error } = await supabase
          .from('assessments')
          .insert({
            id: assessment.id,
            device_id: this.deviceId,
            assessment_data: assessment,
            created_at: new Date().toISOString()
          })
          .select();

        if (error) {
          console.error('Cloud backup failed:', error);
          // Don't throw - we already saved locally
        }
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }

  async getLocalAssessments(): Promise<Assessment[]> {
    const stored = await AsyncStorage.getItem('assessments');
    return stored ? JSON.parse(stored) : [];
  }

  async shareAssessment(assessmentId: string, targetDeviceId: string): Promise<string> {
    if (!this.isCloudEnabled) {
      throw new Error('Cloud sync is not available');
    }

    try {
      const encryptionKey = await Crypto.randomUUID();
      const assessment = (await this.getLocalAssessments())
        .find(a => a.id === assessmentId);
      
      if (!assessment) throw new Error('Assessment not found');

      const { error } = await supabase
        .from('shared_assessments')
        .insert({
          assessment_id: assessmentId,
          source_device_id: this.deviceId,
          target_device_id: targetDeviceId,
          encryption_key: encryptionKey,
          assessment_data: assessment
        });

      if (error) throw error;
      return encryptionKey;
    } catch (error) {
      console.error('Error sharing assessment:', error);
      throw error;
    }
  }

  async syncWithCloud(): Promise<void> {
    if (!this.isCloudEnabled) {
      return; // Skip sync if cloud is not enabled
    }

    try {
      const { data: cloudAssessments, error } = await supabase
        .from('assessments')
        .select('assessment_data')
        .eq('device_id', this.deviceId);

      if (error) throw error;

      const localAssessments = await this.getLocalAssessments();
      const mergedAssessments = this.mergeAssessments(
        localAssessments,
        cloudAssessments.map(ca => ca.assessment_data)
      );

      await AsyncStorage.setItem('assessments', JSON.stringify(mergedAssessments));
    } catch (error) {
      console.error('Error syncing with cloud:', error);
      throw error;
    }
  }

  private mergeAssessments(local: Assessment[], cloud: Assessment[]): Assessment[] {
    const merged = new Map<string, Assessment>();
    local.forEach(assessment => merged.set(assessment.id, assessment));
    cloud.forEach(assessment => {
      const existing = merged.get(assessment.id);
      if (!existing || new Date(assessment.date) > new Date(existing.date)) {
        merged.set(assessment.id, assessment);
      }
    });
    return Array.from(merged.values());
  }
} 