import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ECLIP_GROOVE } from "../config/shaft";
import { USE_CASES } from "../config/useCases";
import { createDefaultConfig } from "./defaults";
import { buildDrawingModel, drawingNotes, fmtIn } from "./drawing";
import { parseConfigQuery, configToQuery } from "./share";

describe("buildDrawingModel", () => {
  it("callouts overall length", () => {
    const m = buildDrawingModel({ ...createDefaultConfig(), length: 6.5 });
    assert.equal(m.length, 6.5);
    assert.equal(fmtIn(m.length), '6.500"');
    assert.match(drawingNotes(m).join("\n"), /OVERALL 6\.500"/);
  });

  it("includes both tap sizes with depth", () => {
    const m = buildDrawingModel({
      ...createDefaultConfig(),
      endA: "10-32",
      endB: "1/4-20",
    });
    assert.equal(m.taps.length, 2);
    assert.equal(m.taps[0].end, "A");
    assert.equal(m.taps[0].depth, 0.5);
    assert.equal(m.taps[0].label, "#10-32");
    assert.equal(m.taps[1].end, "B");
    assert.equal(m.taps[1].label, "1/4-20");
    const notes = drawingNotes(m).join("\n");
    assert.match(notes, /END A #10-32 × 0\.500" DEEP/);
    assert.match(notes, /END B 1\/4-20 × 0\.500" DEEP/);
  });

  it("marks untapped ends", () => {
    const m = buildDrawingModel({
      ...createDefaultConfig(),
      endA: "none",
      endB: "none",
    });
    assert.equal(m.taps.length, 0);
    const notes = drawingNotes(m).join("\n");
    assert.match(notes, /END A UNTAPPED/);
    assert.match(notes, /END B UNTAPPED/);
  });

  it("includes E-clip position, width, and diameter", () => {
    const m = buildDrawingModel({
      ...createDefaultConfig(),
      grooves: [{ id: "g", position: 0.75 }],
    });
    assert.equal(m.grooves.length, 1);
    assert.equal(m.grooves[0].position, 0.75);
    assert.equal(m.grooves[0].width, ECLIP_GROOVE.width);
    assert.equal(m.grooves[0].diameter, ECLIP_GROOVE.diameter);
    assert.ok(m.segments.some((s) => s.kind === "groove"));
    assert.match(
      drawingNotes(m).join("\n"),
      /E-CLIP 1 0\.750" FROM A · 0\.046" W × Ø0\.396/,
    );
  });

  it("includes journal axial extent and diameter", () => {
    const m = buildDrawingModel({
      ...createDefaultConfig(),
      journal: { enabled: true, start: 1, length: 1.5, diameter: 0.541 },
    });
    assert.ok(m.journal);
    assert.equal(m.journal?.start, 1);
    assert.equal(m.journal?.length, 1.5);
    assert.equal(m.journal?.diameter, 0.541);
    assert.equal(m.journal?.clipsCorners, true);
    assert.match(
      drawingNotes(m).join("\n"),
      /JOURNAL Ø0\.541 CLIP CORNERS × 1\.500" START 1\.000" FROM A/,
    );
  });

  it("tracks the same config as a shareable URL", () => {
    const source = {
      ...createDefaultConfig(),
      length: 5,
      endA: "none" as const,
      endB: "10-32" as const,
      grooves: [{ id: "g", position: 0.75 }],
      journal: { enabled: true, start: 2, length: 1, diameter: 0.375 },
    };
    const fromUrl = parseConfigQuery(configToQuery(source));
    const a = drawingNotes(buildDrawingModel(source));
    const b = drawingNotes(buildDrawingModel(fromUrl));
    assert.deepEqual(a, b);
    assert.match(a.join("\n"), /END A UNTAPPED/);
    assert.match(a.join("\n"), /END B #10-32/);
    assert.match(a.join("\n"), /JOURNAL Ø0\.375 ROUND/);
  });

  it("matches every Chief Delphi use-case config", () => {
    for (const uc of USE_CASES) {
      const notes = drawingNotes(buildDrawingModel(uc.config)).join("\n");
      assert.match(notes, new RegExp(`OVERALL ${fmtIn(uc.config.length)}`));
      if (uc.config.endA === "none") assert.match(notes, /END A UNTAPPED/);
      else assert.match(notes, /END A/);
      if (uc.config.grooves.length) assert.match(notes, /E-CLIP/);
      if (uc.config.journal.enabled) assert.match(notes, /JOURNAL/);
    }
  });
});
