import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../stores/sessionStore';
import { ConfirmGate } from './ConfirmGate';

/** Status-to-color mapping for step indicators */
const STATUS_COLORS: Record<string, string> = {
  pending: '#8888A0',
  running: '#C8FF00',
  done: '#4ADE80',
  failed: '#F87171',
  skipped: '#6B7280',
};

/**
 * Displays the current action plan with step-by-step status.
 * Includes a Run button that executes steps sequentially.
 * Uses Framer Motion for staggered reveal of each step.
 * @returns The ActionPlan component
 */
export function ActionPlan(): React.ReactElement {
  const steps = useSessionStore((s) => s.steps);
  const updateStep = useSessionStore((s) => s.updateStep);
  const [isExecuting, setIsExecuting] = useState(false);
  const [confirmStep, setConfirmStep] = useState<{ stepId: string; description: string } | null>(null);
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const hasPendingSteps = steps.some((s) => s.status === 'pending');
  const allDone = steps.length > 0 && steps.every((s) => s.status === 'done' || s.status === 'skipped');

  /**
   * Requests user confirmation for an irreversible step.
   * @param stepId - The step requiring confirmation
   * @param description - Human-readable step description
   * @returns true if confirmed, false if cancelled
   */
  const requestConfirmation = useCallback((stepId: string, description: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmStep({ stepId, description });
      setConfirmResolver(() => resolve);
    });
  }, []);

  /**
   * Executes all pending steps sequentially.
   * Shows ConfirmGate for irreversible steps.
   */
  const handleExecute = useCallback(async (): Promise<void> => {
    setIsExecuting(true);
    const currentSteps = useSessionStore.getState().steps;

    for (const step of currentSteps) {
      if (step.status !== 'pending') continue;

      // INVARIANT: Irreversible steps must be confirmed before execution
      if (!step.reversible) {
        const confirmed = await requestConfirmation(step.stepId, step.description);
        if (!confirmed) {
          updateStep(step.stepId, 'skipped');
          // DECISION: Skip remaining steps after cancellation of irreversible step
          skipRemaining(currentSteps, step.stepId);
          break;
        }
      }

      updateStep(step.stepId, 'running');

      try {
        if (window.electronAPI?.executeStep) {
          const result = await window.electronAPI.executeStep(step);
          updateStep(step.stepId, result.status);
          if (result.status === 'failed') {
            skipRemaining(currentSteps, step.stepId);
            break;
          }
        } else {
          // DECISION: Mock execution for browser dev
          await new Promise((resolve) => setTimeout(resolve, 300));
          updateStep(step.stepId, 'done');
        }
      } catch (error) {
        console.error(`[ActionPlan] Step ${step.stepId} failed:`, error);
        updateStep(step.stepId, 'failed');
        skipRemaining(currentSteps, step.stepId);
        break;
      }
    }

    setIsExecuting(false);
  }, [updateStep, requestConfirmation]);

  /**
   * Marks all steps after the given stepId as skipped.
   * @param allSteps - Full step list
   * @param afterStepId - The step after which to skip
   */
  const skipRemaining = useCallback((allSteps: typeof steps, afterStepId: string): void => {
    let found = false;
    for (const s of allSteps) {
      if (found && s.status === 'pending') {
        updateStep(s.stepId, 'skipped');
      }
      if (s.stepId === afterStepId) found = true;
    }
  }, [updateStep]);

  if (steps.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center text-sm"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
      >
        Waiting for command...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={step.stepId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-start gap-3 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(17, 17, 24, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div
                className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: STATUS_COLORS[step.status] ?? '#8888A0',
                  boxShadow: step.status === 'running'
                    ? `0 0 8px ${STATUS_COLORS.running}`
                    : 'none',
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    color: step.status === 'failed' ? '#F87171' : 'var(--color-text)',
                  }}
                >
                  {step.description}
                </p>
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {step.type}
                </span>
              </div>
              {!step.reversible && (
                <span
                  className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'rgba(248, 113, 113, 0.15)',
                    color: '#F87171',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  irreversible
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasPendingSteps && !isExecuting && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="pt-3"
        >
          <button
            onClick={handleExecute}
            className="w-full px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150"
            style={{
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'var(--color-accent)',
              color: '#08080F',
            }}
          >
            Run
          </button>
        </motion.div>
      )}

      {isExecuting && (
        <div
          className="pt-3 text-center text-xs"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
        >
          Executing...
        </div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-3 text-center text-xs"
          style={{ color: '#4ADE80', fontFamily: 'var(--font-mono)' }}
        >
          Done
        </motion.div>
      )}

      <ConfirmGate
        isOpen={confirmStep !== null}
        stepDescription={confirmStep?.description ?? ''}
        onConfirm={() => {
          confirmResolver?.(true);
          setConfirmStep(null);
          setConfirmResolver(null);
        }}
        onCancel={() => {
          confirmResolver?.(false);
          setConfirmStep(null);
          setConfirmResolver(null);
        }}
      />
    </div>
  );
}
