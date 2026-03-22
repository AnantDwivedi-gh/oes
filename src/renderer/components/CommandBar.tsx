import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOverlayStore } from '../stores/overlayStore';
import { useSessionStore } from '../stores/sessionStore';
import type { ActionPlan } from '../../shared/types';

/**
 * Returns a mock ActionPlan for development without Electron.
 * @param command - The user command string
 * @returns A fake ActionPlan with sample steps
 */
function createMockPlan(command: string): ActionPlan {
  return {
    intent: 'mock',
    appName: 'MockApp',
    steps: [
      {
        stepId: crypto.randomUUID(),
        description: `Parse intent for: "${command}"`,
        type: 'intent-parse',
        status: 'done',
        reversible: true,
      },
      {
        stepId: crypto.randomUUID(),
        description: 'Navigate to target element',
        type: 'menu-navigate',
        status: 'pending',
        reversible: true,
      },
      {
        stepId: crypto.randomUUID(),
        description: 'Execute requested action',
        type: 'keyboard',
        status: 'pending',
        reversible: false,
      },
    ],
    estimatedDurationMs: 1500,
    requiresConfirmation: true,
  };
}

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
  const setOverlayData = useOverlayStore((s) => s.setOverlayData);
  const addStep = useSessionStore((s) => s.addStep);
  const clearSteps = useSessionStore((s) => s.clearSteps);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const command = input.trim();
    if (!command || isProcessing) return;

    setIsProcessing(true);
    clearSteps();

    // DECISION: Commands starting with "redesign" trigger overlay mode; all else -> action mode
    const isRedesign = command.toLowerCase().startsWith('redesign');
    setMode(isRedesign ? 'redesign' : 'action');

    // Show a "thinking" step while waiting for the API
    const thinkingId = crypto.randomUUID();
    addStep({
      stepId: thinkingId,
      description: 'On it...',
      type: 'intent-parse',
      status: 'running',
      reversible: true,
    });

    try {
      if (isRedesign) {
        await handleRedesign(command, thinkingId);
      } else {
        await handleAction(command, thinkingId);
      }
    } catch (error) {
      console.error('[CommandBar] Pipeline failed:', error);
      const updateStep = useSessionStore.getState().updateStep;
      updateStep(thinkingId, 'failed');
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  }, [input, isProcessing, setMode, addStep, clearSteps, setOverlayData]);

  /**
   * Handles action mode: calls agent pipeline and populates steps.
   * @param command - The user command
   * @param thinkingId - ID of the placeholder step
   */
  const handleAction = useCallback(async (command: string, thinkingId: string): Promise<void> => {
    const { updateStep, clearSteps: clear, addStep: add } = useSessionStore.getState();

    let plan: ActionPlan;

    // DECISION: Graceful fallback when electronAPI is unavailable (browser dev without Electron)
    if (window.electronAPI?.submitCommand) {
      plan = await window.electronAPI.submitCommand(command);
    } else {
      // Simulate network delay for realistic feel in browser dev
      await new Promise((resolve) => setTimeout(resolve, 800));
      plan = createMockPlan(command);
    }

    // Remove the thinking step and populate real steps
    clear();
    for (const step of plan.steps) {
      add(step);
    }
  }, []);

  /**
   * Handles redesign mode: calls overlay generation and stores result.
   * @param command - The user command
   * @param thinkingId - ID of the placeholder step
   */
  const handleRedesign = useCallback(async (command: string, thinkingId: string): Promise<void> => {
    const { updateStep } = useSessionStore.getState();

    if (window.electronAPI?.generateOverlay) {
      const overlay = await window.electronAPI.generateOverlay(command);
      setOverlayData(overlay);
    } else {
      // DECISION: Mock overlay for browser dev
      await new Promise((resolve) => setTimeout(resolve, 600));
      setOverlayData({
        version: '1.0',
        appTarget: 'MockApp',
        elements: [
          {
            id: 'mock-btn-1',
            type: 'button',
            label: 'Mock Button',
            position: { x: 20, y: 20 },
            size: { width: 120, height: 36 },
            style: { background: 'rgba(200, 255, 0, 0.15)', borderRadius: '8' },
            action: null,
          },
          {
            id: 'mock-label-1',
            type: 'label',
            label: 'Redesigned UI',
            position: { x: 20, y: 70 },
            size: { width: 200, height: 24 },
            style: { fontSize: '14', color: '#E2E2F0' },
            action: null,
          },
        ],
        theme: {
          background: '#08080F',
          foreground: '#E2E2F0',
          accent: '#C8FF00',
          fontFamily: 'IBM Plex Mono',
          borderRadius: 12,
        },
      });
    }

    updateStep(thinkingId, 'done');
  }, [setOverlayData]);

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
