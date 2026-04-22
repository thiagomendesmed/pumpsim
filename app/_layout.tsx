import "react-native-get-random-values";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import { VT323_400Regular } from "@expo-google-fonts/vt323";
import {
  Silkscreen_400Regular,
  Silkscreen_700Bold,
} from "@expo-google-fonts/silkscreen";
import * as SplashScreen from "expo-splash-screen";
import { convex } from "@/lib/convex";
import { initI18n } from "@/lib/i18n";
import { initPurchases } from "@/lib/purchases";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useClerkUserSync } from "@/hooks/useClerkUserSync";
import { ThemeProvider, useTheme } from "@/hooks/useThemeContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function RootContent() {
  const { colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}

function SubscriptionManager() {
  const { checkStatus, startListening, loadCachedStatus } = useSubscriptionStore();
  useClerkUserSync();

  useEffect(() => {
    loadCachedStatus().then(() => checkStatus());
    startListening();
  }, []);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    VT323_400Regular,
    Silkscreen_400Regular,
    Silkscreen_700Bold,
  });
  const [i18nReady, setI18nReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initI18n()
      .then(() => setI18nReady(true))
      .catch((e) => setInitError(`i18n: ${e.message}`));
  }, []);

  useEffect(() => {
    initPurchases().catch((e) =>
      console.warn("RevenueCat init error:", e)
    );
  }, []);

  useEffect(() => {
    if (fontsLoaded && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, i18nReady]);

  if (initError) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f0f1e", justifyContent: "center", padding: 32 }}>
        <Text style={{ color: "#ef4444", fontSize: 20, marginBottom: 12 }}>Init Error</Text>
        <Text style={{ color: "#fff", fontSize: 14 }}>{initError}</Text>
        <Text style={{ color: "#888", fontSize: 12, marginTop: 16 }}>
          CONVEX_URL: {process.env.EXPO_PUBLIC_CONVEX_URL ?? "NOT SET"}{"\n"}
          RC_KEY: {process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ? "SET" : "NOT SET"}{"\n"}
          CLERK_KEY: {publishableKey ? "SET" : "NOT SET"}
        </Text>
      </View>
    );
  }

  if (!publishableKey) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f0f1e", justifyContent: "center", padding: 32 }}>
        <Text style={{ color: "#ef4444", fontSize: 20, marginBottom: 12 }}>
          Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
        </Text>
      </View>
    );
  }

  if (!fontsLoaded || !i18nReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}
        signInUrl="/(auth)/login"
        signUpUrl="/(auth)/login"
        signInFallbackRedirectUrl="/(tabs)"
        signUpFallbackRedirectUrl="/(tabs)"
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider>
            <SubscriptionManager />
            <RootContent />
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
