import { Link, Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useThemeContext";
import PixelText from "@/components/ui/PixelText";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PixelText variant="title" style={{ color: colors.textPrimary, fontSize: 10 }}>
          {t("notFound.title")}
        </PixelText>
        <Link href="/" style={styles.link}>
          <PixelText variant="lcd" style={{ color: colors.accent, fontSize: 18 }}>
            {t("notFound.back")}
          </PixelText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  link: { marginTop: 16 },
});
