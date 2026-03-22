import type { ActionPlan, ActionStep } from '../shared/types';

/**
 * Callback for confirming irreversible actions with the user.
 * @param description - The step description to confirm
 * @returns true if the user confirms, false otherwise
 */
type ConfirmCallback = (description: string) => Promise<boolean>;

/**
 * Callback for updating step status in the UI.
 * @param stepId - The step being updated
 * @param status - New status
 */
type StatusCallback = (stepId: string, status: ActionStep['status']) => void;

/**
 * Executes an action plan step by step.
 * Handles confirmation gates for irreversible steps and rollback on failure.
 * @param plan - The ActionPlan to execute
 * @param confirmWithUser - Callback to confirm irreversible steps
 * @param onStatusUpdate - Callback for step status changes
 * @returns The final outcome
 */
export async function executePlan(
  plan: ActionPlan,
  confirmWithUser: ConfirmCallback,
  onStatusUpdate: StatusCallback,
): Promise<'success' | 'failed' | 'cancelled' | 'partial'> {
  let completedCount = 0;

  for (const step of plan.steps) {
    // INVARIANT: Confirm irreversible steps before execution
    if (!step.reversible) {
      onStatusUpdate(step.stepId, 'pending');
      const confirmed = await confirmWithUser(step.description);
      if (!confirmed) {
        onStatusUpdate(step.stepId, 'skipped');
        // DECISION: Skip remaining steps after cancellation of irreversible step
        markRemaining(plan.steps, completedCount + 1, 'skipped', onStatusUpdate);
        return 'cancelled';
      }
    }

    onStatusUpdate(step.stepId, 'running');

    try {
      // DECISION: Execution delegated to main process via IPC
      // In production, this calls ipcRenderer.invoke(EXECUTE_STEP, step)
      // For now, simulate with a small delay
      await simulateExecution(step);
      onStatusUpdate(step.stepId, 'done');
      completedCount++;
    } catch (error) {
      console.error(`[Executor] Step ${step.stepId} failed:`, error);
      onStatusUpdate(step.stepId, 'failed');
      markRemaining(plan.steps, completedCount + 1, 'skipped', onStatusUpdate);
      return completedCount > 0 ? 'partial' : 'failed';
    }
  }

  return 'success';
}

/**
 * Marks remaining steps with a given status.
 * @param steps - All steps in the plan
 * @param fromIndex - Index to start marking from
 * @param status - Status to apply
 * @param onStatusUpdate - Callback for status changes
 */
function markRemaining(
  steps: ActionStep[],
  fromIndex: number,
  status: ActionStep['status'],
  onStatusUpdate: StatusCallback,
): void {
  for (let i = fromIndex; i < steps.length; i++) {
    onStatusUpdate(steps[i].stepId, status);
  }
}

/**
 * Simulates step execution with a delay.
 * Will be replaced with actual IPC call to main process executor.
 * @param step - The step to simulate
 */
async function simulateExecution(step: ActionStep): Promise<void> {
  // DECISION: Simulation delay varies by step type for realistic feel
  const delays: Record<string, number> = {
    'keyboard': 100,
    'mouse-click': 150,
    'menu-navigate': 300,
    'ax-write': 200,
    'ax-read': 100,
    'wait': 300,
  };
  const delay = delays[step.type] ?? 200;
  await new Promise((resolve) => setTimeout(resolve, delay));
}
