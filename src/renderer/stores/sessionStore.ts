import { create } from 'zustand';

interface ActionStep {
  stepId: string;
  description: string;
  type: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  reversible: boolean;
}

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

  clearSteps: (): void => set({ steps: [] }),
}));
