import { create } from 'zustand';

type OverlayMode = 'idle' | 'action' | 'redesign';

interface CanvasBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OverlayState {
  /** Whether the overlay panel is visible */
  isOpen: boolean;
  /** Current operating mode */
  mode: OverlayMode;
  /** Canvas bounds matching the target window */
  canvasBounds: CanvasBounds;
  /** Toggle overlay visibility */
  toggle: () => void;
  /** Set the operating mode */
  setMode: (mode: OverlayMode) => void;
  /** Update canvas bounds to match target window */
  setCanvasBounds: (bounds: CanvasBounds) => void;
}

/**
 * Zustand store for overlay UI state.
 * Controls visibility, mode, and canvas positioning.
 */
export const useOverlayStore = create<OverlayState>((set) => ({
  isOpen: false,
  mode: 'idle',
  canvasBounds: { x: 0, y: 0, width: 380, height: 400 },

  toggle: (): void => set((state) => ({ isOpen: !state.isOpen })),

  setMode: (mode): void => set({ mode }),

  setCanvasBounds: (canvasBounds): void => set({ canvasBounds }),
}));
