import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  Audio,
  staticFile,
} from "remotion";
import { useInkBoil } from "../../useInkBoil";
import { InkStamp } from "../../InkStamp";

export const GpsScene3SpoofingAntenna: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useInkBoil();

  // Pulse waves from ground spoofer
  const pulse1 = (frame * 12) % 400;
  const pulse2 = ((frame + 18) * 12) % 400;
  const pulse3 = ((frame + 36) * 12) % 400;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {frame === 1 && <Audio src={staticFile("sfx/pen_scratch.mp3")} volume={0.65} />}

      <svg
        viewBox="0 0 1080 1920"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        <defs>
          <filter id="inkRough3">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* 1. Orbiting Genuine GPS Satellite (Top Left) */}
        <g transform={`translate(${280 + boil.x}, ${560 + boil.y})`}>
          {/* Satellite Core Box */}
          <rect x="-35" y="-35" width="70" height="70" fill="#f8fafc" stroke="#1e293b" strokeWidth="5" filter="url(#inkRough3)" />
          {/* Solar Panels */}
          <rect x="-135" y="-20" width="90" height="40" fill="#bae6fd" stroke="#0284c7" strokeWidth="4" />
          <rect x="45" y="-20" width="90" height="40" fill="#bae6fd" stroke="#0284c7" strokeWidth="4" />
          <line x1="-90" y1="-20" x2="-90" y2="20" stroke="#0284c7" strokeWidth="3" />
          <line x1="90" y1="-20" x2="90" y2="20" stroke="#0284c7" strokeWidth="3" />
          {/* Antenna Dish */}
          <path d="M -15 35 Q 0 55, 15 35 Z" fill="#64748b" stroke="#1e293b" strokeWidth="3" />

          {/* Label */}
          <text x="-120" y="-55" fill="#475569" fontSize="22" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            GENUINE GPS SATELLITE (12,000 MILES UP)
          </text>
          <text x="-90" y="85" fill="#16a34a" fontSize="20" fontWeight="bold" fontFamily="monospace">
            SIGNAL: -160 dBW (FAINT)
          </text>

          {/* Weak Faint Dotted Signal Waves */}
          <line x1="0" y1="55" x2="160" y2="420" stroke="#16a34a" strokeWidth="4" strokeDasharray="10, 10" />
        </g>

        {/* 2. Menacing Ground Electronic Warfare Spoofer (Bottom Right) */}
        <g transform={`translate(${780 + boil.x}, ${1180 + boil.y})`}>
          {/* Antenna Lattice Mast */}
          <polygon points="-25,120 25,120 0,-100" fill="none" stroke="#1e293b" strokeWidth="6" filter="url(#inkRough3)" />
          <line x1="-18" y1="40" x2="18" y2="40" stroke="#1e293b" strokeWidth="4" />
          <line x1="-12" y1="-20" x2="12" y2="-20" stroke="#1e293b" strokeWidth="4" />
          {/* Transmitter Emitter Tip */}
          <circle cx="0" cy="-105" r="14" fill="#dc2626" stroke="#1e293b" strokeWidth="4" />

          {/* Bold Red Overpowering Shockwaves */}
          {[pulse1, pulse2, pulse3].map((p, idx) => (
            <path
              key={idx}
              d={`M ${-p * 0.7} ${-105 - p * 0.9} Q 0 ${-105 - p * 1.3}, ${p * 0.7} ${-105 - p * 0.9}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth={Math.max(2, 8 * (1 - p / 400))}
              opacity={1 - p / 400}
            />
          ))}

          {/* Spoofer Labels */}
          <text x="-160" y="165" fill="#991b1b" fontSize="26" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            GROUND GPS SPOOFER
          </text>
          <text x="-130" y="195" fill="#dc2626" fontSize="20" fontWeight="bold" fontFamily="monospace">
            POWER: +30 dBW (OVERWHELMING)
          </text>
        </g>

        {/* 3. The Deceived Ship Receiver in the Middle */}
        <g transform={`translate(${440 + boil.x}, ${1120 + boil.y})`}>
          <path d="M -50 20 L 50 20 L 35 45 L -35 45 Z" fill="#0284c7" stroke="#0f172a" strokeWidth="4" />
          <rect x="-20" y="0" width="30" height="20" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" />
          <circle cx="-5" cy="-15" r="8" fill={frame % 8 < 4 ? "#dc2626" : "#f59e0b"} stroke="#0f172a" strokeWidth="3" />
          <text x="-80" y="75" fill="#475569" fontSize="20" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            SHIP ANTENNA OVERRIDDEN
          </text>
        </g>

        {/* Technical Explainer Callout Box */}
        <g transform="translate(80, 1260)">
          <rect x="0" y="0" width="460" height="95" rx="8" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          <text x="20" y="38" fill="#64748b" fontSize="17" fontWeight="bold" fontFamily="'Arial Black', sans-serif">
            MECHANISM: CLOCK DRIFT INJECTION
          </text>
          <text x="20" y="72" fill="#dc2626" fontSize="21" fontWeight="bold" fontFamily="monospace">
            TRANSMITTING FAKE PSEUDORANGES
          </text>
        </g>
      </svg>

      {/* Rubber Stamp */}
      <InkStamp
        text="⚡ SIGNAL HIJACK CONFIRMED ⚡"
        subtext="GROUND TRANSMITTER OVERRULES SATELLITE"
        color="#dc2626"
        top={220}
        left={80}
        appearFrame={75}
        rotation={-2}
      />
    </AbsoluteFill>
  );
};
