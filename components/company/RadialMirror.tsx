import {
  BarChart3, Building2, CheckCircle2, Database, FileText, IdCard, Mail,
  MessageSquare, Search, Send, ShieldCheck, Sparkles, Table, User, Users,
} from 'lucide-react';
import type { ActivityEvent } from '@/lib/model/activity';
import type { MirrorRow, MirrorStep, StepIcon, WorkedExample } from '@/lib/model/mirror';
import { stateColors } from '@/lib/tokens/state';

/**
 * The company at the centre, its departments around it.
 *
 * Position carries meaning here, not just composition: a department sits on the
 * left while it is still human-led and moves to the right once it runs itself.
 * The layout is therefore a progress bar you can read at a glance — over time
 * cards migrate across the orb, which is the product's promise made visual.
 */
const ICONS: Record<StepIcon, React.ReactNode> = {
  person: <User size={13} />, mail: <Mail size={13} />, doc: <FileText size={13} />,
  crm: <IdCard size={13} />, search: <Search size={13} />, reply: <MessageSquare size={13} />,
  chart: <BarChart3 size={13} />, calendar: <FileText size={13} />, image: <FileText size={13} />,
  users: <Users size={13} />, chat: <MessageSquare size={13} />, sheet: <Table size={13} />,
  system: <Sparkles size={13} />, send: <Send size={13} />, check: <CheckCircle2 size={13} />,
  database: <Database size={13} />,
};

function DeptCard({ row, side }: { row: MirrorRow; side: 'left' | 'right' }) {
  const accent = stateColors[row.state].label;
  const steps: MirrorStep[] = side === 'left' ? row.today : row.reflected;

  return (
    <article className="dept-card" data-side={side}>
      <header>
        <b>{row.label}</b>
        <span className="mode-chip" style={{ color: accent, borderColor: accent }}>{row.mode}</span>
        <em><Users size={11} aria-hidden="true" />{row.people}</em>
      </header>
      <ol className="dept-chain">
        {steps.map((s, i) => (
          <li key={i}>
            <span className="chain-tile" data-actor={s.actor} aria-hidden="true">{ICONS[s.icon]}</span>
            <small>{s.label}</small>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function RadialMirror({
  rows,
  example,
  events,
  caveat,
}: {
  rows: MirrorRow[];
  example: WorkedExample;
  events: ActivityEvent[];
  caveat: string;
}) {
  // A department is on the right once it no longer depends on a person to run.
  const right = rows.filter((r) => r.mode === 'Autonomous');
  const left = rows.filter((r) => r.mode !== 'Autonomous');

  return (
    <div className="radial">
      <div className="radial-heads">
        <div>
          <span className="eyebrow">How it operates now</span>
          <small>Human judgement. Human effort. Real results.</small>
        </div>
        <div className="is-reflected">
          <span className="eyebrow">Its autonomous reflection</span>
          <small>Same structure. Less busy work. More human potential.</small>
        </div>
      </div>

      <div className="radial-stage">
        <svg className="radial-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {left.map((_, i) => {
            const y = ((i + 0.5) / left.length) * 100;
            return <path key={`l${i}`} d={`M 0 ${y} C 26 ${y}, 34 50, 48 50`} className="wire" />;
          })}
          {right.map((_, i) => {
            const y = ((i + 0.5) / right.length) * 100;
            return <path key={`r${i}`} d={`M 100 ${y} C 74 ${y}, 66 50, 52 50`} className="wire is-live" />;
          })}
        </svg>

        <div className="radial-col">
          {left.map((r) => <DeptCard key={r.id} row={r} side="left" />)}
        </div>

        <div className="radial-core" aria-hidden="true">
          <span className="core-orb"><Building2 size={22} /></span>
          <b>Company</b>
        </div>

        <div className="radial-col is-reflected">
          {right.length === 0 ? (
            <p className="radial-empty">
              Nothing runs itself yet. Departments move to this side as autonomy is earned.
            </p>
          ) : (
            right.map((r) => <DeptCard key={r.id} row={r} side="right" />)
          )}
        </div>
      </div>

      <p className="radial-migration">
        A department sits on the left while a person still carries it, and moves across
        once it runs itself. {left.length} of {rows.length} are still on the left.
      </p>

      <section className="radial-example">
        <div className="radial-example-flow">
          <div className="worked-head">
            <span className="eyebrow">Workflow example</span>
            <small>{example.title} — incoming request</small>
          </div>
          <ol className="worked-chain is-reflected">
            {example.reflected.map((s, i) => (
              <li key={s.label}>
                {i === 3 && <span className="gate-chip"><User size={10} aria-hidden="true" />Human approval</span>}
                <span className="chain-tile" data-actor={i === 3 ? 'gate' : s.actor} aria-hidden="true">
                  {i === 3 ? <User size={13} /> : ICONS[s.icon]}
                </span>
                <small>{s.label}</small>
              </li>
            ))}
          </ol>
          <p className="worked-note">{example.note}</p>
        </div>

        <div className="radial-log">
          <ol>
            {events.map((e) => (
              <li key={e.id} data-gate={e.gate ? 'true' : undefined}>
                <time>{e.at}</time>
                <span>{e.label}</span>
                <em>{e.actor.kind === 'system' ? '(autonomous)' : `by ${e.actor.name}`}</em>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <p className="mirror-caveat radial-caveat">
        <ShieldCheck size={13} aria-hidden="true" />
        {caveat}
      </p>
    </div>
  );
}
