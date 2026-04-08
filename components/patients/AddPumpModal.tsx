import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DRUGS } from "@/constants/drugs";
import { THEME, FONTS } from "@/constants/theme";

interface AddPumpModalProps {
  visible: boolean;
  patientId: Id<"patients">;
  onClose: () => void;
}

export function AddPumpModal({ visible, patientId, onClose }: AddPumpModalProps) {
  const { t } = useTranslation();
  const [selectedDrugId, setSelectedDrugId] = useState(DRUGS[0].id);
  const [selectedSolutionId, setSelectedSolutionId] = useState(DRUGS[0].solutions[0].id);
  const [flowRate, setFlowRate] = useState("5");
  const [weight, setWeight] = useState("70");
  const createPump = useMutation(api.pumps.createPump);

  const selectedDrug = DRUGS.find((d) => d.id === selectedDrugId) ?? DRUGS[0];

  const handleDrugChange = (drugId: string) => {
    const drug = DRUGS.find((d) => d.id === drugId) ?? DRUGS[0];
    setSelectedDrugId(drugId);
    setSelectedSolutionId(drug.solutions[0].id);
  };

  const handleCreate = async () => {
    const fr = parseFloat(flowRate);
    if (isNaN(fr) || fr <= 0) {
      Alert.alert(t("alert.error"), t("alert.invalidFlow"));
      return;
    }
    try {
      await createPump({
        patientId,
        drugId: selectedDrugId,
        dilutionId: selectedSolutionId,
        flowRate: fr,
        weight: selectedDrug.usesWeight ? parseFloat(weight) || 70 : undefined,
      });
      onClose();
    } catch {
      Alert.alert(t("alert.error"), t("alert.addPumpFailed"));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <Text style={styles.title}>{t("modal.newPump")}</Text>

            <Text style={styles.label}>{t("modal.drug")}</Text>
            <View style={styles.optionsRow}>
              {DRUGS.map((d) => (
                <Pressable
                  key={d.id}
                  style={[styles.chip, d.id === selectedDrugId && styles.chipSelected]}
                  onPress={() => handleDrugChange(d.id)}
                >
                  <Text style={[styles.chipText, d.id === selectedDrugId && styles.chipTextSelected]}>
                    {d.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>{t("modal.dilution")}</Text>
            <View style={styles.optionsRow}>
              {selectedDrug.solutions.map((s) => (
                <Pressable
                  key={s.id}
                  style={[styles.chip, s.id === selectedSolutionId && styles.chipSelected]}
                  onPress={() => setSelectedSolutionId(s.id)}
                >
                  <Text style={[styles.chipText, s.id === selectedSolutionId && styles.chipTextSelected]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>{t("modal.flowRateLabel")}</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={flowRate} onChangeText={setFlowRate} />

            {selectedDrug.usesWeight && (
              <>
                <Text style={styles.label}>{t("modal.weightLabel")}</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />
              </>
            )}

            <View style={styles.buttons}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>{t("modal.cancel")}</Text>
              </Pressable>
              <Pressable style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createText}>{t("modal.add")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 24 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  modal: {
    backgroundColor: THEME.pumpPanel, borderRadius: 16, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)", padding: 24, width: "100%", maxWidth: 400, alignSelf: "center",
  },
  title: { fontFamily: FONTS.title, fontSize: 10, color: THEME.accent, textAlign: "center", marginBottom: 20, letterSpacing: 1 },
  label: { fontFamily: FONTS.label, fontSize: 12, color: THEME.lcdTextDim, marginBottom: 8, marginTop: 12 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: THEME.inputBorder,
  },
  chipSelected: { backgroundColor: "rgba(0,255,136,0.15)", borderColor: THEME.accent },
  chipText: { fontFamily: FONTS.label, fontSize: 11, color: "#888" },
  chipTextSelected: { color: THEME.accent },
  input: {
    fontFamily: FONTS.lcd, fontSize: 18, color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1,
    borderColor: THEME.inputBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
  },
  buttons: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelButton: {
    flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: THEME.inputBorder,
  },
  cancelText: { fontFamily: FONTS.labelBold, fontSize: 11, color: "#888" },
  createButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8, backgroundColor: THEME.accent },
  createText: { fontFamily: FONTS.labelBold, fontSize: 11, color: "#0f0f1e" },
});
