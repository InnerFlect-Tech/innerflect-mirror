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
export const decisionByWorkflow = new Map<string, string>(
  decisionQueue
    .filter((d) => d.workflowId !== undefined)
    .map((d) => [d.workflowId!, d.id]),
);

export const exceptionByWorkflow = new Map<string, string>(
  exceptions.filter(isOpen).map((e) => [e.workflowId, e.id]),
);

export const worldRecords = { decisionByWorkflow, exceptionByWorkflow };
