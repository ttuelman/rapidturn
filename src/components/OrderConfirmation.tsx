"use client";

import type { Order } from "@/lib/types";
import Link from "next/link";

export function OrderConfirmation({ order }: { order: Order }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-lg">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-bold text-steel-900">Order Confirmed</h1>
      <p className="mt-2 text-steel-600">
        Your parts are queued for production. No human touch required.
      </p>

      <dl className="mt-6 space-y-2 rounded-xl bg-white p-4 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-steel-500">Order #</dt>
          <dd className="font-mono font-semibold">{order.orderNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-steel-500">Program #</dt>
          <dd className="font-mono font-semibold">{order.programNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-steel-500">Machine</dt>
          <dd>{order.machineId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-steel-500">Status</dt>
          <dd className="capitalize text-rapid-600">{order.status}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-steel-500">Total</dt>
          <dd className="font-semibold">${order.quote.totalPrice.toFixed(2)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={`/api/gcode/${order.id}`}
          className="rounded-lg border border-steel-200 bg-white px-4 py-2 text-sm font-medium text-steel-700 hover:bg-steel-50"
        >
          Download G-code
        </a>
        <Link
          href="/shop"
          className="rounded-lg bg-rapid-600 px-4 py-2 text-sm font-medium text-white hover:bg-rapid-700"
        >
          Order More Parts
        </Link>
      </div>
    </div>
  );
}
