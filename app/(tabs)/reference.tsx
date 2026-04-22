import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useThemeContext";
import PixelText from "@/components/ui/PixelText";
import ReferenceContent from "@/components/display/ReferenceContent";

export default function ReferenceScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ReferenceContent />
        <View style={[styles.disclaimer, { borderTopColor: colors.separator }]}>
          <PixelText variant="lcd" style={[styles.disclaimerText, { color: colors.textMuted }]}>
            {t("simulator.disclaimer1")}
          </PixelText>
          <PixelText variant="lcd" style={[styles.disclaimerText, { color: colors.textMuted }]}>
            {t("simulator.disclaimer2")}
          </PixelText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  disclaimer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, alignItems: "center" },
  disclaimerText: { fontSize: 14, textAlign: "center" },
});
