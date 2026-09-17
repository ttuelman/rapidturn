import { HEX_MODEL_AF, LENGTH_MFG_MAX } from "@/config/shaft";
import { PRICING } from "@/config/pricing";
import type { EstimateBreakdown, ShaftConfig } from "./types";
import { hexAcrossCorners } from "./geometry";

function hexVolume(length: number): number {
  // Regular hexagon area = (√3 / 2) * AF²
  return (Math.sqrt(3) / 2) * HEX_MODEL_AF * HEX_MODEL_AF * length;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function estimateShaft(config: ShaftConfig): EstimateBreakdown {
  const weightLb = hexVolume(config.length) * PRICING.material.densityLbPerCuIn;
  const material = weightLb * PRICING.material.costPerLb;
  const cutoff = PRICING.basePrice + config.length * PRICING.perInch;

  const tapCount = (config.endA !== "none" ? 1 : 0) + (config.endB !== "none" ? 1 : 0);
  const taps = tapCount * PRICING.tapEach;
  const grooves = config.grooves.length * PRICING.grooveEach;

  let journal = 0;
  if (config.journal.enabled) {
    const ac = hexAcrossCorners(HEX_MODEL_AF);
    const cuts = config.journal.diameter < ac - 1e-6;
    if (cuts) {
      journal = PRICING.journalBase + config.journal.length * PRICING.journalPerInch;
    }
  }

  const setup = PRICING.setupFee;
  const total = material + cutoff + taps + grooves + journal + setup;

  return {
    material: roundMoney(material),
    cutoff: roundMoney(cutoff),
    taps: roundMoney(taps),
    grooves: roundMoney(grooves),
    journal: roundMoney(journal),
    setup: roundMoney(setup),
    total: roundMoney(total),
    notForSale: true,
    cadOnly: config.length > LENGTH_MFG_MAX,
  };
}
