import { create } from "zustand";
import {
  checkIsPremium,
  purchaseMonthly,
  purchaseAnnual,
  restorePurchases as restorePurchasesLib,
} from "@/lib/purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUBSCRIPTION_CACHE_KEY = "bombasim_subscription_cache";

interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  __devOverride: boolean | null; // DEV ONLY: null = use real status, true/false = override

  checkStatus: () => Promise<void>;
  purchaseMonthly: () => Promise<void>;
  purchaseAnnual: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  loadCachedStatus: () => Promise<void>;
  __toggleDevOverride: () => void; // DEV ONLY
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPremium: false,
  isLoading: true,
  __devOverride: null,

  checkStatus: async () => {
    try {
      const isPremium = await checkIsPremium();
      set({ isPremium, isLoading: false });

      // Cache status for offline use
      await AsyncStorage.setItem(
        SUBSCRIPTION_CACHE_KEY,
        JSON.stringify({ isPremium, cachedAt: Date.now() })
      );
    } catch {
      set({ isLoading: false });
    }
  },

  purchaseMonthly: async () => {
    const customerInfo = await purchaseMonthly();
    const isPremium =
      customerInfo.entitlements.active["premium"] !== undefined;
    set({ isPremium });

    await AsyncStorage.setItem(
      SUBSCRIPTION_CACHE_KEY,
      JSON.stringify({ isPremium, cachedAt: Date.now() })
    );
  },

  purchaseAnnual: async () => {
    const customerInfo = await purchaseAnnual();
    const isPremium =
      customerInfo.entitlements.active["premium"] !== undefined;
    set({ isPremium });

    await AsyncStorage.setItem(
      SUBSCRIPTION_CACHE_KEY,
      JSON.stringify({ isPremium, cachedAt: Date.now() })
    );
  },

  restorePurchases: async () => {
    const customerInfo = await restorePurchasesLib();
    const isPremium =
      customerInfo.entitlements.active["premium"] !== undefined;
    set({ isPremium });

    await AsyncStorage.setItem(
      SUBSCRIPTION_CACHE_KEY,
      JSON.stringify({ isPremium, cachedAt: Date.now() })
    );
  },

  __toggleDevOverride: () => {
    const current = get().__devOverride;
    // null -> true (premium), true -> false (free), false -> null (real)
    const next = current === null ? true : current === true ? false : null;
    set({ __devOverride: next });
  },

  loadCachedStatus: async () => {
    try {
      const cached = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
      if (cached) {
        const { isPremium } = JSON.parse(cached);
        set({ isPremium, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
