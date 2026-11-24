import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { useInkBoil } from "./useInkBoil";

interface InkStrokeProps {
  d: string;
  pathLength?: number;
  startFrame?: number;
  drawDuration?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  fillOpacity?: number;
  fillStartFrame?: number;
  fillDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const InkStroke: React.FC<InkStrokeProps> = ({
  d,
  pathLength = 1000,
  startFrame = 0,
  drawDuration = 25,
  strokeColor = "#0f172a",
  strokeWidth = 3.5,
  fillColor = "transparent",
  fillOpacity = 0.85,
  fillStartFrame,
  fillDuration = 15,
  style,
}) => {
  const frame = useCurrentFrame();
  const boil = useInkBoil(3);

  // Stroke draw-on progress (0 = not drawn, 1 = fully drawn)
  const drawProgress = interpolate(
    frame,
    [startFrame, startFrame + drawDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
    }
  );

  const dashOffset = pathLength * (1 - drawProgress);

  // Fill fade-in progress (appears after line is drawn or when specified)
  const actualFillStart = fillStartFrame ?? startFrame + Math.floor(drawDuration * 0.7);
  const fillAlpha =
    fillColor === "transparent"
      ? 0
      : interpolate(frame, [actualFillStart, actualFillStart + fillDuration], [0, fillOpacity], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  if (frame < startFrame) {
    return null;
  }

  return (
    <g
      transform={`translate(${boil.dx}, ${boil.dy}) rotate(${boil.angle})`}
      style={{
        transformOrigin: "center center",
        ...style,
      }}
    >
      {/* Translucent Watercolor / Highlighter Wash Layer */}
      {fillColor !== "transparent" && fillAlpha > 0 && (
        <path
          d={d}
          fill={fillColor}
          fillOpacity={fillAlpha}
          stroke="none"
          style={{
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Main Fountain Pen / Fineliner Ink Line */}
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
        style={{
          filter: "drop-shadow(0 1px 1px rgba(15, 23, 42, 0.15))",
        }}
      />
    </g>
  );
};
