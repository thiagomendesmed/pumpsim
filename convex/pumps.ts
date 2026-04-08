import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function requirePremiumUser(ctx: any) {
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

export const listPumpsByPatient = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pumps")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

export const createPump = mutation({
  args: {
    patientId: v.id("patients"),
    drugId: v.string(),
    dilutionId: v.string(),
    flowRate: v.number(),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requirePremiumUser(ctx);

    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.userId !== user._id) {
      throw new Error("Patient not found");
    }

    return await ctx.db.insert("pumps", {
      patientId: args.patientId,
      userId: user._id,
      drugId: args.drugId,
      dilutionId: args.dilutionId,
      flowRate: args.flowRate,
      weight: args.weight,
      isRunning: false,
      createdAt: Date.now(),
    });
  },
});

export const updatePump = mutation({
  args: {
    pumpId: v.id("pumps"),
    flowRate: v.optional(v.number()),
    weight: v.optional(v.number()),
    isRunning: v.optional(v.boolean()),
    drugId: v.optional(v.string()),
    dilutionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePremiumUser(ctx);

    const pump = await ctx.db.get(args.pumpId);
    if (!pump || pump.userId !== user._id) {
      throw new Error("Pump not found");
    }

    const updates: Record<string, any> = {};
    if (args.flowRate !== undefined) updates.flowRate = args.flowRate;
    if (args.weight !== undefined) updates.weight = args.weight;
    if (args.isRunning !== undefined) updates.isRunning = args.isRunning;
    if (args.drugId !== undefined) updates.drugId = args.drugId;
    if (args.dilutionId !== undefined) updates.dilutionId = args.dilutionId;

    await ctx.db.patch(args.pumpId, updates);
  },
});

export const deletePump = mutation({
  args: {
    pumpId: v.id("pumps"),
  },
  handler: async (ctx, args) => {
    const user = await requirePremiumUser(ctx);

    const pump = await ctx.db.get(args.pumpId);
    if (!pump || pump.userId !== user._id) {
      throw new Error("Pump not found");
    }

    await ctx.db.delete(args.pumpId);
  },
});
