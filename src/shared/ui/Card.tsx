import React from "react";
import { View, ViewStyle, StyleProp, Pressable } from "react-native";
import { palette, radius, shadows } from "../designSystem";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, padded = true, style }: Props) {
  const base: ViewStyle = {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: padded ? 16 : 0,
    ...shadows.xs,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { opacity: 0.9 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
