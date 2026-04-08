/**
 * Shared auth helpers for Convex mutations/queries.
 */

export async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

export async function requirePremium(ctx: any) {
  const user = await requireAuth(ctx);
  if (user.subscriptionStatus !== "premium") {
    throw new Error("Premium subscription required");
  }
  return user;
}
