"use client";

import type { PartSpec, QuoteBreakdown } from "@/lib/types";
import { MATERIALS, STOCK_DIAMETERS, MACHINE_NAME } from "@/lib/materials";
import { MAX_SEGMENTS } from "@/lib/materials";
import { MAX_PART_LENGTH, MAX_OD_DIAMETER, MIN_OD_DIAMETER } from "@/lib/materials";
import { getTotalLength } from "@/lib/validation";
import { useCallback, useEffect, useState } from "react";

interface Props {
  spec: PartSpec;
  onChange: (spec: PartSpec) => void;
  quote: QuoteBreakdown | null;
  quoteLoading: boolean;
  quoteErrors: string[];
  onBuyNow: () => void;
  buying: boolean;
}

export function QuoteBuilder({
  spec,
  onChange,
  quote,
  quoteLoading,
  quoteErrors,
  onBuyNow,
  buying,
}: Props) {
  const totalLength = getTotalLength(spec);

  const updateSegment = (id: string, field: "diameter" | "length", value: number) => {
    onChange({
      ...spec,
      segments: spec.segments.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };

  const addSegment = () => {
    if (spec.segments.length >= MAX_SEGMENTS) return;
    onChange({
      ...spec,
      segments: [
        ...spec.segments,
        {
          id: `seg-${Date.now()}`,
          diameter: spec.segments[spec.segments.length - 1].diameter,
          length: 0.25,
        },
      ],
    });
  };

  const removeSegment = (id: string) => {
    if (spec.segments.length <= 1) return;
    onChange({ ...spec, segments: spec.segments.filter((s) => s.id !== id) });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
        <section className="rounded-xl border border-steel-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-steel-900">Material & Stock</h2>
          <p className="mt-1 text-sm text-steel-500">
            {MACHINE_NAME} — max Ø0.5&quot; bar, single setup
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-steel-700">Material</span>
              <select
                className="mt-1 w-full rounded-lg border border-steel-200 px-3 py-2 text-steel-900 focus:border-rapid-500 focus:outline-none focus:ring-2 focus:ring-rapid-200"
                value={spec.materialId}
                onChange={(e) =>
                  onChange({ ...spec, materialId: e.target.value as PartSpec["materialId"] })
                }
              >
                {Object.values(MATERIALS).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-steel-700">Bar Diameter</span>
              <select
                className="mt-1 w-full rounded-lg border border-steel-200 px-3 py-2 text-steel-900 focus:border-rapid-500 focus:outline-none focus:ring-2 focus:ring-rapid-200"
                value={spec.stockDiameter}
                onChange={(e) =>
                  onChange({
                    ...spec,
                    stockDiameter: parseFloat(e.target.value) as PartSpec["stockDiameter"],
                  })
                }
              >
                {STOCK_DIAMETERS.map((d) => (
                  <option key={d} value={d}>
                    {d}&quot;
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-steel-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-steel-900">OD Profile</h2>
              <p className="mt-1 text-sm text-steel-500">
                Up to {MAX_SEGMENTS} segments · max {MAX_PART_LENGTH}&quot; total
              </p>
            </div>
            {spec.segments.length < MAX_SEGMENTS && (
              <button
                type="button"
                onClick={addSegment}
                className="rounded-lg bg-steel-100 px-3 py-1.5 text-sm font-medium text-steel-700 hover:bg-steel-200"
              >
                + Step
              </button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {spec.segments.map((seg, i) => (
              <div
                key={seg.id}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-3 rounded-lg bg-steel-50 p-3"
              >
                <span className="pb-2 text-sm font-medium text-steel-500">#{i + 1}</span>
                <label className="block">
                  <span className="text-xs text-steel-500">OD (in)</span>
                  <input
                    type="number"
                    step="0.001"
                    min={MIN_OD_DIAMETER}
                    max={MAX_OD_DIAMETER}
                    value={seg.diameter}
                    onChange={(e) => updateSegment(seg.id, "diameter", parseFloat(e.target.value))}
                    className="mt-0.5 w-full rounded border border-steel-200 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-steel-500">Length (in)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    value={seg.length}
                    onChange={(e) => updateSegment(seg.id, "length", parseFloat(e.target.value))}
                    className="mt-0.5 w-full rounded border border-steel-200 px-2 py-1.5 text-sm"
                  />
                </label>
                {spec.segments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSegment(seg.id)}
                    className="pb-2 text-steel-400 hover:text-red-500"
                    aria-label="Remove segment"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="mt-3 text-sm text-steel-500">
            Total length: <strong className="text-steel-800">{totalLength.toFixed(3)}&quot;</strong>
          </p>
        </section>

        <section className="rounded-xl border border-steel-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-steel-900">Features</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={spec.frontChamfer.enabled}
                onChange={(e) =>
                  onChange({
                    ...spec,
                    frontChamfer: { ...spec.frontChamfer, enabled: e.target.checked },
                  })
                }
                className="rounded border-steel-300 text-rapid-600"
              />
              <span className="text-sm text-steel-700">Front chamfer</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={spec.backChamfer.enabled}
                onChange={(e) =>
                  onChange({
                    ...spec,
                    backChamfer: { ...spec.backChamfer, enabled: e.target.checked },
                  })
                }
                className="rounded border-steel-300 text-rapid-600"
              />
              <span className="text-sm text-steel-700">Back chamfer</span>
            </label>
          </div>

          <label className="mt-4 block max-w-xs">
            <span className="text-sm font-medium text-steel-700">Quantity</span>
            <input
              type="number"
              min={1}
              max={100}
              value={spec.quantity}
              onChange={(e) =>
                onChange({ ...spec, quantity: parseInt(e.target.value, 10) || 1 })
              }
              className="mt-1 w-full rounded-lg border border-steel-200 px-3 py-2"
            />
          </label>
        </section>

        <PartPreview spec={spec} />
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-6 rounded-xl border border-rapid-200 bg-gradient-to-b from-rapid-50 to-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-steel-900">Instant Quote</h2>

          {quoteErrors.length > 0 && (
            <ul className="mt-3 space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {quoteErrors.map((e) => (
                <li key={e}>• {e}</li>
              ))}
            </ul>
          )}

          {quote && quoteErrors.length === 0 && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-steel-600">
                <span>Material</span>
                <span>${quote.materialCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-steel-600">
                <span>Machining</span>
                <span>${quote.machiningCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-steel-600">
                <span>Setup</span>
                <span>${quote.setupCost.toFixed(2)}</span>
              </div>
              {quote.quantityDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Qty discount</span>
                  <span>-${quote.quantityDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-steel-200 pt-2">
                <div className="flex justify-between text-2xl font-bold text-steel-900">
                  <span>Total</span>
                  <span>${quote.totalPrice.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-xs text-steel-500">
                  ${quote.unitPrice.toFixed(2)}/ea · ~{quote.estimatedMinutes} min ·{" "}
                  {quote.leadTimeDays} business days
                </p>
              </div>
            </div>
          )}

          {quoteLoading && (
            <p className="mt-4 text-sm text-steel-500 animate-pulse">Calculating…</p>
          )}

          <button
            type="button"
            onClick={onBuyNow}
            disabled={!quote || quoteErrors.length > 0 || buying}
            className="mt-6 w-full rounded-xl bg-rapid-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-rapid-200 transition hover:bg-rapid-700 disabled:cursor-not-allowed disabled:bg-steel-300 disabled:shadow-none"
          >
            {buying ? "Processing…" : "Buy Now"}
          </button>

          <p className="mt-3 text-center text-xs text-steel-500">
            G-code auto-generated · Dispatched to Haas CL-1 on purchase
          </p>
        </div>
      </div>
    </div>
  );
}

function PartPreview({ spec }: { spec: PartSpec }) {
  const totalLength = getTotalLength(spec);
  const maxStock = spec.stockDiameter;
  const scale = 120 / Math.max(totalLength, maxStock);

  let z = 0;
  const rects = spec.segments.map((seg) => {
    const x = z;
    z += seg.length;
    return {
      x: x * scale,
      width: seg.length * scale,
      height: seg.diameter * scale,
    };
  });

  return (
    <section className="rounded-xl border border-steel-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-steel-900">Part Preview</h2>
      <div className="mt-4 flex justify-center overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalLength * scale + 20} ${maxStock * scale + 20}`}
          className="h-24"
          aria-label="Part profile preview"
        >
          <rect
            x="0"
            y="0"
            width={totalLength * scale}
            height={maxStock * scale}
            fill="#e8eaed"
            stroke="#9aa3ae"
            strokeWidth="1"
          />
          {rects.map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={(maxStock * scale - r.height) / 2}
              width={r.width}
              height={r.height}
              fill="#0c8ae9"
              opacity="0.7"
            />
          ))}
        </svg>
      </div>
    </section>
  );
}

export function useQuote(spec: PartSpec) {
  const [quote, setQuote] = useState<QuoteBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchQuote = useCallback(async (s: PartSpec) => {
    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (data.valid) {
        setQuote(data.quote);
        setErrors([]);
      } else {
        setQuote(null);
        setErrors(data.errors || ["Invalid configuration"]);
      }
    } catch {
      setErrors(["Quote unavailable"]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchQuote(spec), 300);
    return () => clearTimeout(timer);
  }, [spec, fetchQuote]);

  return { quote, loading, errors };
}
