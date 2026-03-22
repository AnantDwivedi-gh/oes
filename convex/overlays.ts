import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Saves or updates an overlay definition.
 * @param deviceId - Device that created the overlay
 * @param appName - Target application name
 * @param appBundleId - Target app bundle ID
 * @param name - User-given overlay name
 * @param description - Overlay description
 * @param overlayJson - Serialized OverlayJSON
 * @param isPublic - Whether the overlay is shared publicly
 * @returns The ID of the saved overlay
 */
export const saveOverlay = mutation({
  args: {
    deviceId: v.string(),
    appName: v.string(),
    appBundleId: v.string(),
    name: v.string(),
    description: v.string(),
    overlayJson: v.string(),
    isPublic: v.boolean(),
  },
  returns: v.id("overlays"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("overlays", {
      ...args,
      useCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Gets all overlays for a specific application, sorted by most used.
 * @param appName - The application to query overlays for
 * @returns Array of overlays for the app
 */
export const getOverlaysByApp = query({
  args: { appName: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("overlays")
      .withIndex("by_app", (q) => q.eq("appName", args.appName))
      .collect();
  },
});

/**
 * Deletes an overlay by ID.
 * @param overlayId - The overlay to delete
 */
export const deleteOverlay = mutation({
  args: { overlayId: v.id("overlays") },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await ctx.db.delete(args.overlayId);
    return null;
  },
});

/**
 * Increments the use count of an overlay.
 * @param overlayId - The overlay to increment
 */
export const incrementUseCount = mutation({
  args: { overlayId: v.id("overlays") },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const overlay = await ctx.db.get(args.overlayId);
    if (!overlay) return null;
    await ctx.db.patch(args.overlayId, {
      useCount: overlay.useCount + 1,
      updatedAt: Date.now(),
    });
    return null;
  },
});
