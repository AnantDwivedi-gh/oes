import type { ActionPlan, ActionStep, OverlayJSON } from '../shared/types';

interface ElectronAPI {
  getSnapshot: () => Promise<import('../shared/types').AppContext>;
  getActiveApp: () => Promise<{
    appName: string;
    bundleId: string;
    windowTitle: string;
    windowBounds: { x: number; y: number; width: number; height: number };
    pid: number;
  }>;
  confirmAction: (description: string) => Promise<boolean>;
  submitCommand: (command: string) => Promise<ActionPlan>;
  generateOverlay: (command: string) => Promise<OverlayJSON>;
  executeStep: (step: ActionStep) => Promise<ActionStep>;
  onToggleOverlay: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
