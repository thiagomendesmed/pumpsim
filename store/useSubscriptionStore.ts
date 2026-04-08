import { create } from "zustand";
import {
  checkIsPremium,
  purchaseMonthly as purchaseMonthlyLib,
  purchaseAnnual as purchaseAnnualLib,
  restorePurchases as restorePurchasesLib,
  isPremiumFromInfo,
  addCustomerInfoListener,
} from "@/lib/purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUBSCRIPTION_CACHE_KEY = "bombasim_subscription_cache";

interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  __devOverride: boolean | null;

  checkStatus: () => Promise<void>;
  purchaseMonthly: () => Promise<void>;
  purchaseAnnual: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  loadCachedStatus: () => Promise<void>;
  startListening: () => void;
  __toggleDevOverride: () => void;
}

async function cacheStatus(isPremium: boolean) {
  await AsyncStorage.setItem(
    SUBSCRIPTION_CACHE_KEY,
    JSON.stringify({ isPremium, cachedAt: Date.now() })
  );
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPremium: false,
  isLoading: true,
  __devOverride: null,

  checkStatus: async () => {
    try {
      const isPremium = await checkIsPremium();
      set({ isPremium, isLoading: false });
      await cacheStatus(isPremium);
    } catch {
      set({ isLoading: false });
    }
  },

  purchaseMonthly: async () => {
    const customerInfo = await purchaseMonthlyLib();
    const isPremium = isPremiumFromInfo(customerInfo);
    set({ isPremium });
    await cacheStatus(isPremium);
  },

  purchaseAnnual: async () => {
    const customerInfo = await purchaseAnnualLib();
    const isPremium = isPremiumFromInfo(customerInfo);
    set({ isPremium });
    await cacheStatus(isPremium);
  },

  restorePurchases: async () => {
    const customerInfo = await restorePurchasesLib();
    const isPremium = isPremiumFromInfo(customerInfo);
    set({ isPremium });
    await cacheStatus(isPremium);
  },

  startListening: () => {
    addCustomerInfoListener((info) => {
      const isPremium = isPremiumFromInfo(info);
      set({ isPremium });
      cacheStatus(isPremium);
    });
  },

  __toggleDevOverride: () => {
    const current = get().__devOverride;
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
