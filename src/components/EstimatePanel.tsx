"use client";

import { LENGTH_MFG_MAX } from "@/config/shaft";
import { PRICING } from "@/config/pricing";
import { configPath } from "@/lib/share";
import { downloadStep } from "@/lib/step";
import type { EstimateBreakdown, ShaftConfig, ValidationResult } from "@/lib/types";
import { useState } from "react";

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function EstimatePanel({
  config,
  estimate,
  validation,
}: {
  config: ShaftConfig;
  estimate: EstimateBreakdown;
  validation: ValidationResult;
}) {
  const canDownload = validation.valid;
  const cadOnly = estimate.cadOnly;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}${configPath(config)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this config URL", url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <aside className="rounded-2xl border border-rapid-200 bg-gradient-to-b from-white to-rapid-50 p-5 shadow-sm lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-steel-900">Price estimate</h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-700">
            {cadOnly ? "CAD-only — not manufactured" : "Not for sale"}
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
          {cadOnly ? "CAD only" : "Preview quote"}
        </span>
      </div>

      {cadOnly && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200">
          Rapid Turn machines shafts up to {LENGTH_MFG_MAX.toFixed(2)} in. This longer config is
          for CAD or another shop. Preview, estimate, and STEP still work. Buy stays off above{" "}
          {LENGTH_MFG_MAX.toFixed(2)} in.
        </p>
      )}

      {validation.errors.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {validation.errors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}

      <dl className="mt-4 space-y-2 text-sm text-steel-600">
        <div className="flex justify-between gap-4">
          <dt>7075-T6 stock</dt>
          <dd>{money(estimate.material)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Cut to length</dt>
          <dd>{money(estimate.cutoff)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>End taps</dt>
          <dd>{money(estimate.taps)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>E-clip grooves</dt>
          <dd>{money(estimate.grooves)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Turn-down</dt>
          <dd>{money(estimate.journal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Setup</dt>
          <dd>{money(estimate.setup)}</dd>
        </div>
        <div className="flex justify-between border-t border-steel-200 pt-3 text-2xl font-bold text-steel-900">
          <dt>Total</dt>
          <dd>{money(estimate.total)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-steel-500">{PRICING.disclaimer}</p>

      <button
        type="button"
        disabled={!canDownload}
        onClick={() => downloadStep(config)}
        className="mt-5 w-full rounded-xl bg-rapid-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-rapid-200 transition hover:bg-rapid-700 disabled:cursor-not-allowed disabled:bg-steel-300 disabled:shadow-none"
      >
        Download STEP
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="mt-2 w-full rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm font-semibold text-steel-800 hover:bg-steel-50"
      >
        {copied ? "Link copied" : "Copy shareable link"}
      </button>

      <button
        type="button"
        disabled
        title={
          cadOnly
            ? `Buy will stay disabled above ${LENGTH_MFG_MAX.toFixed(2)} in`
            : "Ordering is not open yet"
        }
        className="mt-2 w-full cursor-not-allowed rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm font-semibold text-steel-400"
      >
        {cadOnly ? "Buy — not manufactured at this length" : "Buy — coming later"}
      </button>
      <p className="mt-2 text-center text-xs text-steel-500">
        No checkout, waitlist, or payment in v1. STEP matches this configuration. Edit the URL
        params to come back later.
      </p>
    </aside>
  );
}
