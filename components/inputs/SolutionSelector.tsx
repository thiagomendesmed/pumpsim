import React, { useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { usePumpStore } from "@/store/usePumpStore";
import { getDrugById } from "@/constants/drugs";
import { useTheme } from "@/hooks/useThemeContext";
import PixelText from "@/components/ui/PixelText";

export default function SolutionSelector() {
  const { colors } = useTheme();
  const selectedDrugId = usePumpStore((s) => s.selectedDrugId);
  const selectedId = usePumpStore((s) => s.selectedSolutionId);
  const setSolution = usePumpStore((s) => s.setSolution);

  const drug = getDrugById(selectedDrugId);

  const handlePress = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSolution(id);
    },
    [setSolution]
  );

  return (
    <View style={styles.grid}>
      {drug.solutions.map((sol) => {
        const isSelected = sol.id === selectedId;
        return (
          <Pressable
            key={sol.id}
            style={[
              styles.button,
              { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground },
              isSelected && { backgroundColor: "rgba(26,58,119,0.6)", borderColor: colors.lcdTextAccent },
            ]}
            onPress={() => handlePress(sol.id)}
          >
            <PixelText
              variant="lcd"
              style={[
                { color: colors.textMuted, fontSize: 11, marginBottom: 2 },
                isSelected && { color: colors.lcdTextAccent },
              ]}
              numberOfLines={1}
            >
              {sol.shortName}
            </PixelText>
            <PixelText
              variant="lcd"
              style={[
                { color: colors.textSecondary, fontSize: 16 },
                isSelected && { color: colors.lcdText },
              ]}
              numberOfLines={1}
            >
              {sol.label}
            </PixelText>
            <PixelText
              variant="lcd"
              style={[
                { color: colors.textMuted, fontSize: 13, marginTop: 2 },
                isSelected && { color: colors.lcdTextDim },
              ]}
            >
              {sol.concentration_mcg_per_mL.toFixed(1)} mcg/mL
            </PixelText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  button: {
    width: "48%",
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
});
