import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { USE_CASES } from "../config/useCases";
import { createDefaultConfig } from "./defaults";
import { configPath, configToQuery, parseConfigQuery } from "./share";

describe("shareable config URLs", () => {
  it("round-trips length, both taps, grooves, and a journal", () => {
    const config = {
      ...createDefaultConfig(),
      length: 6.5,
      endA: "10-32" as const,
      endB: "1/4-20" as const,
      grooves: [
        { id: "a", position: 0.5 },
        { id: "b", position: 5.5 },
      ],
      journal: { enabled: true, start: 1.5, length: 2, diameter: 0.541 },
    };
    const again = parseConfigQuery(configToQuery(config));
    assert.equal(again.length, 6.5);
    assert.equal(again.endA, "10-32");
    assert.equal(again.endB, "1/4-20");
    assert.equal(again.grooves.length, 2);
    assert.equal(again.grooves[0].position, 0.5);
    assert.equal(again.journal.enabled, true);
    assert.equal(again.journal.diameter, 0.541);
    assert.match(configPath(config), /^\//);
  });

  it("opens every use-case preset from its query string", () => {
    for (const uc of USE_CASES) {
      const parsed = parseConfigQuery(configToQuery(uc.config));
      assert.equal(parsed.length, uc.config.length);
      assert.equal(parsed.endA, uc.config.endA);
      assert.equal(parsed.endB, uc.config.endB);
      assert.equal(parsed.grooves.length, uc.config.grooves.length);
      assert.equal(parsed.journal.enabled, uc.config.journal.enabled);
    }
  });
});
