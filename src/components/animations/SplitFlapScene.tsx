import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface SplitFlapSceneProps {
  targetTemp?: string;
  metricLabel?: string;
  themeColor?: string;
}

export const SplitFlapScene: React.FC<SplitFlapSceneProps> = ({
  targetTemp = "2.5 MS",
  metricLabel = "LATENCY SAVED",
  themeColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isTemp = /°C|°F|freeze|celsius|kelvin|temp|cryo/i.test(targetTemp + metricLabel);

  // Digital flap flip cycle sequence:
  const flapIndex = Math.min(
    3,
    Math.floor(
      interpolate(frame, [0, 42], [0, 3], {
        extrapolateRight: "clamp",
      })
    )
  );

  const flapSequence = isTemp
    ? ["+21.4°C", "+08.2°C", "-05.1°C", targetTemp]
    : ["99.9 MS", "45.0 MS", "08.2 MS", targetTemp];
  const activeDisplayStr = flapSequence[flapIndex];

  // Thermometer or Gauge sweep interpolation (0 to 1)
  const gaugeProgress = interpolate(frame, [0, 45], [0.15, 0.88], {
    extrapolateRight: "clamp",
  });

  // Frost creep progress (only used if isTemp)
  const frostProgress = interpolate(frame, [15, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  const alertPulse = Math.sin(frame * 0.15) * 0.2 + 0.8;

  // Atmospheric Particles: Snowflakes if temp; Digital Speed Sparks if tech/finance
  const particles = Array.from({ length: 48 }, (_, i) => {
    const seed = i * 137.5;
    const startX = (seed % width);
    const speed = 2.5 + (i % 5) * 1.2;
    const size = isTemp ? 3 + (i % 4) * 2.5 : 2 + (i % 3) * 3;
    const swayAmp = isTemp ? 15 + (i % 3) * 12 : 2;
    const swayFreq = 0.04 + (i % 4) * 0.015;

    // Movement direction: Downward for snow, Upward/diagonal for data sparks
    const totalDist = (frame * speed + seed) % (height + 100);
    const y = isTemp ? totalDist - 50 : height - totalDist;
    const x = isTemp
      ? (startX + Math.sin(frame * swayFreq + i) * swayAmp) % width
      : (startX + (frame * 1.5) % 80) % width;
    const opacity = 0.35 + (i % 4) * 0.18;

    return { x, y, size, opacity };
  });

  // Render procedural ice crystal frost on corners (ONLY when isTemp is true)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    if (!isTemp || frostProgress <= 0) return;

    ctx.save();
    ctx.strokeStyle = `rgba(224, 242, 254, ${frostProgress * 0.75})`;
    ctx.fillStyle = `rgba(186, 230, 253, ${frostProgress * 0.35})`;
    ctx.lineWidth = 1.5;

    const drawBranch = (x: number, y: number, angle: number, len: number, depth: number) => {
      if (depth <= 0 || len < 4) return;
      const ex = x + Math.cos(angle) * len;
      const ey = y + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      const spread = 0.45;
      drawBranch(ex, ey, angle - spread, len * 0.68, depth - 1);
      drawBranch(ex, ey, angle + spread, len * 0.68, depth - 1);
    };

    const maxLen = 140 * frostProgress;
    drawBranch(0, 0, 0.75, maxLen, 4);
    drawBranch(40, 0, 0.9, maxLen * 0.8, 3);
    drawBranch(width, 0, Math.PI - 0.75, maxLen, 4);
    drawBranch(0, height, -0.75, maxLen, 4);
    drawBranch(width, height, -Math.PI + 0.75, maxLen, 4);

    ctx.restore();
  }, [isTemp, frostProgress, width, height]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070c18",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. CONTROL ROOM BACKDROP */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isTemp
            ? "radial-gradient(ellipse at 50% 50%, #0c1a2e 0%, #060b14 65%, #020408 100%)"
            : "radial-gradient(ellipse at 50% 50%, #0f172a 0%, #090d16 65%, #030712 100%)",
        }}
      />

      {/* Industrial Seams */}
      <div
        style={{
          position: "absolute",
          inset: "30px",
          border: "2px solid rgba(51, 65, 85, 0.4)",
          borderRadius: 28,
          pointerEvents: "none",
        }}
      >
        <div style={{ position: "absolute", top: "54%", left: 0, width: "100%", height: 2, backgroundColor: "rgba(51, 65, 85, 0.3)" }} />
        {[10, 25, 40, 55, 70, 85].map((pct, idx) => (
          <React.Fragment key={idx}>
            <div style={{ position: "absolute", top: `${pct}%`, left: 8, width: 8, height: 8, borderRadius: "50%", backgroundColor: "#334155", boxShadow: "inset 0 0 2px #000" }} />
            <div style={{ position: "absolute", top: `${pct}%`, right: 8, width: 8, height: 8, borderRadius: "50%", backgroundColor: "#334155", boxShadow: "inset 0 0 2px #000" }} />
          </React.Fragment>
        ))}
      </div>

      {/* Hex Bolt Accents */}
      {[
        { top: 45, left: 45 },
        { top: 45, right: 45 },
        { bottom: 45, left: 45 },
        { bottom: 45, right: 45 },
      ].map((pos, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            ...pos,
            width: 18,
            height: 18,
            borderRadius: "30%",
            backgroundColor: "#475569",
            border: "2px solid #64748b",
            boxShadow: "0 4px 10px rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#0f172a" }} />
        </div>
      ))}

      {/* 2. MAIN CENTER HUD DISPLAY */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "5%",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Metric Badge */}
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 100,
            backgroundColor: isTemp ? "rgba(56, 189, 248, 0.15)" : "rgba(245, 158, 11, 0.15)",
            border: `2px solid ${isTemp ? "#38bdf8" : "#f59e0b"}`,
            color: isTemp ? "#38bdf8" : "#fbbf24",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 20,
            boxShadow: `0 0 20px ${isTemp ? "rgba(56, 189, 248, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
          }}
        >
          {metricLabel}
        </div>

        {/* 3. AIRPORT MECHANICAL SPLIT-FLAP TILES */}
        <div
          style={{
            display: "flex",
            gap: 12,
            backgroundColor: "#030712",
            padding: "22px 28px",
            borderRadius: 24,
            border: "3px solid #1e293b",
            boxShadow: "0 25px 60px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.8)",
          }}
        >
          {activeDisplayStr.split("").map((char, idx) => {
            const isSign = char === "+" || char === "-";
            const isUnit = char === "°" || char === "C" || char === "F" || char === "S" || char === "M";
            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: char === "." || char === "," ? 34 : 64,
                  height: 94,
                  backgroundColor: "#0b1120",
                  borderRadius: 12,
                  border: "2px solid #334155",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Horizontal Center Seam of Flap */}
                <div
                  style={{
                    position: "absolute",
                    top: "49%",
                    left: 0,
                    width: "100%",
                    height: 2,
                    backgroundColor: "#020617",
                    zIndex: 4,
                  }}
                />
                {/* Flap Character */}
                <span
                  style={{
                    color: isSign
                      ? char === "+" ? "#ef4444" : "#38bdf8"
                      : isUnit
                      ? "#38bdf8"
                      : "#ffffff",
                    fontSize: 54,
                    fontWeight: 900,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    letterSpacing: -1,
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  {char}
                </span>
              </div>
            );
          })}
        </div>

        {/* 4. ADAPTIVE INSTRUMENT GAUGE */}
        {isTemp ? (
          /* THERMOMETER (Temperature topics) */
          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 30,
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              padding: "18px 28px",
              borderRadius: 24,
              border: "2px solid #1e293b",
              boxShadow: "0 20px 45px rgba(0,0,0,0.7)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 32,
                height: 220,
                backgroundColor: "rgba(224, 242, 254, 0.15)",
                borderRadius: "16px 16px 24px 24px",
                border: "2px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "inset 0 0 10px rgba(56, 189, 248, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  bottom: 26,
                  width: 8,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: `${(1 - gaugeProgress) * 100}%`,
                    backgroundColor: "#ef4444",
                    boxShadow: "0 0 12px #ef4444",
                    transition: "height 0.1s ease-out",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  boxShadow: "0 0 18px #ef4444, inset 0 0 6px #7f1d1d",
                  border: "2px solid rgba(255,255,255,0.7)",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "monospace" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 13 }}>+30°C</span>
                <div style={{ width: 18, height: 2, backgroundColor: "#ef4444" }} />
                <span style={{ color: "#64748b", fontSize: 11 }}>AMBIENT</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 13 }}>+10°C</span>
                <div style={{ width: 14, height: 2, backgroundColor: "#f59e0b" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#e2e8f0", fontWeight: 900, fontSize: 14 }}> 0°C</span>
                <div style={{ width: 22, height: 2.5, backgroundColor: "#e2e8f0" }} />
                <span style={{ color: "#94a3b8", fontSize: 11 }}>WATER FREEZE</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#38bdf8", fontWeight: 900, fontSize: 16 }}>{targetTemp}</span>
                <div style={{ width: 28, height: 3, backgroundColor: "#38bdf8", boxShadow: "0 0 10px #38bdf8" }} />
                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 12 }}>CRYO TARGET</span>
              </div>
            </div>
          </div>
        ) : (
          /* CIRCULAR TACHOMETER / DIGITAL SPEEDOMETER (Tech, Finance, Speed, Latency) */
          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 32,
              backgroundColor: "rgba(15, 23, 42, 0.90)",
              padding: "24px 36px",
              borderRadius: 28,
              border: "2px solid #1e293b",
              boxShadow: "0 20px 45px rgba(0,0,0,0.8)",
            }}
          >
            {/* Circular Gauge Graphic */}
            <div
              style={{
                position: "relative",
                width: 150,
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="150" height="150" viewBox="0 0 150 150">
                {/* Outer Ring */}
                <circle cx="75" cy="75" r="62" fill="none" stroke="#1e293b" strokeWidth="8" />
                {/* Active Arc (Sweeps to 85%) */}
                <circle
                  cx="75"
                  cy="75"
                  r="62"
                  fill="none"
                  stroke={themeColor}
                  strokeWidth="8"
                  strokeDasharray="390"
                  strokeDashoffset={390 - (390 * gaugeProgress * 0.75)}
                  strokeLinecap="round"
                  transform="rotate(135 75 75)"
                  style={{ filter: `drop-shadow(0 0 8px ${themeColor})` }}
                />
                {/* Needle */}
                <line
                  x1="75"
                  y1="75"
                  x2={75 + Math.cos((135 + gaugeProgress * 270) * (Math.PI / 180)) * 48}
                  y2={75 + Math.sin((135 + gaugeProgress * 270) * (Math.PI / 180)) * 48}
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Center Hub */}
                <circle cx="75" cy="75" r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Readout Data Matrix */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "monospace" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>BENCHMARK</span>
                <span style={{ color: "#ef4444", fontSize: 20, fontWeight: 900 }}>100.0 MS</span>
              </div>
              <div style={{ width: 120, height: 1.5, backgroundColor: "#334155" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: themeColor, fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>OPTIMIZED SPEED</span>
                <span style={{ color: "#ffffff", fontSize: 26, fontWeight: 900, textShadow: `0 0 10px ${themeColor}` }}>
                  {targetTemp}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. STATUS TELEMETRY TILES */}
        <div
          style={{
            marginTop: 25,
            display: "flex",
            gap: 16,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: "10px 18px",
              borderRadius: 14,
              backgroundColor: isTemp ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
              border: `1.5px solid ${isTemp ? "#ef4444" : "#10b981"}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: isTemp ? "#ef4444" : "#10b981" }} />
            <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>
              {isTemp ? "GRID: OFFLINE" : "SYSTEM: 100% ONLINE"}
            </span>
          </div>

          <div
            style={{
              padding: "10px 18px",
              borderRadius: 14,
              backgroundColor: `rgba(56, 189, 248, ${0.15 * alertPulse})`,
              border: "1.5px solid #38bdf8",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 0 15px rgba(56, 189, 248, ${0.3 * alertPulse})`,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#38bdf8" }} />
            <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>
              {isTemp ? "PASSIVE: STABLE" : "LATENCY: LOCKED"}
            </span>
          </div>
        </div>
      </div>

      {/* 6. ATMOSPHERIC PARTICLES (Snowflakes if Temp, Neon Data Sparks if Tech/Finance) */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: isTemp ? p.size : p.size * 0.8,
            height: isTemp ? p.size : p.size * 3.5, // elongated streaks for speed
            borderRadius: isTemp ? "50%" : "2px",
            backgroundColor: isTemp ? "#ffffff" : (idx % 2 === 0 ? themeColor : "#fbbf24"),
            opacity: p.opacity,
            boxShadow: `0 0 8px ${isTemp ? "rgba(224, 242, 254, 0.8)" : themeColor}`,
            pointerEvents: "none",
            zIndex: 12,
          }}
        />
      ))}

      {/* 7. CANVAS FOR CREEPING CORNER FROST (Only rendered if isTemp) */}
      {isTemp && (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 15,
          }}
        />
      )}

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.9)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
