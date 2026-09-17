import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDefaultConfig } from "./defaults";
import { clampConfig, validateShaft } from "./validate";

describe("validateShaft", () => {
  it("accepts the default 4 in blank", () => {
    const r = validateShaft(createDefaultConfig());
    assert.equal(r.valid, true);
  });

  it("rejects length over 8 in", () => {
    const r = validateShaft({ ...createDefaultConfig(), length: 8.01 });
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => /8\.00/.test(e)));
  });

  it("clamps length and keeps grooves on the shaft", () => {
    const clamped = clampConfig({
      ...createDefaultConfig(),
      length: 9,
      grooves: [{ id: "g", position: 8.9 }],
    });
    assert.equal(clamped.length, 8);
    const r = validateShaft(clamped);
    assert.equal(r.valid, true);
  });
});
