import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Continuous micro-animation values & pattern interrupts
  const midEvent = frame > 154;
  const flowOffset = -frame * (midEvent ? 6.0 : 3.5);
  const pulse = Math.sin(frame * 0.14);
  const zoom = interpolate(frame, [0, 342], [1.0, 1.07], { extrapolateRight: "clamp" });
  const entrance = spring({ frame, fps, config: { damping: 14 } });

  return (
    <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="grid3" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0284C7" strokeWidth="0.8" strokeOpacity="0.15" />
        </pattern>
        <filter id="glow3" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="hatch3" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#1C1917" strokeWidth="1.5" strokeOpacity="0.25" />
        </pattern>
        <radialGradient id="energyPulse3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0284C7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beamGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <rect width="1080" height="1920" fill="#F7F5F0" />
      <rect width="1080" height="1920" fill="url(#grid3)" />

      {/* Header HUD */}
      <rect x="60" y="70" width="960" height="64" rx="8" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2.5" />
      <circle cx="95" cy="102" r="6" fill="#DC2626" />
      <text x="115" y="109" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">SECURE ELEMENT // CUT 03</text>
      <text x="990" y="109" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="19" fontWeight="bold" letterSpacing="1px">CRITICAL // ALERT</text>

      {/* Hero Visual Blueprint Simulation with Dynamic Punch-In (Y=160 to Y=1330) */}
      <g transform={"translate(540, 745) scale(" + zoom + ") translate(-540, -745)"} opacity={entrance}>
        
        {/* Background Engineering Frame for Replay Attack Vector */}
        <rect x="90" y="180" width="900" height="1140" rx="16" fill="#FFFFFF" stroke="#1C1917" strokeWidth="4" />
        
        {/* Internal Technical Cross-Section Grid & Hatching */}
        <rect x="130" y="220" width="820" height="620" rx="8" fill="url(#hatch3)" stroke="#1C1917" strokeWidth="2" />
        <rect x="130" y="870" width="820" height="410" rx="8" fill="#1C1917" stroke="#1C1917" strokeWidth="2" />

        {/* Silicon Die Core / Secure Element Fortress */}
        <g transform="translate(540, 530)">
          {/* Outer Shield Shell */}
          <rect x="-240" y="-180" width="480" height="360" rx="12" fill="#F7F5F0" stroke="#1C1917" strokeWidth="4" />
          <rect x="-210" y="-150" width="420" height="300" rx="6" fill="#1C1917" />
          
          {/* Internal Microscopic Conduits & Crystalline Lattice */}
          {Array.from({ length: 8 }).map((_, i) => {
            const yOffset = -110 + i * 32;
            return (
              <g key={i}>
                <line x1="-180" y1={yOffset} x2="180" y2={yOffset} stroke="#0284C7" strokeWidth="2" strokeDasharray="8 4" strokeDashoffset={flowOffset} />
                <circle cx={-150 + (i * 40) % 300} cy={yOffset} r="4" fill="#00F5FF" filter="url(#glow3)" />
              </g>
            );
          })}

          {/* Central Crypto Core */}
          <circle cx="0" cy="0" r="75" fill="#1C1917" stroke={midEvent ? "#DC2626" : "#00F5FF"} strokeWidth="5" filter="url(#glow3)" />
          <circle cx="0" cy="0" r="55" fill="none" stroke="#F7F5F0" strokeWidth="2" strokeDasharray="6 6" />
          <text x="0" y="8" textAnchor="end" fill={midEvent ? "#DC2626" : "#00F5FF"} fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">SECURE_CORE</text>
        </g>

        {/* Incoming Shadowy Red Data Stream (Replay Attack) */}
        <g transform="translate(540, 990)">
          <rect x="-380" y="-50" width="760" height="100" rx="8" fill="#FFFFFF" stroke="#1C1917" strokeWidth="3" />
          <text x="-350" y="-15" fill="#1C1917" fontFamily="'Courier New', monospace" fontSize="15" fontWeight="bold">INTERCEPTED PACKET // STREAM 0x89FF</text>
          
          {/* Attack Flow Conduits */}
          {Array.from({ length: 6 }).map((_, i) => {
            const lx = -340 + i * 115;
            const activeColor = midEvent ? "#DC2626" : "#EA580C";
            return (
              <g key={i}>
                <line x1={lx} y1="15" x2={lx + 60} y2="15" stroke={activeColor} strokeWidth="4" strokeLinecap="round" filter="url(#glow3)" />
                <polygon points={`${lx + 55},10 ${lx + 65},15 ${lx + 55},20`} fill={activeColor} />
              </g>
            );
          })}
        </g>

        {/* Interactive Warning Beacons & Dimension Callouts */}
        <g transform="translate(130, 870)">
          <rect x="25" y="30" width="220" height="50" rx="4" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2" />
          <text x="40" y="62" fill={midEvent ? "#DC2626" : "#EA580C"} fontFamily="'Courier New', monospace" fontSize="14" fontWeight="bold">
            {midEvent ? "⚠️ SHIELD ACTIVE" : "DEFENSE: STANDBY"}
          </text>
        </g>

        <g transform="translate(710, 870)">
          <rect x="25" y="30" width="220" height="50" rx="4" fill="#F7F5F0" stroke="#1C1917" strokeWidth="2" />
          <text x="40" y="62" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="14" fontWeight="bold">&lt; 3.0ms BARRIER</text>
        </g>

        {/* High-Velocity Particle/Wave-Packet Swarm */}
        {Array.from({ length: 24 }).map((_, idx) => {
          const pProgress = ((frame * 4 + idx * 40) % 800) / 800;
          const px = 180 + pProgress * 720;
          const py = 920 + Math.sin(frame * 0.12 + idx) * 35;
          const pOpacity = Math.sin(pProgress * Math.PI) * 0.9;
          return (
            <circle
              key={idx}
              cx={px}
              cy={py}
              r={3.5 + (idx % 3)}
              fill={midEvent ? "#DC2626" : "#00F5FF"}
              opacity={Math.max(0.1, pOpacity)}
              filter="url(#glow3)"
            />
          );
        })}

        {/* Dynamic Energy Pulse Wave (Mid-Scene State Shift at Frame 154) */}
        {midEvent && (
          <circle cx="540" cy="530" r={Math.min(450, (frame - 154) * 12)} fill="none" stroke="#DC2626" strokeWidth="4" opacity={Math.max(0, 1 - (frame - 154) / 40)} filter="url(#glow3)" />
        )}

      </g>

      {/* Bottom Telemetry HUD */}
      <rect x="60" y="1730" width="960" height="70" rx="8" fill="#1C1917" />
      <text x="95" y="1772" fill="#EA580C" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold" letterSpacing="1px">REPLAY DETECTION</text>
      <text x="990" y="1772" textAnchor="end" fill="#0284C7" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="bold">ATTEMPT: DENIED</text>
    </svg>
  );
};