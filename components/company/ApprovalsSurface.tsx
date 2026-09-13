'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, Clock3, Lightbulb, RotateCcw, ShieldAlert } from 'lucide-react';
import { DECISION_ACTIONS, type Decision, type Priority } from '@/lib/model/decision';
import { authorityLimits } from '@/data/constitution';
import { stateColors } from '@/lib/tokens/state';

const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'High priority',
  medium: 'Medium',
  low: 'Low',
};

const REVERSIBILITY_LABEL = {
  reversible: 'Reversible',
  'partially-reversible': 'Partially reversible',
  irreversible: 'Irreversible',
} as const;

type Tab = 'pending' | 'reviewed' | 'all';

/**
 * A card per approval: what is at stake, why it needs a human, what the system
 * recommends and how sure it is, and the two buttons — all without expanding
 * anything. Full context sits behind "View details" for the cases where the
 * summary is not enough, which should be the minority.
 */
export function ApprovalsSurface({ decisions }: { decisions: Decision[] }) {
  const [tab, setTab] = useState<Tab>('pending');
  const [sort, setSort] = useState<'priority' | 'age'>('priority');
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    const list = decisions.filter((d) => {
      const done = Boolean(resolved[d.id]);
      if (tab === 'pending') return !done;
      if (tab === 'reviewed') return done;
      return true;
    });
    return sort === 'priority'
      ? [...list].sort((a, b) => rank[a.priority] - rank[b.priority])
      : list;
  }, [decisions, tab, sort, resolved]);

  const pending = decisions.filter((d) => !resolved[d.id]).length;
  const reviewed = decisions.length - pending;

  const suggestions = decisions.filter((d) => d.policySuggestion).length;
  const reviewedList = decisions.filter((d) => resolved[d.id]);

  return (
    <div className="approvals">
      <div className="approvals-bar">
        <div className="tabs" role="tablist" aria-label="Approval queue">
          {([
            ['pending', 'Pending', pending],
            ['reviewed', 'Reviewed', reviewed],
            ['all', 'All', decisions.length],
          ] as const).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
              {id !== 'all' && <em>{count}</em>}
            </button>
          ))}
        </div>

        <label className="sort-select">
          <span className="sr-only">Sort approvals</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'priority' | 'age')}>
            <option value="priority">Priority</option>
            <option value="age">Longest waiting</option>
          </select>
        </label>
      </div>

      <div className="approvals-body">
      <div className="approvals-main">
      {visible.length === 0 ? (
        <p className="approvals-empty">
          Nothing waiting. Everything else is running.
        </p>
      ) : (
        <ul className="approval-list">
          {visible.map((d) => {
            const accent = stateColors[d.state].label;
            const outcome = resolved[d.id];
            const open = openId === d.id;

            return (
              <li key={d.id} className={`approval${outcome ? ' is-resolved' : ''}`}>
                <div className="approval-card" data-priority={d.priority}>
                  <div className="approval-what">
                    <span className="approval-priority" data-priority={d.priority}>
                      <i aria-hidden="true" />
                      {PRIORITY_LABEL[d.priority]}
                    </span>
                    <b className="approval-title">{d.title}</b>
                    <span className="approval-amount">{d.amount}</span>
                    <small className="approval-rule">{d.breachedRule}</small>
                    <small className="approval-meta">{d.domainLabel} · {d.raised}</small>
                  </div>

                  <div className="approval-reco">
                    <span className="eyebrow">Recommendation</span>
                    <span className="reco-line">
                      <b style={{ color: accent }}>{d.recommended}</b>
                      <em>{d.confidence}%</em>
                    </span>
                    <small><span className="eyebrow">Reason</span> {d.reason}</small>
                  </div>

                  <div className="approval-actions">
                    {outcome ? (
                      <output className="approval-outcome" aria-live="polite">
                        <Check size={13} aria-hidden="true" /> {outcome}
                      </output>
                    ) : (
                      <>
                        <button type="button" className="primary" onClick={() => setResolved((r) => ({ ...r, [d.id]: 'Approved' }))}>
                          Approve
                        </button>
                        <button type="button" onClick={() => setResolved((r) => ({ ...r, [d.id]: 'Declined' }))}>
                          Decline
                        </button>
                      </>
                    )}
                    <button type="button" className="link" aria-expanded={open} onClick={() => setOpenId(open ? null : d.id)}>
                      View details <ChevronRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="approval-detail">
                    <p className="decision-situation">{d.situation}</p>

                    <section className="decision-reco" style={{ borderColor: accent }}>
                      <span className="eyebrow">Why this recommendation</span>
                      <p>{d.rationale}</p>
                    </section>

                    <dl className="decision-facts">
                      <div><dt><ShieldAlert size={12} aria-hidden="true" />Risk</dt><dd>{d.risk}</dd></div>
                      <div><dt><RotateCcw size={12} aria-hidden="true" />Reversibility</dt><dd>{REVERSIBILITY_LABEL[d.reversibility]}</dd></div>
                      <div><dt><Clock3 size={12} aria-hidden="true" />Deadline</dt><dd>{d.deadline}</dd></div>
                      <div><dt>Authority</dt><dd>{d.authority}</dd></div>
                      <div><dt>Policy</dt><dd>{d.policy}</dd></div>
                      <div><dt>Downstream</dt><dd>{d.downstream}</dd></div>
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
                        <ul className="decision-alts">{d.alternatives.map((a) => <li key={a}>{a}</li>)}</ul>
                        <span className="eyebrow">Comparable decisions</span>
                        <ul className="decision-alts">
                          {d.comparable.map((c) => <li key={c.label}><b>{c.label}</b> — {c.outcome}</li>)}
                        </ul>
                      </section>
                    </div>

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
                          onClick={() => setResolved((r) => ({ ...r, [d.id]: `${action}d`.replace('ee', 'e') }))}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      </div>

      <aside className="approvals-rail">
        <section className="panel">
          <div className="panel-head"><div><h3>Your authority</h3><small>What you can approve without anyone else.</small></div></div>
          <ul className="authority-list">
            {authorityLimits.slice(0, 4).map((a) => (
              <li key={a.id} className={a.owner === 'Unassigned' ? 'unowned' : undefined}>
                <b>{a.action}</b>
                <small>Autonomous up to {a.autonomousUpTo}</small>
                <em>{a.owner}</em>
              </li>
            ))}
          </ul>
          <Link className="panel-cta" href="/settings">Open the constitution <ChevronRight size={13} /></Link>
        </section>

        <section className="panel">
          <div className="panel-head"><div><h3>Reviewed today</h3></div><span className="count-pill">{reviewedList.length}</span></div>
          {reviewedList.length === 0 ? (
            <p className="rail-empty">Nothing reviewed yet.</p>
          ) : (
            <ul className="reviewed-list">
              {reviewedList.map((d) => (
                <li key={d.id}><b>{d.title}</b><em>{resolved[d.id]}</em></li>
              ))}
            </ul>
          )}
        </section>

        {suggestions > 0 && (
          <section className="panel policy-rail">
            <Lightbulb size={15} aria-hidden="true" />
            <div>
              <b>{suggestions} repeated {suggestions === 1 ? 'decision' : 'decisions'} could become policy.</b>
              <p>Turning a repeated judgement into a rule is how tacit knowledge becomes institutional memory.</p>
            </div>
          </section>
        )}
      </aside>
      </div>
    </div>
  );
}
