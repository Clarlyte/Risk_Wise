export interface Effect {
  id: string;
  description: string;
}

export interface Control {
  id: string;
  description: string;
}

export interface Hazard {
  id: string;
  description: string;
  images: string[];
  effects?: Effect[];
  existingControls?: Control[];
}

export interface WorkActivity {
  id: string;
  description: string;
  hazards: Hazard[];
}

export const LIKELIHOOD_OPTIONS = [
  { label: 'Improbable (1)', value: 1 },
  { label: 'Remote (2)', value: 2 },
  { label: 'Occasional (3)', value: 3 },
  { label: 'Probable (4)', value: 4 },
  { label: 'Frequent (5)', value: 5 },
];

export const SEVERITY_OPTIONS = [
  { label: 'Negligible (1)', value: 1 },
  { label: 'Low (2)', value: 2 },
  { label: 'Moderate (3)', value: 3 },
  { label: 'Significant (4)', value: 4 },
  { label: 'Catastrophic (5)', value: 5 },
];

export function calculateRiskScore(likelihood: number, severity: number): number {
  return likelihood * severity;
}

export function getRiskLevel(score: number): {
  level: string;
  color: string;
  description: string;
} {
  if (score <= 3) {
    return { 
      level: 'Very Low Risk', 
      color: '#4CAF50',
      description: 'No additional controls are required.'
    };
  } else if (score <= 6) {
    return { 
      level: 'Low Risk', 
      color: '#8BC34A',
      description: 'Keep the process going, but monitor'
    };
  } else if (score <= 12) {
    return { 
      level: 'Medium Risk', 
      color: '#FFEB3B',
      description: 'Keep the process going; however, a control'
    };
  } else if (score <= 15) {
    return { 
      level: 'High Risk', 
      color: '#FF9800',
      description: 'Investigate the process and implement'
    };
  } else {
    return { 
      level: 'Immediately Dangerous', 
      color: '#F44336',
      description: 'Stop the process and implement controls'
    };
  }
}

