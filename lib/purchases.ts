import { Platform } from "react-native";

// Lazy import to avoid crashing in Expo Go
function getPurchases() {
  return require("react-native-purchases").default as typeof import("react-native-purchases").default;
}

// TODO: replace with your actual RevenueCat API keys
const API_KEYS = {
  ios: "appl_XXXXXXXXXXXX",
  android: "goog_XXXXXXXXXXXX",
};

const PREMIUM_ENTITLEMENT = "premium";

export async function initPurchases(appUserID?: string) {
  try {
    const Purchases = getPurchases();
    const apiKey = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;
    Purchases.configure({ apiKey, appUserID });
  } catch {
    // Native module not available (Expo Go)
    console.warn("RevenueCat not available — native build required");
  }
}

export async function getOfferings() {
  const Purchases = getPurchases();
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchaseMonthly() {
  const Purchases = getPurchases();
  const offerings = await Purchases.getOfferings();
  const monthly = offerings.current?.monthly;
  if (!monthly) throw new Error("No monthly offering found");

  const { customerInfo } = await Purchases.purchasePackage(monthly);
  return customerInfo;
}

export async function purchaseAnnual() {
  const Purchases = getPurchases();
  const offerings = await Purchases.getOfferings();
  const annual = offerings.current?.annual;
  if (!annual) throw new Error("No annual offering found");

  const { customerInfo } = await Purchases.purchasePackage(annual);
  return customerInfo;
}

export async function restorePurchases() {
  const Purchases = getPurchases();
  return await Purchases.restorePurchases();
}

export async function checkIsPremium(): Promise<boolean> {
  try {
    const Purchases = getPurchases();
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
  } catch {
    return false;
  }
}

export async function getCustomerInfo() {
  const Purchases = getPurchases();
  return await Purchases.getCustomerInfo();
}
