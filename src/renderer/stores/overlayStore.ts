import { create } from 'zustand';
import type { OverlayJSON } from '../../shared/types';

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
  /** Current overlay JSON for redesign mode */
  overlayData: OverlayJSON | null;
  /** Toggle overlay visibility */
  toggle: () => void;
  /** Set the operating mode */
  setMode: (mode: OverlayMode) => void;
  /** Update canvas bounds to match target window */
  setCanvasBounds: (bounds: CanvasBounds) => void;
  /** Set the overlay JSON data for rendering */
  setOverlayData: (data: OverlayJSON) => void;
  /** Clear overlay data */
  clearOverlayData: () => void;
}

/**
 * Zustand store for overlay UI state.
 * Controls visibility, mode, canvas positioning, and overlay data.
 */
export const useOverlayStore = create<OverlayState>((set) => ({
  isOpen: false,
  mode: 'idle',
  canvasBounds: { x: 0, y: 0, width: 380, height: 400 },
  overlayData: null,

  toggle: (): void => set((state) => ({ isOpen: !state.isOpen })),

  setMode: (mode): void => set({ mode }),

  setCanvasBounds: (canvasBounds): void => set({ canvasBounds }),

  setOverlayData: (overlayData): void => set({ overlayData }),

  clearOverlayData: (): void => set({ overlayData: null }),
}));
