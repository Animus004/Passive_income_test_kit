import React from "react";
import { useCurrentFrame } from "remotion";

interface CircleToonHeaderProps {
  seriesNumber?: string;
  counterText?: string;
  counterColor?: string;
  statusText?: string;
  isTicking?: boolean;
}

export const CircleToonHeader: React.FC<CircleToonHeaderProps> = ({
  seriesNumber = "#1",
  counterText = "$1,000,000",
  counterColor = "#22c55e",
  statusText = "12:00 AM • MIDNIGHT",
  isTicking = false,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing scale pulse on counter
  const pulse = Math.sin(frame * 0.15) * 0.02 + 1.0;

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 50,
        pointerEvents: "none",
        fontFamily: "'Arial Black', Impact, sans-serif",
      }}
    >
      <svg width="1080" height="260" viewBox="0 0 1080 260" fill="none">
        {/* 1. Series Number or Hook Header */}
        <text
          x="540"
          y="44"
          textAnchor="middle"
          fill="#facc15"
          stroke="#000000"
          strokeWidth="8"
          paintOrder="stroke fill"
          fontSize={seriesNumber.length > 5 ? "44" : "40"}
          fontWeight="900"
          letterSpacing={seriesNumber.length > 5 ? "-0.5px" : "1px"}
        >
          {seriesNumber}
        </text>

        {/* 2. Gigantic Main Number Counter ($1,000,000) */}
        <g transform={`scale(${pulse})`} style={{ transformOrigin: "540px 120px" }}>
          <text
            x="540"
            y="130"
            textAnchor="middle"
            fill={counterColor}
            stroke="#000000"
            strokeWidth="14"
            paintOrder="stroke fill"
            fontSize="84"
            fontWeight="900"
            letterSpacing="-1px"
          >
            {counterText}
          </text>
        </g>

        {/* 3. Context Sub-Status Label (Your money • Sunday) */}
        <text
          x="540"
          y="185"
          textAnchor="middle"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="8"
          paintOrder="stroke fill"
          fontSize="36"
          fontWeight="900"
          letterSpacing="0.5px"
        >
          {statusText}
        </text>
      </svg>
    </div>
  );
};
