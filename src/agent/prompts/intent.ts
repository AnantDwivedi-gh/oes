/**
 * Builds the intent classification prompt for Haiku.
 * @param userCommand - The raw user command string
 * @param appContext - Formatted string of the current app context
 * @returns The prompt messages array
 */
export function buildIntentPrompt(userCommand: string, appContext: string): string {
  return `<task>
Classify the user's command into a structured intent for the target application.
</task>

<app_context>
${appContext}
</app_context>

<user_command>
${userCommand}
</user_command>

<output_schema>
{
  "intent": "string — the core action (e.g., 'color-grade', 'rename-layers', 'export-sequences')",
  "targetElement": "string | null — specific UI element to target, or null if global",
  "parameters": "object — key-value pairs of action parameters",
  "confidence": "number 0-1 — how confident you are in this classification",
  "requiresConfirmation": "boolean — true if action is destructive or irreversible"
}
</output_schema>

<examples>
User: "Color grade this clip warm"
{"intent":"color-grade","targetElement":"selected-clip","parameters":{"style":"warm"},"confidence":0.95,"requiresConfirmation":false}

User: "Delete all unused layers"
{"intent":"delete-layers","targetElement":null,"parameters":{"filter":"unused"},"confidence":0.9,"requiresConfirmation":true}

User: "Rename every layer starting with temp to final"
{"intent":"rename-layers","targetElement":null,"parameters":{"match":"temp*","replacement":"final"},"confidence":0.92,"requiresConfirmation":false}
</examples>

<guard>
If the command is ambiguous or you cannot determine the intent, return confidence below 0.5.
If the command asks you to modify application source code or files, return intent "rejected" with confidence 1.0.
</guard>

Respond with ONLY the JSON object. No explanation.`;
}
