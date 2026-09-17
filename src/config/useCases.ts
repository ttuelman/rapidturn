import type { ShaftConfig } from "@/lib/types";

export interface UseCase {
  id: string;
  title: string;
  story: string;
  threadUrl: string;
  config: ShaftConfig;
}

const JOURNAL_OFF = {
  enabled: false,
  start: 0,
  length: 1.5,
  diameter: 0.541,
} as const;

/**
 * Cards and configs follow uploads/USE_CASES_CD.md.
 * Stories stay in FRC language. No team names or unsourced quotes.
 * “Discussed on Chief Delphi” uses the thread URL from that doc (or the CD
 * thread the research brief cites when the card only points at the research doc).
 */
export const USE_CASES: UseCase[] = [
  {
    id: "wcd-tap",
    title: "WCD wheel retention — tap + bolt + washer",
    story:
      "Live axle / WCD: tap the shaft end, retain the wheel with bolt + washer (often 1/4-20 on ThunderHex-style, #10-32 on REV rounded hex). Collars eat track width; tap+bolt is the common compact pattern.",
    threadUrl: "https://www.chiefdelphi.com/t/how-to-secure-wheels-on-a-wcd-chassis/398842",
    config: {
      length: 7,
      endA: "1/4-20",
      endB: "none",
      grooves: [],
      journal: { ...JOURNAL_OFF },
    },
  },
  {
    id: "rev-both-ends",
    title: "REV-style shaft — #10-32 both ends, custom length",
    story:
      "REV sells fixed 0.5 in steps with both ends #10-32. Teams often need a length between steps (e.g. 4.375 in) or only one end tapped.",
    threadUrl: "https://www.chiefdelphi.com/t/hex-shaft-rev-vs-vex-vs-andymark/167316",
    config: {
      length: 4.375,
      endA: "10-32",
      endB: "10-32",
      grooves: [],
      journal: { ...JOURNAL_OFF },
    },
  },
  {
    id: "eclip-mid",
    title: "Gearbox / mid-shaft — E-clip groove",
    story:
      "Lathe teams use E-clips / side-mount rings for compact axial retention on hex without stretching a snap ring over corners. Groove position is the design variable.",
    threadUrl: "https://www.chiefdelphi.com/t/retaining-rings-and-e-clips/464806",
    config: {
      length: 5,
      endA: "none",
      endB: "none",
      grooves: [{ id: "uc-eclip", position: 0.75 }],
      journal: { ...JOURNAL_OFF },
    },
  },
  {
    id: "journal",
    title: "Round bearing journal — turn-down / ThunderHex-compatible OD",
    story:
      "Teams with lathes turn hex corners down for round bearings (~13.75 mm / ThunderHex-style) and may leave a hex shoulder as a stop. COTS ThunderHex exists so teams without lathes can skip this — Rapid Turn does it to CAD.",
    threadUrl: "https://www.chiefdelphi.com/t/thunderhex-bearing-explained/139200",
    config: {
      length: 7,
      endA: "1/4-20",
      endB: "none",
      grooves: [],
      journal: { enabled: true, start: 0, length: 1.5, diameter: 0.541 },
    },
  },
  {
    id: "between-rev",
    title: "Between REV sizes — intake / mechanism shaft",
    story:
      "Mechanism shafts where fixed COTS lengths force spacers or a bandsaw cut. Configure exact CAD length ≤ 8 in with the retention you designed.",
    threadUrl: "https://www.chiefdelphi.com/t/hex-shaft-rev-vs-vex-vs-andymark/167316",
    config: {
      length: 3.25,
      endA: "10-32",
      endB: "none",
      grooves: [],
      journal: { ...JOURNAL_OFF },
    },
  },
];

export const USE_CASE_DISCLAIMER =
  "Examples illustrate common patterns from public Chief Delphi discussion. Not endorsed by FIRST or Chief Delphi.";
