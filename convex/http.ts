import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/revenuecat-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const event = body.event;
    const appUserId = event.app_user_id;

    let status: "premium" | "expired" | "free";
    let expiresAt: number | undefined;

    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "PRODUCT_CHANGE":
      case "UNCANCELLATION":
        status = "premium";
        expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).getTime()
          : undefined;
        break;
      case "CANCELLATION":
      case "EXPIRATION":
      case "BILLING_ISSUE":
        status = "expired";
        expiresAt = undefined;
        break;
      default:
        return new Response("OK", { status: 200 });
    }

    await ctx.runMutation(internal.users.updateSubscription, {
      revenuecatCustomerId: appUserId,
      subscriptionStatus: status,
      subscriptionExpiresAt: expiresAt,
    });

    return new Response("OK", { status: 200 });
  }),
});

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): Promise<boolean> {
  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(",")) {
    const [k, v] = segment.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - ts) > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const computed = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computed.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !secret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await request.text();
    const ok = await verifyStripeSignature(payload, signature, secret);
    if (!ok) return new Response("Invalid signature", { status: 401 });

    const event = JSON.parse(payload);
    const obj = event.data?.object;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const status: string = obj.status;
        const customerId: string =
          typeof obj.customer === "string" ? obj.customer : obj.customer?.id;
        if (!customerId) break;

        let subscriptionStatus: "premium" | "expired" | "free";
        if (status === "trialing" || status === "active") {
          subscriptionStatus = "premium";
        } else {
          subscriptionStatus = "expired";
        }

        const periodEnd: number | undefined = obj.current_period_end;
        const expiresAt = periodEnd ? periodEnd * 1000 : undefined;

        await ctx.runMutation(internal.users.updateStripeSubscription, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: obj.id,
          subscriptionStatus,
          subscriptionExpiresAt: expiresAt,
        });
        break;
      }
      default:
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
