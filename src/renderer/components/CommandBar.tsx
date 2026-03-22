import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOverlayStore } from '../stores/overlayStore';
import { useSessionStore } from '../stores/sessionStore';

/**
 * Primary command input for OeS.
 * Text input with lime accent, IBM Plex Mono font, dark glass aesthetic.
 * @returns The CommandBar component
 */
export function CommandBar(): React.ReactElement {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const setMode = useOverlayStore((s) => s.setMode);
  const addStep = useSessionStore((s) => s.addStep);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const command = input.trim();
    if (!command || isProcessing) return;

    setIsProcessing(true);

    // DECISION: Commands starting with "redesign" trigger overlay mode; all else → action mode
    if (command.toLowerCase().startsWith('redesign')) {
      setMode('redesign');
    } else {
      setMode('action');
    }

    // DECISION: IPC call to agent pipeline happens here — stubbed for now
    // The intent parser will be wired in Phase 3
    try {
      addStep({
        stepId: crypto.randomUUID(),
        description: `Processing: "${command}"`,
        type: 'intent-parse',
        status: 'running',
        reversible: true,
      });
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  }, [input, isProcessing, setMode, addStep]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What should I do?"
            disabled={isProcessing}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
            style={{
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              color: 'var(--color-text)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              caretColor: 'var(--color-accent)',
            }}
          />
          {isProcessing && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </form>
  );
}
