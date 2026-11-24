import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  Audio,
  staticFile,
} from "remotion";
import { useInkBoil } from "../../useInkBoil";
import { InkStamp } from "../../InkStamp";

export const GpsScene2GhostCircles: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useInkBoil();

  // Radar sweep angle (fast rotation)
  const sweepAngle = (frame * 5.2) % 360;

  // Compass needle wild spin
  const compassAngle = frame * 14.5;

  // Orbiting ghost ships
  const orbit1Angle = (frame * 0.05) % (Math.PI * 2);
  const orbit2Angle = (frame * 0.045 + 2.1) % (Math.PI * 2);
  const orbit3Angle = (frame * 0.04 + 4.2) % (Math.PI * 2);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Sound Effects */}
      {frame === 1 && <Audio src={staticFile("sfx/sonar.mp3")} volume={0.8} />}

      <svg
        viewBox="0 0 1080 1920"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="inkRough2">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* 1. Radar PPI Center Display */}
        <g transform={`translate(${540 + boil.x}, ${960 + boil.y})`}>
          {/* Subtle Green Radar Backdrop Wash */}
          <circle cx="0" cy="0" r="380" fill="#f0fdf4" opacity={0.6} />

          {/* Concentric Range Rings */}
          {[140, 260, 380].map((r, i) => (
            <circle
              key={i}
              cx="0"
              cy="0"
              r={r}
              fill="none"
              stroke="#16a34a"
              strokeWidth="4"
              strokeDasharray={i === 1 ? "12, 8" : undefined}
              filter="url(#inkRough2)"
            />
          ))}

          {/* Crosshair Axes */}
          <line x1="-390" y1="0" x2="390" y2="0" stroke="#15803d" strokeWidth="3" strokeDasharray="8, 6" />
          <line x1="0" y1="-390" x2="0" y2="390" stroke="#15803d" strokeWidth="3" strokeDasharray="8, 6" />

          {/* Rotating Radar Sweep Line */}
          <line
            x1="0"
            y1="0"
            x2={Math.cos((sweepAngle * Math.PI) / 180) * 380}
            y2={Math.sin((sweepAngle * Math.PI) / 180) * 380}
            stroke="#22c55e"
            strokeWidth="5"
          />

          {/* Ghost Carousel Orbit Paths */}
          <circle cx="0" cy="0" r="220" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="14, 10" />

          {/* Orbiting Ghost Ship 1 */}
          <g transform={`translate(${Math.cos(orbit1Angle) * 220}, ${Math.sin(orbit1Angle) * 220})`}>
            <polygon points="-12,-16 12,-16 0,16" fill="#dc2626" />
            <circle cx="0" cy="0" r="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
            <text x="16" y="5" fill="#dc2626" fontSize="16" fontWeight="bold" fontFamily="monospace">
              VESSEL_A
            </text>
          </g>

          {/* Orbiting Ghost Ship 2 */}
          <g transform={`translate(${Math.cos(orbit2Angle) * 220}, ${Math.sin(orbit2Angle) * 220})`}>
            <polygon points="-12,-16 12,-16 0,16" fill="#dc2626" />
            <circle cx="0" cy="0" r="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
            <text x="16" y="5" fill="#dc2626" fontSize="16" fontWeight="bold" fontFamily="monospace">
              VESSEL_B
            </text>
          </g>

          {/* Orbiting Ghost Ship 3 */}
          <g transform={`translate(${Math.cos(orbit3Angle) * 220}, ${Math.sin(orbit3Angle) * 220})`}>
            <polygon points="-12,-16 12,-16 0,16" fill="#dc2626" />
            <circle cx="0" cy="0" r="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
            <text x="16" y="5" fill="#dc2626" fontSize="16" fontWeight="bold" fontFamily="monospace">
              VESSEL_C
            </text>
          </g>
        </g>

        {/* 2. Wild Spinning Compass Display (Top Right) */}
        <g transform={`translate(${860 + boil.x}, ${420 + boil.y})`}>
          <circle cx="0" cy="0" r="90" fill="#ffffff" stroke="#1e293b" strokeWidth="4" filter="url(#inkRough2)" />
          <text x="-10" y="-60" fill="#dc2626" fontSize="20" fontWeight="bold" fontFamily="monospace">N</text>
          <text x="-8" y="75" fill="#475569" fontSize="18" fontWeight="bold" fontFamily="monospace">S</text>
          {/* Spinning Needle */}
          <g transform={`rotate(${compassAngle})`}>
            <polygon points="0,-75 14,0 -14,0" fill="#dc2626" />
            <polygon points="0,75 14,0 -14,0" fill="#475569" />
          </g>
          <text x="-65" y="125" fill="#b91c1c" fontSize="18" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            COMPASS SPIN
          </text>
        </g>

        {/* Telemetry Indicator */}
        <g transform="translate(100, 1260)">
          <rect x="0" y="0" width="520" height="80" rx="8" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          <text x="24" y="34" fill="#64748b" fontSize="18" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            MARITIME CIRCLE SPOOFING REPORT
          </text>
          <text x="24" y="66" fill="#dc2626" fontSize="22" fontWeight="bold" fontFamily="monospace">
            STATUS: 24+ SHIPS TRACING LOOPS
          </text>
        </g>
      </svg>

      {/* Rubber Stamp */}
      <InkStamp
        text="⚡ GHOST CAROUSEL DETECTED ⚡"
        subtext="CONTINUOUS 360° SATELLITE OVERRIDE"
        color="#0284c7"
        top={240}
        left={60}
        appearFrame={65}
        rotation={2}
      />
    </AbsoluteFill>
  );
};
