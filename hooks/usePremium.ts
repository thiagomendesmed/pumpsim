import { useState, useCallback } from "react";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

export function usePremium() {
  const { isPremium: realStatus, isLoading, __devOverride } = useSubscriptionStore();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const isPremium = __devOverride !== null ? __devOverride : realStatus;

  const showPaywall = useCallback(() => {
    setPaywallVisible(true);
  }, []);

  const hidePaywall = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  return {
    isPremium,
    isLoading,
    paywallVisible,
    showPaywall,
    hidePaywall,
  };
}
