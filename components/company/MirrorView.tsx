import Link from 'next/link';
import {
  BarChart3, Calendar, CheckCircle2, Database, FileText, IdCard, Image,
  Info, Mail, MessageSquare, Search, Send, Sparkles, Table, User, Users,
} from 'lucide-react';
import type {
  DeltaMetric, MirrorRow, MirrorStep, StepIcon, WorkedExample,
} from '@/lib/model/mirror';
import { stateColors } from '@/lib/tokens/state';

/**
 * The Mirror: how the company operates now, beside the same company operating
 * itself. Same rows, same number of steps — the only thing that changes is who
 * performs each one, which is the entire argument the product makes.
 *
 * Steps are icons rather than words on purpose. At a glance you are counting
 * grey tiles against teal ones, not reading two paragraphs; the labels stay
 * available as tooltips and to screen readers, and the worked example at the
 * bottom spells one workflow out in full.
 */
const ICONS: Record<StepIcon, React.ReactNode> = {
  person: <User size={14} />,
  mail: <Mail size={14} />,
  doc: <FileText size={14} />,
  crm: <IdCard size={14} />,
  search: <Search size={14} />,
  reply: <MessageSquare size={14} />,
  chart: <BarChart3 size={14} />,
  calendar: <Calendar size={14} />,
  image: <Image size={14} />,
  users: <Users size={14} />,
  chat: <MessageSquare size={14} />,
  sheet: <Table size={14} />,
  system: <Sparkles size={14} />,
  send: <Send size={14} />,
  check: <CheckCircle2 size={14} />,
  database: <Database size={14} />,
};

function Chain({ steps }: { steps: MirrorStep[] }) {
  return (
    <span className="chain">
      {steps.map((s, i) => (
        <span key={i} className="chain-cell">
          <span className="chain-tile" data-actor={s.actor} title={s.label}>
            <span className="sr-only">{s.label}</span>
            <span aria-hidden="true">{ICONS[s.icon]}</span>
          </span>
          {i < steps.length - 1 && <i className="chain-arrow" aria-hidden="true" />}
        </span>
      ))}
    </span>
  );
}

export function MirrorView({
  rows,
  deltas,
  example,
  caveat,
}: {
  rows: MirrorRow[];
  deltas: DeltaMetric[];
  example: WorkedExample;
  caveat: string;
}) {
  return (
    <div className="mirror-view">
      <div className="mirror-stage">
        <div className="mirror-board">
          <div className="mirror-heads">
            <header>
              <h3>Today</h3>
              <small>Same company. Manual execution.</small>
            </header>
            <div className="mirror-axis" aria-hidden="true">
              <span>Human</span>
              <i />
              <span>Supervised</span>
              <i />
              <span>Autonomous</span>
            </div>
            <header className="is-reflected">
              <h3>Autonomous</h3>
              <small>Same company. Self-operating.</small>
            </header>
          </div>

          <ul className="mirror-rows">
            {rows.map((row) => {
              const accent = stateColors[row.state].label;
              return (
                <li key={row.id}>
                  <Link
                    href="/processes"
                    className="mirror-row"
                    aria-label={`${row.label} — ${row.mode}, ${row.people} people, ${row.hoursNow} hours a week now, ${row.hoursProjected} projected. Open Processes.`}
                  >
                    <span className="mirror-side">
                      <span className="mirror-name">
                        <i aria-hidden="true" style={{ background: accent }} />
                        {row.label}
                      </span>
                      <Chain steps={row.today} />
                    </span>

                    <span className="mirror-seam" aria-hidden="true">
                      <em>{row.hoursNow}h</em>
                      <em className="is-to" style={{ color: accent }}>{row.hoursProjected}h</em>
                    </span>

                    <span className="mirror-side is-reflected">
                      <span className="mirror-name">
                        {row.label}
                        <span className="mode-chip" style={{ color: accent, borderColor: accent }}>{row.mode}</span>
                      </span>
                      <Chain steps={row.reflected} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <section className="worked-example">
            <div className="worked-head">
              <span className="eyebrow">Example · {example.title}</span>
              <small>Same workflow, transformed</small>
            </div>
            <div className="worked-body">
              <ol className="worked-chain">
                {example.today.map((s) => (
                  <li key={s.label}>
                    <span className="chain-tile" data-actor={s.actor} aria-hidden="true">{ICONS[s.icon]}</span>
                    <small>{s.label}</small>
                  </li>
                ))}
              </ol>
              <span className="worked-divider" aria-hidden="true" />
              <ol className="worked-chain is-reflected">
                {example.reflected.map((s) => (
                  <li key={s.label}>
                    <span className="chain-tile" data-actor={s.actor} aria-hidden="true">{ICONS[s.icon]}</span>
                    <small>{s.label}</small>
                  </li>
                ))}
              </ol>
            </div>
            <p className="worked-note">{example.note}</p>
          </section>
        </div>

        <aside className="mirror-metrics">
          <span className="eyebrow">Impact metrics</span>
          <dl>
            {deltas.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>
                  <em>{d.from}</em>
                  <i aria-hidden="true">→</i>
                  <b>{d.to}</b>
                </dd>
              </div>
            ))}
            <div>
              <dt>Verified outcomes</dt>
              <dd><b className="solo">99.4%</b></dd>
            </div>
            <div>
              <dt>Unsafe actions</dt>
              <dd><b className="solo">0</b></dd>
            </div>
          </dl>

          <p className="mirror-caveat">
            <Info size={13} aria-hidden="true" />
            {caveat}
          </p>

          <p className="mirror-motto">Same company.<br />A more capable tomorrow.</p>
        </aside>
      </div>

      <ul className="chain-legend">
        <li><i data-actor="person" />A person</li>
        <li><i data-actor="human" />Manual step</li>
        <li><i data-actor="system" />Run by the system</li>
        <li><i data-actor="gate" />A person is required</li>
      </ul>
    </div>
  );
}
