export type ThemeColors = typeof DARK_THEME;

export const DARK_THEME = {
  // App background
  background: "#0f0f1e",
  backgroundSecondary: "#0a0a18",

  // Pump body
  pumpBody: "#d4d0c8",
  pumpBodyDark: "#c0bbb3",
  pumpPanel: "#0d2626",
  pumpPanelGradient: "#1a3a3a",

  // LCD
  lcdBackground: "#1a3a77",
  lcdBackgroundLight: "#2255aa",
  lcdText: "#ffffff",
  lcdTextDim: "#88aadd",
  lcdTextAccent: "#aaccff",

  // Buttons
  buttonStart: "#33cc55",
  buttonStop: "#cc3333",
  buttonNeutral: "#555555",
  buttonReset: "#cc8800",

  // Status
  ledActive: "#00ff44",
  ledInactive: "#333333",

  // Doses
  doseLow: "#4ade80",
  doseModerate: "#facc15",
  doseHigh: "#fb923c",
  doseVeryHigh: "#ef4444",

  // Input area
  inputBackground: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.12)",
  inputText: "#ffffff",
  accent: "#00ff88",

  // Text
  textPrimary: "#ffffff",
  textSecondary: "#aaaaaa",
  textMuted: "#555555",

  // Overlays
  overlay: "rgba(0,0,0,0.7)",
  cardBackground: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  separator: "rgba(255,255,255,0.08)",
};

export const LIGHT_THEME: ThemeColors = {
  // App background
  background: "#f0f2f5",
  backgroundSecondary: "#e8eaed",

  // Pump body
  pumpBody: "#d4d0c8",
  pumpBodyDark: "#c0bbb3",
  pumpPanel: "#1a3a3a",
  pumpPanelGradient: "#1a3a3a",

  // LCD
  lcdBackground: "#1a3a77",
  lcdBackgroundLight: "#2255aa",
  lcdText: "#ffffff",
  lcdTextDim: "#88aadd",
  lcdTextAccent: "#aaccff",

  // Buttons
  buttonStart: "#33cc55",
  buttonStop: "#cc3333",
  buttonNeutral: "#888888",
  buttonReset: "#cc8800",

  // Status
  ledActive: "#00cc44",
  ledInactive: "#cccccc",

  // Doses
  doseLow: "#22c55e",
  doseModerate: "#eab308",
  doseHigh: "#f97316",
  doseVeryHigh: "#ef4444",

  // Input area
  inputBackground: "rgba(0,0,0,0.04)",
  inputBorder: "rgba(0,0,0,0.12)",
  inputText: "#1a1a2e",
  accent: "#00995c",

  // Text
  textPrimary: "#1a1a2e",
  textSecondary: "#555555",
  textMuted: "#999999",

  // Overlays
  overlay: "rgba(0,0,0,0.4)",
  cardBackground: "rgba(0,0,0,0.03)",
  cardBorder: "rgba(0,0,0,0.08)",
  separator: "rgba(0,0,0,0.08)",
};

// Keep THEME as default export for backward compat during migration
export const THEME = DARK_THEME;

export const FONTS = {
  title: "PressStart2P_400Regular",
  lcd: "VT323_400Regular",
  label: "Silkscreen_400Regular",
  labelBold: "Silkscreen_700Bold",
};
