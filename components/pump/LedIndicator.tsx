import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { usePumpStore } from "@/store/usePumpStore";
import { THEME } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

export default function LedIndicator() {
  const isRunning = usePumpStore((s) => s.isRunning);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const ledStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.led,
          isRunning ? styles.ledActive : styles.ledInactive,
          isRunning && ledStyle,
        ]}
      />
      <PixelText
        variant="lcd"
        style={[
          styles.text,
          { color: isRunning ? THEME.ledActive : "#666" },
        ]}
      >
        {isRunning ? "INFUNDINDO" : "PARADO"}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  led: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ledActive: {
    backgroundColor: THEME.ledActive,
    shadowColor: THEME.ledActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  ledInactive: {
    backgroundColor: THEME.ledInactive,
  },
  text: {
    fontSize: 14,
  },
});
