import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSSO, useClerk } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeSwitch from "@/components/ui/ThemeSwitch";

WebBrowser.maybeCompleteAuthSession();

type Strategy = "oauth_apple" | "oauth_google";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  const [loadingStrategy, setLoadingStrategy] = useState<Strategy | null>(null);

  const handleOAuth = async (strategy: Strategy) => {
    if (loadingStrategy) return;
    setLoadingStrategy(strategy);
    try {
      if (Platform.OS === "web") {
        const signIn = clerk?.client?.signIn;
        if (!signIn) {
          throw new Error("Clerk signIn not ready");
        }
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: `${window.location.origin}/sso-callback`,
          redirectUrlComplete: `${window.location.origin}/`,
        });
        return;
      }

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("/sso-callback"),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      if (error?.code === "ERR_REQUEST_CANCELED") return;
      console.warn("OAuth error:", error);
      Alert.alert(t("alert.error"), t("alert.loginFailed"));
    } finally {
      setLoadingStrategy(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.themeToggle}>
        <ThemeSwitch />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.accent }]}>{t("app.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("app.subtitle")}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.appleButton, loadingStrategy === "oauth_apple" && styles.buttonDisabled]}
          onPress={() => handleOAuth("oauth_apple")}
          disabled={loadingStrategy !== null}
        >
          <Text style={styles.appleButtonText}>{t("login.signInApple")}</Text>
        </Pressable>

        <Pressable
          style={[styles.googleButton, loadingStrategy === "oauth_google" && styles.buttonDisabled]}
          onPress={() => handleOAuth("oauth_google")}
          disabled={loadingStrategy !== null}
        >
          <Text style={styles.googleButtonText}>{t("login.signInGoogle")}</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => router.replace("/(tabs)")}>
          <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>{t("login.skipAccount")}</Text>
        </Pressable>

        <View nativeID="clerk-captcha" style={styles.captchaContainer} />

        <LanguageSelector />

        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>{t("login.disclaimer")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  themeToggle: { position: "absolute", top: 60, right: 24 },
  header: { alignItems: "center", marginBottom: 60 },
  title: { fontFamily: FONTS.title, fontSize: 24, marginBottom: 12 },
  subtitle: { fontFamily: FONTS.label, fontSize: 14, textAlign: "center" },
  buttonContainer: { width: "100%", gap: 12 },
  appleButton: { width: "100%", height: 52, backgroundColor: "#ffffff", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  appleButtonText: { fontFamily: FONTS.label, fontSize: 16, color: "#000000" },
  googleButton: { width: "100%", height: 52, backgroundColor: "#4285F4", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  googleButtonText: { fontFamily: FONTS.label, fontSize: 16, color: "#ffffff" },
  buttonDisabled: { opacity: 0.5 },
  skipButton: { width: "100%", height: 48, justifyContent: "center", alignItems: "center", marginTop: 8 },
  skipButtonText: { fontFamily: FONTS.label, fontSize: 14, textDecorationLine: "underline" },
  captchaContainer: { width: "100%", alignItems: "center", marginVertical: 8, minHeight: 0 },
  disclaimer: { fontFamily: FONTS.label, fontSize: 11, textAlign: "center", marginTop: 8, lineHeight: 16 },
});
