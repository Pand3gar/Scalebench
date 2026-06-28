// Unit registry + conversion. Internal base unit is millimetres (mm).
// See implementation.md §4.1.

export type UnitId = "mm" | "cm" | "m" | "in" | "ft";

export interface UnitDef {
  id: UnitId;
  label: string; // "mm", "cm", …
  toMm: number; // multiply a value in this unit by toMm to get mm
  precision: number; // display decimal places
}

// Extensible registry: add a unit by adding one entry.
export const UNIT_REGISTRY: Record<UnitId, UnitDef> = {
  mm: { id: "mm", label: "mm", toMm: 1, precision: 0 },
  cm: { id: "cm", label: "cm", toMm: 10, precision: 1 },
  m: { id: "m", label: "m", toMm: 1000, precision: 3 },
  in: { id: "in", label: "in", toMm: 25.4, precision: 2 },
  ft: { id: "ft", label: "ft", toMm: 304.8, precision: 2 },
};

export const UNIT_IDS = Object.keys(UNIT_REGISTRY) as UnitId[];

export const toMm = (value: number, unit: UnitId): number =>
  value * UNIT_REGISTRY[unit].toMm;

export const fromMm = (mm: number, unit: UnitId): number =>
  mm / UNIT_REGISTRY[unit].toMm;

/** Format an mm value in the target unit, trimming trailing zeros. */
export function formatMm(mm: number, unit: UnitId): string {
  const def = UNIT_REGISTRY[unit];
  const value = fromMm(mm, unit);
  // Trim trailing zeros but keep clean output (e.g. "5" not "5.000").
  const fixed = value.toFixed(def.precision);
  const trimmed = def.precision > 0 ? fixed.replace(/\.?0+$/, "") : fixed;
  return `${trimmed} ${def.label}`;
}

/** Format a numeric value only (no unit label). */
export function formatMmValue(mm: number, unit: UnitId): string {
  const def = UNIT_REGISTRY[unit];
  const fixed = fromMm(mm, unit).toFixed(def.precision);
  return def.precision > 0 ? fixed.replace(/\.?0+$/, "") : fixed;
}
