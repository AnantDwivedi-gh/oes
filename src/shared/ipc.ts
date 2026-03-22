/**
 * IPC channel constants — the single source of truth for all IPC communication.
 * Main and renderer must both import from here. Never hardcode channel strings.
 */
export const IPC_CHANNELS = {
  /** Get AX tree snapshot of active window */
  GET_SNAPSHOT: 'oes:get-snapshot',
  /** Get active application metadata */
  GET_ACTIVE_APP: 'oes:get-active-app',
  /** Request user confirmation for irreversible step */
  CONFIRM_ACTION: 'oes:confirm-action',
  /** Toggle overlay visibility (main → renderer) */
  TOGGLE_OVERLAY: 'oes:toggle-overlay',
  /** Submit command from renderer to agent pipeline */
  SUBMIT_COMMAND: 'oes:submit-command',
  /** Step status update (main → renderer) */
  STEP_UPDATE: 'oes:step-update',
  /** Execute action step via AX/nut.js */
  EXECUTE_STEP: 'oes:execute-step',
  /** Request overlay generation */
  GENERATE_OVERLAY: 'oes:generate-overlay',
} as const;

/** Type for IPC channel names */
export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
