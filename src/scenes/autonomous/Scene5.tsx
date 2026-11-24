import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Continuous micro-animation values & pattern interrupts
  const midEvent = frame > 166;
  const flowOffset = -frame * (midEvent ? 6.0 : 3.5);
  const pulse = Math.sin(frame * 0.14);
  const zoom = interpolate(frame, [0, 368], [1.0, 1.07], { extrapolateRight: "clamp" });
  const entrance = spring({ frame, fps, config: { damping: 14 } });

  return (
    <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="grid5" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284C7" strokeWidth="0.8" strokeOpacity="0.15" />
        </pattern>
        <filter id="glow5" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="hatch5" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#1C1917" strokeWidth="1.5" strokeOpacity="0.25" />
        </pattern>
        <radialGradient id="energyPulse5" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0284C7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamGrad5" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="#F7F5F0" />
      <rect width="1080" height="1920" fill="url(#grid5)" />

      {/* Header HUD */}
      <rect x="60" y="70" width="960" height="64" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.5" />
      <circle cx="95" cy="102" r="6" fill="#DC2626" />
      <text x="115" y="109" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">SECURE ELEMENT // CUT 05</text>
      <text x="990" y="109" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">LOOP // COMPLETE</text>

      {/* Hero Visual Blueprint Simulation with Dynamic Punch-In (Y=160 to Y=1330) */}
      <g transform={"translate(540, 745) scale(" + zoom + ") translate(-540, -745)"}>
        
        {/* Massive Fortress Castle Outer Bastion */}
        <g transform="translate(140, 180)">
          {/* Outer Shield Hull */}
          <rect x="0" y="0" width="800" height="1100" rx="40" fill="url(#hatch5)" stroke="#1C1917" strokeWidth="6" />
          <rect x="30" y="30" width="740" height="1040" rx="25" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" strokeOpacity="0.6" />

          {/* Castle Towers / Buttresses */}
          <path d="M 30 180 L 100 180 L 100 920 L 30 920 Z" fill="#1C1917" />
          <path d="M 770 180 L 800 180 L 800 920 L 770 920 Z" fill="#1C1917" />

          {/* Central Cryptographic Core Fortress */}
          <rect x="180" y="220" width="440" height="660" rx="20" fill="#1C1917" stroke="#0284C7" strokeWidth="4" />
          <rect x="210" y="250" width="380" height="600" rx="10" fill="#090D16" />

          {/* Interlocking Cryptographic Handshake Circuit Rings */}
          <circle cx="400" cy="550" r={190 + pulse * 6} fill="none" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="5" strokeDasharray="16 8" strokeDashoffset={flowOffset} filter="url(#glow5)" />
          <circle cx="400" cy="550" r={140 - pulse * 4} fill="none" stroke="#0284C7" strokeWidth="8" strokeOpacity="0.8" />
          <circle cx="400" cy="550" r="90" fill="url(#energyPulse5)" filter="url(#glow5)" />

          {/* Silicon Die / Secure Microchip Vault Center */}
          <rect x="330" y="480" width="140" height="140" rx="12" fill="#1C1917" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="4" filter="url(#glow5)" />
          
          {/* Microchip Contact Pads / Pins */}
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={350 + i * 26} y1="460" x2={350 + i * 26} y2="480" stroke="#00F5FF" strokeWidth="4" filter="url(#glow5)" />
              <line x1={350 + i * 26} y1="620" x2={350 + i * 26} y2="640" stroke="#00F5FF" strokeWidth="4" filter="url(#glow5)" />
              <line x1="310" y1={500 + i * 26} x2="330" y2={500 + i * 26} stroke="#00F5FF" strokeWidth="4" filter="url(#glow5)" />
              <line x1="470" y1={500 + i * 26} x2="490" y2={500 + i * 26} stroke="#00F5FF" strokeWidth="4" filter="url(#glow5)" />
            </React.Fragment>
          ))}

          {/* Core Sigil Icon (Shield / Key) */}
          <path d="M 400 510 L 430 535 L 430 575 C 430 595 400 615 400 615 C 400 615 370 595 370 575 L 370 535 Z" fill="none" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="3" filter="url(#glow5)" />

          {/* Data Conduit Traces & Waveforms */}
          <path d="M 100 550 L 180 550 M 620 550 L 700 550" stroke="#00F5FF" strokeWidth="4" strokeDasharray="10 5" strokeDashoffset={flowOffset * 2} filter="url(#glow5)" />
          <path d="M 400 90 L 400 220 M 400 880 L 400 1010" stroke="#0284C7" strokeWidth="4" strokeDasharray="10 5" strokeDashoffset={flowOffset} />

          {/* Dimension Callouts & Technical Annotations */}
          <g fontFamily="'Courier New', monospace" fontSize="14" fill="#1C1917" fontWeight="bold">
            <line x1="30" y1="130" x2="800" y2="130" stroke="#1C1917" strokeWidth="1.5" />
            <polygon points="30,130 45,124 45,136" fill="#1C1917" />
            <polygon points="800,130 785,124 785,136" fill="#1C1917" />
            <rect x="360" y="115" width="280" height="26" fill="#F7F5F0" />
            <text x="415" y="133" fill="#DC2626">&lt; 0.003ms BARRIER &gt;</text>

            <line x1="830" y1="220" x2="830" y2="880" stroke="#1C1917" strokeWidth="1.5" />
            <polygon points="830,220 824,235 836,235" fill="#1C1917" />
            <polygon points="830,880 824,865 836,865" fill="#1C1917" />
            <rect x="845" y="520" width="130" height="40" fill="#F7F5F0" />
            <text x="855" y="545" fill="#0284C7">SECURE ELEM</text>
          </g>

          {/* Procedural Kinetic Particle Swarms (Glowing Photons circulating the circuit) */}
          {Array.from({ length: 28 }).map((_, idx) => {
            const pProgress = ((frame * 4.5 + idx * 32) % 800) / 800;
            const angle = pProgress * Math.PI * 2;
            const radius = 190 + Math.sin(idx) * 10;
            const px = 400 + Math.cos(angle) * radius;
            const py = 550 + Math.sin(angle) * radius;
            const pOpacity = Math.sin(pProgress * Math.PI) * 0.95;
            return (
              <circle
                key={idx}
                cx={px}
                cy={py}
                r={3 + (idx % 3)}
                fill={midEvent ? "#DC2626" : "#00F5FF"}
                opacity={Math.max(0.1, pOpacity)}
                filter="url(#glow5)"
              />
            );
          })}

        </g>
      </g>

      {/* Bottom Telemetry HUD */}
      <rect x="60" y="1730" width="960" height="70" rx="8" fill="#1C1917" />
      <text x="95" y="1772" fill="#EA580C" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold" letterSpacing="1px">SESSION INTEGRITY</text>
      <text x="990" y="1772" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold">OBSOLETE: 0.003s</text>
    </svg>
  );
};