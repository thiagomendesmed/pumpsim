import { DoseRange } from "@/types";

/**
 * Calcula dose na unidade correta baseado no doseUnit da droga.
 *
 * concentration_mcg_per_mL: concentracao em mcg/mL (exceto vasopressina que usa U/mL)
 *
 * Formulas por unidade:
 * - mcg/kg/min: (flow × conc) / (60 × weight)
 * - mcg/kg/h:   (flow × conc) / weight
 * - mg/kg/h:    (flow × conc) / (1000 × weight)
 * - mcg/min:    (flow × conc) / 60
 * - mg/h:       (flow × conc) / 1000
 * - U/min:      (flow × conc) / 60   (conc em U/mL para vasopressina)
 */
export function calculateDoseInUnit(
  flowRate_mL_h: number,
  concentration_per_mL: number,
  weight_kg: number,
  doseUnit: string
): number {
  if (flowRate_mL_h <= 0) return 0;
  const w = weight_kg <= 0 ? 1 : weight_kg;

  switch (doseUnit) {
    case "mcg/kg/min":
      return (flowRate_mL_h * concentration_per_mL) / (60 * w);
    case "mcg/kg/h":
      return (flowRate_mL_h * concentration_per_mL) / w;
    case "mg/kg/h":
      return (flowRate_mL_h * concentration_per_mL) / (1000 * w);
    case "mcg/min":
      return (flowRate_mL_h * concentration_per_mL) / 60;
    case "mg/h":
      return (flowRate_mL_h * concentration_per_mL) / 1000;
    case "U/min":
      // concentration_per_mL stores U/mL for vasopressin
      return (flowRate_mL_h * concentration_per_mL) / 60;
    default:
      return (flowRate_mL_h * concentration_per_mL) / (60 * w);
  }
}

/**
 * Calcula vazao necessaria para dose alvo na unidade correta.
 */
export function calculateFlowForDose(
  targetDose: number,
  concentration_per_mL: number,
  weight_kg: number,
  doseUnit: string
): number {
  if (concentration_per_mL <= 0) return 0;
  const w = weight_kg <= 0 ? 1 : weight_kg;

  switch (doseUnit) {
    case "mcg/kg/min":
      return (targetDose * 60 * w) / concentration_per_mL;
    case "mcg/kg/h":
      return (targetDose * w) / concentration_per_mL;
    case "mg/kg/h":
      return (targetDose * 1000 * w) / concentration_per_mL;
    case "mcg/min":
      return (targetDose * 60) / concentration_per_mL;
    case "mg/h":
      return (targetDose * 1000) / concentration_per_mL;
    case "U/min":
      return (targetDose * 60) / concentration_per_mL;
    default:
      return (targetDose * 60 * w) / concentration_per_mL;
  }
}

/**
 * Backward-compatible wrapper — use calculateDoseInUnit for new code.
 */
export function calculateDose(
  flowRate_mL_h: number,
  concentration_per_mL: number,
  weight_kg: number,
  usesWeight: boolean
): number {
  if (flowRate_mL_h <= 0) return 0;
  if (usesWeight) {
    const effectiveWeight = weight_kg <= 0 ? 1 : weight_kg;
    return (flowRate_mL_h * concentration_per_mL) / (60 * effectiveWeight);
  }
  return (flowRate_mL_h * concentration_per_mL) / 60;
}

/**
 * Retorna a faixa de dose correspondente
 */
export function getDoseRange(dose: number, doseRanges: DoseRange[]): DoseRange {
  return (
    doseRanges.find((r) => dose >= r.min && dose < r.max) ??
    doseRanges[doseRanges.length - 1]
  );
}

/**
 * Formata segundos em HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

/**
 * Formata volume em mL com 2 casas decimais
 */
export function formatVolume(ml: number): string {
  return ml.toFixed(2);
}
