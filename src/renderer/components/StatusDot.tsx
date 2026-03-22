import React from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '../stores/sessionStore';

type DotStatus = 'idle' | 'active' | 'error';

const DOT_COLORS: Record<DotStatus, string> = {
  idle: '#8888A0',
  active: '#C8FF00',
  error: '#F87171',
};

/**
 * Ambient status indicator — pulse dot with 3 states.
 * @returns The StatusDot component
 */
export function StatusDot(): React.ReactElement {
  const steps = useSessionStore((s) => s.steps);

  const status: DotStatus = (() => {
    if (steps.some((s) => s.status === 'failed')) return 'error';
    if (steps.some((s) => s.status === 'running')) return 'active';
    return 'idle';
  })();

  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: DOT_COLORS[status] }}
      animate={status === 'active' ? {
        scale: [1, 1.4, 1],
        opacity: [1, 0.7, 1],
      } : status === 'error' ? {
        scale: [1, 1.2, 1],
      } : {}}
      transition={{
        duration: status === 'active' ? 1.2 : 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
