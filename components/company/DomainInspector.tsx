'use client';

import { ArrowRight } from 'lucide-react';
import type { Domain } from '@/lib/model/domain';
import type { RecordRef } from '@/lib/model/record';
import { stateColors } from '@/lib/tokens/state';

const RECORD_TYPE_LABEL: Partial<Record<RecordRef['type'], string>> = {
  workflow: 'Workflow',
  agent: 'Agent',
  decision: 'Decision waiting',
  exception: 'Exception open',
};

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
  picked,
  onOpenAgent,
}: {
  domain: Domain;
  focused: boolean;
  /** The exact record a click resolved to — a pylon, an agent, a workflow —
   *  distinct from `domain`, which is only ever the island it sits on. */
  picked?: { ref: RecordRef; label: string } | null;
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

      {picked && RECORD_TYPE_LABEL[picked.ref.type] && (
        <p>
          <span className="eyebrow">{RECORD_TYPE_LABEL[picked.ref.type]}</span> {picked.label}
        </p>
      )}

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
