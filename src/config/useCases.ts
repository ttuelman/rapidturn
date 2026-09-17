import type { ShaftConfig } from "@/lib/types";

export interface UseCase {
  id: string;
  title: string;
  story: string;
  threadLabel: string;
  threadUrl: string;
  config: ShaftConfig;
}

/**
 * Public Chief Delphi patterns only. No team names or unsourced quotes.
 * Thread URLs are the ones cited in the Rapid Turn CD research brief.
 */
export const USE_CASES: UseCase[] = [
  {
    id: "between-steps",
    title: "Length that is not a 0.5 in step",
    story:
      "FRC vendors often sell 1/2 in hex in fixed 0.5 in increments (plus a long untapped bar). Teams still cut to the length in CAD — 4.375 in is a typical gap. This preset is both ends #10-32 × 0.50 in, the REV-style tap.",
    threadLabel: "Hex Shaft — REV vs VEX vs AndyMark",
    threadUrl: "https://www.chiefdelphi.com/t/hex-shaft-rev-vs-vex-vs-andymark/167316",
    config: {
      length: 4.375,
      endA: "10-32",
      endB: "10-32",
      grooves: [],
      journal: { enabled: false, start: 0.75, length: 1, diameter: 0.541 },
    },
  },
  {
    id: "wcd-tap",
    title: "WCD wheel retention: tap + bolt + washer",
    story:
      "The common no-lathe retention path on a West Coast drive live axle is a tapped end, bolt, and washer. #10-32 shows up on REV-style shafts; 1/4-20 on ThunderHex. This preset is one-end #10-32 so you can keep the other end blank.",
    threadLabel: "How to secure wheels on a WCD chassis?",
    threadUrl: "https://www.chiefdelphi.com/t/how-to-secure-wheels-on-a-wcd-chassis/398842",
    config: {
      length: 5,
      endA: "10-32",
      endB: "none",
      grooves: [],
      journal: { enabled: false, start: 0.75, length: 1, diameter: 0.541 },
    },
  },
  {
    id: "thunderhex-tap",
    title: "1/4-20 ends (ThunderHex practice)",
    story:
      "ThunderHex is commonly pre-bored ~0.2 in and tapped 1/4-20. Rapid Turn offers that size next to #10-32 so the shaft matches the screws already in the tote.",
    threadLabel: "ThunderHex Bearing Explained",
    threadUrl: "https://www.chiefdelphi.com/t/thunderhex-bearing-explained/139200",
    config: {
      length: 4,
      endA: "1/4-20",
      endB: "1/4-20",
      grooves: [],
      journal: { enabled: false, start: 0.75, length: 1, diameter: 0.541 },
    },
  },
  {
    id: "eclip",
    title: "Side-mount E-clip grooves",
    story:
      "Lathe teams use E-clip / side-mount rings for light, vibration-proof retention. They install radially on hex — no corner round-over. InFlight described a 1/2 in E-clip groove about 0.046 in wide × Ø0.396 in. Two grooves from End A, centers at 0.35 in and 3.65 in.",
    threadLabel: "Shaft Collars",
    threadUrl: "https://www.chiefdelphi.com/t/shaft-collars/166169",
    config: {
      length: 4,
      endA: "none",
      endB: "none",
      grooves: [
        { id: "uc-eclip-a", position: 0.35 },
        { id: "uc-eclip-b", position: 3.65 },
      ],
      journal: { enabled: false, start: 0.75, length: 1, diameter: 0.541 },
    },
  },
  {
    id: "journal",
    title: "ThunderHex journal for 13.75 mm bearings",
    story:
      "Teams with lathes turn hex corners down to a ~13.75 mm / 0.541 in circle so the shaft runs in dedicated round bearings. Hex outside the journal stays as a shoulder/stop. A 0.500 in target is the other common round-bearing journal.",
    threadLabel: "ThunderHex inspired question",
    threadUrl: "https://www.chiefdelphi.com/t/thunderhex-inspired-question/144975",
    config: {
      length: 4,
      endA: "1/4-20",
      endB: "none",
      grooves: [],
      journal: { enabled: true, start: 0.75, length: 1.5, diameter: 0.541 },
    },
  },
];

export const USE_CASE_DISCLAIMER =
  "These are public Chief Delphi patterns, written in FRC shop language. Not a FIRST or Chief Delphi endorsement.";
