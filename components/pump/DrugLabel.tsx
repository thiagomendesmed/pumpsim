import React, { useState, useCallback } from "react";
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { usePumpStore } from "@/store/usePumpStore";
import { getSolutionById, getDrugById } from "@/constants/drugs";
import { THEME } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

export default function DrugLabel() {
  const selectedId = usePumpStore((s) => s.selectedSolutionId);
  const selectedDrugId = usePumpStore((s) => s.selectedDrugId);
  const setSolution = usePumpStore((s) => s.setSolution);
  const solution = getSolutionById(selectedId);
  const drug = getDrugById(selectedDrugId);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSolution(id);
      setModalVisible(false);
    },
    [setSolution]
  );

  return (
    <>
      {/* Pressable label on the pump */}
      <Pressable
        style={styles.container}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setModalVisible(true);
        }}
      >
        <PixelText variant="labelBold" style={styles.text}>
          {solution.shortName}
        </PixelText>
      </Pressable>

      {/* Solution picker modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            <PixelText variant="title" style={styles.modalTitle}>
              SELECIONAR SOLUCAO
            </PixelText>

            {drug.solutions.map((sol) => {
              const isSelected = sol.id === selectedId;
              return (
                <Pressable
                  key={sol.id}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(sol.id)}
                >
                  <PixelText
                    variant="lcd"
                    style={[
                      styles.optionName,
                      isSelected && styles.optionNameSelected,
                    ]}
                  >
                    {sol.shortName}
                  </PixelText>
                  <View style={styles.optionDetails}>
                    <PixelText
                      variant="lcd"
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {sol.label}
                    </PixelText>
                    <PixelText
                      variant="lcd"
                      style={[
                        styles.optionConc,
                        isSelected && styles.optionConcSelected,
                      ]}
                    >
                      {sol.concentration_mcg_per_mL} mcg/mL
                    </PixelText>
                  </View>
                  {isSelected && (
                    <PixelText variant="lcd" style={styles.check}>
                      {"\u2713"}
                    </PixelText>
                  )}
                </Pressable>
              );
            })}

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <PixelText variant="title" style={styles.closeText}>
                FECHAR
              </PixelText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: "center",
    marginVertical: 6,
  },
  text: {
    color: "#111",
    fontSize: 14,
    letterSpacing: 3,
    textAlign: "center",
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: THEME.pumpPanel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 20,
    width: "100%",
    maxWidth: 380,
  },
  modalTitle: {
    color: THEME.accent,
    fontSize: 8,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: THEME.inputBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "rgba(26,58,119,0.5)",
    borderColor: THEME.lcdTextAccent,
  },
  optionName: {
    color: "#aaa",
    fontSize: 16,
    flex: 1,
  },
  optionNameSelected: {
    color: THEME.lcdText,
  },
  optionDetails: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  optionLabel: {
    color: "#777",
    fontSize: 16,
  },
  optionLabelSelected: {
    color: THEME.lcdTextDim,
  },
  optionConc: {
    color: "#555",
    fontSize: 13,
  },
  optionConcSelected: {
    color: THEME.lcdTextDim,
  },
  check: {
    color: THEME.accent,
    fontSize: 22,
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: THEME.inputBorder,
  },
  closeText: {
    color: "#888",
    fontSize: 7,
  },
});
