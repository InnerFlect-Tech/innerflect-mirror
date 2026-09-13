'use client';

import { useEffect, useMemo } from 'react';
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
}: {
  domain: WorldDomain;
  accent: string;
  /** The records that justify the gate pylons and hotspots on this island. */
  records?: IslandRecords;
}) {
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
  useEffect(
    () => () => {
      island.body.dispose();
      island.accent.dispose();
      agents.body.dispose();
      agents.accent.dispose();
    },
    [island, agents],
  );

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
      <mesh geometry={agents.accent} userData={{ picks: agents.accentPicks }}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
    </group>
  );
}
