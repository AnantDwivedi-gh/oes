import { app } from 'electron';
import type { ActionStep } from '../../shared/types';

/** Error thrown when OeS accidentally targets itself */
export class SourceModificationAttemptError extends Error {
  constructor() {
    super('INVARIANT VIOLATION: Target app PID equals OeS PID. Aborting to prevent self-modification.');
    this.name = 'SourceModificationAttemptError';
  }
}

/**
 * Asserts the target PID is not the OeS process.
 * @param targetPid - PID of the target application
 * @throws SourceModificationAttemptError if PIDs match
 */
function assertNotSelf(targetPid: number): void {
  const oesPid = process.pid;
  if (targetPid === oesPid) {
    throw new SourceModificationAttemptError();
  }
}

/**
 * Executes a single action step via OS-level automation.
 * @param step - The ActionStep to execute
 * @param targetPid - PID of the target application
 * @returns Updated step with execution result
 */
export async function executeStep(step: ActionStep, targetPid: number): Promise<ActionStep> {
  // INVARIANT: Never execute against ourselves
  assertNotSelf(targetPid);

  try {
    // DECISION: Stub — real implementation uses nut.js for keyboard/mouse + AX write operations
    console.log(`[Executor] Running step: ${step.description} (type: ${step.type})`);

    return {
      ...step,
      status: 'done' as const,
    };
  } catch (error) {
    console.error(`[Executor] Step failed: ${step.stepId}`, error);
    return {
      ...step,
      status: 'failed' as const,
    };
  }
}
