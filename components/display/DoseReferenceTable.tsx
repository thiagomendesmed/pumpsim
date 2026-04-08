import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useThemeContext";
import { DoseRange } from "@/types";
import PixelText from "@/components/ui/PixelText";

const DOSE_RANGE_KEYS = ["doseRange.low", "doseRange.moderate", "doseRange.high", "doseRange.veryHigh"];

interface DoseReferenceTableProps {
  drugId?: string;
  doseRanges: DoseRange[];
  doseUnit: string;
}

export default function DoseReferenceTable({ drugId, doseRanges, doseUnit }: DoseReferenceTableProps) {
  const { t } = useTranslation();
  const { t: tDrugs } = useTranslation("drugs");
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {doseRanges.map((range, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: range.color }]} />
          <PixelText variant="lcd" style={[styles.rangeText, { color: colors.textSecondary }]}>
            {range.max === Infinity ? `> ${range.min}` : `${range.min} - ${range.max}`}
          </PixelText>
          <PixelText variant="lcd" style={[styles.label, { color: range.color }]}>
            {DOSE_RANGE_KEYS[i] ? tDrugs(DOSE_RANGE_KEYS[i]) : range.label}
          </PixelText>
        </View>
      ))}
      <PixelText variant="lcd" style={[styles.unit, { color: colors.textMuted }]}>
        {t("reference.inUnit", { doseUnit })}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rangeText: { fontSize: 15, width: 80 },
  label: { fontSize: 15, flex: 1 },
  unit: { fontSize: 13, marginTop: 4 },
});
