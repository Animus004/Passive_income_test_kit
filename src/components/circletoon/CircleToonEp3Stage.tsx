import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { CircleToonCharacter } from "./CircleToonCharacter";
import { SubtitleWord } from "../../types";

interface CircleToonEp3StageProps {
  currentCut: number;
  subtitles?: SubtitleWord[];
  cutStartFrame?: number;
}

export const CircleToonEp3Stage: React.FC<CircleToonEp3StageProps> = ({
  currentCut = 1,
  subtitles = [],
  cutStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - cutStartFrame);

  // Springs for snappy entrances
  const springEntry = spring({ frame: f, fps, config: { damping: 12, stiffness: 180 } });
  const springPunch = spring({ frame: f, fps, config: { damping: 9, stiffness: 240 } });

  // Floating Zzz helper
  const renderZzz = (x: number, y: number, offset: number = 0) => {
    const loop = (f * 1.5 + offset * 40) % 90;
    const zY = y - loop * 1.6;
    const zX = x + Math.sin(f * 0.1 + offset) * 12;
    const op = Math.sin((loop / 90) * Math.PI);
    const scale = 0.6 + (loop / 90) * 0.6;
    return (
      <g key={`zzz_${offset}`} transform={`translate(${zX}, ${zY}) scale(${scale})`} opacity={op}>
        <text
          x="0"
          y="0"
          fill="#38bdf8"
          stroke="#000000"
          strokeWidth="4"
          paintOrder="stroke fill"
          fontFamily="'Arial Black', Impact, sans-serif"
          fontSize="38"
          fontWeight="900"
        >
          Z
        </text>
      </g>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* ================================================================ */}
      {/* SCENE 1: THE MIDNIGHT DROP (PEDESTRIAN CROWD COLLAPSES ASLEEP)    */}
      {/* ================================================================ */}
      {currentCut === 1 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0c1427" />
          {/* Crescent Moon & Stars */}
          <circle cx="920" cy="340" r="65" fill="#fef08a" />
          <circle cx="950" cy="320" r="60" fill="#0c1427" />
          {[140, 320, 600, 850].map((sx, si) => (
            <circle key={`star_${si}`} cx={sx} cy={280 + si * 40} r={4} fill="#fef08a" opacity={Math.sin(f * 0.1 + si) * 0.4 + 0.6} />
          ))}

          {/* Pastel City Buildings */}
          <rect x="0" y="380" width="240" height="900" fill="#fdba74" stroke="#000000" strokeWidth="8" />
          <rect x="40" y="450" width="65" height="85" fill="#1e293b" stroke="#000000" strokeWidth="6" />
          <rect x="40" y="580" width="65" height="85" fill="#1e293b" stroke="#000000" strokeWidth="6" />

          <rect x="240" y="320" width="300" height="960" fill="#fef08a" stroke="#000000" strokeWidth="8" />
          <rect x="280" y="400" width="75" height="90" fill="#1e293b" stroke="#000000" strokeWidth="6" />
          <rect x="400" y="400" width="75" height="90" fill="#1e293b" stroke="#000000" strokeWidth="6" />

          <rect x="540" y="350" width="260" height="930" fill="#86efac" stroke="#000000" strokeWidth="8" />
          <rect x="590" y="420" width="75" height="90" fill="#1e293b" stroke="#000000" strokeWidth="6" />
          <rect x="690" y="420" width="75" height="90" fill="#1e293b" stroke="#000000" strokeWidth="6" />

          <rect x="800" y="300" width="280" height="980" fill="#d8b4fe" stroke="#000000" strokeWidth="8" />
          <rect x="850" y="380" width="80" height="95" fill="#1e293b" stroke="#000000" strokeWidth="6" />

          {/* Sidewalk */}
          <rect x="0" y="1120" width="1080" height="800" fill="#334155" stroke="#000000" strokeWidth="8" />
          <rect x="0" y="1120" width="1080" height="60" fill="#64748b" stroke="#000000" strokeWidth="6" />

          {/* Crowd collapsing forward in hilarious cartoon sleep poses */}
          {[
            { x: 180, y: 1140, color: "#ef4444", hair: "boy_brown", rot: -16, off: 0.1 },
            { x: 380, y: 1120, color: "#10b981", hair: "girl_blonde", rot: 14, off: 0.5 },
            { x: 580, y: 1130, color: "#8b5cf6", hair: "grandma_white", rot: -12, off: 0.8 },
            { x: 760, y: 1115, color: "#f59e0b", hair: "nerd_black", rot: 18, off: 0.3 },
            { x: 920, y: 1135, color: "#06b6d4", hair: "boy_brown", rot: -10, off: 0.7 },
          ].map((c, i) => (
            <g key={`c1_${i}`} transform={`rotate(${c.rot}, ${c.x}, ${c.y})`}>
              <CircleToonCharacter x={c.x} y={c.y} scale={0.92} shirtColor={c.color} hairStyle={c.hair as any} eyeStyle="sleeping" mouthStyle="sleeping_drool" bounceOffset={c.off} />
              {renderZzz(c.x + 30, c.y - 70, c.off)}
            </g>
          ))}

          {/* Hero collapsed asleep in foreground */}
          <g transform={`rotate(-14, 520, 1500)`}>
            <CircleToonCharacter x={520} y={1500} scale={1.4} shirtColor="#2563eb" hairStyle="boy_brown" eyeStyle="sleeping" mouthStyle="sleeping_drool" />
            {renderZzz(560, 1380, 0.2)}
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 2: SPILLED COFFEE & FALLING SMARTPHONE (SLOW MOTION ZOOM)   */}
      {/* ================================================================ */}
      {currentCut === 2 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0f172a" />
          {/* Ground pavement */}
          <rect x="0" y="800" width="1080" height="1120" fill="#1e293b" stroke="#000000" strokeWidth="8" />

          {/* Falling Coffee Cup in Mid-Air */}
          <g transform={`translate(${340}, ${550 + f * 12}) rotate(${f * 4}) scale(${springPunch})`}>
            {/* Paper Coffee Cup */}
            <path d="M -50 -80 L 50 -80 L 35 80 L -35 80 Z" fill="#ffffff" stroke="#000000" strokeWidth="8" />
            <rect x="-42" y="-10" width="84" height="40" fill="#b45309" stroke="#000000" strokeWidth="4" />
            {/* Spilling Hot Coffee Splashes */}
            {[...Array(6)].map((_, i) => {
              const cx = Math.sin(f * 0.2 + i) * 80 + i * 20;
              const cy = -80 - i * 35;
              return <circle key={`spill_${i}`} cx={cx} cy={cy} r={14 - i * 1.5} fill="#78350f" stroke="#000000" strokeWidth="3" />;
            })}
          </g>

          {/* Tumbling Smartphone Face-Up */}
          <g transform={`translate(${720}, ${750 + Math.min(600, f * 18)}) rotate(${Math.sin(f * 0.1) * 20}) scale(1.3)`}>
            <rect x="-110" y="-180" width="220" height="360" rx="28" fill="#020617" stroke="#000000" strokeWidth="10" />
            <rect x="-95" y="-165" width="190" height="330" rx="18" fill="#0369a1" />
            {/* Clock 12:00 on screen */}
            <text x="0" y="-80" textAnchor="middle" fill="#ffffff" fontSize="48" fontWeight="900" fontFamily="Arial Black">12:00</text>
            <rect x="-70" y="-30" width="140" height="45" rx="8" fill="#ef4444" />
            <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="Arial Black">SLEEP MODE</text>
          </g>

          {/* Pedestrian legs in background with slumped shoes */}
          <g transform="translate(180, 1100)">
            <ellipse cx="0" cy="180" rx="120" ry="24" fill="rgba(0,0,0,0.5)" />
            <line x1="-30" y1="0" x2="-80" y2="180" stroke="#000000" strokeWidth="14" strokeLinecap="round" />
            <line x1="30" y1="0" x2="80" y2="180" stroke="#000000" strokeWidth="14" strokeLinecap="round" />
            <ellipse cx="-85" cy="180" rx="28" ry="12" fill="#000000" />
            <ellipse cx="85" cy="180" rx="28" ry="12" fill="#000000" />
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 3: INTERSECTION TRAFFIC DRIFT (CARS BUMPING WITH SPARKS)    */}
      {/* ================================================================ */}
      {currentCut === 3 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0f172a" />
          <rect x="0" y="500" width="1080" height="1420" fill="#1e293b" stroke="#000000" strokeWidth="8" />
          <line x1="360" y1="500" x2="180" y2="1920" stroke="#facc15" strokeWidth="12" strokeDasharray="60 40" />
          <line x1="720" y1="500" x2="900" y2="1920" stroke="#facc15" strokeWidth="12" strokeDasharray="60 40" />

          {/* Yellow Taxi stopped diagonally */}
          <g transform={`translate(${340 + Math.sin(f * 0.05) * 6}, 920) rotate(-12) scale(${springEntry})`}>
            <ellipse cx="0" cy="150" rx="200" ry="28" fill="rgba(0,0,0,0.45)" />
            <rect x="-170" y="-40" width="340" height="170" rx="32" fill="#facc15" stroke="#000000" strokeWidth="10" />
            <path d="M -120 -40 L -80 -130 L 80 -130 L 120 -40 Z" fill="#facc15" stroke="#000000" strokeWidth="10" />
            <path d="M -100 -45 L -70 -115 L -10 -115 L -10 -45 Z" fill="#bae6fd" stroke="#000000" strokeWidth="6" />
            <path d="M 10 -45 L 10 -115 L 70 -115 L 100 -45 Z" fill="#bae6fd" stroke="#000000" strokeWidth="6" />
            <rect x="-45" y="-165" width="90" height="32" rx="6" fill="#ffffff" stroke="#000000" strokeWidth="5" />
            <text x="0" y="-142" textAnchor="middle" fill="#000000" fontSize="20" fontWeight="bold">TAXI</text>
            <g transform="translate(-40, -40) scale(0.55)">
              <CircleToonCharacter eyeStyle="sleeping" mouthStyle="snoring" hairStyle="nerd_black" shirtColor="#1e293b" />
            </g>
            {renderZzz(-20, -145, 0.4)}
            <circle cx="-110" cy="130" r="42" fill="#000000" stroke="#64748b" strokeWidth="10" />
            <circle cx="110" cy="130" r="42" fill="#000000" stroke="#64748b" strokeWidth="10" />
          </g>

          {/* Red Sedan coasting softly */}
          <g transform={`translate(${720}, 1320) rotate(15)`}>
            <ellipse cx="0" cy="160" rx="210" ry="30" fill="rgba(0,0,0,0.45)" />
            <rect x="-190" y="-50" width="380" height="190" rx="34" fill="#ef4444" stroke="#000000" strokeWidth="10" />
            <path d="M -130 -50 L -90 -145 L 90 -145 L 130 -50 Z" fill="#ef4444" stroke="#000000" strokeWidth="10" />
            <path d="M -110 -55 L -80 -130 L -10 -130 L -10 -55 Z" fill="#bae6fd" stroke="#000000" strokeWidth="6" />
            <path d="M 10 -55 L 10 -130 L 80 -130 L 110 -55 Z" fill="#bae6fd" stroke="#000000" strokeWidth="6" />
            <g transform="translate(-45, -50) scale(0.58)">
              <CircleToonCharacter eyeStyle="sleeping" mouthStyle="sleeping_drool" hairStyle="girl_blonde" shirtColor="#ec4899" />
            </g>
            {renderZzz(-25, -165, 0.9)}
            <circle cx="-120" cy="140" r="44" fill="#000000" stroke="#64748b" strokeWidth="12" />
            <circle cx="120" cy="140" r="44" fill="#000000" stroke="#64748b" strokeWidth="12" />
          </g>

          {/* Cartoon Spark collision stars between bumpers */}
          <g transform="translate(520, 1150) scale(1.4)">
            <polygon points="0,-25 7,-8 25,-8 11,4 16,22 0,11 -16,22 -11,4 -25,-8 -7,-8" fill="#facc15" stroke="#000000" strokeWidth="3" />
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 4: GHOST BULLET TRAIN ON EMPTY PLATFORM                     */}
      {/* ================================================================ */}
      {currentCut === 4 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0f172a" />
          {/* Station Pillars & Lights */}
          <rect x="0" y="300" width="1080" height="400" fill="#1e293b" />
          <line x1="200" y1="300" x2="200" y2="700" stroke="#334155" strokeWidth="16" />
          <line x1="880" y1="300" x2="880" y2="700" stroke="#334155" strokeWidth="16" />

          {/* Platform Floor */}
          <rect x="0" y="1100" width="1080" height="820" fill="#475569" stroke="#000000" strokeWidth="8" />
          <rect x="0" y="1100" width="1080" height="40" fill="#facc15" stroke="#000000" strokeWidth="6" />

          {/* High-Speed Bullet Train Gliding Silently past */}
          <g transform={`translate(${540 + Math.sin(f * 0.05) * 30}, 860)`}>
            {/* Train Body */}
            <rect x="-560" y="-180" width="1120" height="360" rx="36" fill="#f8fafc" stroke="#000000" strokeWidth="12" />
            <rect x="-560" y="40" width="1120" height="45" fill="#0284c7" />
            {/* Passenger Windows */}
            {[-420, -210, 0, 210, 420].map((wx, wi) => (
              <g key={`twin_${wi}`} transform={`translate(${wx}, -60)`}>
                <rect x="-70" y="-55" width="140" height="110" rx="18" fill="#38bdf8" stroke="#000000" strokeWidth="6" />
                {/* Sleeping passengers inside windows */}
                <g transform="translate(0, 15) scale(0.48)">
                  <CircleToonCharacter eyeStyle="sleeping" mouthStyle="snoring" hairStyle={wi % 2 === 0 ? "boy_brown" : "girl_blonde"} shirtColor={wi % 2 === 0 ? "#ef4444" : "#10b981"} />
                </g>
                {renderZzz(wx + 20, 780, wi * 0.3)}
              </g>
            ))}
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 5: AIRPLANE SOARING IN SUNSET CLOUDS                        */}
      {/* ================================================================ */}
      {currentCut === 5 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0284c7" />
          {/* Sunset Horizon */}
          <circle cx="540" cy="620" r="320" fill="#fed7aa" opacity="0.75" />
          <circle cx="540" cy="620" r="180" fill="#fef08a" />

          {/* Cartoon Clouds */}
          {[
            { x: 140, y: 880, s: 1.3 },
            { x: 820, y: 780, s: 1.5 },
            { x: 440, y: 1100, s: 1.8 },
          ].map((c, i) => (
            <g key={`c5_${i}`} transform={`translate(${c.x}, ${c.y}) scale(${c.s})`}>
              <ellipse cx="0" cy="0" rx="90" ry="45" fill="#ffffff" stroke="#000000" strokeWidth="6" />
              <circle cx="-45" cy="-28" r="40" fill="#ffffff" stroke="#000000" strokeWidth="6" />
              <circle cx="35" cy="-28" r="45" fill="#ffffff" stroke="#000000" strokeWidth="6" />
            </g>
          ))}

          {/* Massive Passenger Jet gliding across sky */}
          <g transform={`translate(${540}, ${750 + Math.sin(f * 0.08) * 18}) scale(${springPunch})`}>
            <ellipse cx="0" cy="0" rx="360" ry="95" fill="#ffffff" stroke="#000000" strokeWidth="12" />
            <path d="M -70 10 L -200 190 L -90 190 L 40 10 Z" fill="#cbd5e1" stroke="#000000" strokeWidth="10" />
            <path d="M -320 -30 L -400 -190 L -330 -190 L -250 -30 Z" fill="#ef4444" stroke="#000000" strokeWidth="10" />
            {[-180, -120, -60, 0, 60, 120, 180].map((wx, wi) => (
              <rect key={`pwin_${wi}`} x={wx} y="-15" width="30" height="34" rx="10" fill="#38bdf8" stroke="#000000" strokeWidth="4" />
            ))}
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 6: COCKPIT CUTAWAY (PILOTS SNORING IN NIGHTCAPS)            */}
      {/* ================================================================ */}
      {currentCut === 6 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0f172a" />
          {/* Cockpit Window looking out into stars */}
          <rect x="140" y="280" width="800" height="420" rx="24" fill="#0284c7" stroke="#334155" strokeWidth="14" />
          <line x1="540" y1="280" x2="540" y2="700" stroke="#1e293b" strokeWidth="16" />

          {/* Lower Cockpit Console */}
          <rect x="0" y="850" width="1080" height="1070" fill="#1e293b" stroke="#000000" strokeWidth="12" />

          {/* Center Autopilot Screen */}
          <rect x="360" y="920" width="360" height="200" rx="18" fill="#022c22" stroke="#10b981" strokeWidth="8" />
          <circle cx="410" cy="970" r="14" fill="#10b981" />
          <text x="550" y="975" textAnchor="middle" fill="#10b981" fontSize="32" fontWeight="900" fontFamily="Arial Black">AUTOPILOT ON</text>
          <text x="540" y="1030" textAnchor="middle" fill="#6ee7b7" fontSize="24" fontWeight="bold">ALTITUDE: 36,000 FT</text>
          <text x="540" y="1070" textAnchor="middle" fill="#a7f3d0" fontSize="20" fontWeight="bold">FUEL: 6.2 HOURS LEFT</text>

          {/* Captain Pilot snoring in sleeping cap */}
          <g transform="translate(240, 1180) scale(1.3)">
            <CircleToonCharacter eyeStyle="sleeping" mouthStyle="snoring" hairStyle="nerd_black" shirtColor="#0f172a" hasTie={true} />
            <path d="M -30 -70 Q 0 -115 55 -85 Q 40 -60 10 -65 Z" fill="#3b82f6" stroke="#000000" strokeWidth="5" />
            <circle cx="55" cy="-85" r="10" fill="#ffffff" stroke="#000000" strokeWidth="3" />
            {renderZzz(50, -110, 0.2)}
          </g>

          {/* Co-Pilot snoring */}
          <g transform="translate(840, 1180) scale(1.3) scale(-1, 1)">
            <CircleToonCharacter eyeStyle="sleeping" mouthStyle="sleeping_drool" hairStyle="boy_brown" shirtColor="#0f172a" hasTie={true} />
            {renderZzz(50, -110, 0.7)}
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 7: NUCLEAR POWER PLANT AUTO-SCRAM                           */}
      {/* ================================================================ */}
      {currentCut === 7 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0b1329" />
          {/* Cooling Towers */}
          <path d="M 120 780 Q 200 480 160 260 L 320 260 Q 280 480 360 780 Z" fill="#94a3b8" stroke="#000000" strokeWidth="10" />
          <path d="M 460 780 Q 540 480 500 260 L 660 260 Q 620 480 700 780 Z" fill="#64748b" stroke="#000000" strokeWidth="10" />
          {/* Rising Steam Plumes */}
          {[0, 1, 2, 3].map((si) => (
            <circle key={`steam_${si}`} cx={240 + Math.sin(f * 0.1 + si) * 20} cy={220 - si * 50} r={35 + si * 12} fill="#f1f5f9" opacity={0.65} />
          ))}

          {/* Automated Control Room Panel */}
          <rect x="0" y="860" width="1080" height="1060" fill="#1e293b" stroke="#000000" strokeWidth="12" />
          <rect x="140" y="940" width="800" height="320" rx="24" fill="#064e3b" stroke="#10b981" strokeWidth="10" />
          <circle cx="240" cy="1020" r="30" fill={Math.sin(f * 0.5) > 0 ? "#10b981" : "#047857"} stroke="#000000" strokeWidth="6" />
          <circle cx="840" cy="1020" r="30" fill={Math.sin(f * 0.5) > 0 ? "#10b981" : "#047857"} stroke="#000000" strokeWidth="6" />
          <text x="540" y="1035" textAnchor="middle" fill="#10b981" fontSize="52" fontWeight="900" fontFamily="Arial Black">AUTO-SCRAM ENGAGED</text>
          <text x="540" y="1100" textAnchor="middle" fill="#a7f3d0" fontSize="30" fontWeight="900" fontFamily="Arial Black">CONTROL RODS: 100% INSERTED</text>
          <text x="540" y="1160" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="bold">ZERO MELTDOWNS • REACTORS SAFE</text>

          {/* Sleeping Plant Operator */}
          <g transform="translate(540, 1480) scale(1.3)">
            <CircleToonCharacter eyeStyle="sleeping" mouthStyle="snoring" shirtColor="#0284c7" hairStyle="nerd_black" />
            {renderZzz(35, -95, 0.4)}
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 8: CONTINENTAL POWER GRID COLLAPSE                          */}
      {/* ================================================================ */}
      {currentCut === 8 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#030712" />
          {/* Skyline silhouette with windows going completely dark */}
          <path
            d="M 0 1100 L 100 1100 L 100 780 L 260 780 L 260 1100 L 380 1100 L 380 640 L 520 640 L 520 1100 L 660 1100 L 660 720 L 800 720 L 800 1100 L 920 1100 L 920 680 L 1080 680 L 1080 1920 L 0 1920 Z"
            fill="#0f172a"
            stroke="#000000"
            strokeWidth="10"
          />
          {/* Big Red "GRID OFFLINE" banner */}
          <g transform={`translate(540, 480) scale(${springEntry})`}>
            <rect x="-340" y="-70" width="680" height="140" rx="18" fill="#7f1d1d" stroke="#ef4444" strokeWidth="8" />
            <text x="0" y="-10" textAnchor="middle" fill="#ffffff" fontSize="42" fontWeight="900" fontFamily="Arial Black">72 HOURS: GRID OFFLINE</text>
            <text x="0" y="40" textAnchor="middle" fill="#facc15" fontSize="28" fontWeight="bold">CONTINENTAL BLACKOUT</text>
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 9: CANDLELIGHT & UNPOLLUTED MILKY WAY SKY                   */}
      {/* ================================================================ */}
      {currentCut === 9 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#030712" />
          <circle cx="540" cy="300" r="100" fill="#fef08a" />
          <circle cx="565" cy="290" r="95" fill="#030712" />

          {/* 35 Twinkling Stars */}
          {[...Array(35)].map((_, si) => {
            const sx = ((si * 127 + 43) % 1020) + 30;
            const sy = ((si * 79 + 93) % 900) + 50;
            return <circle key={`star9_${si}`} cx={sx} cy={sy} r={(si % 3) + 2} fill="#ffffff" opacity={Math.sin(f * 0.15 + si) * 0.4 + 0.6} />;
          })}

          {/* Candlelight glow */}
          <g transform="translate(540, 1380)">
            <circle cx="0" cy="0" r="180" fill="#f59e0b" opacity="0.25" filter="blur(25px)" />
            <rect x="-12" y="-35" width="24" height="70" rx="4" fill="#ffffff" stroke="#000000" strokeWidth="4" />
            <ellipse cx="0" cy="-48" rx="10" ry="20" fill="#facc15" />
            <ellipse cx="0" cy="-44" rx="5" ry="10" fill="#ef4444" />
          </g>

          <g transform="translate(360, 1420) scale(1.2)">
            <CircleToonCharacter eyeStyle="sleeping" mouthStyle="sleeping_drool" shirtColor="#0284c7" hairStyle="boy_brown" />
            {renderZzz(30, -90, 0.3)}
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 10: NATURE RECLAIMS THE CITIES (DEER & DUCKS ON BOULEVARD)  */}
      {/* ================================================================ */}
      {currentCut === 10 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#bae6fd" />
          <circle cx="200" cy="240" r="85" fill="#fde047" stroke="#000000" strokeWidth="6" />

          {/* Pastel Skyscrapers with windows and ivy */}
          <rect x="0" y="320" width="240" height="960" fill="#fed7aa" stroke="#000000" strokeWidth="8" />
          <rect x="40" y="380" width="65" height="85" fill="#bae6fd" stroke="#000000" strokeWidth="6" />
          <rect x="240" y="260" width="320" height="1020" fill="#fef08a" stroke="#000000" strokeWidth="8" />
          <rect x="280" y="320" width="75" height="90" fill="#bae6fd" stroke="#000000" strokeWidth="6" />
          <rect x="410" y="320" width="75" height="90" fill="#bae6fd" stroke="#000000" strokeWidth="6" />
          <rect x="560" y="300" width="260" height="980" fill="#bbf7d0" stroke="#000000" strokeWidth="8" />
          <rect x="820" y="240" width="260" height="1040" fill="#e9d5ff" stroke="#000000" strokeWidth="8" />

          {/* Crosswalk */}
          <rect x="0" y="1180" width="1080" height="740" fill="#475569" stroke="#000000" strokeWidth="8" />
          {[60, 160, 260, 360, 460, 560, 660, 760, 860, 960].map((cx, ci) => (
            <rect key={`cw10_${ci}`} x={cx} y="1220" width="60" height="240" fill="#ffffff" stroke="#000000" strokeWidth="6" />
          ))}

          {/* Friendly Deer Walking Across Crosswalk */}
          <g transform={`translate(${540 + Math.sin(f * 0.06) * 20}, 1380) scale(1.3)`}>
            <ellipse cx="0" cy="110" rx="90" ry="18" fill="rgba(0,0,0,0.3)" />
            <ellipse cx="0" cy="30" rx="75" ry="45" fill="#b45309" stroke="#000000" strokeWidth="8" />
            <line x1="-45" y1="65" x2="-50" y2="110" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
            <line x1="-25" y1="65" x2="-20" y2="110" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
            <line x1="25" y1="65" x2="20" y2="110" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
            <line x1="45" y1="65" x2="50" y2="110" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
            <path d="M 45 20 L 75 -40 L 95 -30 L 70 30 Z" fill="#b45309" stroke="#000000" strokeWidth="8" />
            <circle cx="85" cy="-35" r="28" fill="#b45309" stroke="#000000" strokeWidth="8" />
            <circle cx="88" cy="-42" r="5" fill="#000000" />
            <path d="M 75 -55 L 70 -90 L 55 -105 M 70 -90 L 85 -105" fill="none" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* Family of Ducks */}
          <g transform="translate(180, 1420)">
            <ellipse cx="0" cy="0" rx="32" ry="22" fill="#facc15" stroke="#000000" strokeWidth="6" />
            <circle cx="24" cy="-14" r="16" fill="#facc15" stroke="#000000" strokeWidth="5" />
            <polygon points="38,-18 52,-14 38,-10" fill="#f97316" stroke="#000000" strokeWidth="3" />
            <circle cx="28" cy="-18" r="3.5" fill="#000000" />
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 11: SUPERMARKET FEAST (RACCOONS EXPLORING AISLE)            */}
      {/* ================================================================ */}
      {currentCut === 11 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#f8fafc" />
          {/* Grocery Shelves */}
          <rect x="80" y="350" width="920" height="850" fill="#e2e8f0" stroke="#000000" strokeWidth="10" />
          {/* Shelf Bars */}
          {[550, 750, 950].map((sy, si) => (
            <line key={`sh_${si}`} x1="80" y1={sy} x2="1000" y2={sy} stroke="#64748b" strokeWidth="12" />
          ))}
          {/* Colorful Cereal Boxes on Shelves */}
          {[140, 260, 380, 500, 620, 740, 860].map((bx, bi) => (
            <g key={`box_${bi}`} transform={`translate(${bx}, 450)`}>
              <rect x="-35" y="-80" width="70" height="100" rx="6" fill={["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"][bi % 5]} stroke="#000000" strokeWidth="5" />
              <circle cx="0" cy="-30" r="14" fill="#ffffff" />
            </g>
          ))}

          {/* Supermarket Floor */}
          <rect x="0" y="1200" width="1080" height="720" fill="#cbd5e1" stroke="#000000" strokeWidth="8" />

          {/* Cute Raccoon holding cartoon donut/apple */}
          <g transform={`translate(540, 1420) scale(1.4)`}>
            <ellipse cx="0" cy="40" rx="65" ry="50" fill="#64748b" stroke="#000000" strokeWidth="8" />
            <circle cx="0" cy="-20" r="38" fill="#64748b" stroke="#000000" strokeWidth="8" />
            {/* Black bandit mask */}
            <path d="M -35 -25 Q 0 -35 35 -25 Q 25 -10 0 -15 Q -25 -10 -35 -25 Z" fill="#18181b" stroke="#000000" strokeWidth="3" />
            <circle cx="-16" cy="-22" r="5" fill="#ffffff" />
            <circle cx="-16" cy="-22" r="3" fill="#000000" />
            <circle cx="16" cy="-22" r="5" fill="#ffffff" />
            <circle cx="16" cy="-22" r="3" fill="#000000" />
            {/* Holding Apple */}
            <circle cx="28" cy="35" r="16" fill="#ef4444" stroke="#000000" strokeWidth="4" />
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 12: 7-DAY FAST-FORWARD CALENDAR PAGE TEAR                   */}
      {/* ================================================================ */}
      {currentCut === 12 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#0f172a" />

          {/* Giant Desk Calendar with flying pages */}
          <g transform={`translate(540, 850) scale(${springPunch})`}>
            {/* Calendar Stand */}
            <rect x="-280" y="-340" width="560" height="680" rx="32" fill="#ffffff" stroke="#000000" strokeWidth="14" />
            <rect x="-280" y="-340" width="560" height="140" fill="#dc2626" />
            <text x="0" y="-250" textAnchor="middle" fill="#ffffff" fontSize="48" fontWeight="900" fontFamily="Arial Black">OCTOBER</text>
            <text x="0" y="80" textAnchor="middle" fill="#000000" fontSize="180" fontWeight="900" fontFamily="Arial Black">DAY 7</text>
            <text x="0" y="240" textAnchor="middle" fill="#dc2626" fontSize="40" fontWeight="900" fontFamily="Arial Black">168 HOURS PASSED</text>
          </g>
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 13: THE GREAT ALARM CACOPHONY (VIBRATING ALARM BELLS)       */}
      {/* ================================================================ */}
      {currentCut === 13 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#fef08a" />
          <circle cx="540" cy="500" r="340" fill="#fed7aa" opacity="0.6" />

          {/* Giant Shaking Alarm Clock */}
          <g transform={`translate(540, 520) rotate(${Math.sin(f * 2.0) * 8}) scale(${springPunch})`}>
            <circle cx="0" cy="0" r="150" fill="#ef4444" stroke="#000000" strokeWidth="14" />
            <circle cx="0" cy="0" r="120" fill="#ffffff" stroke="#000000" strokeWidth="8" />
            <circle cx="-115" cy="-115" r="48" fill="#facc15" stroke="#000000" strokeWidth="8" />
            <circle cx="115" cy="-115" r="48" fill="#facc15" stroke="#000000" strokeWidth="8" />
            <rect x="-10" y="-145" width="20" height="42" fill="#000000" />
            {/* Clock Hands pointing to 12:00 */}
            <line x1="0" y1="0" x2="0" y2="-80" stroke="#000000" strokeWidth="12" strokeLinecap="round" />
            <line x1="0" y1="0" x2="50" y2="0" stroke="#000000" strokeWidth="9" strokeLinecap="round" />
            <circle cx="0" cy="0" r="10" fill="#000000" />
            {/* Concentric soundwaves */}
            <circle cx="0" cy="0" r={180 + ((f * 12) % 180)} fill="none" stroke="#ef4444" strokeWidth="6" opacity={0.6} />
          </g>

          {/* Street ground */}
          <rect x="0" y="1120" width="1080" height="800" fill="#334155" stroke="#000000" strokeWidth="8" />
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 14: THE MASS AWAKENING (8 BILLION PEOPLE WAKE UP CONFUSED)  */}
      {/* ================================================================ */}
      {currentCut === 14 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#e0f2fe" />
          <circle cx="540" cy="350" r="280" fill="#fde047" opacity="0.6" />
          <rect x="0" y="1060" width="1080" height="860" fill="#334155" stroke="#000000" strokeWidth="8" />

          {/* Crowd of waking characters with screaming/shocked eyes */}
          {[
            { x: 180, y: 1180, color: "#ef4444", hair: "boy_brown", off: 0.2 },
            { x: 380, y: 1160, color: "#10b981", hair: "girl_blonde", off: 0.6 },
            { x: 700, y: 1170, color: "#f59e0b", hair: "nerd_black", off: 0.4 },
            { x: 900, y: 1150, color: "#8b5cf6", hair: "grandma_white", off: 0.9 },
          ].map((c, i) => (
            <CircleToonCharacter key={`wake14_${i}`} x={c.x} y={c.y} scale={1.15} shirtColor={c.color} hairStyle={c.hair as any} eyeStyle="screaming" mouthStyle="open_O" bounceOffset={c.off} subtitles={subtitles} />
          ))}

          {/* Hero Waking Up in Center Foreground, checking phone */}
          <CircleToonCharacter x={540} y={1480} scale={1.45} shirtColor="#2563eb" hairStyle="boy_brown" eyeStyle="screaming" mouthStyle="talk" isSpeakingNarrator={true} holdingProp="phone" subtitles={subtitles} />
        </svg>
      )}

      {/* ================================================================ */}
      {/* SCENE 15: THE INFINITE LOOP CALL TO ACTION                        */}
      {/* ================================================================ */}
      {currentCut === 15 && (
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
          <rect width="1080" height="1920" fill="#1e1b4b" />
          <circle cx="540" cy="960" r={320 + Math.sin(f * 0.1) * 20} fill="none" stroke="#facc15" strokeWidth="8" opacity="0.4" />

          <CircleToonCharacter x={540} y={1360} scale={1.5} shirtColor="#2563eb" hairStyle="boy_brown" eyeStyle="dots" mouthStyle="talk" isSpeakingNarrator={true} subtitles={subtitles} />

          {/* Giant Animated Question Mark */}
          <text
            x="540"
            y="680"
            textAnchor="middle"
            fill="#facc15"
            stroke="#000000"
            strokeWidth="16"
            paintOrder="stroke fill"
            fontSize="160"
            fontWeight="900"
            fontFamily="Arial Black"
          >
            ?
          </text>
        </svg>
      )}
    </div>
  );
};
