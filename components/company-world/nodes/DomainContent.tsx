'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { WorldDomain } from '@/lib/model/domain';
import { buildAgentGeometry, buildIslandGeometry, type IslandRecords } from '../assets/primitives';

/**
 * What sits on an island.
 *
 * Every object here is a projection of the domain record: a bay per workflow,
 * a desk and a figure per human seat, a column scaled by throughput, a pylon
 * wherever a workflow is waiting on a person. The full mapping lives in
 * `WORLD_ELEMENTS.md`, and nothing reaches the screen without a row in it.
 *
 * This used to switch on `shape % 4` — the domain's position in an array —
 * which is why the islands held towers that meant nothing. A renderer that
 * branches on identity or index has stopped being a projection of the model.
 *
 * `accent` arrives from the state token, so a domain in trouble tints its own
 * contents without any per-domain colour existing anywhere.
 */
export function DomainContent({
  domain,
  accent,
  records,
  running = false,
  reducedMotion = false,
}: {
  domain: WorldDomain;
  accent: string;
  /** The records that justify the gate pylons and hotspots on this island. */
  records?: IslandRecords;
  /** Work is flowing. Without it, agents hold their pose and nothing redraws. */
  running?: boolean;
  reducedMotion?: boolean;
}) {
  // Request 3: agents move only while work flows. The frame loop is `always`
  // while running and `demand` when not, so returning early here is what keeps a
  // paused scene at zero draw calls — this never calls invalidate() itself.
  const motes = useRef<Mesh>(null);
  const escalating = domain.agents.some((a) => a.activity === 'escalating');
  const waiting = domain.agents.some((a) => a.activity === 'waiting');
  // Pose from activity: escalating is urgent, waiting is a slow held breath,
  // everything else is quiet. Amplitude and rate are the only knobs.
  const rate = escalating ? 3.2 : waiting ? 1.1 : 1.8;
  const amp = escalating ? 0.03 : waiting ? 0.012 : 0.018;
  useFrame(({ clock }) => {
    const m = motes.current;
    if (!m || !running || reducedMotion) return;
    m.position.y = Math.sin(clock.elapsedTime * rate) * amp;
  });
  // Rebuilt only when the model or the state colour changes — never per frame,
  // never on hover or selection.
  const island = useMemo(
    () => buildIslandGeometry(domain.workflows, accent, records),
    [domain.workflows, accent, records],
  );

  // The figure stands for the Agent; the pose stands for its activity. Passing
  // both keeps identity and activity as separate fields, which the contract
  // requires and a bare activity list could not express.
  const agentGlyphs = useMemo(
    () => domain.agents.map((a) => ({ id: a.id, activity: a.activity as string })),
    [domain.agents],
  );

  const agents = useMemo(
    () => buildAgentGeometry(agentGlyphs, accent),
    [agentGlyphs, accent],
  );

  // Merged geometry is created imperatively, so disposing it is this
  // component's job rather than R3F's.
  // Two effects, not one. `island` and `agents` are memoised on different
  // dependency sets, so a single effect keyed on both would fire its cleanup when
  // only the island changed — disposing live agent geometry that the agent memo
  // will not recreate. Each value disposes on its own schedule.
  useEffect(() => () => {
    island.body.dispose();
    island.accent.dispose();
  }, [island]);

  useEffect(() => () => {
    agents.body.dispose();
    agents.accent.dispose();
  }, [agents]);

  return (
    <group position={[0, 0.032, 0]}>
      {/* Two draw calls for the whole island, whether it holds seven workflows
          or twelve. Per-object tone survives the merge as a vertex colour. */}
      <mesh geometry={island.body} userData={{ picks: island.bodyPicks }} castShadow={false} receiveShadow={false}>
        <meshStandardMaterial vertexColors roughness={0.66} metalness={0.05} />
      </mesh>
      <mesh geometry={island.accent} userData={{ picks: island.accentPicks }}>
        {/* Unlit and untone-mapped, so brightness carries meaning directly.
            Only the gate pylons are scaled above 1, which keeps bloom
            selective — attention interrupts the field, screens do not. */}
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>

      <mesh geometry={agents.body} userData={{ picks: agents.bodyPicks }}>
        <meshStandardMaterial vertexColors roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh ref={motes} geometry={agents.accent} userData={{ picks: agents.accentPicks }}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
    </group>
  );
}
