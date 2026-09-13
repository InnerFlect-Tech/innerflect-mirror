'use client';

import type { RefObject } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { damp, damp3 } from 'maath/easing';
import { Vector3 } from 'three';
import {
  HOME_PITCH,
  HOME_YAW,
  PARALLAX,
  fitZoom,
  orbitPosition,
  useFocus,
} from './useCameraNavigation';
import type { OrbitState } from './useOrbitControl';

// Scratch vectors hoisted to module scope: nothing is allocated in the frame
// loop. There is only ever one camera, so sharing these is safe.
const desired = new Vector3();
const gaze = new Vector3(0, 0.35, 0);
const smoothed = { yaw: HOME_YAW, pitch: HOME_PITCH };

/**
 * Orthographic, not perspective. The reference look is architectural — a model
 * of a company on a table, not a videogame. Rotation is permitted but clamped;
 * see useCameraNavigation for why.
 */
export function CompanyCamera({
  focus,
  reducedMotion,
  orbit,
}: {
  focus: [number, number, number] | null;
  reducedMotion: boolean;
  orbit: RefObject<OrbitState>;
}) {
  const { offset, target } = useFocus(focus);
  const size = useThree((s) => s.size);

  // The composition is a fixed size in world units, so the zoom is derived from
  // the viewport rather than being a magic number — otherwise the company is
  // cropped on a narrow pane and lost in a sea of floor on a wide one.
  const zoom = fitZoom(size.width, size.height);

  useFrame((state, delta) => {
    const { camera, pointer, invalidate } = state;
    const o = orbit.current;

    if (reducedMotion) {
      smoothed.yaw = o.yaw;
      smoothed.pitch = o.pitch;
    } else {
      damp(smoothed, 'yaw', o.yaw, 0.16, delta);
      damp(smoothed, 'pitch', o.pitch, 0.16, delta);
    }

    orbitPosition(smoothed.yaw, smoothed.pitch, desired).add(offset);

    // Parallax is a hint that the world is spatial. While the user is actually
    // rotating it, it would just fight them.
    if (!reducedMotion && !o.dragging) {
      desired.x += pointer.x * PARALLAX.x;
      desired.y += pointer.y * PARALLAX.y;
    }

    if (reducedMotion) {
      camera.position.copy(desired);
      gaze.copy(target);
    } else {
      // damp, not lerp: a fixed factor eases twice as fast at 120fps as at 60.
      damp3(camera.position, desired, 0.22, delta);
      damp3(gaze, target, 0.28, delta);
    }

    camera.lookAt(gaze);

    // Under `frameloop="demand"` nothing redraws unless a frame is asked for.
    // Keep asking while anything is still moving, then stop.
    const settling =
      camera.position.distanceToSquared(desired) > 1e-7 ||
      Math.abs(smoothed.yaw - o.yaw) > 1e-4 ||
      Math.abs(smoothed.pitch - o.pitch) > 1e-4;
    if (o.dragging || (!reducedMotion && settling)) invalidate();
  });

  return <OrthographicCamera makeDefault position={[8, 8, 8]} zoom={zoom} near={0.1} far={200} />;
}
