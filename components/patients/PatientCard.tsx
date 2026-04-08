import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { THEME, FONTS } from "@/constants/theme";

interface PatientCardProps {
  patient: {
    _id: string;
    bedNumber: string;
    name?: string;
    createdAt: number;
  };
  onPress: () => void;
}

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.bedBadge}>
        <Text style={styles.bedBadgeText}>{patient.bedNumber}</Text>
      </View>
      <View style={styles.info}>
        {patient.name ? (
          <Text style={styles.name}>{patient.name}</Text>
        ) : (
          <Text style={styles.noName}>{t("patients.noName")}</Text>
        )}
        <Text style={styles.detail}>{t("patients.tapToViewPumps")}</Text>
      </View>
      <Text style={styles.arrow}>{"\u203A"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1,
    borderColor: THEME.inputBorder, borderRadius: 12, padding: 16, marginBottom: 10,
  },
  bedBadge: { backgroundColor: THEME.lcdBackground, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginRight: 14 },
  bedBadgeText: { fontFamily: FONTS.lcd, fontSize: 16, color: THEME.lcdText },
  info: { flex: 1 },
  name: { fontFamily: FONTS.label, fontSize: 14, color: "#ffffff" },
  noName: { fontFamily: FONTS.label, fontSize: 14, color: "#666", fontStyle: "italic" },
  detail: { fontFamily: FONTS.label, fontSize: 11, color: THEME.lcdTextDim, marginTop: 2 },
  arrow: { fontFamily: FONTS.lcd, fontSize: 28, color: THEME.lcdTextDim },
});
