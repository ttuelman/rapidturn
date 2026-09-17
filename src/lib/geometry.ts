import {
  ECLIP_GROOVE,
  HEX_FLAT_NORMAL0,
  HEX_MODEL_AF,
  RING_SAMPLES,
  TAP_OPTIONS,
} from "@/config/shaft";
import type { ShaftConfig, TapId } from "./types";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ProfileInterval {
  z0: number;
  z1: number;
  clipDiameter: number | null;
}

export interface TapHoleMeta {
  end: "A" | "B";
  tap: TapId;
  drillDiameter: number;
  depth: number;
  zEnter: number;
  zBottom: number;
}

export interface ShaftMesh {
  vertices: Vec3[];
  /** Outward-wound vertex index loops (3 or 4 typically). */
  faces: number[][];
  intervals: ProfileInterval[];
  taps: TapHoleMeta[];
  bbox: { min: Vec3; max: Vec3 };
}

const EPS = 1e-9;

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function hexAcrossCorners(af: number): number {
  return af / Math.cos(Math.PI / 6);
}

/** Radial distance from center to the hex boundary at angle θ (flat-top). */
export function hexBoundaryRadius(theta: number, af: number = HEX_MODEL_AF): number {
  const sector = Math.PI / 3;
  let a = theta - HEX_FLAT_NORMAL0;
  a = ((a % sector) + sector) % sector;
  const fromNormal = Math.min(a, sector - a);
  return af / 2 / Math.cos(fromNormal);
}

export function profileRadius(
  theta: number,
  clipDiameter: number | null,
  af: number = HEX_MODEL_AF,
): number {
  const hexR = hexBoundaryRadius(theta, af);
  if (clipDiameter == null) return hexR;
  return Math.min(hexR, clipDiameter / 2);
}

export function sampleAngles(n: number = RING_SAMPLES): number[] {
  return Array.from({ length: n }, (_, i) => HEX_FLAT_NORMAL0 + (i / n) * Math.PI * 2);
}

export function uniqueSorted(values: number[], eps = 1e-7): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const out: number[] = [];
  for (const v of sorted) {
    if (out.length === 0 || Math.abs(v - out[out.length - 1]) > eps) out.push(v);
  }
  return out;
}

export function clipDiameterAt(z: number, config: ShaftConfig): number | null {
  const interior = z + 1e-8;
  let clip = Number.POSITIVE_INFINITY;

  for (const g of config.grooves) {
    const z0 = g.position - ECLIP_GROOVE.width / 2;
    const z1 = g.position + ECLIP_GROOVE.width / 2;
    if (interior >= z0 && interior < z1) {
      clip = Math.min(clip, ECLIP_GROOVE.diameter);
    }
  }

  if (config.journal.enabled) {
    const z0 = config.journal.start;
    const z1 = config.journal.start + config.journal.length;
    if (interior >= z0 && interior < z1) {
      clip = Math.min(clip, config.journal.diameter);
    }
  }

  return clip === Number.POSITIVE_INFINITY ? null : clip;
}

export function buildIntervals(config: ShaftConfig): ProfileInterval[] {
  const zs = [0, config.length];
  for (const g of config.grooves) {
    zs.push(g.position - ECLIP_GROOVE.width / 2);
    zs.push(g.position + ECLIP_GROOVE.width / 2);
  }
  if (config.journal.enabled) {
    zs.push(config.journal.start);
    zs.push(config.journal.start + config.journal.length);
  }

  const stations = uniqueSorted(zs.map((z) => clamp(z, 0, config.length)));
  const intervals: ProfileInterval[] = [];
  for (let i = 0; i < stations.length - 1; i++) {
    const z0 = stations[i];
    const z1 = stations[i + 1];
    if (z1 - z0 < 1e-8) continue;
    intervals.push({ z0, z1, clipDiameter: clipDiameterAt((z0 + z1) / 2, config) });
  }
  return intervals;
}

export function describeTaps(config: ShaftConfig): TapHoleMeta[] {
  const taps: TapHoleMeta[] = [];
  const a = TAP_OPTIONS[config.endA];
  const b = TAP_OPTIONS[config.endB];
  if (a.id !== "none") {
    taps.push({
      end: "A",
      tap: a.id,
      drillDiameter: a.drillDiameter,
      depth: Math.min(a.depth, config.length),
      zEnter: 0,
      zBottom: Math.min(a.depth, config.length),
    });
  }
  if (b.id !== "none") {
    taps.push({
      end: "B",
      tap: b.id,
      drillDiameter: b.drillDiameter,
      depth: Math.min(b.depth, config.length),
      zEnter: config.length,
      zBottom: Math.max(0, config.length - b.depth),
    });
  }
  return taps;
}

function keyOf(p: Vec3, digits = 7): string {
  return `${p.x.toFixed(digits)}|${p.y.toFixed(digits)}|${p.z.toFixed(digits)}`;
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function area2(points: Vec3[]): number {
  if (points.length < 3) return 0;
  const o = points[0];
  let ax = 0;
  let ay = 0;
  let az = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const c = cross(sub(points[i], o), sub(points[i + 1], o));
    ax += c.x;
    ay += c.y;
    az += c.z;
  }
  return Math.hypot(ax, ay, az) / 2;
}

class MeshBuilder {
  vertices: Vec3[] = [];
  faces: number[][] = [];
  private index = new Map<string, number>();

  vert(p: Vec3): number {
    const k = keyOf(p);
    const existing = this.index.get(k);
    if (existing !== undefined) return existing;
    const i = this.vertices.length;
    this.vertices.push(p);
    this.index.set(k, i);
    return i;
  }

  face(points: Vec3[], outward: Vec3): void {
    if (points.length < 3) return;
    if (area2(points) < 1e-12) return;
    const idx = points.map((p) => this.vert(p));
    const a = this.vertices[idx[0]];
    const b = this.vertices[idx[1]];
    const c = this.vertices[idx[2]];
    const n = cross(sub(b, a), sub(c, a));
    const align = n.x * outward.x + n.y * outward.y + n.z * outward.z;
    if (align < 0) idx.reverse();
    this.faces.push(idx);
  }

  quad(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, outward: Vec3): void {
    this.face([p0, p1, p2, p3], outward);
  }

  ring(z: number, clip: number | null, n = RING_SAMPLES): Vec3[] {
    return sampleAngles(n).map((theta) => {
      const r = profileRadius(theta, clip);
      return { x: r * Math.cos(theta), y: r * Math.sin(theta), z };
    });
  }

  holeRing(z: number, diameter: number, n = RING_SAMPLES): Vec3[] {
    const r = diameter / 2;
    return sampleAngles(n).map((theta) => ({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
      z,
    }));
  }
}

function ringOutward(r0: Vec3, r1: Vec3): Vec3 {
  const mid = { x: (r0.x + r1.x) / 2, y: (r0.y + r1.y) / 2, z: 0 };
  return mid;
}

function addPrismSides(mesh: MeshBuilder, a: Vec3[], b: Vec3[], invert = false): void {
  const n = a.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const out = ringOutward(a[i], a[j]);
    mesh.quad(a[i], a[j], b[j], b[i], invert ? { x: -out.x, y: -out.y, z: 0 } : out);
  }
}

function addAnnulus(mesh: MeshBuilder, outer: Vec3[], inner: Vec3[], normalZ: number): void {
  const n = outer.length;
  const outward = { x: 0, y: 0, z: normalZ };
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    mesh.quad(outer[i], outer[j], inner[j], inner[i], outward);
  }
}

function addDisk(mesh: MeshBuilder, ring: Vec3[], normalZ: number): void {
  const n = ring.length;
  const z = ring[0].z;
  const center = { x: 0, y: 0, z };
  const outward = { x: 0, y: 0, z: normalZ };
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    mesh.face([center, ring[i], ring[j]], outward);
  }
}

function addShoulder(mesh: MeshBuilder, prev: Vec3[], next: Vec3[], zTowardNext: boolean): void {
  const n = prev.length;
  let prevLarger = 0;
  for (let i = 0; i < n; i++) {
    const rp = Math.hypot(prev[i].x, prev[i].y);
    const rn = Math.hypot(next[i].x, next[i].y);
    prevLarger += rp - rn;
  }
  const outer = prevLarger >= 0 ? prev : next;
  const inner = prevLarger >= 0 ? next : prev;
  const outwardZ = prevLarger >= 0 ? (zTowardNext ? 1 : -1) : zTowardNext ? -1 : 1;
  addAnnulus(mesh, outer, inner, outwardZ);
}

export function buildShaftMesh(config: ShaftConfig): ShaftMesh {
  const mesh = new MeshBuilder();
  const intervals = buildIntervals(config);
  const taps = describeTaps(config);
  const n = RING_SAMPLES;

  const rings: Vec3[][] = [];
  for (const iv of intervals) {
    rings.push(mesh.ring(iv.z0, iv.clipDiameter, n));
    rings.push(mesh.ring(iv.z1, iv.clipDiameter, n));
  }

  for (let i = 0; i < intervals.length; i++) {
    addPrismSides(mesh, rings[i * 2], rings[i * 2 + 1]);
    if (i < intervals.length - 1) {
      const thisEnd = rings[i * 2 + 1];
      const nextStart = rings[(i + 1) * 2];
      addShoulder(mesh, thisEnd, nextStart, true);
    }
  }

  const tapA = taps.find((t) => t.end === "A");
  const tapB = taps.find((t) => t.end === "B");
  const through =
    !!tapA &&
    !!tapB &&
    tapA.zBottom + 1e-8 >= tapB.zBottom &&
    tapB.zBottom - 1e-8 <= tapA.zBottom;

  const firstOuter = rings[0];
  const lastOuter = rings[rings.length - 1];

  if (tapA) {
    const enter = mesh.holeRing(0, tapA.drillDiameter, n);
    addAnnulus(mesh, firstOuter, enter, -1);
    if (through && tapB) {
      if (Math.abs(tapA.drillDiameter - tapB.drillDiameter) < 1e-6) {
        const exit = mesh.holeRing(config.length, tapA.drillDiameter, n);
        addPrismSides(mesh, exit, enter, true);
      } else {
        const meet = clamp((tapA.zBottom + tapB.zBottom) / 2, 0, config.length);
        const midA = mesh.holeRing(meet, tapA.drillDiameter, n);
        const midB = mesh.holeRing(meet, tapB.drillDiameter, n);
        const exit = mesh.holeRing(config.length, tapB.drillDiameter, n);
        addPrismSides(mesh, midA, enter, true);
        addShoulder(mesh, midA, midB, true);
        addPrismSides(mesh, exit, midB, true);
      }
    } else {
      const bottom = mesh.holeRing(tapA.zBottom, tapA.drillDiameter, n);
      addPrismSides(mesh, bottom, enter, true);
      addDisk(mesh, bottom, -1);
    }
  } else {
    addDisk(mesh, firstOuter, -1);
  }

  if (tapB) {
    const enter = mesh.holeRing(config.length, tapB.drillDiameter, n);
    addAnnulus(mesh, lastOuter, enter, 1);
    if (!through) {
      const bottom = mesh.holeRing(tapB.zBottom, tapB.drillDiameter, n);
      addPrismSides(mesh, enter, bottom, true);
      addDisk(mesh, bottom, 1);
    }
  } else {
    addDisk(mesh, lastOuter, 1);
  }

  let min: Vec3 = { x: Infinity, y: Infinity, z: Infinity };
  let max: Vec3 = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (const v of mesh.vertices) {
    min = { x: Math.min(min.x, v.x), y: Math.min(min.y, v.y), z: Math.min(min.z, v.z) };
    max = { x: Math.max(max.x, v.x), y: Math.max(max.y, v.y), z: Math.max(max.z, v.z) };
  }

  return {
    vertices: mesh.vertices,
    faces: mesh.faces,
    intervals,
    taps,
    bbox: { min, max },
  };
}

export function meshToPositions(mesh: ShaftMesh): Float32Array {
  let count = 0;
  for (const face of mesh.faces) {
    count += (face.length - 2) * 3;
  }
  const positions = new Float32Array(count * 3);
  let w = 0;
  for (const face of mesh.faces) {
    const v0 = mesh.vertices[face[0]];
    for (let i = 1; i < face.length - 1; i++) {
      const a = mesh.vertices[face[i]];
      const b = mesh.vertices[face[i + 1]];
      for (const p of [v0, a, b]) {
        positions[w++] = p.x;
        positions[w++] = p.y;
        positions[w++] = p.z;
      }
    }
  }
  return positions;
}
