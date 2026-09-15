'use client';

import { useState } from 'react';
import { CompanyWorld } from '..';
import { toWorldDomain, type Domain } from '@/lib/model/domain';
import type { RecordRef } from '@/lib/model/record';
import { WorldPlan2D } from './WorldPlan2D';

/**
 * The company floor, rendered by the PRODUCT'S OWN `CompanyWorld`.
 *
 * There is no second floor. The acceptance criterion is explicit that neither
 * design route may reimplement production objects, and the prototype that did
 * had already drifted — it collapsed two distinct states onto one colour within
 * days, because nothing mechanically tied it to the tokens it claimed to share.
 *
 * The 2D projection alongside it is held to the same standard: it is not a
 * drawing of the floor, it is the same records resolved through the same
 * element registry (`WorldPlan2D`). Neither projection is free to decide which
 * objects exist or which glyph stands for one, so they cannot drift apart the
 * way that prototype did.
 */
export function FloorPreview({ domains }: { domains: Domain[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picked, setPicked] = useState<RecordRef | null>(null);
  const [projection, setProjection] = useState<'2d' | '3d'>('3d');

  return (
    <div className="floor-page">
      <p className="floor-note">
        The real <b>&lt;CompanyWorld&gt;</b>, same components as the home surface.{' '}
        {picked
          ? <>Last click resolved to <b>{picked.type}:{picked.id}</b>.</>
          : <>Click any object — a bay, a desk, a gate pylon, an agent — to resolve it to its record.</>}
      </p>

      <fieldset className="floor-projection">
        <legend className="sr-only">Projection</legend>
        {(['2d', '3d'] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={projection === p}
            onClick={() => setProjection(p)}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </fieldset>

      {projection === '3d' ? (
        <CompanyWorld
          domains={domains.map(toWorldDomain)}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSelectRecord={setPicked}
          running
        />
      ) : (
        <WorldPlan2D
          domains={domains}
          selectedId={selectedId}
          onSelectDomain={(id) => setSelectedId((current) => (current === id ? null : id))}
          onSelectRecord={setPicked}
        />
      )}
    </div>
  );
}
