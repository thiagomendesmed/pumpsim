import React, { useState, useCallback, useMemo } from "react";
import { View, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { usePumpStore } from "@/store/usePumpStore";
import { DRUGS, getDrugById } from "@/constants/drugs";
import { useTheme } from "@/hooks/useThemeContext";
import PixelText from "@/components/ui/PixelText";
import { usePremium } from "@/hooks/usePremium";
import { PaywallModal } from "@/components/premium/PaywallModal";
import { DrugCategory } from "@/types";

const CATEGORY_ORDER: DrugCategory[] = [
  "vasopressor",
  "sedation",
  "analgesic",
  "neuromuscular_blocker",
  "vasodilator",
];

const CATEGORY_LABELS: Record<DrugCategory, string> = {
  vasopressor: "VASOPRESSORES",
  sedation: "SEDACAO",
  analgesic: "ANALGESICOS",
  neuromuscular_blocker: "BLOQUEADORES NEUROMUSCULARES",
  vasodilator: "VASODILATADORES",
};

export default function DrugSwitcher() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const selectedDrugId = usePumpStore((s) => s.selectedDrugId);
  const setDrug = usePumpStore((s) => s.setDrug);
  const drug = getDrugById(selectedDrugId);
  const [modalVisible, setModalVisible] = useState(false);
  const { isPremium, paywallVisible, showPaywall, hidePaywall } = usePremium();

  const groupedDrugs = useMemo(() => {
    const groups: { category: DrugCategory; label: string; drugs: typeof DRUGS }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const drugsInCat = DRUGS.filter((d) => d.category === cat);
      if (drugsInCat.length > 0) {
        groups.push({ category: cat, label: CATEGORY_LABELS[cat], drugs: drugsInCat });
      }
    }
    return groups;
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      const selectedDrug = DRUGS.find((d) => d.id === id);
      if (selectedDrug && !selectedDrug.isFree && !isPremium) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setModalVisible(false);
        showPaywall();
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setDrug(id);
      setModalVisible(false);
    },
    [setDrug, isPremium, showPaywall]
  );

  return (
    <>
      <Pressable
        style={[styles.trigger, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
      >
        <PixelText variant="lcd" style={{ color: colors.lcdTextAccent, fontSize: 16 }}>
          {drug.name}
        </PixelText>
        <PixelText variant="lcd" style={{ color: colors.textMuted, fontSize: 12 }}>
          {" \u25BC"}
        </PixelText>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setModalVisible(false)}>
          <View style={[styles.modal, { backgroundColor: colors.pumpPanel, borderColor: colors.cardBorder }]}>
            <PixelText variant="title" style={{ color: colors.accent, fontSize: 8, textAlign: "center", marginBottom: 16, letterSpacing: 1 }}>
              {t("inputs.selectDrug")}
            </PixelText>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              {groupedDrugs.map((group) => (
                <View key={group.category}>
                  <PixelText variant="title" style={{ color: colors.textMuted, fontSize: 6, marginBottom: 8, marginTop: 8, letterSpacing: 1 }}>
                    {group.label}
                  </PixelText>
                  {group.drugs.map((d) => {
                    const isSelected = d.id === selectedDrugId;
                    const isLocked = !d.isFree && !isPremium;
                    return (
                      <Pressable
                        key={d.id}
                        style={[
                          styles.option,
                          { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder },
                          isSelected && { backgroundColor: "rgba(26,58,119,0.5)", borderColor: colors.lcdTextAccent },
                          isLocked && { opacity: 0.6 },
                        ]}
                        onPress={() => handleSelect(d.id)}
                      >
                        <View style={styles.optionInfo}>
                          <View style={styles.optionNameRow}>
                            <PixelText variant="lcd" style={{ color: isSelected ? colors.lcdText : isLocked ? colors.textMuted : colors.textSecondary, fontSize: 18 }}>
                              {d.name}
                            </PixelText>
                            {isLocked && (
                              <View style={[styles.lockBadge, { backgroundColor: colors.accent }]}>
                                <PixelText variant="lcd" style={{ color: colors.background, fontSize: 10 }}>PRO</PixelText>
                              </View>
                            )}
                          </View>
                          <PixelText variant="lcd" style={{ color: isSelected ? colors.lcdTextDim : colors.textMuted, fontSize: 12, marginTop: 2 }}>
                            {t("inputs.dilutionsCount", { count: d.solutions.length, unit: d.doseUnit })}
                          </PixelText>
                        </View>
                        {isSelected && (
                          <PixelText variant="lcd" style={{ color: colors.accent, fontSize: 22 }}>{"\u2713"}</PixelText>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={[styles.closeButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
              onPress={() => setModalVisible(false)}
            >
              <PixelText variant="title" style={{ color: colors.textMuted, fontSize: 7 }}>
                {t("inputs.close")}
              </PixelText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <PaywallModal visible={paywallVisible} onClose={hidePaywall} />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  modal: { borderRadius: 16, borderWidth: 1, padding: 20, width: "100%", maxWidth: 380 },
  option: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 6 },
  optionInfo: { flex: 1 },
  optionNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  closeButton: { marginTop: 8, paddingVertical: 10, alignItems: "center", borderRadius: 8, borderWidth: 1 },
});
