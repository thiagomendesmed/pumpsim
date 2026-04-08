import { Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

/**
 * DEV ONLY — Toggle between Free / Premium / Real subscription status.
 * Remove this component before publishing to App Store.
 */
export default function DevPremiumSwitch() {
  const { __devOverride, __toggleDevOverride } = useSubscriptionStore();
  const { colors } = useTheme();

  const label =
    __devOverride === null ? "REAL" : __devOverride ? "PRO" : "FREE";

  const bgColor =
    __devOverride === null
      ? colors.textMuted
      : __devOverride
        ? colors.accent
        : colors.doseVeryHigh;

  return (
    <Pressable
      style={[styles.badge, { backgroundColor: bgColor }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        __toggleDevOverride();
      }}
    >
      <PixelText variant="label" style={styles.text}>
        {label}
      </PixelText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontSize: 9,
    color: "#0f0f1e",
    fontFamily: FONTS.labelBold,
  },
});
