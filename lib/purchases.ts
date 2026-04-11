import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";
import { Platform } from "react-native";

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? "";
const ENTITLEMENT_ID = "pumpsim Premium";
const IOS_PUBLIC_SDK_KEY_PREFIX = "appl_";
const SIMULATED_STORE_KEY_PREFIX = "test_";

let isConfigured = false;
const pendingCustomerInfoListeners = new Set<
  (info: CustomerInfo) => void
>();

function getRevenueCatConfigurationIssue(apiKey: string): string | null {
  if (!apiKey) {
    return "RevenueCat API key not set";
  }

  if (!__DEV__ && apiKey.startsWith(SIMULATED_STORE_KEY_PREFIX)) {
    return "RevenueCat simulated-store API key cannot be used in release builds";
  }

  if (
    Platform.OS === "ios" &&
    !apiKey.startsWith(IOS_PUBLIC_SDK_KEY_PREFIX) &&
    !apiKey.startsWith(SIMULATED_STORE_KEY_PREFIX)
  ) {
    return `RevenueCat iOS API key must start with \"${IOS_PUBLIC_SDK_KEY_PREFIX}\"`;
  }

  return null;
}

function ensureConfigured(): void {
  if (!isConfigured) {
    throw new Error("RevenueCat has not been initialized");
  }
}

/**
 * Initialize RevenueCat SDK. Call once at app startup.
 */
export async function initPurchases(appUserID?: string): Promise<void> {
  if (isConfigured) return;

  const configurationIssue = getRevenueCatConfigurationIssue(API_KEY);
  if (configurationIssue) {
    console.warn(`${configurationIssue} — skipping RevenueCat init`);
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey: API_KEY, appUserID });
    pendingCustomerInfoListeners.forEach((listener) => {
      Purchases.addCustomerInfoUpdateListener(listener);
    });
    pendingCustomerInfoListeners.clear();
    isConfigured = true;
  } catch (error) {
    console.warn("RevenueCat init failed:", error);
  }
}

/**
 * Identify user after login (links anonymous purchases to account).
 */
export async function loginUser(appUserID: string): Promise<CustomerInfo> {
  ensureConfigured();
  const { customerInfo } = await Purchases.logIn(appUserID);
  return customerInfo;
}

/**
 * Logout user (resets to anonymous).
 */
export async function logoutUser(): Promise<void> {
  ensureConfigured();
  await Purchases.logOut();
}

/**
 * Get current offerings (products available for purchase).
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  ensureConfigured();
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

/**
 * Purchase the monthly package from the current offering.
 */
export async function purchaseMonthly(): Promise<CustomerInfo> {
  ensureConfigured();
  const offerings = await Purchases.getOfferings();
  const monthly = offerings.current?.monthly;
  if (!monthly) throw new Error("No monthly package available");

  const { customerInfo } = await Purchases.purchasePackage(monthly);
  return customerInfo;
}

/**
 * Purchase the annual package from the current offering.
 */
export async function purchaseAnnual(): Promise<CustomerInfo> {
  ensureConfigured();
  const offerings = await Purchases.getOfferings();
  const annual = offerings.current?.annual;
  if (!annual) throw new Error("No annual package available");

  const { customerInfo } = await Purchases.purchasePackage(annual);
  return customerInfo;
}

/**
 * Restore previous purchases.
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  ensureConfigured();
  return await Purchases.restorePurchases();
}

/**
 * Check if user has active premium entitlement.
 */
export function isPremiumFromInfo(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

/**
 * Get customer info and check premium status.
 */
export async function checkIsPremium(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return isPremiumFromInfo(customerInfo);
  } catch {
    return false;
  }
}

/**
 * Get full customer info.
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  ensureConfigured();
  return await Purchases.getCustomerInfo();
}

/**
 * Add a listener for customer info changes (subscription updates).
 * This is a persistent listener — call once at app startup.
 */
export function addCustomerInfoListener(
  listener: (info: CustomerInfo) => void
): void {
  if (!isConfigured) {
    pendingCustomerInfoListeners.add(listener);
    return;
  }

  Purchases.addCustomerInfoUpdateListener(listener);
}

export { ENTITLEMENT_ID };
