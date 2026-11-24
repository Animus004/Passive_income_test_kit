import React from "react";

interface DevicesGlitchEnvironmentProps {
  frame: number;
}

export const DevicesGlitchEnvironment: React.FC<DevicesGlitchEnvironmentProps> = ({ frame }) => {
  return (
    <g>
      {/* Dark Technical Matrix Background */}
      <rect width="1080" height="1350" fill="#090D16" />

      {/* Cyber Grid Lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`grid_h_${i}`}
          x1="0"
          y1={200 + i * 140}
          x2="1080"
          y2={200 + i * 140}
          stroke="#1E293B"
          strokeWidth="3"
          opacity="0.4"
        />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={`grid_v_${i}`}
          x1={100 + i * 150}
          y1="100"
          x2={100 + i * 150}
          y2="1350"
          stroke="#1E293B"
          strokeWidth="3"
          opacity="0.4"
        />
      ))}

      {/* 1. Large Central Floating Frozen Laptop */}
      <g transform="translate(340, 280)">
        {/* Laptop Screen Bezel */}
        <rect width="400" height="260" rx="14" fill="#18181B" stroke="#000000" strokeWidth="10" />
        {/* Blue Glitch Screen */}
        <rect x="18" y="18" width="364" height="224" rx="6" fill="#0369A1" />
        {/* Warning Skull / Disconnected Dino */}
        <circle cx="200" cy="95" r="32" fill="#FFFFFF" stroke="#000000" strokeWidth="5" />
        <circle cx="188" cy="92" r="6" fill="#000000" />
        <circle cx="212" cy="92" r="6" fill="#000000" />
        <line x1="184" y1="112" x2="216" y2="112" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
        {/* Glitch Error Text */}
        <text
          x="200"
          y="160"
          fill="#FFFFFF"
          fontSize="22"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          NO INTERNET
        </text>
        <text
          x="200"
          y="185"
          fill="#FEF08A"
          fontSize="14"
          fontWeight="900"
          fontFamily="Arial"
          textAnchor="middle"
        >
          DNS_PROBE_FINISHED_NO_INTERNET
        </text>
        {/* Base */}
        <path d="M -40 260 L 440 260 L 410 285 L -10 285 Z" fill="#334155" stroke="#000000" strokeWidth="8" />
      </g>

      {/* 2. Left Floating Frozen Smartphone */}
      <g transform="translate(100, 380) rotate(-8)">
        <rect width="180" height="320" rx="24" fill="#000000" stroke="#475569" strokeWidth="8" />
        <rect x="12" y="24" width="156" height="272" rx="14" fill="#1E293B" />
        {/* Giant Red Spinning Buffer Circle */}
        <circle cx="90" cy="140" r="35" fill="none" stroke="#EF4444" strokeWidth="8" strokeDasharray="60 30" />
        <text
          x="90"
          y="215"
          fill="#EF4444"
          fontSize="18"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          CONNECTING...
        </text>
      </g>

      {/* 3. Right Floating Smart TV */}
      <g transform="translate(780, 360) rotate(8)">
        <rect width="220" height="160" rx="10" fill="#000000" stroke="#475569" strokeWidth="8" />
        <rect x="12" y="12" width="196" height="136" rx="4" fill="#DC2626" />
        <text
          x="110"
          y="75"
          fill="#FFFFFF"
          fontSize="24"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          SERVER
        </text>
        <text
          x="110"
          y="105"
          fill="#FFFFFF"
          fontSize="24"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          OFFLINE
        </text>
      </g>

      {/* Red Alert Banner across the bottom */}
      <rect x="0" y="1250" width="1080" height="670" fill="#0F172A" stroke="#000000" strokeWidth="10" />
    </g>
  );
};
