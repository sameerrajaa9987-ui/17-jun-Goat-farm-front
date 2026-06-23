import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { palette, radius, elevation, outline } from "../designSystem";

type Variant = "hero" | "forest" | "clay";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  /** Kept for API compatibility; the brutalist hero is a flat block. */
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

const FILL: Record<Variant, string> = {
  hero: palette.ink[900],
  forest: palette.ink[800],
  clay: palette.amber[600],
};

/**
 * Hero — a flat, bold block with a heavy outline and a hard block shadow
 * (neo-brutalist). Kept the name/API so existing screens don't change.
 */
export function GradientHero({ children, variant = "hero", style }: Props) {
  return (
    <View style={[styles.wrap, { backgroundColor: FILL[variant] }, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: outline.width,
    borderColor: outline.color,
    overflow: "hidden",
    ...elevation.floating,
  },
  content: { padding: 20 },
});
