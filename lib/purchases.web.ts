/**
 * Web stubs for RevenueCat. Subscriptions on web use Stripe; these are no-ops
 * so code paths shared with native don't crash when bundled for the browser.
 */

type CustomerInfo = {
  entitlements: { active: Record<string, unknown> };
};

export const ENTITLEMENT_ID = "pumpsim Premium";

export async function initPurchases(_appUserID?: string): Promise<void> {
  return;
}

export async function loginUser(_appUserID: string): Promise<CustomerInfo> {
  return { entitlements: { active: {} } };
}

export async function logoutUser(): Promise<void> {
  return;
}

export async function getOfferings(): Promise<null> {
  return null;
}

export async function purchaseMonthly(): Promise<CustomerInfo> {
  throw new Error("Purchases on web use Stripe (not yet implemented)");
}

export async function purchaseAnnual(): Promise<CustomerInfo> {
  throw new Error("Purchases on web use Stripe (not yet implemented)");
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return { entitlements: { active: {} } };
}

export function isPremiumFromInfo(_customerInfo: CustomerInfo): boolean {
  return false;
}

export async function checkIsPremium(): Promise<boolean> {
  return false;
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return { entitlements: { active: {} } };
}

export function addCustomerInfoListener(
  _listener: (info: CustomerInfo) => void
): void {
  return;
}
