import { View, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { changeLanguage } from "@/lib/i18n";
import { useTheme } from "@/hooks/useThemeContext";
import PixelText from "@/components/ui/PixelText";

const LANGUAGES = ["pt", "en", "es"] as const;

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const currentLang = i18n.language;

  const handleSelect = async (lang: string) => {
    if (lang === currentLang) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      {LANGUAGES.map((lang) => {
        const isSelected = currentLang === lang;
        return (
          <Pressable
            key={lang}
            style={[
              styles.button,
              { borderColor: colors.inputBorder, backgroundColor: colors.cardBackground },
              isSelected && { borderColor: colors.accent, backgroundColor: `${colors.accent}1A` },
            ]}
            onPress={() => handleSelect(lang)}
          >
            <PixelText
              variant="label"
              style={{ fontSize: 13, color: isSelected ? colors.accent : colors.textMuted }}
            >
              {lang.toUpperCase()}
            </PixelText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16 },
  button: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
});
