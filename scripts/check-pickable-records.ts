/**
 * The accessible record list agrees with the pick table it stands in for.
 *
 * `listPickableRecords()` exists so a keyboard/screen-reader user can reach a
 * specific workflow, agent, decision or exception without a pointer click on
 * the 3D canvas (WORLD_ELEMENTS.md request 27). This check proves the list is
 * not a second opinion: every ref it returns must also be reachable through
 * the real pick table `buildIslandGeometry`/`buildAgentGeometry` build, and
 * every workflow-scoped decision/exception the world data declares must
 * appear.
 *
 * Wired into `npm run check` as `check:pickable-records` (2026-09-16, once package.json
 * was released).
 */
import { domains } from '../data/company';
import { worldRecords } from '../data/world-records';
import { listPickableRecords } from '../components/company-world/assets/pickableRecords';
import { buildIslandGeometry, buildAgentGeometry } from '../components/company-world/assets/primitives';
import { refKey } from '../lib/model/record';

let failed = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

for (const d of domains) {
  const listed = listPickableRecords(d, worldRecords);
  const listedKeys = new Set(listed.map((p) => refKey(p.ref)));

  // Every ref the accessible list names must also be reachable by a raycast —
  // otherwise the keyboard path would open a record the pointer path cannot.
  const island = buildIslandGeometry(d.workflows, '#55cbbb', worldRecords);
  const agents = buildAgentGeometry(d.agents.map((a) => ({ id: a.id, activity: a.activity })), '#55cbbb');
  const pickedKeys = new Set<string>();
  for (const table of [island.bodyPicks, island.accentPicks, agents.bodyPicks, agents.accentPicks]) {
    for (const range of table) pickedKeys.add(refKey(range.ref));
  }

  let allReachable = true;
  for (const key of listedKeys) {
    if (!pickedKeys.has(key)) { allReachable = false; console.log(`      unreachable by raycast: ${key}`); }
  }
  check(`${d.label} — every listed record is also pickable in the 3D scene`, allReachable, `${listed.length} listed`);

  // Every open exception and decision this workflow set declares must be named.
  const workflowIds = new Set(d.workflows.map((w) => w.id));
  for (const [wfId, decId] of worldRecords.decisionByWorkflow) {
    if (!workflowIds.has(wfId)) continue;
    check(`${d.label} — decision on ${wfId} is listed`, listedKeys.has(`decision:${decId}`));
  }
  for (const [wfId, excId] of worldRecords.exceptionByWorkflow) {
    if (!workflowIds.has(wfId)) continue;
    check(`${d.label} — exception on ${wfId} is listed`, listedKeys.has(`exception:${excId}`));
  }

  // Every agent and workflow itself must be named — the baseline the pylons
  // and hotspots sit on top of.
  check(`${d.label} — every workflow is listed`, d.workflows.every((w) => listedKeys.has(`workflow:${w.id}`)));
  check(`${d.label} — every agent is listed`, d.agents.every((a) => listedKeys.has(`agent:${a.id}`)));

  island.body.dispose(); island.accent.dispose();
  agents.body.dispose(); agents.accent.dispose();
}

console.log(failed ? `\n${failed} check(s) failed` : '\nthe accessible record list matches the pick table exactly');
process.exit(failed ? 1 : 0);
