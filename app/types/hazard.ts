import { Hazard as BaseHazard, Effect, Control } from './risk';

export interface HazardWithEffects extends BaseHazard {
  effects?: Effect[];
  existingControls?: Control[];
}

export interface HazardWithRisk extends HazardWithEffects {
  likelihood: number;
  severity: number;
  riskScore: number;
}

export interface HazardWithControls extends HazardWithRisk {
  additionalControls: {
    ac: string[];
    ec: string[];
    ppe: string[];
  };
  pointPerson: string;
}

export interface HazardWithFinalRisk extends HazardWithControls {
  finalLikelihood: number;
  finalSeverity: number;
  finalRiskScore: number;
  dueDate: string;
}
