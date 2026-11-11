import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { GlassCard } from "../depth/GlassCard";

export interface MetricGaugeProps {
  title?: string;
  value?: number | string;
  suffix?: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export const MetricGaugeScene: React.FC<MetricGaugeProps> = ({
  title = "STAT METRIC",
  value = 99,
  suffix = "%",
  subtitle = "Key Discovery",
  icon = "⚡",
  color = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const currentCount = Math.floor(
    interpolate(frame, [0, 45], [0, numericValue], {
      extrapolateRight: "clamp",
    })
  );

  const rotate = interpolate(frame, [0, 180], [0, 360]);
  const pulse = Math.sin(frame / 6) * 0.06 + 1;

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
      {/* Category Pill with Specular Border */}
      <div
        style={{
          padding: "12px 36px",
          borderRadius: 999,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          border: `1.5px solid ${color}`,
          borderTop: "2px solid #ffffff",
          boxShadow: `0 0 35px ${color}66, 0 10px 25px rgba(0,0,0,0.6)`,
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

      {/* 3D Glassmorphism Hero Container */}
      <GlassCard width={840} color={color}>
        <div
          style={{
            padding: "45px 30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Cybernetic Gauge with Outer Rings */}
          <div
            style={{
              position: "relative",
              width: 380,
              height: 380,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Rotating Outer Tech Ring */}
            <svg
              width={380}
              height={380}
              style={{
                position: "absolute",
                transform: `rotate(${rotate}deg)`,
              }}
            >
              <circle
                cx={190}
                cy={190}
                r={165}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeDasharray="20 14 6 14"
                opacity={0.8}
              />
              <circle
                cx={190}
                cy={190}
                r={140}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.5}
                strokeDasharray="4 24"
                opacity={0.45}
              />
            </svg>

            {/* Glowing Volumetric Core */}
            <div
              style={{
                transform: `scale(${pulse})`,
                width: 270,
                height: 270,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${color}33 0%, rgba(3, 7, 18, 0.95) 75%)`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 50px ${color}66, inset 0 0 30px ${color}33`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 78,
                  fontWeight: 950,
                  fontFamily: "monospace",
                  color: "#ffffff",
                  textShadow: `0 0 35px ${color}, 0 0 60px ${color}`,
                  lineHeight: 1,
                }}
              >
                {typeof value === "number" ? currentCount : value}
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color,
                  textShadow: `0 0 20px ${color}`,
                  marginTop: 4,
                  letterSpacing: 2,
                }}
              >
                {suffix}
              </div>
            </div>
          </div>

          {/* Subtitle Pill Banner */}
          <div
            style={{
              marginTop: 24,
              padding: "10px 28px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: 24,
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        </div>
      </GlassCard>
    </AbsoluteFill>
  );
};
