import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import { useInkBoil } from "../../useInkBoil";
import { InkStamp } from "../../InkStamp";

export const GpsScene1ShipToAirport: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boil = useInkBoil();

  // Coastline draw animation
  const coastProgress = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: "clamp" });
  
  // Ship appear & position
  const shipSpring = spring({ frame: frame - 15, fps, config: { damping: 14 } });
  
  // Ghost jump to airport runway at frame 70
  const jumpProgress = interpolate(frame, [70, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glitch = frame > 68 && frame < 95 && frame % 4 < 2;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Sound Effects */}
      {frame === 1 && <Audio src={staticFile("sfx/pen_scratch.mp3")} volume={0.65} />}
      {frame === 72 && <Audio src={staticFile("sfx/sonar.mp3")} volume={0.8} />}

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 1080 1920"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="inkRough">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* 1. Translucent Blue Sea Watercolor Wash */}
        <path
          d="M 60 700 Q 300 750, 540 680 T 1020 720 L 1020 1500 L 60 1500 Z"
          fill="#e0f2fe"
          opacity={0.45}
        />

        {/* 2. Coastline Contour Ink Stroke */}
        <path
          d="M 60 700 Q 300 750, 540 680 T 1020 720"
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
          strokeDasharray="1200"
          strokeDashoffset={1200 * (1 - coastProgress)}
          strokeLinecap="round"
          filter="url(#inkRough)"
        />

        {/* Coast Label */}
        <text
          x={120 + boil.x}
          y={630 + boil.y}
          fill="#475569"
          fontSize="22"
          fontWeight="bold"
          letterSpacing="4"
          fontFamily="'Arial Black', sans-serif"
        >
          BLACK SEA COASTLINE (OFFSHORE CAUCASUS)
        </text>

        {/* 3a. Original Vessel Location Anchor (Ghost/Water Marker) */}
        <g transform={`translate(${320 + boil.x}, ${1120 + boil.y})`} opacity={jumpProgress > 0.3 ? 0.6 : 1}>
          {/* Water ripples */}
          <ellipse cx="0" cy="40" rx="90" ry="24" fill="none" stroke="#0284c7" strokeWidth="3" strokeDasharray="12, 8" />
          <path
            d="M -70 20 L 70 20 L 50 55 L -50 55 Z"
            fill="none"
            stroke="#0284c7"
            strokeWidth="4"
            strokeDasharray="8, 6"
          />
          <text
            x="-110"
            y="95"
            fill="#0369a1"
            fontSize="22"
            fontWeight="bold"
            fontFamily="'Arial Black', sans-serif"
          >
            REAL SHIP POSITION
          </text>
        </g>

        {/* 3b. The Reported / Glitched Vessel */}
        <g
          transform={`translate(${interpolate(jumpProgress, [0, 1], [320, 740]) + (glitch ? 15 : boil.x)}, ${interpolate(jumpProgress, [0, 1], [1120, 480]) + boil.y}) scale(${shipSpring})`}
        >
          {/* Ship Body */}
          <path
            d="M -70 20 L 70 20 L 50 55 L -50 55 Z"
            fill="#0284c7"
            stroke="#0f172a"
            strokeWidth="5"
            filter="url(#inkRough)"
          />
          {/* Deck Cabin */}
          <rect x="-30" y="-15" width="45" height="35" fill="#f8fafc" stroke="#0f172a" strokeWidth="4" />
          <line x1="0" y1="-15" x2="0" y2="-45" stroke="#0f172a" strokeWidth="4" />
          {/* Radar Scanner */}
          <circle cx="0" cy="-45" r="8" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
        </g>

        {/* Ghost Telemetry Leap Line */}
        {frame > 70 && (
          <path
            d="M 320 1120 Q 480 820, 740 480"
            fill="none"
            stroke="#dc2626"
            strokeWidth="5"
            strokeDasharray="16, 12"
            strokeLinecap="round"
          />
        )}

        {/* 4. The Inland Airport (Gelendzhik Airport Runway) */}
        <g transform={`translate(${740 + boil.x}, ${480 + boil.y})`}>
          {/* Runway Strip */}
          <rect
            x="-80"
            y="-18"
            width="160"
            height="36"
            transform="rotate(-28)"
            fill="#cbd5e1"
            stroke="#1e293b"
            strokeWidth="5"
            filter="url(#inkRough)"
          />
          {/* Runway Dashed Center Line */}
          <line
            x1="-65"
            y1="0"
            x2="65"
            y2="0"
            transform="rotate(-28)"
            stroke="#ffffff"
            strokeWidth="4"
            strokeDasharray="16, 10"
          />
          {/* Airport Tower & Label */}
          <circle cx="0" cy="-45" r="14" fill="#ef4444" stroke="#0f172a" strokeWidth="4" />
          <text
            x="-90"
            y="75"
            fill="#991b1b"
            fontSize="26"
            fontWeight="bold"
            fontFamily="'Arial Black', sans-serif"
          >
            AIRPORT RUNWAY
          </text>
          <text
            x="-70"
            y="105"
            fill="#dc2626"
            fontSize="20"
            fontWeight="bold"
            fontFamily="'Arial Black', sans-serif"
          >
            (20 MILES INLAND!)
          </text>
        </g>

        {/* Telemetry HUD Badge */}
        <g transform="translate(80, 1340)">
          <rect x="0" y="0" width="460" height="90" rx="8" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          <text x="20" y="38" fill="#475569" fontSize="18" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            GPS TELEMETRY ANOMALY
          </text>
          <text x="20" y="70" fill={frame % 16 < 8 ? "#dc2626" : "#0f172a"} fontSize="24" fontWeight="bold" fontFamily="monospace">
            POS: 44°34'N 38°01'E (ERR +20mi)
          </text>
        </g>
      </svg>

      {/* 5. Tactile Rubber Stamp */}
      <InkStamp
        text="⚡ IMPOSSIBLE LOCATION ⚡"
        subtext="VESSEL REPORTED 20 MILES ON RUNWAY"
        color="#dc2626"
        top={340}
        left={80}
        appearFrame={85}
        rotation={-3}
      />
    </AbsoluteFill>
  );
};
