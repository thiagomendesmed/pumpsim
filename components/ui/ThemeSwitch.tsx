import { View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import PixelText from "@/components/ui/PixelText";

export default function ThemeSwitch() {
  const { isDark, toggleTheme, colors } = useTheme();

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <Pressable style={styles.container} onPress={handleToggle}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.12)",
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.accent,
              transform: [{ translateX: isDark ? 0 : 20 }],
            },
          ]}
        >
          <PixelText variant="lcd" style={styles.icon}>
            {isDark ? "\u263E" : "\u2600"}
          </PixelText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 12,
    color: "#0f0f1e",
  },
});
