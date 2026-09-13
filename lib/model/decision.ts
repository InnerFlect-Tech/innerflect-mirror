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

export type Decision = {
  id: string;
  title: string;
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
