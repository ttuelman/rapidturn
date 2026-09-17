import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDefaultConfig } from "./defaults";
import { clampConfig, validateShaft } from "./validate";

describe("validateShaft", () => {
  it("accepts the default 4 in blank", () => {
    const r = validateShaft(createDefaultConfig());
    assert.equal(r.valid, true);
  });

  it("allows CAD lengths over 8 in and flags them as CAD-only", () => {
    const r = validateShaft({ ...createDefaultConfig(), length: 12 });
    assert.equal(r.valid, true);
    assert.ok(r.warnings.some((w) => /machines up to 8 in/.test(w)));
  });

  it("rejects length over the 36 in CAD soft max", () => {
    const r = validateShaft({ ...createDefaultConfig(), length: 36.01 });
    assert.equal(r.valid, false);
  });

  it("clamps length to the CAD max and keeps grooves on the shaft", () => {
    const clamped = clampConfig({
      ...createDefaultConfig(),
      length: 40,
      grooves: [{ id: "g", position: 8.9 }],
    });
    assert.equal(clamped.length, 36);
    const r = validateShaft(clamped);
    assert.equal(r.valid, true);
  });
});
