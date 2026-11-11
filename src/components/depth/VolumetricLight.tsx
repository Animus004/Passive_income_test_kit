import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";

interface VolumetricLightProps {
  color?: string;
}

interface BokehOrb {
  id: number;
  x: number;
  baseY: number;
  size: number;
  speed: number;
  blur: number;
  opacity: number;
  hue: string;
}

export const VolumetricLight: React.FC<VolumetricLightProps> = ({
  color = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  const bokehOrbs: BokehOrb[] = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: ((i * 47 + 19) % 90) + 5,
      baseY: (i * 61 + 31) % 100,
      size: ((i * 13) % 45) + 35,
      speed: 0.1 + ((i % 4) * 0.06),
      blur: ((i * 7) % 12) + 8,
      opacity: 0.15 + ((i % 3) * 0.1),
      hue: i % 2 === 0 ? color : "#818cf8",
    }));
  }, [color]);

  // Spotlight pulsing
  const spotPulse = 0.85 + Math.sin(frame * 0.03) * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Volumetric Conical Spotlight from Top */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: "15%",
          width: "70%",
          height: 850,
          background: `radial-gradient(ellipse at 50% 0%, ${color}44 0%, transparent 70%)`,
          filter: "blur(50px)",
          opacity: spotPulse,
          transformOrigin: "50% 0%",
        }}
      />

      {/* Floating Foreground Bokeh Orbs */}
      {bokehOrbs.map((orb) => {
        const currentY = (orb.baseY - frame * orb.speed) % 110;
        const normalizedY = currentY < 0 ? currentY + 110 : currentY;
        const wobbleX = Math.sin(frame * 0.02 + orb.id) * 15;

        return (
          <div
            key={orb.id}
            style={{
              position: "absolute",
              left: `calc(${orb.x}% + ${wobbleX}px)`,
              top: `${normalizedY}%`,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.hue}99 0%, transparent 70%)`,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
            }}
          />
        );
      })}

      {/* Anamorphic Horizontal Lens Streak */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 0,
          width: "100%",
          height: 2,
          background: `linear-gradient(90deg, transparent 5%, ${color}66 50%, transparent 95%)`,
          boxShadow: `0 0 20px ${color}`,
          opacity: 0.6,
        }}
      />
    </div>
  );
};

