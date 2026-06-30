import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getOrder(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return new NextResponse(order.gcode, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${order.programNumber}.nc"`,
    },
  });
}
