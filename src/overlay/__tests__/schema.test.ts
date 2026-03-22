import { describe, it, expect } from 'vitest';
import { validateOverlayJSON, InvalidOverlayError } from '../schema';

const validOverlay = {
  version: '1.0',
  appTarget: 'Finder',
  elements: [
    {
      id: 'btn-1',
      type: 'button',
      label: 'Quick Look',
      position: { x: 10, y: 10 },
      size: { width: 100, height: 36 },
      style: { background: 'rgba(200,255,0,0.15)' },
      action: { type: 'hotkey', payload: 'Space' },
    },
  ],
  theme: {
    background: '#08080F',
    foreground: '#E2E2F0',
    accent: '#C8FF00',
    fontFamily: 'IBM Plex Mono',
    borderRadius: 12,
  },
};

describe('OverlayJSON Schema Validation', () => {
  it('should accept a valid overlay', () => {
    const result = validateOverlayJSON(validOverlay);
    expect(result.version).toBe('1.0');
    expect(result.elements).toHaveLength(1);
    expect(result.theme.accent).toBe('#C8FF00');
  });

  it('should reject overlay with missing required fields', () => {
    const invalid = { version: '1.0' }; // Missing elements and theme
    expect(() => validateOverlayJSON(invalid)).toThrow(InvalidOverlayError);
  });

  it('should reject overlay with invalid element type', () => {
    const invalid = {
      ...validOverlay,
      elements: [{
        ...validOverlay.elements[0],
        type: 'invalid-type',
      }],
    };
    expect(() => validateOverlayJSON(invalid)).toThrow(InvalidOverlayError);
  });

  it('should reject overlay with bad coordinate types', () => {
    const invalid = {
      ...validOverlay,
      elements: [{
        ...validOverlay.elements[0],
        position: { x: 'not-a-number', y: 10 },
      }],
    };
    expect(() => validateOverlayJSON(invalid)).toThrow(InvalidOverlayError);
  });

  it('should accept overlay with null action', () => {
    const withNullAction = {
      ...validOverlay,
      elements: [{
        ...validOverlay.elements[0],
        action: null,
      }],
    };
    const result = validateOverlayJSON(withNullAction);
    expect(result.elements[0].action).toBeNull();
  });
});
