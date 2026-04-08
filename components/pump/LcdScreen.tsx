import React from "react";
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
import { getSolutionById, getDrugById } from "@/constants/drugs";
import { calculateDoseInUnit, getDoseRange } from "@/constants/calculations";
import { THEME } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";
import DoseIndicator from "@/components/display/DoseIndicator";
import DripAnimation from "@/components/pump/DripAnimation";

export default function LcdScreen() {
  const isRunning = usePumpStore((s) => s.isRunning);
  const flowRate = usePumpStore((s) => s.flowRate);
  const weight = usePumpStore((s) => s.weight);
  const selectedSolutionId = usePumpStore((s) => s.selectedSolutionId);
  const selectedDrugId = usePumpStore((s) => s.selectedDrugId);

  const solution = getSolutionById(selectedSolutionId);
  const drug = getDrugById(selectedDrugId);
  const effectiveWeight = weight <= 0 ? 1 : weight;
  const dose = calculateDoseInUnit(
    flowRate,
    solution.concentration_mcg_per_mL,
    effectiveWeight,
    drug.doseUnit
  );
  const doseRange = getDoseRange(dose, drug.doseRanges);

  // LCD flicker animation
  const flickerOpacity = useSharedValue(1);
  useEffect(() => {
    flickerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.92, { duration: 200, easing: Easing.linear }),
        withTiming(1, { duration: 200, easing: Easing.linear }),
        withTiming(1, { duration: 7600 })
      ),
      -1
    );
  }, []);

  const flickerStyle = useAnimatedStyle(() => ({
    opacity: flickerOpacity.value,
  }));

  // Status indicator blink
  const statusOpacity = useSharedValue(1);
  useEffect(() => {
    if (isRunning) {
      statusOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1
      );
    } else {
      statusOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isRunning]);

  const statusStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
  }));

  // Format dose decimal places based on magnitude
  const formatDose = (d: number): string => {
    if (d < 0.01) return d.toFixed(4);
    if (d < 1) return d.toFixed(3);
    return d.toFixed(1);
  };

  return (
    <View style={styles.lcdOuter}>
      <Animated.View style={[styles.lcd, flickerStyle]}>
        {/* Row 1: Header */}
        <View style={styles.headerRow}>
          <PixelText variant="title" style={styles.channel}>
            A 1
          </PixelText>
          <PixelText variant="title" style={styles.drugName} numberOfLines={1}>
            {solution.shortName}
          </PixelText>
          <Animated.View style={statusStyle}>
            <PixelText
              variant="title"
              style={[
                styles.statusText,
                {
                  color: isRunning ? THEME.ledActive : "#facc15",
                },
              ]}
            >
              {isRunning ? "\u25B6\u25B6" : "STOP"}
            </PixelText>
          </Animated.View>
        </View>

        {/* Row 2: Flow rate (centered) */}
        <View style={styles.flowSection}>
          <View style={styles.flowMain}>
            <PixelText variant="lcd" style={styles.flowValue}>
              {flowRate.toFixed(1)}
            </PixelText>
            <PixelText variant="lcd" style={styles.flowUnit}>
              {" "}mL/h
            </PixelText>
          </View>
          <View style={styles.subInfoRow}>
            <PixelText variant="lcd" style={styles.dilution}>
              {solution.label}
            </PixelText>
            {drug.usesWeight && (
              <PixelText variant="lcd" style={styles.dilution}>
                {effectiveWeight} kg
              </PixelText>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Row 3: Dose (centered, large) */}
        <View style={styles.doseSection}>
          <View style={styles.doseMain}>
            <PixelText
              variant="lcd"
              style={[styles.doseValue, { color: doseRange.color }]}
            >
              {formatDose(dose)}
            </PixelText>
            <PixelText
              variant="lcd"
              style={[styles.doseUnit, { color: doseRange.color }]}
            >
              {" "}{drug.doseUnit}
            </PixelText>
          </View>
          <DoseIndicator dose={dose} doseRanges={drug.doseRanges} />
        </View>

        {/* Scanlines + Drip */}
        <ScanlineOverlay />
        <DripAnimation />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  lcdOuter: {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0a2244",
    overflow: "hidden",
    marginHorizontal: 8,
  },
  lcd: {
    backgroundColor: THEME.lcdBackground,
    padding: 12,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  channel: {
    color: THEME.lcdTextDim,
    fontSize: 9,
  },
  drugName: {
    color: THEME.lcdText,
    fontSize: 7,
    flex: 1,
    textAlign: "center",
  },
  statusText: {
    fontSize: 7,
  },
  flowSection: {
    alignItems: "center",
    marginBottom: 4,
  },
  flowMain: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  flowValue: {
    color: THEME.lcdText,
    fontSize: 38,
  },
  flowUnit: {
    color: THEME.lcdTextDim,
    fontSize: 22,
  },
  subInfoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 2,
  },
  dilution: {
    color: THEME.lcdTextDim,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 6,
  },
  doseSection: {
    alignItems: "center",
    gap: 6,
  },
  doseMain: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  doseValue: {
    fontSize: 42,
  },
  doseUnit: {
    fontSize: 20,
  },
});
