/**
 * Premium Button — refined, minimal, pressure-aware.
 * Variants: primary (forest), secondary (outline), ghost, accent (clay).
 */
import React from "react";
import {
  Pressable,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { palette, radius, motion, shadows } from "../designSystem";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const SIZES = {
  sm: { height: 36, px: 14, fontSize: 13 as const },
  md: { height: 48, px: 18, fontSize: 15 as const },
  lg: { height: 56, px: 22, fontSize: 16 as const },
};

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  size = "md",
  icon,
  rightIcon,
  fullWidth = true,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: 1 - pressed.get() * 0.1,
  }));

  const s = SIZES[size];
  const colors = getVariantColors(variant);

  return (
    <Animated.View
      style={[
        animStyle,
        fullWidth ? { alignSelf: "stretch" } : undefined,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => {
          scale.set(withSpring(0.97, motion.spring.crisp));
          pressed.set(withTiming(1, { duration: 80 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, motion.spring.gentle));
          pressed.set(withTiming(0, { duration: 150 }));
        }}
        style={[
          styles.base,
          {
            height: s.height,
            paddingHorizontal: s.px,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: colors.borderWidth,
          },
          variant === "primary" && shadows.sm,
          isDisabled && { opacity: 0.5 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text
              variant="label-lg"
              style={{ color: colors.text, fontSize: s.fontSize }}
            >
              {label}
            </Text>
            {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getVariantColors(v: Variant) {
  switch (v) {
    case "primary":
      return {
        bg: palette.ink[900],
        text: palette.text.inverse,
        border: palette.ink[900],
        borderWidth: 0,
      };
    case "accent":
      // amber[600] (deeper clay) so white labels meet WCAG AA (≈5.5:1);
      // amber[500] was 3.93:1 — fine for icons but short for button text.
      return {
        bg: palette.amber[600],
        text: palette.text.inverse,
        border: palette.amber[600],
        borderWidth: 0,
      };
    case "secondary":
      return {
        bg: palette.surface.primary,
        text: palette.text.primary,
        border: palette.border.default,
        borderWidth: 1,
      };
    case "ghost":
      return {
        bg: "transparent",
        text: palette.text.primary,
        border: "transparent",
        borderWidth: 0,
      };
    case "destructive":
      return {
        bg: palette.danger.bg,
        text: palette.danger.text,
        border: palette.danger.border,
        borderWidth: 1,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center" },
});
