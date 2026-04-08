import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeSwitch from "@/components/ui/ThemeSwitch";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { signIn, isLoading } = useAuthStore();

  const handleSignIn = async () => {
    try {
      await signIn();
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") return;
      Alert.alert(t("alert.error"), t("alert.loginFailed"));
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
        <Pressable style={styles.appleButton} onPress={handleSignIn} disabled={isLoading}>
          <Text style={styles.appleButtonText}>{t("login.signInApple")}</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => router.replace("/(tabs)")}>
          <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>{t("login.skipAccount")}</Text>
        </Pressable>

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
  buttonContainer: { width: "100%", gap: 16 },
  appleButton: { width: "100%", height: 52, backgroundColor: "#ffffff", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  appleButtonText: { fontFamily: FONTS.label, fontSize: 16, color: "#000000" },
  skipButton: { width: "100%", height: 48, justifyContent: "center", alignItems: "center", marginTop: 8 },
  skipButtonText: { fontFamily: FONTS.label, fontSize: 14, textDecorationLine: "underline" },
  disclaimer: { fontFamily: FONTS.label, fontSize: 11, textAlign: "center", marginTop: 8, lineHeight: 16 },
});
