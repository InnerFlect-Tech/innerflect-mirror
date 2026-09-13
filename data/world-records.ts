import { decisionQueue } from './decisions-queue';
import { exceptions } from './exceptions';
import { isOpen } from '@/lib/model/exception';

/**
 * The records the world draws objects for, indexed by the workflow they belong to.
 *
 * Built once here rather than searched per frame or per island. A gate pylon
 * exists because there is a Decision waiting on that workflow; a hotspot exists
 * because there is an open Exception. Neither is inferred from a colour any more,
 * which means a domain can be `critical` with nothing to click — correctly, if
 * nothing is actually outstanding.
 */
/**
 * First writer wins, and a collision is reported rather than swallowed.
 *
 * The world draws one pylon per workflow, so a second decision on the same
 * workflow would have no object to be clicked through — it would simply become
 * unreachable, with nothing to indicate it existed. That is the same class of
 * silent loss the no-fabrication rule exists to prevent, so it is made loud.
 * If this ever fires in earnest, the map wants to become `Map<string, string[]>`
 * and the island wants to place a pylon per decision.
 */
function indexByWorkflow(
  entries: { id: string; workflowId: string }[],
  kind: string,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of entries) {
    const existing = map.get(e.workflowId);
    if (existing !== undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `[world-records] workflow ${e.workflowId} has two ${kind} records ` +
            `(${existing}, ${e.id}). Only ${existing} gets an object; ${e.id} is unreachable.`,
        );
      }
      continue;
    }
    map.set(e.workflowId, e.id);
  }
  return map;
}

export const decisionByWorkflow = indexByWorkflow(
  decisionQueue
    .filter((d): d is typeof d & { workflowId: string } => d.workflowId !== undefined)
    .map((d) => ({ id: d.id, workflowId: d.workflowId })),
  'decision',
);

export const exceptionByWorkflow = indexByWorkflow(
  exceptions.filter(isOpen).map((e) => ({ id: e.id, workflowId: e.workflowId })),
  'exception',
);

export const worldRecords = { decisionByWorkflow, exceptionByWorkflow };
