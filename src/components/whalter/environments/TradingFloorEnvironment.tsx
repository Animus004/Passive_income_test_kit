import React from "react";

interface TradingFloorEnvironmentProps {
  frame: number;
}

export const TradingFloorEnvironment: React.FC<TradingFloorEnvironmentProps> = ({ frame }) => {
  return (
    <g>
      {/* 1. Dark Trading Floor Wall */}
      <rect width="1080" height="1260" fill="#090D16" />

      {/* 2. ELECTRONIC STOCK TICKER WALL (Huge Red Crash Screens) */}
      <g transform="translate(100, 240)">
        {/* Main Electronic Board Bezel */}
        <rect width="880" height="380" rx="16" fill="#18181B" stroke="#000000" strokeWidth="10" />
        <rect x="18" y="18" width="844" height="344" rx="8" fill="#020617" />

        {/* Global Financial Status */}
        <text
          x="440"
          y="70"
          fill="#EF4444"
          fontSize="36"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          GLOBAL TRADING HALTED
        </text>
        <text
          x="440"
          y="105"
          fill="#FEF08A"
          fontSize="18"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          CIRCUIT BREAKERS TRIGGERED • 0 PACKETS
        </text>

        {/* Ticker Row */}
        <line x1="40" y1="130" x2="840" y2="130" stroke="#334155" strokeWidth="4" />
        <text x="80" y="175" fill="#EF4444" fontSize="28" fontWeight="900" fontFamily="Arial Black">
          NASDAQ ▼ -99.9%
        </text>
        <text x="480" y="175" fill="#EF4444" fontSize="28" fontWeight="900" fontFamily="Arial Black">
          S&P 500 ▼ 0.00
        </text>

        {/* Vertical Red Plunge Chart */}
        <path
          d="M 60 220 L 220 230 L 380 250 L 520 280 L 700 320 L 820 330"
          fill="none"
          stroke="#EF4444"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Downward Arrow */}
        <polygon points="820,330 790,310 810,300" fill="#EF4444" />
      </g>

      {/* Discarded Financial Papers / Ticker Tape on Wall & Floor */}
      <g transform="translate(180, 680) rotate(-12)">
        <rect width="90" height="120" rx="4" fill="#F8FAFC" stroke="#000000" strokeWidth="4" />
        <line x1="15" y1="30" x2="75" y2="30" stroke="#94A3B8" strokeWidth="4" />
        <line x1="15" y1="50" x2="75" y2="50" stroke="#94A3B8" strokeWidth="4" />
        <line x1="15" y1="70" x2="55" y2="70" stroke="#94A3B8" strokeWidth="4" />
      </g>
      <g transform="translate(800, 720) rotate(16)">
        <rect width="80" height="110" rx="4" fill="#F8FAFC" stroke="#000000" strokeWidth="4" />
        <text x="40" y="65" fill="#EF4444" fontSize="22" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
          $0.00
        </text>
      </g>

      {/* Warm Golden Candle Glow in Room Center */}
      <circle cx="540" cy="980" r="280" fill="#F59E0B" opacity="0.18" filter="blur(50px)" />

      {/* Floor */}
      <rect x="0" y="1250" width="1080" height="670" fill="#1E293B" stroke="#000000" strokeWidth="10" />
    </g>
  );
};
