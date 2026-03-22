import { describe, it, expect } from 'vitest';
import { formatAppContext } from '../context';
import type { AppContext } from '../../shared/types';

describe('AppContextBuilder', () => {
  it('should format context with app metadata', () => {
    const context: AppContext = {
      appName: 'VS Code',
      bundleId: 'com.microsoft.VSCode',
      windowTitle: 'index.ts - oes',
      windowBounds: { x: 100, y: 50, width: 1600, height: 900 },
      axTree: null,
      timestamp: Date.now(),
    };

    const result = formatAppContext(context);

    expect(result).toContain('<name>VS Code</name>');
    expect(result).toContain('<bundle_id>com.microsoft.VSCode</bundle_id>');
    expect(result).toContain('<window_title>index.ts - oes</window_title>');
    expect(result).toContain('w=1600');
    expect(result).toContain('h=900');
  });

  it('should indicate when AX tree is unavailable', () => {
    const context: AppContext = {
      appName: 'Finder',
      bundleId: 'com.apple.finder',
      windowTitle: 'Documents',
      windowBounds: { x: 0, y: 0, width: 800, height: 600 },
      axTree: null,
      timestamp: Date.now(),
    };

    const result = formatAppContext(context);

    expect(result).toContain('AX tree unavailable');
  });

  it('should format AX tree with depth limiting', () => {
    const context: AppContext = {
      appName: 'TextEdit',
      bundleId: 'com.apple.TextEdit',
      windowTitle: 'Untitled',
      windowBounds: { x: 0, y: 0, width: 800, height: 600 },
      axTree: {
        role: 'AXWindow',
        title: 'Untitled',
        value: '',
        children: [
          {
            role: 'AXTextArea',
            title: 'Editor',
            value: 'Hello world',
            children: [],
            position: { x: 0, y: 40 },
            size: { width: 800, height: 560 },
            enabled: true,
            focused: true,
          },
        ],
        position: { x: 0, y: 0 },
        size: { width: 800, height: 600 },
        enabled: true,
        focused: false,
      },
      timestamp: Date.now(),
    };

    const result = formatAppContext(context);

    expect(result).toContain('AXWindow');
    expect(result).toContain('AXTextArea: "Editor"');
    expect(result).toContain('[FOCUSED]');
  });
});
