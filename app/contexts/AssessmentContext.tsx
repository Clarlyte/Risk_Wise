import React, { createContext, useContext, useState } from 'react';
import { Hazard } from '../types/risk';

interface AssessmentContextType {
  clearAssessmentInputs: () => void;
  activity: string;
  setActivity: (value: string) => void;
  customActivity: string;
  setCustomActivity: (value: string) => void;
  hazards: Hazard[];
  setHazards: (hazards: Hazard[]) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [hazards, setHazards] = useState<Hazard[]>([]);

  const clearAssessmentInputs = () => {
    setActivity('');
    setCustomActivity('');
    setHazards([]);
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