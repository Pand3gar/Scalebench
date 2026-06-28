// Core engine constants. See implementation.md §5.1.

/** World units the largest single dimension maps to. */
export const SCENE_EXTENT = 10;

/** Desired grid cell size in world units (pre-snap). */
export const GRID_TARGET_WORLD = 1.0;

/** mm tolerance for the calibration check. */
export const CALIBRATION_EPSILON = 1e-3;

/** Below this fraction of Dmax, surface a "tiny object" UI hint. */
export const MIN_VISIBLE_RATIO = 0.01;

/** Horizontal gap between objects in the row, as a fraction of SCENE_EXTENT. */
export const GAP_WORLD = SCENE_EXTENT * 0.15;
