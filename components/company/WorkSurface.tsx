'use client';

import { useState } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { AUTONOMY_LADDER, WORK_STAGES, type StageMode, type Workflow } from '@/lib/model/work';
import { stateColors } from '@/lib/tokens/state';

const STAGE_LABEL: Record<StageMode, string> = {
  autonomous: 'Autonomous',
  supervised: 'Supervised',
  human: 'Human-led',
  blocked: 'Blocked',
};

/**
 * The seven stages are fixed and always rendered in order, including the ones a
 * workflow has not automated. Hiding them would lose the point: you are looking
 * at where a human is still required, not at a progress bar.
 */
export function WorkSurface({ workflows }: { workflows: Workflow[] }) {
  const [selectedId, setSelectedId] = useState(workflows[0].id);
  const selected = workflows.find((w) => w.id === selectedId) ?? workflows[0];
  const accent = stateColors[selected.state].label;
  const unmet = selected.evidence.filter((e) => !e.met);

  return (
    <div className="work-surface">
      <ul className="work-list">
        {workflows.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              className={w.id === selectedId ? 'active' : ''}
              aria-pressed={w.id === selectedId}
              onClick={() => setSelectedId(w.id)}
              style={{ '--accent': stateColors[w.state].label } as React.CSSProperties}
            >
              <span className="work-list-top">
                <b>{w.name}</b>
                <em>{w.autonomy}%</em>
              </span>
              <small>{w.domainLabel} · {w.level}</small>
              <span className="stage-strip" aria-hidden="true">
                {WORK_STAGES.map((s) => (
                  <i key={s} data-mode={w.stages[s]} />
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <article className="work-detail">
        <header>
          <span className="eyebrow">{selected.domainLabel} · owned by {selected.owner}</span>
          <h2>{selected.name}</h2>
          <p className="work-outcome">{selected.outcome}</p>
        </header>

        <section className="work-pipeline" aria-label="Workflow stages">
          <ol>
            {WORK_STAGES.map((stage) => (
              <li key={stage} data-mode={selected.stages[stage]}>
                <span className="pipeline-dot" aria-hidden="true" />
                <b>{stage}</b>
                <small>{STAGE_LABEL[selected.stages[stage]]}</small>
              </li>
            ))}
          </ol>
        </section>

        <dl className="work-facts">
          <div><dt>Volume</dt><dd>{selected.volume}</dd></div>
          <div><dt>Cycle time</dt><dd>{selected.cycleTime}</dd></div>
          <div><dt>Human effort</dt><dd>{selected.humanEffort}</dd></div>
          <div><dt>Error rate</dt><dd>{selected.errorRate}</dd></div>
          <div><dt>Exceptions</dt><dd className={selected.exceptions > 0 ? 'has-attention' : undefined}>{selected.exceptions}</dd></div>
          <div><dt>Systems</dt><dd>{selected.systems.join(' · ')}</dd></div>
        </dl>

        <section className="work-ladder">
          <div className="section-head">
            <div>
              <span className="eyebrow">Autonomy is earned, not toggled</span>
              <h3>
                {selected.level}
                {unmet.length > 0
                  ? ` — ${unmet.length} of 6 evidence requirements unmet`
                  : ' — all evidence satisfied'}
              </h3>
            </div>
          </div>

          <ol className="ladder">
            {AUTONOMY_LADDER.map((level) => {
              const reached = AUTONOMY_LADDER.indexOf(level) <= AUTONOMY_LADDER.indexOf(selected.level);
              return (
                <li key={level} className={reached ? 'reached' : ''} style={reached ? { color: accent } : undefined}>
                  {level}
                </li>
              );
            })}
          </ol>

          <ul className="evidence">
            {selected.evidence.map((e) => (
              <li key={e.kind} className={e.met ? 'met' : 'unmet'}>
                <span className="evidence-icon" aria-hidden="true">
                  {e.met ? <Check size={13} /> : <TriangleAlert size={13} />}
                </span>
                <span className="evidence-body">
                  <b>{e.label}</b>
                  <small>Requires {e.requirement} · observed {e.observed}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="work-policies">
          <span className="eyebrow">Governed by</span>
          <p>{selected.policies.join(' · ')}</p>
        </footer>
      </article>
    </div>
  );
}
