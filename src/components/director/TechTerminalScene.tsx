import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { GlassCard } from "../depth/GlassCard";

export interface TechTerminalProps {
  title?: string;
  codeSnippet?: string;
  status?: string;
  icon?: string;
  color?: string;
}

export const TechTerminalScene: React.FC<TechTerminalProps> = ({
  title = "CORE ALGORITHM / SYSTEM CODE",
  codeSnippet = "apply_relativistic_patch(gravity, velocity)",
  status = "EXECUTING KERNEL OVERRIDE...",
  icon = "💻",
  color = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  // Typewriter effect on code snippet
  const charsToShow = Math.floor(
    interpolate(frame, [15, 60], [0, codeSnippet.length], {
      extrapolateRight: "clamp",
    })
  );
  const displayedCode = codeSnippet.slice(0, charsToShow);
  const cursorBlink = Math.floor(frame / 8) % 2 === 0 ? "█" : " ";

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 230,
        pointerEvents: "none",
      }}
    >
      {/* Category Pill */}
      <div
        style={{
          padding: "12px 36px",
          borderRadius: 999,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          border: `1.5px solid ${color}`,
          borderTop: "2px solid #ffffff",
          boxShadow: `0 0 35px ${color}55, 0 10px 25px rgba(0,0,0,0.6)`,
          color: "#ffffff",
          fontSize: 24,
          fontWeight: 950,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 30,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 30 }}>{icon}</span>
        <span>{title}</span>
      </div>

      {/* 3D Frosted Hacker Terminal Window */}
      <GlassCard width={840} color={color}>
        {/* Terminal Window Header */}
        <div
          style={{
            padding: "16px 24px",
            background: "rgba(15, 23, 42, 0.7)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ marginLeft: 16, fontSize: 18, color: "#94a3b8", fontFamily: "monospace" }}>
            bash - relativistic_patch.py (1080x1920)
          </span>
        </div>

        {/* Code Content */}
        <div
          style={{
            padding: "36px 36px",
            fontFamily: "monospace",
            fontSize: 26,
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: "#22c55e", marginBottom: 14 }}>
            $ python -m physics_engine --apply-einstein-correction
          </div>
          <div style={{ color: "#e2e8f0" }}>
            <span style={{ color: "#f43f5e" }}>def</span>{" "}
            <span style={{ color: "#38bdf8" }}>sync_satellite_clocks</span>():
          </div>
          <div style={{ color: "#facc15", paddingLeft: 28, marginTop: 4 }}>
            {displayedCode}
            <span style={{ color }}>{cursorBlink}</span>
          </div>

          {/* Pulse Status Badge */}
          <div
            style={{
              marginTop: 28,
              padding: "14px 20px",
              borderRadius: 12,
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              borderLeft: "5px solid #22c55e",
              color: "#4ade80",
              fontSize: 22,
              fontWeight: 800,
              boxShadow: "0 0 25px rgba(34, 197, 94, 0.2)",
            }}
          >
            ⚡ {status}
          </div>
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};
