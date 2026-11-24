import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface WhalterPropsStageProps {
  currentCut: number;
  cut1: number;
  cut2: number;
  cut3: number;
  cut4: number;
  cut5: number;
  totalFrames: number;
}

export const WhalterPropsStage: React.FC<WhalterPropsStageProps> = ({
  currentCut,
  cut1,
  cut2,
  cut3,
  cut4,
  cut5,
  totalFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relative frames within each beat for clean spring entrances
  const f1 = Math.max(0, frame - cut1);
  const f2 = Math.max(0, frame - cut2);
  const f3 = Math.max(0, frame - cut3);
  const f4 = Math.max(0, frame - cut4);
  const f5 = Math.max(0, frame - cut5);

  // Springs for prop slams
  const slamSpring1 = spring({
    frame: f1,
    fps,
    config: { damping: 9, stiffness: 180, mass: 1.2 },
  });

  const slamSpring2 = spring({
    frame: f2,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.8 },
  });

  const slamSpring3 = spring({
    frame: f3,
    fps,
    config: { damping: 8, stiffness: 210, mass: 1.0 },
  });

  const slamSpring4 = spring({
    frame: f4,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.9 },
  });

  const slamSpring5 = spring({
    frame: f5,
    fps,
    config: { damping: 14, stiffness: 120, mass: 1.0 },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 240,
        left: 0,
        width: 1080,
        height: 820,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <svg
        width="1000"
        height="780"
        viewBox="0 0 1000 780"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Concrete Gradient & Cracks */}
          <linearGradient id="concreteWallGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Hazard Warning Pattern */}
          <pattern id="hazardStripe" width="40" height="40" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="20" height="40" fill="#facc15" />
            <rect x="20" width="20" height="40" fill="#0f172a" />
          </pattern>

          {/* Glowing Neon Filter */}
          <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#00f5ff" floodOpacity="0.8" />
          </filter>

          <filter id="neonGlowGreen" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#10b981" floodOpacity="0.8" />
          </filter>

          <filter id="neonGlowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#ef4444" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* ================================================================ */}
        {/* BEAT 1: CONCRETE WALL SLAMS & WI-FI WAVE SHATTER (0..cut2)       */}
        {/* ================================================================ */}
        {currentCut === 1 && (
          <g>
            {/* 1. Wi-Fi Router (Left Station) */}
            <g transform="translate(140, 480)">
              {/* Router Body */}
              <rect x="-80" y="0" width="160" height="60" rx="12" fill="#0f172a" stroke="#00f5ff" strokeWidth="4" />
              {/* Dual Antennas */}
              <line x1="-50" y1="0" x2="-65" y2="-70" stroke="#00f5ff" strokeWidth="5" strokeLinecap="round" />
              <line x1="50" y1="0" x2="65" y2="-70" stroke="#00f5ff" strokeWidth="5" strokeLinecap="round" />
              <circle cx="-65" cy="-70" r="6" fill="#00f5ff" filter="url(#neonGlowCyan)" />
              <circle cx="65" cy="-70" r="6" fill="#00f5ff" filter="url(#neonGlowCyan)" />
              {/* LED Status Indicators */}
              <circle cx="-40" cy="30" r="5" fill="#10b981" />
              <circle cx="-20" cy="30" r="5" fill="#10b981" />
              <circle cx="0" cy="30" r="5" fill="#00f5ff" />
              <circle cx="20" cy="30" r="5" fill="#00f5ff" />

              {/* Pulsing Concentric Wi-Fi Radio Waves */}
              {[1, 2, 3].map((ring) => {
                const waveProg = ((f1 * 0.08 + ring * 0.33) % 1);
                const waveR = 40 + waveProg * 280;
                const waveAlpha = Math.max(0, 1 - waveProg);
                return (
                  <path
                    key={ring}
                    d={`M ${waveR * 0.7} ${-waveR * 0.7} A ${waveR} ${waveR} 0 0 1 ${waveR * 0.7} ${waveR * 0.7}`}
                    fill="none"
                    stroke="#00f5ff"
                    strokeWidth="6"
                    strokeOpacity={waveAlpha}
                    strokeLinecap="round"
                    filter="url(#neonGlowCyan)"
                  />
                );
              })}
            </g>

            {/* 2. Heavy Concrete Slab (Slams Down from Top) */}
            <g
              transform={`translate(620, ${interpolate(slamSpring1, [0, 1], [-500, 320])})`}
            >
              {/* Concrete Block */}
              <rect
                x="-120"
                y="-180"
                width="240"
                height="360"
                rx="16"
                fill="url(#concreteWallGrad)"
                stroke="#64748b"
                strokeWidth="6"
              />

              {/* Hazard Caution Strip at Top & Bottom */}
              <rect x="-120" y="-180" width="240" height="26" fill="url(#hazardStripe)" />
              <rect x="-120" y="154" width="240" height="26" fill="url(#hazardStripe)" />

              {/* Deep Structural Cracks & Internal Rebar */}
              <path
                d="M -40 -120 L 10 -40 L -20 20 L 30 110"
                fill="none"
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line x1="-90" y1="-60" x2="-90" y2="60" stroke="#f97316" strokeWidth="4" strokeDasharray="8 6" />
              <line x1="80" y1="-80" x2="80" y2="40" stroke="#f97316" strokeWidth="4" strokeDasharray="8 6" />

              {/* 3mm Metric Callout */}
              <rect x="-90" y="-20" width="180" height="40" rx="8" fill="#0f172a" stroke="#ef4444" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="18" fontWeight="bold">
                WIDTH: 3.0 mm
              </text>
            </g>

            {/* 3. Signal Shatter Debris (Bursts after frame 18 when wall slams) */}
            {f1 > 12 && (
              <g transform="translate(500, 480)">
                {[...Array(14)].map((_, i) => {
                  const angle = (i / 14) * Math.PI * 2;
                  const dist = (f1 - 12) * 8 + (i % 3) * 10;
                  const px = Math.cos(angle) * dist;
                  const py = Math.sin(angle) * dist * 0.6;
                  return (
                    <polygon
                      key={i}
                      points={`${px},${py - 6} ${px + 6},${py + 6} ${px - 6},${py + 6}`}
                      fill={i % 2 === 0 ? "#ef4444" : "#facc15"}
                      opacity={Math.max(0, 1 - (f1 - 12) * 0.04)}
                    />
                  );
                })}
              </g>
            )}

            {/* 4. Bold Red Stamp: MURDERED */}
            {f1 > 18 && (
              <g
                transform={`
                  translate(620, 260)
                  rotate(-8)
                  scale(${interpolate(spring({ frame: f1 - 18, fps, config: { damping: 10, stiffness: 240 } }), [0, 1], [2.2, 1])})
                `}
              >
                <rect x="-140" y="-36" width="280" height="72" rx="10" fill="#dc2626" stroke="#ffffff" strokeWidth="4" filter="url(#neonGlowRed)" />
                <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="32" fontWeight="900" letterSpacing="2px">
                  ABSORBED!
                </text>
              </g>
            )}
          </g>
        )}

        {/* ================================================================ */}
        {/* BEAT 2: THE MISCHIEVOUS WATER MOLECULES (cut2..cut3)              */}
        {/* ================================================================ */}
        {currentCut === 2 && (
          <g transform={`scale(${slamSpring2})`} style={{ transformOrigin: "500px 380px" }}>
            {/* Microscopic Cutaway Circle Portal */}
            <circle cx="500" cy="380" r="320" fill="#0f172a" stroke="#38bdf8" strokeWidth="8" filter="url(#neonGlowCyan)" />
            <circle cx="500" cy="380" r="300" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />

            {/* Microscopic Grid Reticle */}
            <line x1="200" y1="380" x2="800" y2="380" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.25" />
            <line x1="500" y1="80" x2="500" y2="680" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.25" />

            {/* 3 Cartoon Water Molecules (H2O) Oscillating */}
            {[
              { x: 380, y: 320, scale: 1.1, phase: 0 },
              { x: 620, y: 340, scale: 0.95, phase: 1.8 },
              { x: 490, y: 490, scale: 1.05, phase: 3.4 },
            ].map((mol, idx) => {
              const vibX = Math.sin(f2 * 0.45 + mol.phase) * 12;
              const vibY = Math.cos(f2 * 0.45 + mol.phase) * 10;
              const rot = Math.sin(f2 * 0.2 + mol.phase) * 8;

              return (
                <g
                  key={idx}
                  transform={`translate(${mol.x + vibX}, ${mol.y + vibY}) rotate(${rot}) scale(${mol.scale})`}
                >
                  {/* Covalent Chemical Bond Lines */}
                  <line x1="0" y1="0" x2="-48" y2="-55" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
                  <line x1="0" y1="0" x2="48" y2="-55" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

                  {/* 2 Hydrogen Atoms (Cute Ears) */}
                  <circle cx="-48" cy="-55" r="28" fill="#38bdf8" stroke="#0f172a" strokeWidth="4" />
                  <text x="-48" y="-48" textAnchor="middle" fill="#0f172a" fontFamily="'Arial Black', sans-serif" fontSize="18" fontWeight="bold">H</text>

                  <circle cx="48" cy="-55" r="28" fill="#38bdf8" stroke="#0f172a" strokeWidth="4" />
                  <text x="48" y="-48" textAnchor="middle" fill="#0f172a" fontFamily="'Arial Black', sans-serif" fontSize="18" fontWeight="bold">H</text>

                  {/* 1 Central Oxygen Atom (Big Mischievous Face) */}
                  <circle cx="0" cy="0" r="54" fill="#ef4444" stroke="#0f172a" strokeWidth="5" />
                  <text x="0" y="-22" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="24" fontWeight="bold">O</text>

                  {/* Mischievous Cartoon Face */}
                  {/* Eyes */}
                  <circle cx="-16" cy="4" r="6" fill="#ffffff" />
                  <circle cx="-14" cy="4" r="3" fill="#0f172a" />
                  <circle cx="16" cy="4" r="6" fill="#ffffff" />
                  <circle cx="18" cy="4" r="3" fill="#0f172a" />
                  {/* Smug / Hungry Mouth */}
                  <path d="M -16 22 Q 0 34 16 22" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              );
            })}

            {/* Stealing Energy Lightning Arcs */}
            <path
              d={`M 300 240 Q ${420 + Math.sin(f2) * 20} ${300} 500 380`}
              fill="none"
              stroke="#facc15"
              strokeWidth="4"
              strokeDasharray="12 8"
              filter="drop-shadow(0 0 8px #facc15)"
            />

            {/* Scientific Banner Badge */}
            <g transform="translate(500, 640)">
              <rect x="-190" y="-28" width="380" height="56" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
              <text x="0" y="8" textAnchor="middle" fill="#38bdf8" fontFamily="'Courier New', monospace" fontSize="22" fontWeight="bold" letterSpacing="1px">
                MOLECULAR DAMPING: 5.8 GHz
              </text>
            </g>
          </g>
        )}

        {/* ================================================================ */}
        {/* BEAT 3: THE DEAD ZONE CRITICAL PACKET LOSS (cut3..cut4)           */}
        {/* ================================================================ */}
        {currentCut === 3 && (
          <g transform={`scale(${slamSpring3})`} style={{ transformOrigin: "500px 380px" }}>
            {/* Giant Smartphone Mockup */}
            <g transform="translate(500, 360)">
              {/* Phone Chassis */}
              <rect x="-180" y="-280" width="360" height="560" rx="36" fill="#0f172a" stroke="#dc2626" strokeWidth="6" filter="url(#neonGlowRed)" />
              {/* Screen Area */}
              <rect x="-160" y="-240" width="320" height="480" rx="20" fill="#1e1e2e" />

              {/* Dynamic Wi-Fi Bar Plummet (4 -> 0 bars) */}
              <g transform="translate(0, -140)">
                {[1, 2, 3, 4].map((bar) => {
                  const barH = bar * 24;
                  const isAlive = f3 < 30 ? bar <= (4 - Math.floor(f3 / 8)) : false;
                  return (
                    <rect
                      key={bar}
                      x={-75 + (bar - 1) * 40}
                      y={40 - barH}
                      width="28"
                      height={barH}
                      rx="6"
                      fill={isAlive ? "#10b981" : "#ef4444"}
                      opacity={isAlive ? 1 : 0.25}
                    />
                  );
                })}
              </g>

              {/* Giant Red Hazard Warning Skull / X Indicator */}
              <circle cx="0" cy="50" r="70" fill="#dc2626" filter="url(#neonGlowRed)" />
              {/* Warning Exclamation Mark */}
              <rect x="-10" y="10" width="20" height="50" rx="6" fill="#ffffff" />
              <circle cx="0" cy="85" r="10" fill="#ffffff" />

              {/* Status Banner */}
              <text x="0" y="170" textAnchor="middle" fill="#ef4444" fontFamily="'Arial Black', sans-serif" fontSize="28" fontWeight="900">
                0 BARS // DEAD ZONE
              </text>
              <text x="0" y="205" textAnchor="middle" fill="#94a3b8" fontFamily="'Courier New', monospace" fontSize="18" fontWeight="bold">
                PACKET LOSS: 100% (-90 dBm)
              </text>
            </g>
          </g>
        )}

        {/* ================================================================ */}
        {/* BEAT 4: THE MESH ROUTING BYPASS SOLUTION (cut4..cut5)             */}
        {/* ================================================================ */}
        {currentCut === 4 && (
          <g transform={`scale(${slamSpring4})`} style={{ transformOrigin: "500px 320px" }}>
            {/* Tactical Architectural Blueprint Floor */}
            <rect x="100" y="70" width="800" height="480" rx="24" fill="#0a192f" stroke="#10b981" strokeWidth="4" />

            {/* Central Impenetrable Concrete Obstacle */}
            <rect x="440" y="160" width="120" height="280" rx="10" fill="#334155" stroke="#64748b" strokeWidth="4" />
            <text x="500" y="310" textAnchor="middle" fill="#94a3b8" fontFamily="'Arial Black', sans-serif" fontSize="20" transform="rotate(-90 500 310)">
              CONCRETE
            </text>

            {/* 3 Green Mesh Relay Nodes */}
            {/* Node 1: Origin Router */}
            <g transform="translate(240, 320)">
              <circle cx="0" cy="0" r="42" fill="#0f172a" stroke="#10b981" strokeWidth="5" filter="url(#neonGlowGreen)" />
              <circle cx="0" cy="0" r="14" fill="#10b981" />
              <text x="0" y="65" textAnchor="middle" fill="#10b981" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">
                NODE A (BASE)
              </text>
            </g>

            {/* Node 2: Ceiling / Hallway Mesh Relay */}
            <g transform="translate(500, 150)">
              <circle cx="0" cy="0" r="42" fill="#0f172a" stroke="#10b981" strokeWidth="5" filter="url(#neonGlowGreen)" />
              <circle cx="0" cy="0" r="14" fill="#10b981" />
              <text x="0" y="-50" textAnchor="middle" fill="#10b981" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">
                NODE B (RELAY)
              </text>
            </g>

            {/* Node 3: Target Device / Room */}
            <g transform="translate(760, 320)">
              <circle cx="0" cy="0" r="42" fill="#0f172a" stroke="#10b981" strokeWidth="5" filter="url(#neonGlowGreen)" />
              <circle cx="0" cy="0" r="14" fill="#10b981" />
              <text x="0" y="65" textAnchor="middle" fill="#10b981" fontFamily="'Courier New', monospace" fontSize="16" fontWeight="bold">
                CLIENT (100%)
              </text>
            </g>

            {/* Animated Laser Bypass Conduit Lines */}
            <path
              d="M 240 320 Q 320 170 500 150 Q 680 170 760 320"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#neonGlowGreen)"
            />
            {/* Pulsing Signal Conduits */}
            <path
              d="M 240 320 Q 320 170 500 150 Q 680 170 760 320"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeDasharray="24 16"
              strokeDashoffset={-f4 * 16}
            />

            {/* Solution Victory Banner */}
            <g transform="translate(500, 485)">
              <rect x="-190" y="-26" width="380" height="52" rx="14" fill="#10b981" filter="url(#neonGlowGreen)" />
              <text x="0" y="9" textAnchor="middle" fill="#0f172a" fontFamily="'Arial Black', sans-serif" fontSize="22" fontWeight="900" letterSpacing="1px">
                BYPASS SUCCESSFUL // 12ms
              </text>
            </g>
          </g>
        )}

        {/* ================================================================ */}
        {/* BEAT 5: INFINITE LOOP BRIDGE (cut5..end)                          */}
        {/* ================================================================ */}
        {currentCut === 5 && (
          <g transform={`scale(${slamSpring5})`} style={{ transformOrigin: "500px 380px" }}>
            {/* Pulsing Infinity Cycle Ring */}
            <g transform="translate(500, 380)">
              <circle cx="0" cy="0" r="240" fill="none" stroke="#00f5ff" strokeWidth="6" strokeDasharray="30 20" transform={`rotate(${f5 * 2.5})`} filter="url(#neonGlowCyan)" />
              <circle cx="0" cy="0" r="180" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />

              {/* Concrete Wall Preview Inside Ring */}
              <rect x="-60" y="-80" width="120" height="160" rx="8" fill="url(#concreteWallGrad)" stroke="#64748b" strokeWidth="4" />
              <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="18" fontWeight="bold">
                WALL
              </text>

              {/* Infinite Loop Arrow */}
              <path
                d="M -120 -150 A 200 200 0 0 1 120 -150"
                fill="none"
                stroke="#facc15"
                strokeWidth="10"
                strokeLinecap="round"
                filter="drop-shadow(0 0 10px #facc15)"
              />
              <polygon points="120,-165 145,-145 120,-125" fill="#facc15" />

              <text x="0" y="125" textAnchor="middle" fill="#facc15" fontFamily="'Arial Black', sans-serif" fontSize="24" fontWeight="900">
                THE LOOP CONTINUES...
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
