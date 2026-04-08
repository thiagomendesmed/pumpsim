import React, { useCallback, useState } from "react";
import { View, Pressable, TextInput, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { usePumpStore } from "@/store/usePumpStore";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

export default function WeightInput() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const weight = usePumpStore((s) => s.weight);
  const setWeight = usePumpStore((s) => s.setWeight);
  const [textValue, setTextValue] = useState(String(weight));

  const handleStep = useCallback(
    (delta: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newVal = weight + delta;
      setWeight(newVal);
      setTextValue(String(Math.max(0, Math.min(300, newVal))));
    },
    [weight, setWeight]
  );

  const handleTextSubmit = useCallback(() => {
    const parsed = parseFloat(textValue);
    if (!isNaN(parsed)) {
      setWeight(parsed);
      setTextValue(String(Math.max(0, Math.min(300, parsed))));
    } else {
      setTextValue(String(weight));
    }
  }, [textValue, weight, setWeight]);

  return (
    <View style={styles.container}>
      <PixelText variant="label" style={[styles.label, { color: colors.textSecondary }]}>
        {t("inputs.patientWeight")}
      </PixelText>
      <View style={styles.row}>
        <Pressable
          style={[styles.stepButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          onPress={() => handleStep(-1)}
        >
          <PixelText variant="lcd" style={[styles.stepText, { color: colors.inputText }]}>-</PixelText>
        </Pressable>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
          value={textValue}
          onChangeText={setTextValue}
          onBlur={handleTextSubmit}
          onSubmitEditing={handleTextSubmit}
          keyboardType="number-pad"
          selectTextOnFocus
        />
        <Pressable
          style={[styles.stepButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          onPress={() => handleStep(1)}
        >
          <PixelText variant="lcd" style={[styles.stepText, { color: colors.inputText }]}>+</PixelText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  label: { fontSize: 13, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepButton: {
    width: 40, height: 40, borderRadius: 8, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  stepText: { fontSize: 24 },
  input: {
    flex: 1, height: 40, borderRadius: 8, borderWidth: 1,
    fontFamily: FONTS.lcd, fontSize: 22, textAlign: "center", paddingHorizontal: 8,
  },
});
