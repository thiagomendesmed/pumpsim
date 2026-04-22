import { Pressable, Text, StyleSheet, Alert } from "react-native";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";

export default function LogoutButton() {
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!isSignedIn) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (e) {
      Alert.alert(t("alert.error"), (e as Error)?.message ?? "Logout failed");
    }
  };

  return (
    <Pressable
      onPress={handleLogout}
      style={[styles.button, { borderColor: colors.accent }]}
      accessibilityLabel="Sair"
    >
      <Text style={[styles.text, { color: colors.accent }]}>SAIR</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: FONTS.labelBold,
    fontSize: 11,
  },
});
