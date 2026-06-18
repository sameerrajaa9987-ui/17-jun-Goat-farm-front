import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius, gradients, elevation } from "../designSystem";

type Variant = "hero" | "forest" | "clay";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  /** Soft decorative light blobs in the corners (atmospheric depth). */
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * GradientHero — the signature 2026 "atmospheric" surface: a deep forest (or
 * clay) gradient panel with optional corner glow, used for dashboard headers
 * and feature cards. Depth comes from the gradient + soft shadow, not borders.
 */
export function GradientHero({
  children,
  variant = "hero",
  glow = true,
  style,
}: Props) {
  return (
    <LinearGradient
      colors={gradients[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, elevation.floating, style]}
    >
      {glow ? (
        <>
          <View style={[styles.blob, styles.blobTop]} />
          <View style={[styles.blob, styles.blobBottom]} />
        </>
      ) : null}
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
  },
  content: { padding: 20 },
  blob: {
    position: "absolute",
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  blobTop: { width: 180, height: 180, top: -70, right: -50 },
  blobBottom: { width: 140, height: 140, bottom: -60, left: -40 },
});
