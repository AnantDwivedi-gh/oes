import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Logs a completed action with its steps and outcome.
 * @param sessionId - The session this action belongs to
 * @param appName - The target application name
 * @param intent - The user's original intent string
 * @param steps - Array of action steps with their statuses
 * @param outcome - Final outcome of the action
 * @param durationMs - Total duration in milliseconds
 * @returns The ID of the created action log entry
 */
export const logAction = mutation({
  args: {
    sessionId: v.id("sessions"),
    appName: v.string(),
    intent: v.string(),
    steps: v.array(v.object({
      stepId: v.string(),
      description: v.string(),
      type: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("done"),
        v.literal("failed"),
        v.literal("skipped")
      ),
      reversible: v.boolean(),
    })),
    outcome: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("partial")
    ),
    durationMs: v.number(),
  },
  returns: v.id("actionLog"),
  handler: async (ctx, args) => {
    return ctx.db.insert("actionLog", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

/**
 * Gets action history for a session, sorted by most recent first.
 * @param sessionId - The session to query
 * @returns Array of action log entries
 */
export const getActionHistory = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("actionLog")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
  },
});
