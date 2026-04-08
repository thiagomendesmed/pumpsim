import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { getDoseRange } from "@/constants/calculations";
import { DoseRange } from "@/types";
import PixelText from "@/components/ui/PixelText";

interface DoseIndicatorProps {
  dose: number;
  doseRanges: DoseRange[];
}

export default function DoseIndicator({ dose, doseRanges }: DoseIndicatorProps) {
  const range = getDoseRange(dose, doseRanges);
  // Blink on last range (DOSE MUITO ALTA)
  const isLastRange = doseRanges.indexOf(range) === doseRanges.length - 1 && dose > 0;
  const blinkOpacity = useSharedValue(1);

  useEffect(() => {
    if (isLastRange) {
      blinkOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 250 }),
          withTiming(1, { duration: 250 })
        ),
        -1
      );
    } else {
      blinkOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isLastRange]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: range.color + "22", borderColor: range.color },
        animStyle,
      ]}
    >
      <PixelText variant="title" style={[styles.text, { color: range.color }]}>
        {range.label}
      </PixelText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "center",
  },
  text: {
    fontSize: 9,
    textAlign: "center",
  },
});
