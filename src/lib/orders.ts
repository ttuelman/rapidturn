import type { Order, PartSpec } from "./types";
import { MACHINE_ID } from "./materials";
import { getMaterial } from "./materials";
import { getTotalLength } from "./validation";
import { calculateQuote } from "./pricing";
import { generateGcode } from "./gcode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readOrders(): Order[] {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) return [];
  const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
  return JSON.parse(raw) as Order[];
}

function writeOrders(orders: Order[]): void {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

let orderCounter = 1000;

function loadCounter(orders: Order[]): void {
  for (const o of orders) {
    const num = parseInt(o.orderNumber.replace(/\D/g, ""), 10);
    if (!isNaN(num) && num >= orderCounter) orderCounter = num + 1;
  }
}

export function createOrder(partSpec: PartSpec, customerEmail: string): Order {
  const quote = calculateQuote(partSpec);
  if (!quote) {
    throw new Error("Invalid part specification");
  }

  const orders = readOrders();
  loadCounter(orders);

  const orderNumber = `RT-${orderCounter++}`;
  const programNumber = `O${orderNumber.replace(/\D/g, "").padStart(4, "0")}`;
  const now = new Date().toISOString();

  const order: Order = {
    id: uuidv4(),
    orderNumber,
    programNumber,
    partSpec,
    quote,
    status: "queued",
    customerEmail,
    gcode: generateGcode(partSpec, programNumber, orderNumber),
    createdAt: now,
    updatedAt: now,
    machineId: MACHINE_ID,
  };

  orders.push(order);
  writeOrders(orders);

  return order;
}

export function getOrder(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

export function getOrderByNumber(orderNumber: string): Order | undefined {
  return readOrders().find((o) => o.orderNumber === orderNumber);
}

export function listOrders(): Order[] {
  return readOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getMachineQueue(machineId: string = MACHINE_ID): Order[] {
  return readOrders().filter(
    (o) =>
      o.machineId === machineId &&
      ["queued", "dispatched", "running"].includes(o.status),
  );
}

export function updateOrderStatus(id: string, status: Order["status"]): Order | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeOrders(orders);
  return orders[idx];
}

export function getNextQueuedJob(machineId: string = MACHINE_ID): Order | null {
  const queue = getMachineQueue(machineId).filter((o) => o.status === "queued");
  return queue.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] ?? null;
}

export function dispatchToMachine(orderId: string): Order | null {
  return updateOrderStatus(orderId, "dispatched");
}

export function formatOrderSummary(order: Order): string {
  const mat = getMaterial(order.partSpec.materialId);
  const len = getTotalLength(order.partSpec);
  return `${order.partSpec.quantity}x ${mat.name} Ø${order.partSpec.stockDiameter}\" × ${len.toFixed(3)}\" L`;
}
