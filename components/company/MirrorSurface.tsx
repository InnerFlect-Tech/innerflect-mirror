'use client';

import { useState } from 'react';
import type { ActivityEvent } from '@/lib/model/activity';
import type { DeltaMetric, MirrorRow, WorkedExample } from '@/lib/model/mirror';
import { MirrorView } from './MirrorView';
import { RadialMirror } from './RadialMirror';

/**
 * Two readings of the same comparison.
 *
 * Split answers "how much of each department is still carried by a person" —
 * it lines the two states up so they can be counted against each other. Radial
 * answers "where is the company in the migration" — position is the progress.
 * Neither is a decoration of the other; they answer different questions.
 */
type Layout = 'split' | 'radial';

export function MirrorSurface({
  rows,
  deltas,
  example,
  events,
  caveat,
  initialLayout = 'split',
}: {
  rows: MirrorRow[];
  deltas: DeltaMetric[];
  example: WorkedExample;
  events: ActivityEvent[];
  caveat: string;
  initialLayout?: Layout;
}) {
  const [layout, setLayout] = useState<Layout>(initialLayout);

  return (
    <>
      <div className="mirror-switch">
        <fieldset className="segmented">
          <legend className="sr-only">Mirror layout</legend>
          <button
            type="button"
            aria-pressed={layout === 'split'}
            className={layout === 'split' ? 'active' : ''}
            onClick={() => setLayout('split')}
          >
            Split
          </button>
          <button
            type="button"
            aria-pressed={layout === 'radial'}
            className={layout === 'radial' ? 'active' : ''}
            onClick={() => setLayout('radial')}
          >
            Radial
          </button>
        </fieldset>
      </div>

      {layout === 'split' ? (
        <MirrorView rows={rows} deltas={deltas} example={example} caveat={caveat} />
      ) : (
        <RadialMirror rows={rows} example={example} events={events} caveat={caveat} />
      )}
    </>
  );
}
