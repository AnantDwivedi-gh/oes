import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmGateProps {
  /** Whether the confirmation modal is visible */
  isOpen: boolean;
  /** Description of the irreversible step */
  stepDescription: string;
  /** Called when user confirms the action */
  onConfirm: () => void;
  /** Called when user cancels the action */
  onCancel: () => void;
}

/**
 * Confirmation modal for irreversible (reversible: false) action steps.
 * @param props - ConfirmGateProps
 * @returns The ConfirmGate component
 */
export function ConfirmGate({ isOpen, stepDescription, onConfirm, onCancel }: ConfirmGateProps): React.ReactElement {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-80 rounded-xl p-5 space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="space-y-2">
              <h3
                className="text-sm font-medium"
                style={{ fontFamily: 'var(--font-sans)', color: '#F87171' }}
              >
                Irreversible action
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}
              >
                {stepDescription}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 hover:bg-white/10"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150"
                style={{
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--color-accent)',
                  color: '#08080F',
                }}
              >
                Run it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
