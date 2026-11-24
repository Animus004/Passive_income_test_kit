import React from "react";

interface AtmEnvironmentProps {
  frame: number;
}

export const AtmEnvironment: React.FC<AtmEnvironmentProps> = ({ frame }) => {
  const errorBlink = Math.sin(frame * 0.5) > 0;

  return (
    <g>
      {/* 1. Bank Facade (Modern Granite / Slate Architecture) */}
      <rect width="1080" height="1260" fill="#334155" />
      {/* Upper Architectural Molding */}
      <rect width="1080" height="200" fill="#1E293B" stroke="#000000" strokeWidth="10" />

      {/* Security Camera on Corner */}
      <g transform="translate(100, 240) rotate(25)">
        <rect width="70" height="35" rx="6" fill="#0F172A" stroke="#000000" strokeWidth="5" />
        <ellipse cx="65" cy="17" rx="8" ry="12" fill="#EF4444" />
      </g>

      {/* 2. THE GIANT ATM KIOSK MACHINE (Center Wall) */}
      <g transform="translate(320, 280)">
        {/* Main ATM Cabinet Enclosure */}
        <rect width="440" height="920" rx="20" fill="#64748B" stroke="#000000" strokeWidth="12" />
        {/* ATM Top Canopy Branding */}
        <rect x="20" y="20" width="400" height="75" rx="10" fill="#0369A1" stroke="#000000" strokeWidth="8" />
        <text
          x="220"
          y="70"
          fill="#FFFFFF"
          fontSize="36"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          METRO ATM
        </text>

        {/* 3. ATM DISPLAY SCREEN */}
        <rect x="35" y="125" width="370" height="360" rx="12" fill="#0F172A" stroke="#000000" strokeWidth="10" />
        {/* Screen Bezel Inset */}
        <rect x="48" y="138" width="344" height="334" rx="6" fill="#18181B" />

        {/* Red Flashing Decline X Header */}
        <g transform="translate(220, 210)">
          <circle cx="0" cy="0" r="38" fill={errorBlink ? "#EF4444" : "#991B1B"} stroke="#000000" strokeWidth="6" />
          {/* Giant 'X' */}
          <line x1="-18" y1="-18" x2="18" y2="18" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
          <line x1="18" y1="-18" x2="-18" y2="18" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        </g>

        {/* ATM Error Status Text */}
        <text
          x="220"
          y="295"
          fill="#EF4444"
          fontSize="32"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          CARD DECLINED
        </text>
        <text
          x="220"
          y="340"
          fill="#FFFFFF"
          fontSize="22"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          SERVER UNREACHABLE
        </text>
        <text
          x="220"
          y="380"
          fill="#FDE047"
          fontSize="18"
          fontWeight="900"
          fontFamily="Arial"
          textAnchor="middle"
        >
          0 TRANSACTIONS APPROVED
        </text>
        <rect x="70" y="415" width="300" height="35" rx="6" fill="#DC2626" />
        <text
          x="220"
          y="439"
          fill="#FFFFFF"
          fontSize="16"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          SYSTEM OFFLINE: 0 BPS
        </text>

        {/* 4. ATM Mechanical Slots & Keypad */}
        {/* Card Insertion Slot */}
        <g transform="translate(80, 520)">
          <rect width="120" height="25" rx="6" fill="#1E293B" stroke="#000000" strokeWidth="5" />
          <rect x="15" y="8" width="90" height="8" rx="2" fill="#0284C7" />
          <text x="60" y="-8" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle">CARD SLOT</text>
        </g>

        {/* Receipt Slot */}
        <g transform="translate(240, 520)">
          <rect width="120" height="25" rx="6" fill="#1E293B" stroke="#000000" strokeWidth="5" />
          <rect x="15" y="8" width="90" height="8" rx="2" fill="#000000" />
          <text x="60" y="-8" fill="#FFFFFF" fontSize="12" fontWeight="900" textAnchor="middle">RECEIPT</text>
        </g>

        {/* Cash Dispenser Vault Door (LOCKED) */}
        <g transform="translate(90, 580)">
          <rect width="260" height="65" rx="8" fill="#0F172A" stroke="#000000" strokeWidth="6" />
          <text x="130" y="40" fill="#EF4444" fontSize="18" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
            VAULT LOCKED
          </text>
        </g>

        {/* Pin Keypad */}
        <g transform="translate(130, 680)">
          <rect width="180" height="150" rx="8" fill="#334155" stroke="#000000" strokeWidth="6" />
          {/* Keypad Buttons */}
          {Array.from({ length: 9 }).map((_, i) => (
            <rect
              key={`k_${i}`}
              x={20 + (i % 3) * 50}
              y={20 + Math.floor(i / 3) * 40}
              width="38"
              height="28"
              rx="4"
              fill="#E2E8F0"
              stroke="#000000"
              strokeWidth="3"
            />
          ))}
        </g>
      </g>

      {/* Sidewalk Floor */}
      <rect x="0" y="1260" width="1080" height="660" fill="#94A3B8" stroke="#000000" strokeWidth="10" />
      <line x1="0" y1="1450" x2="1080" y2="1450" stroke="#64748B" strokeWidth="6" />
    </g>
  );
};
