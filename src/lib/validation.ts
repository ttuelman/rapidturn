import type { PartSpec } from "./types";
import {
  MAX_OD_DIAMETER,
  MAX_PART_LENGTH,
  MAX_QUANTITY,
  MAX_SEGMENTS,
  MIN_OD_DIAMETER,
  MIN_QUANTITY,
  MIN_SEGMENT_LENGTH,
  STOCK_DIAMETERS,
  getMaterial,
} from "./materials";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function getTotalLength(spec: PartSpec): number {
  return spec.segments.reduce((sum, s) => sum + s.length, 0);
}

export function getMaxOd(spec: PartSpec): number {
  return Math.max(...spec.segments.map((s) => s.diameter), 0);
}

export function validatePartSpec(spec: PartSpec): ValidationResult {
  const errors: string[] = [];

  if (!STOCK_DIAMETERS.includes(spec.stockDiameter)) {
    errors.push("Stock diameter must be 0.25\", 0.375\", or 0.5\".");
  }

  if (spec.quantity < MIN_QUANTITY || spec.quantity > MAX_QUANTITY) {
    errors.push(`Quantity must be between ${MIN_QUANTITY} and ${MAX_QUANTITY}.`);
  }

  if (!getMaterial(spec.materialId)) {
    errors.push("Invalid material selection.");
  }

  if (spec.segments.length === 0) {
    errors.push("At least one OD segment is required.");
  }

  if (spec.segments.length > MAX_SEGMENTS) {
    errors.push(`Maximum ${MAX_SEGMENTS} OD segments allowed (single setup).`);
  }

  const totalLength = getTotalLength(spec);
  if (totalLength > MAX_PART_LENGTH) {
    errors.push(`Total part length cannot exceed ${MAX_PART_LENGTH}\".`);
  }

  if (totalLength < MIN_SEGMENT_LENGTH) {
    errors.push("Part must have measurable length.");
  }

  for (const [i, seg] of spec.segments.entries()) {
    if (seg.diameter < MIN_OD_DIAMETER || seg.diameter > MAX_OD_DIAMETER) {
      errors.push(
        `Segment ${i + 1}: diameter must be ${MIN_OD_DIAMETER}\"–${MAX_OD_DIAMETER}\".`,
      );
    }
    if (seg.diameter > spec.stockDiameter + 0.001) {
      errors.push(
        `Segment ${i + 1}: diameter cannot exceed stock diameter (${spec.stockDiameter}\").`,
      );
    }
    if (seg.length < MIN_SEGMENT_LENGTH) {
      errors.push(`Segment ${i + 1}: length must be at least ${MIN_SEGMENT_LENGTH}\".`);
    }
  }

  if (spec.frontChamfer.enabled && spec.frontChamfer.size > 0.03) {
    errors.push("Front chamfer cannot exceed 0.03\".");
  }
  if (spec.backChamfer.enabled && spec.backChamfer.size > 0.03) {
    errors.push("Back chamfer cannot exceed 0.03\".");
  }

  return { valid: errors.length === 0, errors };
}

export function createDefaultPartSpec(): PartSpec {
  return {
    materialId: "al6061",
    stockDiameter: 0.5,
    segments: [{ id: "seg-1", diameter: 0.475, length: 0.75 }],
    frontChamfer: { enabled: true, size: 0.01 },
    backChamfer: { enabled: false, size: 0.01 },
    quantity: 1,
  };
}
