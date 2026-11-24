import React from "react";

interface BedroomEnvironmentProps {
  frame: number;
}

export const BedroomEnvironment: React.FC<BedroomEnvironmentProps> = ({ frame }) => {
  const routerBlink = Math.sin(frame * 0.4) > 0;

  return (
    <g>
      {/* Background Wall: Late Night Bedroom */}
      <rect width="1080" height="1350" fill="#0B132B" />

      {/* Ceiling Lamp Glow */}
      <circle cx="540" cy="120" r="380" fill="#1C2541" opacity="0.6" filter="blur(40px)" />

      {/* Bedroom Window looking out at Night City */}
      <g transform="translate(140, 260)">
        <rect width="220" height="380" rx="8" fill="#111827" stroke="#000000" strokeWidth="12" />
        {/* City silhouette in window */}
        <rect x="20" y="240" width="45" height="130" fill="#1F2937" />
        <rect x="75" y="190" width="55" height="180" fill="#1F2937" />
        <rect x="140" y="220" width="50" height="150" fill="#1F2937" />
        {/* Window Cross Panes */}
        <line x1="110" y1="0" x2="110" y2="380" stroke="#000000" strokeWidth="10" />
        <line x1="0" y1="190" x2="220" y2="190" stroke="#000000" strokeWidth="10" />
      </g>

      {/* Wall Shelf with Wi-Fi Router */}
      <g transform="translate(680, 420)">
        {/* Wood Shelf */}
        <rect x="-40" y="120" width="280" height="24" rx="4" fill="#78350F" stroke="#000000" strokeWidth="6" />
        {/* Wi-Fi Router Body */}
        <rect x="20" y="65" width="160" height="55" rx="10" fill="#18181B" stroke="#000000" strokeWidth="8" />
        {/* Antennas */}
        <line x1="45" y1="65" x2="35" y2="-15" stroke="#18181B" strokeWidth="10" strokeLinecap="round" />
        <line x1="155" y1="65" x2="165" y2="-15" stroke="#18181B" strokeWidth="10" strokeLinecap="round" />
        {/* Blinking Red Signal LEDs */}
        <circle cx="55" cy="95" r="7" fill={routerBlink ? "#EF4444" : "#450A0A"} stroke="#000000" strokeWidth="2" />
        <circle cx="85" cy="95" r="7" fill={routerBlink ? "#EF4444" : "#450A0A"} stroke="#000000" strokeWidth="2" />
        <circle cx="115" cy="95" r="7" fill={routerBlink ? "#EF4444" : "#450A0A"} stroke="#000000" strokeWidth="2" />
        <circle cx="145" cy="95" r="7" fill={routerBlink ? "#EF4444" : "#450A0A"} stroke="#000000" strokeWidth="2" />
        {/* Glowing exclamation warning above router */}
        {routerBlink && (
          <g transform="translate(100, 10)">
            <circle cx="0" cy="0" r="18" fill="#EF4444" stroke="#000000" strokeWidth="4" />
            <text x="0" y="8" fill="#FFFFFF" fontSize="22" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">!</text>
          </g>
        )}
      </g>

      {/* Digital Alarm Clock on Nightstand */}
      <g transform="translate(740, 780)">
        <rect width="180" height="90" rx="12" fill="#000000" stroke="#334155" strokeWidth="8" />
        <text
          x="90"
          y="58"
          fill="#EF4444"
          fontSize="36"
          fontWeight="900"
          fontFamily="'Courier New', Courier, monospace"
          textAnchor="middle"
          filter="drop-shadow(0 0 6px #EF4444)"
        >
          12:01 AM
        </text>
      </g>

      {/* Bedroom Floor (Wooden Planks) */}
      <rect x="0" y="1250" width="1080" height="670" fill="#3E2723" stroke="#000000" strokeWidth="10" />
      {/* Floor plank perspective lines */}
      <line x1="0" y1="1450" x2="1080" y2="1450" stroke="#271815" strokeWidth="6" />
      <line x1="0" y1="1680" x2="1080" y2="1680" stroke="#271815" strokeWidth="6" />
    </g>
  );
};
