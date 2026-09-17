# Rapid Turn

Free web configurator for **0.5 in 7075-T6 FRC hex shafts**. Set length, tap each end, add E-clip grooves and a turn-down journal, inspect a live 3D preview, read a **not-for-sale** estimate, and download a STEP that matches the solid on screen.

Nothing is sold here. There is no Stripe, waitlist, or checkout. Buy is gated for later.

## Locked v1

| Item | Value |
|------|--------|
| Profile | 0.5 in hex. **Modeled AF 0.4975 in** (FRC fit 0.496–0.499 in) |
| Material | 7075-T6 aluminum (display only — one material) |
| Length | Configure/download STEP for any length (CAD soft max **36.00 in**). **Manufacturing / Buy ≤ 8.00 in.** Longer configs are CAD-only. Default 4.00 in |
| End taps | Each end independently: None, **#10-32 × 0.50 in**, **1/4-20 × 0.50 in** |
| E-clip grooves | 0–N, positionable from End A. Side-mount / radial install (no corner round-over) |
| Journal | One turn-down: start, length, target round Ø (default ThunderHex **0.541 in / 13.75 mm**, or **0.500 in**) |
| Out of scope | Snap-ring / axial circlip, cross-drill, anodize, 3/8 in, steel, keyways, live checkout |

Tap holes in the preview and STEP are **tap-drill cylinders** (#21 = 0.159 in for #10-32, #7 = 0.201 in for 1/4-20). Threads are not modeled.

### E-clip assumption

Published-compatible 1/2 in E-style ring, **McMaster-Carr 97633A160** (E-Style External Retaining Ring for 1/2 in shaft):

- Groove diameter **0.396 in**
- Groove width **0.046 in**
- Ring thickness 0.042 in

Confirm against the clip you will install. Cited in the configurator UI.

A journal Ø ≥ modeled AF clips hex **corners** to that circle (ThunderHex-style) and leaves flats. Smaller Ø becomes a true round journal. Hex outside the journal remains as a shoulder/stop.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS + React 19
- **Three.js** for the preview (OrbitControls, no extra UI kit)
- **Client-side STEP** (no CAD kernel, no API). `src/lib/geometry.ts` builds one watertight mesh; `src/lib/step.ts` writes an AP203 `MANIFOLD_SOLID_BREP` in **inches**. Preview and download share that mesh, so the file matches the config.
- Placeholder rates live in **`src/config/pricing.ts`** only.
- Shareable config URLs (no login): `/?l=4.375&ea=10-32&eb=10-32&g=0.35,3.65&j=0.75,1.5,0.541`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # geometry, estimate, STEP, validation
npm run build     # production build
npm start
```

## Pages

- `/` — configurator: controls, 3D preview, estimate, Download STEP, Chief Delphi use-case cards
- `/about` — short product note
- Query params load a config so “Open this config” and Copy link work without an account

There is no shop checkout, machine queue, or G-code path in v1.

## STEP notes

- Generated in the browser on **Download STEP**.
- Header `FILE_DESCRIPTION` lists length, taps, E-clip P/N and positions, and journal.
- Units: **INCH** (`CONVERSION_BASED_UNIT`).
- Faceted planar B-rep (48-sample rings) so hex flats stay exact and rounds stay close. Good for robot CAD import; not a substitute for a CAM feature tree.

If a future CAM pipeline needs kernel-quality NURBS, swap `buildStep()` for OpenCascade/replicad and keep `buildShaftMesh()` as the preview source of truth.
