import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { useOverlayStore } from '../stores/overlayStore';

/**
 * Canvas layer for UI reskinning overlays.
 * Uses React-Konva, sized to target window bounds.
 * @returns The OverlayCanvas component
 */
export function OverlayCanvas(): React.ReactElement {
  const canvasBounds = useOverlayStore((s) => s.canvasBounds);

  return (
    <div className="flex-1 relative rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <Stage
        width={canvasBounds.width}
        height={canvasBounds.height}
      >
        <Layer>
          {/* DECISION: Placeholder rect — OverlayJSON renderer will populate this in Phase 3 */}
          <Rect
            x={0}
            y={0}
            width={canvasBounds.width}
            height={canvasBounds.height}
            fill="transparent"
          />
          <Text
            x={canvasBounds.width / 2 - 80}
            y={canvasBounds.height / 2 - 10}
            text="Redesign mode"
            fontSize={14}
            fontFamily="IBM Plex Mono"
            fill="#8888A0"
          />
        </Layer>
      </Stage>
    </div>
  );
}
