import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { usePumpStore } from "@/store/usePumpStore";
import { getDrugById } from "@/constants/drugs";
import { useTheme } from "@/hooks/useThemeContext";
import { useIsWide } from "@/hooks/useResponsive";
import PixelText from "@/components/ui/PixelText";
import PumpBody from "@/components/pump/PumpBody";
import DrugSwitcher from "@/components/inputs/DrugSwitcher";
import FlowRateInput from "@/components/inputs/FlowRateInput";
import WeightInput from "@/components/inputs/WeightInput";
import DoseReferenceTable from "@/components/display/DoseReferenceTable";
import ReferenceContent from "@/components/display/ReferenceContent";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import DevPremiumSwitch from "@/components/ui/DevPremiumSwitch";
import LogoutButton from "@/components/ui/LogoutButton";

export default function SimulatorScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isWide = useIsWide();
  const isRunning = usePumpStore((s) => s.isRunning);
  const flowRate = usePumpStore((s) => s.flowRate);
  const tick = usePumpStore((s) => s.tick);
  const selectedDrugId = usePumpStore((s) => s.selectedDrugId);
  const drug = getDrugById(selectedDrugId);

  useEffect(() => {
    if (!isRunning || flowRate <= 0) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, flowRate, tick]);

  const header = (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <PixelText variant="title" style={[styles.title, { color: colors.accent }]}>
            {t("simulator.title")}
          </PixelText>
          <PixelText variant="lcd" style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("simulator.subtitle", { drugName: drug.name })}
          </PixelText>
        </View>
        <View style={styles.switches}>
          <DevPremiumSwitch />
          <ThemeSwitch />
          <LogoutButton />
        </View>
      </View>
    </View>
  );

  const configSection = (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <PixelText variant="title" style={[styles.sectionTitle, { color: colors.accent }]}>
          {t("simulator.configuration")}
        </PixelText>
        <DrugSwitcher />
      </View>
      <FlowRateInput />
      {drug.usesWeight && <WeightInput />}
    </View>
  );

  const doseReferenceSection = (
    <View style={styles.section}>
      <PixelText variant="title" style={[styles.sectionTitle, { color: colors.accent }]}>
        {t("simulator.doseReference")}
      </PixelText>
      <DoseReferenceTable drugId={drug.id} doseRanges={drug.doseRanges} doseUnit={drug.doseUnit} />
    </View>
  );

  const disclaimer = (
    <View style={[styles.disclaimer, { borderTopColor: colors.separator }]}>
      <PixelText variant="lcd" style={[styles.disclaimerText, { color: colors.textMuted }]}>
        {t("simulator.disclaimer1")}
      </PixelText>
      <PixelText variant="lcd" style={[styles.disclaimerText, { color: colors.textMuted }]}>
        {t("simulator.disclaimer2")}
      </PixelText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        {isWide ? (
          <View style={styles.wideWrapper}>
            {header}
            <View style={styles.twoCol}>
              <View style={styles.colLeft}>
                <PumpBody />
                {configSection}
              </View>
              <View style={styles.colRight}>
                <ReferenceContent showHeader={false} />
              </View>
            </View>
            {disclaimer}
          </View>
        ) : (
          <>
            {header}
            <PumpBody />
            {configSection}
            {doseReferenceSection}
            {disclaimer}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  contentWide: { padding: 32, paddingBottom: 48, alignItems: "center" },
  wideWrapper: { width: "100%", maxWidth: 1280 },
  twoCol: { flexDirection: "row", gap: 32, alignItems: "flex-start" },
  colLeft: { flex: 1.2 },
  colRight: { flex: 1 },
  header: { marginBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  switches: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerText: { flex: 1 },
  title: { fontSize: 10, marginBottom: 4 },
  subtitle: { fontSize: 14 },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 8, letterSpacing: 1 },
  disclaimer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: "center",
  },
  disclaimerText: { fontSize: 14, textAlign: "center" },
});
