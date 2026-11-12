import React from "react";
import { useCurrentFrame } from "remotion";

interface BackgroundProps {
  theme?: string;
  primaryColor?: string;
}

export const KurzgesagtBackground: React.FC<BackgroundProps> = ({
  theme = "cyber",
  primaryColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#070c26", // Deep rich Kurzgesagt midnight blue
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* 1. Large Soft Floating Planet / Orbital Gradient */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "-15%",
          width: 550,
          height: 550,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}33 0%, rgba(7, 12, 38, 0) 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* 2. Floating Dashed Planetary / Science Rings */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          right: "-10%",
          width: 480,
          height: 480,
          borderRadius: "50%",
          border: "3px dashed rgba(255, 255, 255, 0.15)",
          transform: `rotate(${frame * 0.1}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "-15%",
          width: 580,
          height: 580,
          borderRadius: "50%",
          border: "2px dashed rgba(56, 189, 248, 0.1)",
          transform: `rotate(${-frame * 0.08}deg)`,
        }}
      />

      {/* 3. Twinkling 4-Point Cartoon Stars */}
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Star 1 */}
        <g
          transform={`translate(140, 160) scale(${0.8 + Math.sin(frame * 0.1) * 0.3})`}
        >
          <path
            d="M 0 -15 Q 0 0 15 0 Q 0 0 0 15 Q 0 0 -15 0 Q 0 0 0 -15 Z"
            fill="#facc15"
          />
        </g>
        {/* Star 2 */}
        <g
          transform={`translate(920, 280) scale(${0.7 + Math.cos(frame * 0.12) * 0.25})`}
        >
          <path
            d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z"
            fill="#38bdf8"
          />
        </g>
        {/* Star 3 */}
        <g
          transform={`translate(220, 480) scale(${0.6 + Math.sin(frame * 0.09) * 0.2})`}
        >
          <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.6" />
        </g>
        {/* Star 4 */}
        <g
          transform={`translate(860, 680) scale(${0.9 + Math.sin(frame * 0.14) * 0.25})`}
        >
          <path
            d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z"
            fill="#f472b6"
          />
        </g>
        {/* Star 5 */}
        <g
          transform={`translate(100, 840) scale(${0.7 + Math.cos(frame * 0.08) * 0.2})`}
        >
          <circle cx="0" cy="0" r="5" fill="#facc15" opacity="0.7" />
        </g>
      </svg>

      {/* 4. Cartoon Laboratory Stage Floor / Ground Line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 380,
          background: "linear-gradient(to bottom, #0e1738 0%, #090f26 100%)",
          borderTop: `4px solid ${primaryColor}88`,
        }}
      >
        {/* Stage Grid Perspective Lines */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "60px 100%",
          }}
        />
        {/* Ground Glow Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 8,
            background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 80%)`,
            filter: "blur(4px)",
          }}
        />
      </div>
    </div>
  );
};

