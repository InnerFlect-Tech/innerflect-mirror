'use client';

import { useState } from 'react';
import { Check, Clock3, Lightbulb, RotateCcw, ShieldAlert } from 'lucide-react';
import { DECISION_ACTIONS, type Decision } from '@/lib/model/decision';
import { stateColors } from '@/lib/tokens/state';

const REVERSIBILITY_LABEL = {
  reversible: 'Reversible',
  'partially-reversible': 'Partially reversible',
  irreversible: 'Irreversible',
} as const;

/**
 * A decision is not a notification. Everything needed to take it — evidence,
 * exposure, reversibility, authority, and what happened last time — is on the
 * same screen as the buttons, so nobody has to go looking before deciding.
 */
export function DecisionsSurface({ decisions }: { decisions: Decision[] }) {
  const [openId, setOpenId] = useState(decisions[0]?.id ?? '');
  const [resolved, setResolved] = useState<Record<string, string>>({});

  return (
    <ul className="decision-queue">
      {decisions.map((d) => {
        const accent = stateColors[d.state].label;
        const open = d.id === openId;
        const outcome = resolved[d.id];

        return (
          <li key={d.id} className={`decision${open ? ' is-open' : ''}${outcome ? ' is-resolved' : ''}`}>
            <button
              type="button"
              className="decision-summary"
              aria-expanded={open}
              onClick={() => setOpenId(open ? '' : d.id)}
              style={{ '--accent': accent } as React.CSSProperties}
            >
              <span className="decision-urgency" data-urgency={d.urgency} aria-hidden="true" />
              <span className="decision-head">
                <b>{d.title}</b>
                <small>{d.domainLabel} · {d.exposure} · {d.deadline}</small>
              </span>
              <span className="decision-confidence" style={{ color: accent, borderColor: accent }}>
                {d.confidence}%
              </span>
            </button>

            {open && (
              <div className="decision-body">
                <p className="decision-situation">{d.situation}</p>

                <section className="decision-reco" style={{ borderColor: accent }}>
                  <span className="eyebrow">Recommendation</span>
                  <b>{d.recommendation}</b>
                  <p>{d.rationale}</p>
                </section>

                <dl className="decision-facts">
                  <div><dt><ShieldAlert size={12} aria-hidden="true" />Risk</dt><dd>{d.risk}</dd></div>
                  <div><dt><RotateCcw size={12} aria-hidden="true" />Reversibility</dt><dd>{REVERSIBILITY_LABEL[d.reversibility]}</dd></div>
                  <div><dt><Clock3 size={12} aria-hidden="true" />Deadline</dt><dd>{d.deadline}</dd></div>
                  <div><dt>Exposure</dt><dd>{d.exposure}</dd></div>
                  <div><dt>Authority</dt><dd>{d.authority}</dd></div>
                  <div><dt>Policy</dt><dd>{d.policy}</dd></div>
                </dl>

                <div className="decision-columns">
                  <section>
                    <span className="eyebrow">Evidence</span>
                    <ul className="decision-evidence">
                      {d.evidence.map((e) => (
                        <li key={e.label}><b>{e.label}</b><small>{e.detail}</small></li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <span className="eyebrow">Alternatives</span>
                    <ul className="decision-alts">
                      {d.alternatives.map((a) => <li key={a}>{a}</li>)}
                    </ul>

                    <span className="eyebrow">Comparable decisions</span>
                    <ul className="decision-alts">
                      {d.comparable.map((c) => (
                        <li key={c.label}><b>{c.label}</b> — {c.outcome}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <p className="decision-downstream">
                  <span className="eyebrow">Downstream</span> {d.downstream}
                </p>

                {d.policySuggestion && (
                  <aside className="policy-suggestion">
                    <Lightbulb size={15} aria-hidden="true" />
                    <div>
                      <b>Seen {d.policySuggestion.timesSeen} times, decided the same way each time.</b>
                      <p>{d.policySuggestion.proposal}</p>
                    </div>
                    <button type="button" onClick={() => setResolved((r) => ({ ...r, [d.id]: 'Policy proposed' }))}>
                      Turn into policy
                    </button>
                  </aside>
                )}

                <div className="decision-actions">
                  {DECISION_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className={action === 'Approve' ? 'primary' : ''}
                      onClick={() => setResolved((r) => ({ ...r, [d.id]: action }))}
                    >
                      {action}
                    </button>
                  ))}
                </div>

                {outcome && (
                  <output className="decision-outcome" aria-live="polite">
                    <Check size={13} aria-hidden="true" /> {outcome} — recorded with authority, evidence and an audit entry.
                  </output>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
