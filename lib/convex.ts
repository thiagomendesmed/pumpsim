import { ConvexReactClient } from "convex/react";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("EXPO_PUBLIC_CONVEX_URL is not set");
}

export const convex = new ConvexReactClient(CONVEX_URL ?? "https://placeholder.convex.cloud");
