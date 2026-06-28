// Lathe builder logic: templates, anchor derivation, and the two-way binding
// between numeric anchors and the editable profile. Pure (no three).
// See implementation.md §7.2.
import type { Dimensions, ProfilePoint } from "@/lib/schema/object";

export interface LatheAnchors {
  totalHeight: number; // mm
  bodyDiameter: number; // mm
  mouthDiameter?: number; // mm
  baseDiameter?: number; // mm
}

export interface LatheTemplate {
  id: string;
  label: string;
  profile: ProfilePoint[]; // outer silhouette, bottom -> top, mm
}

// Profiles are outer silhouettes (x = radius, y = height) bottom -> top, mm.
export const LATHE_TEMPLATES: Record<string, LatheTemplate> = {
  bottle: {
    id: "bottle",
    label: "Bottle",
    profile: [
      { x: 35, y: 0 },
      { x: 40, y: 25 },
      { x: 40, y: 160 },
      { x: 22, y: 200 },
      { x: 14, y: 235 },
      { x: 14, y: 250 },
    ],
  },
  glass: {
    id: "glass",
    label: "Glass",
    profile: [
      { x: 28, y: 0 },
      { x: 30, y: 10 },
      { x: 33, y: 90 },
      { x: 37, y: 150 },
    ],
  },
  can: {
    id: "can",
    label: "Can",
    profile: [
      { x: 33, y: 0 },
      { x: 33, y: 110 },
      { x: 28, y: 122 },
    ],
  },
  jar: {
    id: "jar",
    label: "Jar",
    profile: [
      { x: 45, y: 0 },
      { x: 48, y: 20 },
      { x: 48, y: 90 },
      { x: 40, y: 105 },
      { x: 40, y: 115 },
    ],
  },
  vase: {
    id: "vase",
    label: "Vase",
    profile: [
      { x: 30, y: 0 },
      { x: 55, y: 60 },
      { x: 50, y: 120 },
      { x: 25, y: 175 },
      { x: 30, y: 200 },
    ],
  },
  cup: {
    id: "cup",
    label: "Cup / Mug",
    profile: [
      { x: 33, y: 0 },
      { x: 36, y: 15 },
      { x: 40, y: 90 },
    ],
  },
};

export const DEFAULT_LATHE_TEMPLATE = "bottle";

const sortByY = (p: ProfilePoint[]) => [...p].sort((a, b) => a.y - b.y);

/** Derive the anchoring dimensions implied by a profile. */
export function deriveAnchors(profile: ProfilePoint[]): LatheAnchors {
  const pts = sortByY(profile);
  const ys = pts.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const bottom = pts[0];
  const top = pts[pts.length - 1];
  return {
    totalHeight: maxY - minY,
    bodyDiameter: 2 * Math.max(...pts.map((p) => p.x)),
    mouthDiameter: 2 * top.x,
    baseDiameter: 2 * bottom.x,
  };
}

/**
 * Apply target numeric anchors to a profile (two-way binding). Scales height
 * about the base, scales radius proportionally to body diameter, then pins the
 * top/bottom vertex radii to mouth/base diameters.
 */
export function applyAnchors(
  profile: ProfilePoint[],
  target: LatheAnchors,
): ProfilePoint[] {
  const pts = sortByY(profile);
  const current = deriveAnchors(pts);
  const minY = Math.min(...pts.map((p) => p.y));

  const scaleY =
    current.totalHeight > 0 ? target.totalHeight / current.totalHeight : 1;
  const scaleX =
    current.bodyDiameter > 0 ? target.bodyDiameter / current.bodyDiameter : 1;

  let next = pts.map((p) => ({
    x: Math.max(0, p.x * scaleX),
    y: minY + (p.y - minY) * scaleY,
  }));

  if (target.mouthDiameter != null) {
    next[next.length - 1] = {
      ...next[next.length - 1],
      x: target.mouthDiameter / 2,
    };
  }
  if (target.baseDiameter != null) {
    next[0] = { ...next[0], x: target.baseDiameter / 2 };
  }
  return next;
}

/** Real-world bounding box (mm) for a lathe: body diameter × height × body diameter. */
export function latheDimensions(anchors: LatheAnchors): Dimensions {
  return {
    width: anchors.bodyDiameter,
    height: anchors.totalHeight,
    depth: anchors.bodyDiameter,
  };
}
