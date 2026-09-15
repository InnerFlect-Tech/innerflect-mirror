import type { Decision } from '@/lib/model/decision';

export type DecisionResolution = 'approved' | 'declined' | 'policy-proposed';

export type OperationResult =
  | {
      ok: true;
      operationId: string;
      resolution: DecisionResolution;
      auditEvent: 'decision.resolved';
    }
  | {
      ok: false;
      operationId: string;
      code: 'UNAVAILABLE' | 'FORBIDDEN' | 'CONFLICT';
      message: string;
    };

/**
 * The single operation boundary used by a human or an agent. The prototype
 * executor records a stable audit envelope and is intentionally easy to swap
 * for the authenticated server mutation without changing surface code.
 */
export async function resolveDecision(
  decision: Decision,
  resolution: DecisionResolution,
): Promise<OperationResult> {
  const operationId = `op-${decision.id}-${Date.now()}`;
  try {
    const result: OperationResult = {
      ok: true,
      operationId,
      resolution,
      auditEvent: 'decision.resolved',
    };
    console.info('mirror.operation', {
      operationId,
      type: 'decision.resolve',
      recordId: decision.id,
      resolution,
    });
    return result;
  } catch (error) {
    console.error('mirror.operation.error', {
      operationId,
      type: 'decision.resolve',
      recordId: decision.id,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return {
      ok: false,
      operationId,
      code: 'UNAVAILABLE',
      message: 'The decision could not be resolved.',
    };
  }
}
