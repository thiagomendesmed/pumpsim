import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function requirePremium(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!user) throw new Error("User not found");
  if (user.subscriptionStatus !== "premium") {
    throw new Error("Premium subscription required");
  }

  return user;
}

export const listPatients = query({
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
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const createPatient = mutation({
  args: {
    bedNumber: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePremium(ctx);

    return await ctx.db.insert("patients", {
      userId: user._id,
      bedNumber: args.bedNumber,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    bedNumber: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePremium(ctx);

    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) {
      throw new Error("Patient not found");
    }

    const updates: Record<string, string> = {};
    if (args.bedNumber !== undefined) updates.bedNumber = args.bedNumber;
    if (args.name !== undefined) updates.name = args.name;

    await ctx.db.patch(args.patientId, updates);
  },
});

export const deletePatient = mutation({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const user = await requirePremium(ctx);

    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) {
      throw new Error("Patient not found");
    }

    // Delete all pumps for this patient
    const pumps = await ctx.db
      .query("pumps")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    for (const pump of pumps) {
      await ctx.db.delete(pump._id);
    }

    await ctx.db.delete(args.patientId);
  },
});
