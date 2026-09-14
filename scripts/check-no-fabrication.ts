/**
 * Acceptance criterion 26, as a check rather than a promise:
 *
 *   "Decision, risk, verification and outcome objects appear only when their
 *    corresponding records exist. Aggregate counts may summarise those records
 *    but never fabricate them."
 *
 * Every number the world draws an object for must be counted FROM records. This
 * fails if an aggregate drifts away from the records it claims to summarise.
 */
import { domains } from '../data/company';
import { exceptions } from '../data/exceptions';
import { decisionQueue } from '../data/decisions-queue';
import { isOpen } from '../lib/model/exception';
import { ELEMENTS } from '../lib/design/elements';
import { buildIslandGeometry, buildAgentGeometry } from '../components/company-world/assets/primitives';
import { worldRecords } from '../data/world-records';

let failed = 0;
const check = (label: string, ok: boolean, detail: string) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

const open = exceptions.filter(isOpen);
const allWorkflowIds = new Set(domains.flatMap((d) => d.workflows).map((w) => w.id));

// openItems must equal open exception records, per domain.
for (const d of domains) {
  const n = open.filter((e) => e.domainId === d.id).length;
  check(`${d.label} openItems`, d.openItems === n, `openItems=${d.openItems}, open exceptions=${n}`);
}

// Every exception and decision must point at a workflow that exists.
for (const e of open) {
  check(`exception ${e.id} resolves`, allWorkflowIds.has(e.workflowId), e.workflowId);
}
for (const dec of decisionQueue) {
  check(
    `decision ${dec.id} resolves`,
    dec.workflowId !== undefined && allWorkflowIds.has(dec.workflowId),
    dec.workflowId ?? '(no workflowId — a gate pylon could only be inferred)',
  );
}

// `rendered: true` is a claim about the world, so check it against the world.
//
// The previous version asserted `every element is modelled`, which passed the
// moment every flag was set to true — it validated the flag, not the claim, while
// five elements reached no world object at all. This builds the islands and asks
// which record types actually appear.
const drawn = new Set<string>();
for (const d of domains) {
  const g = buildIslandGeometry(d.workflows, '#55cbbb', worldRecords);
  for (const r of [...g.bodyPicks, ...g.accentPicks]) drawn.add(r.ref.type);
  const a = buildAgentGeometry(d.agents.map((x) => ({ id: x.id, activity: x.activity })), '#55cbbb');
  for (const r of [...a.bodyPicks, ...a.accentPicks]) drawn.add(r.ref.type);
}
// Element id -> the record type its objects carry in the pick table.
const DRAWS: Partial<Record<string, string>> = {
  'domain-platform': 'workflow',
  'human-glyph': 'workflow',
  'agent-glyph': 'agent',
  'decision-gate': 'decision',
  'risk-hotspot': 'exception',
  'workflow-line': 'workflow',
  'action-pulse': 'workflow',
  'company-core': 'domain',
};
for (const e of ELEMENTS) {
  if (!e.rendered) continue;
  const type = DRAWS[e.id];
  if (!type) { check(`${e.name} claims rendered`, false, 'no record type mapped for it'); continue; }
  // `domain` is drawn by CompanyCore, outside the island pick tables.
  const ok = type === 'domain' || drawn.has(type);
  check(`${e.name} claims rendered`, ok, `world draws ${type} refs: ${ok}`);
}
console.log(`\nrendered: ${ELEMENTS.filter((e) => e.rendered).length}/15 — the rest are modelled but not yet drawn`);

console.log(failed ? `\n${failed} check(s) failed` : '\nno fabricated aggregates');
// (exit moved to the end of the file: the reference check below must run too)

// ---------------------------------------------------------------------------
// Every RecordRef must resolve.
//
// `RecordRef` was introduced so an object could point at the record that
// justifies it. A ref pointing at nothing is worse than no ref: it reads as
// provenance while carrying none. This caught `decision:gate-1` in the Gate 1
// execution, where the only decision record is `gate-1-essencia`.
// ---------------------------------------------------------------------------
import { executions as allExecutions } from '../data/executions';
import { decisionQueue as queue } from '../data/decisions-queue';
import { tools as allTools } from '../data/tools';
import { domains as allDomains } from '../data/company';

const known = new Set<string>([
  ...queue.map((d) => `decision:${d.id}`),
  ...allTools.map((t) => `tool:${t.id}`),
  ...allDomains.flatMap((d) => [
    `domain:${d.id}`,
    ...d.workflows.map((w) => `workflow:${w.id}`),
    ...d.agents.map((a) => `agent:${a.id}`),
  ]),
]);

// Person and knowledge records have no catalogue of their own yet; a ref to one
// cannot be checked until they do, so it is reported rather than failed.
const uncheckable = new Set(['person', 'knowledge']);
let dangling = 0;
let unchecked = 0;

for (const e of allExecutions) {
  const refs: { where: string; ref: { type: string; id: string } }[] = [];
  for (const s of e.steps) {
    refs.push({ where: `${e.id}/${s.stepId} actor`, ref: s.actor });
    for (const t of s.tools) refs.push({ where: `${e.id}/${s.stepId} tool`, ref: t });
    for (const k of s.knowledge) refs.push({ where: `${e.id}/${s.stepId} knowledge`, ref: k });
    if (s.decision) refs.push({ where: `${e.id}/${s.stepId} decision`, ref: s.decision });
  }
  for (const v of e.verifications) refs.push({ where: `${e.id}/${v.id} by`, ref: v.by });

  for (const { where, ref } of refs) {
    const key = `${ref.type}:${ref.id}`;
    if (uncheckable.has(ref.type)) { unchecked++; continue; }
    if (!known.has(key)) {
      console.log(`FAIL  ${where} -> ${key} resolves to no record`);
      dangling++;
    }
  }
}

console.log(
  dangling
    ? `\n${dangling} dangling record reference(s)`
    : `every record reference resolves (${unchecked} unchecked: person and knowledge have no catalogue yet)`,
);
process.exit(failed || dangling ? 1 : 0);
