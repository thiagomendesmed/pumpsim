import { create } from "zustand";
import { PumpStore } from "@/types";
import { getDrugById } from "@/constants/drugs";

export const usePumpStore = create<PumpStore>((set) => ({
  // State
  selectedDrugId: "norepinefrina",
  selectedSolutionId: "nora-sp",
  flowRate: 10,
  weight: 70,
  isRunning: false,
  elapsedSeconds: 0,
  volumeInfused: 0,

  // Actions
  start: () => set({ isRunning: true }),

  stop: () => set({ isRunning: false }),

  reset: () =>
    set({
      isRunning: false,
      elapsedSeconds: 0,
      volumeInfused: 0,
    }),

  tick: () =>
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
      volumeInfused: state.volumeInfused + state.flowRate / 3600,
    })),

  setFlowRate: (rate: number) =>
    set((state) => {
      const drug = getDrugById(state.selectedDrugId);
      return { flowRate: Math.max(0, Math.min(drug.maxFlowRate, rate)) };
    }),

  setWeight: (weight: number) =>
    set({ weight: Math.max(0, Math.min(300, weight)) }),

  setSolution: (solutionId: string) =>
    set({ selectedSolutionId: solutionId }),

  setDrug: (drugId: string) => {
    const drug = getDrugById(drugId);
    set({
      selectedDrugId: drugId,
      selectedSolutionId: drug.solutions[0].id,
      isRunning: false,
      elapsedSeconds: 0,
      volumeInfused: 0,
      flowRate: 10,
    });
  },
}));
