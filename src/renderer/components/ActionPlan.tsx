import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../stores/sessionStore';
import { StatusDot } from './StatusDot';

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
 * Uses Framer Motion for staggered reveal of each step.
 * @returns The ActionPlan component
 */
export function ActionPlan(): React.ReactElement {
  const steps = useSessionStore((s) => s.steps);

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
  );
}
