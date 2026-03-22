import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { CommandBar } from './components/CommandBar';
import { ActionPlan } from './components/ActionPlan';
import { OverlayCanvas } from './components/OverlayCanvas';
import { StatusDot } from './components/StatusDot';
import { useOverlayStore } from './stores/overlayStore';

// DECISION: ConvexReactClient instantiated at app root; URL from env for dev/prod flexibility
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

/**
 * Root application component.
 * Wraps everything in Convex provider and renders the overlay UI.
 * @returns The root React element
 */
export default function App(): React.ReactElement {
  const mode = useOverlayStore((s) => s.mode);

  const content = (
    <div className="flex flex-col h-screen w-screen bg-transparent">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          OeS
        </span>
        <StatusDot />
      </div>

      <div className="flex-1 flex flex-col px-4 pb-4 gap-3 overflow-hidden">
        <CommandBar />
        {mode === 'action' && <ActionPlan />}
        {mode === 'redesign' && <OverlayCanvas />}
      </div>
    </div>
  );

  // DECISION: Gracefully handle missing Convex URL in development
  if (!convex) {
    return content;
  }

  return (
    <ConvexProvider client={convex}>
      {content}
    </ConvexProvider>
  );
}
