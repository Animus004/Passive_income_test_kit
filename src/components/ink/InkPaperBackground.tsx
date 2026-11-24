import React from "react";
import { AbsoluteFill } from "remotion";

interface InkPaperBackgroundProps {
  showGrid?: boolean;
}

export const InkPaperBackground: React.FC<InkPaperBackgroundProps> = ({
  showGrid = true,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#faf7f0",
        overflow: "hidden",
      }}
    >
      {/* 1. Base Warm Sketchbook Paper Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 45%, #fcfbf7 0%, #f7f3e8 60%, #eee8d8 100%)",
        }}
      />

      {/* 2. SVG Paper Fiber / Texture Filter */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.35,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      >
        <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="4"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    0.28 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>

      {/* 3. Subtle Engineering / Sketchbook Margin & Grid Guidelines */}
      {showGrid && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.18,
            pointerEvents: "none",
          }}
        >
          <defs>
            <pattern
              id="sketch-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#8b7355"
                strokeWidth="0.75"
                strokeDasharray="2, 6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sketch-grid)" />

          {/* Sketchbook Border Margin Guidelines */}
          <rect
            x="40"
            y="60"
            width="1000"
            height="1800"
            fill="none"
            stroke="#a68a68"
            strokeWidth="1.2"
            strokeDasharray="6, 8"
          />

          {/* Header & Footer Technical Stamp Rules */}
          <line
            x1="40"
            y1="140"
            x2="1040"
            y2="140"
            stroke="#a68a68"
            strokeWidth="1"
          />
          <line
            x1="40"
            y1="1780"
            x2="1040"
            y2="1780"
            stroke="#a68a68"
            strokeWidth="1"
          />

          {/* Technical Corner Crosshairs */}
          <path
            d="M 30 60 L 50 60 M 40 50 L 40 70"
            stroke="#8b7355"
            strokeWidth="1.5"
          />
          <path
            d="M 1030 60 L 1050 60 M 1040 50 L 1040 70"
            stroke="#8b7355"
            strokeWidth="1.5"
          />
          <path
            d="M 30 1860 L 50 1860 M 40 1850 L 40 1870"
            stroke="#8b7355"
            strokeWidth="1.5"
          />
          <path
            d="M 1030 1860 L 1050 1860 M 1040 1850 L 1040 1870"
            stroke="#8b7355"
            strokeWidth="1.5"
          />
        </svg>
      )}

      {/* 4. Soft Vignette & Paper Aging Edge Falloff */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(139, 105, 60, 0.12) 90%, rgba(90, 60, 30, 0.22) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
