import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDefaultConfig } from "./defaults";
import { estimateShaft } from "./estimate";

describe("estimateShaft", () => {
  it("labels the quote as not for sale", () => {
    const q = estimateShaft(createDefaultConfig());
    assert.equal(q.notForSale, true);
    assert.ok(q.total > 0);
  });

  it("rises with length, both tap sizes, grooves, and a journal", () => {
    const base = estimateShaft(createDefaultConfig());
    const long = estimateShaft({ ...createDefaultConfig(), length: 8 });
    const taps = estimateShaft({ ...createDefaultConfig(), endA: "10-32", endB: "1/4-20" });
    const grooves = estimateShaft({
      ...createDefaultConfig(),
      grooves: [
        { id: "a", position: 0.3 },
        { id: "b", position: 2 },
      ],
    });
    const journal = estimateShaft({
      ...createDefaultConfig(),
      journal: { enabled: true, start: 1, length: 1.5, diameter: 0.541 },
    });

    assert.ok(long.total > base.total);
    assert.ok(taps.taps > base.taps);
    assert.ok(taps.total > base.total);
    assert.ok(grooves.grooves > 0);
    assert.ok(grooves.total > base.total);
    assert.ok(journal.journal > 0);
    assert.ok(journal.total > base.total);
  });
});
