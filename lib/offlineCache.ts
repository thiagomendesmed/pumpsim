import AsyncStorage from "@react-native-async-storage/async-storage";

const SUBSCRIPTION_CACHE_KEY = "bombasim_subscription_cache";

interface CachedSubscription {
  isPremium: boolean;
  expiresAt: number | null;
  cachedAt: number;
}

export async function cacheSubscriptionStatus(
  isPremium: boolean,
  expiresAt: number | null
): Promise<void> {
  const data: CachedSubscription = {
    isPremium,
    expiresAt,
    cachedAt: Date.now(),
  };
  await AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(data));
}

export async function getCachedSubscriptionStatus(): Promise<{
  isPremium: boolean;
  expiresAt: number | null;
}> {
  try {
    const raw = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (!raw) return { isPremium: false, expiresAt: null };

    const data: CachedSubscription = JSON.parse(raw);

    // If premium has expired, return false
    if (data.isPremium && data.expiresAt && Date.now() > data.expiresAt) {
      return { isPremium: false, expiresAt: null };
    }

    return { isPremium: data.isPremium, expiresAt: data.expiresAt };
  } catch {
    return { isPremium: false, expiresAt: null };
  }
}

export async function clearSubscriptionCache(): Promise<void> {
  await AsyncStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
}
