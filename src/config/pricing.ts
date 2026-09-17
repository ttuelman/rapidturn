/**
 * Placeholder shop rates for the on-screen estimate.
 * Not a live quote. Not for sale. Tune this file only.
 */
export const PRICING = {
  currency: "USD",
  notForSale: true,
  disclaimer:
    "Estimate only — not for sale. Rates are placeholders and will change before Rapid Turn takes orders.",
  /** Base cut-to-length 7075 hex, one piece */
  basePrice: 4.5,
  perInch: 0.95,
  tapEach: 1.35,
  grooveEach: 2.25,
  journalBase: 3.25,
  journalPerInch: 1.4,
  setupFee: 3.75,
  material: {
    id: "al7075t6",
    name: "7075-T6 aluminum",
    densityLbPerCuIn: 0.101,
    costPerLb: 8.75,
  },
} as const;
