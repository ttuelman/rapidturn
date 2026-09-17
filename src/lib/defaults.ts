import {
  JOURNAL_DIAMETER_DEFAULT,
  JOURNAL_LENGTH_DEFAULT,
  JOURNAL_START_DEFAULT,
  LENGTH_DEFAULT,
} from "@/config/shaft";
import type { ShaftConfig } from "./types";

export function createDefaultConfig(): ShaftConfig {
  return {
    length: LENGTH_DEFAULT,
    endA: "none",
    endB: "none",
    grooves: [],
    journal: {
      enabled: false,
      start: JOURNAL_START_DEFAULT,
      length: JOURNAL_LENGTH_DEFAULT,
      diameter: JOURNAL_DIAMETER_DEFAULT,
    },
  };
}

export function newGrooveId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
