import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    authProvider: v.literal("apple"),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("expired")
    ),
    subscriptionExpiresAt: v.optional(v.number()),
    revenuecatCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_revenuecat", ["revenuecatCustomerId"]),

  patients: defineTable({
    userId: v.id("users"),
    bedNumber: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  pumps: defineTable({
    patientId: v.id("patients"),
    userId: v.id("users"),
    drugId: v.string(),
    dilutionId: v.string(),
    flowRate: v.number(),
    weight: v.optional(v.number()),
    isRunning: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_user", ["userId"]),

  hospitals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  hospitalSolutions: defineTable({
    hospitalId: v.id("hospitals"),
    userId: v.id("users"),
    drugId: v.string(),
    solutionId: v.string(),
    ampoules: v.number(),
    diluentVolume_mL: v.number(),
    diluent: v.union(v.literal("SG5"), v.literal("SF09")),
    totalVolume_mL: v.number(),
    totalDrug_mg: v.number(),
    concentration_mcg_per_mL: v.number(),
    label: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_hospital", ["hospitalId"])
    .index("by_hospital_drug", ["hospitalId", "drugId"])
    .index("by_user", ["userId"]),
});
