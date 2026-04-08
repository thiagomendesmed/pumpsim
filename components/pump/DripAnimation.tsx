import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { usePumpStore } from "@/store/usePumpStore";
import { THEME } from "@/constants/theme";

export default function DripAnimation() {
  const isRunning = usePumpStore((s) => s.isRunning);
  const flowRate = usePumpStore((s) => s.flowRate);

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isRunning && flowRate > 0) {
      const duration = Math.max(300, 3000 / flowRate);

      translateY.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(30, { duration, easing: Easing.in(Easing.quad) })
        ),
        -1
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 50 }),
          withTiming(1, { duration: duration * 0.6 }),
          withTiming(0, { duration: duration * 0.4 })
        ),
        -1
      );
    } else {
      translateY.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isRunning, flowRate]);

  const dropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tube} />
      <Animated.View style={[styles.drop, dropStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 12,
    height: 40,
    alignItems: "center",
    position: "absolute",
    right: 10,
    top: 8,
  },
  tube: {
    width: 2,
    height: 8,
    backgroundColor: THEME.lcdTextDim,
    borderRadius: 1,
  },
  drop: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.lcdTextAccent,
  },
});
