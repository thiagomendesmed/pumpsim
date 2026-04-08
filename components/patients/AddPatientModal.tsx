import { View, Text, StyleSheet, Modal, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { THEME, FONTS } from "@/constants/theme";

interface AddPatientModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddPatientModal({ visible, onClose }: AddPatientModalProps) {
  const { t } = useTranslation();
  const [bedNumber, setBedNumber] = useState("");
  const [name, setName] = useState("");
  const createPatient = useMutation(api.patients.createPatient);

  const handleCreate = async () => {
    if (!bedNumber.trim()) {
      Alert.alert(t("alert.error"), t("alert.bedRequired"));
      return;
    }
    try {
      await createPatient({ bedNumber: bedNumber.trim(), name: name.trim() || undefined });
      setBedNumber("");
      setName("");
      onClose();
    } catch {
      Alert.alert(t("alert.error"), t("alert.createPatientFailed"));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{t("modal.newPatient")}</Text>

          <Text style={styles.label}>{t("modal.bed")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("modal.bedPlaceholder")}
            placeholderTextColor="#555"
            value={bedNumber}
            onChangeText={setBedNumber}
          />

          <Text style={styles.label}>{t("modal.nameOptional")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("modal.namePlaceholder")}
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>{t("modal.cancel")}</Text>
            </Pressable>
            <Pressable style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createText}>{t("modal.create")}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 24 },
  modal: {
    backgroundColor: THEME.pumpPanel, borderRadius: 16, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)", padding: 24, width: "100%", maxWidth: 360,
  },
  title: { fontFamily: FONTS.title, fontSize: 10, color: THEME.accent, textAlign: "center", marginBottom: 20, letterSpacing: 1 },
  label: { fontFamily: FONTS.label, fontSize: 12, color: THEME.lcdTextDim, marginBottom: 6 },
  input: {
    fontFamily: FONTS.lcd, fontSize: 18, color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1,
    borderColor: THEME.inputBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },
  buttons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: THEME.inputBorder,
  },
  cancelText: { fontFamily: FONTS.labelBold, fontSize: 11, color: "#888" },
  createButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8, backgroundColor: THEME.accent },
  createText: { fontFamily: FONTS.labelBold, fontSize: 11, color: "#0f0f1e" },
});
