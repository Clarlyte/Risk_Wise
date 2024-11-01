import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hazard } from '../types/risk';

interface AssessmentContextType {
  clearAssessmentInputs: () => void;
  activity: string;
  setActivity: (value: string) => void;
  customActivity: string;
  setCustomActivity: (value: string) => void;
  hazards: Hazard[];
  setHazards: (hazards: Hazard[]) => void;
  tempAssessment: any;
  saveTempAssessment: (data: any) => Promise<void>;
  clearTempAssessment: () => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [tempAssessment, setTempAssessment] = useState<any>(null);

  const clearAssessmentInputs = () => {
    setActivity('');
    setCustomActivity('');
    setHazards([]);
  };

  const saveTempAssessment = async (data: any) => {
    setTempAssessment(data);
    await AsyncStorage.setItem('tempAssessment', JSON.stringify(data));
  };

  const clearTempAssessment = async () => {
    setTempAssessment(null);
    await AsyncStorage.removeItem('tempAssessment');
  };

  return (
    <AssessmentContext.Provider
      value={{
        activity,
        setActivity,
        customActivity,
        setCustomActivity,
        hazards,
        setHazards,
        clearAssessmentInputs,
        tempAssessment,
        saveTempAssessment,
        clearTempAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
} 