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
 * 1. Melting / Sweating Cartoon AI Server
 * Cute cartoon server vibrating with excessive heat, sweating drops, and steam clouds.
 */
export const SweatingServerProp: React.FC<PropProps> = ({
  frame,
  scale = 1.0,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const bounce = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const tremor = Math.sin(frame * 1.5) * 4; // Heat vibration
  const sweatDropY = (frame * 3) % 45;

  return (
    <div
      style={{
        width: 320,
        height: 420,
        transform: `scale(${bounce * scale}) translateX(${tremor}px)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 280 360" fill="none">
        <defs>
          <linearGradient id="serverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="heatGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Heat Aura */}
        <ellipse
          cx="140"
          cy="200"
          rx="120"
          ry="140"
          fill="url(#heatGlow)"
          opacity={0.15 + Math.sin(frame * 0.2) * 0.05}
          filter="blur(20px)"
        />

        {/* Steam Puffs */}
        <g opacity={0.75}>
          <circle cx={100 + Math.sin(frame * 0.1) * 8} cy={40 - (frame % 30)} r={10 + (frame % 15)} fill="#f1f5f9" />
          <circle cx={170 + Math.cos(frame * 0.1) * 8} cy={30 - ((frame + 12) % 35)} r={12 + ((frame + 5) % 15)} fill="#f1f5f9" />
        </g>

        {/* Main Server Tower */}
        <rect x="50" y="70" width="180" height="250" rx="20" fill="url(#serverGrad)" stroke="#64748b" strokeWidth="5" />

        {/* Server Bays */}
        <rect x="70" y="95" width="140" height="50" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="3" />
        <rect x="70" y="160" width="140" height="50" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="3" />
        <rect x="70" y="225" width="140" height="50" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="3" />

        {/* Overheated Red Lights */}
        <circle cx="85" cy="120" r="6" fill="#ef4444" />
        <circle cx="102" cy="120" r="6" fill="#ef4444" />
        <circle cx="85" cy="185" r="6" fill="#ef4444" />
        <circle cx="102" cy="185" r="6" fill="#f97316" />

        {/* Cute Cartoon Worried Face on Server */}
        {/* Worried Eyes */}
        <ellipse cx="125" cy="180" rx="8" ry="10" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="127" cy="182" r="5" fill="#0f172a" />
        <ellipse cx="165" cy="180" rx="8" ry="10" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="163" cy="182" r="5" fill="#0f172a" />

        {/* Wavy Worried Mouth */}
        <path d="M 135 200 Q 145 195 155 200" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Sweating Drops */}
        <path
          d={`M 75 ${165 + sweatDropY} Q 68 ${175 + sweatDropY} 75 ${180 + sweatDropY} Q 82 ${175 + sweatDropY} 75 ${165 + sweatDropY}`}
          fill="#38bdf8"
        />
        <path
          d={`M 205 ${175 + ((sweatDropY + 20) % 45)} Q 198 ${185 + ((sweatDropY + 20) % 45)} 205 ${190 + ((sweatDropY + 20) % 45)} Q 212 ${185 + ((sweatDropY + 20) % 45)} 205 ${175 + ((sweatDropY + 20) % 45)}`}
          fill="#38bdf8"
        />

        {/* Blazing Thermometer Gauge clamped to the side */}
        <g transform="translate(235, 110)">
          <rect x="-8" y="0" width="16" height="110" rx="8" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
          <circle cx="0" cy="115" r="18" fill="#ef4444" stroke="#0f172a" strokeWidth="3" />
          {/* Mercury surging to top */}
          <rect x="-4" y="10" width="8" height="95" rx="4" fill="#ef4444" />
          {/* Flame at top of thermometer */}
          <path d="M -8 5 Q 0 -15 8 5 Q 0 -5 -8 5 Z" fill="#eab308" />
        </g>
      </svg>
    </div>
  );
};

/**
 * 2. Liquid Immersion Tank
 * Glass container filled with bubbling neon blue fluorochemical liquid.
 */
export const LiquidTankProp: React.FC<PropProps> = ({
  frame,
  scale = 1.0,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const bounce = spring({ frame, fps, config: { damping: 11, stiffness: 130 } });
  const bubble1Y = (frame * 4) % 180;
  const bubble2Y = ((frame + 20) * 3.5) % 180;
  const bubble3Y = ((frame + 45) * 4.2) % 180;

  return (
    <div
      style={{
        width: 380,
        height: 420,
        transform: `scale(${bounce * scale})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 340 380" fill="none">
        <defs>
          <linearGradient id="coolantGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Tank Glass Base */}
        <rect x="40" y="50" width="260" height="280" rx="28" fill="#0f172a" stroke="#38bdf8" strokeWidth="6" />

        {/* Coolant Liquid Level */}
        <path
          d={`M 46 110 Q 110 ${105 + Math.sin(frame * 0.1) * 6} 170 110 Q 230 ${115 - Math.sin(frame * 0.1) * 6} 294 110 L 294 300 Q 294 324 270 324 L 70 324 Q 46 324 46 300 Z`}
          fill="url(#coolantGrad)"
        />

        {/* Submerged GPU Cards Glowing Cyan/Green */}
        <rect x="90" y="140" width="28" height="150" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="3" />
        <line x1="104" y1="150" x2="104" y2="280" stroke="#4ade80" strokeWidth="3" strokeDasharray="6 6" />

        <rect x="156" y="140" width="28" height="150" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="3" />
        <line x1="170" y1="150" x2="170" y2="280" stroke="#4ade80" strokeWidth="3" strokeDasharray="6 6" />

        <rect x="222" y="140" width="28" height="150" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="3" />
        <line x1="236" y1="150" x2="236" y2="280" stroke="#4ade80" strokeWidth="3" strokeDasharray="6 6" />

        {/* Bubbles Rising */}
        <circle cx="104" cy={290 - bubble1Y} r="7" fill="rgba(255,255,255,0.7)" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="170" cy={290 - bubble2Y} r="10" fill="rgba(255,255,255,0.75)" stroke="#ffffff" strokeWidth="2" />
        <circle cx="236" cy={290 - bubble3Y} r="8" fill="rgba(255,255,255,0.7)" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="140" cy={280 - ((frame * 2.8) % 160)} r="5" fill="rgba(255,255,255,0.6)" />

        {/* Glass Highlight Glint */}
        <path d="M 60 75 L 80 75 L 60 300 L 50 300 Z" fill="rgba(255,255,255,0.18)" />

        {/* Status Valve / Pressure Dial on Top */}
        <rect x="130" y="25" width="80" height="26" rx="6" fill="#64748b" stroke="#334155" strokeWidth="3" />
        <circle cx="170" cy="38" r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="170" y1="38" x2="178" y2="32" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/**
 * 3. Deep-Sea Cartoon Submarine & Underwater Servers
 * Yellow submarine with searchlight exploring deep dark waters with cartoon fish.
 */
export const UnderwaterSubmarineProp: React.FC<PropProps> = ({
  frame,
  scale = 1.0,
  style = {},
}) => {
  const { fps } = useVideoConfig();
  const bounce = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });
  const subFloatY = Math.sin(frame * 0.08) * 12;
  const fishX = ((frame * 3) % 450) - 100;

  return (
    <div
      style={{
        width: 420,
        height: 420,
        transform: `scale(${bounce * scale})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 380 380" fill="none">
        {/* Ocean Trench Backdrop */}
        <rect x="20" y="20" width="340" height="340" rx="36" fill="#04132b" stroke="#0ea5e9" strokeWidth="4" />

        {/* Underwater Server Pod Capsule on Seabed */}
        <rect x="70" y="240" width="240" height="85" rx="42" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
        <circle cx="110" cy="282" r="12" fill="#0f172a" stroke="#22c55e" strokeWidth="3" />
        <circle cx="110" cy="282" r="5" fill="#22c55e" />
        <circle cx="150" cy="282" r="12" fill="#0f172a" stroke="#22c55e" strokeWidth="3" />
        <circle cx="150" cy="282" r="5" fill="#22c55e" />
        <circle cx="190" cy="282" r="12" fill="#0f172a" stroke="#22c55e" strokeWidth="3" />
        <circle cx="190" cy="282" r="5" fill="#22c55e" />
        <circle cx="230" cy="282" r="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
        <circle cx="230" cy="282" r="5" fill="#38bdf8" />
        <circle cx="270" cy="282" r="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
        <circle cx="270" cy="282" r="5" fill="#38bdf8" />

        {/* Cute Yellow Cartoon Submarine */}
        <g transform={`translate(0, ${subFloatY})`}>
          {/* Searchlight Cone */}
          <polygon
            points="240,140 350,200 330,270 240,165"
            fill="rgba(254, 240, 138, 0.22)"
          />

          {/* Submarine Hull */}
          <ellipse cx="170" cy="150" rx="75" ry="46" fill="#facc15" stroke="#ca8a04" strokeWidth="4" />

          {/* Tower & Periscope */}
          <rect x="150" y="85" width="35" height="30" rx="8" fill="#facc15" stroke="#ca8a04" strokeWidth="3.5" />
          <path d="M 165 85 L 165 65 L 180 65" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Round Porthole Window */}
          <circle cx="185" cy="150" r="18" fill="#38bdf8" stroke="#0f172a" strokeWidth="4" />
          <path d="M 175 142 L 195 158" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

          {/* Propeller Tail */}
          <rect x="85" y="142" width="14" height="16" fill="#a1a1aa" />
          <ellipse cx="80" cy={150} rx="4" ry={18 + Math.sin(frame * 0.8) * 8} fill="#71717a" stroke="#3f3f46" strokeWidth="2" />
        </g>

        {/* Cute Glowing Deep-Sea Angler Fish */}
        <g transform={`translate(${fishX}, 200)`}>
          <ellipse cx="0" cy="0" rx="14" ry="10" fill="#ec4899" />
          <polygon points="-12,0 -20,-8 -20,8" fill="#db2777" />
          <circle cx="6" cy="-2" r="2.5" fill="#ffffff" />
          <circle cx="7" cy="-2" r="1.2" fill="#0f172a" />
          {/* Bioluminescent lure */}
          <path d="M 4 -8 Q 12 -16 16 -12" stroke="#ec4899" strokeWidth="2" fill="none" />
          <circle cx="16" cy="-12" r="3" fill="#38bdf8" filter="blur(1px)" />
        </g>
      </svg>
    </div>
  );
};

/**
 * 4. Giant Cartoon Gauge / Infographic Stat Meter
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
  const needleAngle = interpolate(frame, [0, 20, 40], [-60, 45, 35], {
    extrapolateRight: "clamp",
  });
  const needleTremor = Math.sin(frame * 1.8) * 4;

  return (
    <div
      style={{
        width: 380,
        height: 380,
        transform: `scale(${bounce * scale})`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      <svg width="100%" height="80%" viewBox="0 0 280 220" fill="none">
        <defs>
          <linearGradient id="gaugeArcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Dial Face */}
        <circle cx="140" cy="150" r="110" fill="#0f172a" stroke="#334155" strokeWidth="8" />

        {/* Color Arc (Green to Red Danger) */}
        <path
          d="M 50 150 A 90 90 0 0 1 230 150"
          stroke="url(#gaugeArcGrad)"
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />

        {/* Warning Hazard Zone Stripes at Top Right */}
        <circle cx="215" cy="100" r="12" fill="#ef4444" />
        <text x="215" y="105" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">!</text>

        {/* Animated Needle */}
        <g transform={`rotate(${needleAngle + needleTremor} 140 150)`}>
          <polygon points="135,150 145,150 141,60 139,60" fill="#f87171" stroke="#dc2626" strokeWidth="2" />
          <circle cx="140" cy="150" r="12" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
        </g>
      </svg>

      {/* Big Bold Cartoon Text Badge */}
      <div
        style={{
          marginTop: -20,
          background: "#0f172a",
          border: "4px solid #ef4444",
          borderRadius: 18,
          padding: "10px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 12px 28px rgba(0,0,0,0.6)",
        }}
      >
        <span style={{ fontSize: 44, fontWeight: 900, color: "#facc15", letterSpacing: -1 }}>
          {valueText}
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", letterSpacing: 2 }}>
          {labelText}
        </span>
      </div>
    </div>
  );
};

