import { z } from 'zod';

/** Zod schema for overlay actions triggered by elements */
export const OverlayActionSchema = z.object({
  type: z.enum(['command', 'hotkey', 'script']),
  payload: z.string(),
});

/** Zod schema for a single overlay element */
export const OverlayElementSchema = z.object({
  id: z.string(),
  type: z.enum(['button', 'panel', 'label', 'divider', 'input']),
  label: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  size: z.object({ width: z.number(), height: z.number() }),
  style: z.record(z.string(), z.string()),
  action: OverlayActionSchema.nullable(),
});

/** Zod schema for the skin theme */
export const SkinThemeSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
  fontFamily: z.string(),
  borderRadius: z.number(),
});

/** Zod schema for the complete overlay JSON definition */
export const OverlayJSONSchema = z.object({
  version: z.string(),
  appTarget: z.string(),
  elements: z.array(OverlayElementSchema),
  theme: SkinThemeSchema,
});

/** Error thrown when overlay JSON fails validation */
export class InvalidOverlayError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super(`Invalid overlay JSON: ${issues.map((i) => i.message).join(', ')}`);
    this.name = 'InvalidOverlayError';
  }
}

/**
 * Validates and parses raw overlay JSON.
 * @param data - Raw data to validate
 * @returns Validated OverlayJSON
 * @throws InvalidOverlayError if validation fails
 */
export function validateOverlayJSON(data: unknown): z.infer<typeof OverlayJSONSchema> {
  const result = OverlayJSONSchema.safeParse(data);
  if (!result.success) {
    throw new InvalidOverlayError(result.error.issues);
  }
  return result.data;
}
