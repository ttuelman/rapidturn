import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ECLIP_GROOVE, HEX_MODEL_AF } from "../config/shaft";
import { createDefaultConfig } from "./defaults";
import { buildShaftMesh } from "./geometry";
import { buildStep, shaftFilename } from "./step";

function parsePoints(step: string): { x: number; y: number; z: number }[] {
  const pts: { x: number; y: number; z: number }[] = [];
  const re = /CARTESIAN_POINT\('[^']*',\(([^)]+)\)\)/g;
  for (const m of step.matchAll(re)) {
    const [x, y, z] = m[1].split(",").map(Number);
    pts.push({ x, y, z });
  }
  return pts;
}

describe("buildStep", () => {
  it("writes a closed B-rep whose points match length and AF", () => {
    const config = createDefaultConfig();
    const step = buildStep(config);
    assert.match(step, /ISO-10303-21;/);
    assert.match(step, /MANIFOLD_SOLID_BREP/);
    assert.match(step, /CLOSED_SHELL/);
    assert.match(step, /INCH/);
    assert.match(step, new RegExp(`AF_model=${HEX_MODEL_AF}`));
    assert.match(step, /length=4\.0000/);

    const pts = parsePoints(step);
    const zs = pts.map((p) => p.z);
    assert.ok(Math.min(...zs) <= 1e-6);
    assert.ok(Math.max(...zs) >= 4 - 1e-6);
    const ys = pts.map((p) => p.y);
    assert.ok(Math.max(...ys) * 2 > HEX_MODEL_AF - 0.01);
  });

  it("embeds both tap sizes, E-clip dims, and journal in the file", () => {
    const config = createDefaultConfig();
    config.endA = "10-32";
    config.endB = "1/4-20";
    config.grooves = [{ id: "g1", position: 1.25 }];
    config.journal = { enabled: true, start: 2.5, length: 1, diameter: 0.541 };
    const step = buildStep(config, buildShaftMesh(config));
    assert.match(step, /endA=10-32/);
    assert.match(step, /endB=1\/4-20/);
    assert.match(step, new RegExp(ECLIP_GROOVE.mcmasterPn));
    assert.match(step, /1\.250/);
    assert.match(step, /journal start=2\.500/);
    assert.match(step, /dia=0\.541/);
    assert.match(shaftFilename(config), /A1032/);
    assert.match(shaftFilename(config), /B1420/);
  });

  it("builds STEP for a CAD-only length over 8 in", () => {
    const config = { ...createDefaultConfig(), length: 12 };
    const step = buildStep(config);
    assert.match(step, /length=12\.0000/);
    const zs = parsePoints(step).map((p) => p.z);
    assert.ok(Math.max(...zs) >= 12 - 1e-6);
  });
});
