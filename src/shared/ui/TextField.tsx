/** Premium TextField — minimal, focus-aware. */
import React, { useState } from "react";
import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { palette, radius } from "../designSystem";
import { Text } from "./Text";

interface Props extends Omit<TextInputProps, "style"> {
  label?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
  hint?: string;
}

export function TextField({
  label,
  leading,
  trailing,
  error,
  hint,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? palette.danger.border
    : focused
      ? palette.ink[900]
      : palette.border.default;

  return (
    <View>
      {label && (
        <Text variant="label" tone="secondary" style={{ marginBottom: 8 }}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.wrap,
          { borderColor, backgroundColor: palette.surface.primary },
        ]}
      >
        {leading && <View style={{ marginRight: 10 }}>{leading}</View>}
        <TextInput
          {...inputProps}
          placeholderTextColor={palette.text.tertiary}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={styles.input}
        />
        {trailing && <View style={{ marginLeft: 10 }}>{trailing}</View>}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: 6 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="tertiary" style={{ marginTop: 6 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: palette.text.primary,
    paddingVertical: 16,
  },
});
