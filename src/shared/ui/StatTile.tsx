import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { palette, radius, elevation, motion, outline } from "../designSystem";
import { Text } from "./Text";

type Tone = "light" | "clay" | "forest";

interface Props {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Short trend / delta hint, e.g. "+3 this month". */
  hint?: string;
  tone?: Tone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * StatTile — a bento metric block (2026 bento-grid system). `tone` switches
 * between a light sand surface and gradient accent surfaces; press gives a
 * tactile spring. Combine different widths in a wrapping row for the bento look.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  hint,
  tone = "light",
  onPress,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const dark = tone !== "light";
  const valueColor = dark ? palette.text.inverse : palette.text.primary;
  const labelColor = dark ? "rgba(255,255,255,0.78)" : palette.text.tertiary;
  const iconColor = dark ? "#FFFFFF" : palette.ink[600];
  const iconBg = dark ? "rgba(255,255,255,0.16)" : palette.ink[50];

  const inner = (
    <>
      {Icon ? (
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>
      ) : null}
      <View style={{ marginTop: Icon ? 14 : 0 }}>
        <Text
          variant="display-sm"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ color: valueColor }}
        >
          {value}
        </Text>
        <Text variant="caption" style={{ color: labelColor, marginTop: 2 }}>
          {label}
        </Text>
        {hint ? (
          <Text
            variant="label-sm"
            style={{
              color: dark ? "rgba(255,255,255,0.7)" : palette.ink[500],
              marginTop: 6,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </>
  );

  const fill =
    tone === "clay"
      ? palette.amber[600]
      : tone === "forest"
        ? palette.ink[800]
        : palette.surface.primary;
  const body = (
    <View
      style={[styles.tile, { backgroundColor: fill }, elevation.raised, style]}
    >
      {inner}
    </View>
  );

  if (!onPress) return body;

  return (
    <Animated.View style={[animStyle, style ? undefined : { flex: 1 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(0.96, motion.spring.crisp))}
        onPressOut={() => scale.set(withSpring(1, motion.spring.gentle))}
      >
        {body}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: outline.width,
    borderColor: outline.color,
    padding: 16,
    minHeight: 96,
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
