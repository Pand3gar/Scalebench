// Procedural composite models for catalog items that have no GLB asset but read
// poorly as a single box (tables, screens, beds, vehicles…). Each generator
// returns a CSG node tree (union of primitives) authored in mm-space, keyed by
// catalog slug. The scene builds it via the normal CSG pipeline and per-axis
// calibration snaps the result to the item's declared real-world dimensions, so
// generators only need correct *proportions*. See lib/geometry/csg.ts.
import type { CsgNode, Dimensions } from "@/lib/schema/object";

type V3 = [number, number, number];
const ADD = "ADDITION" as const;

let seq = 0;
const id = () => `c${seq++}`;

function box(size: V3, position: V3, rotation: V3 = [0, 0, 0]): CsgNode {
  return {
    id: id(),
    primitive: { kind: "box", width: size[0], height: size[1], depth: size[2] },
    position,
    rotation,
    op: ADD,
  };
}
function cyl(
  diameter: number,
  height: number,
  position: V3,
  rotation: V3 = [0, 0, 0],
): CsgNode {
  return {
    id: id(),
    primitive: { kind: "cylinder", diameter, height },
    position,
    rotation,
    op: ADD,
  };
}

// A wheel: cylinder whose axis is rotated to run along Z (the vehicle's width).
function wheel(diameter: number, width: number, position: V3): CsgNode {
  return cyl(diameter, width, position, [Math.PI / 2, 0, 0]);
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// ---- Furniture ----------------------------------------------------------

/** Flat top resting on four corner legs (tables, desks, nightstands). */
function leggedTable({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const topThk = clamp(h * 0.09, 20, 80);
  const legW = clamp(Math.min(w, d) * 0.08, 30, 90);
  const inset = legW * 0.6;
  const legH = h - topThk;
  const lx = w / 2 - legW / 2 - inset;
  const lz = d / 2 - legW / 2 - inset;
  return [
    box([w, topThk, d], [0, h - topThk / 2, 0]),
    box([legW, legH, legW], [-lx, legH / 2, -lz]),
    box([legW, legH, legW], [lx, legH / 2, -lz]),
    box([legW, legH, legW], [-lx, legH / 2, lz]),
    box([legW, legH, legW], [lx, legH / 2, lz]),
  ];
}

/** Flat panel on a neck and a foot (monitors, televisions). */
function screenOnStand({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const panelH = h * 0.66;
  const panelThk = clamp(d * 0.35, 18, 70);
  const baseThk = clamp(h * 0.04, 10, 35);
  const neckH = h - panelH - baseThk;
  return [
    box([w, panelH, panelThk], [0, h - panelH / 2, d / 2 - panelThk / 2]),
    box([w * 0.12, neckH + baseThk, d * 0.22], [0, baseThk + neckH / 2, 0]),
    box([w * 0.42, baseThk, d], [0, baseThk / 2, 0]),
  ];
}

/** Side panels, top, bottom and interior shelves. */
function bookshelf({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const t = clamp(Math.min(w, d) * 0.06, 15, 40);
  const inner = w - 2 * t;
  const nodes: CsgNode[] = [
    box([t, h, d], [-w / 2 + t / 2, h / 2, 0]),
    box([t, h, d], [w / 2 - t / 2, h / 2, 0]),
    box([w, t, d], [0, t / 2, 0]),
    box([w, t, d], [0, h - t / 2, 0]),
    box([w, h, t * 0.6], [0, h / 2, -d / 2 + (t * 0.6) / 2]),
  ];
  const shelves = 3;
  for (let i = 1; i <= shelves; i++) {
    const y = (h * i) / (shelves + 1);
    nodes.push(box([inner, t, d * 0.92], [0, y, t * 0.04]));
  }
  return nodes;
}

/** Base + mattress + headboard. */
function bed({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const frameH = h * 0.4;
  const mattH = h * 0.3;
  const hbThk = d * 0.05;
  return [
    box([w, frameH, d], [0, frameH / 2, 0]),
    box([w * 0.96, mattH, d * 0.92], [0, frameH + mattH / 2, hbThk / 2]),
    box([w, h, hbThk], [0, h / 2, -d / 2 + hbThk / 2]),
  ];
}

/** Disc base, slim pole, drum shade. */
function floorLamp({ width: w, height: h }: Dimensions): CsgNode[] {
  const baseThk = h * 0.02;
  const shadeH = h * 0.22;
  return [
    cyl(w * 0.9, baseThk, [0, baseThk / 2, 0]),
    cyl(w * 0.1, h - shadeH, [0, (h - shadeH) / 2, 0]),
    cyl(w, shadeH, [0, h - shadeH / 2, 0]),
  ];
}

/** Round seat, central post, foot disc. */
function barStool({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const dia = Math.min(w, d);
  const seatThk = h * 0.06;
  return [
    cyl(dia, seatThk, [0, h - seatThk / 2, 0]),
    cyl(dia * 0.14, h - seatThk, [0, (h - seatThk) / 2, 0]),
    cyl(dia * 0.85, h * 0.03, [0, h * 0.015, 0]),
  ];
}

// ---- Vehicles -----------------------------------------------------------
// Convention: X = length, Y = height, Z = track (side-to-side) width.

/** Lower body + raised cabin + four wheels. */
function carBody({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const wheelDia = h * 0.42;
  const wheelW = d * 0.12;
  const wx = w * 0.3;
  const wz = d / 2 - wheelW / 2;
  return [
    box([w, h * 0.45, d * 0.92], [0, h * 0.32, 0]),
    box([w * 0.55, h * 0.42, d * 0.82], [-w * 0.02, h * 0.7, 0]),
    wheel(wheelDia, wheelW, [-wx, wheelDia / 2, -wz]),
    wheel(wheelDia, wheelW, [wx, wheelDia / 2, -wz]),
    wheel(wheelDia, wheelW, [-wx, wheelDia / 2, wz]),
    wheel(wheelDia, wheelW, [wx, wheelDia / 2, wz]),
  ];
}

/** Two wheels, body block, seat, fork to the handlebars. */
function motorcycle({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const wheelDia = h * 0.55;
  const wheelW = d * 0.4;
  return [
    wheel(wheelDia, wheelW, [-w * 0.34, wheelDia / 2, 0]),
    wheel(wheelDia, wheelW, [w * 0.34, wheelDia / 2, 0]),
    box([w * 0.5, h * 0.3, d * 0.55], [-w * 0.02, h * 0.5, 0]),
    box([w * 0.34, h * 0.08, d * 0.5], [-w * 0.12, h * 0.66, 0]),
    box([w * 0.05, h * 0.55, d * 0.12], [w * 0.3, h * 0.5, 0], [0, 0, -0.35]),
    box([w * 0.18, h * 0.05, d * 0.7], [w * 0.34, h * 0.7, 0]),
  ];
}

/** Deck, two wheels, vertical stem, handlebar. */
function kickScooter({ width: w, height: h, depth: d }: Dimensions): CsgNode[] {
  const wheelDia = h * 0.28;
  const wheelW = d * 0.6;
  return [
    box([w * 0.62, h * 0.04, d], [-w * 0.05, h * 0.12, 0]),
    wheel(wheelDia, wheelW, [-w * 0.4, wheelDia / 2, 0]),
    wheel(wheelDia, wheelW, [w * 0.4, wheelDia / 2, 0]),
    box([w * 0.05, h * 0.82, d * 0.5], [w * 0.4, h * 0.52, 0]),
    box([w * 0.05, h * 0.05, d], [w * 0.4, h * 0.9, 0]),
  ];
}

export const COMPOSITES: Record<string, (d: Dimensions) => CsgNode[]> = {
  "dining-table": leggedTable,
  "coffee-table": leggedTable,
  "office-desk": leggedTable,
  nightstand: leggedTable,
  "monitor-24": screenOnStand,
  "monitor-27": screenOnStand,
  "tv-55": screenOnStand,
  bookshelf,
  "queen-bed": bed,
  "floor-lamp": floorLamp,
  "bar-stool": barStool,
  suv: carBody,
  motorcycle,
  "kick-scooter": kickScooter,
};
