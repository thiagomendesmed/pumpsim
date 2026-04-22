import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const STRIPE_API = "https://api.stripe.com/v1";

async function stripeRequest(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, string>
) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY not configured");

  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Stripe API error (${response.status}): ${
        data?.error?.message ?? JSON.stringify(data)
      }`
    );
  }
  return data;
}

export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    const guard = await ctx.runQuery(api.users.canSubscribe, {
      requestedProvider: "stripe",
    });
    if (!guard.canSubscribe) {
      throw new Error(
        `Assinatura ativa já existe via ${guard.activeProvider ?? "outro provedor"}`
      );
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeRequest("/customers", "POST", {
        email: user.email,
        "metadata[convexUserId]": user._id,
      });
      customerId = customer.id as string;
      await ctx.runMutation(api.users.setStripeCustomerId, {
        stripeCustomerId: customerId,
      });
    }

    const session = await stripeRequest("/checkout/sessions", "POST", {
      mode: "subscription",
      customer: customerId,
      "line_items[0][price]": args.priceId,
      "line_items[0][quantity]": "1",
      "subscription_data[trial_period_days]": "7",
      client_reference_id: user._id,
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      allow_promotion_codes: "true",
    });

    return { url: session.url as string };
  },
});

export const createBillingPortalSession = action({
  args: {
    returnUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user?.stripeCustomerId) {
      throw new Error("Stripe customer not found");
    }

    const session = await stripeRequest("/billing_portal/sessions", "POST", {
      customer: user.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return { url: session.url as string };
  },
});
