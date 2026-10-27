import { ECLIP_GROOVE, HEX_MODEL_AF, TAP_OPTIONS } from "@/config/shaft";
import { buildIntervals, describeTaps } from "./geometry";
import type { ShaftConfig } from "./types";

export function fmtIn(n: number, digits = 3): string {
  return `${n.toFixed(digits)}"`;
}

export interface DrawingSegment {
  z0: number;
  z1: number;
  /** Solid outline diameter in the side view (flats / reduced OD). */
  outlineDia: number;
  /** If set and larger than outline, dashed corner-clip OD (ThunderHex-style). */
  clipDia: number | null;
  kind: "hex" | "groove" | "journal";
}

export interface DrawingTap {
  end: "A" | "B";
  label: string;
  depth: number;
  drillDiameter: number;
}

export interface DrawingGroove {
  position: number;
  width: number;
  diameter: number;
  z0: number;
  z1: number;
}

export interface DrawingJournal {
  start: number;
  length: number;
  diameter: number;
  clipsCorners: boolean;
}

export interface DrawingModel {
  length: number;
  af: number;
  segments: DrawingSegment[];
  taps: DrawingTap[];
  grooves: DrawingGroove[];
  journal: DrawingJournal | null;
}

export function buildDrawingModel(config: ShaftConfig): DrawingModel {
  const intervals = buildIntervals(config);
  const segments: DrawingSegment[] = intervals.map((iv) => {
    const clip = iv.clipDiameter;
    let kind: DrawingSegment["kind"] = "hex";
    if (clip != null && Math.abs(clip - ECLIP_GROOVE.diameter) < 1e-6) kind = "groove";
    else if (clip != null) kind = "journal";
    const outlineDia = clip == null ? HEX_MODEL_AF : Math.min(HEX_MODEL_AF, clip);
    const clipDia = clip != null && clip > HEX_MODEL_AF + 1e-6 ? clip : null;
    return { z0: iv.z0, z1: iv.z1, outlineDia, clipDia, kind };
  });

  const taps: DrawingTap[] = describeTaps(config).map((t) => ({
    end: t.end,
    label: TAP_OPTIONS[t.tap].shortLabel,
    depth: t.depth,
    drillDiameter: t.drillDiameter,
  }));

  const grooves: DrawingGroove[] = config.grooves.map((g) => ({
    position: g.position,
    width: ECLIP_GROOVE.width,
    diameter: ECLIP_GROOVE.diameter,
    z0: g.position - ECLIP_GROOVE.width / 2,
    z1: g.position + ECLIP_GROOVE.width / 2,
  }));

  const journal: DrawingJournal | null = config.journal.enabled
    ? {
        start: config.journal.start,
        length: config.journal.length,
        diameter: config.journal.diameter,
        clipsCorners: config.journal.diameter > HEX_MODEL_AF + 1e-6,
      }
    : null;

  return {
    length: config.length,
    af: HEX_MODEL_AF,
    segments,
    taps,
    grooves,
    journal,
  };
}

/** Shop-drawing notes: same values the SVG and STEP config must show. */
export function drawingNotes(model: DrawingModel): string[] {
  const tapA = model.taps.find((t) => t.end === "A");
  const tapB = model.taps.find((t) => t.end === "B");
  const notes = [
    `OVERALL ${fmtIn(model.length)}`,
    `AF ${fmtIn(model.af, 4)}`,
    tapA
      ? `END A ${tapA.label} × ${fmtIn(tapA.depth)} DEEP`
      : "END A UNTAPPED",
    tapB
      ? `END B ${tapB.label} × ${fmtIn(tapB.depth)} DEEP`
      : "END B UNTAPPED",
    ...model.grooves.map(
      (g, i) =>
        `E-CLIP ${i + 1} ${fmtIn(g.position)} FROM A · ${fmtIn(g.width)} W × Ø${g.diameter.toFixed(3)}`,
    ),
  ];
  if (model.journal) {
    const kind = model.journal.clipsCorners ? "CLIP CORNERS" : "ROUND";
    notes.push(
      `JOURNAL Ø${model.journal.diameter.toFixed(3)} ${kind} × ${fmtIn(model.journal.length)} START ${fmtIn(model.journal.start)} FROM A`,
    );
  }
  return notes;
}
