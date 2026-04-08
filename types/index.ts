export type DiluentType = "SG5" | "SF09";

export interface DrugSolution {
  id: string;
  drugName: string;
  shortName: string;
  dilutionType: "SP" | "CC" | "2xCC";
  ampoules: number;
  ampouleDrugContent_mg: number;
  ampouleVolume_mL: number;
  diluent: DiluentType;
  diluentVolume_mL: number;
  totalVolume_mL: number;
  totalDrug_mg: number;
  concentration_mcg_per_mL: number;
  label: string;
  specialNote?: string;
}

export interface DoseRange {
  min: number;
  max: number;
  label: string;
  color: string;
}

export type DrugCategory =
  | "vasopressor"
  | "sedation"
  | "neuromuscular_blocker"
  | "analgesic"
  | "vasodilator";

export interface Drug {
  id: string;
  name: string;
  category: DrugCategory;
  ampPresentation: string;
  isFree: boolean;
  solutions: DrugSolution[];
  doseRanges: DoseRange[];
  doseUnit: string;
  usesWeight: boolean;
  maxFlowRate: number;
  clinicalNotes: string[];
}

export type PumpState = "idle" | "running" | "stopped";

export interface PumpStore {
  // State
  selectedDrugId: string;
  selectedSolutionId: string;
  flowRate: number;
  weight: number;
  isRunning: boolean;
  elapsedSeconds: number;
  volumeInfused: number;

  // Actions
  start: () => void;
  stop: () => void;
  reset: () => void;
  tick: () => void;
  setFlowRate: (rate: number) => void;
  setWeight: (weight: number) => void;
  setSolution: (solutionId: string) => void;
  setDrug: (drugId: string) => void;
}
