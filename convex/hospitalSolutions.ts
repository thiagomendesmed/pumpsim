import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth } from "./helpers";

export const listByHospital = query({
  args: {
    hospitalId: v.id("hospitals"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hospitalSolutions")
      .withIndex("by_hospital", (q) => q.eq("hospitalId", args.hospitalId))
      .collect();
  },
});

export const listByHospitalAndDrug = query({
  args: {
    hospitalId: v.id("hospitals"),
    drugId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hospitalSolutions")
      .withIndex("by_hospital_drug", (q) =>
        q.eq("hospitalId", args.hospitalId).eq("drugId", args.drugId)
      )
      .collect();
  },
});

export const createSolution = mutation({
  args: {
    hospitalId: v.id("hospitals"),
    drugId: v.string(),
    solutionId: v.string(),
    ampoules: v.number(),
    diluentVolume_mL: v.number(),
    diluent: v.union(v.literal("SG5"), v.literal("SF09")),
    totalVolume_mL: v.number(),
    totalDrug_mg: v.number(),
    concentration_mcg_per_mL: v.number(),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const hospital = await ctx.db.get(args.hospitalId);
    if (!hospital || hospital.userId !== user._id) {
      throw new Error("Hospital not found");
    }

    return await ctx.db.insert("hospitalSolutions", {
      hospitalId: args.hospitalId,
      userId: user._id,
      drugId: args.drugId,
      solutionId: args.solutionId,
      ampoules: args.ampoules,
      diluentVolume_mL: args.diluentVolume_mL,
      diluent: args.diluent,
      totalVolume_mL: args.totalVolume_mL,
      totalDrug_mg: args.totalDrug_mg,
      concentration_mcg_per_mL: args.concentration_mcg_per_mL,
      label: args.label,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const updateSolution = mutation({
  args: {
    solutionId: v.id("hospitalSolutions"),
    ampoules: v.optional(v.number()),
    diluentVolume_mL: v.optional(v.number()),
    diluent: v.optional(v.union(v.literal("SG5"), v.literal("SF09"))),
    totalVolume_mL: v.optional(v.number()),
    totalDrug_mg: v.optional(v.number()),
    concentration_mcg_per_mL: v.optional(v.number()),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const solution = await ctx.db.get(args.solutionId);
    if (!solution || solution.userId !== user._id) {
      throw new Error("Solution not found");
    }

    const updates: Record<string, any> = {};
    if (args.ampoules !== undefined) updates.ampoules = args.ampoules;
    if (args.diluentVolume_mL !== undefined)
      updates.diluentVolume_mL = args.diluentVolume_mL;
    if (args.diluent !== undefined) updates.diluent = args.diluent;
    if (args.totalVolume_mL !== undefined)
      updates.totalVolume_mL = args.totalVolume_mL;
    if (args.totalDrug_mg !== undefined)
      updates.totalDrug_mg = args.totalDrug_mg;
    if (args.concentration_mcg_per_mL !== undefined)
      updates.concentration_mcg_per_mL = args.concentration_mcg_per_mL;
    if (args.label !== undefined) updates.label = args.label;

    await ctx.db.patch(args.solutionId, updates);
  },
});

export const toggleSolution = mutation({
  args: {
    solutionId: v.id("hospitalSolutions"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const solution = await ctx.db.get(args.solutionId);
    if (!solution || solution.userId !== user._id) {
      throw new Error("Solution not found");
    }

    await ctx.db.patch(args.solutionId, { isActive: !solution.isActive });
  },
});

export const deleteSolution = mutation({
  args: {
    solutionId: v.id("hospitalSolutions"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const solution = await ctx.db.get(args.solutionId);
    if (!solution || solution.userId !== user._id) {
      throw new Error("Solution not found");
    }

    await ctx.db.delete(args.solutionId);
  },
});
