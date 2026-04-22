import { Tabs, Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@clerk/expo";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import { useIsWide } from "@/hooks/useResponsive";

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isWide = useIsWide();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      key={`${i18n.language}-${colors.background}-${isWide ? "wide" : "narrow"}`}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.separator,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: FONTS.label,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.simulator"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="iv-bag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reference"
        options={{
          title: t("tabs.reference"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="table" size={size} color={color} />
          ),
          href: isWide ? null : "/reference",
        }}
      />
      <Tabs.Screen
        name="solutions"
        options={{
          title: t("tabs.mySolutions"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hospital-building" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: t("tabs.patients"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bed" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
