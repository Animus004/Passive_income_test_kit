import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Continuous micro-animation values & pattern interrupts
  const midEvent = frame > 153;
  const flowOffset = -frame * (midEvent ? 6.0 : 3.5);
  const pulse = Math.sin(frame * 0.14);
  const zoom = interpolate(frame, [0, 339], [1.0, 1.07], { extrapolateRight: "clamp" });
  const entrance = spring({ frame, fps, config: { damping: 14 } });

  return (
    <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="grid4" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284C7" strokeWidth="0.8" strokeOpacity="0.15" />
        </pattern>
        <filter id="glow4" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="hatch4" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#1C1917" strokeWidth="1.5" strokeOpacity="0.25" />
        </pattern>
        <radialGradient id="energyPulse4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0284C7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="#F7F5F0" />
      <rect width="1080" height="1920" fill="url(#grid4)" />

      {/* Header HUD */}
      <rect x="60" y="70" width="960" height="64" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.5" />
      <circle cx="95" cy="102" r="6" fill="#DC2626" />
      <text x="115" y="109" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">SECURE ELEMENT // CUT 04</text>
      <text x="990" y="109" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">RNG // SECURE</text>

      {/* Hero Visual Blueprint Simulation with Dynamic Punch-In (Y=160 to Y=1330) */}
      <g transform={`translate(540, 745) scale(${zoom}) translate(-540, -745)`}>
        
        {/* Outer Hardware Random Number Generator Silicon Die Housing */}
        <rect x="90" y="160" width="900" height="1140" rx="16" fill="#EAE5D9" stroke="#1C1917" strokeWidth="4" />
        <rect x="130" y="200" width="820" height="1060" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2" strokeDasharray="8 4" />

        {/* Silicon Cross-Section Hatching & Internal Conduits */}
        <rect x="170" y="240" width="740" height="980" rx="6" fill="url(#hatch4)" stroke="#1C1917" strokeWidth="2.5" />

        {/* Central Quantum Noise Diode Core (Massive Focal Point) */}
        <circle cx="540" cy="730" r="310" fill="#1C1917" opacity="0.08" />
        <circle cx="540" cy="730" r="260" fill="url(#energyPulse4)" filter="url(#glow4)" />
        <circle cx="540" cy="730" r="260" fill="none" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="5" strokeDasharray="12 6" strokeDashoffset={flowOffset * 0.5} filter="url(#glow4)" />

        {/* Intricate Micro-Circuitry & Quantum Lattice Paths */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI) / 6;
          const x1 = 540 + Math.cos(angle) * 80;
          const y1 = 730 + Math.sin(angle) * 80;
          const x2 = 540 + Math.cos(angle) * (220 + pulse * 15);
          const y2 = 730 + Math.sin(angle) * (220 + pulse * 15);
          const x3 = x2 + Math.cos(angle + 0.5) * 120;
          const y3 = y2 + Math.sin(angle + 0.5) * 120;
          return (
            <g key={i}>
              <path d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`} fill="none" stroke={midEvent ? "#DC2626" : "#0284C7"} strokeWidth="3" filter="url(#glow4)" />
              <circle cx={x3} cy={y3} r="6" fill={midEvent ? "#DC2626" : "#00F5FF"} filter="url(#glow4)" />
            </g>
          );
        })}

        {/* Inner Oscillating Entropy Core */}
        <circle cx="540" cy="730" r="110" fill="#1C1917" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="4" filter="url(#glow4)" />
        <path d={`M 430 730 Q 485 ${730 + pulse * 50} 540 730 Q 595 ${730 - pulse * 50} 650 730`} fill="none" stroke="#00F5FF" strokeWidth="4" filter="url(#glow4)" />
        <path d={`M 430 750 Q 485 ${750 - pulse * 40} 540 750 Q 595 ${750 + pulse * 40} 650 750`} fill="none" stroke="#DC2626" strokeWidth="3" filter="url(#glow4)" />

        {/* Procedural Kinetic Particle Swarms (24 Glowing Photons) */}
        {Array.from({ length: 24 }).map((_, idx) => {
          const pProgress = ((frame * 4 + idx * 40) % 800) / 800;
          const angle = (idx / 24) * Math.PI * 2 + frame * 0.02;
          const radius = 60 + pProgress * 220;
          const px = 540 + Math.cos(angle) * radius;
          const py = 730 + Math.sin(angle) * radius;
          const pOpacity = Math.sin(pProgress * Math.PI) * 0.9;
          return (
            <circle
              key={idx}
              cx={px}
              cy={py}
              r={3.5 + (idx % 3)}
              fill={midEvent ? "#DC2626" : "#00F5FF"}
              opacity={Math.max(0.1, pOpacity)}
              filter="url(#glow4)"
            />
          );
        })}

        {/* Technical Callouts & Dimension Bars (Engineering Precision) */}
        <g fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">
          {/* Top Bar Callout */}
          <line x1="170" y1="210" x2="910" y2="210" stroke="#1C1917" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="360" y="195" width="360" height="30" rx="4" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2" />
          <text x="540" y="215" textAnchor="middle" fill="#1C1917">MODULE 04: QUANTUM RNG</text>

          {/* Left Barrier Callout */}
          <line x1="130" y1="400" x2="170" y2="400" stroke="#1C1917" strokeWidth="2" />
          <line x1="130" y1="1060" x2="170" y2="1060" stroke="#1C1917" strokeWidth="2" />
          <line x1="150" y1="400" x2="150" y2="1060" stroke="#1C1917" strokeWidth="2" />
          <rect x="90" y="700" width="120" height="30" rx="4" fill="#1C1917" transform="rotate(-90 150 715)" />
          <text x="150" y="721" textAnchor="middle" fill="#F7F5F0" fontSize="14">&lt; 1.2 nm BARRIER</text>

          {/* Dynamic Flash Banner at Mid-Scene (Frame > 153) */}
          {midEvent && (
            <g transform="translate(540, 420)">
              <rect x="-240" y="-35" width="480" height="70" rx="8" fill="#DC2626" stroke="#1C1917" strokeWidth="3" filter="url(#glow4)" />
              <text x="0" y="8" textAnchor="middle" fill="#F7F5F0" fontSize="24" letterSpacing="2px">QUANTUM RESISTANT</text>
            </g>
          )}
        </g>

      </g>

      {/* Bottom Telemetry HUD */}
      <rect x="60" y="1730" width="960" height="70" rx="8" fill="#1C1917" />
      <text x="95" y="1772" fill="#EA580C" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold" letterSpacing="1px">QUANTUM SHIELD</text>
      <text x="990" y="1772" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold">ENTROPY: 100%</text>
    </svg>
  );
};