'use client';

/**
 * The company, projected flat.
 *
 * `/design/floor` proved the world in 3D and nothing proved it in 2D, which
 * left the spatial model reachable only through WebGL. This is the other
 * projection: every domain and every object on it, drawn with the same SSOT
 * glyphs `/design/elements` proves and `/design/lab` composes.
 *
 * It invents nothing. The objects come from `listPickableRecords`, the same
 * function that guarantees the accessible record list cannot name something the
 * 3D pick tables can't also reach (`scripts/check-pickable-records.ts`), and
 * each one resolves to an element through `elementForRecord`. So this plan and
 * the 3D floor cannot disagree about which objects exist, or about which glyph
 * stands for each — not by discipline, but because neither is free to decide.
 */

import { listPickableRecords } from '../assets/pickableRecords';
import { elementForRecord } from '@/lib/design/recordElements';
import { worldRecords } from '@/data/world-records';
import type { Domain } from '@/lib/model/domain';
import type { RecordRef } from '@/lib/model/record';
import { stateColors } from '@/lib/tokens';
import { ElementSymbol2D } from './ElementSymbol2D';
import styles from './WorldPlan2D.module.css';

export function WorldPlan2D({
  domains,
  selectedId,
  onSelectDomain,
  onSelectRecord,
}: {
  domains: readonly Domain[];
  selectedId?: string | null;
  onSelectDomain?: (id: string) => void;
  onSelectRecord?: (ref: RecordRef) => void;
}) {
  const domainElement = elementForRecord('domain');

  return (
    <div className={styles.plan}>
      {domains.map((domain) => {
        const token = stateColors[domain.state];
        const records = listPickableRecords(domain, worldRecords);
        return (
          <section
            key={domain.id}
            className={styles.domain}
            data-selected={selectedId === domain.id || undefined}
            style={{ '--edge': token.edge, '--label': token.label, '--surface': token.surface } as React.CSSProperties}
          >
            <button
              type="button"
              className={styles.head}
              aria-pressed={selectedId === domain.id}
              onClick={() => onSelectDomain?.(domain.id)}
            >
              {domainElement && (
                <ElementSymbol2D
                  id={domainElement.id}
                  state={domain.state}
                  className={styles.domainGlyph}
                />
              )}
              <span>
                <b>{domain.label}</b>
                <small>{domain.mode} · {domain.autonomy}% autonomous</small>
              </span>
            </button>

            <ul className={styles.records}>
              {records.map(({ ref, label }) => {
                const element = elementForRecord(ref.type);
                // No element means the world draws no object for this record
                // kind. Showing a placeholder would be inventing one.
                if (!element) return null;
                return (
                  <li key={`${ref.type}:${ref.id}`}>
                    <button type="button" onClick={() => onSelectRecord?.(ref)}>
                      <ElementSymbol2D
                        id={element.id}
                        state={domain.state}
                        className={styles.recordGlyph}
                      />
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
