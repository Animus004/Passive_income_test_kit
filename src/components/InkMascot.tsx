import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export type InkMascotPose = "inspecting" | "pointing" | "eureka" | "alert" | "idle";

interface InkMascotProps {
  pose?: InkMascotPose;
  x?: number;
  y?: number;
  scale?: number;
  flipHorizontal?: boolean;
}

export const InkMascot: React.FC<InkMascotProps> = ({
  pose = "inspecting",
  x = 100,
  y = 1380,
  scale = 1.0,
  flipHorizontal = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle breathing float (2.5s cycle)
  const floatY = Math.sin((frame / fps) * Math.PI * 1.6) * 5;
  const earWiggle = Math.sin((frame / fps) * Math.PI * 3.2) * 2;

  // Spring entry (starts visible at 0.88 and settles to 1.0, never collapses to 0)
  const springVal = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });
  const entry = interpolate(springVal, [0, 1], [0.88, 1]);

  // Scanner beam pulse for inspecting pose
  const scanSweep = (frame % 45) / 45;
  const scanOpacity = interpolate(scanSweep, [0, 0.5, 1], [0.8, 0.3, 0.8]);

  return (
    <g
      transform={`translate(${x}, ${y + floatY}) scale(${scale * entry}) ${flipHorizontal ? "scale(-1, 1)" : ""
        }`}
      style={{ pointerEvents: "none" }}
    >
      <defs>
        {/* Paper Shadow Filter */}
        <filter id="inkDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#1C1917" floodOpacity="0.12" />
        </filter>
        {/* Crosshatch Pattern for Ink Texture */}
        <pattern id="mascotHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#1C1917" strokeWidth="1" strokeOpacity="0.25" />
        </pattern>
      </defs>

      {/* --- CHARACTER BODY GROUP --- */}
      <g filter="url(#inkDropShadow)">
        {/* Bushy Technical Ink Tail */}
        <path
          d="M 40 160 C 10 170 -30 140 -40 100 C -45 70 -20 60 0 80 C -10 100 0 130 35 145 Z"
          fill="#F7F5F0"
          stroke="#1C1917"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Tail Crosshatch Accent */}
        <path
          d="M 20 155 C 0 165 -25 135 -30 105 C -35 80 -15 70 0 85 Z"
          fill="url(#mascotHatch)"
        />
        <path
          d="M -15 85 L 5 110 M -25 110 L -5 135 M -35 125 L -15 150"
          stroke="#0284C7"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />

        {/* Technical Trench Coat / Body */}
        <path
          d="M 50 110 L 30 180 L 130 180 L 110 110 Z"
          fill="#F7F5F0"
          stroke="#1C1917"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Coat Lapel & Blueprint Seam */}
        <path
          d="M 70 110 L 80 150 L 90 110"
          fill="none"
          stroke="#1C1917"
          strokeWidth="2.4"
        />
        <line x1="80" y1="150" x2="80" y2="180" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />
        {/* Coat Pocket with Scientific Pen */}
        <rect x="95" y="130" width="18" height="14" rx="2" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2" />
        <line x1="104" y1="124" x2="104" y2="134" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />

        {/* --- HEAD GROUP --- */}
        <g transform={`rotate(${pose === "eureka" ? -6 : pose === "alert" ? 5 : 0} 80 80)`}>
          {/* Left Ear */}
          <path
            d={`M 50 50 L 35 ${10 + earWiggle} L 70 35 Z`}
            fill="#F7F5F0"
            stroke="#1C1917"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d={`M 48 45 L 40 ${18 + earWiggle} L 62 36 Z`}
            fill="#EA580C"
            fillOpacity="0.25"
          />

          {/* Right Ear */}
          <path
            d={`M 90 35 L 125 ${10 - earWiggle} L 110 50 Z`}
            fill="#F7F5F0"
            stroke="#1C1917"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d={`M 98 36 L 120 ${18 - earWiggle} L 112 45 Z`}
            fill="#EA580C"
            fillOpacity="0.25"
          />

          {/* Stylized Geometric Fox Face Base */}
          <path
            d="M 45 50 Q 80 35 115 50 Q 130 80 115 105 L 80 125 L 45 105 Q 30 80 45 50 Z"
            fill="#F7F5F0"
            stroke="#1C1917"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Snout & Nose */}
          <path d="M 74 116 L 80 123 L 86 116 Z" fill="#1C1917" />
          <path d="M 68 102 Q 80 112 92 102" fill="none" stroke="#1C1917" strokeWidth="2" />

          {/* Left Eye (Sharp, Confident Ink Wink / Brow) */}
          <path d="M 52 74 Q 62 68 72 74" fill="none" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />
          <circle cx="62" cy="79" r="4.5" fill="#1C1917" />
          <circle cx="64" cy="77" r="1.5" fill="#FFFFFF" />

          {/* Right Eye: CYBER HUD OCULAR MONOCLE (The Visual Anchor) */}
          <circle cx="98" cy="78" r="14" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.6" />
          <circle cx="98" cy="78" r="11" fill="#0284C7" fillOpacity="0.15" stroke="#0284C7" strokeWidth="1.8" />
          {/* Crosshair Reticle in Monocle */}
          <line x1="86" y1="78" x2="110" y2="78" stroke="#0284C7" strokeWidth="1.2" strokeOpacity="0.7" />
          <line x1="98" y1="66" x2="98" y2="90" stroke="#0284C7" strokeWidth="1.2" strokeOpacity="0.7" />
          {/* Glowing Aperture Pupil */}
          <circle cx="98" cy="78" r="4" fill="#0284C7" />
          <circle cx="100" cy="76" r="1.5" fill="#FFFFFF" />

          {/* Ocular Monocle Frame Connection to Ear */}
          <path d="M 112 76 Q 120 72 122 62" fill="none" stroke="#0284C7" strokeWidth="1.8" />
          <circle cx="122" cy="62" r="2.5" fill="#EA580C" />

          {/* Eureka Lightbulb / Hologram Indicator */}
          {pose === "eureka" && (
            <g transform="translate(72, -15)">
              <circle cx="8" cy="8" r="12" fill="#EA580C" fillOpacity="0.2" stroke="#EA580C" strokeWidth="2" />
              <text x="8" y="13" textAnchor="middle" fill="#EA580C" fontFamily="monospace" fontSize="14" fontWeight="bold">!</text>
              <line x1="8" y1="-8" x2="8" y2="-2" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
              <line x1="-4" y1="-4" x2="0" y2="0" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="-4" x2="16" y2="0" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Alert Warning Beacon */}
          {pose === "alert" && (
            <g transform="translate(68, -12)">
              <rect x="0" y="0" width="24" height="14" rx="3" fill="#DC2626" />
              <text x="12" y="11" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace" fontSize="9" fontWeight="bold">ALERT</text>
            </g>
          )}
        </g>

        {/* --- ARMS & PROPS (Pose-Dependent) --- */}

        {/* POSE 1: INSPECTING (Holding Engineering Caliper / Magnifying Lens) */}
        {pose === "inspecting" && (
          <g transform="translate(100, 100)">
            {/* Holographic Laser Beam from Monocle onto Canvas */}
            <polygon
              points="0,-22 90,-40 110,40"
              fill="#0284C7"
              fillOpacity={scanOpacity * 0.18}
            />
            {/* Right Arm Reaching Forward with Magnifying Lens */}
            <path
              d="M 5 25 Q 30 20 55 10"
              fill="none"
              stroke="#1C1917"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Magnifying Glass Frame */}
            <circle cx="75" cy="5" r="18" fill="#F7F5F0" fillOpacity="0.4" stroke="#1C1917" strokeWidth="3" />
            <circle cx="75" cy="5" r="15" fill="#0284C7" fillOpacity="0.12" stroke="#0284C7" strokeWidth="1.5" />
            {/* Glass Glare */}
            <path d="M 66 -4 Q 72 -8 80 -4" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            {/* Handle */}
            <line x1="62" y1="18" x2="48" y2="32" stroke="#1C1917" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="62" y1="18" x2="48" y2="32" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* POSE 2: POINTING (Directing attention to blueprint hero simulation) */}
        {pose === "pointing" && (
          <g transform="translate(95, 110)">
            {/* Extended Arm */}
            <path
              d="M 10 20 L 70 -20"
              fill="none"
              stroke="#1C1917"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            {/* Stylus / Pointer Pen */}
            <line x1="65" y1="-16" x2="95" y2="-36" stroke="#0284C7" strokeWidth="3.2" strokeLinecap="round" />
            {/* Blueprint Target Ring */}
            <circle cx="102" cy="-42" r="6" fill="none" stroke="#EA580C" strokeWidth="2" strokeDasharray="2 2" />
          </g>
        )}

        {/* POSE 3: EUREKA / IDLE (Arms Folded / Thumbs Up) */}
        {(pose === "eureka" || pose === "idle") && (
          <g transform="translate(40, 130)">
            {/* Left Arm Folded */}
            <path d="M 0 10 Q 40 30 80 10" fill="none" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" />
            {/* Thumbs up badge */}
            <circle cx="82" cy="10" r="10" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.4" />
            <path d="M 78 10 L 82 14 L 88 6" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* Mascot Blueprint Tag Underneath */}
        <g transform="translate(35, 195)">
          <rect x="0" y="0" width="90" height="20" rx="4" fill="#1C1917" />
          <text
            x="45"
            y="14"
            textAnchor="middle"
            fill="#0284C7"
            fontFamily="'Courier New', monospace"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1px"
          >
            CIPHER // 01
          </text>
        </g>
      </g>
    </g>
  );
};
