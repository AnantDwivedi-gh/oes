import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AppContext, IntentResult } from '../../shared/types';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

const mockAppContext: AppContext = {
  appName: 'Finder',
  bundleId: 'com.apple.finder',
  windowTitle: 'Documents',
  windowBounds: { x: 0, y: 0, width: 1200, height: 800 },
  axTree: null,
  timestamp: Date.now(),
};

const mockIntent: IntentResult = {
  intent: 'rename-files',
  targetElement: null,
  parameters: { match: '*.txt', replacement: '*.md' },
  confidence: 0.9,
  requiresConfirmation: false,
};

describe('ActionPlanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should generate a valid action plan from intent', async () => {
    const mockPlan = {
      intent: 'rename-files',
      appName: 'Finder',
      steps: [
        { stepId: 'step-1', description: 'Select all .txt files', type: 'keyboard', status: 'pending', reversible: true },
        { stepId: 'step-2', description: 'Open batch rename', type: 'menu-navigate', status: 'pending', reversible: true },
        { stepId: 'step-3', description: 'Set extension to .md', type: 'keyboard', status: 'pending', reversible: true },
        { stepId: 'step-4', description: 'Confirm rename', type: 'mouse-click', status: 'pending', reversible: false },
      ],
      estimatedDurationMs: 2000,
      requiresConfirmation: true,
    };

    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: JSON.stringify(mockPlan) }] });

    const { planAction } = await import('../planner');
    const result = await planAction(mockIntent, mockAppContext);

    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.every((s) => s.status === 'pending')).toBe(true);
    expect(result.appName).toBe('Finder');
  });

  it('should return error plan on API failure', async () => {
    mockCreate.mockRejectedValue(new Error('timeout'));

    const { planAction } = await import('../planner');
    const result = await planAction(mockIntent, mockAppContext);

    expect(result.steps.length).toBe(1);
    expect(result.steps[0].status).toBe('failed');
    expect(result.steps[0].type).toBe('error');
  });

  it('should truncate plans exceeding MAX_PLAN_STEPS', async () => {
    const longPlan = {
      intent: 'complex-task',
      appName: 'Finder',
      steps: Array.from({ length: 25 }, (_, i) => ({
        stepId: `step-${i + 1}`,
        description: `Step ${i + 1}`,
        type: 'keyboard',
        status: 'pending',
        reversible: true,
      })),
      estimatedDurationMs: 10000,
      requiresConfirmation: false,
    };

    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: JSON.stringify(longPlan) }] });

    const { planAction } = await import('../planner');
    const result = await planAction(mockIntent, mockAppContext);

    expect(result.steps.length).toBeLessThanOrEqual(20);
  });
});
