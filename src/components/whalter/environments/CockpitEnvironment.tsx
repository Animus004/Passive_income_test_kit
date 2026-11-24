import React from "react";

interface CockpitEnvironmentProps {
  frame: number;
}

export const CockpitEnvironment: React.FC<CockpitEnvironmentProps> = ({ frame }) => {
  const alarmBlink = Math.sin(frame * 0.6) > 0;

  return (
    <g>
      {/* 1. Outside Cockpit Windshield: High-Altitude Night Sky */}
      <rect width="1080" height="900" fill="#030712" />

      {/* Distant Stars */}
      <circle cx="200" cy="180" r="2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="340" cy="120" r="3" fill="#FFFFFF" opacity="0.9" />
      <circle cx="580" cy="150" r="2.5" fill="#FFFFFF" opacity="0.7" />
      <circle cx="850" cy="210" r="3" fill="#FFFFFF" opacity="0.8" />
      <circle cx="920" cy="110" r="2" fill="#FFFFFF" opacity="0.9" />

      {/* Distant Airplane Banking in Holding Pattern */}
      <g transform="translate(680, 220) scale(0.65) rotate(-15)">
        <polygon points="0,0 60,-10 120,0 60,8" fill="#E2E8F0" />
        <line x1="60" y1="-35" x2="60" y2="35" stroke="#94A3B8" strokeWidth="8" />
        {/* Blinking wingtip beacon */}
        <circle cx="60" cy="-35" r="4" fill="#EF4444" />
        <circle cx="60" cy="35" r="4" fill="#22C55E" />
      </g>

      {/* Cockpit Window Pillars / Frame (Heavy Mechanical 2D Borders) */}
      {/* Center Pillar */}
      <polygon points="520,0 560,0 550,850 530,850" fill="#1E293B" stroke="#000000" strokeWidth="10" />
      {/* Left Pillar Angle */}
      <polygon points="0,0 120,0 0,600" fill="#1E293B" stroke="#000000" strokeWidth="10" />
      {/* Right Pillar Angle */}
      <polygon points="1080,0 960,0 1080,600" fill="#1E293B" stroke="#000000" strokeWidth="10" />
      {/* Upper Cockpit Overhead Panel Frame */}
      <rect x="0" y="0" width="1080" height="90" fill="#0F172A" stroke="#000000" strokeWidth="8" />
      {/* Overhead Buttons & Switches */}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={`sw_${i}`} cx={140 + i * 70} cy="45" r="8" fill={i % 3 === 0 ? "#F59E0B" : "#334155"} stroke="#000000" strokeWidth="3" />
      ))}

      {/* 2. Cockpit Glare Shield & Dashboard */}
      <rect x="0" y="720" width="1080" height="600" fill="#1E293B" stroke="#000000" strokeWidth="12" />
      <rect x="0" y="700" width="1080" height="25" fill="#0F172A" stroke="#000000" strokeWidth="6" />

      {/* 3. CENTER RADAR NAVIGATION MULTIFUNCTION DISPLAY (MFD) */}
      <g transform="translate(340, 760)">
        {/* MFD Bezel */}
        <rect width="400" height="340" rx="14" fill="#0F172A" stroke="#000000" strokeWidth="10" />
        {/* Screen */}
        <rect x="18" y="18" width="364" height="304" rx="6" fill="#000000" />

        {/* Flashing GPS Error Warning */}
        <rect
          x="30"
          y="30"
          width="340"
          height="80"
          rx="8"
          fill={alarmBlink ? "#DC2626" : "#7F1D1D"}
          stroke="#000000"
          strokeWidth="6"
        >
          <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
        </rect>
        <text
          x="200"
          y="68"
          fill="#FFFFFF"
          fontSize="24"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          GPS SIGNAL LOST
        </text>
        <text
          x="200"
          y="95"
          fill="#FEF08A"
          fontSize="15"
          fontWeight="900"
          fontFamily="Arial"
          textAnchor="middle"
        >
          MANUAL NAVIGATION ONLY
        </text>

        {/* Lost Radar Grid with Glitch Sweep */}
        <circle cx="200" cy="220" r="75" fill="none" stroke="#334155" strokeWidth="3" />
        <circle cx="200" cy="220" r="45" fill="none" stroke="#334155" strokeWidth="3" />
        <line x1="200" y1="145" x2="200" y2="295" stroke="#334155" strokeWidth="2" />
        <line x1="125" y1="220" x2="275" y2="220" stroke="#334155" strokeWidth="2" />
        {/* Sweeper Hand */}
        <line x1="200" y1="220" x2="250" y2="170" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
        <text
          x="200"
          y="235"
          fill="#EF4444"
          fontSize="36"
          fontWeight="900"
          fontFamily="Arial Black"
          textAnchor="middle"
        >
          NO LINK
        </text>
      </g>

      {/* 4. Left Instrument (Captain Primary Flight Display) */}
      <g transform="translate(60, 780)">
        <rect width="220" height="200" rx="10" fill="#0F172A" stroke="#000000" strokeWidth="8" />
        <rect x="12" y="12" width="196" height="176" rx="4" fill="#0369A1" />
        {/* Artificial Horizon tilted in panic */}
        <rect x="12" y="100" width="196" height="88" fill="#B45309" />
        <line x1="12" y1="100" x2="208" y2="100" stroke="#FFFFFF" strokeWidth="6" />
        {/* Warning Badge */}
        <rect x="30" y="30" width="160" height="40" fill="#EF4444" rx="4" />
        <text x="110" y="58" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
          NO SAT COMM
        </text>
      </g>

      {/* 5. Right Instrument (First Officer Navigation) */}
      <g transform="translate(800, 780)">
        <rect width="220" height="200" rx="10" fill="#0F172A" stroke="#000000" strokeWidth="8" />
        <rect x="12" y="12" width="196" height="176" rx="4" fill="#18181B" />
        <text x="110" y="90" fill="#EF4444" fontSize="22" fontWeight="900" fontFamily="Arial Black" textAnchor="middle">
          30,000 JETS
        </text>
        <text x="110" y="125" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="Arial" textAnchor="middle">
          HOLDING PATTERN
        </text>
      </g>

      {/* Cockpit Floor */}
      <rect x="0" y="1260" width="1080" height="660" fill="#0B0F19" stroke="#000000" strokeWidth="10" />
    </g>
  );
};
