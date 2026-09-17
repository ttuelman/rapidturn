import {
  ECLIP_GROOVE,
  GROOVE_END_CLEARANCE,
  GROOVE_MAX_COUNT,
  HEX_MODEL_AF,
  JOURNAL_DIAMETER_MIN,
  JOURNAL_LENGTH_MIN,
  LENGTH_MAX,
  LENGTH_MIN,
  TAP_OPTIONS,
} from "@/config/shaft";
import type { ShaftConfig, ValidationResult } from "./types";
import { hexAcrossCorners, uniqueSorted } from "./geometry";

export function validateShaft(config: ShaftConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isFinite(config.length)) {
    errors.push("Length must be a number.");
  } else {
    if (config.length < LENGTH_MIN) {
      errors.push(`Length must be at least ${LENGTH_MIN.toFixed(2)} in.`);
    }
    if (config.length > LENGTH_MAX) {
      errors.push(`Length cannot exceed ${LENGTH_MAX.toFixed(2)} in (service max).`);
    }
  }

  if (!(config.endA in TAP_OPTIONS)) errors.push("End A tap is invalid.");
  if (!(config.endB in TAP_OPTIONS)) errors.push("End B tap is invalid.");

  if (config.grooves.length > GROOVE_MAX_COUNT) {
    errors.push(`At most ${GROOVE_MAX_COUNT} E-clip grooves.`);
  }

  const half = ECLIP_GROOVE.width / 2;
  const minPos = half + GROOVE_END_CLEARANCE;
  const maxPos = config.length - half - GROOVE_END_CLEARANCE;
  const ranges: { id: string; z0: number; z1: number }[] = [];

  for (const [i, g] of config.grooves.entries()) {
    if (!Number.isFinite(g.position)) {
      errors.push(`E-clip groove ${i + 1}: position must be a number.`);
      continue;
    }
    if (g.position < minPos - 1e-6 || g.position > maxPos + 1e-6) {
      errors.push(
        `E-clip groove ${i + 1}: center must sit between ${minPos.toFixed(3)}" and ${maxPos.toFixed(3)}" from End A so the ${ECLIP_GROOVE.width}" groove stays on the shaft.`,
      );
    }
    ranges.push({
      id: g.id,
      z0: g.position - half,
      z1: g.position + half,
    });
  }

  const ordered = [...ranges].sort((a, b) => a.z0 - b.z0);
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].z0 < ordered[i - 1].z1 - 1e-6) {
      errors.push("E-clip grooves overlap. Separate them by at least the groove width.");
      break;
    }
  }

  if (config.journal.enabled) {
    const { start, length, diameter } = config.journal;
    if (!Number.isFinite(start) || !Number.isFinite(length) || !Number.isFinite(diameter)) {
      errors.push("Journal start, length, and diameter must be numbers.");
    } else {
      if (length < JOURNAL_LENGTH_MIN) {
        errors.push(`Journal length must be at least ${JOURNAL_LENGTH_MIN}" .`);
      }
      if (start < -1e-6) errors.push("Journal cannot start before End A.");
      if (start + length > config.length + 1e-6) {
        errors.push("Journal must end on or before End B.");
      }
      if (diameter < JOURNAL_DIAMETER_MIN) {
        errors.push(`Journal diameter must be at least ${JOURNAL_DIAMETER_MIN}".`);
      }
      const ac = hexAcrossCorners(HEX_MODEL_AF);
      if (diameter > ac + 1e-6) {
        warnings.push(
          `Journal Ø${diameter.toFixed(3)}" is larger than hex across-corners (${ac.toFixed(3)}") — no material is removed.`,
        );
      } else if (diameter > HEX_MODEL_AF) {
        warnings.push(
          "This journal clips hex corners to the target circle (ThunderHex-style). Flats remain as a shoulder outside the journal.",
        );
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function clampGroovePosition(position: number, length: number): number {
  const half = ECLIP_GROOVE.width / 2;
  const minPos = half + GROOVE_END_CLEARANCE;
  const maxPos = Math.max(minPos, length - half - GROOVE_END_CLEARANCE);
  return Math.min(maxPos, Math.max(minPos, position));
}

export function clampConfig(config: ShaftConfig): ShaftConfig {
  const length = Math.min(LENGTH_MAX, Math.max(LENGTH_MIN, config.length));
  const grooves = config.grooves.map((g) => ({
    ...g,
    position: clampGroovePosition(g.position, length),
  }));

  let journal = { ...config.journal };
  if (journal.enabled) {
    const maxLen = Math.max(JOURNAL_LENGTH_MIN, length);
    journal.length = Math.min(Math.max(journal.length, JOURNAL_LENGTH_MIN), maxLen);
    journal.start = Math.min(Math.max(journal.start, 0), Math.max(0, length - journal.length));
    journal.diameter = Math.max(JOURNAL_DIAMETER_MIN, journal.diameter);
  }

  return { ...config, length, grooves, journal };
}

export function defaultGroovePosition(config: ShaftConfig): number {
  const used = uniqueSorted(config.grooves.map((g) => g.position));
  const candidates = [0.25, 0.5, 1, config.length - 0.25, config.length / 2];
  for (const c of candidates) {
    const p = clampGroovePosition(c, config.length);
    if (used.every((u) => Math.abs(u - p) > ECLIP_GROOVE.width + 0.02)) return p;
  }
  return clampGroovePosition(config.length * 0.35, config.length);
}
