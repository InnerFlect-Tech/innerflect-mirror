'use client';

import { Info, User } from 'lucide-react';
import type { DeltaMetric, MirrorRow, StepActor } from '@/lib/model/mirror';
import { stateColors } from '@/lib/tokens/state';

/**
 * The Mirror: how the company operates now, beside the same company operating
 * itself. Same structure, same people — a different distribution of effort.
 *
 * This is the product's thesis, so the two columns are deliberately the same
 * shape: identical row order, identical step count. The only thing that changes
 * between them is who does each step, which is the whole argument.
 */
const ACTOR_TITLE: Record<StepActor, string> = {
  human: 'Done by a person',
  system: 'Run by the system',
  gate: 'A person is required here',
};

export function MirrorView({
  rows,
  deltas,
  caveat,
  onSelect,
}: {
  rows: MirrorRow[];
  deltas: DeltaMetric[];
  caveat: string;
  onSelect: (id: string) => void;
}) {
  const hoursNow = rows.reduce((s, r) => s + r.hoursNow, 0);
  const hoursProjected = rows.reduce((s, r) => s + r.hoursProjected, 0);

  return (
    <div className="mirror-view">
      <div className="mirror-columns">
        <header className="mirror-col-head">
          <span className="eyebrow">How it operates now</span>
          <b>Human judgement. Human effort.</b>
          <small>{hoursNow} hours a week</small>
        </header>
        <div className="mirror-axis" aria-hidden="true">
          <i /><span>Human</span><span>Supervised</span><span>Autonomous</span><i />
        </div>
        <header className="mirror-col-head is-reflected">
          <span className="eyebrow">Its autonomous reflection</span>
          <b>Same structure. Less busy work.</b>
          <small>{hoursProjected} hours a week — projected</small>
        </header>
      </div>

      <ul className="mirror-rows">
        {rows.map((row) => {
          const accent = stateColors[row.state].label;
          return (
            <li key={row.id}>
              <button
                type="button"
                className="mirror-row"
                aria-label={`${row.label} — ${row.mode}, ${row.people} people, ${row.hoursNow} hours a week now, ${row.hoursProjected} projected`}
                onClick={() => onSelect(row.id)}
              >
                <span className="mirror-side">
                  <span className="mirror-row-head">
                    <i aria-hidden="true" style={{ background: accent }} />
                    <b>{row.label}</b>
                    <em><User size={11} aria-hidden="true" />{row.people}</em>
                  </span>
                  <span className="chain">
                    {row.today.map((s, i) => (
                      <span key={i} className="chain-step" data-actor={s.actor} title={ACTOR_TITLE[s.actor]}>
                        {s.label}
                      </span>
                    ))}
                  </span>
                </span>

                <span className="mirror-gap" aria-hidden="true">
                  <span className="mirror-hours">{row.hoursNow}h</span>
                  <span className="mirror-arrow">→</span>
                  <span className="mirror-hours is-to" style={{ color: accent }}>{row.hoursProjected}h</span>
                </span>

                <span className="mirror-side is-reflected">
                  <span className="mirror-row-head">
                    <b>{row.label}</b>
                    <span className="mode-chip" style={{ color: accent, borderColor: accent }}>{row.mode}</span>
                  </span>
                  <span className="chain">
                    {row.reflected.map((s, i) => (
                      <span key={i} className="chain-step" data-actor={s.actor} title={ACTOR_TITLE[s.actor]}>
                        {s.label}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mirror-foot">
        <ul className="delta-list">
          {deltas.map((d) => (
            <li key={d.label}>
              <span className="delta-values">
                <em>{d.from}</em>
                <i aria-hidden="true">→</i>
                <b>{d.to}</b>
              </span>
              <small>{d.label}</small>
            </li>
          ))}
        </ul>

        <p className="mirror-caveat">
          <Info size={13} aria-hidden="true" />
          {caveat}
        </p>
      </div>

      <ul className="chain-legend">
        <li><i data-actor="human" />Done by a person</li>
        <li><i data-actor="system" />Run by the system</li>
        <li><i data-actor="gate" />A person is required</li>
      </ul>
    </div>
  );
}
