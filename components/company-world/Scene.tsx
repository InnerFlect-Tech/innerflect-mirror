'use client';

import type { RefObject } from 'react';
import { useMemo } from 'react';
import { ContactShadows } from '@react-three/drei';
import { CompanyCamera } from './camera/CompanyCamera';
import type { OrbitState } from './camera/useOrbitControl';
import { Connection } from './connections/Connection';
import { WorldFloor } from './world/WorldFloor';
import { BackgroundContext } from './world/BackgroundContext';
import { CompanyCore } from './nodes/CompanyCore';
import { DomainIsland } from './nodes/DomainIsland';
import type { WorldDomain } from './nodes/NodeState';
import { CompanyLabel, WorldLabel } from './labels/WorldLabel';
import { companyLayout } from './layouts/companyLayout';
import { worldRecords } from '@/data/world-records';
import type { RecordRef } from '@/lib/model/record';
import { stateTokens } from './tokens/sceneStates';

export function Scene({
  domains,
  selectedId,
  onSelect,
  onSelectRecord,
  running,
  reducedMotion,
  orbit,
}: {
  domains: WorldDomain[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSelectRecord?: (ref: RecordRef) => void;
  running: boolean;
  reducedMotion: boolean;
  orbit: RefObject<OrbitState>;
}) {
  const slots = useMemo(() => companyLayout(domains.length), [domains.length]);
  const selectedIndex = domains.findIndex((d) => d.id === selectedId);
  const hasSelection = selectedIndex >= 0;

  // Governance as a layer: the company's own state is the worst state present
  // anywhere in it, which is why the core reddens when a domain does.
  const companyState = useMemo(() => {
    if (domains.some((d) => d.state === 'critical')) return 'critical' as const;
    if (domains.some((d) => d.state === 'attention')) return 'attention' as const;
    return 'active' as const;
  }, [domains]);

  return (
    <group rotation={[0, -0.06, 0]}>
      <CompanyCamera
        focus={hasSelection ? slots[selectedIndex].position : null}
        reducedMotion={reducedMotion}
        orbit={orbit}
      />

      <WorldFloor />
      <BackgroundContext />

      {domains.map((domain, i) => (
        <Connection
          key={`c-${domain.id}`}
          from={slots[i].position}
          state={domain.state}
          active={i === selectedIndex}
          subdued={hasSelection && i !== selectedIndex}
          running={running && !reducedMotion}
          offset={i * 0.27}
        />
      ))}

      <CompanyCore
        state={companyState}
        subdued={hasSelection}
        running={running}
        reducedMotion={reducedMotion}
      />

      {domains.map((domain, i) => (
        <DomainIsland
          key={domain.id}
          visual={{ domain, position: slots[i].position, scale: slots[i].scale }}
          records={worldRecords}
          index={i}
          selected={i === selectedIndex}
          subdued={hasSelection && i !== selectedIndex}
          onSelect={() => onSelect(domain.id)}
          onSelectRecord={onSelectRecord}
          reducedMotion={reducedMotion}
        />
      ))}

      <CompanyLabel
        position={[0, 1.05, 0]}
        title="Your Company"
        state={companyState === 'active' ? 'Healthy' : companyState === 'attention' ? 'Attention' : 'At risk'}
        accent={stateTokens[companyState].label}
        subdued={hasSelection}
      />

      {domains.map((domain, i) => {
        const [x, , z] = slots[i].position;
        // Push each label outward along the ray from the core, so labels never
        // pile onto the centre or onto each other regardless of node count.
        const d = Math.hypot(x, z) || 1;
        const lx = x + (x / d) * 0.72;
        const lz = z + (z / d) * 0.72;
        return (
          <WorldLabel
            key={`l-${domain.id}`}
            position={[lx, 1.05, lz]}
            title={domain.label}
            processes={domain.processes}
            autonomy={domain.autonomy}
            icon={domain.icon}
            accent={stateTokens[domain.state].label}
            subdued={hasSelection && i !== selectedIndex}
            onSelect={() => onSelect(domain.id)}
          />
        );
      })}

      {/* Baked once. ContactShadows re-renders the whole scene into a depth
          target on every frame it is left dynamic, which is a full extra pass
          for a soft blur that cannot resolve the 0.13-unit hover lift anyway. */}
      <ContactShadows
        frames={1}
        position={[0, -0.41, 0]}
        opacity={0.32}
        scale={15}
        blur={2.6}
        far={6}
        resolution={512}
      />
    </group>
  );
}
