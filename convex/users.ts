import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { hasActiveSubscription } from "./helpers";

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

export const canSubscribe = query({
  args: {
    requestedProvider: v.union(
      v.literal("app_store"),
      v.literal("stripe")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { canSubscribe: true, activeProvider: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || !hasActiveSubscription(user)) {
      return { canSubscribe: true, activeProvider: null };
    }

    return {
      canSubscribe: false,
      activeProvider: user.subscriptionProvider ?? null,
    };
  },
});

export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existing) {
      const needsUpdate =
        (identity.email && existing.email !== identity.email) ||
        (identity.name && existing.name !== identity.name);
      if (needsUpdate) {
        await ctx.db.patch(existing._id, {
          email: identity.email ?? existing.email,
          name: identity.name ?? existing.name,
        });
      }
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name,
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

    if (
      args.subscriptionStatus === "premium" &&
      user.subscriptionProvider === "stripe" &&
      hasActiveSubscription(user)
    ) {
      console.warn(
        `[RC webhook] Ignoring premium event for user ${user._id}: active Stripe subscription exists`
      );
      return;
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: args.subscriptionStatus,
      subscriptionExpiresAt: args.subscriptionExpiresAt,
      subscriptionProvider:
        args.subscriptionStatus === "premium" ? "app_store" : undefined,
    });
  },
});

export const updateStripeSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
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
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();

    if (!user) throw new Error("User not found for Stripe customer ID");

    if (
      args.subscriptionStatus === "premium" &&
      user.subscriptionProvider === "app_store" &&
      hasActiveSubscription(user)
    ) {
      console.warn(
        `[Stripe webhook] Ignoring premium event for user ${user._id}: active App Store subscription exists`
      );
      return;
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: args.subscriptionStatus,
      subscriptionExpiresAt: args.subscriptionExpiresAt,
      subscriptionProvider:
        args.subscriptionStatus === "premium" ? "stripe" : undefined,
      stripeSubscriptionId: args.stripeSubscriptionId,
    });
  },
});

export const setStripeCustomerId = mutation({
  args: {
    stripeCustomerId: v.string(),
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
      stripeCustomerId: args.stripeCustomerId,
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
