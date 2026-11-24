import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface StatChartSceneProps {
  title?: string;
  metricNumber?: string;
  metricLabel?: string;
  subtext?: string;
  color?: string;
}

export const StatChartScene: React.FC<StatChartSceneProps> = ({
  title = "DATA TELEMETRY & GROWTH",
  metricNumber = "99.99%",
  metricLabel = "PEAK RECORD",
  subtext = "EXPONENTIAL NETWORK EFFICIENCY",
  color = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Line draw progress (0 to 1)
  const drawProgress = interpolate(frame, [10, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Numerical counter interpolation
  const cleanNum = parseFloat(metricNumber.replace(/[^0-9.]/g, "")) || 100;
  const currentCount = (cleanNum * drawProgress).toFixed(
    metricNumber.includes(".") ? 1 : 0
  );
  const displayValue = metricNumber.replace(/[0-9.]+/, currentCount);

  // SVG Chart Dimensions
  const chartW = 860;
  const chartH = 460;
  const pathD = `M 30,${chartH - 40} C 180,${chartH - 60} 260,${chartH - 120} 400,${chartH - 180} C 540,${chartH - 240} 650,${chartH - 340} ${chartW - 30},40`;

  // Total approximate path length for strokeDashoffset
  const pathLength = 1100;
  const strokeOffset = pathLength * (1 - drawProgress);

  // Tracer dot position approximation along curve
  const tracerX = interpolate(drawProgress, [0, 0.4, 0.7, 1], [30, 360, 620, chartW - 30]);
  const tracerY = interpolate(drawProgress, [0, 0.4, 0.7, 1], [chartH - 40, chartH - 160, chartH - 300, 40]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. STUDIO CYBER BACKGROUND */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 40%, #0f172a 0%, #030712 75%, #000000 100%)",
        }}
      />

      {/* Cyber Grid Base on Floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "45%",
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
          transform: "perspective(600px) rotateX(65deg)",
          transformOrigin: "bottom center",
          pointerEvents: "none",
        }}
      />

      {/* Volumetric Radial Glow Behind Graph Peak */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          right: "12%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}33 0%, ${color}00 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* 2. HEADER BADGE */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: `1.5px solid ${color}`,
            padding: "8px 24px",
            borderRadius: 999,
            boxShadow: `0 0 25px ${color}44`,
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
          <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>
            REAL-TIME METRIC ANALYSIS
          </span>
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: 34,
            fontWeight: 900,
            marginTop: 12,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {title}
        </div>
      </div>

      {/* 3. MAIN NEON VECTOR GRAPH */}
      <div
        style={{
          position: "absolute",
          top: "26%",
          left: "50%",
          transform: `translateX(-50%) scale(${entrySpring})`,
          width: chartW,
          height: chartH,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(56, 189, 248, 0.1)",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
        }}
      >
        {/* Horizontal grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${ratio * 100}%`,
              left: 24,
              right: 24,
              height: 1,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          />
        ))}

        <svg width={chartW} height={chartH} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Fill under line */}
          <path
            d={`${pathD} L ${chartW - 30},${chartH} L 30,${chartH} Z`}
            fill="url(#chartGradient)"
            opacity={drawProgress}
          />

          {/* Neon line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeOffset}
            filter="url(#neonGlow)"
          />

          {/* Tracer glowing dot */}
          {drawProgress > 0.05 && (
            <g transform={`translate(${tracerX}, ${tracerY})`}>
              <circle r="14" fill={color} opacity="0.35">
                <animate attributeName="r" values="10;22;10" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle r="7" fill="#ffffff" stroke={color} strokeWidth="3" />
            </g>
          )}
        </svg>

        {/* Dynamic Metric HUD Overlay inside graph */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 36,
            zIndex: 10,
          }}
        >
          <div style={{ color: color, fontSize: 13, fontWeight: 900, letterSpacing: 2 }}>
            {metricLabel.toUpperCase()}
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 56,
              fontWeight: 950,
              fontFamily: "monospace",
              lineHeight: 1.1,
              textShadow: `0 0 30px ${color}88`,
            }}
          >
            {displayValue}
          </div>
          <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 14, fontWeight: 700, marginTop: 4 }}>
            {subtext}
          </div>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 140px rgba(0,0,0,0.85)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
