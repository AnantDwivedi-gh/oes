/** AX tree node shape — defined here to avoid shared → main import */
export interface AXNodeShape {
  role: string;
  title: string;
  value: string;
  children: AXNodeShape[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  enabled: boolean;
  focused: boolean;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Context snapshot of the active application */
export interface AppContext {
  appName: string;
  bundleId: string;
  windowTitle: string;
  windowBounds: WindowBounds;
  axTree: AXNodeShape | null;
  timestamp: number;
}

/** Result of intent classification by Haiku */
export interface IntentResult {
  intent: string;
  targetElement: string | null;
  parameters: Record<string, string>;
  confidence: number;
  requiresConfirmation: boolean;
}

/** Single step in an action plan */
export interface ActionStep {
  stepId: string;
  description: string;
  type: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  reversible: boolean;
}

/** Complete action plan from Sonnet */
export interface ActionPlan {
  intent: string;
  appName: string;
  steps: ActionStep[];
  estimatedDurationMs: number;
  requiresConfirmation: boolean;
}

/** Active agent session */
export interface AgentSession {
  sessionId: string;
  deviceId: string;
  activeApp: string;
  windowTitle: string;
  status: 'active' | 'paused' | 'idle';
}

/** JSON structure for overlay UI definitions */
export interface OverlayJSON {
  version: string;
  appTarget: string;
  elements: OverlayElement[];
  theme: SkinTheme;
}

/** Single element in an overlay */
export interface OverlayElement {
  id: string;
  type: 'button' | 'panel' | 'label' | 'divider' | 'input';
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: Record<string, string>;
  action: OverlayAction | null;
}

/** Action triggered by an overlay element */
export interface OverlayAction {
  type: 'command' | 'hotkey' | 'script';
  payload: string;
}

/** Theme for overlay skin */
export interface SkinTheme {
  background: string;
  foreground: string;
  accent: string;
  fontFamily: string;
  borderRadius: number;
}
