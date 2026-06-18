import React from "react";
import { ViewStyle, StyleProp, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { palette, radius, elevation, motion } from "../designSystem";

type Elevation = keyof typeof elevation;

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  /** Spatial-depth layer — drives the shadow strength (2026 z-axis hierarchy). */
  elevation?: Elevation;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  onPress,
  padded = true,
  elevation: level = "base",
  style,
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const base: ViewStyle = {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: padded ? 16 : 0,
    ...elevation[level],
  };

  if (onPress) {
    return (
      <Animated.View style={animStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => scale.set(withSpring(0.97, motion.spring.crisp))}
          onPressOut={() => scale.set(withSpring(1, motion.spring.gentle))}
          style={[base, style]}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }
  return <Animated.View style={[base, style]}>{children}</Animated.View>;
}
