import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlassCard } from "../depth/GlassCard";

export interface RevealOutroProps {
  badge?: string;
  headline?: string;
  subline?: string;
  cta?: string;
  icon?: string;
  color?: string;
}

export const RevealOutroScene: React.FC<RevealOutroProps> = ({
  badge = "MIND BLOWN",
  headline = "THE TRUTH REVEALED",
  subline = "Every device relies on this hidden tech",
  cta = "SUBSCRIBE FOR DAILY TECH SECRETS",
  icon = "🔥",
  color = "#f59e0b",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const btnPulse = Math.sin(frame / 6) * 0.05 + 1;
  const bellRock = Math.sin(frame / 4) * 16;

  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
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
      {/* Mind Blown Badge */}
      <div
        style={{
          transform: `scale(${badgeSpring})`,
          padding: "12px 36px",
          borderRadius: 999,
          background: `linear-gradient(90deg, #dc2626, ${color})`,
          border: "2px solid #ffffff",
          boxShadow: `0 0 45px ${color}88, 0 10px 25px rgba(0,0,0,0.6)`,
          color: "#ffffff",
          fontSize: 26,
          fontWeight: 950,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 30,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 34 }}>{icon}</span>
        <span>{badge}</span>
      </div>

      {/* 3D Frosted Reveal Card */}
      <GlassCard width={840} color={color}>
        <div
          style={{
            padding: "45px 40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 46,
              fontWeight: 950,
              color: "#ffffff",
              textShadow: `0 0 35px ${color}`,
              lineHeight: 1.25,
              marginBottom: 18,
            }}
          >
            {headline}
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#94a3b8",
              lineHeight: 1.4,
            }}
          >
            {subline}
          </div>
        </div>
      </GlassCard>

      {/* Pulsing YouTube Subscribe CTA */}
      <div
        style={{
          transform: `scale(${btnPulse})`,
          marginTop: 35,
          padding: "22px 52px",
          borderRadius: 999,
          background: "linear-gradient(90deg, #dc2626, #ef4444)",
          border: "2px solid #ffffff",
          boxShadow: "0 0 60px rgba(239, 68, 68, 0.8), 0 15px 30px rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          gap: 18,
          color: "#ffffff",
          fontSize: 28,
          fontWeight: 950,
          letterSpacing: 2,
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: `rotate(${bellRock}deg)`,
            fontSize: 36,
          }}
        >
          🔔
        </span>
        <span>{cta}</span>
      </div>
    </AbsoluteFill>
  );
};
