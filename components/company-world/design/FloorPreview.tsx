'use client';

import { useState } from 'react';
import { CompanyWorld } from '..';
import { toWorldDomain, type Domain } from '@/lib/model/domain';
import type { RecordRef } from '@/lib/model/record';

/**
 * The company floor, rendered by the PRODUCT'S OWN `CompanyWorld`.
 *
 * There is no second floor. The acceptance criterion is explicit that neither
 * design route may reimplement production objects, and the prototype that did
 * had already drifted — it collapsed two distinct states onto one colour within
 * days, because nothing mechanically tied it to the tokens it claimed to share.
 */
export function FloorPreview({ domains }: { domains: Domain[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picked, setPicked] = useState<RecordRef | null>(null);

  return (
    <div className="floor-page">
      <p className="floor-note">
        The real <b>&lt;CompanyWorld&gt;</b>, same components as the home surface.{' '}
        {picked
          ? <>Last click resolved to <b>{picked.type}:{picked.id}</b>.</>
          : <>Click any object — a bay, a desk, a gate pylon, an agent — to resolve it to its record.</>}
      </p>
      <CompanyWorld
        domains={domains.map(toWorldDomain)}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onSelectRecord={setPicked}
        running
      />
    </div>
  );
}
