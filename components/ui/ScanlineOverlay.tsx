import React, { memo } from "react";
import { View, StyleSheet } from "react-native";

const SCANLINE_COUNT = 80;
const SCANLINE_HEIGHT = 2;
const SCANLINE_GAP = 2;

function ScanlineOverlay() {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: SCANLINE_COUNT }, (_, i) => (
        <View
          key={i}
          style={[
            styles.line,
            { top: i * (SCANLINE_HEIGHT + SCANLINE_GAP) },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCANLINE_HEIGHT,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
});

export default memo(ScanlineOverlay);
