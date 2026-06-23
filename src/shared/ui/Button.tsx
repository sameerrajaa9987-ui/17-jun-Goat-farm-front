/**
 * Button — bold / neo-brutalist: heavy outline, flat fill, squarer corners,
 * hard block shadow, and a "press into the shadow" motion.
 * Variants: primary (graphite), accent (clay), secondary (outline), ghost, destructive.
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
  withTiming,
} from "react-native-reanimated";
import { palette, radius, elevation, outline } from "../designSystem";
import { Text } from "./Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  sm: { height: 38, px: 16, fontSize: 13 as const },
  md: { height: 50, px: 18, fontSize: 15 as const },
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
  const press = useSharedValue(0);
  const isDisabled = disabled || loading;
  const c = getVariantColors(variant);
  const s = SIZES[size];
  const flat = variant === "ghost";

  // Press: nudge toward the shadow so the block looks "pressed in".
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: press.get() * 3 },
      { translateY: press.get() * 3 },
    ],
  }));

  return (
    <View style={[fullWidth ? { alignSelf: "stretch" } : undefined, style]}>
      <AnimatedPressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => press.set(withTiming(1, { duration: 60 }))}
        onPressOut={() => press.set(withTiming(0, { duration: 130 }))}
        style={[
          styles.base,
          {
            height: s.height,
            paddingHorizontal: s.px,
            backgroundColor: c.bg,
            borderColor: c.border,
            borderWidth: flat ? 0 : outline.width,
          },
          !flat && elevation.raised,
          isDisabled && { opacity: 0.5 },
          animStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={c.text} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text
              variant="label-lg"
              weight="700"
              style={{ color: c.text, fontSize: s.fontSize }}
            >
              {label}
            </Text>
            {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
          </View>
        )}
      </AnimatedPressable>
    </View>
  );
}

function getVariantColors(v: Variant) {
  switch (v) {
    case "primary":
      return {
        bg: palette.ink[900],
        text: palette.text.inverse,
        border: outline.color,
      };
    case "accent":
      return {
        bg: palette.amber[600],
        text: palette.text.inverse,
        border: outline.color,
      };
    case "secondary":
      return {
        bg: palette.surface.primary,
        text: palette.text.primary,
        border: outline.color,
      };
    case "ghost":
      return {
        bg: "transparent",
        text: palette.text.primary,
        border: "transparent",
      };
    case "destructive":
      return {
        bg: palette.danger.bg,
        text: palette.danger.text,
        border: outline.color,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
});
