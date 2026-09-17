"use client";

import { HEX_MODEL_AF } from "@/config/shaft";
import { buildDrawingModel, drawingNotes, fmtIn } from "@/lib/drawing";
import type { ShaftConfig } from "@/lib/types";
import { useMemo } from "react";

const VB_W = 800;
const PAD_L = 96;
const PAD_R = 96;
const PLOT_W = VB_W - PAD_L - PAD_R;
const HEX_HALF = 36;
const DIM = "#0157a1";
const DIM_SOFT = "#3d7ab8";
const OUTLINE = "#1f242b";

const FONT_DIM =
  "600 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const FONT_NOTE = "500 11px ui-sans-serif, system-ui, sans-serif";
const FONT_TINY = "500 10px ui-sans-serif, system-ui, sans-serif";

function mapX(z: number, length: number): number {
  return PAD_L + (z / Math.max(length, 0.01)) * PLOT_W;
}

function mapHalf(dia: number): number {
  return (dia / HEX_MODEL_AF) * HEX_HALF;
}

function staggerLevels(xs: number[], minGap: number): number[] {
  const order = xs.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x);
  const levels = xs.map(() => 0);
  let lastX = -Infinity;
  let level = 0;
  for (const { x, i } of order) {
    level = x - lastX < minGap ? level + 1 : 0;
    levels[i] = level;
    lastX = x;
  }
  return levels;
}

export default function ShaftDrawing({ config }: { config: ShaftConfig }) {
  const model = useMemo(() => buildDrawingModel(config), [config]);
  const notes = useMemo(() => drawingNotes(model), [model]);
  const { length, segments, taps, grooves, journal } = model;

  const grooveLevels = staggerLevels(
    grooves.map((g) => mapX(g.position, length)),
    88,
  );
  const maxGrooveLevel = grooveLevels.length ? Math.max(...grooveLevels) : 0;
  const grooveBand = grooves.length ? 24 + (maxGrooveLevel + 1) * 30 : 0;
  const journalBand = journal ? 56 : 0;
  const tapBand = 34;
  const topPad = 22 + grooveBand + journalBand + tapBand;
  const bottomPad = 74;
  const cy = topPad + HEX_HALF + 6;
  const vbH = cy + HEX_HALF + bottomPad;

  const x0 = mapX(0, length);
  const xL = mapX(length, length);
  const tapA = taps.find((t) => t.end === "A");
  const tapB = taps.find((t) => t.end === "B");
  const grooveLabelYs = grooveLevels.map((level) => 18 + (maxGrooveLevel - level) * 30);

  const tapDimY = cy - HEX_HALF - 18;
  const journalDimY = tapDimY - (journal ? 38 : 0);

  const summary = notes.join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border border-steel-200 bg-[#f4f6f8] shadow-sm">
      <div className="flex items-start justify-between gap-3 px-4 pt-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rapid-700">
            Drawing — source of truth
          </p>
          <p className="text-xs text-steel-500">
            Side elevation · orthographic · datum End A at left · inches
          </p>
        </div>
        <p className="hidden font-mono text-[11px] text-steel-500 sm:block">
          7075-T6 · AF {fmtIn(HEX_MODEL_AF, 4)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VB_W} ${vbH}`}
          className="h-auto w-full min-w-[24rem]"
          role="img"
          aria-label={summary}
          data-testid="shaft-drawing"
        >
          <title>{summary}</title>
          <line
            x1={PAD_L - 18}
            x2={VB_W - PAD_R + 18}
            y1={cy}
            y2={cy}
            stroke="#9aa3ae"
            strokeDasharray="10 4 2 4"
            strokeWidth="0.8"
          />

          {segments.map((seg, i) => {
            const xa = mapX(seg.z0, length);
            const xb = mapX(seg.z1, length);
            const h = mapHalf(seg.outlineDia);
            const fill =
              seg.kind === "groove" ? "#5d6773" : seg.kind === "journal" ? "#e4c98a" : "#c5ccd4";
            return (
              <g key={`seg-${i}`}>
                <rect
                  x={xa}
                  y={cy - h}
                  width={Math.max(xb - xa, 0.9)}
                  height={h * 2}
                  fill={fill}
                  stroke={OUTLINE}
                  strokeWidth="1.25"
                />
                {seg.clipDia != null && (
                  <g stroke={DIM} strokeDasharray="4 3" strokeWidth="1" fill="none">
                    <line
                      x1={xa}
                      x2={xb}
                      y1={cy - mapHalf(seg.clipDia)}
                      y2={cy - mapHalf(seg.clipDia)}
                    />
                    <line
                      x1={xa}
                      x2={xb}
                      y1={cy + mapHalf(seg.clipDia)}
                      y2={cy + mapHalf(seg.clipDia)}
                    />
                  </g>
                )}
              </g>
            );
          })}

          {taps.map((t) => {
            const depthZ = t.end === "A" ? t.depth : length - t.depth;
            const endZ = t.end === "A" ? 0 : length;
            const xa = mapX(Math.min(endZ, depthZ), length);
            const xb = mapX(Math.max(endZ, depthZ), length);
            const hr = Math.max(mapHalf(t.drillDiameter), 7);
            return (
              <rect
                key={t.end}
                x={xa}
                y={cy - hr}
                width={Math.max(xb - xa, 1)}
                height={hr * 2}
                fill="none"
                stroke="#4f5b68"
                strokeDasharray="3 2"
                strokeWidth="1.1"
              />
            );
          })}

          <VertDim
            x={PAD_L - 40}
            y1={cy - HEX_HALF}
            y2={cy + HEX_HALF}
            label={`AF ${fmtIn(HEX_MODEL_AF, 4)}`}
          />

          <DimLine
            x1={x0}
            x2={xL}
            y={cy + HEX_HALF + 46}
            label={fmtIn(length)}
            extendFrom={cy + HEX_HALF}
          />
          <text
            x={x0}
            y={cy + HEX_HALF + 18}
            textAnchor="middle"
            style={{ font: FONT_NOTE }}
            fill="#4f5b68"
          >
            END A
          </text>
          <text
            x={xL}
            y={cy + HEX_HALF + 18}
            textAnchor="middle"
            style={{ font: FONT_NOTE }}
            fill="#4f5b68"
          >
            END B
          </text>

          {tapA ? (
            <TapCallout
              endX={x0}
              depthX={mapX(tapA.depth, length)}
              y={tapDimY}
              side="left"
              label={tapA.label}
              depthLabel={fmtIn(tapA.depth)}
              extendFrom={cy - HEX_HALF}
            />
          ) : (
            <text
              x={x0 - 4}
              y={tapDimY - 4}
              textAnchor="end"
              style={{ font: FONT_NOTE }}
              fill="#6b7785"
            >
              UNTAPPED
            </text>
          )}
          {tapB ? (
            <TapCallout
              endX={xL}
              depthX={mapX(length - tapB.depth, length)}
              y={tapDimY}
              side="right"
              label={tapB.label}
              depthLabel={fmtIn(tapB.depth)}
              extendFrom={cy - HEX_HALF}
            />
          ) : (
            <text
              x={xL + 4}
              y={tapDimY - 4}
              textAnchor="start"
              style={{ font: FONT_NOTE }}
              fill="#6b7785"
            >
              UNTAPPED
            </text>
          )}

          {journal && (
            <g>
              <DimLine
                x1={mapX(journal.start, length)}
                x2={mapX(journal.start + journal.length, length)}
                y={journalDimY}
                label={`${fmtIn(journal.length)} JOURNAL`}
                extendFrom={cy - mapHalf(Math.min(journal.diameter, HEX_MODEL_AF))}
              />
              <text
                x={mapX(journal.start + journal.length / 2, length)}
                y={journalDimY - 14}
                textAnchor="middle"
                style={{ font: FONT_DIM }}
                fill={DIM}
              >
                Ø{journal.diameter.toFixed(3)}
                {journal.clipsCorners ? " CLIP CORNERS" : " ROUND"} · START {fmtIn(journal.start)}
              </text>
            </g>
          )}

          {grooves.map((g, i) => {
            const xc = mapX(g.position, length);
            const labelY = grooveLabelYs[i];
            const odY = cy - mapHalf(g.diameter);
            return (
              <g key={`g-${i}`}>
                <line x1={xc} x2={xc} y1={odY} y2={labelY + 16} stroke={DIM} strokeWidth="0.85" />
                <polygon points={`${xc},${odY} ${xc - 3.2},${odY - 7} ${xc + 3.2},${odY - 7}`} fill={DIM} />
                <text x={xc} y={labelY} textAnchor="middle" style={{ font: FONT_DIM }} fill={DIM}>
                  {fmtIn(g.position)} FROM A
                </text>
                <text
                  x={xc}
                  y={labelY + 13}
                  textAnchor="middle"
                  style={{ font: FONT_TINY }}
                  fill={DIM_SOFT}
                >
                  E-CLIP {fmtIn(g.width)} W × Ø{g.diameter.toFixed(3)}
                </text>
              </g>
            );
          })}

          <text x={PAD_L} y={vbH - 12} style={{ font: FONT_TINY }} fill="#6b7785">
            Dashed box = tap drill · dashed OD = corner clip · drawing matches STEP / share URL
          </text>
        </svg>
      </div>

      <dl className="grid gap-x-4 gap-y-1.5 border-t border-steel-200 bg-white/70 px-4 py-3 text-xs sm:grid-cols-2 sm:px-5">
        {notes.map((note) => (
          <div key={note} className="font-mono text-[11px] leading-snug text-steel-700 sm:text-xs">
            {note}
          </div>
        ))}
      </dl>
    </div>
  );
}

function arrowHead(tip: number, y: number, dir: "left" | "right") {
  const s = dir === "left" ? 1 : -1;
  return `${tip},${y} ${tip + s * 6},${y - 3.4} ${tip + s * 6},${y + 3.4}`;
}

function DimLine({
  x1,
  x2,
  y,
  label,
  extendFrom,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  extendFrom?: number;
}) {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const mid = (left + right) / 2;
  if (right - left < 1) return null;
  return (
    <g>
      {extendFrom != null && (
        <>
          <line
            x1={left}
            x2={left}
            y1={extendFrom}
            y2={y}
            stroke={DIM_SOFT}
            strokeWidth="0.7"
          />
          <line
            x1={right}
            x2={right}
            y1={extendFrom}
            y2={y}
            stroke={DIM_SOFT}
            strokeWidth="0.7"
          />
        </>
      )}
      <line x1={left} x2={left} y1={y - 6} y2={y + 6} stroke={DIM} strokeWidth="1" />
      <line x1={right} x2={right} y1={y - 6} y2={y + 6} stroke={DIM} strokeWidth="1" />
      <line x1={left} x2={right} y1={y} y2={y} stroke={DIM} strokeWidth="1" />
      <polygon points={arrowHead(left, y, "left")} fill={DIM} />
      <polygon points={arrowHead(right, y, "right")} fill={DIM} />
      <text x={mid} y={y - 6} textAnchor="middle" style={{ font: FONT_DIM }} fill={DIM}>
        {label}
      </text>
    </g>
  );
}

function VertDim({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  const top = Math.min(y1, y2);
  const bot = Math.max(y1, y2);
  const mid = (top + bot) / 2;
  return (
    <g>
      <line x1={x - 6} x2={x + 6} y1={top} y2={top} stroke={DIM} strokeWidth="1" />
      <line x1={x - 6} x2={x + 6} y1={bot} y2={bot} stroke={DIM} strokeWidth="1" />
      <line x1={x} x2={x} y1={top} y2={bot} stroke={DIM} strokeWidth="1" />
      <polygon points={`${x},${top} ${x - 3.4},${top + 6} ${x + 3.4},${top + 6}`} fill={DIM} />
      <polygon points={`${x},${bot} ${x - 3.4},${bot - 6} ${x + 3.4},${bot - 6}`} fill={DIM} />
      <text
        x={x - 8}
        y={mid}
        textAnchor="middle"
        transform={`rotate(-90 ${x - 8} ${mid})`}
        style={{ font: FONT_DIM }}
        fill={DIM}
      >
        {label}
      </text>
    </g>
  );
}

function TapCallout({
  endX,
  depthX,
  y,
  side,
  label,
  depthLabel,
  extendFrom,
}: {
  endX: number;
  depthX: number;
  y: number;
  side: "left" | "right";
  label: string;
  depthLabel: string;
  extendFrom: number;
}) {
  const tx = side === "left" ? Math.min(endX, depthX) - 4 : Math.max(endX, depthX) + 4;
  const anchor = side === "left" ? "end" : "start";
  return (
    <g>
      <DimLine x1={endX} x2={depthX} y={y} label={depthLabel} extendFrom={extendFrom} />
      <text x={tx} y={y - 14} textAnchor={anchor} style={{ font: FONT_DIM }} fill={DIM}>
        {label}
      </text>
    </g>
  );
}
