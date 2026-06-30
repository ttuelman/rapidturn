"use client";

import { QuoteBuilder, useQuote } from "@/components/QuoteBuilder";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { createDefaultPartSpec } from "@/lib/validation";
import type { Order, PartSpec } from "@/lib/types";
import { useState } from "react";

export default function ShopPage() {
  const [spec, setSpec] = useState<PartSpec>(createDefaultPartSpec);
  const { quote, loading, errors } = useQuote(spec);
  const [buying, setBuying] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const handleBuyNow = async () => {
    setBuying(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partSpec: spec, customerEmail: "customer@rapidturn.com" }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        await fetch("/api/machine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.id, action: "dispatch" }),
        });
      }
    } finally {
      setBuying(false);
    }
  };

  if (order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <OrderConfirmation order={order} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-steel-900">Configure Your Part</h1>
        <p className="mt-2 text-steel-600">
          Select material, define your OD profile, and get an instant quote.
        </p>
      </div>
      <QuoteBuilder
        spec={spec}
        onChange={setSpec}
        quote={quote}
        quoteLoading={loading}
        quoteErrors={errors}
        onBuyNow={handleBuyNow}
        buying={buying}
      />
    </div>
  );
}
