import type { Material, MaterialId } from "./types";

export const MATERIALS: Record<MaterialId, Material> = {
  al6061: {
    id: "al6061",
    name: "6061 Aluminum",
    densityLbPerCuIn: 0.0975,
    costPerLb: 4.25,
    surfaceSpeedSfm: 800,
    feedPerRev: 0.006,
    description: "General-purpose aluminum, excellent machinability",
  },
  steel1018: {
    id: "steel1018",
    name: "1018 Cold-Rolled Steel",
    densityLbPerCuIn: 0.2836,
    costPerLb: 2.85,
    surfaceSpeedSfm: 350,
    feedPerRev: 0.004,
    description: "Low-carbon steel, good strength and finish",
  },
};

export const STOCK_DIAMETERS = [0.25, 0.375, 0.5] as const;

export const MAX_PART_LENGTH = 2.0;
export const MAX_OD_DIAMETER = 0.5;
export const MIN_OD_DIAMETER = 0.1;
export const MIN_SEGMENT_LENGTH = 0.05;
export const MAX_SEGMENTS = 3;
export const MAX_QUANTITY = 100;
export const MIN_QUANTITY = 1;

export const MACHINE_ID = "haas-cl1-01";
export const MACHINE_NAME = "Haas CL-1 Chucker Lathe";

export function getMaterial(id: MaterialId): Material {
  return MATERIALS[id];
}
