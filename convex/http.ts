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

export default http;
