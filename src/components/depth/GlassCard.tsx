import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface GlassCardProps {
  children: React.ReactNode;
  width?: number;
  color?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  width = 840,
  color = "#38bdf8",
  delay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  // 3D entrance spring with overshoot
  const cardSpring = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.9 },
  });

  // 3D Tilt angles settling into position
  const rotateX = interpolate(cardSpring, [0, 1], [18, 0]);
  const rotateY = interpolate(cardSpring, [0, 1], [-12, 0]);
  const translateZ = interpolate(cardSpring, [0, 1], [-80, 0]);

  // Specular light sweep across card surface on entrance
  const lightSweepProgress = interpolate(adjustedFrame, [8, 38], [-120, 220], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width,
        transform: `
          perspective(1000px)
          scale(${cardSpring})
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateZ(${translateZ}px)
        `,
        borderRadius: 28,
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(15, 23, 42, 0.82) 100%)
        `,
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderTop: "1.5px solid rgba(255, 255, 255, 0.35)",
        boxShadow: `
          0 35px 70px -15px rgba(0, 0, 0, 0.9),
          0 20px 40px -20px rgba(0, 0, 0, 0.8),
          0 0 50px ${color}33,
          inset 0 1px 1px rgba(255, 255, 255, 0.25)
        `,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Specular Diagonal Light Sweep Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(
            115deg,
            transparent 30%,
            rgba(255, 255, 255, 0.18) 48%,
            rgba(255, 255, 255, 0.28) 50%,
            rgba(255, 255, 255, 0.18) 52%,
            transparent 70%
          )`,
          transform: `translateX(${lightSweepProgress}%)`,
          pointerEvents: "none",
        }}
      />

      {/* Internal ambient corner glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      {/* Card Content */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
};

