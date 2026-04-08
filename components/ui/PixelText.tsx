import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { FONTS } from "@/constants/theme";

type Variant = "title" | "lcd" | "label" | "labelBold";

interface PixelTextProps extends TextProps {
  variant?: Variant;
}

const FONT_MAP: Record<Variant, string> = {
  title: FONTS.title,
  lcd: FONTS.lcd,
  label: FONTS.label,
  labelBold: FONTS.labelBold,
};

export default function PixelText({
  variant = "lcd",
  style,
  ...props
}: PixelTextProps) {
  return (
    <Text
      style={[{ fontFamily: FONT_MAP[variant] }, style]}
      {...props}
    />
  );
}
