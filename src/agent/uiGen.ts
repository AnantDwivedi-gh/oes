import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './prompts/system';
import { buildUIGenPrompt } from './prompts/uiGen';
import { formatAppContext } from './context';
import { MODELS } from '../shared/constants';
import type { AppContext, OverlayJSON } from '../shared/types';

let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic();
  return _anthropic;
}

/**
 * Generates an overlay UI definition using claude-sonnet-4-6.
 * @param userRequest - Natural language description of desired UI
 * @param appContext - Current application context
 * @returns Validated OverlayJSON
 */
export async function generateOverlay(userRequest: string, appContext: AppContext): Promise<OverlayJSON> {
  const contextStr = formatAppContext(appContext);
  const uiPrompt = buildUIGenPrompt(userRequest, contextStr);

  try {
    const response = await getClient().messages.create({
      model: MODELS.PLANNER,
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: uiPrompt }],
    });

    const text = response.content[0];
    if (text.type !== 'text') {
      throw new Error('Unexpected response type from UI gen model');
    }

    const parsed: OverlayJSON = JSON.parse(text.text);

    // DECISION: Validate structure before returning — Zod validation happens in overlay/schema.ts
    if (!parsed.version || !parsed.elements || !Array.isArray(parsed.elements)) {
      throw new Error('Invalid overlay JSON: missing required fields');
    }

    return parsed;
  } catch (error) {
    console.error('[UIGen] Failed to generate overlay:', error);
    // Return minimal fallback overlay
    return {
      version: '1.0',
      appTarget: appContext.appName,
      elements: [],
      theme: {
        background: '#08080F',
        foreground: '#E2E2F0',
        accent: '#C8FF00',
        fontFamily: 'IBM Plex Mono',
        borderRadius: 12,
      },
    };
  }
}
