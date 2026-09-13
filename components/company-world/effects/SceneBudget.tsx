'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * The contract states a budget for this scene. A budget nobody measures is a
 * wish, so this measures it — in development only — and says so loudly on
 * overrun. It exists because the previous check was "remember to open the
 * console and read `window.__mirrorGL`", which survives exactly as long as the
 * person who remembers it.
 *
 * Samples once a second and only warns when the number changes category, so a
 * sustained overrun does not spam the console.
 */
const MAX_DRAW_CALLS = 120;
const MAX_TRIANGLES = 200_000;

export function SceneBudget() {
  const gl = useThree((s) => s.gl);
  const last = useRef({ at: 0, calls: 0, tris: 0, warned: false });

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    const state = last.current;

    // gl.info resets every frame, so read it at the end of one.
    state.calls = gl.info.render.calls;
    state.tris = gl.info.render.triangles;

    if (now - state.at < 1) return;
    state.at = now;

    const over =
      state.calls > MAX_DRAW_CALLS || state.tris > MAX_TRIANGLES;

    if (over && !state.warned) {
      state.warned = true;
      console.warn(
        `[company-world] over budget: ${state.calls} draw calls (max ${MAX_DRAW_CALLS}), ` +
          `${state.tris.toLocaleString()} triangles (max ${MAX_TRIANGLES.toLocaleString()}). ` +
          `Check for un-instanced repeats, a new transmissive material, or a dynamic ContactShadows — ` +
          `each of those costs a full extra scene pass.`,
      );
    } else if (!over && state.warned) {
      state.warned = false;
      console.info(
        `[company-world] back within budget: ${state.calls} draw calls, ${state.tris.toLocaleString()} triangles.`,
      );
    }
  });

  return null;
}
