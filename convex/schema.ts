import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    deviceId: v.string(),
    activeApp: v.string(),
    windowTitle: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("idle")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_device", ["deviceId"]),

  actionLog: defineTable({
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
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]).index("by_app", ["appName"]),

  overlays: defineTable({
    deviceId: v.string(),
    appName: v.string(),
    appBundleId: v.string(),
    name: v.string(),
    description: v.string(),
    overlayJson: v.string(),
    isPublic: v.boolean(),
    useCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_app", ["appName"]).index("by_device", ["deviceId"]),

  appProfiles: defineTable({
    appBundleId: v.string(),
    appName: v.string(),
    axCapabilities: v.array(v.string()),
    commonActions: v.array(v.string()),
    uiMap: v.string(),
    lastSeen: v.number(),
  }).index("by_bundle", ["appBundleId"]),
});
