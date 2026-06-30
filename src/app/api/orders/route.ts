import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrder, listOrders } from "@/lib/orders";
import { validatePartSpec } from "@/lib/validation";
import type { PartSpec } from "@/lib/types";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const order = getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  }
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const partSpec = body.partSpec as PartSpec;
    const customerEmail = (body.customerEmail as string) || "customer@example.com";

    const validation = validatePartSpec(partSpec);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors }, { status: 400 });
    }

    const order = createOrder(partSpec, customerEmail);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
