import { TAP_OPTIONS, type TapId } from "@/config/shaft";
import { createDefaultConfig, newGrooveId } from "./defaults";
import type { ShaftConfig } from "./types";
import { clampConfig } from "./validate";

function isTapId(value: string): value is TapId {
  return value in TAP_OPTIONS;
}

export function configToQuery(config: ShaftConfig): string {
  const p = new URLSearchParams();
  p.set("l", trimNum(config.length));
  p.set("ea", config.endA);
  p.set("eb", config.endB);
  if (config.grooves.length) {
    p.set("g", config.grooves.map((g) => trimNum(g.position)).join(","));
  }
  if (config.journal.enabled) {
    p.set(
      "j",
      [config.journal.start, config.journal.length, config.journal.diameter]
        .map(trimNum)
        .join(","),
    );
  }
  return p.toString();
}

export function configPath(config: ShaftConfig): string {
  return `/?${configToQuery(config)}`;
}

export function parseConfigQuery(search: string): ShaftConfig {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const base = createDefaultConfig();

  const l = parseFloat(q.get("l") ?? "");
  if (Number.isFinite(l)) base.length = l;

  const ea = q.get("ea") ?? "";
  const eb = q.get("eb") ?? "";
  if (isTapId(ea)) base.endA = ea;
  if (isTapId(eb)) base.endB = eb;

  const g = q.get("g");
  if (g) {
    base.grooves = g
      .split(",")
      .map((s) => parseFloat(s))
      .filter((n) => Number.isFinite(n))
      .map((position) => ({ id: newGrooveId(), position }));
  }

  const j = q.get("j");
  if (j) {
    const [start, length, diameter] = j.split(",").map((s) => parseFloat(s));
    if ([start, length, diameter].every(Number.isFinite)) {
      base.journal = { enabled: true, start, length, diameter };
    }
  }

  return clampConfig(base);
}

export function hasConfigQuery(search: string): boolean {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return ["l", "ea", "eb", "g", "j"].some((k) => q.has(k));
}

function trimNum(n: number): string {
  return String(Math.round(n * 10000) / 10000);
}
