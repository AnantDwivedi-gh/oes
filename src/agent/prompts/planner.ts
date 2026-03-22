/**
 * Builds the action planning prompt for Sonnet.
 * @param intent - The classified intent result as JSON string
 * @param appContext - Formatted string of the current app context
 * @returns The planner prompt string
 */
export function buildPlannerPrompt(intent: string, appContext: string): string {
  return `<task>
Create a step-by-step action plan to execute the given intent in the target application.
Each step must be an OS-level automation action — keyboard shortcut, mouse click, menu navigation, or AX write.
</task>

<app_context>
${appContext}
</app_context>

<intent>
${intent}
</intent>

<output_schema>
{
  "intent": "string — echo the intent",
  "appName": "string — target application name",
  "steps": [
    {
      "stepId": "string — unique step ID like step-1, step-2",
      "description": "string — human-readable description of what this step does",
      "type": "string — one of: keyboard, mouse-click, menu-navigate, ax-write, ax-read, wait",
      "status": "pending",
      "reversible": "boolean — true if this step can be undone with Cmd+Z or similar"
    }
  ],
  "estimatedDurationMs": "number — estimated total execution time",
  "requiresConfirmation": "boolean — true if any step is irreversible"
}
</output_schema>

<rules>
- Maximum 20 steps per plan
- Each step must be atomic — one action only
- Mark steps as reversible:false if they delete data, send messages, or modify files
- Include wait steps (200-500ms) between UI interactions for app responsiveness
- If the app lacks a needed feature, include a step that reports the limitation
- Order steps logically — navigate to context first, then act
</rules>

<guard>
If you cannot create a valid plan, return an empty steps array with a single step:
{"stepId":"step-1","description":"Cannot plan: [reason]","type":"error","status":"failed","reversible":true}
</guard>

Respond with ONLY the JSON object. No explanation.`;
}
