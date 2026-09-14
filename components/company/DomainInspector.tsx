'use client';

import { ArrowRight } from 'lucide-react';
import type { Domain } from '@/lib/model/domain';
import { stateColors } from '@/lib/tokens/state';

const ACTIVITY_GLYPH: Record<string, string> = {
  acting: '⚡',
  waiting: '◷',
  verifying: '✓',
  escalating: '!',
  moving: '→',
  'handing-off': '⇄',
  idle: '·',
};

export function DomainInspector({
  domain,
  focused,
  onOpenAgent,
}: {
  domain: Domain;
  focused: boolean;
  onOpenAgent: (name: string) => void;
}) {
  const accent = stateColors[domain.state].label;
  const pill =
    domain.state === 'active'
      ? 'auto'
      : domain.state === 'critical'
        ? 'danger'
        : '';

  return (
    <article className="detail-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">{focused ? 'Selected domain' : 'Most needs you'}</span>
          <h3>{domain.label}</h3>
        </div>
        <span className={`mode-pill ${pill}`}>{domain.mode}</span>
      </div>

      <ul className="team-row">
        {domain.agents.map((a, i) => (
          <li key={a.id}>
            <button
              type="button"
              aria-label={`${a.name} — ${a.job}`}
              onClick={() => onOpenAgent(a.name)}
            >
              <span className={`person ${a.activity}`}>
                <i aria-hidden="true" />
                <b aria-hidden="true">{a.initials}</b>
                <em aria-hidden="true">{ACTIVITY_GLYPH[a.activity] ?? '·'}</em>
              </span>
              <span><b>{a.name}</b><small>{a.job}</small></span>
            </button>
            {i < domain.agents.length - 1 && <ArrowRight className="handoff" size={15} aria-hidden="true" />}
          </li>
        ))}
      </ul>

      <div className="domain-progress">
        <span><b>{domain.autonomy}%</b> autonomous capacity</span>
        <div><i style={{ width: `${domain.autonomy}%`, background: accent }} /></div>
        <small>{domain.people} humans watching · {domain.agents.length} agents active</small>
      </div>
    </article>
  );
}
