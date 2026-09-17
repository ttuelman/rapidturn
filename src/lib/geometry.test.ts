import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ECLIP_GROOVE, HEX_MODEL_AF, LENGTH_MFG_MAX } from "../config/shaft";
import { createDefaultConfig } from "./defaults";
import {
  buildIntervals,
  buildShaftMesh,
  hexAcrossCorners,
  hexBoundaryRadius,
  profileRadius,
} from "./geometry";

describe("hex profile", () => {
  it("matches AF on flats and AC on vertices", () => {
    const flat = hexBoundaryRadius(Math.PI / 2, 0.5);
    const vertex = hexBoundaryRadius(0, 0.5);
    assert.ok(Math.abs(flat - 0.25) < 1e-9);
    assert.ok(Math.abs(vertex - hexAcrossCorners(0.5) / 2) < 1e-9);
  });

  it("clips corners for ThunderHex 0.541 and becomes a circle below AF", () => {
    const corner = hexBoundaryRadius(0);
    const thunder = profileRadius(0, 0.541);
    const journal = profileRadius(0, 0.375);
    const flat = profileRadius(Math.PI / 2, 0.541);
    assert.ok(thunder < corner);
    assert.ok(Math.abs(thunder - 0.2705) < 1e-6);
    assert.ok(Math.abs(journal - 0.1875) < 1e-9);
    assert.ok(Math.abs(flat - HEX_MODEL_AF / 2) < 1e-9);
  });
});

describe("buildShaftMesh", () => {
  it("spans the configured length and hex AF", () => {
    const mesh = buildShaftMesh(createDefaultConfig());
    assert.ok(Math.abs(mesh.bbox.min.z) < 1e-6);
    assert.ok(Math.abs(mesh.bbox.max.z - 4) < 1e-6);
    const af = mesh.bbox.max.y - mesh.bbox.min.y;
    assert.ok(Math.abs(af - HEX_MODEL_AF) < 1e-3);
    assert.ok(mesh.faces.length > 20);
  });

  it("builds an 8.00 in manufacturing-length shaft", () => {
    const mesh = buildShaftMesh({ ...createDefaultConfig(), length: LENGTH_MFG_MAX });
    assert.ok(Math.abs(mesh.bbox.max.z - 8) < 1e-6);
  });

  it("cuts E-clip grooves to the published diameter", () => {
    const config = createDefaultConfig();
    config.grooves = [{ id: "g1", position: 1.0 }];
    const mesh = buildShaftMesh(config);
    const target = ECLIP_GROOVE.diameter / 2;
    const onGroove = mesh.vertices.filter(
      (v) =>
        Math.abs(v.z - 1) <= ECLIP_GROOVE.width / 2 + 1e-6 &&
        Math.abs(Math.hypot(v.x, v.y) - target) < 0.01,
    );
    assert.ok(onGroove.length > 0);
    const grooveIv = mesh.intervals.find((iv) => iv.z0 < 1 && iv.z1 > 1);
    assert.equal(grooveIv?.clipDiameter, ECLIP_GROOVE.diameter);
  });

  it("applies a turn-down journal and keeps hex shoulders", () => {
    const config = createDefaultConfig();
    config.journal = { enabled: true, start: 1, length: 1.5, diameter: 0.541 };
    const mesh = buildShaftMesh(config);
    const onJournal = mesh.vertices.filter(
      (v) =>
        v.z >= 1 - 1e-6 &&
        v.z <= 2.5 + 1e-6 &&
        Math.abs(Math.hypot(v.x, v.y) - 0.2705) < 0.01,
    );
    const shoulder = mesh.vertices.filter((v) => v.z < 0.5);
    const shoulderCorner = Math.max(...shoulder.map((v) => Math.hypot(v.x, v.y)));
    assert.ok(onJournal.length > 0);
    assert.ok(shoulderCorner > 0.28);
    const jIv = mesh.intervals.find((iv) => iv.z0 >= 1 - 1e-6 && iv.z1 <= 2.5 + 1e-6);
    assert.equal(jIv?.clipDiameter, 0.541);
  });

  it("models both tap sizes as end bores", () => {
    const config = createDefaultConfig();
    config.endA = "10-32";
    config.endB = "1/4-20";
    const mesh = buildShaftMesh(config);
    assert.equal(mesh.taps.length, 2);
    assert.equal(mesh.taps[0].drillDiameter, 0.159);
    assert.equal(mesh.taps[1].drillDiameter, 0.201);
    const nearA = mesh.vertices.filter((v) => v.z < 0.01 && Math.hypot(v.x, v.y) < 0.09);
    const nearB = mesh.vertices.filter((v) => v.z > 3.99 && Math.hypot(v.x, v.y) < 0.11);
    assert.ok(nearA.length > 0);
    assert.ok(nearB.length > 0);
  });

  it("splits intervals at groove and journal bounds", () => {
    const config = createDefaultConfig();
    config.grooves = [{ id: "g1", position: 0.4 }];
    config.journal = { enabled: true, start: 2, length: 1, diameter: 0.5 };
    const iv = buildIntervals(config);
    assert.ok(iv.length >= 4);
    assert.equal(iv[0].z0, 0);
    assert.equal(iv[iv.length - 1].z1, 4);
  });
});
