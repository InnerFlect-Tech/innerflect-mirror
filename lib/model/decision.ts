import type { SceneState } from './state';

/**
 * A large queue is a system failure. The default message is
 * "3 decisions need you. Everything else is running." — so this model is
 * built to make a short queue legible, not a long one manageable.
 */
export type DecisionAction = 'Approve' | 'Modify' | 'Decline' | 'Simulate';

export const DECISION_ACTIONS: DecisionAction[] = [
  'Approve',
  'Modify',
  'Decline',
  'Simulate',
];

export type Reversibility = 'reversible' | 'partially-reversible' | 'irreversible';

/** What the system proposes doing, shown next to its confidence. */
export type RecommendedVerb = 'Approve' | 'Review' | 'Decline';

export type Priority = 'high' | 'medium' | 'low';

export type Decision = {
  id: string;
  title: string;
  /** The amount or object at stake, shown large on the card. */
  amount: string;
  /** Why this needs a human at all — the rule that was exceeded. */
  breachedRule: string;
  priority: Priority;
  /** How long it has been waiting. */
  raised: string;
  /** The one-line reason behind the recommendation, shown on the card. */
  reason: string;
  recommended: RecommendedVerb;
  reviewed?: boolean;
  /** What happened, in plain language. */
  situation: string;
  domainId: string;
  domainLabel: string;
  state: SceneState;
  urgency: 'high' | 'medium' | 'low';
  deadline: string;
  /** What the system proposes, and why. */
  recommendation: string;
  rationale: string;
  alternatives: string[];
  /** Confidence in the recommendation, 0–100. */
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  reversibility: Reversibility;
  /** Financial or operational exposure if this goes wrong. */
  exposure: string;
  downstream: string;
  /** Who is permitted to take this decision. */
  authority: string;
  policy: string;
  evidence: { label: string; detail: string }[];
  /** Prior decisions of the same shape, and how they turned out. */
  comparable: { label: string; outcome: string }[];
  /**
   * Repeated judgement should become institutional memory. When the same call
   * has been made enough times the same way, propose a policy.
   */
  policySuggestion?: { timesSeen: number; proposal: string };
};
