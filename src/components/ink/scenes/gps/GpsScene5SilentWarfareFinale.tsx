import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  Audio,
  staticFile,
} from "remotion";
import { useInkBoil } from "../../useInkBoil";
import { InkStamp } from "../../InkStamp";

export const GpsScene5SilentWarfareFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useInkBoil();

  // Globe slow rotation
  const globeAngle = frame * 0.4;
  const glitch = frame > 90 && frame % 6 < 2;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {frame === 1 && <Audio src={staticFile("sfx/pen_scratch.mp3")} volume={0.65} />}

      <svg
        viewBox="0 0 1080 1920"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="inkRough5">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* 1. Global Wireframe Earth with Ink Boil */}
        <g transform={`translate(${540 + boil.x}, ${940 + boil.y})`}>
          {/* Subtle Blue Earth Wash */}
          <circle cx="0" cy="0" r="320" fill="#eff6ff" opacity={0.6} />

          {/* Outer Earth Silhouette */}
          <circle cx="0" cy="0" r="320" fill="none" stroke="#1e293b" strokeWidth="6" filter="url(#inkRough5)" />

          {/* Latitude Lines */}
          {[-200, -100, 0, 100, 200].map((y, i) => (
            <ellipse
              key={i}
              cx="0"
              cy={y}
              rx={Math.sqrt(320 * 320 - y * y)}
              ry={Math.sqrt(320 * 320 - y * y) * 0.28}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3"
              strokeDasharray="10, 8"
            />
          ))}

          {/* Rotating Longitude Meridians */}
          {[-120, -60, 0, 60, 120].map((deg, i) => {
            const rx = Math.abs(Math.sin(((deg + globeAngle) * Math.PI) / 180) * 320);
            return (
              <ellipse
                key={i}
                cx="0"
                cy="0"
                rx={rx}
                ry="320"
                fill="none"
                stroke="#64748b"
                strokeWidth="3"
                strokeDasharray="12, 10"
              />
            );
          })}

          {/* Glowing Red Digital Glitch Fracture across Eurasia */}
          <path
            d="M -180 -40 L -60 20 L 40 -80 L 140 10 L 240 -30"
            fill="none"
            stroke={glitch ? "#ffffff" : "#dc2626"}
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Glitch Target Blip */}
          <circle cx="40" cy="-80" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="4" />
          <text x="65" y="-72" fill="#dc2626" fontSize="24" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            BLACK SEA ANOMALY
          </text>
        </g>

        {/* 2. Key Takeaway Technical Callout Box */}
        <g transform="translate(100, 1220)">
          <rect x="0" y="0" width="560" height="95" rx="10" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          <text x="24" y="38" fill="#475569" fontSize="18" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            GLOBAL INFRASTRUCTURE LESSON
          </text>
          <text x="24" y="72" fill="#0f172a" fontSize="22" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            WHO CONTROLS TIME, CONTROLS POSITION.
          </text>
        </g>
      </svg>

      {/* Rubber Stamp */}
      <InkStamp
        text="⚡ DIGITAL REALITY HACKED ⚡"
        subtext="CIVILIAN TELEMETRY IS SILENTLY VULNERABLE"
        color="#dc2626"
        top={240}
        left={80}
        appearFrame={60}
        rotation={-3}
      />
    </AbsoluteFill>
  );
};
