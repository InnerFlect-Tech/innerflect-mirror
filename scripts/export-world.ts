/**
 * The world, as data.
 *
 * Builds the real scene in node — the same `buildIslandGeometry`, the same
 * layout slots, the same state tokens — and writes every geometry, transform,
 * material and pick table to one JSON file. A standalone HTML page can then
 * render the world without React, without the app, and without a second
 * implementation of anything: if a bay moves here, it moves there.
 *
 * This is an export, never a re-model. Nothing in this file decides what the
 * world looks like; it only serialises what the model already built.
 */
import { writeFileSync } from 'node:fs';
import {
  BoxGeometry,
  CylinderGeometry,
  EdgesGeometry,
  PlaneGeometry,
  type BufferGeometry,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildAgentGeometry, buildIslandGeometry } from '../components/company-world/assets/primitives';
import type { PickTable } from '../components/company-world/assets/pickTable';
import { companyLayout, scaleForActivity } from '../components/company-world/layouts/companyLayout';
import { buildPath } from '../components/company-world/connections/buildPath';
import { stateTokens, coreEmissive } from '../components/company-world/tokens/sceneStates';
import { world, shell } from '../lib/tokens';
import { stateLabel } from '../lib/model/state';
import { domains, feed } from '../data/company';
import { executions } from '../data/executions';
import { WORK_STAGES } from '../lib/model/work';
import { tools } from '../data/tools';
import { worldRecords } from '../data/world-records';
import { decisionQueue } from '../data/decisions-queue';
import { exceptions } from '../data/exceptions';

const r4 = (n: number) => Math.round(n * 1e4) / 1e4;
const arr = (a: ArrayLike<number>) => Array.from(a, r4);

type Geo = { position: number[]; normal?: number[]; color?: number[]; index?: number[] };

function geo(g: BufferGeometry): Geo {
  const out: Geo = { position: arr(g.attributes.position.array) };
  if (g.attributes.normal) out.normal = arr(g.attributes.normal.array);
  if (g.attributes.color) out.color = arr(g.attributes.color.array);
  if (g.index) out.index = Array.from(g.index.array);
  return out;
}

type Node = Record<string, unknown>;

const mesh = (name: string, g: BufferGeometry, material: Node, extra: Node = {}): Node => ({
  kind: 'mesh', name, geo: geo(g), material, ...extra,
});

const edges = (g: BufferGeometry, color: string, opacity: number): Node => ({
  kind: 'lines',
  geo: geo(new EdgesGeometry(g, 15)),
  material: { kind: 'line', color, opacity, transparent: true },
});

// --- the same state maths the Scene does -----------------------------------
const companyState = domains.some((d) => d.state === 'critical')
  ? ('critical' as const)
  : domains.some((d) => d.state === 'attention')
    ? ('attention' as const)
    : ('active' as const);

const slots = companyLayout(domains.length);
const maxActiveWork = Math.max(...domains.map((d) => d.activeWork), 0);
const coreToken = stateTokens[companyState];

// --- core -------------------------------------------------------------------
const plinth = new RoundedBoxGeometry(2.24, 0.2, 1.9, 4, 0.06);
const body = new RoundedBoxGeometry(1.74, 0.78, 1.48, 4, 0.07);

const core: Node = {
  kind: 'group', name: 'core', position: [0, 0, 0],
  children: [
    mesh('core-foundation', new CylinderGeometry(1.36, 1.5, 0.15, 6),
      { kind: 'standard', color: shell.foundation, roughness: 0.68 },
      { position: [0, -0.33, 0] }),
    mesh('core-plinth', plinth,
      { kind: 'physical', color: shell.core, roughness: 0.26, metalness: 0.18, clearcoat: 0.45 },
      { position: [0, -0.16, 0], children: [edges(plinth, coreToken.edge, 0.45)] }),
    mesh('core-body', body,
      { kind: 'physical', color: '#0b3937', roughness: 0.15, metalness: 0.1, clearcoat: 0.85,
        clearcoatRoughness: 0.18, transparent: true, opacity: 0.8 },
      { position: [0, 0.33, 0], children: [edges(body, coreToken.edge, 0.62)] }),
    mesh('core-light', new BoxGeometry(0.5, 0.5, 0.5),
      { kind: 'standard', color: '#17a89f', emissive: coreEmissive, emissiveIntensity: 1.15, toneMapped: false },
      { position: [0, 0.3, 0], rotation: [0, Math.PI / 4, 0], pulse: 'core' }),
  ],
};

// --- islands ----------------------------------------------------------------
const RECENCY: Record<string, number> = { now: 0.02, '2m': 0.28, '5m': 0.55, '8m': 0.8 };

const islands = domains.map((domain, i) => {
  const token = stateTokens[domain.state];
  const island = buildIslandGeometry(domain.workflows, token.edge, worldRecords);
  const agentGeo = buildAgentGeometry(
    domain.agents.map((a) => ({ id: a.id, activity: a.activity as string })),
    token.edge,
  );
  const platform = new RoundedBoxGeometry(1.96, 0.16, 1.44, 4, 0.055);
  const surface = new RoundedBoxGeometry(1.7, 0.045, 1.2, 3, 0.03);
  const picks = (t: PickTable) => t.map((p) => ({ s: p.start, c: p.count, r: `${p.ref.type}:${p.ref.id}` }));

  const escalating = domain.agents.some((a) => a.activity === 'escalating');
  const waiting = domain.agents.some((a) => a.activity === 'waiting');

  return {
    kind: 'group', name: `island-${domain.id}`, domainId: domain.id,
    position: slots[i].position,
    scale: slots[i].scale * scaleForActivity(domain.activeWork, maxActiveWork),
    lift: true,
    children: [
      mesh('platform', platform,
        { kind: 'physical', color: shell.platform, roughness: 0.26, metalness: 0.18, clearcoat: 0.6,
          clearcoatRoughness: 0.28, transparent: true, opacity: 1 },
        { position: [0, -0.08, 0], children: [edges(platform, token.edge, 0.3)] }),
      mesh('inner-surface', surface,
        { kind: 'standard', color: token.surface, emissive: token.surfaceEmissive,
          emissiveIntensity: token.emission, roughness: 0.5, transparent: true, opacity: 1 },
        { position: [0, 0.008, 0] }),
      mesh('signal-strip', new PlaneGeometry(1.16, 0.028),
        { kind: 'standard', color: '#000000', emissive: token.signalEmissive,
          emissiveIntensity: 0.85, toneMapped: false, transparent: true, opacity: 1 },
        { position: [0, 0.032, 0.58], rotation: [-Math.PI / 2, 0, 0] }),
      {
        kind: 'group', name: 'content', position: [0, 0.032, 0],
        children: [
          mesh('island-body', island.body,
            { kind: 'standard', vertexColors: true, roughness: 0.66, metalness: 0.05 },
            { picks: picks(island.bodyPicks) }),
          mesh('island-accent', island.accent,
            { kind: 'basic', vertexColors: true, toneMapped: false },
            { picks: picks(island.accentPicks) }),
          mesh('agents-body', agentGeo.body,
            { kind: 'standard', vertexColors: true, roughness: 0.6, metalness: 0.05 },
            { picks: picks(agentGeo.bodyPicks) }),
          mesh('agents-accent', agentGeo.accent,
            { kind: 'basic', vertexColors: true, toneMapped: false },
            { picks: picks(agentGeo.accentPicks),
              // Request 3: motion rate and amplitude come from agent activity.
              bob: { rate: escalating ? 3.2 : waiting ? 1.1 : 1.8, amp: escalating ? 0.03 : waiting ? 0.012 : 0.018 } }),
        ],
      },
    ],
  };
});

// --- connections ------------------------------------------------------------
const connections = domains.map((domain, i) => {
  const token = stateTokens[domain.state];
  const curve = buildPath(slots[i].position);
  const ev = feed.find((e) => e.domainId === domain.id);
  return {
    domainId: domain.id,
    points: curve.getPoints(48).flatMap((p) => [r4(p.x), r4(p.y), r4(p.z)]),
    color: token.connection,
    pulseColor: token.label,
    // Request 4: no event, no pulse.
    live: Boolean(ev),
    offset: ev ? (RECENCY[ev.at] ?? 0.5) : 0,
  };
});

// --- what a click resolves to ----------------------------------------------
const recordLabels: Record<string, { kind: string; label: string; detail?: string }> = {};
for (const d of domains) {
  recordLabels[`domain:${d.id}`] = { kind: 'Domain', label: d.label, detail: `${d.processes} processes · ${d.autonomy}% autonomous` };
  for (const w of d.workflows) {
    recordLabels[`workflow:${w.id}`] = {
      kind: 'Workflow', label: w.name,
      detail: `${d.label} · ${stateLabel[w.state] ?? w.state} · ${w.throughput}/day · ${w.humans} ${w.humans === 1 ? 'person' : 'people'}`,
    };
  }
}
for (const d of domains) {
  for (const a of d.agents) {
    recordLabels[`agent:${a.id}`] = {
      kind: 'Agent',
      label: (a as { name?: string }).name ?? a.id,
      detail: `${d.label} · ${(a as { job?: string }).job ?? ''} · ${(a as { activity?: string }).activity ?? ''}`,
    };
  }
}
for (const d of decisionQueue) recordLabels[`decision:${d.id}`] = { kind: 'Decision', label: d.title, detail: `${d.domainLabel} · ${d.breachedRule}` };
for (const e of exceptions) recordLabels[`exception:${e.id}`] = { kind: 'Exception', label: e.summary, detail: `${e.kind} · ${e.severity}` };

// ---------------------------------------------------------------------------
// The detail layer.
//
// A window that opens on a record has to show the record, not a paraphrase of
// it: the field that put the object in the world, both control axes, and the
// chain of what actually happened. All of that already exists in the model; it
// simply never left it. Nothing below is computed or rounded - it is the record.
// ---------------------------------------------------------------------------
const byId = <T extends { id: string }>(xs: readonly T[]) => Object.fromEntries(xs.map((x) => [x.id, x]));
const toolById = byId(tools);

/** What each record type is DRAWN as, straight from the element registry's own
 *  `drivenBy` column. The world and a builder must not disagree about this. */
const GLYPH_FOR = {
  domain: 'domain-platform',
  workflow: 'workflow-line',
  agent: 'agent-glyph',
  person: 'human-glyph',
  decision: 'decision-gate',
  exception: 'risk-hotspot',
  tool: 'tool-glyph',
  knowledge: 'knowledge-object',
  step: 'step-node',
} as const;

const nameOfRef = (r: { type: string; id: string }): string => {
  if (r.type === 'tool') return toolById[r.id]?.name ?? r.id;
  if (r.type === 'agent') {
    for (const d of domains) { const a = d.agents.find((x) => x.id === r.id); if (a) return a.name; }
  }
  return r.id;
};

type Detail = Record<string, unknown>;
const records: Record<string, Detail> = {};

for (const d of domains) {
  records[`domain:${d.id}`] = {
    kind: 'Domain', name: d.label, drivenBy: 'Domain record',
    state: d.state, stateLabel: stateLabel[d.state],
    facts: [
      ['Processes', String(d.processes)],
      ['Autonomous', `${d.autonomy}%`],
      ['In flight', String(d.activeWork)],
      ['Needs a person', String(d.openItems)],
    ],
    workflows: d.workflows.map((w) => `workflow:${w.id}`),
  };

  for (const w of d.workflows) {
    const doc = w as unknown as {
      steps?: { id: string; stage: string; label: string; note: string; mode: string }[];
      outcome?: string; owner?: string; volume?: string; cycleTime?: string;
      humanEffort?: string; errorRate?: string; systems?: string[]; level?: string;
    };
    const exe = executions.find((e) => e.workflowId === w.id);
    records[`workflow:${w.id}`] = {
      kind: 'Workflow', name: w.name, drivenBy: 'Workflow record',
      state: w.state, stateLabel: stateLabel[w.state], domain: d.label,
      facts: [
        ['Autonomous', `${w.autonomy}%`],
        ['Throughput', `${w.throughput} / day`],
        ['People', String(w.humans)],
        ...(doc.cycleTime ? [['Cycle time', doc.cycleTime]] : []),
        ...(doc.errorRate ? [['Error rate', doc.errorRate]] : []),
      ],
      outcome: doc.outcome ?? null,
      owner: doc.owner ?? null,
      level: doc.level ?? null,
      systems: doc.systems ?? null,
      // Only four of the thirty-eight are mapped step by step. Saying so is the
      // point: an unmapped workflow must not render as a documented one.
      steps: doc.steps ?? null,
      execution: exe
        ? {
            id: exe.id, token: exe.token, state: exe.state, startedAt: exe.startedAt,
            steps: exe.steps.map((st) => ({
              stepId: st.stepId, stage: st.stage, at: st.at,
              actorKind: st.control.actor, mode: st.control.mode,
              actor: nameOfRef(st.actor), actorType: st.actor.type,
              tools: st.tools.map(nameOfRef),
              knowledge: st.knowledge.map(nameOfRef),
              decision: st.decision ? `decision:${st.decision.id}` : null,
            })),
            verifications: exe.verifications.map((v) => ({ check: v.check, result: v.result, at: v.at })),
            outcome: exe.outcome ?? null,
          }
        : null,
      decision: decisionQueue.find((x) => x.workflowId === w.id)?.id ?? null,
      exception: exceptions.find((x) => x.workflowId === w.id)?.id ?? null,
    };
  }

  for (const a of d.agents) {
    records[`agent:${a.id}`] = {
      kind: 'Agent', name: (a as { name?: string }).name ?? a.id,
      drivenBy: 'Agent record (pose from Agent.activity)',
      state: 'active', stateLabel: 'Active', domain: d.label,
      facts: [
        ['Doing', (a as { job?: string }).job ?? '\u2014'],
        ['Activity', (a as { activity?: string }).activity ?? '\u2014'],
      ],
    };
  }
}

for (const dec of decisionQueue) {
  records[`decision:${dec.id}`] = {
    kind: 'Decision', name: dec.title, drivenBy: 'Decision / Authority record',
    state: dec.state, stateLabel: stateLabel[dec.state], domain: dec.domainLabel,
    situation: dec.situation,
    facts: [
      ['Amount', dec.amount],
      ['Raised', dec.raised],
      ['Deadline', dec.deadline],
      ['Priority', dec.priority],
    ],
    breachedRule: dec.breachedRule,
    recommended: dec.recommendation ?? dec.recommended,
    reason: dec.reason,
    workflow: dec.workflowId ? `workflow:${dec.workflowId}` : null,
  };
}

for (const e of exceptions) {
  records[`exception:${e.id}`] = {
    kind: 'Exception', name: e.summary, drivenBy: 'Exception record (open)',
    state: e.severity, stateLabel: stateLabel[e.severity],
    facts: [
      ['Kind', e.kind],
      ['Raised', e.raisedAt.slice(0, 10)],
    ],
    workflow: e.workflowId ? `workflow:${e.workflowId}` : null,
  };
}

// --- the file ---------------------------------------------------------------
const scene = {
  generated: new Date().toISOString().slice(0, 10),
  company: { state: companyState, label: stateLabel[companyState], accent: coreToken.label, edge: coreToken.edge },
  colors: { floor: world.plane, ...world },
  domains: domains.map((d, i) => ({
    id: d.id, label: d.label, icon: d.icon, state: d.state, processes: d.processes,
    autonomy: d.autonomy, activeWork: d.activeWork, accent: stateTokens[d.state].label,
    position: slots[i].position,
  })),
  core,
  islands,
  connections,
  recordLabels,
  stages: [...WORK_STAGES],
  glyphFor: GLYPH_FOR,
  records,
  // What each domain holds, so a domain view can be built without guessing.
  contents: Object.fromEntries(domains.map((d) => [d.id, {
    workflows: d.workflows.map((w) => ({ ref: `workflow:${w.id}`, name: w.name, state: w.state, documented: Boolean((w as { steps?: unknown[] }).steps?.length) })),
    agents: d.agents.map((a) => ({ ref: `agent:${a.id}`, name: (a as { name?: string }).name ?? a.id })),
    decisions: decisionQueue.filter((x) => x.domainId === d.id).map((x) => ({ ref: `decision:${x.id}`, name: x.title })),
    exceptions: exceptions.filter((x) => x.domainId === d.id).map((x) => ({ ref: `exception:${x.id}`, name: x.summary })),
  }])),
};

const out = process.argv[2] ?? 'world.json';
writeFileSync(out, JSON.stringify(scene));
const tris = islands.reduce((n, is) => n + (is.children[3] as { children: Node[] }).children
  .reduce((m, c) => m + ((c as { geo: Geo }).geo.position.length / 9), 0), 0);
console.log(`wrote ${out} — ${domains.length} domains, ${Math.round(tris)} island triangles, ${Object.keys(recordLabels).length} records`);
