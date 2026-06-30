import type { PartSpec, QuoteBreakdown } from "./types";
import { getMaterial } from "./materials";
import { getMaxOd, getTotalLength, validatePartSpec } from "./validation";

const SETUP_MINUTES = 8;
const SETUP_COST_PER_MIN = 1.85;
const MACHINING_COST_PER_MIN = 2.4;
const PART_OFF_MINUTES = 0.75;
const FACE_MINUTES = 0.5;
const CHAMFER_MINUTES = 0.35;
const BAR_STICKOUT = 0.15;
const BAR_WASTE = 0.1;

function stockVolume(spec: PartSpec): number {
  const length = getTotalLength(spec) + BAR_STICKOUT + BAR_WASTE;
  const radius = spec.stockDiameter / 2;
  return Math.PI * radius * radius * length;
}

function materialWeightLb(spec: PartSpec): number {
  const material = getMaterial(spec.materialId);
  return stockVolume(spec) * material.densityLbPerCuIn;
}

function estimateMachiningMinutes(spec: PartSpec): number {
  const material = getMaterial(spec.materialId);
  const totalLength = getTotalLength(spec);
  const maxOd = getMaxOd(spec);

  let minutes = SETUP_MINUTES + FACE_MINUTES + PART_OFF_MINUTES;

  if (spec.frontChamfer.enabled) minutes += CHAMFER_MINUTES;
  if (spec.backChamfer.enabled) minutes += CHAMFER_MINUTES;

  const stockRadius = spec.stockDiameter / 2;
  const avgRadius = (stockRadius + maxOd / 2) / 2;
  const materialRemoved =
    Math.PI * (stockRadius * stockRadius - (maxOd / 2) * (maxOd / 2)) * totalLength;

  const rpm = Math.min(
    3500,
    Math.max(200, (material.surfaceSpeedSfm * 12) / (Math.PI * spec.stockDiameter)),
  );
  const ipm = rpm * material.feedPerRev;
  const inchesOfCut = totalLength * spec.segments.length * 1.2;

  const roughingMinutes = inchesOfCut / Math.max(ipm, 1);
  const finishingMinutes = totalLength * 0.4;

  minutes += roughingMinutes + finishingMinutes + materialRemoved * 0.02;

  return Math.max(minutes, 10);
}

function quantityDiscountRate(quantity: number): number {
  if (quantity >= 50) return 0.15;
  if (quantity >= 25) return 0.1;
  if (quantity >= 10) return 0.07;
  if (quantity >= 5) return 0.04;
  return 0;
}

export function calculateQuote(spec: PartSpec): QuoteBreakdown | null {
  const validation = validatePartSpec(spec);
  if (!validation.valid) return null;

  const material = getMaterial(spec.materialId);
  const weightLb = materialWeightLb(spec);
  const materialCost = weightLb * material.costPerLb;

  const minutesPerPart = estimateMachiningMinutes(spec);
  const machiningCost = minutesPerPart * MACHINING_COST_PER_MIN;
  const setupCost = SETUP_MINUTES * SETUP_COST_PER_MIN;

  const unitBeforeDiscount = materialCost + machiningCost + setupCost / spec.quantity;
  const discountRate = quantityDiscountRate(spec.quantity);
  const quantityDiscount = unitBeforeDiscount * discountRate * spec.quantity;
  const unitPrice = unitBeforeDiscount * (1 - discountRate);
  const totalPrice = unitPrice * spec.quantity;

  const leadTimeDays = spec.quantity <= 5 ? 2 : spec.quantity <= 25 ? 3 : 5;

  return {
    materialCost: round(materialCost * spec.quantity),
    machiningCost: round(machiningCost * spec.quantity),
    setupCost: round(setupCost),
    quantityDiscount: round(quantityDiscount),
    unitPrice: round(unitPrice),
    totalPrice: round(totalPrice),
    estimatedMinutes: round(minutesPerPart * spec.quantity + SETUP_MINUTES),
    leadTimeDays,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
