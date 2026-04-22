import React, { useCallback, useState, useEffect } from "react";
import { View, Pressable, TextInput, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { usePumpStore } from "@/store/usePumpStore";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

const MIN_WEIGHT = 0;
const MAX_WEIGHT = 200;

export default function WeightInput() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const weight = usePumpStore((s) => s.weight);
  const setWeight = usePumpStore((s) => s.setWeight);
  const [textValue, setTextValue] = useState(String(weight));

  useEffect(() => {
    setTextValue(String(weight));
  }, [weight]);

  const clamp = (v: number) => Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, v));

  const handleStep = useCallback(
    (delta: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newVal = clamp(weight + delta);
      setWeight(newVal);
      setTextValue(String(newVal));
    },
    [weight, setWeight]
  );

  const handleSlider = useCallback(
    (val: number) => {
      const rounded = Math.round(val);
      setWeight(rounded);
      setTextValue(String(rounded));
    },
    [setWeight]
  );

  const handleTextSubmit = useCallback(() => {
    const parsed = parseFloat(textValue);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      setWeight(clamped);
      setTextValue(String(clamped));
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
      <Slider
        style={styles.slider}
        minimumValue={MIN_WEIGHT}
        maximumValue={MAX_WEIGHT}
        step={1}
        value={Math.min(Math.max(weight, MIN_WEIGHT), MAX_WEIGHT)}
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
