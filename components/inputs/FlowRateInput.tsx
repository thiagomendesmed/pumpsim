import React, { useCallback, useState, useEffect } from "react";
import { View, Pressable, TextInput, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { usePumpStore } from "@/store/usePumpStore";
import { getDrugById } from "@/constants/drugs";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

export default function FlowRateInput() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const flowRate = usePumpStore((s) => s.flowRate);
  const setFlowRate = usePumpStore((s) => s.setFlowRate);
  const selectedDrugId = usePumpStore((s) => s.selectedDrugId);
  const drug = getDrugById(selectedDrugId);
  const maxFlow = drug.maxFlowRate;

  const [textValue, setTextValue] = useState(String(flowRate));

  useEffect(() => {
    setTextValue(String(flowRate));
  }, [flowRate]);

  const clamp = (v: number) => Math.max(0, Math.min(maxFlow, v));

  const handleStep = useCallback(
    (delta: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newVal = clamp(Math.round((flowRate + delta) * 10) / 10);
      setFlowRate(newVal);
      setTextValue(String(newVal));
    },
    [flowRate, setFlowRate, maxFlow]
  );

  const handleSlider = useCallback(
    (val: number) => {
      const rounded = Math.round(val * 10) / 10;
      setFlowRate(rounded);
      setTextValue(String(rounded));
    },
    [setFlowRate]
  );

  const handleTextSubmit = useCallback(() => {
    const parsed = parseFloat(textValue);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      setFlowRate(clamped);
      setTextValue(String(clamped));
    } else {
      setTextValue(String(flowRate));
    }
  }, [textValue, flowRate, setFlowRate, maxFlow]);

  return (
    <View style={styles.container}>
      <PixelText variant="label" style={[styles.label, { color: colors.textSecondary }]}>
        {t("inputs.flowRate")}
      </PixelText>
      <View style={styles.row}>
        <Pressable
          style={[styles.stepButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          onPress={() => handleStep(-0.5)}
        >
          <PixelText variant="lcd" style={[styles.stepText, { color: colors.inputText }]}>-</PixelText>
        </Pressable>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
          value={textValue}
          onChangeText={setTextValue}
          onBlur={handleTextSubmit}
          onSubmitEditing={handleTextSubmit}
          keyboardType="decimal-pad"
          selectTextOnFocus
        />
        <Pressable
          style={[styles.stepButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          onPress={() => handleStep(0.5)}
        >
          <PixelText variant="lcd" style={[styles.stepText, { color: colors.inputText }]}>+</PixelText>
        </Pressable>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={maxFlow}
        step={0.5}
        value={Math.min(flowRate, maxFlow)}
        onValueChange={handleSlider}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.inputBorder}
        thumbTintColor={colors.accent}
      />
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
  slider: { marginTop: 8, height: 30 },
});
