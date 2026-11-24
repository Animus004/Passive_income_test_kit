import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Continuous micro-animation values & pattern interrupts
  const midEvent = frame > 163;
  const flowOffset = -frame * (midEvent ? 6.0 : 3.5);
  const pulse = Math.sin(frame * 0.14);
  const zoom = interpolate(frame, [0, 362], [1.0, 1.07], { extrapolateRight: "clamp" });
  const entrance = spring({ frame, fps, config: { damping: 14 } });
  
  // Shockwave ring scaling for midEvent
  const shockwaveProgress = midEvent ? ((frame - 163) % 60) / 60 : 0;

  return (
    <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="grid1" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284C7" strokeWidth="0.8" strokeOpacity="0.15" />
        </pattern>
        <filter id="glow1" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glowIntense" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="hatch1" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#1C1917" strokeWidth="1.5" strokeOpacity="0.25" />
        </pattern>
        <pattern id="chipGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D97706" strokeWidth="0.5" strokeOpacity="0.3" />
        </pattern>
        <radialGradient id="energyPulse1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0284C7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="alarmPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#991B1B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="1080" height="1920" fill="#F7F5F0" />
      <rect width="1080" height="1920" fill="url(#grid1)" />

      {/* Header HUD */}
      <rect x="60" y="70" width="960" height="64" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.5" />
      <circle cx="95" cy="102" r="6" fill="#DC2626" />
      <text x="115" y="109" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">SECURE ELEMENT // CUT 01</text>
      <text x="990" y="109" textAnchor="end" fill={midEvent ? "#DC2626" : "#0284C7"} fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">
        {midEvent ? "ATTACKS // MAXIMUM SURGE" : "ATTACKS // ACTIVE"}
      </text>

      {/* Hero Visual Blueprint Simulation with Dynamic Punch-In (Y=160 to Y=1330) */}
      <g transform={`translate(540, 745) scale(${zoom}) translate(-540, -745)`}>
        
        {/* Massive Credit Card Substrate Cross-Section Box (880w x 960h, centered around X=540, Y=745) */}
        <rect x="100" y="240" width="880" height="980" rx="24" fill="#E6E2D8" stroke="#1C1917" strokeWidth="4" />
        <rect x="120" y="260" width="840" height="940" rx="16" fill="url(#hatch1)" stroke="#1C1917" strokeWidth="2" strokeDasharray="8 4" />

        {/* Dimension Callout Arrows & Technical Annotations */}
        <g opacity="0.8">
          <line x1="80" y1="240" x2="80" y2="1220" stroke="#1C1917" strokeWidth="2" />
          <line x1="70" y1="240" x2="90" y2="240" stroke="#1C1917" strokeWidth="2" />
          <line x1="70" y1="1220" x2="90" y2="1220" stroke="#1C1917" strokeWidth="2" />
          <text x="65" y="735" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold" transform="rotate(-90 65 735)" textAnchor="middle">&lt; 0.76 mm PVC SUBSTRATE</text>

          <line x1="100" y1="210" x2="980" y2="210" stroke="#1C1917" strokeWidth="2" />
          <line x1="100" y1="200" x2="100" y2="220" stroke="#1C1917" strokeWidth="2" />
          <line x1="980" y1="200" x2="980" y2="220" stroke="#1C1917" strokeWidth="2" />
          <text x="540" y="200" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold" textAnchor="middle">ISO/IEC 7810 ID-1 FORMAT SPEC</text>
        </g>

        {/* Outer Shield Field (Impenetrable Barrier Ring) */}
        <circle cx="540" cy="745" r="320" fill={midEvent ? "url(#alarmPulse)" : "url(#energyPulse1)"} filter="url(#glow1)" opacity="0.6 + 0.2 * ${pulse}" />
        <circle cx="540" cy="745" r="320" fill="none" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="4" strokeDasharray="12 6" filter="url(#glow1)" transform={`rotate(${frame * 0.8} 540 745)`} />
        <circle cx="540" cy="745" r="290" fill="none" stroke={midEvent ? "#EF4444" : "#0284C7"} strokeWidth="2" opacity="0.8" transform={`rotate(${-frame * 0.5} 540 745)`} />

        {/* Shockwave Rings on midEvent trigger */}
        {midEvent && (
          <circle
            cx="540"
            cy="745"
            r={100 + shockwaveProgress * 350}
            fill="none"
            stroke="#DC2626"
            strokeWidth={Math.max(1, 8 * (1 - shockwaveProgress))}
            opacity={Math.max(0, 1 - shockwaveProgress)}
            filter="url(#glowIntense)"
          />
        )}

        {/* EMV Chip Gold Module Housing */}
        <rect x="390" y="595" width="300" height="300" rx="20" fill="#1C1917" stroke="#1C1917" strokeWidth="6" />
        <rect x="405" y="610" width="270" height="270" rx="14" fill="#F59E0B" stroke="#B45309" strokeWidth="4" />
        <rect x="420" y="625" width="240" height="240" fill="url(#chipGrid)" />

        {/* EMV Contact Pads Gold Etchings */}
        <path d="M 420 690 L 520 690 L 520 625" fill="none" stroke="#78350F" strokeWidth="4" />
        <path d="M 660 690 L 560 690 L 560 625" fill="none" stroke="#78350F" strokeWidth="4" />
        <path d="M 420 800 L 520 800 L 520 865" fill="none" stroke="#78350F" strokeWidth="4" />
        <path d="M 660 800 L 560 800 L 560 865" fill="none" stroke="#78350F" strokeWidth="4" />
        <line x1="540" y1="625" x2="540" y2="720" stroke="#78350F" strokeWidth="4" />
        <line x1="540" y1="770" x2="540" y2="865" stroke="#78350F" strokeWidth="4" />

        {/* Silicon Die / Secure Element Core Inside Chip */}
        <rect x="470" y="705" width="140" height="140" rx="8" fill="#0F172A" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="3" filter="url(#glow1)" />
        
        {/* Microscopic CPU Conduits & Silicon Lattice */}
        <path d="M 490 735 L 590 735 M 490 765 L 590 765 M 490 795 L 590 795" fill="none" stroke={midEvent ? "#F87171" : "#38BDF8"} strokeWidth="1.5" strokeOpacity="0.8" />
        <path d="M 515 715 L 515 825 M 540 715 L 540 825 M 565 715 L 565 825" fill="none" stroke={midEvent ? "#F87171" : "#38BDF8"} strokeWidth="1.5" strokeOpacity="0.8" />
        <circle cx="540" cy="775" r="16" fill={midEvent ? "#DC2626" : "#00F5FF"} filter="url(#glow1)" />
        <circle cx="540" cy="775" r="6" fill="#FFFFFF" />

        {/* Frame-0 Intense Energy Burst & Data Streams / Brute-Force Attacks Deflection Swarms */}
        {Array.from({ length: 30 }).map((_, idx) => {
          const angle = (idx / 30) * Math.PI * 2 + frame * 0.03;
          const pProgress = ((frame * 6 + idx * 28) % 600) / 600;
          
          // Incoming attack vector converging on shield radius (r=320) then bouncing off
          const startDist = 500;
          const endDist = 320;
          const currentDist = startDist - pProgress * (startDist - endDist);
          
          const px = 540 + Math.cos(angle) * currentDist;
          const py = 745 + Math.sin(angle) * currentDist;
          
          const pOpacity = Math.sin(pProgress * Math.PI) * 0.95;
          const isAttacking = pProgress < 0.85;

          return (
            <g key={idx}>
              {/* Incoming attack ray */}
              {isAttacking && (
                <line
                  x1={540 + Math.cos(angle) * startDist}
                  y1={745 + Math.sin(angle) * startDist}
                  x2={px}
                  y2={py}
                  stroke={midEvent ? "#DC2626" : "#00F5FF"}
                  strokeWidth={2.5}
                  strokeOpacity={pOpacity}
                  filter="url(#glow1)"
                />
              )}
              {/* Attack photon head */}
              <circle
                cx={px}
                cy={py}
                r={4 + (idx % 3)}
                fill={midEvent ? "#EF4444" : "#FFFFFF"}
                opacity={pOpacity}
                filter="url(#glow1)"
              />
              {/* Deflected particle scatter */}
              {!isAttacking && (
                <circle
                  cx={540 + Math.cos(angle) * (320 + (pProgress - 0.85) * 300)}
                  cy={745 + Math.sin(angle) * (320 + (pProgress - 0.85) * 300)}
                  r={3}
                  fill="#F59E0B"
                  opacity={1 - (pProgress - 0.85) / 0.15}
                  filter="url(#glow1)"
                />
              )}
            </g>
          );
        })}

        {/* Technical Callout Pointers & Labels */}
        <g opacity="0.9">
          {/* Top-Right Label: Cryptographic Core */}
          <line x1="680" y1="650" x2="780" y2="550" stroke="#1C1917" strokeWidth="2" />
          <circle cx="680" cy="650" r="4" fill="#1C1917" />
          <rect x="780" y="520" width="220" height="50" rx="6" fill="#1C1917" />
          <text x="890" y="542" fill="#00F5FF" fontFamily="'Courier New', monospace" fontSize="15" fontWeight="bold" textAnchor="middle">DEDICATED CRYPTO ALU</text>
          <text x="890" y="562" fill="#FFFFFF" fontFamily="'Courier New', monospace" fontSize="12" textAnchor="middle">16-BIT SECURE RISC</text>

          {/* Bottom-Left Label: Shield Perimeter */}
          <line x1="280" y1="850" x2="180" y2="980" stroke="#1C1917" strokeWidth="2" />
          <circle cx="280" cy="850" r="4" fill="#1C1917" />
          <rect x="60" y="980" width="240" height="50" rx="6" fill="#1C1917" />
          <text x="180" y="1002" fill="#F59E0B" fontFamily="'Courier New', monospace" fontSize="15" fontWeight="bold" textAnchor="middle">HARDWARE FIREWALL</text>
          <text x="180" y="1022" fill="#FFFFFF" fontFamily="'Courier New', monospace" fontSize="12" textAnchor="middle">ACTIVE SIDE-CHANNEL DEFENSE</text>
        </g>

      </g>

      {/* Bottom Telemetry HUD */}
      <rect x="60" y="1730" width="960" height="70" rx="8" fill="#1C1917" />
      <text x="95" y="1772" fill="#EA580C" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold" letterSpacing="1px">CRYPTOGRAPHIC CORE</text>
      <text x="990" y="1772" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold">
        {midEvent ? "DEFLECTIONS: 12.4B/s // MAXIMUM" : "DEFLECTIONS: 4.7B/s"}
      </text>
    </svg>
  );
};