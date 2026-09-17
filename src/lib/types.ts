import type { TapId } from "@/config/shaft";

export type { TapId };

export interface EclipGroove {
  id: string;
  /** Axial position of the groove center, inches from End A (z = 0). */
  position: number;
}

export interface JournalSpec {
  enabled: boolean;
  /** Start of the turned section, inches from End A. */
  start: number;
  length: number;
  /** Target round clip diameter (in). ≥ AF clips corners; < AF is a true journal. */
  diameter: number;
}

export interface ShaftConfig {
  length: number;
  endA: TapId;
  endB: TapId;
  grooves: EclipGroove[];
  journal: JournalSpec;
}

export interface EstimateBreakdown {
  material: number;
  cutoff: number;
  taps: number;
  grooves: number;
  journal: number;
  setup: number;
  total: number;
  notForSale: true;
  cadOnly: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
