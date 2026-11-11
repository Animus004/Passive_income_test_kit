import React, { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { BackgroundMedia } from "./BackgroundMedia";
import { PerspectiveGrid } from "./depth/PerspectiveGrid";
import { VolumetricLight } from "./depth/VolumetricLight";

interface BackgroundProps {
  useVideoBackground?: boolean;
  themeColor?: string;
}

interface Particle {
  id: number;
  x: number;
  baseY: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

export const Background: React.FC<BackgroundProps> = ({
  useVideoBackground = false,
  themeColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  const particles: Particle[] = useMemo(() => {
    const colors = [themeColor, "#FFE600", "#A855F7", "#38BDF8"];
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: ((i * 37 + 13) % 96) + 2,
      baseY: (i * 53 + 29) % 100,
      size: ((i * 7) % 6) + 3,
      speed: 0.12 + ((i % 5) * 0.07),
      opacity: 0.18 + ((i % 4) * 0.12),
      color: colors[i % colors.length],
    }));
  }, [themeColor]);

  // Animated deep plasma coordinates
  const orb1X = 50 + Math.sin(frame * 0.018) * 30;
  const orb1Y = 30 + Math.cos(frame * 0.02) * 20;
  const orb2X = 50 + Math.cos(frame * 0.015) * 35;
  const orb2Y = 65 + Math.sin(frame * 0.022) * 25;

  const bgRotation = interpolate(frame, [0, 900], [0, 360]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#030712",
      }}
    >
      {/* Layer 0: Dynamic Background Media / Particle Noise / Vignette */}
      <BackgroundMedia
        videoSrc={useVideoBackground ? "background.mp4" : undefined}
        themeColor={themeColor}
        opacity={0.3}
      />

      {/* Dynamic Cybernetic Gradient Mesh */}
      <div
        style={{
          position: "absolute",
          top: "-25%",
          left: "-25%",
          width: "150%",
          height: "150%",
          background: `
            radial-gradient(circle at ${orb1X}% ${orb1Y}%, ${themeColor}2e 0%, transparent 50%),
            radial-gradient(circle at ${orb2X}% ${orb2Y}%, rgba(168, 85, 247, 0.22) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.85) 0%, #030712 95%)
          `,
          transform: `rotate(${bgRotation * 0.04}deg)`,
        }}
      />

      {/* 3D Perspective Receding Cyber Grid Floor */}
      <PerspectiveGrid color={themeColor} />

      {/* Volumetric Top Spotlight & Midground Lens Streaks */}
      <VolumetricLight color={themeColor} />

      {/* Floating Ambient Glow Particles */}
      {particles.map((p) => {
        const currentY = (p.baseY - frame * p.speed) % 105;
        const normalizedY = currentY < 0 ? currentY + 105 : currentY;
        const pulse = 0.8 + Math.sin(frame * 0.05 + p.id) * 0.2;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${normalizedY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.color,
              opacity: p.opacity * pulse,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Deep Cinematic Corner Vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          boxShadow: "inset 0 0 180px rgba(0,0,0,0.92)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
