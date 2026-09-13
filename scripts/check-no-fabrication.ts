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

// Every element must name a record type that exists.
const unmodelled = ELEMENTS.filter((e) => !e.modelled).map((e) => e.name);
check('every element is modelled', unmodelled.length === 0, unmodelled.join(', ') || 'all 15');

console.log(failed ? `\n${failed} check(s) failed` : '\nno fabricated aggregates');
process.exit(failed ? 1 : 0);
