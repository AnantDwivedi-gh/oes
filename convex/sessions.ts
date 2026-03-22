import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Creates a new session for a device.
 * @param deviceId - Unique device identifier
 * @param activeApp - Currently active application name
 * @param windowTitle - Current window title
 * @returns The ID of the created session
 */
export const createSession = mutation({
  args: {
    deviceId: v.string(),
    activeApp: v.string(),
    windowTitle: v.string(),
  },
  returns: v.id("sessions"),
  handler: async (ctx, args): Promise<any> => {
    const now = Date.now();
    return ctx.db.insert("sessions", {
      deviceId: args.deviceId,
      activeApp: args.activeApp,
      windowTitle: args.windowTitle,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Updates an existing session's active app and window title.
 * @param sessionId - The session to update
 * @param activeApp - New active application name
 * @param windowTitle - New window title
 * @param status - New session status
 */
export const updateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    activeApp: v.optional(v.string()),
    windowTitle: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("idle"))),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const { sessionId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(sessionId, { ...filtered, updatedAt: Date.now() });
    return null;
  },
});

/**
 * Gets the most recent active session for a device.
 * @param deviceId - The device to look up
 * @returns The active session or null
 */
export const getActiveSession = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .first();
    return sessions;
  },
});
