import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { GlassCard } from "../depth/GlassCard";

export interface AlertThreatProps {
  title?: string;
  subtitle?: string;
  alertText?: string;
  icon?: string;
  color?: string;
}

export const AlertThreatScene: React.FC<AlertThreatProps> = ({
  title = "WARNING HAZARD",
  subtitle = "SYSTEM INSTABILITY",
  alertText = "CRITICAL ANOMALY DETECTED",
  icon = "⚠️",
  color = "#ef4444",
}) => {
  const frame = useCurrentFrame();

  // Seismic vibration screen shake
  const shakeX = Math.sin(frame * 1.5) * interpolate(frame, [0, 45], [14, 2], {
    extrapolateRight: "clamp",
  });
  const shakeY = Math.cos(frame * 1.8) * interpolate(frame, [0, 45], [12, 2], {
    extrapolateRight: "clamp",
  });

  const flashOpacity = Math.sin(frame / 4) * 0.4 + 0.6;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 230,
        pointerEvents: "none",
      }}
    >
      {/* Flashing Volumetric Emergency Border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `8px solid ${color}`,
          opacity: flashOpacity,
          boxShadow: `inset 0 0 120px ${color}88`,
          pointerEvents: "none",
        }}
      />

      {/* 3D Frosted Danger Container */}
      <GlassCard width={840} color={color}>
        <div
          style={{
            padding: "45px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 76, marginBottom: 16 }}>{icon}</div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 950,
              color: "#ffffff",
              textShadow: `0 0 40px ${color}`,
              marginBottom: 24,
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </div>

          {/* Pulsing Hazard Banner */}
          <div
            style={{
              width: "100%",
              padding: "18px 24px",
              borderRadius: 16,
              background: `linear-gradient(90deg, #991b1b, ${color})`,
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 950,
              letterSpacing: 2,
              boxShadow: `0 0 45px ${color}`,
            }}
          >
            🚨 {alertText} 🚨
          </div>
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};
