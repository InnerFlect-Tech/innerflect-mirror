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
};

const out = process.argv[2] ?? 'world.json';
writeFileSync(out, JSON.stringify(scene));
const tris = islands.reduce((n, is) => n + (is.children[3] as { children: Node[] }).children
  .reduce((m, c) => m + ((c as { geo: Geo }).geo.position.length / 9), 0), 0);
console.log(`wrote ${out} — ${domains.length} domains, ${Math.round(tris)} island triangles, ${Object.keys(recordLabels).length} records`);
