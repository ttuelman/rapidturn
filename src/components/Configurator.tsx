"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  ECLIP_GROOVE,
  GROOVE_MAX_COUNT,
  HEX_AF_MAX,
  HEX_AF_MIN,
  HEX_MODEL_AF,
  JOURNAL_DIAMETER_DEFAULT,
  JOURNAL_DIAMETER_MIN,
  JOURNAL_LENGTH_MIN,
  JOURNAL_PRESETS,
  LENGTH_MAX,
  LENGTH_MIN,
  LENGTH_STEP,
  MATERIAL_NAME,
  TAP_OPTIONS,
} from "@/config/shaft";
import { createDefaultConfig, newGrooveId } from "@/lib/defaults";
import { estimateShaft } from "@/lib/estimate";
import type { ShaftConfig, TapId } from "@/lib/types";
import { clampConfig, clampGroovePosition, defaultGroovePosition, validateShaft } from "@/lib/validate";
import { EstimatePanel } from "./EstimatePanel";

const ShaftPreview = dynamic(() => import("./ShaftPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl bg-[#11161c] text-sm text-white/60 sm:h-80 lg:h-[28rem]">
      Loading 3D preview…
    </div>
  ),
});

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-steel-800">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-steel-500">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-steel-200 bg-white px-3 py-2 text-steel-900 focus:border-rapid-500 focus:outline-none focus:ring-2 focus:ring-rapid-200";

export function Configurator() {
  const [config, setConfig] = useState<ShaftConfig>(createDefaultConfig);

  const set = (patch: Partial<ShaftConfig> | ((c: ShaftConfig) => ShaftConfig)) => {
    setConfig((prev) =>
      clampConfig(typeof patch === "function" ? patch(prev) : { ...prev, ...patch }),
    );
  };

  const validation = useMemo(() => validateShaft(config), [config]);
  const estimate = useMemo(() => estimateShaft(config), [config]);

  const addGroove = () => {
    if (config.grooves.length >= GROOVE_MAX_COUNT) return;
    set((c) => ({
      ...c,
      grooves: [...c.grooves, { id: newGrooveId(), position: defaultGroovePosition(c) }],
    }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7">
        <section className="overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-sm">
          <ShaftPreview config={config} />
        </section>

        <section className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-steel-900">Stock</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-steel-100/70 p-3">
              <dt className="text-xs uppercase tracking-wide text-steel-500">Profile</dt>
              <dd className="mt-1 font-medium text-steel-900">0.5 in hex, flat-to-flat</dd>
            </div>
            <div className="rounded-xl bg-steel-100/70 p-3">
              <dt className="text-xs uppercase tracking-wide text-steel-500">Material</dt>
              <dd className="mt-1 font-medium text-steel-900">{MATERIAL_NAME}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm leading-relaxed text-steel-600">
            Modeled across-flats <strong>{HEX_MODEL_AF.toFixed(4)} in</strong> so the shaft slips
            FRC hubs and bearings (vendor window {HEX_AF_MIN.toFixed(3)}–{HEX_AF_MAX.toFixed(3)} in).
            This is not oversized mill hex.
          </p>
        </section>

        <section className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-steel-900">Length</h2>
          <p className="mt-1 text-sm text-steel-500">
            Continuous, {LENGTH_STEP}&quot; steps. Hard max {LENGTH_MAX.toFixed(2)} in.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_8rem]">
            <input
              type="range"
              min={LENGTH_MIN}
              max={LENGTH_MAX}
              step={LENGTH_STEP}
              value={config.length}
              onChange={(e) => set({ length: parseFloat(e.target.value) })}
              className="w-full accent-rapid-600"
              aria-label="Shaft length"
            />
            <input
              type="number"
              min={LENGTH_MIN}
              max={LENGTH_MAX}
              step={LENGTH_STEP}
              value={config.length}
              onChange={(e) => set({ length: parseFloat(e.target.value) || LENGTH_MIN })}
              className={inputClass}
            />
          </div>
          <p className="mt-2 font-mono text-sm text-steel-600">
            {config.length.toFixed(4)} in · {(config.length * 25.4).toFixed(2)} mm
          </p>
        </section>

        <section className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-steel-900">End taps</h2>
          <p className="mt-1 text-sm text-steel-500">
            Each end is independent. Holes are tap-drill size; threads are not modeled in the STEP.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TapSelect
              label="End A (near, z = 0)"
              value={config.endA}
              onChange={(endA) => set({ endA })}
            />
            <TapSelect
              label="End B (far)"
              value={config.endB}
              onChange={(endB) => set({ endB })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-steel-900">E-clip grooves</h2>
              <p className="mt-1 text-sm text-steel-500">
                Side-mount / radial install on hex — no corner round-over. Position is groove
                center from End A.
              </p>
            </div>
            <button
              type="button"
              onClick={addGroove}
              disabled={config.grooves.length >= GROOVE_MAX_COUNT}
              className="shrink-0 rounded-lg bg-steel-100 px-3 py-1.5 text-sm font-medium text-steel-800 hover:bg-steel-200 disabled:opacity-40"
            >
              Add groove
            </button>
          </div>
          <details className="mt-3 rounded-xl bg-steel-50 p-3 text-sm text-steel-600">
            <summary className="cursor-pointer font-medium text-steel-800">
              Assumed 1/2&quot; E-clip dimensions
            </summary>
            <p className="mt-2 leading-relaxed">
              McMaster-Carr <strong>{ECLIP_GROOVE.mcmasterPn}</strong> (
              {ECLIP_GROOVE.mcmasterName}): groove Ø{ECLIP_GROOVE.diameter}&quot; ×{" "}
              {ECLIP_GROOVE.width}&quot; wide (ring thickness {ECLIP_GROOVE.ringThickness}&quot;).
              These are published-compatible dims for a 1/2&quot; E-style ring — confirm against
              the clip you will install.
            </p>
          </details>

          {config.grooves.length === 0 ? (
            <p className="mt-3 text-sm text-steel-500">No grooves. Optional — add one if you need retention.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {config.grooves.map((g, i) => (
                <li
                  key={g.id}
                  className="grid grid-cols-[auto_1fr_6.5rem_auto] items-end gap-3 rounded-xl bg-steel-50 p-3"
                >
                  <span className="pb-2 text-xs font-medium text-steel-500">#{i + 1}</span>
                  <input
                    type="range"
                    min={clampGroovePosition(0, config.length)}
                    max={clampGroovePosition(config.length, config.length)}
                    step={0.01}
                    value={g.position}
                    onChange={(e) =>
                      set((c) => ({
                        ...c,
                        grooves: c.grooves.map((x) =>
                          x.id === g.id ? { ...x, position: parseFloat(e.target.value) } : x,
                        ),
                      }))
                    }
                    className="accent-rapid-600"
                    aria-label={`Groove ${i + 1} position`}
                  />
                  <input
                    type="number"
                    step={0.01}
                    value={Number(g.position.toFixed(3))}
                    onChange={(e) =>
                      set((c) => ({
                        ...c,
                        grooves: c.grooves.map((x) =>
                          x.id === g.id
                            ? { ...x, position: parseFloat(e.target.value) || 0 }
                            : x,
                        ),
                      }))
                    }
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set((c) => ({ ...c, grooves: c.grooves.filter((x) => x.id !== g.id) }))
                    }
                    className="pb-2 text-steel-400 hover:text-red-600"
                    aria-label={`Remove groove ${i + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-steel-900">Turn-down / journal</h2>
              <p className="mt-1 text-sm text-steel-500">
                One turned section. Hex outside the journal stays as a shoulder/stop.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-steel-800">
              <input
                type="checkbox"
                checked={config.journal.enabled}
                onChange={(e) =>
                  set((c) => ({ ...c, journal: { ...c.journal, enabled: e.target.checked } }))
                }
                className="h-4 w-4 accent-rapid-600"
              />
              Enable
            </label>
          </div>

          {config.journal.enabled && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {Object.values(JOURNAL_PRESETS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      set((c) => ({ ...c, journal: { ...c.journal, diameter: p.diameter } }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
                      Math.abs(config.journal.diameter - p.diameter) < 1e-6
                        ? "bg-rapid-600 text-white ring-rapid-600"
                        : "bg-white text-steel-700 ring-steel-200 hover:bg-steel-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Start from End A (in)">
                  <input
                    type="number"
                    min={0}
                    max={config.length}
                    step={LENGTH_STEP}
                    value={config.journal.start}
                    onChange={(e) =>
                      set((c) => ({
                        ...c,
                        journal: { ...c.journal, start: parseFloat(e.target.value) || 0 },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Length (in)" hint={`min ${JOURNAL_LENGTH_MIN}`}>
                  <input
                    type="number"
                    min={JOURNAL_LENGTH_MIN}
                    step={LENGTH_STEP}
                    value={config.journal.length}
                    onChange={(e) =>
                      set((c) => ({
                        ...c,
                        journal: { ...c.journal, length: parseFloat(e.target.value) || JOURNAL_LENGTH_MIN },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Target round Ø (in)"
                  hint={`min ${JOURNAL_DIAMETER_MIN} · default ${JOURNAL_DIAMETER_DEFAULT}`}
                >
                  <input
                    type="number"
                    min={JOURNAL_DIAMETER_MIN}
                    step={0.001}
                    value={config.journal.diameter}
                    onChange={(e) =>
                      set((c) => ({
                        ...c,
                        journal: {
                          ...c.journal,
                          diameter: parseFloat(e.target.value) || JOURNAL_DIAMETER_DEFAULT,
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <p className="text-xs leading-relaxed text-steel-500">
                Ø ≥ modeled AF ({HEX_MODEL_AF}&quot;) clips hex corners to that circle
                (ThunderHex-style). Smaller diameters become a true round journal.
              </p>
            </div>
          )}
        </section>

        {validation.warnings.length > 0 && (
          <ul className="space-y-1 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            {validation.warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-6 lg:self-start">
        <EstimatePanel config={config} estimate={estimate} validation={validation} />
      </div>
    </div>
  );
}

function TapSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TapId;
  onChange: (tap: TapId) => void;
}) {
  return (
    <Field label={label}>
      <select
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value as TapId)}
      >
        {Object.values(TAP_OPTIONS).map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
