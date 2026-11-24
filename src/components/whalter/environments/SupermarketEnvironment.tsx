import React from "react";

interface SupermarketEnvironmentProps {
  frame: number;
}

export const SupermarketEnvironment: React.FC<SupermarketEnvironmentProps> = ({ frame }) => {
  return (
    <g>
      {/* 1. Supermarket Wall (Clean Commercial Mint / Off-White) */}
      <rect width="1080" height="1260" fill="#E2E8F0" />

      {/* Ceiling Fluorescent Lights */}
      <g transform="translate(180, 20)">
        <rect width="280" height="20" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="4" />
      </g>
      <g transform="translate(620, 20)">
        <rect width="280" height="20" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="4" />
      </g>

      {/* 2. THE GIANT INDUSTRIAL GROCERY SHELVING UNIT (Completely Empty) */}
      <g transform="translate(140, 280)">
        {/* Steel Uprights */}
        <rect x="0" y="0" width="28" height="920" fill="#475569" stroke="#000000" strokeWidth="6" />
        <rect x="772" y="0" width="28" height="920" fill="#475569" stroke="#000000" strokeWidth="6" />
        {/* Back Panel */}
        <rect x="28" y="0" width="744" height="920" fill="#CBD5E1" stroke="#000000" strokeWidth="6" />

        {/* Tier 1 Shelf (Top - Completely Empty) */}
        <rect x="15" y="180" width="770" height="35" rx="4" fill="#64748B" stroke="#000000" strokeWidth="6" />
        <text x="400" y="150" fill="#DC2626" fontSize="24" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
          [ SOLD OUT ]
        </text>

        {/* Tier 2 Shelf (Middle - 1 Lonely Can of Beans!) */}
        <rect x="15" y="440" width="770" height="35" rx="4" fill="#64748B" stroke="#000000" strokeWidth="6" />
        {/* THE SOLE REMAINING CAN OF BEANS */}
        <g transform="translate(380, 360)">
          {/* Spotlight circle on the beans */}
          <ellipse cx="20" cy="50" rx="35" ry="12" fill="#FEF08A" opacity="0.5" filter="blur(6px)" />
          {/* Tin Can */}
          <rect width="40" height="58" rx="6" fill="#94A3B8" stroke="#000000" strokeWidth="6" />
          <rect x="3" y="14" width="34" height="30" fill="#0284C7" />
          <text x="20" y="32" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
            BEANS
          </text>
        </g>
        <text x="180" y="415" fill="#64748B" fontSize="20" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
          NO RESTOCK
        </text>
        <text x="620" y="415" fill="#DC2626" fontSize="20" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
          DELIVERY HALTED
        </text>

        {/* Tier 3 Shelf (Bottom - Tumbled Cardboard Box) */}
        <rect x="15" y="700" width="770" height="35" rx="4" fill="#64748B" stroke="#000000" strokeWidth="6" />
        {/* Tumbled box */}
        <g transform="translate(560, 640) rotate(18)">
          <rect width="90" height="70" rx="6" fill="#B45309" stroke="#000000" strokeWidth="6" />
          <line x1="0" y1="35" x2="90" y2="35" stroke="#78350F" strokeWidth="4" />
        </g>
      </g>

      {/* Supermarket Tiled Floor */}
      <rect x="0" y="1250" width="1080" height="670" fill="#F8FAFC" stroke="#000000" strokeWidth="10" />
      {/* Tile Grid */}
      <line x1="0" y1="1450" x2="1080" y2="1450" stroke="#CBD5E1" strokeWidth="6" />
      <line x1="0" y1="1680" x2="1080" y2="1680" stroke="#CBD5E1" strokeWidth="6" />
    </g>
  );
};
