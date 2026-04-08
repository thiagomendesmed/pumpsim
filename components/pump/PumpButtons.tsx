import React, { useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { usePumpStore } from "@/store/usePumpStore";
import { THEME } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

interface PumpButtonProps {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

function PumpButton({ label, color, onPress, disabled = false }: PumpButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.93, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: color },
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <PixelText variant="title" style={styles.buttonText}>
          {label}
        </PixelText>
      </Pressable>
    </Animated.View>
  );
}

export default function PumpButtons() {
  const isRunning = usePumpStore((s) => s.isRunning);
  const start = usePumpStore((s) => s.start);
  const stop = usePumpStore((s) => s.stop);
  const handleStartStop = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  return (
    <View style={styles.container}>
      <PumpButton
        label={isRunning ? "STOP" : "START"}
        color={isRunning ? THEME.buttonStop : THEME.buttonStart}
        onPress={handleStartStop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 7,
  },
});
