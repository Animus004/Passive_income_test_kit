import React from "react";

interface BlackoutSkylineEnvironmentProps {
  frame: number;
}

export const BlackoutSkylineEnvironment: React.FC<BlackoutSkylineEnvironmentProps> = ({ frame }) => {
  // Spark arc active between frame 15 and 35
  const isSparking = frame >= 15 && frame <= 35 && frame % 2 === 0;
  // City lights go completely out after frame 30!
  const isBlackedOut = frame >= 30;

  return (
    <g>
      {/* 1. Night Sky Background (Graduating from Deep Slate to Pitch Black) */}
      <rect width="1080" height="1260" fill={isBlackedOut ? "#020617" : "#0F172A"} />

      {/* Crescent Moon & Stars (Glow brighter in blackout) */}
      <circle cx="880" cy="180" r="45" fill="#FEF08A" opacity={isBlackedOut ? 0.95 : 0.6} filter="drop-shadow(0 0 16px #FEF08A)" />
      <circle cx="895" cy="170" r="40" fill={isBlackedOut ? "#020617" : "#0F172A"} />

      {Array.from({ length: 18 }).map((_, i) => (
        <circle
          key={`star_${i}`}
          cx={(i * 137) % 1040 + 20}
          cy={(i * 93) % 450 + 60}
          r={isBlackedOut ? 3.5 : 2}
          fill="#FFFFFF"
          opacity={isBlackedOut ? 0.9 : 0.4}
        />
      ))}

      {/* 2. DOWNTOWN SKYSCRAPER SILHOUETTES */}
      {/* Skyscraper 1 (Left Tall Spire) */}
      <g transform="translate(60, 240)">
        <polygon points="40,0 80,0 120,400 0,400" fill="#1E293B" stroke="#000000" strokeWidth="6" />
        <line x1="60" y1="-60" x2="60" y2="0" stroke="#000000" strokeWidth="6" />
        {/* Windows */}
        {Array.from({ length: 10 }).map((_, r) => (
          <circle
            key={`w1_${r}`}
            cx="60"
            cy={50 + r * 30}
            r="6"
            fill={!isBlackedOut && r % 2 === 0 ? "#FEF08A" : "#090D16"}
          />
        ))}
      </g>

      {/* Skyscraper 2 (Center Massive Office Tower) */}
      <g transform="translate(260, 160)">
        <rect width="240" height="880" rx="4" fill="#18181B" stroke="#000000" strokeWidth="8" />
        {/* Window Grids */}
        {Array.from({ length: 12 }).map((_, r) => (
          <g key={`w_row_${r}`}>
            <rect x="30" y={40 + r * 60} width="35" height="30" fill={!isBlackedOut ? "#FEF08A" : "#090D16"} />
            <rect x="85" y={40 + r * 60} width="35" height="30" fill={!isBlackedOut && r % 3 !== 0 ? "#FEF08A" : "#090D16"} />
            <rect x="140" y={40 + r * 60} width="35" height="30" fill={!isBlackedOut ? "#FEF08A" : "#090D16"} />
            <rect x="195" y={40 + r * 60} width="15" height="30" fill={!isBlackedOut && r % 2 === 0 ? "#FEF08A" : "#090D16"} />
          </g>
        ))}
      </g>

      {/* Skyscraper 3 (Right Twin Towers) */}
      <g transform="translate(580, 220)">
        <rect width="180" height="820" rx="4" fill="#1E293B" stroke="#000000" strokeWidth="8" />
        {Array.from({ length: 10 }).map((_, r) => (
          <g key={`w3_${r}`}>
            <rect x="25" y={40 + r * 65} width="40" height="30" fill={!isBlackedOut ? "#FEF08A" : "#090D16"} />
            <rect x="85" y={40 + r * 65} width="40" height="30" fill={!isBlackedOut && r % 2 !== 0 ? "#FEF08A" : "#090D16"} />
          </g>
        ))}
      </g>

      {/* Skyscraper 4 (Far Right) */}
      <g transform="translate(820, 320)">
        <rect width="190" height="720" rx="4" fill="#0F172A" stroke="#000000" strokeWidth="8" />
        {Array.from({ length: 8 }).map((_, r) => (
          <rect key={`w4_${r}`} x="40" y={40 + r * 65} width="110" height="25" fill={!isBlackedOut ? "#38BDF8" : "#090D16"} />
        ))}
      </g>

      {/* 3. ELECTRICAL SUBSTATION IN MIDGROUND WITH TRANSFORMER SPARKS */}
      <g transform="translate(420, 840)">
        {/* High Voltage Transformer Base */}
        <rect width="240" height="180" rx="10" fill="#334155" stroke="#000000" strokeWidth="8" />
        {/* Cooling Coils */}
        <line x1="30" y1="30" x2="30" y2="150" stroke="#0F172A" strokeWidth="10" />
        <line x1="70" y1="30" x2="70" y2="150" stroke="#0F172A" strokeWidth="10" />
        <line x1="110" y1="30" x2="110" y2="150" stroke="#0F172A" strokeWidth="10" />
        <line x1="150" y1="30" x2="150" y2="150" stroke="#0F172A" strokeWidth="10" />
        <line x1="190" y1="30" x2="190" y2="150" stroke="#0F172A" strokeWidth="10" />

        {/* Transformer Ceramic Bushings */}
        <rect x="40" y="-45" width="28" height="45" fill="#B45309" stroke="#000000" strokeWidth="6" />
        <rect x="172" y="-45" width="28" height="45" fill="#B45309" stroke="#000000" strokeWidth="6" />

        {/* ELECTRIC BLUE LIGHTNING ARC SPARKS */}
        {isSparking && (
          <g>
            <circle cx="54" cy="-45" r="50" fill="#38BDF8" opacity="0.6" filter="blur(14px)" />
            <path
              d="M 54 -45 L 80 -120 L 110 -60 L 150 -140 L 186 -45"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeLinecap="round"
              filter="drop-shadow(0 0 12px #38BDF8)"
            />
            <path
              d="M 54 -45 L 90 -80 L 130 -110 L 186 -45"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>

      {/* Rooftop Parapet Wall (Foreground Base) */}
      <rect x="0" y="1120" width="1080" height="800" fill="#1E293B" stroke="#000000" strokeWidth="10" />
      <rect x="0" y="1100" width="1080" height="30" fill="#334155" stroke="#000000" strokeWidth="6" />
    </g>
  );
};
