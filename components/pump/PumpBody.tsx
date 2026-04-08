import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { usePumpStore } from "@/store/usePumpStore";
import { THEME } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";
import LcdScreen from "./LcdScreen";
import PumpButtons from "./PumpButtons";
import DrugLabel from "./DrugLabel";
import LedIndicator from "./LedIndicator";

function PumpBody() {
  const isRunning = usePumpStore((s) => s.isRunning);

  // Glow animation when running
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRunning) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 500 });
    }
  }, [isRunning]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.body, glowStyle]}>
      {/* Engineering label */}
      <View style={styles.engLabel}>
        <PixelText variant="label" style={styles.engLabelTitle}>
          ENG.CLINICA
        </PixelText>
        <PixelText variant="label" style={styles.engLabelCode}>
          SIM-001
        </PixelText>
      </View>

      {/* Dark panel */}
      <View style={styles.panel}>
        {/* LCD */}
        <LcdScreen />

        {/* Buttons */}
        <PumpButtons />

        {/* Drug Label */}
        <DrugLabel />

        {/* LED */}
        <LedIndicator />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: THEME.pumpBody,
    borderRadius: 16,
    padding: 10,
    shadowColor: THEME.ledActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 15,
    elevation: 8,
  },
  engLabel: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginBottom: 8,
    marginLeft: 4,
  },
  engLabelTitle: {
    color: "#444",
    fontSize: 8,
  },
  engLabelCode: {
    color: "#666",
    fontSize: 9,
  },
  panel: {
    backgroundColor: THEME.pumpPanel,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
});

export default memo(PumpBody);
