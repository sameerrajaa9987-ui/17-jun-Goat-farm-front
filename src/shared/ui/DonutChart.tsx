/**
 * DonutChart — a proportional ring built from stroked SVG arcs (the technique
 * premium dashboards use for at-a-glance composition). Renders a faint track,
 * one rounded arc per segment, and a centered label overlaid via RN Text.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { palette } from "../designSystem";
import { Text } from "./Text";

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface Props {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerValue?: string;
  centerLabel?: string;
}

export function DonutChart({
  data,
  size = 132,
  strokeWidth = 16,
  centerValue,
  centerLabel,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  const visible = data.filter((d) => d.value > 0);
  const lens = visible.map((d) => (d.value / total) * c);
  // cumulative start offset per segment — computed without mutation so the
  // React Compiler stays happy.
  const offsets = lens.map((_, i) =>
    lens.slice(0, i).reduce((a, b) => a + b, 0),
  );
  const gap = visible.length > 1 ? 2 : 0;
  const arcs = visible.map((d, i) => {
    const seg = Math.max(0, lens[i] - gap);
    return (
      <Circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        stroke={d.color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${seg} ${c - seg}`}
        strokeDashoffset={-offsets[i]}
      />
    );
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={palette.ink[50]}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {arcs}
        </G>
      </Svg>
      {centerValue ? (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text variant="h1" tone="primary">
            {centerValue}
          </Text>
          {centerLabel ? (
            <Text variant="caption" tone="tertiary">
              {centerLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
