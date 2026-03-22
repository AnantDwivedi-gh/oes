import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './prompts/system';
import { buildIntentPrompt } from './prompts/intent';
import { formatAppContext } from './context';
import { MODELS } from '../shared/constants';
import type { AppContext, IntentResult } from '../shared/types';

// DECISION: Lazy singleton — avoids module-level instantiation that breaks test mocking
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic();
  return _anthropic;
}

/**
 * Parses user command into a structured intent using claude-haiku-4-5.
 * @param command - The raw user command string
 * @param appContext - Current application context
 * @returns Parsed IntentResult
 */
export async function parseIntent(command: string, appContext: AppContext): Promise<IntentResult> {
  const contextStr = formatAppContext(appContext);
  const intentPrompt = buildIntentPrompt(command, contextStr);

  try {
    const response = await getClient().messages.create({
      model: MODELS.INTENT,
      max_tokens: 512,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: intentPrompt }],
    });

    const text = response.content[0];
    if (text.type !== 'text') {
      throw new Error('Unexpected response type from intent model');
    }

    const parsed: IntentResult = JSON.parse(text.text);

    // DECISION: Validate required fields rather than trusting LLM output blindly
    if (!parsed.intent || typeof parsed.confidence !== 'number') {
      throw new Error('Invalid intent response: missing required fields');
    }

    return parsed;
  } catch (error) {
    console.error('[IntentParser] Failed to parse intent:', error);
    return {
      intent: 'error',
      targetElement: null,
      parameters: { error: String(error) },
      confidence: 0,
      requiresConfirmation: false,
    };
  }
}
