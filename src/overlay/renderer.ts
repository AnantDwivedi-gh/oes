import { validateOverlayJSON, InvalidOverlayError } from './schema';
import type { OverlayJSON, OverlayElement } from '../shared/types';

/**
 * Converts validated OverlayJSON into renderable element descriptors for Konva.
 * @param rawData - Unvalidated overlay data
 * @returns Validated OverlayJSON ready for canvas rendering
 * @throws InvalidOverlayError if input fails Zod validation
 */
export function prepareOverlayForRender(rawData: unknown): OverlayJSON {
  // INVARIANT: Only Zod-validated data reaches the canvas
  return validateOverlayJSON(rawData);
}

/**
 * Maps an OverlayElement to Konva-compatible shape props.
 * @param element - A validated overlay element
 * @returns Props object for Konva rendering
 */
export function elementToKonvaProps(element: OverlayElement): Record<string, unknown> {
  const base = {
    x: element.position.x,
    y: element.position.y,
    width: element.size.width,
    height: element.size.height,
  };

  switch (element.type) {
    case 'button':
      return {
        ...base,
        fill: element.style.background ?? 'rgba(200, 255, 0, 0.15)',
        cornerRadius: parseInt(element.style.borderRadius ?? '8', 10),
        label: element.label,
      };
    case 'panel':
      return {
        ...base,
        fill: element.style.background ?? 'rgba(17, 17, 24, 0.8)',
        cornerRadius: parseInt(element.style.borderRadius ?? '12', 10),
      };
    case 'label':
      return {
        ...base,
        text: element.label,
        fontSize: parseInt(element.style.fontSize ?? '13', 10),
        fontFamily: element.style.fontFamily ?? 'IBM Plex Mono',
        fill: element.style.color ?? '#E2E2F0',
      };
    case 'divider':
      return {
        ...base,
        height: 1,
        fill: 'rgba(255, 255, 255, 0.1)',
      };
    case 'input':
      return {
        ...base,
        fill: 'rgba(0, 0, 0, 0.4)',
        cornerRadius: 8,
        label: element.label,
      };
    default:
      return base;
  }
}
