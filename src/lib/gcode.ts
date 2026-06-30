import type { PartSpec } from "./types";
import { getMaterial } from "./materials";
import { getTotalLength } from "./validation";

function fmt(n: number, decimals = 4): string {
  return n.toFixed(decimals);
}

function lineFeed(materialId: PartSpec["materialId"], stockDiameter: number): {
  rpm: number;
  feed: number;
} {
  const material = getMaterial(materialId);
  const rpm = Math.min(
    3500,
    Math.max(200, Math.round((material.surfaceSpeedSfm * 12) / (Math.PI * stockDiameter))),
  );
  const feed = Math.round(rpm * material.feedPerRev * 1000) / 1000;
  return { rpm, feed };
}

export function generateGcode(
  spec: PartSpec,
  programNumber: string,
  orderNumber: string,
): string {
  const material = getMaterial(spec.materialId);
  const totalLength = getTotalLength(spec);
  const { rpm, feed } = lineFeed(spec.materialId, spec.stockDiameter);
  const safeZ = 0.1;
  const stockRadius = spec.stockDiameter / 2;

  const lines: string[] = [
    `%`,
    `(${programNumber} - RAPID TURN ORDER ${orderNumber})`,
    `(${material.name} BAR STOCK DIA ${fmt(spec.stockDiameter, 3)} SINGLE SETUP)`,
    `(GENERATED ${new Date().toISOString()})`,
    `${programNumber}`,
    `G20 G40 G80 G99`,
    `G28 G91 Z0.`,
    `G90`,
    `T0101`,
    `G97 S${rpm} M03`,
    `G00 X${fmt(stockRadius + 0.05)} Z0.05`,
    `G01 Z0. F${feed}`,
    `(FACE FRONT)`,
    `G01 X-0.005 F${fmt(feed * 0.6, 3)}`,
    `G00 X${fmt(stockRadius + 0.05)} Z0.05`,
  ];

  let zPos = 0;
  for (const [i, seg] of spec.segments.entries()) {
    const radius = seg.diameter / 2;
    const zEnd = zPos - seg.length;

    lines.push(`(SEGMENT ${i + 1}: DIA ${fmt(seg.diameter, 3)} LEN ${fmt(seg.length, 3)})`);
    lines.push(`G00 X${fmt(stockRadius + 0.05)} Z${fmt(zPos + 0.02)}`);
    lines.push(`G01 Z${fmt(zEnd + 0.02)} F${feed}`);
    lines.push(`G01 X${fmt(radius)} F${fmt(feed * 0.8, 3)}`);
    lines.push(`G01 Z${fmt(zEnd)} F${feed}`);
    lines.push(`G00 X${fmt(stockRadius + 0.05)} Z${fmt(zEnd)}`);

    zPos = zEnd;
  }

  if (spec.frontChamfer.enabled && spec.frontChamfer.size > 0) {
    const c = spec.frontChamfer.size;
    const firstRadius = spec.segments[0].diameter / 2;
    lines.push(`(FRONT CHAMFER ${fmt(c, 3)})`);
    lines.push(`G00 X${fmt(firstRadius)} Z0.02`);
    lines.push(`G01 X${fmt(firstRadius - c)} Z${fmt(-c)} F${fmt(feed * 0.5, 3)}`);
  }

  if (spec.backChamfer.enabled && spec.backChamfer.size > 0) {
    const c = spec.backChamfer.size;
    const lastSeg = spec.segments[spec.segments.length - 1];
    const lastRadius = lastSeg.diameter / 2;
    lines.push(`(BACK CHAMFER ${fmt(c, 3)})`);
    lines.push(`G00 X${fmt(lastRadius)} Z${fmt(zPos - 0.02)}`);
    lines.push(
      `G01 X${fmt(lastRadius - c)} Z${fmt(zPos - c)} F${fmt(feed * 0.5, 3)}`,
    );
  }

  lines.push(`(PART OFF AT Z${fmt(zPos - 0.02)})`);
  lines.push(`G00 X${fmt(stockRadius + 0.05)} Z${fmt(zPos - 0.05)}`);
  lines.push(`G01 X-0.01 F${fmt(feed * 0.4, 3)}`);
  lines.push(`G00 X${fmt(stockRadius + 0.05)} Z${safeZ}`);
  lines.push(`M05`);
  lines.push(`G28 G91 Z0.`);
  lines.push(`M30`);
  lines.push(`%`);

  return lines.join("\n");
}
