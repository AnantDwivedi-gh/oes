/**
 * Builds the UI overlay generation prompt for Sonnet.
 * @param userRequest - What the user wants the redesigned UI to look like
 * @param appContext - Formatted string of the current app context
 * @returns The UI generation prompt string
 */
export function buildUIGenPrompt(userRequest: string, appContext: string): string {
  return `<task>
Design a simplified overlay UI for the target application based on the user's description.
The overlay sits on top of the app — it does not modify the app itself.
Every element in the overlay can trigger an automation command.
</task>

<app_context>
${appContext}
</app_context>

<user_request>
${userRequest}
</user_request>

<output_schema>
{
  "version": "1.0",
  "appTarget": "string — the app this overlay is for",
  "elements": [
    {
      "id": "string — unique element ID",
      "type": "button | panel | label | divider | input",
      "label": "string — display text",
      "position": { "x": "number", "y": "number" },
      "size": { "width": "number", "height": "number" },
      "style": { "key": "value CSS properties" },
      "action": {
        "type": "command | hotkey | script",
        "payload": "string — the command or hotkey to trigger"
      }
    }
  ],
  "theme": {
    "background": "#08080F",
    "foreground": "#E2E2F0",
    "accent": "#C8FF00",
    "fontFamily": "IBM Plex Mono",
    "borderRadius": 12
  }
}
</output_schema>

<design_rules>
- Minimize elements — only include what the user asked for
- Use the Naitiv brand theme unless the user specifies otherwise
- Position elements relative to the app window (0,0 = top-left of app)
- Every button must have an action — no decorative buttons
- Labels use the sans font, code/data uses the mono font
- Panels should have subtle backgrounds (rgba) not solid fills
</design_rules>

<guard>
If the request is too vague, create a minimal overlay with 3-5 most-used actions for the app.
If you cannot determine appropriate actions, use placeholder command actions.
</guard>

Respond with ONLY the JSON object. No explanation.`;
}
