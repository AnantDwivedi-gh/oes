import type { AppContext, AXNodeShape } from '../shared/types';

/**
 * Builds a formatted context string from an AppContext for LLM injection.
 * @param context - The AppContext snapshot
 * @returns Formatted string suitable for LLM prompt injection
 */
export function formatAppContext(context: AppContext): string {
  const axSummary = context.axTree
    ? formatAXTree(context.axTree, 0, 3)
    : 'AX tree unavailable — accessibility permission may be denied';

  return `<application>
  <name>${context.appName}</name>
  <bundle_id>${context.bundleId}</bundle_id>
  <window_title>${context.windowTitle}</window_title>
  <window_bounds>x=${context.windowBounds.x} y=${context.windowBounds.y} w=${context.windowBounds.width} h=${context.windowBounds.height}</window_bounds>
  <ax_tree>
${axSummary}
  </ax_tree>
</application>`;
}

/**
 * Recursively formats an AX tree node into indented text.
 * @param node - The AX node to format
 * @param depth - Current indentation depth
 * @param maxDepth - Maximum depth to traverse
 * @returns Formatted string representation
 */
function formatAXTree(
  node: AXNodeShape,
  depth: number,
  maxDepth: number,
): string {
  if (depth > maxDepth) return `${'  '.repeat(depth + 2)}...`;

  const indent = '  '.repeat(depth + 2);
  const focusMarker = node.focused ? ' [FOCUSED]' : '';
  const enabledMarker = !node.enabled ? ' [DISABLED]' : '';

  let line = `${indent}${node.role}`;
  if (node.title) line += `: "${node.title}"`;
  if (node.value) line += ` = "${node.value}"`;
  line += focusMarker + enabledMarker;

  const childLines = node.children
    .map((child) => formatAXTree(child, depth + 1, maxDepth))
    .join('\n');

  return childLines ? `${line}\n${childLines}` : line;
}
