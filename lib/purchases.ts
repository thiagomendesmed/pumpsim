import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";

const API_KEY = "test_aUZWfeBUOYJztYpamtrKCmzrkAv";
const ENTITLEMENT_ID = "pumpsim Premium";

let isConfigured = false;

/**
 * Initialize RevenueCat SDK. Call once at app startup.
 */
export async function initPurchases(appUserID?: string): Promise<void> {
  if (isConfigured) return;
  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey: API_KEY, appUserID });
    isConfigured = true;
  } catch (error) {
    console.warn("RevenueCat init failed:", error);
  }
}

/**
 * Identify user after login (links anonymous purchases to account).
 */
export async function loginUser(appUserID: string): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.logIn(appUserID);
  return customerInfo;
}

/**
 * Logout user (resets to anonymous).
 */
export async function logoutUser(): Promise<void> {
  await Purchases.logOut();
}

/**
 * Get current offerings (products available for purchase).
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

/**
 * Purchase the monthly package from the current offering.
 */
export async function purchaseMonthly(): Promise<CustomerInfo> {
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
  return await Purchases.getCustomerInfo();
}

/**
 * Add a listener for customer info changes (subscription updates).
 * This is a persistent listener — call once at app startup.
 */
export function addCustomerInfoListener(
  listener: (info: CustomerInfo) => void
): void {
  Purchases.addCustomerInfoUpdateListener(listener);
}

export { ENTITLEMENT_ID };
