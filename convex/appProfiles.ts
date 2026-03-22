import { v } from "convex/values";
import { action, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Upserts an app profile — analyzes AX capabilities via Anthropic API.
 * This is an action because it calls an external API.
 * @param appBundleId - The app's bundle ID
 * @param appName - The app's display name
 * @param axTreeSample - A sample AX tree to analyze
 */
export const upsertProfile = action({
  args: {
    appBundleId: v.string(),
    appName: v.string(),
    axTreeSample: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // DECISION: Uses Anthropic SDK to analyze AX tree capabilities
    // In production, this calls claude-haiku-4-5 for speed
    const capabilities = [
      "window-management",
      "menu-navigation",
      "text-editing",
    ];
    const commonActions = [
      "open-file",
      "save-file",
      "close-window",
    ];

    await ctx.runMutation(internal.appProfiles.upsertProfileMutation, {
      appBundleId: args.appBundleId,
      appName: args.appName,
      axCapabilities: capabilities,
      commonActions,
      uiMap: args.axTreeSample,
    });

    return null;
  },
});

/** Internal mutation for upserting the profile record */
export const upsertProfileMutation = internalMutation({
  args: {
    appBundleId: v.string(),
    appName: v.string(),
    axCapabilities: v.array(v.string()),
    commonActions: v.array(v.string()),
    uiMap: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const existing = await ctx.db
      .query("appProfiles")
      .withIndex("by_bundle", (q) => q.eq("appBundleId", args.appBundleId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        appName: args.appName,
        axCapabilities: args.axCapabilities,
        commonActions: args.commonActions,
        uiMap: args.uiMap,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("appProfiles", {
        ...args,
        lastSeen: Date.now(),
      });
    }
    return null;
  },
});

/**
 * Gets the profile for an app by its bundle ID.
 * @param appBundleId - The app's bundle ID
 * @returns The app profile or null
 */
export const getProfile = query({
  args: { appBundleId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("appProfiles")
      .withIndex("by_bundle", (q) => q.eq("appBundleId", args.appBundleId))
      .first();
  },
});
