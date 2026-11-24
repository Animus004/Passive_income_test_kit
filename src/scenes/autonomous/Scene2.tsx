import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Continuous micro-animation values & pattern interrupts
  const midEvent = frame > 178;
  const flowOffset = -frame * (midEvent ? 6.0 : 3.5);
  const pulse = Math.sin(frame * 0.14);
  const zoom = interpolate(frame, [0, 395], [1.0, 1.07], { extrapolateRight: "clamp" });
  const entrance = spring({ frame, fps, config: { damping: 14 } });

  return (
    <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284C7" strokeWidth="0.8" strokeOpacity="0.15" />
        </pattern>
        <filter id="glow2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="hatch2" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#1C1917" strokeWidth="1.5" strokeOpacity="0.25" />
        </pattern>
        <radialGradient id="energyPulse2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0284C7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="#F7F5F0" />
      <rect width="1080" height="1920" fill="url(#grid2)" />

      {/* Header HUD */}
      <rect x="60" y="70" width="960" height="64" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.5" />
      <circle cx="95" cy="102" r="6" fill="#DC2626" />
      <text x="115" y="109" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">SECURE ELEMENT // CUT 02</text>
      <text x="990" y="109" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">KEYGEN // ACTIVE</text>

      {/* Hero Visual Blueprint Simulation with Dynamic Punch-In (Y=160 to Y=1330) */}
      <g transform={"translate(540, 745) scale(" + zoom + ") translate(-540, -745)"}>
        
        {/* Outer Enclosure Frame */}
        <rect x="100" y="180" width="880" height="1100" rx="16" fill="#1C1917" stroke="#1C1917" strokeWidth="4" />
        <rect x="120" y="200" width="840" height="1060" rx="12" fill="#F7F5F0" stroke="#0284C7" strokeWidth="2" />
        <rect x="120" y="200" width="840" height="1060" rx="12" fill="url(#hatch2)" />

        {/* Dimension & Engineering Callout Lines */}
        <line x1="70" y1="200" x2="70" y2="1260" stroke="#DC2626" strokeWidth="2" strokeDasharray="6 4" />
        <text x="50" y="730" fill="#DC2626" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold" transform="rotate(-90 50 730)" textAnchor="middle">&lt; 3.0 mm BARRIER &gt;</text>

        {/* Silicon Die Substrate / Central Core */}
        <rect x="240" y="320" width="600" height="820" rx="20" fill="#1C1917" stroke="#00F5FF" strokeWidth="3" filter="url(#glow2)" />
        <rect x="270" y="350" width="540" height="760" rx="10" fill="#0D1117" />

        {/* Internal Logic Gates & Microscopic Conduits */}
        <g stroke="#00F5FF" strokeWidth="2" fill="none" opacity="0.8">
          {/* Grid lines inside core */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`gh-${i}`} x1="310" y1={400 + i * 90} x2="770" y2={400 + i * 90} strokeOpacity="0.4" strokeDasharray="8 4" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`gv-${i}`} x1={350 + i * 80} y1="390" x2={350 + i * 80} y2="1030" strokeOpacity="0.4" />
          ))}
          
          {/* Animated Logic Processing Paths */}
          <path d="M 310 490 L 430 490 L 490 580 L 610 580 L 670 490 L 770 490" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="4" filter="url(#glow2)" strokeDashoffset={flowOffset} strokeDasharray="20 10" />
          <path d="M 310 730 L 410 730 L 470 650 L 610 650 L 670 730 L 770 730" stroke={midEvent ? "#00F5FF" : "#DC2626"} strokeWidth="4" filter="url(#glow2)" strokeDashoffset={-flowOffset} strokeDasharray="15 8" />
          <path d="M 310 910 L 450 910 L 510 820 L 590 820 L 650 910 L 770 910" stroke="#00F5FF" strokeWidth="3" filter="url(#glow2)" strokeDashoffset={flowOffset * 1.5} strokeDasharray="10 5" />
        </g>

        {/* Central Cryptographic Processor Core (The Fortress) */}
        <circle cx="540" cy="730" r={110 + pulse * 12} fill="url(#energyPulse2)" filter="url(#glow2)" />
        <circle cx="540" cy="730" r="90" fill="#1C1917" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="4" filter="url(#glow2)" />
        <circle cx="540" cy="730" r="60" fill="none" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 4" />
        
        {/* Core Lock Icon / Cryptographic Emblem */}
        <path d="M 525 715 L 555 715 L 555 745 L 525 745 Z" fill={midEvent ? "#DC2626" : "#00F5FF"} filter="url(#glow2)" />
        <path d="M 530 715 C 530 700 550 700 550 715" fill="none" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="4" />

        {/* Outward Radiating Energy Beams / Keys */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const angle = (idx * Math.PI) / 4;
          const x1 = 540 + Math.cos(angle) * 100;
          const y1 = 730 + Math.sin(angle) * 100;
          const x2 = 540 + Math.cos(angle) * 420;
          const y2 = 730 + Math.sin(angle) * 420;
          return (
            <g key={`beam-${idx}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="3" strokeDasharray="12 8" strokeDashoffset={flowOffset} filter="url(#glow2)" />
              {/* Glowing Key Nodes Spawning Outwards */}
              <circle cx={x2} cy={y2} r="8" fill={midEvent ? "#00F5FF" : "#DC2626"} filter="url(#glow2)" />
              <rect x={x2 - 12} y={y2 - 16} width="24" height="12" rx="2" fill="#1C1917" stroke="#00F5FF" strokeWidth="1.5" />
            </g>
          );
        })}

        {/* Procedural Kinetic Particle Swarm (24 Glowing Photons) */}
        {Array.from({ length: 24 }).map((_, idx) => {
          const pProgress = ((frame * 4 + idx * 35) % 800) / 800;
          const angle = (idx * Math.PI * 2) / 24;
          const radius = 120 + pProgress * 340;
          const px = 540 + Math.cos(angle + frame * 0.01) * radius;
          const py = 730 + Math.sin(angle + frame * 0.01) * radius;
          const pOpacity = Math.sin(pProgress * Math.PI) * 0.9;
          return (
            <circle
              key={`particle-${idx}`}
              cx={px}
              cy={py}
              r={3.5 + (idx % 3)}
              fill={midEvent && idx % 2 === 0 ? "#DC2626" : "#00F5FF"}
              opacity={Math.max(0.1, pOpacity)}
              filter="url(#glow2)"
            />
          );
        })}

        {/* Technical Labels & Pinouts */}
        <text x="250" y="300" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="14" fontWeight="bold">SECURE_ELEMENT_CORE_v4.2</text>
        <text x="700" y="300" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="14" fontWeight="bold">STATUS: LOCKED</text>
        
        <line x1="240" y1="1180" x2="840" y2="1180" stroke="#1C1917" strokeWidth="2" />
        <text x="260" y="1220" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">ALGORITHM: AES-256 / SHA-3 HASH</text>
        <text x="820" y="1220" textAnchor="end" fill="#DC2626" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">KEYS GENERATED: 1,024/sec</text>

      </g>

      {/* Bottom Telemetry HUD */}
      <rect x="60" y="1730" width="960" height="70" rx="8" fill="#1C1917" />
      <text x="95" y="1772" fill="#EA580C" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold" letterSpacing="1px">AES-256 MODULE</text>
      <text x="990" y="1772" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold">KEYS: 128-bit UNIQUE</text>
    </svg>
  );
};