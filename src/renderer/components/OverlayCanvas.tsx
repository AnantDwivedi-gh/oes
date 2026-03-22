import React from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { useOverlayStore } from '../stores/overlayStore';
import type { OverlayElement } from '../../shared/types';

/**
 * Maps an OverlayElement to Konva-compatible shape props.
 * Mirrors the logic in overlay/renderer.ts for use in the React component.
 * @param element - A validated overlay element
 * @returns Props object for Konva rendering
 */
function elementToKonvaProps(element: OverlayElement): Record<string, unknown> {
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

/**
 * Renders a single overlay element as Konva shapes.
 * @param props - Contains the overlay element to render
 * @returns Konva group with the element shapes
 */
function OverlayElementShape({ element }: { element: OverlayElement }): React.ReactElement {
  const props = elementToKonvaProps(element);
  const { label, text, ...rectProps } = props as Record<string, unknown>;

  // DECISION: Label and text elements render as Konva Text; everything else as Rect + optional Text
  if (element.type === 'label') {
    return (
      <Text
        x={props.x as number}
        y={props.y as number}
        width={props.width as number}
        height={props.height as number}
        text={(text as string) ?? element.label}
        fontSize={(props.fontSize as number) ?? 13}
        fontFamily={(props.fontFamily as string) ?? 'IBM Plex Mono'}
        fill={(props.fill as string) ?? '#E2E2F0'}
      />
    );
  }

  return (
    <Group>
      <Rect
        x={rectProps.x as number}
        y={rectProps.y as number}
        width={rectProps.width as number}
        height={rectProps.height as number}
        fill={rectProps.fill as string}
        cornerRadius={rectProps.cornerRadius as number}
      />
      {label && (
        <Text
          x={(rectProps.x as number) + 8}
          y={(rectProps.y as number) + ((rectProps.height as number) / 2 - 6)}
          text={label as string}
          fontSize={12}
          fontFamily="IBM Plex Mono"
          fill={element.type === 'button' ? '#C8FF00' : '#E2E2F0'}
        />
      )}
    </Group>
  );
}

/**
 * Canvas layer for UI reskinning overlays.
 * Uses React-Konva, renders OverlayJSON elements from the store.
 * @returns The OverlayCanvas component
 */
export function OverlayCanvas(): React.ReactElement {
  const canvasBounds = useOverlayStore((s) => s.canvasBounds);
  const overlayData = useOverlayStore((s) => s.overlayData);

  return (
    <div className="flex-1 relative rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <Stage
        width={canvasBounds.width}
        height={canvasBounds.height}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={canvasBounds.width}
            height={canvasBounds.height}
            fill="transparent"
          />
          {overlayData && overlayData.elements.length > 0 ? (
            overlayData.elements.map((element) => (
              <OverlayElementShape key={element.id} element={element} />
            ))
          ) : (
            <Text
              x={canvasBounds.width / 2 - 80}
              y={canvasBounds.height / 2 - 10}
              text="Redesign mode"
              fontSize={14}
              fontFamily="IBM Plex Mono"
              fill="#8888A0"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
