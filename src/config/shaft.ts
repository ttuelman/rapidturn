/**
 * Locked v1 product constants for the Rapid Turn FRC hex-shaft configurator.
 * Dimensions are inches unless noted.
 */

/** Nominal FRC 1/2" hex. Model AF is undersize so hubs/bearings slip on. */
export const HEX_NOMINAL_AF = 0.5;

/**
 * Modeled across-flats. Midpoint of the common FRC vendor window
 * (AndyMark 0.496–0.499 in). Documented in the UI — not mill-bar oversize.
 */
export const HEX_MODEL_AF = 0.4975;
export const HEX_AF_MIN = 0.496;
export const HEX_AF_MAX = 0.499;

export const MATERIAL_NAME = "7075-T6 aluminum";
export const MATERIAL_ID = "al7075t6";

export const LENGTH_MIN = 1.0;
/** Rapid Turn machines up to this length. Longer is CAD-only. */
export const LENGTH_MFG_MAX = 8.0;
/** Soft max for the configurator / STEP download. Do not treat as a service cap. */
export const LENGTH_CAD_MAX = 36.0;
export const LENGTH_MAX = LENGTH_CAD_MAX;
export const LENGTH_DEFAULT = 4.0;
export const LENGTH_STEP = 0.0625;

/** Locked MVP wording for lengths above LENGTH_MFG_MAX. */
export const CAD_ONLY_MESSAGE =
  "Rapid Turn machines up to 8 in — longer STEP is for your CAD / other shop.";

export function isCadOnlyLength(length: number): boolean {
  return length > LENGTH_MFG_MAX;
}

/** Flat-top hex: first vertex at 0°, first flat normal at 30°. */
export const HEX_FLAT_NORMAL0 = Math.PI / 6;

/**
 * Assumed 1/2" E-clip groove, McMaster-style.
 * P/N 97633A160 — E-Style External Retaining Ring for 1/2" shaft.
 * Matches InFlight / Chief Delphi practice (~0.046" wide × Ø0.396" groove).
 * Side-mount / radial install on hex — no corner round-over required.
 */
export const ECLIP_GROOVE = {
  mcmasterPn: "97633A160",
  mcmasterName: "E-Style External Retaining Ring for 1/2 in shaft",
  shaftDiameter: 0.5,
  width: 0.046,
  diameter: 0.396,
  ringThickness: 0.042,
} as const;

export const GROOVE_MAX_COUNT = 12;
export const GROOVE_END_CLEARANCE = 0.02;

export const TAP_OPTIONS = {
  none: {
    id: "none" as const,
    label: "None",
    shortLabel: "None",
    drillDiameter: 0,
    depth: 0,
    note: "",
  },
  "10-32": {
    id: "10-32" as const,
    label: '#10-32 × 0.50" deep',
    shortLabel: "#10-32",
    /** Tap drill #21 */
    drillDiameter: 0.159,
    depth: 0.5,
    note: "Modeled as a #21 (Ø0.159 in) tap-drill hole — threads not shown in CAD.",
  },
  "1/4-20": {
    id: "1/4-20" as const,
    label: '1/4-20 × 0.50" deep',
    shortLabel: "1/4-20",
    /** Tap drill #7 — 0.50" is a sensible depth on 1/2" hex (2× major Ø). */
    drillDiameter: 0.201,
    depth: 0.5,
    note: "Modeled as a #7 (Ø0.201 in) tap-drill hole — threads not shown in CAD.",
  },
} as const;

export type TapId = keyof typeof TAP_OPTIONS;

export const JOURNAL_PRESETS = {
  thunderhex: {
    id: "thunderhex" as const,
    label: 'ThunderHex Ø0.541" (13.75 mm)',
    diameter: 0.541,
    diameterMm: 13.75,
  },
  round500: {
    id: "round500" as const,
    label: 'Ø0.500" round bearing',
    diameter: 0.5,
    diameterMm: 12.7,
  },
} as const;

export const JOURNAL_DIAMETER_DEFAULT = JOURNAL_PRESETS.thunderhex.diameter;
export const JOURNAL_DIAMETER_MIN = 0.25;
export const JOURNAL_LENGTH_MIN = 0.125;
export const JOURNAL_START_DEFAULT = 0.75;
export const JOURNAL_LENGTH_DEFAULT = 1.0;

/** Angular samples for preview + STEP. Includes hex vertices and flat normals. */
export const RING_SAMPLES = 48;
