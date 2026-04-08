import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { usePumpStore } from "@/store/usePumpStore";
import { getDrugById } from "@/constants/drugs";
import { useTheme } from "@/hooks/useThemeContext";
import PixelText from "@/components/ui/PixelText";

const DOSE_RANGE_KEYS = ["doseRange.low", "doseRange.moderate", "doseRange.high", "doseRange.veryHigh"];

export default function ReferenceScreen() {
  const { t } = useTranslation();
  const { t: tDrugs } = useTranslation("drugs");
  const { colors } = useTheme();
  const selectedDrugId = usePumpStore((s) => s.selectedDrugId);
  const drug = getDrugById(selectedDrugId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <PixelText variant="title" style={[styles.title, { color: colors.accent }]}>
            {t("reference.title")}
          </PixelText>
          <PixelText variant="lcd" style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("reference.subtitle", { drugName: drug.name })}
          </PixelText>
        </View>

        {/* Dose Ranges */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <PixelText variant="title" style={[styles.cardTitle, { color: colors.lcdTextAccent }]}>
            {t("reference.therapeuticRanges", { doseUnit: drug.doseUnit })}
          </PixelText>
          {drug.doseRanges.map((range, i) => (
            <View key={i} style={styles.rangeRow}>
              <View style={[styles.rangeDot, { backgroundColor: range.color }]} />
              <View style={styles.rangeInfo}>
                <PixelText variant="lcd" style={[styles.rangeLabel, { color: range.color }]}>
                  {tDrugs(DOSE_RANGE_KEYS[i])}
                </PixelText>
                <PixelText variant="lcd" style={[styles.rangeValue, { color: colors.textSecondary }]}>
                  {range.max === Infinity
                    ? `> ${range.min} ${drug.doseUnit}`
                    : `${range.min} - ${range.max} ${drug.doseUnit}`}
                </PixelText>
              </View>
            </View>
          ))}
        </View>

        {/* Dilutions */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <PixelText variant="title" style={[styles.cardTitle, { color: colors.lcdTextAccent }]}>
            {t("reference.availableDilutions")}
          </PixelText>
          {drug.solutions.map((sol) => (
            <View key={sol.id} style={[styles.dilutionRow, { borderBottomColor: colors.separator }]}>
              <View>
                <PixelText variant="lcd" style={[styles.dilutionLabel, { color: colors.textPrimary }]}>
                  {sol.label}
                </PixelText>
                <PixelText variant="lcd" style={[styles.dilutionName, { color: colors.textMuted }]}>
                  {sol.shortName}
                </PixelText>
              </View>
              <PixelText variant="lcd" style={[styles.dilutionConc, { color: colors.textSecondary }]}>
                {sol.concentration_mcg_per_mL} {drug.usesWeight ? "mcg/mL" : "U/mL"}
              </PixelText>
            </View>
          ))}
        </View>

        {/* Formula */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <PixelText variant="title" style={[styles.cardTitle, { color: colors.lcdTextAccent }]}>
            {t("reference.calculationFormula")}
          </PixelText>
          <PixelText variant="lcd" style={[styles.formula, { color: colors.textPrimary }]}>
            {t("reference.doseEquals", { doseUnit: drug.doseUnit })}
          </PixelText>
          <PixelText variant="lcd" style={[styles.formula, { color: colors.textPrimary }]}>
            {drug.usesWeight ? t("reference.formulaFlowConc") : t("reference.formulaConcUnit")}
          </PixelText>
          <PixelText variant="lcd" style={[styles.formulaDivider, { color: colors.textSecondary }]}>
            ─────────────────────────────
          </PixelText>
          <PixelText variant="lcd" style={[styles.formula, { color: colors.textPrimary }]}>
            {drug.usesWeight ? t("reference.formulaWeightDivisor") : "60"}
          </PixelText>
        </View>

        {/* Clinical Notes */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <PixelText variant="title" style={[styles.cardTitle, { color: colors.lcdTextAccent }]}>
            {t("reference.clinicalNotes")}
          </PixelText>
          {drug.clinicalNotes.map((_, i) => (
            <PixelText key={i} variant="lcd" style={[styles.note, { color: colors.textSecondary }]}>
              {"\u2022"} {tDrugs(`${drug.id}.clinicalNotes.${i}`)}
            </PixelText>
          ))}
        </View>

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
  header: { marginBottom: 20 },
  title: { fontSize: 10, marginBottom: 4 },
  subtitle: { fontSize: 14 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 7, marginBottom: 12, letterSpacing: 1 },
  rangeRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rangeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  rangeInfo: { flex: 1 },
  rangeLabel: { fontSize: 18, fontWeight: "600" },
  rangeValue: { fontSize: 16 },
  dilutionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1 },
  dilutionLabel: { fontSize: 20 },
  dilutionName: { fontSize: 13, marginTop: 2 },
  dilutionConc: { fontSize: 18 },
  formula: { fontSize: 18, textAlign: "center" },
  formulaDivider: { fontSize: 14, textAlign: "center" },
  note: { fontSize: 16, marginBottom: 8, lineHeight: 22 },
  disclaimer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, alignItems: "center" },
  disclaimerText: { fontSize: 14, textAlign: "center" },
});
