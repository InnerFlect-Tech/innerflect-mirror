'use client';

import { useMemo, useState } from 'react';
import { Check, Plus, Search, TriangleAlert } from 'lucide-react';
import {
  AUTONOMY_LADDER,
  WORK_STAGES,
  type AutonomyLevel,
  type StageMode,
  type Workflow,
} from '@/lib/model/work';
import { stateColors } from '@/lib/tokens/state';

const STAGE_LABEL: Record<StageMode, string> = {
  autonomous: 'Autonomous',
  supervised: 'Supervised',
  human: 'Human-led',
  blocked: 'Blocked',
};

type Tab = 'flow' | 'details' | 'performance' | 'opportunities';

export function ProcessesSurface({ workflows }: { workflows: Workflow[] }) {
  const [selectedId, setSelectedId] = useState(workflows[0].id);
  const [tab, setTab] = useState<Tab>('flow');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');

  const departments = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of workflows) map.set(w.domainLabel, (map.get(w.domainLabel) ?? 0) + 1);
    return [...map.entries()];
  }, [workflows]);

  const filtered = useMemo(
    () =>
      workflows.filter(
        (w) =>
          (department === 'all' || w.domainLabel === department) &&
          (status === 'all' || w.level === status) &&
          (query === '' || w.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [workflows, department, status, query],
  );

  const selected = filtered.find((w) => w.id === selectedId) ?? filtered[0] ?? workflows[0];
  const accent = stateColors[selected.state].label;
  const unmet = selected.evidence.filter((e) => !e.met);

  return (
    <div className="processes">
      <div className="processes-bar">
        <label className="field-search">
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search processes</span>
          <input
            type="search"
            placeholder="Search processes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <label className="field-select">
          <span className="sr-only">Filter by department</span>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="all">All departments</option>
            {departments.map(([name]) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>

        <label className="field-select">
          <span className="sr-only">Filter by status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {AUTONOMY_LADDER.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>

        <button type="button" className="btn-primary">
          <Plus size={14} aria-hidden="true" /> New process
        </button>
      </div>

      <div className="processes-body">
        <nav className="dept-list" aria-label="Departments">
          <ul>
            {departments.map(([name, count]) => (
              <li key={name}>
                <button
                  type="button"
                  className={department === name ? 'active' : ''}
                  aria-pressed={department === name}
                  onClick={() => {
                    const next = department === name ? 'all' : name;
                    setDepartment(next);
                    const first = workflows.find((w) => next === 'all' || w.domainLabel === next);
                    if (first) setSelectedId(first.id);
                  }}
                >
                  <b>{name}</b>
                  <small>{count} {count === 1 ? 'process' : 'processes'}</small>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <article className="process-detail">
          <header className="process-head">
            <div>
              <h2>{selected.name}</h2>
              <span className="level-pill" style={{ color: accent, borderColor: accent }}>
                {selected.level}
              </span>
            </div>
            <p>{selected.outcome}</p>
          </header>

          <div className="tabs process-tabs" role="tablist" aria-label="Process view">
            {(['flow', 'details', 'performance', 'opportunities'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={tab === t ? 'active' : ''}
                onClick={() => setTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'flow' && (
            <>
              <ol className="flow">
                {selected.steps.map((step, i) => (
                  <li key={step.label} data-mode={step.mode}>
                    <span className="flow-index" aria-hidden="true">{i + 1}</span>
                    <b>{step.label}</b>
                    <small>{step.note}</small>
                  </li>
                ))}
              </ol>

              <section className="autonomy-settings">
                <span className="eyebrow">Autonomy settings</span>
                <AutonomySlider level={selected.level} accent={accent} />
              </section>
            </>
          )}

          {tab === 'details' && (
            <>
              <dl className="work-facts">
                <div><dt>Owner</dt><dd>{selected.owner}</dd></div>
                <div><dt>Department</dt><dd>{selected.domainLabel}</dd></div>
                <div><dt>Systems</dt><dd>{selected.systems.join(' · ')}</dd></div>
                <div><dt>Policies</dt><dd>{selected.policies.join(' · ')}</dd></div>
              </dl>
              <span className="eyebrow">Canonical stages — every workflow shares these</span>
              <ol className="stage-row">
                {WORK_STAGES.map((stage) => (
                  <li key={stage} data-mode={selected.stages[stage]}>
                    <span className="pipeline-dot" aria-hidden="true" />
                    <b>{stage}</b>
                    <small>{STAGE_LABEL[selected.stages[stage]]}</small>
                  </li>
                ))}
              </ol>
            </>
          )}

          {tab === 'performance' && (
            <dl className="work-facts perf">
              <div><dt>Volume</dt><dd>{selected.volume}</dd></div>
              <div><dt>Cycle time</dt><dd>{selected.cycleTime}</dd></div>
              <div><dt>Human effort</dt><dd>{selected.humanEffort}</dd></div>
              <div><dt>Error rate</dt><dd>{selected.errorRate}</dd></div>
              <div><dt>Exceptions</dt><dd className={selected.exceptions > 0 ? 'has-attention' : undefined}>{selected.exceptions}</dd></div>
              <div><dt>Autonomy</dt><dd>{selected.autonomy}%</dd></div>
            </dl>
          )}

          {tab === 'opportunities' && (
            <>
              <p className="opportunity-lead">
                {unmet.length === 0
                  ? 'All evidence satisfied. This process is running at its earned level.'
                  : `${unmet.length} of 6 evidence requirements stand between this process and the next level. Autonomy is earned, not toggled.`}
              </p>
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
            </>
          )}
        </article>
      </div>
    </div>
  );
}

/**
 * Read-only on purpose. Autonomy is earned through evidence, so a control that
 * let someone drag a process to Autonomous would contradict the whole model —
 * this shows where it sits and what the next level would mean.
 */
function AutonomySlider({ level, accent }: { level: AutonomyLevel; accent: string }) {
  const index = AUTONOMY_LADDER.indexOf(level);
  const pct = (index / (AUTONOMY_LADDER.length - 1)) * 100;

  return (
    <div className="autonomy-slider">
      <div className="slider-track">
        <i style={{ width: `${pct}%`, background: accent }} />
        <span className="slider-knob" style={{ left: `${pct}%`, borderColor: accent }} />
      </div>
      <ol>
        {AUTONOMY_LADDER.map((l, i) => (
          <li key={l} className={i <= index ? 'reached' : ''} style={i === index ? { color: accent } : undefined}>
            {l}
          </li>
        ))}
      </ol>
      <small>Earned through evidence — see Opportunities.</small>
    </div>
  );
}
