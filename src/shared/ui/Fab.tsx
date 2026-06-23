import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { palette, radius, elevation, outline } from "../designSystem";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress: () => void;
  icon: React.ReactNode;
}

/**
 * Fab — bold/neo-brutalist floating action button: flat clay block, heavy
 * outline, hard block shadow, "press into shadow" motion. Pinned bottom-right.
 */
export function Fab({ onPress, icon }: Props) {
  const press = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: press.get() * 3 },
      { translateY: press.get() * 3 },
    ],
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => press.set(withTiming(1, { duration: 60 }))}
        onPressOut={() => press.set(withTiming(0, { duration: 130 }))}
        style={[styles.fab, animStyle]}
      >
        {icon}
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: 20, bottom: 28 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: palette.amber[600],
    borderWidth: outline.width,
    borderColor: outline.color,
    alignItems: "center",
    justifyContent: "center",
    ...elevation.floating,
  },
});
