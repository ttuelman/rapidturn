export type MaterialId = "al6061" | "steel1018";

export type StockDiameter = 0.25 | 0.375 | 0.5;

export interface Material {
  id: MaterialId;
  name: string;
  densityLbPerCuIn: number;
  costPerLb: number;
  surfaceSpeedSfm: number;
  feedPerRev: number;
  description: string;
}

export interface OdSegment {
  id: string;
  diameter: number;
  length: number;
}

export interface ChamferSpec {
  enabled: boolean;
  size: number;
}

export interface PartSpec {
  materialId: MaterialId;
  stockDiameter: StockDiameter;
  segments: OdSegment[];
  frontChamfer: ChamferSpec;
  backChamfer: ChamferSpec;
  quantity: number;
}

export interface QuoteBreakdown {
  materialCost: number;
  machiningCost: number;
  setupCost: number;
  quantityDiscount: number;
  unitPrice: number;
  totalPrice: number;
  estimatedMinutes: number;
  leadTimeDays: number;
}

export type OrderStatus =
  | "pending_payment"
  | "queued"
  | "dispatched"
  | "running"
  | "complete"
  | "failed";

export interface Order {
  id: string;
  orderNumber: string;
  programNumber: string;
  partSpec: PartSpec;
  quote: QuoteBreakdown;
  status: OrderStatus;
  customerEmail: string;
  gcode: string;
  createdAt: string;
  updatedAt: string;
  machineId: string;
}

export interface MachineJob {
  orderId: string;
  orderNumber: string;
  programNumber: string;
  gcode: string;
  materialName: string;
  quantity: number;
  status: OrderStatus;
  queuedAt: string;
}
