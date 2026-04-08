import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user;
  },
});

export const getOrCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    authProvider: v.literal("apple"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existing) return existing._id;

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      email: args.email,
      name: args.name,
      authProvider: args.authProvider,
      subscriptionStatus: "free",
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const updateSubscription = internalMutation({
  args: {
    revenuecatCustomerId: v.string(),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("expired")
    ),
    subscriptionExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_revenuecat", (q) =>
        q.eq("revenuecatCustomerId", args.revenuecatCustomerId)
      )
      .unique();

    if (!user) throw new Error("User not found for RevenueCat ID");

    await ctx.db.patch(user._id, {
      subscriptionStatus: args.subscriptionStatus,
      subscriptionExpiresAt: args.subscriptionExpiresAt,
    });
  },
});

export const setRevenuecatId = mutation({
  args: {
    revenuecatCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      revenuecatCustomerId: args.revenuecatCustomerId,
    });
  },
});
