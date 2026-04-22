import { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useClerk } from "@clerk/expo";
import { THEME } from "@/constants/theme";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (Platform.OS === "web") {
      const anyClerk = clerk as any;
      if (anyClerk?.handleRedirectCallback) {
        anyClerk
          .handleRedirectCallback({
            redirectUrl: "/",
            signInFallbackRedirectUrl: "/",
            signUpFallbackRedirectUrl: "/",
          })
          .catch((err: unknown) => {
            console.warn("SSO callback error:", err);
            router.replace("/(auth)/login");
          });
        return;
      }
    }

    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isLoaded, isSignedIn, clerk, router]);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={THEME.accent} />
      <View nativeID="clerk-captcha" style={{ marginTop: 24 }} />
    </View>
  );
}
