import { useMemo } from 'react';
import { Vector3 } from 'three';

/**
 * The camera is part of the UI grammar, not a toy.
 *
 * Rotation is allowed, but constrained: yaw is free through 360° so the company
 * can be inspected from any side, while pitch is clamped to an architectural
 * band. You can never look at the company from underneath or straight down,
 * because neither view means anything — a model you can flip upside down stops
 * being a model of anything. The camera stays orthographic throughout.
 */

/** Distance is fixed; only the angles move. Orthographic, so this only sets direction. */
export const ORBIT_RADIUS = 13.86;

/** yaw 45°, pitch ~35° — the default "operational model" read. */
export const HOME_YAW = Math.PI / 4;
export const HOME_PITCH = 0.615;

/** Architectural band. Below ~20° the islands occlude each other; above ~62° it flattens to a plan. */
export const PITCH_MIN = 0.34;
export const PITCH_MAX = 1.08;

export const PARALLAX = { x: 0.075, y: 0.042 } as const;
export const HOME_TARGET = new Vector3(0, 0.35, 0);

/** Spherical → cartesian for a Y-up orbit. */
export function orbitPosition(yaw: number, pitch: number, out: Vector3) {
  const r = ORBIT_RADIUS;
  return out.set(
    r * Math.cos(pitch) * Math.sin(yaw),
    r * Math.sin(pitch),
    r * Math.cos(pitch) * Math.cos(yaw),
  );
}

export function clampPitch(p: number) {
  return Math.min(PITCH_MAX, Math.max(PITCH_MIN, p));
}

/**
 * World-space footprint the composition must always contain, with breathing
 * room. Rotating changes the projected width, so the frame is sized for the
 * worst case rather than for the default angle.
 */
const FRAME_WIDTH = 10.6;
const FRAME_HEIGHT = 6.6;

export function fitZoom(width: number, height: number) {
  return Math.min(width / FRAME_WIDTH, height / FRAME_HEIGHT);
}

export function useFocus(position: [number, number, number] | null) {
  return useMemo(() => {
    if (!position) return { offset: new Vector3(), target: HOME_TARGET.clone() };
    const [x, , z] = position;
    // Move a fraction of the way, so selection reframes without losing the
    // rest of the company from view.
    return {
      offset: new Vector3(x * 0.2, 0, z * 0.2),
      target: new Vector3(x * 0.34, 0.28, z * 0.34),
    };
  }, [position]);
}
