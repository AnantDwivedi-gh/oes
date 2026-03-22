import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './prompts/system';
import { buildPlannerPrompt } from './prompts/planner';
import { formatAppContext } from './context';
import { MODELS, MAX_PLAN_STEPS } from '../shared/constants';
import type { AppContext, IntentResult, ActionPlan } from '../shared/types';

let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic();
  return _anthropic;
}

/**
 * Generates an action plan from an intent using claude-sonnet-4-6.
 * @param intent - The parsed intent result
 * @param appContext - Current application context
 * @returns ActionPlan with ordered steps
 */
export async function planAction(intent: IntentResult, appContext: AppContext): Promise<ActionPlan> {
  const contextStr = formatAppContext(appContext);
  const plannerPrompt = buildPlannerPrompt(JSON.stringify(intent), contextStr);

  try {
    const response = await getClient().messages.create({
      model: MODELS.PLANNER,
      max_tokens: 2048,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: plannerPrompt }],
    });

    const text = response.content[0];
    if (text.type !== 'text') {
      throw new Error('Unexpected response type from planner model');
    }

    const parsed: ActionPlan = JSON.parse(text.text);

    // DECISION: Enforce max steps to prevent runaway plans
    if (parsed.steps.length > MAX_PLAN_STEPS) {
      parsed.steps = parsed.steps.slice(0, MAX_PLAN_STEPS);
    }

    // Ensure all steps start as pending
    parsed.steps = parsed.steps.map((step) => ({
      ...step,
      status: 'pending' as const,
    }));

    return parsed;
  } catch (error) {
    console.error('[ActionPlanner] Failed to generate plan:', error);
    return {
      intent: intent.intent,
      appName: appContext.appName,
      steps: [{
        stepId: 'step-error',
        description: `Planning failed: ${String(error)}`,
        type: 'error',
        status: 'failed',
        reversible: true,
      }],
      estimatedDurationMs: 0,
      requiresConfirmation: false,
    };
  }
}
