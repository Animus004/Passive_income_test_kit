import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

interface PropProps {
  frame: number;
  themeColor?: string;
  accentColor?: string;
  scale?: number;
  style?: React.CSSProperties;
}

/**
 * 1. Melting / Sweating Cartoon AI Server (Hero Scale)
 * Oversized cartoon server vibrating with excessive heat, sweating drops, and steam clouds.
 */
export const SweatingServerProp: React.FC<PropProps> = ({
  frame,
  scale = 1.0,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const bounce = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const tremor = Math.sin(frame * 1.5) * 6; // Heat vibration
  const sweatDropY = (frame * 3.5) % 65;

  return (
    <div
      style={{
        width: 480,
        height: 560,
        transform: `scale(${bounce * scale}) translateX(${tremor}px)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 420 480" fill="none">
        <defs>
          <linearGradient id="serverGradHero" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="heatGlowHero" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Heat Aura Glow */}
        <ellipse
          cx="210"
          cy="260"
          rx="180"
          ry="190"
          fill="url(#heatGlowHero)"
          opacity={0.22 + Math.sin(frame * 0.2) * 0.08}
          filter="blur(28px)"
        />

        {/* Billowing Steam Clouds */}
        <g opacity={0.85}>
          <circle cx={140 + Math.sin(frame * 0.1) * 12} cy={60 - (frame % 45)} r={16 + (frame % 20)} fill="#f8fafc" />
          <circle cx={260 + Math.cos(frame * 0.1) * 12} cy={50 - ((frame + 18) % 50)} r={18 + ((frame + 6) % 20)} fill="#f8fafc" />
          <circle cx={200 + Math.sin(frame * 0.12) * 10} cy={40 - ((frame + 30) % 55)} r={22 + ((frame + 12) % 20)} fill="#f8fafc" />
        </g>

        {/* Main Server Tower Chassis */}
        <rect x="65" y="90" width="270" height="360" rx="30" fill="url(#serverGradHero)" stroke="#64748b" strokeWidth="6" />

        {/* Server Bays */}
        <rect x="95" y="125" width="210" height="70" rx="14" fill="#0f172a" stroke="#475569" strokeWidth="4" />
        <rect x="95" y="215" width="210" height="70" rx="14" fill="#0f172a" stroke="#475569" strokeWidth="4" />
        <rect x="95" y="305" width="210" height="70" rx="14" fill="#0f172a" stroke="#475569" strokeWidth="4" />

        {/* Overheated Blinking Red Indicator LEDs */}
        <circle cx="120" cy="160" r="9" fill="#ef4444" />
        <circle cx="145" cy="160" r="9" fill="#ef4444" />
        <circle cx="120" cy="250" r="9" fill="#ef4444" />
        <circle cx="145" cy="250" r="9" fill="#f97316" />
        <circle cx="120" cy="340" r="9" fill="#ef4444" />
        <circle cx="145" cy="340" r="9" fill="#ef4444" />

        {/* Cute Worried Cartoon Face on Middle Bay */}
        <ellipse cx="180" cy="245" rx="12" ry="15" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
        <circle cx="183" cy="248" r="7" fill="#0f172a" />
        <ellipse cx="235" cy="245" rx="12" ry="15" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
        <circle cx="232" cy="248" r="7" fill="#0f172a" />

        {/* Wavy Trembling Mouth */}
        <path d="M 195 275 Q 208 268 220 275" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Big Blue Cartoon Sweat Drops */}
        <path
          d={`M 105 ${220 + sweatDropY} Q 95 ${235 + sweatDropY} 105 ${242 + sweatDropY} Q 115 ${235 + sweatDropY} 105 ${220 + sweatDropY}`}
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="2"
        />
        <path
          d={`M 295 ${235 + ((sweatDropY + 30) % 65)} Q 285 ${250 + ((sweatDropY + 30) % 65)} 295 ${257 + ((sweatDropY + 30) % 65)} Q 305 ${250 + ((sweatDropY + 30) % 65)} 295 ${235 + ((sweatDropY + 30) % 65)}`}
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="2"
        />

        {/* Blazing Cartoon Thermometer Clamped on Side */}
        <g transform="translate(355, 140)">
          <rect x="-12" y="0" width="24" height="170" rx="12" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
          <circle cx="0" cy="180" r="26" fill="#ef4444" stroke="#0f172a" strokeWidth="4" />
          {/* Mercury surging to top */}
          <rect x="-6" y="15" width="12" height="155" rx="6" fill="#ef4444" />
          {/* Blazing Cartoon Flame above thermometer */}
          <path d="M -14 5 Q 0 -25 14 5 Q 0 -10 -14 5 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

/**
 * 2. Liquid Immersion Cooling Tank (Hero Scale)
 * Giant glass tank with bubbling neon blue fluorochemical liquid and submerged glowing GPU boards.
 */
export const LiquidTankProp: React.FC<PropProps> = ({
  frame,
  scale = 1.0,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const bounce = spring({ frame, fps, config: { damping: 11, stiffness: 130 } });
  const bubble1Y = (frame * 5) % 240;
  const bubble2Y = ((frame + 25) * 4.2) % 240;
  const bubble3Y = ((frame + 55) * 5.4) % 240;

  return (
    <div
      style={{
        width: 520,
        height: 540,
        transform: `scale(${bounce * scale})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 460 480" fill="none">
        <defs>
          <linearGradient id="coolantGradHero" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.98" />
          </linearGradient>
        </defs>

        {/* Coolant Pipes Entering Top */}
        <rect x="110" y="20" width="35" height="60" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="4" />
        <rect x="315" y="20" width="35" height="60" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="4" />

        {/* Tank Outer Glass Enclosure */}
        <rect x="40" y="60" width="380" height="390" rx="36" fill="#0f172a" stroke="#38bdf8" strokeWidth="8" />

        {/* Animated Coolant Liquid Level */}
        <path
          d={`M 48 140 Q 140 ${132 + Math.sin(frame * 0.1) * 8} 230 140 Q 320 ${148 - Math.sin(frame * 0.1) * 8} 412 140 L 412 414 Q 412 442 384 442 L 76 442 Q 48 442 48 414 Z`}
          fill="url(#coolantGradHero)"
        />

        {/* 4 Submerged High-End GPU Blades Glowing Green */}
        <rect x="90" y="175" width="40" height="225" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="4" />
        <line x1="110" y1="190" x2="110" y2="385" stroke="#4ade80" strokeWidth="4" strokeDasharray="8 8" />

        <rect x="175" y="175" width="40" height="225" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="4" />
        <line x1="195" y1="190" x2="195" y2="385" stroke="#4ade80" strokeWidth="4" strokeDasharray="8 8" />

        <rect x="260" y="175" width="40" height="225" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="4" />
        <line x1="280" y1="190" x2="280" y2="385" stroke="#4ade80" strokeWidth="4" strokeDasharray="8 8" />

        <rect x="345" y="175" width="40" height="225" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="4" />
        <line x1="365" y1="190" x2="365" y2="385" stroke="#4ade80" strokeWidth="4" strokeDasharray="8 8" />

        {/* Bubbles Streaming Upwards */}
        <circle cx="110" cy={390 - bubble1Y} r="10" fill="rgba(255,255,255,0.8)" stroke="#ffffff" strokeWidth="2" />
        <circle cx="195" cy={390 - bubble2Y} r="14" fill="rgba(255,255,255,0.85)" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="280" cy={390 - bubble3Y} r="11" fill="rgba(255,255,255,0.8)" stroke="#ffffff" strokeWidth="2" />
        <circle cx="365" cy={390 - ((frame * 4.8) % 240)} r="12" fill="rgba(255,255,255,0.75)" stroke="#ffffff" strokeWidth="2" />

        {/* Glass Highlight Glint */}
        <path d="M 65 90 L 95 90 L 70 410 L 55 410 Z" fill="rgba(255,255,255,0.18)" />

        {/* Giant Top Pressure Gauge */}
        <rect x="180" y="32" width="100" height="32" rx="8" fill="#64748b" stroke="#334155" strokeWidth="4" />
        <circle cx="230" cy="48" r="20" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
        <line x1="230" y1="48" x2="242" y2="40" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/**
 * 3. Deep-Sea Submarine & Underwater Data Pod (Hero Scale)
 * Yellow submarine with searchlight illuminating underwater server domes with swimming fish.
 */
export const UnderwaterSubmarineProp: React.FC<PropProps> = ({
  frame,
  scale = 1.0,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const bounce = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });
  const subFloatY = Math.sin(frame * 0.08) * 16;
  const fishX = ((frame * 3.5) % 560) - 120;

  return (
    <div
      style={{
        width: 540,
        height: 540,
        transform: `scale(${bounce * scale})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 460 460" fill="none">
        {/* Ocean Trench Glass Window */}
        <rect x="25" y="25" width="410" height="410" rx="44" fill="#04132b" stroke="#0ea5e9" strokeWidth="6" />

        {/* Underwater Server Pod Capsule on Seabed */}
        <rect x="65" y="310" width="330" height="105" rx="52" fill="#1e293b" stroke="#38bdf8" strokeWidth="5" />
        <circle cx="115" cy="362" r="15" fill="#0f172a" stroke="#22c55e" strokeWidth="3.5" />
        <circle cx="115" cy="362" r="6" fill="#22c55e" />
        <circle cx="170" cy="362" r="15" fill="#0f172a" stroke="#22c55e" strokeWidth="3.5" />
        <circle cx="170" cy="362" r="6" fill="#22c55e" />
        <circle cx="225" cy="362" r="15" fill="#0f172a" stroke="#22c55e" strokeWidth="3.5" />
        <circle cx="225" cy="362" r="6" fill="#22c55e" />
        <circle cx="280" cy="362" r="15" fill="#0f172a" stroke="#38bdf8" strokeWidth="3.5" />
        <circle cx="280" cy="362" r="6" fill="#38bdf8" />
        <circle cx="335" cy="362" r="15" fill="#0f172a" stroke="#38bdf8" strokeWidth="3.5" />
        <circle cx="335" cy="362" r="6" fill="#38bdf8" />

        {/* Cute Yellow Cartoon Submarine */}
        <g transform={`translate(0, ${subFloatY})`}>
          {/* Searchlight Cone */}
          <polygon
            points="305,175 435,250 410,340 305,210"
            fill="rgba(254, 240, 138, 0.28)"
          />

          {/* Submarine Hull */}
          <ellipse cx="215" cy="190" rx="95" ry="58" fill="#facc15" stroke="#ca8a04" strokeWidth="5" />

          {/* Tower & Periscope */}
          <rect x="190" y="110" width="45" height="38" rx="10" fill="#facc15" stroke="#ca8a04" strokeWidth="4" />
          <path d="M 210 110 L 210 80 L 230 80" stroke="#ca8a04" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Round Porthole Window */}
          <circle cx="235" cy="190" r="24" fill="#38bdf8" stroke="#0f172a" strokeWidth="5" />
          <path d="M 222 180 L 248 200" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

          {/* Propeller Tail */}
          <rect x="105" y="180" width="18" height="20" fill="#a1a1aa" />
          <ellipse cx="98" cy={190} rx="5" ry={24 + Math.sin(frame * 0.8) * 10} fill="#71717a" stroke="#3f3f46" strokeWidth="2.5" />
        </g>

        {/* Cute Glowing Deep-Sea Angler Fish */}
        <g transform={`translate(${fishX}, 250)`}>
          <ellipse cx="0" cy="0" rx="18" ry="13" fill="#ec4899" />
          <polygon points="-16,0 -26,-10 -26,10" fill="#db2777" />
          <circle cx="8" cy="-3" r="3.5" fill="#ffffff" />
          <circle cx="9" cy="-3" r="1.8" fill="#0f172a" />
          <path d="M 5 -10 Q 15 -20 20 -15" stroke="#ec4899" strokeWidth="2.5" fill="none" />
          <circle cx="20" cy="-15" r="4" fill="#38bdf8" filter="blur(1px)" />
        </g>
      </svg>
    </div>
  );
};

/**
 * 4. Giant Cartoon Gauge / Infographic Stat Meter (Hero Scale)
 * Speedometer style dial with animated needle and bold text badge.
 */
export const CartoonGaugeProp: React.FC<PropProps & { valueText: string; labelText: string }> = ({
  frame,
  valueText,
  labelText,
  scale = 1.0,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const bounce = spring({ frame, fps, config: { damping: 9, stiffness: 140 } });
  const needleAngle = interpolate(frame, [0, 20, 40], [-60, 48, 38], {
    extrapolateRight: "clamp",
  });
  const needleTremor = Math.sin(frame * 1.8) * 5;

  return (
    <div
      style={{
        width: 500,
        height: 500,
        transform: `scale(${bounce * scale})`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="75%" viewBox="0 0 340 270" fill="none">
        <defs>
          <linearGradient id="gaugeArcGradHero" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Dial Face */}
        <circle cx="170" cy="180" r="135" fill="#0f172a" stroke="#334155" strokeWidth="10" />

        {/* Color Arc (Green to Red Danger) */}
        <path
          d="M 60 180 A 110 110 0 0 1 280 180"
          stroke="url(#gaugeArcGradHero)"
          strokeWidth="26"
          strokeLinecap="round"
          fill="none"
        />

        {/* Warning Hazard Zone Stripes at Top Right */}
        <circle cx="260" cy="120" r="16" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
        <text x="260" y="126" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900">!</text>

        {/* Animated Needle */}
        <g transform={`rotate(${needleAngle + needleTremor} 170 180)`}>
          <polygon points="163,180 177,180 172,70 168,70" fill="#f87171" stroke="#dc2626" strokeWidth="3" />
          <circle cx="170" cy="180" r="16" fill="#ffffff" stroke="#0f172a" strokeWidth="5" />
        </g>
      </svg>

      {/* Big Bold Cartoon Text Badge */}
      <div
        style={{
          marginTop: -25,
          background: "#0f172a",
          border: "5px solid #ef4444",
          borderRadius: 22,
          padding: "12px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 16px 36px rgba(0,0,0,0.7)",
        }}
      >
        <span style={{ fontSize: 54, fontWeight: 900, color: "#facc15", letterSpacing: -1 }}>
          {valueText}
        </span>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", letterSpacing: 2 }}>
          {labelText}
        </span>
      </div>
    </div>
  );
};
