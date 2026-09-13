import { TriangleAlert } from 'lucide-react';
import type { KnowledgeObject } from '@/lib/model/knowledge';

/**
 * Server component. Knowledge is not a document repository, so this is not a
 * file list: each row is an object with a trust level, an owner, and a date it
 * was last checked against reality.
 *
 * Drift is given the most visual weight on the surface, because the difference
 * between what is documented and what actually happens is the thing Mirror
 * exists to reveal.
 */
const FRESHNESS_LABEL = { current: 'Current', ageing: 'Ageing', stale: 'Stale' } as const;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function trustTone(trust: number) {
  if (trust >= 80) return 'var(--state-active-label)';
  if (trust >= 60) return 'var(--state-attention-label)';
  return 'var(--state-critical-label)';
}

export function KnowledgeSurface({ objects }: { objects: KnowledgeObject[] }) {
  const drifting = objects.filter((o) => o.drift);

  return (
    <div className="knowledge-surface">
      {drifting.length > 0 && (
        <section className="drift-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Documented vs observed</span>
              <h3>{drifting.length} knowledge objects no longer match what actually happens</h3>
            </div>
            <TriangleAlert size={18} aria-hidden="true" />
          </div>
          <ul>
            {drifting.map((o) => (
              <li key={o.id}>
                <b>{o.name}</b>
                <div className="drift-pair">
                  <p><span className="eyebrow">Documented</span>{o.drift!.documented}</p>
                  <p><span className="eyebrow">Observed</span>{o.drift!.observed}</p>
                </div>
                <small>Diverged on {o.drift!.divergence}</small>
              </li>
            ))}
          </ul>
        </section>
      )}

      <table className="knowledge-table">
        <caption className="sr-only">
          Knowledge objects with trust, freshness, owner, usage and conflicts.
        </caption>
        <thead>
          <tr>
            <th scope="col">Object</th>
            <th scope="col">Kind</th>
            <th scope="col">Trust</th>
            <th scope="col">Last verified</th>
            <th scope="col">Owner</th>
            <th scope="col">Used by</th>
          </tr>
        </thead>
        <tbody>
          {objects.map((o) => (
            <tr key={o.id}>
              <th scope="row">
                <b>{o.name}</b>
                {o.conflicts && <small className="conflict">Conflicts: {o.conflicts.join('; ')}</small>}
              </th>
              <td><span className="kind-pill">{o.kind.replace('-', ' ')}</span></td>
              <td>
                <span className="trust" style={{ color: trustTone(o.trust) }}>{o.trust}</span>
                <em className="trust-bar" aria-hidden="true">
                  <i style={{ width: `${o.trust}%`, background: trustTone(o.trust) }} />
                </em>
              </td>
              <td data-freshness={o.freshness}>
                {o.lastVerified}
                <small>{FRESHNESS_LABEL[o.freshness]}</small>
              </td>
              <td className={o.owner === 'Unassigned' ? 'has-attention' : undefined}>{o.owner}</td>
              <td>{plural(o.usedBy, 'workflow')} · {plural(o.relatedDecisions, 'decision')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
