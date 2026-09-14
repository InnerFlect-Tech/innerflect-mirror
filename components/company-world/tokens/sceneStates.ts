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
//
//                    How far past 1 these may go: being untone-mapped, every
//                    channel at or above 1 clips, and a surface where every
//                    channel clips renders one flat colour with no shading
//                    anywhere on it. On an edge strip that is exactly right - a
//                    signal has no business having form. On the kit's larger
//                    state-carrying faces, a domain platform's top among them,
//                    the same values turned the whole platform into a flat
//                    pastel slab: `critical` at [1.55, .47, .35] resolves to
//                    salmon and `attention` to pale amber, and neither reads as
//                    the colour it names. These values still cross the
//                    threshold in their dominant channel, so each still blooms;
//                    they clip in one channel instead of three, which keeps the
//                    hue and lets the form survive.
//
//                    The second half of that is tone mapping. The scene renders
//                    through an EffectComposer, and `OutputPass` applies AgX to
//                    the whole buffer - including materials marked
//                    `toneMapped: false`, which only skips the in-shader pass
//                    when drawing straight to screen. AgX desaturates as it
//                    approaches white, by design, so a saturated red pushed
//                    hard enough does not arrive as a brighter red: it arrives
//                    as salmon. These values sit below that knee, which is why
//                    `critical` finally reads red instead of pink.
//
//                    Which leaves these values sitting on a narrow ledge: the
//                    dominant channel just clears 1 so the bloom pass still
//                    finds it, and the other two stay low so AgX has no white
//                    to desaturate toward. Below the ledge the world goes dull,
//                    above it every state turns pastel. Retune by eye, not by
//                    arithmetic - and check `critical` first, since red is the
//                    channel AgX washes out soonest.

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
  // `healthy` merged into `active` 2026-09-14 — see lib/model/state.ts.
  active: {
    surfaceEmissive: [0.06, 0.26, 0.24],
    emission: 0.8,
    signalEmissive: [0.09, 1.16, 1.0],
    blooms: true,
  },
  attention: {
    surfaceEmissive: [0.1, 0.06, 0.012],
    emission: 0.6,
    signalEmissive: [1.08, 0.45, 0.05],
    blooms: true,
  },
  critical: {
    surfaceEmissive: [0.12, 0.035, 0.025],
    emission: 0.62,
    signalEmissive: [1.02, 0.16, 0.09],
    blooms: true,
  },
};

export const stateTokens = Object.fromEntries(
  (Object.keys(emissive) as SceneState[]).map((state) => [
    state,
    { ...stateColors[state], ...emissive[state] },
  ]),
) as Record<SceneState, StateToken>;

/**
 * The core is structurally different and is always the brightest object.
 *
 * Every channel here is written raw (`toneMapped: false`), so anything at or
 * above 1 clips. The previous value — 2.4 green against 0.35 red, multiplied by
 * an intensity of 1.15 — clipped green and blue flat while leaving red low,
 * which is not "a brighter teal": it is a single uniform colour across every
 * face of the mesh. A solid with no variation between its faces has no shading,
 * and a cube with no shading reads as a flat card floating in the glass.
 *
 * These numbers still cross the bloom threshold of 1, so the core still blooms
 * and is still the brightest thing in the scene. They just clip less far past
 * it, which is what lets the form come back.
 */
export const coreEmissive: [number, number, number] = [0.16, 1.22, 1.08];
