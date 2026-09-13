// State — not domain identity — determines colour.
//
// Governance is not a place in the company; it is the property that moves a
// domain from `healthy` to `attention` or `critical`. That is why nothing in
// this file is keyed by domain name.
//
// Two separate emissive channels, which is the part that is easy to get wrong:
//
//   surfaceEmissive  low dynamic range, tone-mapped. The island's inner
//                    surface. It must NEVER exceed 1 — a whole platform that
//                    blooms reads as a light panel, not as dark glass catching
//                    light from inside the system.
//
//   signalEmissive   HDR, not tone-mapped. Small accents only: the edge strip,
//                    window slivers, connection pulses. These are the only
//                    things the bloom pass is allowed to find.

export type { SceneState } from '@/lib/model/state';

import type { SceneState } from '@/lib/model/state';
import { stateColors } from '@/lib/tokens/state';

export type StateToken = {
  /** Edge highlight on the platform bevel. */
  edge: string;
  /** Base colour of the illuminated inner surface. */
  surface: string;
  /** Tone-mapped inner-surface emissive. Always below 1. */
  surfaceEmissive: [number, number, number];
  /** Multiplier applied to `surfaceEmissive`. */
  emission: number;
  /** HDR accent emissive. Channels above 1 bloom. */
  signalEmissive: [number, number, number];
  /** Colour for the HTML label's value line. */
  label: string;
  /** Static connection path. */
  connection: string;
  /** Does this state reach the bloom threshold? */
  blooms: boolean;
};

/**
 * Colours come from the shared palette; only the emissive numbers — which mean
 * nothing outside a renderer — are defined here.
 */
type Emissive = Pick<StateToken, 'surfaceEmissive' | 'emission' | 'signalEmissive' | 'blooms'>;

const emissive: Record<SceneState, Emissive> = {
  neutral: {
    surfaceEmissive: [0.02, 0.04, 0.04],
    emission: 0,
    signalEmissive: [0.06, 0.12, 0.12],
    blooms: false,
  },
  healthy: {
    surfaceEmissive: [0.04, 0.16, 0.15],
    emission: 0.55,
    signalEmissive: [0.18, 1.15, 1.05],
    blooms: true,
  },
  active: {
    surfaceEmissive: [0.06, 0.26, 0.24],
    emission: 0.8,
    signalEmissive: [0.26, 1.7, 1.55],
    blooms: true,
  },
  attention: {
    surfaceEmissive: [0.1, 0.06, 0.012],
    emission: 0.6,
    signalEmissive: [1.35, 0.85, 0.24],
    blooms: true,
  },
  critical: {
    surfaceEmissive: [0.12, 0.035, 0.025],
    emission: 0.62,
    signalEmissive: [1.55, 0.47, 0.35],
    blooms: true,
  },
};

export const stateTokens = Object.fromEntries(
  (Object.keys(emissive) as SceneState[]).map((state) => [
    state,
    { ...stateColors[state], ...emissive[state] },
  ]),
) as Record<SceneState, StateToken>;

/** The core is structurally different and is always the brightest object. */
export const coreEmissive: [number, number, number] = [0.35, 2.4, 2.2];
