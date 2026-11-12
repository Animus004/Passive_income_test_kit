import React, { useMemo } from "react";
import { interpolate } from "remotion";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  bg: string;
  bgGradient: string;
}

export const THEME_CONFIGS: Record<string, ThemeColors> = {
  space: {
    primary: "#38bdf8",
    secondary: "#818cf8",
    accent: "#f59e0b",
    glow: "rgba(56, 189, 248, 0.45)",
    bg: "#030712",
    bgGradient: "radial-gradient(ellipse at 50% 25%, #1e1b4b 0%, #030712 75%)",
  },
  cyber: {
    primary: "#10b981",
    secondary: "#06b6d4",
    accent: "#eab308",
    glow: "rgba(16, 185, 129, 0.45)",
    bg: "#02120b",
    bgGradient: "radial-gradient(ellipse at 50% 25%, #064e3b 0%, #020a06 75%)",
  },
  ocean: {
    primary: "#06b6d4",
    secondary: "#0284c7",
    accent: "#38bdf8",
    glow: "rgba(6, 182, 212, 0.45)",
    bg: "#020617",
    bgGradient: "radial-gradient(ellipse at 50% 25%, #082f49 0%, #020617 75%)",
  },
  finance: {
    primary: "#f59e0b",
    secondary: "#10b981",
    accent: "#ef4444",
    glow: "rgba(245, 158, 11, 0.45)",
    bg: "#0f0a02",
    bgGradient: "radial-gradient(ellipse at 50% 25%, #451a03 0%, #0a0601 75%)",
  },
  quantum: {
    primary: "#c084fc",
    secondary: "#e879f9",
    accent: "#38bdf8",
    glow: "rgba(192, 132, 252, 0.5)",
    bg: "#0b0214",
    bgGradient: "radial-gradient(ellipse at 50% 25%, #3b0764 0%, #07010d 75%)",
  },
  infrastructure: {
    primary: "#f97316",
    secondary: "#38bdf8",
    accent: "#eab308",
    glow: "rgba(249, 115, 22, 0.45)",
    bg: "#0a0a0c",
    bgGradient: "radial-gradient(ellipse at 50% 25%, #431407 0%, #050507 75%)",
  },
};

export function getThemeConfig(theme?: string): ThemeColors {
  const t = (theme || "space").toLowerCase();
  return THEME_CONFIGS[t] || THEME_CONFIGS.space;
}

// --------------------------------------------------------------------------
// 1. Dynamic Atmosphere (Particles, Grid, Ambient Elements)
// --------------------------------------------------------------------------
export const ThemeAtmosphere: React.FC<{ theme: string; frame: number }> = ({
  theme,
  frame,
}) => {
  const colors = getThemeConfig(theme);

  // Background stars / nodes
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      x: ((i * 47 + 13) % 94) + 3,
      startY: (i * 59 + 29) % 100,
      size: (i % 4) * 2 + 2,
      speed: 0.2 + (i % 3) * 0.2,
      opacity: 0.2 + ((i * 17) % 60) / 100,
    }));
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Radial Gradient Base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colors.bgGradient,
          opacity: 0.85,
        }}
      />

      {/* Cyber/Matrix Grid for cyber & infrastructure */}
      {(theme === "cyber" || theme === "infrastructure" || theme === "finance") && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(to right, ${colors.glow} 1px, transparent 1px), linear-gradient(to bottom, ${colors.glow} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            opacity: 0.12,
            transform: "perspective(600px) rotateX(45deg) translateY(-100px)",
            transformOrigin: "center top",
          }}
        />
      )}

      {/* Dynamic Floating Particles */}
      {particles.map((p, i) => {
        const currentY =
          theme === "ocean"
            ? (p.startY - frame * p.speed + 100) % 100
            : (p.startY + frame * (p.speed * 0.5)) % 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${currentY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? colors.primary : colors.accent,
              boxShadow: `0 0 ${p.size * 3}px ${colors.primary}`,
              opacity: p.opacity + Math.sin(frame * 0.08 + i) * 0.2,
            }}
          />
        );
      })}
    </div>
  );
};

// --------------------------------------------------------------------------
// 2. Scene 1 Hero Hook Graphic
// --------------------------------------------------------------------------
export const ThemeHookGraphic: React.FC<{ theme: string; frame: number }> = ({
  theme,
  frame,
}) => {
  const colors = getThemeConfig(theme);
  const rot = interpolate(frame, [0, 240], [0, 180]);
  const pulse = 1 + Math.sin(frame * 0.08) * 0.04;

  if (theme === "cyber") {
    // Silicon Chip Wafer Centerpiece
    return (
      <svg width={700} height={700} viewBox="0 0 700 700" style={{ transform: `scale(${pulse})` }}>
        <rect x={180} y={180} width={340} height={340} rx={24} fill="#022c22" stroke={colors.primary} strokeWidth={6} />
        <rect x={220} y={220} width={260} height={260} rx={16} fill="#064e3b" stroke={colors.accent} strokeWidth={4} />
        <text x={350} y={360} textAnchor="middle" fill="#ffffff" fontSize={36} fontWeight={900} fontFamily="monospace">
          2nm WAFER
        </text>
        {/* Radiating Bus Lines */}
        {Array.from({ length: 8 }).map((_, i) => {
          const offset = ((frame * 6 + i * 40) % 200);
          return (
            <g key={i}>
              <line x1={350} y1={180} x2={100 + i * 70} y2={40} stroke={colors.primary} strokeWidth={4} strokeDasharray="16 16" strokeDashoffset={-offset} />
              <line x1={350} y1={520} x2={100 + i * 70} y2={660} stroke={colors.secondary} strokeWidth={4} strokeDasharray="16 16" strokeDashoffset={offset} />
            </g>
          );
        })}
      </svg>
    );
  }

  if (theme === "finance") {
    // High-Frequency Market Candlestick Radar
    return (
      <svg width={700} height={700} viewBox="0 0 700 700">
        <circle cx={350} cy={350} r={240} fill="none" stroke={colors.primary} strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />
        <circle cx={350} cy={350} r={160} fill="#1c1917" stroke={colors.accent} strokeWidth={5} />
        {/* Radar Sweep */}
        <line x1={350} y1={350} x2={350 + Math.cos(rot * 0.05) * 230} y2={350 + Math.sin(rot * 0.05) * 230} stroke={colors.primary} strokeWidth={5} />
        <text x={350} y={345} textAnchor="middle" fill={colors.accent} fontSize={32} fontWeight={900}>
          HFT RADAR
        </text>
        <text x={350} y={385} textAnchor="middle" fill="#ffffff" fontSize={24} fontWeight={800} fontFamily="monospace">
          0.0003s LATENCY
        </text>
      </svg>
    );
  }

  if (theme === "quantum") {
    // Quantum Orbital Nucleus
    return (
      <svg width={700} height={700} viewBox="0 0 700 700" style={{ transform: `scale(${pulse})` }}>
        <circle cx={350} cy={350} r={55} fill={colors.accent} filter="drop-shadow(0 0 20px #e879f9)" />
        <ellipse cx={350} cy={350} rx={220} ry={70} fill="none" stroke={colors.primary} strokeWidth={5} transform={`rotate(${rot}, 350, 350)`} />
        <ellipse cx={350} cy={350} rx={220} ry={70} fill="none" stroke={colors.secondary} strokeWidth={5} transform={`rotate(${rot + 60}, 350, 350)`} />
        <ellipse cx={350} cy={350} rx={220} ry={70} fill="none" stroke="#ffffff" strokeWidth={4} transform={`rotate(${rot + 120}, 350, 350)`} />
      </svg>
    );
  }

  // Default: Planetary Orbit Wireframe (Space / Ocean / Infra)
  return (
    <svg width={700} height={700} viewBox="0 0 700 700" style={{ transform: `scale(${pulse})` }}>
      <circle cx={350} cy={350} r={210} fill="rgba(15, 23, 42, 0.35)" stroke={colors.primary} strokeWidth={4} />
      <ellipse cx={350} cy={350} rx={210} ry={85} fill="none" stroke={colors.primary} strokeWidth={3} strokeDasharray="14 14" opacity={0.7} transform={`rotate(${rot * 0.5}, 350, 350)`} />
      <ellipse cx={350} cy={350} rx={85} ry={210} fill="none" stroke={colors.secondary} strokeWidth={3} strokeDasharray="14 14" opacity={0.7} transform={`rotate(${rot * 0.5}, 350, 350)`} />
      {/* Center Globe Glow */}
      <circle cx={350} cy={350} r={140} fill="none" stroke={colors.accent} strokeWidth={2} opacity={0.4} />
    </svg>
  );
};

// --------------------------------------------------------------------------
// 3. Scene 2 Myth Graphic (Misconception Counter Centerpiece)
// --------------------------------------------------------------------------
export const ThemeMythGraphic: React.FC<{ theme: string; frame: number; statNumber: string }> = ({
  theme,
  frame,
  statNumber,
}) => {
  const colors = getThemeConfig(theme);

  if (theme === "cyber") {
    // Firewall Bypass Telemetry
    const scanY = 180 + ((frame * 8) % 340);
    return (
      <svg width={700} height={700} viewBox="0 0 700 700">
        <polygon points="350,140 540,240 540,480 350,580 160,480 160,240" fill="#022c22" stroke={colors.primary} strokeWidth={5} />
        <line x1={180} y1={scanY} x2={520} y2={scanY} stroke={colors.accent} strokeWidth={6} opacity={0.8} />
        <text x={350} y={350} textAnchor="middle" fill="#ffffff" fontSize={70} fontWeight={900} fontFamily="monospace">
          {statNumber}
        </text>
        <text x={350} y={410} textAnchor="middle" fill={colors.accent} fontSize={24} fontWeight={800}>
          SOFTWARE LIMIT
        </text>
      </svg>
    );
  }

  if (theme === "finance") {
    // Fast Stock Ticker Distortion
    return (
      <svg width={700} height={700} viewBox="0 0 700 700">
        <rect x={160} y={200} width={380} height={280} rx={24} fill="#1c1917" stroke={colors.accent} strokeWidth={6} />
        <text x={350} y={330} textAnchor="middle" fill={colors.accent} fontSize={80} fontWeight={900} fontFamily="monospace">
          {statNumber}
        </text>
        <text x={350} y={395} textAnchor="middle" fill="#ffffff" fontSize={26} fontWeight={800}>
          TRADERS ASSUME
        </text>
      </svg>
    );
  }

  // Space / Default: Orbiting Satellites with Beaming Lasers
  const satAngle1 = (frame * 0.04) % (Math.PI * 2);
  const satAngle2 = (frame * 0.03 + 2.5) % (Math.PI * 2);
  return (
    <svg width={700} height={700} viewBox="0 0 700 700">
      <circle cx={350} cy={350} r={170} fill="rgba(15, 23, 42, 0.45)" stroke={colors.primary} strokeWidth={4} />
      {/* Orbit 1 */}
      <ellipse cx={350} cy={350} rx={270} ry={110} fill="none" stroke={colors.primary} strokeWidth={3} strokeDasharray="12 12" opacity={0.6} transform="rotate(-25, 350, 350)" />
      {/* Satellite 1 */}
      <circle cx={350 + Math.cos(satAngle1) * 260} cy={350 + Math.sin(satAngle1) * 105} r={14} fill={colors.accent} />
      {/* Satellite 2 */}
      <circle cx={350 + Math.cos(satAngle2) * 260} cy={350 + Math.sin(satAngle2) * 105} r={12} fill="#ffffff" />
      <text x={350} y={345} textAnchor="middle" fill="#ffffff" fontSize={72} fontWeight={900} fontFamily="monospace">
        {statNumber}
      </text>
    </svg>
  );
};

// --------------------------------------------------------------------------
// 4. Scene 3 Hero Physical Reality Graphic
// --------------------------------------------------------------------------
export const ThemeRealityGraphic: React.FC<{
  theme: string;
  frame: number;
  statNumber: string;
  statLabel: string;
}> = ({ theme, frame, statNumber, statLabel }) => {
  const colors = getThemeConfig(theme);

  if (theme === "space") {
    // Relativistic Atomic Clock Dilation Core
    const ringPulse1 = 180 + ((frame * 4) % 180);
    const ringPulse2 = 180 + (((frame + 45) * 4) % 180);
    return (
      <svg width={900} height={900} viewBox="0 0 900 900">
        <circle cx={450} cy={450} r={ringPulse1} fill="none" stroke={colors.primary} strokeWidth={4} opacity={Math.max(0, 1 - ringPulse1 / 360)} />
        <circle cx={450} cy={450} r={ringPulse2} fill="none" stroke={colors.secondary} strokeWidth={4} opacity={Math.max(0, 1 - ringPulse2 / 360)} />
        {/* Core Chronometer Dial */}
        <circle cx={450} cy={450} r={190} fill="#090d16" stroke={colors.accent} strokeWidth={8} />
        {/* Clock Tick Hand */}
        <line x1={450} y1={450} x2={450 + Math.cos(frame * 0.12) * 140} y2={450 + Math.sin(frame * 0.12) * 140} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
        <circle cx={450} cy={450} r={16} fill={colors.accent} />
      </svg>
    );
  }

  if (theme === "cyber") {
    // Extreme Ultraviolet Photolithography Laser Wafer
    const laserX = 250 + Math.sin(frame * 0.08) * 180;
    const laserY = 250 + Math.cos(frame * 0.09) * 180;
    return (
      <svg width={900} height={900} viewBox="0 0 900 900">
        <circle cx={450} cy={450} r={320} fill="#021f18" stroke={colors.primary} strokeWidth={8} />
        {/* Grid Circuit Pattern */}
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i}>
            <line x1={200 + i * 60} y1={180} x2={200 + i * 60} y2={720} stroke={colors.primary} strokeWidth={3} opacity={0.35} />
            <line x1={180} y1={200 + i * 60} x2={720} y2={200 + i * 60} stroke={colors.primary} strokeWidth={3} opacity={0.35} />
          </g>
        ))}
        {/* EUV Laser Head & Beam */}
        <line x1={450} y1={80} x2={laserX} y2={laserY} stroke="#ffffff" strokeWidth={6} strokeDasharray="8 8" />
        <circle cx={laserX} cy={laserY} r={28} fill={colors.accent} filter="drop-shadow(0 0 25px #eab308)" />
      </svg>
    );
  }

  if (theme === "finance") {
    // High-Frequency Trading Optical Tunnel (Through Mountains)
    const beamOffset = -frame * 16;
    return (
      <svg width={900} height={900} viewBox="0 0 900 900">
        {/* Mountain Silhouettes */}
        <polygon points="50,750 280,350 450,600 680,280 850,750" fill="#1c1917" stroke="#292524" strokeWidth={6} />
        {/* Laser Drill Beam Piercing Through */}
        <line x1={0} y1={520} x2={900} y2={520} stroke="#451a03" strokeWidth={24} opacity={0.5} />
        <line x1={0} y1={520} x2={900} y2={520} stroke={colors.primary} strokeWidth={10} strokeDasharray="30 50" strokeDashoffset={beamOffset} />
        <line x1={0} y1={520} x2={900} y2={520} stroke="#ffffff" strokeWidth={4} />
      </svg>
    );
  }

  // Default / Ocean: Undersea Fiber-Optic Cables Highway
  const pulseOffset = -frame * 12;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", top: 0, left: 0 }}>
      {/* Cable 1 */}
      <path d="M -100 480 C 250 420, 480 620, 800 490 S 1050 460, 1180 540" fill="none" stroke="#0c4a6e" strokeWidth={16} opacity={0.5} />
      <path d="M -100 480 C 250 420, 480 620, 800 490 S 1050 460, 1180 540" fill="none" stroke={colors.primary} strokeWidth={6} strokeDasharray="20 40" strokeDashoffset={pulseOffset} />
      {/* Cable 2 (Center Spine) */}
      <path d="M -80 780 C 300 700, 520 920, 820 760 S 1060 840, 1180 810" fill="none" stroke={colors.secondary} strokeWidth={20} opacity={0.65} />
      <path d="M -80 780 C 300 700, 520 920, 820 760 S 1060 840, 1180 810" fill="none" stroke="#ffffff" strokeWidth={7} strokeDasharray="25 45" strokeDashoffset={pulseOffset} />
      {/* Cable 3 */}
      <path d="M -60 1060 C 200 1140, 540 980, 850 1120 S 1040 1080, 1160 1150" fill="none" stroke="#0284c7" strokeWidth={16} opacity={0.55} />
      <path d="M -60 1060 C 200 1140, 540 980, 850 1120 S 1040 1080, 1160 1150" fill="none" stroke={colors.accent} strokeWidth={6} strokeDasharray="20 40" strokeDashoffset={pulseOffset} />
    </svg>
  );
};

// --------------------------------------------------------------------------
// 5. Scene 5 Infinite Retention Loop Portal
// --------------------------------------------------------------------------
export const ThemeLoopPortal: React.FC<{ theme: string; frame: number; kickerText: string }> = ({
  theme,
  frame,
  kickerText,
}) => {
  const colors = getThemeConfig(theme);
  const rot1 = (frame * 1.5) % 360;
  const rot2 = (-frame * 2.2) % 360;
  const pulse = 1 + Math.sin(frame * 0.12) * 0.05;

  return (
    <div
      style={{
        position: "relative",
        width: 600,
        height: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${pulse})`,
      }}
    >
      <svg width={600} height={600} viewBox="0 0 600 600" style={{ position: "absolute" }}>
        {/* Outer Ring */}
        <circle cx={300} cy={300} r={260} fill="none" stroke={colors.primary} strokeWidth={4} strokeDasharray="16 24" transform={`rotate(${rot1}, 300, 300)`} />
        {/* Middle Counter-rotating Ring */}
        <circle cx={300} cy={300} r={210} fill="none" stroke={colors.secondary} strokeWidth={6} strokeDasharray="30 20" transform={`rotate(${rot2}, 300, 300)`} />
        {/* Inner Solid Portal Core */}
        <circle cx={300} cy={300} r={165} fill="#030712" stroke={colors.accent} strokeWidth={6} />
      </svg>
      {/* Central Kicker Text */}
      <div
        style={{
          zIndex: 10,
          textAlign: "center",
          maxWidth: 320,
          color: "#ffffff",
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 2,
          textShadow: `0 0 20px ${colors.primary}`,
        }}
      >
        {kickerText}
      </div>
    </div>
  );
};

