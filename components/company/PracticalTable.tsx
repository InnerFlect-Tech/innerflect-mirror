'use client';

import type { Domain } from '@/lib/model/domain';
import { stateLabel } from '@/lib/model/state';
import { stateColors } from '@/lib/tokens/state';

/**
 * A real table. This was a grid of <button>s with header <span>s, which gave a
 * screen-reader user a list of controls with no column meaning. Row selection
 * lives on a button inside the first cell, so the row keeps its table semantics.
 */
export function PracticalTable({
  domains,
  onSelect,
}: {
  domains: Domain[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="practical-view">
      <table>
        <caption className="sr-only">
          Operating state by domain: area, state, active work, autonomy and items needing attention.
        </caption>
        <thead>
          <tr className="practical-head">
            <th scope="col">Area</th>
            <th scope="col">State</th>
            <th scope="col">Work</th>
            <th scope="col">Autonomy</th>
            <th scope="col">Attention</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((d) => {
            const accent = stateColors[d.state].label;
            const needsAttention = d.openItems > 0 && (d.state === 'critical' || d.state === 'attention');
            return (
              <tr key={d.id}>
                <th scope="row">
                  <button
                    type="button"
                    aria-label={`${d.label} — ${stateLabel[d.state]}, ${d.autonomy}% autonomous, ${d.openItems} needing attention`}
                    onClick={() => onSelect(d.id)}
                  >
                    <i aria-hidden="true" style={{ background: accent, color: accent }} />
                    <b>{d.label}</b>
                  </button>
                </th>
                <td style={{ color: accent }}>{stateLabel[d.state]}</td>
                <td>{d.activeWork} active</td>
                <td>
                  <em aria-hidden="true"><i style={{ width: `${d.autonomy}%`, background: accent }} /></em>
                  {d.autonomy}%
                </td>
                <td className={needsAttention ? 'has-attention' : undefined}>{d.openItems}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
