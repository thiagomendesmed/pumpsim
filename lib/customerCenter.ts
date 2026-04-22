import RevenueCatUI from "react-native-purchases-ui";

export async function openCustomerCenter(): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch {
    // User dismissed or not available
  }
}
