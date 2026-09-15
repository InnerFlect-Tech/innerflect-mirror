'use client';

import { useCallback, useRef } from 'react';
import { HOME_PITCH, HOME_YAW, clampPitch } from './useCameraNavigation';

export type OrbitState = { yaw: number; pitch: number; dragging: boolean };

/**
 * Drag-to-rotate, held in refs so dragging never re-renders React.
 *
 * Listeners are bound natively to the container rather than passed as JSX
 * props: a drag is a per-frame path that wants no synthetic-event overhead, and
 * pointer capture means a drag leaving the canvas still finishes cleanly. A
 * drag under a few pixels is treated as a click, so selecting an island still
 * works.
 */
/** Pointer travel, in pixels, below which a press is still a click. */
const DRAG_SLOP = 5;

export function useOrbitControl() {
  const orbit = useRef<OrbitState>({ yaw: HOME_YAW, pitch: HOME_PITCH, dragging: false });
  const start = useRef({ x: 0, y: 0, yaw: 0, pitch: 0, moved: 0 });

  const reset = useCallback(() => {
    orbit.current.yaw = HOME_YAW;
    orbit.current.pitch = HOME_PITCH;
  }, []);

  /** A drag is not a click. Selection must not fire when the user was rotating. */
  const wasDrag = useCallback(() => start.current.moved > DRAG_SLOP, []);

  const bindSurface = useCallback((el: HTMLElement | null) => {
    if (!el) return;

    // Focusable so the keyboard controls below are reachable. Set here rather
    // than as a tabIndex prop because this element is an interactive surface,
    // not a static graphic.
    el.tabIndex = 0;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // Deliberately NOT capturing the pointer here. Capture retargets every
      // later pointer event to this container, so the <canvas> inside it never
      // receives the pointerup — and React Three Fiber synthesises its click
      // from pointerdown + pointerup on the canvas. Capturing on press made
      // every click on a domain island silently do nothing. Capture starts in
      // `move`, once the pointer has travelled far enough to be a real drag.
      orbit.current.dragging = true;
      start.current = {
        x: e.clientX,
        y: e.clientY,
        yaw: orbit.current.yaw,
        pitch: orbit.current.pitch,
        moved: 0,
      };
    };

    const move = (e: PointerEvent) => {
      if (!orbit.current.dragging) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      start.current.moved = Math.max(start.current.moved, Math.abs(dx) + Math.abs(dy));

      // Now it is a drag, not a click: take the pointer so rotating off the
      // edge of the canvas still finishes cleanly.
      if (start.current.moved > DRAG_SLOP && !el.hasPointerCapture?.(e.pointerId)) {
        el.setPointerCapture?.(e.pointerId);
      }

      orbit.current.yaw = start.current.yaw - dx * 0.005;
      orbit.current.pitch = clampPitch(start.current.pitch + dy * 0.004);
    };

    const up = (e: PointerEvent) => {
      if (!orbit.current.dragging) return;
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture?.(e.pointerId);
      orbit.current.dragging = false;
    };

    // Keyboard parity: the world must be operable without a pointer.
    const key = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 0.28 : 0.12;
      if (e.key === 'ArrowLeft') orbit.current.yaw -= step;
      else if (e.key === 'ArrowRight') orbit.current.yaw += step;
      else if (e.key === 'ArrowUp') orbit.current.pitch = clampPitch(orbit.current.pitch + step * 0.6);
      else if (e.key === 'ArrowDown') orbit.current.pitch = clampPitch(orbit.current.pitch - step * 0.6);
      else if (e.key === 'Home' || e.key === '0') reset();
      else return;
      e.preventDefault();
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('keydown', key);

    return () => {
      orbit.current.dragging = false;
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('keydown', key);
    };
  }, [reset]);

  return { orbit, bindSurface, reset, wasDrag };
}
