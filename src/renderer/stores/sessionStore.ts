import { create } from 'zustand';
import type { ActionStep } from '../../shared/types';

interface SessionState {
  /** Current Convex session ID */
  sessionId: string | null;
  /** Active application name */
  activeApp: string;
  /** Ordered list of action steps */
  steps: ActionStep[];
  /** Set the session ID */
  setSessionId: (id: string) => void;
  /** Set the active application */
  setActiveApp: (app: string) => void;
  /** Add a step to the plan */
  addStep: (step: ActionStep) => void;
  /** Update a step's status */
  updateStep: (stepId: string, status: ActionStep['status']) => void;
  /** Replace all steps at once */
  setSteps: (steps: ActionStep[]) => void;
  /** Clear all steps */
  clearSteps: () => void;
}

/**
 * Zustand store for session state.
 * Tracks the active session, target app, and action step history.
 */
export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  activeApp: '',
  steps: [],

  setSessionId: (sessionId): void => set({ sessionId }),

  setActiveApp: (activeApp): void => set({ activeApp }),

  addStep: (step): void => set((state) => ({
    steps: [...state.steps, step],
  })),

  updateStep: (stepId, status): void => set((state) => ({
    steps: state.steps.map((s) =>
      s.stepId === stepId ? { ...s, status } : s
    ),
  })),

  setSteps: (steps): void => set({ steps }),

  clearSteps: (): void => set({ steps: [] }),
}));
