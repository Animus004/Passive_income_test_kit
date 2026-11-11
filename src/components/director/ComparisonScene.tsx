import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlassCard } from "../depth/GlassCard";

export interface ComparisonProps {
  title?: string;
  itemA?: string;
  itemB?: string;
  highlight?: string;
  icon?: string;
  color?: string;
}

export const ComparisonScene: React.FC<ComparisonProps> = ({
  title = "THE REALITY GAP",
  itemA = "Earth Clocks (Slower)",
  itemB = "Satellite Clocks (Faster)",
  highlight = "TIME TICKS FASTER IN SPACE",
  icon = "⏳",
  color = "#f59e0b",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bannerSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

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
          fontSize: 26,
          fontWeight: 950,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 30,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 34 }}>{icon}</span>
        <span>{title}</span>
      </div>

      {/* 3D Frosted Glass Container */}
      <GlassCard width={840} color={color}>
        <div
          style={{
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Card A (Earth) */}
          <div
            style={{
              padding: "24px 30px",
              background: "rgba(30, 41, 59, 0.6)",
              borderRadius: 20,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: "#cbd5e1" }}>
              {itemA}
            </span>
            <span style={{ fontSize: 36 }}>🌍</span>
          </div>

          {/* Glowing VS Separator */}
          <div
            style={{
              alignSelf: "center",
              padding: "8px 24px",
              background: `linear-gradient(90deg, #dc2626, ${color})`,
              color: "#ffffff",
              fontWeight: 950,
              fontSize: 20,
              borderRadius: 999,
              letterSpacing: 2,
              boxShadow: `0 0 25px ${color}`,
            }}
          >
            VERSUS
          </div>

          {/* Card B (Satellites) */}
          <div
            style={{
              padding: "26px 30px",
              background: `linear-gradient(135deg, rgba(15, 23, 42, 0.85), ${color}22)`,
              borderRadius: 20,
              border: `2px solid ${color}`,
              borderTop: "2px solid #ffffff",
              boxShadow: `0 0 40px ${color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 950, color: "#ffffff" }}>
              {itemB}
            </span>
            <span style={{ fontSize: 38 }}>🛰️</span>
          </div>

          {/* Highlight Punchline Banner */}
          <div
            style={{
              transform: `scale(${bannerSpring})`,
              opacity: bannerSpring,
              marginTop: 10,
              padding: "16px 24px",
              borderRadius: 16,
              background: `linear-gradient(90deg, #dc2626, ${color})`,
              boxShadow: `0 0 40px ${color}77`,
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 950,
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            ⚡ {highlight} ⚡
          </div>
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};
