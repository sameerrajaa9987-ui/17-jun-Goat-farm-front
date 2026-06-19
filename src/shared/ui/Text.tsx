/** Text — all typography routes through here for a consistent type system. */
import React from "react";
import { Text as RNText, TextStyle, StyleProp } from "react-native";
import { typography, palette } from "../designSystem";

type Variant =
  | "display-lg"
  | "display-md"
  | "display-sm"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "body-sm"
  | "label-lg"
  | "label"
  | "label-sm"
  | "caption"
  | "overline";

type Tone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "inverse"
  | "accent"
  | "danger";

interface Props {
  variant?: Variant;
  tone?: Tone;
  weight?: "400" | "500" | "600" | "700";
  align?: "left" | "center" | "right";
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const variantMap = {
  "display-lg": typography.display.large,
  "display-md": typography.display.medium,
  "display-sm": typography.display.small,
  h1: typography.heading.h1,
  h2: typography.heading.h2,
  h3: typography.heading.h3,
  h4: typography.heading.h4,
  "body-lg": typography.body.large,
  body: typography.body.default,
  "body-sm": typography.body.small,
  "label-lg": typography.label.large,
  label: typography.label.medium,
  "label-sm": typography.label.small,
  caption: typography.caption,
  overline: typography.overline,
} as const;

// Map a font weight to the matching bundled Inter family. Using the specific
// weighted file (instead of fontWeight) gives correct, consistent rendering on
// every device regardless of the system font.
const INTER_BY_WEIGHT: Record<string, string> = {
  "400": "Inter_400Regular",
  "500": "Inter_500Medium",
  "600": "Inter_600SemiBold",
  "700": "Inter_700Bold",
};

const toneMap: Record<Tone, string> = {
  primary: palette.text.primary,
  secondary: palette.text.secondary,
  tertiary: palette.text.tertiary,
  disabled: palette.text.disabled,
  inverse: palette.text.inverse,
  accent: palette.text.accent,
  danger: palette.danger.text,
};

export function Text({
  variant = "body",
  tone = "primary",
  weight,
  align,
  numberOfLines,
  adjustsFontSizeToFit,
  style,
  children,
}: Props) {
  const base = variantMap[variant];
  const effectiveWeight = weight ?? base.fontWeight;
  const fontFamily = INTER_BY_WEIGHT[effectiveWeight] ?? "Inter_400Regular";
  return (
    <RNText
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      style={[
        base,
        // The weighted Inter file carries the weight, so clear fontWeight to
        // avoid synthetic (faux) bolding on top of it.
        { fontFamily, fontWeight: undefined, color: toneMap[tone] },
        align ? { textAlign: align } : undefined,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
