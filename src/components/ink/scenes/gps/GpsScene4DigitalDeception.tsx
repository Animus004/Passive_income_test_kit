import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Audio,
  staticFile,
} from "remotion";
import { useInkBoil } from "../../useInkBoil";
import { InkStamp } from "../../InkStamp";

export const GpsScene4DigitalDeception: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useInkBoil();

  // Expanding protective geo-fence dome
  const domeRadius = interpolate(frame, [0, 50], [80, 260], { extrapolateRight: "clamp" });
  const pulse = Math.sin(frame * 0.12) * 8;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {frame === 1 && <Audio src={staticFile("sfx/pen_scratch.mp3")} volume={0.65} />}

      <svg
        viewBox="0 0 1080 1920"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="inkRough4">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* 1. Sensitive Coastal Palace / High-Security Compound */}
        <g transform={`translate(${540 + boil.x}, ${920 + boil.y})`}>
          {/* Compound Ground Pad */}
          <rect x="-140" y="-80" width="280" height="160" rx="12" fill="#fef3c7" stroke="#b45309" strokeWidth="4" />
          <polygon points="-80, -20 -40, -60 0, -20" fill="#f59e0b" stroke="#78350f" strokeWidth="3" />
          <polygon points="0, -20 40, -60 80, -20" fill="#f59e0b" stroke="#78350f" strokeWidth="3" />
          <rect x="-70" y="-20" width="140" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="4" />
          <rect x="-20" y="0" width="40" height="40" fill="#d97706" />

          {/* Compound Label */}
          <text x="-130" y="115" fill="#78350f" fontSize="24" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            HIGH-SECURITY COASTAL SITE
          </text>

          {/* 2. Protective Spoofing Anti-Drone Dome Bubble */}
          <circle
            cx="0"
            cy="0"
            r={domeRadius + pulse}
            fill="#dbeafe"
            opacity={0.35}
            stroke="#2563eb"
            strokeWidth="5"
            strokeDasharray="16, 10"
            filter="url(#inkRough4)"
          />

          {/* Drones Locked in Forced Circle Pattern */}
          {[-180, 0, 180].map((offset, i) => {
            const angle = (frame * 0.06 + i * 2.0) % (Math.PI * 2);
            const r = 210;
            return (
              <g key={i} transform={`translate(${Math.cos(angle) * r}, ${Math.sin(angle) * r})`}>
                <circle cx="0" cy="0" r="10" fill="#dc2626" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#0f172a" strokeWidth="3" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#0f172a" strokeWidth="3" />
                <text x="14" y="-8" fill="#991b1b" fontSize="16" fontWeight="bold" fontFamily="monospace">
                  DRONE_LOCKED
                </text>
              </g>
            );
          })}
        </g>

        {/* 3. The Deception Logic Box */}
        <g transform="translate(100, 1220)">
          <rect x="0" y="0" width="560" height="110" rx="10" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          <text x="24" y="38" fill="#475569" fontSize="18" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            WHY THE AIRPORT FAKE LOCATION?
          </text>
          <text x="24" y="70" fill="#0284c7" fontSize="20" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            Commercial drones have hardcoded firmware:
          </text>
          <text x="24" y="96" fill="#dc2626" fontSize="19" fontWeight="bold" fontFamily="monospace">
            "CANNOT FLY INSIDE AIRPORT ZONES" ➔ FORCED LAND
          </text>
        </g>
      </svg>

      {/* Rubber Stamp */}
      <InkStamp
        text="⚡ VIP ANTI-DRONE DOME ⚡"
        subtext="FORCED AIRPORT NO-FLY OVERRIDE"
        color="#059669"
        top={240}
        left={80}
        appearFrame={80}
        rotation={2}
      />
    </AbsoluteFill>
  );
};
