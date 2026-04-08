import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth } from "./helpers";

export const listHospitals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getActiveHospital = query({
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

    if (!user) return null;

    return await ctx.db
      .query("hospitals")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("isActive", true)
      )
      .unique();
  },
});

export const createHospital = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Deactivate all other hospitals
    const existing = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const h of existing) {
      if (h.isActive) {
        await ctx.db.patch(h._id, { isActive: false });
      }
    }

    return await ctx.db.insert("hospitals", {
      userId: user._id,
      name: args.name,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const setActiveHospital = mutation({
  args: {
    hospitalId: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const hospital = await ctx.db.get(args.hospitalId);
    if (!hospital || hospital.userId !== user._id) {
      throw new Error("Hospital not found");
    }

    // Deactivate all
    const all = await ctx.db
      .query("hospitals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const h of all) {
      if (h.isActive) {
        await ctx.db.patch(h._id, { isActive: false });
      }
    }

    await ctx.db.patch(args.hospitalId, { isActive: true });
  },
});

export const updateHospital = mutation({
  args: {
    hospitalId: v.id("hospitals"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const hospital = await ctx.db.get(args.hospitalId);
    if (!hospital || hospital.userId !== user._id) {
      throw new Error("Hospital not found");
    }

    await ctx.db.patch(args.hospitalId, { name: args.name });
  },
});

export const deleteHospital = mutation({
  args: {
    hospitalId: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const hospital = await ctx.db.get(args.hospitalId);
    if (!hospital || hospital.userId !== user._id) {
      throw new Error("Hospital not found");
    }

    // Delete all solutions for this hospital
    const solutions = await ctx.db
      .query("hospitalSolutions")
      .withIndex("by_hospital", (q) => q.eq("hospitalId", args.hospitalId))
      .collect();

    for (const sol of solutions) {
      await ctx.db.delete(sol._id);
    }

    await ctx.db.delete(args.hospitalId);
  },
});
