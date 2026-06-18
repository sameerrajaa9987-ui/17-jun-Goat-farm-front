import React from "react";
import { View } from "react-native";
import Svg, { Polyline, Circle, Line } from "react-native-svg";
import { palette } from "@shared/designSystem";
import { WeightEntry } from "@modules/goat/types";

interface Props {
  data: WeightEntry[];
  width?: number;
  height?: number;
}

export function WeightSparkline({ data, width = 280, height = 90 }: Props) {
  if (!data || data.length < 2) {
    return <View style={{ height }} />;
  }

  const pad = 8;
  const weights = data.map((d) => d.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = data.map((d, i) => {
    const x = pad + (innerW * i) / (data.length - 1);
    const y = pad + innerH - (innerH * (d.weightKg - min)) / range;
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];

  return (
    <Svg width={width} height={height}>
      <Line
        x1={pad}
        y1={height - pad}
        x2={width - pad}
        y2={height - pad}
        stroke={palette.border.subtle}
        strokeWidth={1}
      />
      <Polyline
        points={polyline}
        fill="none"
        stroke={palette.ink[600]}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={palette.ink[500]} />
      ))}
      <Circle cx={last.x} cy={last.y} r={5} fill={palette.amber[500]} />
    </Svg>
  );
}
