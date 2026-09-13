import { isDocumented, type DocumentedWorkflow } from '@/lib/model/work';
import { domains } from './company';

/**
 * The workflows mapped in full — a VIEW over the one catalogue, not a second one.
 *
 * Every workflow the company has lives in `domains[].workflows`. These are the
 * subset documented deeply enough to render a Flow tab, an evidence ladder and a
 * stage breakdown. The 3D world draws all of them; this surface explains the ones
 * we actually understand.
 *
 * That difference is now honest. Previously this file held four workflows whose
 * ids matched nothing in the 38 the islands drew, so Delivery was simultaneously
 * "1 workflow" here and "12 processes" on its island label. Same catalogue now,
 * same ids, and the gap between the counts means "how much is mapped" rather than
 * "which file are you reading".
 */
export const workflows: DocumentedWorkflow[] = domains
  .flatMap((d) => d.workflows)
  .filter(isDocumented);
