import "react-native-get-random-values";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ConvexProvider } from "convex/react";
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
import { ThemeProvider, useTheme } from "@/hooks/useThemeContext";

SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    // Load cached status first for instant UI, then check real status
    loadCachedStatus().then(() => checkStatus());

    // Listen for real-time subscription changes
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

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    // Initialize RevenueCat as early as possible
    initPurchases();
  }, []);

  useEffect(() => {
    if (fontsLoaded && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, i18nReady]);

  if (!fontsLoaded || !i18nReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <ConvexProvider client={convex}>
        <SubscriptionManager />
        <RootContent />
      </ConvexProvider>
    </ThemeProvider>
  );
}
