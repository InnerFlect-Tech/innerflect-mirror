'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { stateTokens, type SceneState } from '../tokens/sceneStates';
import { buildPath } from './buildPath';
import { ConnectionPulse } from './ConnectionPulse';

export function Connection({
  from,
  state,
  active,
  subdued,
  running,
  offset,
}: {
  from: [number, number, number];
  state: SceneState;
  active: boolean;
  subdued: boolean;
  running: boolean;
  offset: number;
}) {
  const token = stateTokens[state];
  const curve = useMemo(() => buildPath(from), [from]);
  const points = useMemo(() => curve.getPoints(48), [curve]);

  return (
    <group>
      <Line
        points={points}
        color={token.connection}
        lineWidth={active ? 1.8 : 1.1}
        transparent
        opacity={subdued ? 0.28 : active ? 0.75 : 0.52}
      />
      <ConnectionPulse
        curve={curve}
        color={token.label}
        offset={offset}
        intensity={subdued ? 0.8 : active ? 2.6 : 1.6}
        running={running}
      />
    </group>
  );
}
