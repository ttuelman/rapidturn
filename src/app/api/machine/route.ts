import { NextRequest, NextResponse } from "next/server";
import {
  dispatchToMachine,
  getMachineQueue,
  getNextQueuedJob,
  updateOrderStatus,
} from "@/lib/orders";
import { MACHINE_ID } from "@/lib/materials";

export async function GET(request: NextRequest) {
  const machineId = request.nextUrl.searchParams.get("machine") || MACHINE_ID;
  const next = request.nextUrl.searchParams.get("next");

  if (next === "true") {
    const job = getNextQueuedJob(machineId);
    if (!job) {
      return NextResponse.json({ message: "No jobs in queue" }, { status: 204 });
    }
    return NextResponse.json({
      orderId: job.id,
      orderNumber: job.orderNumber,
      programNumber: job.programNumber,
      gcode: job.gcode,
      quantity: job.partSpec.quantity,
      status: job.status,
    });
  }

  const queue = getMachineQueue(machineId);
  return NextResponse.json({
    machineId,
    queue: queue.map((o) => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      programNumber: o.programNumber,
      status: o.status,
      quantity: o.partSpec.quantity,
      queuedAt: o.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action } = body as { orderId: string; action: string };

    if (!orderId || !action) {
      return NextResponse.json({ error: "orderId and action required" }, { status: 400 });
    }

    let order;
    switch (action) {
      case "dispatch":
        order = dispatchToMachine(orderId);
        break;
      case "start":
        order = updateOrderStatus(orderId, "running");
        break;
      case "complete":
        order = updateOrderStatus(orderId, "complete");
        break;
      case "fail":
        order = updateOrderStatus(orderId, "failed");
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
