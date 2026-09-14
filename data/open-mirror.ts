import type { SceneState } from '@/lib/model/state';
import type { EcosystemNodeId } from '@/lib/design/ecosystem';

/**
 * Open Mirror — the free/open edition's own records.
 *
 * `PRODUCT_STRUCTURE.md` says what Open Mirror *is* ("the simpler edition
 * exposes the visual language and the operating model without requiring
 * Innerflect-managed delivery"). It does not yet say what that edition can
 * honestly show a person who has connected nothing. This file is the first
 * answer, as records rather than prose.
 *
 * The answer this prototype takes: a free mirror cannot promise measurement,
 * so it must promise *honesty about measurement*. Every claim Open Mirror
 * draws carries the grade of evidence underneath it, and the share that is
 * merely declared is shown as a number rather than quietly rendered in the
 * same ink as an observed fact. That gap is not a weakness to hide — it is
 * the product. It is also the only honest reason to move to a managed OS.
 *
 * This is why `provenance` is a required field and not an optional badge: a
 * record cannot enter the free mirror without saying where it came from.
 */

/** Where a claim in the free mirror came from. Required on every claim. */
export type Provenance =
  /** A person typed it. True only in the sense that someone believes it. */
  | 'declared'
  /** Open Mirror derived it from a pattern the builder chose. Structure, not fact. */
  | 'inferred'
  /** An open connector reported it. The only grade that survives disagreement. */
  | 'observed';

export const provenanceLabel: Record<Provenance, string> = {
  declared: 'You said so',
  inferred: 'Derived from a pattern',
  observed: 'Reported by a connection',
};

export const provenanceNote: Record<Provenance, string> = {
  declared: 'Nothing has checked this. It is in the mirror because you put it there.',
  inferred: 'Open Mirror filled this in from the shape of the pattern you picked, not from your company.',
  observed: 'An open connector reported this. It is the only grade that can contradict you.',
};

export type OpenMirrorStep = {
  id: string;
  label: string;
  provenance: Provenance;
};

/**
 * The four domains are not a choice this file makes. They are the path a euro
 * takes (`AGENTS.md`, rule 2) — the same four the paid Mirror uses, because an
 * edition that reorganised them would be teaching a model the builder would
 * have to unlearn on the way in.
 */
export type OpenMirrorDomain = {
  id: string;
  label: string;
  /** The question this domain answers about the money path. */
  question: string;
  state: SceneState;
  steps: readonly OpenMirrorStep[];
};

export const openMirrorDomains: readonly OpenMirrorDomain[] = [
  {
    id: 'market',
    label: 'Market',
    question: 'How does someone find out we exist?',
    state: 'neutral',
    steps: [
      { id: 'market-reach', label: 'Publish and reach', provenance: 'declared' },
      { id: 'market-capture', label: 'Capture interest', provenance: 'observed' },
      { id: 'market-qualify', label: 'Qualify a lead', provenance: 'inferred' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    question: 'How does interest become a commitment?',
    state: 'attention',
    steps: [
      { id: 'sales-scope', label: 'Scope the work', provenance: 'declared' },
      { id: 'sales-propose', label: 'Send a proposal', provenance: 'declared' },
      { id: 'sales-agree', label: 'Agree and sign', provenance: 'observed' },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    question: 'How does a commitment become work that is done?',
    state: 'attention',
    steps: [
      { id: 'delivery-plan', label: 'Plan the engagement', provenance: 'declared' },
      { id: 'delivery-run', label: 'Run the work', provenance: 'declared' },
      { id: 'delivery-accept', label: 'Get it accepted', provenance: 'inferred' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    question: 'How does work that is done become money that arrived?',
    state: 'neutral',
    steps: [
      { id: 'finance-invoice', label: 'Invoice', provenance: 'observed' },
      { id: 'finance-collect', label: 'Collect', provenance: 'observed' },
      { id: 'finance-reconcile', label: 'Reconcile', provenance: 'inferred' },
    ],
  },
] as const;

/**
 * Counted from the records above, never written down beside them. The
 * no-fabrication rule (`scripts/check-no-fabrication.ts`) exists because an
 * aggregate that is typed by hand drifts from what it claims to summarise.
 */
export function gradeCensus(
  domains: readonly OpenMirrorDomain[] = openMirrorDomains,
): Record<Provenance, number> {
  const census: Record<Provenance, number> = { declared: 0, inferred: 0, observed: 0 };
  for (const domain of domains) for (const step of domain.steps) census[step.provenance]++;
  return census;
}

export function stepCount(domains: readonly OpenMirrorDomain[] = openMirrorDomains): number {
  return domains.reduce((total, domain) => total + domain.steps.length, 0);
}

/** The share of the mirror that nothing has checked. The number to be honest about. */
export function unverifiedShare(domains: readonly OpenMirrorDomain[] = openMirrorDomains): number {
  const census = gradeCensus(domains);
  const total = stepCount(domains);
  return total === 0 ? 0 : Math.round(((census.declared + census.inferred) / total) * 100);
}

/**
 * The self-builder journey, verbatim from `WORLD_ELEMENTS.md`'s whole-ecosystem
 * journey group 2. Copied as records rather than re-invented so the surface and
 * the readiness document cannot describe two different journeys.
 */
export type LadderStep = {
  id: string;
  label: string;
  detail: string;
  /** Which registered product this step happens in. */
  surface: EcosystemNodeId;
};

export const selfBuilderLadder: readonly LadderStep[] = [
  { id: 'connect', label: 'Connect', detail: 'Point Open Mirror at whatever is already open — a repository, a calendar, a spreadsheet. Nothing is required.', surface: 'open-mirror' },
  { id: 'reconstruct', label: 'Reconstruct', detail: 'The four-domain money path is rebuilt from what you gave it, and graded by how much of it anything actually saw.', surface: 'open-mirror' },
  { id: 'review', label: 'Review', detail: 'Read the gap. The declared share is the part of your company you are currently running on memory.', surface: 'open-mirror' },
  { id: 'pattern', label: 'Take a pattern', detail: 'Replace a guessed step with a proven operating pattern.', surface: 'os-shop' },
  { id: 'component', label: 'Take a component', detail: 'Assemble the pattern from open, reusable components.', surface: 'forge-shop' },
  { id: 'apply', label: 'Apply', detail: 'Change the model through the same typed operation the paid Mirror uses. Same mechanism, no managed delivery.', surface: 'own-os' },
] as const;

/**
 * What the free edition deliberately does not do.
 *
 * Each item names the registered node where the capability actually lives, so
 * this is a boundary drawn against `lib/design/ecosystem.ts` rather than a
 * marketing paragraph that can quietly stop being true.
 */
export type Boundary = {
  id: string;
  limit: string;
  because: string;
  livesIn: EcosystemNodeId;
};

export const openMirrorBoundaries: readonly Boundary[] = [
  { id: 'no-effects', limit: 'No operation leaves this browser', because: 'The free edition models the mechanism; running it against a real system needs an authority Open Mirror has no way to hold.', livesIn: 'agent-runtime' },
  { id: 'no-tenant', limit: 'No account, no tenant, no server copy', because: 'A free twin that stores your company is not free — it is paid for in data. Reconstruction stays local and yours.', livesIn: 'data-identity' },
  { id: 'no-audit', limit: 'No audit trail you could show anyone', because: 'Proof needs a party who can be held to it. That is what a managed engagement is for.', livesIn: 'audit-outcomes' },
  { id: 'no-proprietary', limit: 'Open components only', because: 'Proprietary Forge capabilities are part of managed delivery; the open catalogue is genuinely open.', livesIn: 'forge-shop' },
] as const;
