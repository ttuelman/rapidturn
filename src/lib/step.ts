import { ECLIP_GROOVE, HEX_AF_MAX, HEX_AF_MIN, HEX_MODEL_AF, MATERIAL_NAME } from "@/config/shaft";
import { TAP_OPTIONS } from "@/config/shaft";
import type { ShaftConfig } from "./types";
import { buildShaftMesh, type ShaftMesh, type Vec3 } from "./geometry";

function isoTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "");
}

function stepString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const t = Math.abs(n) < 1e-12 ? 0 : n;
  let s = t.toFixed(8);
  s = s.replace(/\.?0+$/, "");
  if (s === "-0") s = "0";
  return s;
}

class StepWriter {
  private nextId = 1;
  private lines: string[] = [];

  ent(type: string, args: string): number {
    const id = this.nextId++;
    this.lines.push(`#${id}=${type}(${args});`);
    return id;
  }

  raw(line: string): number {
    const id = this.nextId++;
    this.lines.push(`#${id}=${line}`);
    return id;
  }

  dump(): string {
    return this.lines.join("\n");
  }
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

function norm(v: Vec3): Vec3 {
  const m = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / m, y: v.y / m, z: v.z / m };
}

function faceNormal(pts: Vec3[]): Vec3 {
  let ax = 0;
  let ay = 0;
  let az = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    ax += (p.y - q.y) * (p.z + q.z);
    ay += (p.z - q.z) * (p.x + q.x);
    az += (p.x - q.x) * (p.y + q.y);
  }
  return norm({ x: ax, y: ay, z: az });
}

function summarize(config: ShaftConfig): string {
  const grooves = config.grooves
    .map((g) => g.position.toFixed(3))
    .join(",");
  const j = config.journal.enabled
    ? `journal start=${config.journal.start.toFixed(3)} len=${config.journal.length.toFixed(3)} dia=${config.journal.diameter.toFixed(3)}`
    : "journal=off";
  return [
    `Rapid Turn 0.5in 7075-T6 FRC hex shaft`,
    `AF_model=${HEX_MODEL_AF} (FRC fit ${HEX_AF_MIN}-${HEX_AF_MAX})`,
    `length=${config.length.toFixed(4)}`,
    `endA=${config.endA}`,
    `endB=${config.endB}`,
    `eclip=${ECLIP_GROOVE.mcmasterPn} w=${ECLIP_GROOVE.width} d=${ECLIP_GROOVE.diameter} @ [${grooves || "none"}]`,
    j,
  ].join("; ");
}

export function shaftFilename(config: ShaftConfig): string {
  const tap = (id: string) => id.replace("/", "").replace("#", "").replace("-", "");
  const g = config.grooves.length ? `G${config.grooves.length}` : "G0";
  const j = config.journal.enabled ? `J${config.journal.diameter.toFixed(3).replace(".", "p")}` : "J0";
  const L = config.length.toFixed(3).replace(".", "p");
  return `rapidturn-hex-L${L}-A${tap(config.endA)}-B${tap(config.endB)}-${g}-${j}.step`;
}

export function buildStep(config: ShaftConfig, mesh: ShaftMesh = buildShaftMesh(config)): string {
  const w = new StepWriter();
  const desc = summarize(config);

  const ctx = w.ent(
    "APPLICATION_CONTEXT",
    stepString("configuration controlled 3d designs of mechanical parts and assemblies"),
  );
  w.ent(
    "APPLICATION_PROTOCOL_DEFINITION",
    `${stepString("international standard")},${stepString("config_control_design")},1994,#${ctx}`,
  );
  const pctx = w.ent("PRODUCT_CONTEXT", `${stepString("")},#${ctx},${stepString("mechanical")}`);
  const product = w.ent(
    "PRODUCT",
    `${stepString("RT-HEX-05")},${stepString("0.5 in FRC hex shaft")},${stepString(desc)},(#${pctx})`,
  );
  const pdf = w.ent("PRODUCT_DEFINITION_FORMATION", `${stepString("")},${stepString("")},#${product}`);
  const pdctx = w.ent(
    "PRODUCT_DEFINITION_CONTEXT",
    `${stepString("part definition")},#${ctx},${stepString("design")}`,
  );
  const pdef = w.ent("PRODUCT_DEFINITION", `${stepString("")},${stepString("")},#${pdf},#${pdctx}`);
  const pshape = w.ent("PRODUCT_DEFINITION_SHAPE", `${stepString("")},${stepString("")},#${pdef}`);

  const siMm = w.raw("( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );");
  const inchFactor = w.ent("LENGTH_MEASURE_WITH_UNIT", `LENGTH_MEASURE(25.4),#${siMm}`);
  const inch = w.raw(
    `( CONVERSION_BASED_UNIT(${stepString("INCH")},#${inchFactor}) LENGTH_UNIT() NAMED_UNIT(*) );`,
  );
  const angle = w.raw("( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );");
  const solid = w.raw("( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );");
  const uncertainty = w.ent(
    "UNCERTAINTY_MEASURE_WITH_UNIT",
    `LENGTH_MEASURE(1.E-6),#${inch},${stepString("distance accuracy")},${stepString("minimum")}`,
  );
  const geoCtx = w.raw(
    `( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${uncertainty})) GLOBAL_UNIT_ASSIGNED_CONTEXT((#${inch},#${angle},#${solid})) REPRESENTATION_CONTEXT(${stepString("RT")},${stepString("3D")}) );`,
  );

  const pointIds: number[] = [];
  for (const v of mesh.vertices) {
    pointIds.push(w.ent("CARTESIAN_POINT", `${stepString("")},(${fmt(v.x)},${fmt(v.y)},${fmt(v.z)})`));
  }
  const vertexIds = pointIds.map((pid) => w.ent("VERTEX_POINT", `${stepString("")},#${pid}`));

  const edgeKey = new Map<string, { id: number; a: number; b: number }>();
  const getEdge = (ia: number, ib: number): { id: number; same: boolean } => {
    const lo = Math.min(ia, ib);
    const hi = Math.max(ia, ib);
    const k = `${lo}-${hi}`;
    const existing = edgeKey.get(k);
    if (existing) {
      return { id: existing.id, same: existing.a === ia };
    }
    const pa = mesh.vertices[ia];
    const pb = mesh.vertices[ib];
    const d = sub(pb, pa);
    const mag = Math.hypot(d.x, d.y, d.z) || 1;
    const dir = w.ent("DIRECTION", `${stepString("")},(${fmt(d.x / mag)},${fmt(d.y / mag)},${fmt(d.z / mag)})`);
    const vec = w.ent("VECTOR", `${stepString("")},#${dir},${fmt(mag)}`);
    const line = w.ent("LINE", `${stepString("")},#${pointIds[ia]},#${vec}`);
    const edge = w.ent("EDGE_CURVE", `${stepString("")},#${vertexIds[ia]},#${vertexIds[ib]},#${line},.T.`);
    edgeKey.set(k, { id: edge, a: ia, b: ib });
    return { id: edge, same: true };
  };

  const faceIds: number[] = [];
  for (const face of mesh.faces) {
    if (face.length < 3) continue;
    const pts = face.map((i) => mesh.vertices[i]);
    const n = faceNormal(pts);
    const t = sub(pts[1], pts[0]);
    const tn = norm(t);
    if (Math.hypot(tn.x, tn.y, tn.z) < 1e-12) continue;

    const origin = w.ent(
      "CARTESIAN_POINT",
      `${stepString("")},(${fmt(pts[0].x)},${fmt(pts[0].y)},${fmt(pts[0].z)})`,
    );
    const axis = w.ent("DIRECTION", `${stepString("")},(${fmt(n.x)},${fmt(n.y)},${fmt(n.z)})`);
    const ref = w.ent("DIRECTION", `${stepString("")},(${fmt(tn.x)},${fmt(tn.y)},${fmt(tn.z)})`);
    const place = w.ent("AXIS2_PLACEMENT_3D", `${stepString("")},#${origin},#${axis},#${ref}`);
    const plane = w.ent("PLANE", `${stepString("")},#${place}`);

    const oriented: number[] = [];
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const e = getEdge(a, b);
      oriented.push(
        w.ent("ORIENTED_EDGE", `${stepString("")},*,*,#${e.id},${e.same ? ".T." : ".F."}`),
      );
    }
    const loop = w.ent("EDGE_LOOP", `${stepString("")},(${oriented.map((id) => `#${id}`).join(",")})`);
    const bound = w.ent("FACE_OUTER_BOUND", `${stepString("")},#${loop},.T.`);
    faceIds.push(w.ent("ADVANCED_FACE", `${stepString("")},(#${bound}),#${plane},.T.`));
  }

  const shell = w.ent("CLOSED_SHELL", `${stepString("Shaft")},(${faceIds.map((id) => `#${id}`).join(",")})`);
  const brep = w.ent("MANIFOLD_SOLID_BREP", `${stepString("Shaft")},#${shell}`);
  const shape = w.ent(
    "ADVANCED_BREP_SHAPE_REPRESENTATION",
    `${stepString("")},(#${brep}),#${geoCtx}`,
  );
  w.ent("SHAPE_DEFINITION_REPRESENTATION", `#${pshape},#${shape}`);

  return [
    "ISO-10303-21;",
    "HEADER;",
    `FILE_DESCRIPTION((${stepString(desc)}),'2;1');`,
    `FILE_NAME(${stepString(shaftFilename(config))},${stepString(isoTimestamp())},(${stepString("Rapid Turn")}),(${stepString("Rapid Turn")}),${stepString("Rapid Turn FRC hex-shaft configurator")},${stepString(MATERIAL_NAME)},${stepString("")});`,
    "FILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));",
    "ENDSEC;",
    "DATA;",
    w.dump(),
    "ENDSEC;",
    "END-ISO-10303-21;",
    "",
  ].join("\n");
}

export function downloadStep(config: ShaftConfig): void {
  const text = buildStep(config);
  const blob = new Blob([text], { type: "application/step" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = shaftFilename(config);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function tapNote(end: "A" | "B", config: ShaftConfig): string {
  const tap = TAP_OPTIONS[end === "A" ? config.endA : config.endB];
  return tap.note;
}
