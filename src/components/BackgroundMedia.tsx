import React from "react";
import { useCurrentFrame, Video, staticFile } from "remotion";

interface BackgroundMediaProps {
  videoSrc?: string;
  opacity?: number;
  enableNoise?: boolean;
  themeColor?: string;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  videoSrc,
  opacity = 0.3,
  enableNoise = true,
  themeColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  // Animated drifting cosmic nebula coordinates
  const driftX = Math.sin(frame * 0.012) * 40;
  const driftY = Math.cos(frame * 0.015) * 30;

  // Frame offset for film grain cadence
  const grainShiftX = (frame * 13) % 16;
  const grainShiftY = (frame * 17) % 16;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Optional Background Video B-Roll */}
      {videoSrc && (
        <Video
          src={staticFile(videoSrc)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity,
            filter: "brightness(0.7) contrast(1.2)",
          }}
          loop
          muted
        />
      )}

      {/* Layer 0: Deep Atmospheric Ambient Mesh Texture */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-20%",
          width: "140%",
          height: "140%",
          transform: `translate(${driftX}px, ${driftY}px)`,
          background: `
            radial-gradient(circle at 30% 30%, ${themeColor}1a 0%, transparent 50%),
            radial-gradient(circle at 75% 70%, rgba(147, 51, 234, 0.14) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0.95) 0%, #030712 100%)
          `,
          opacity: 0.85,
        }}
      />

      {/* High-Performance Micro-Dot Film Grain (Hardware-Accelerated Zero-RAM) */}
      {enableNoise && (
        <div
          style={{
            position: "absolute",
            inset: -20,
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 0)",
            backgroundSize: "4px 4px",
            backgroundPosition: `${grainShiftX}px ${grainShiftY}px`,
            opacity: opacity * 0.45,
          }}
        />
      )}

      {/* CRT Scanline Texture Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(18, 24, 38, 0) 50%, rgba(0, 0, 0, 0.35) 50%)",
          backgroundSize: "100% 4px",
          opacity: 0.35,
        }}
      />

      {/* Cinematic Dark Edge Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(3, 7, 18, 0.75) 85%, #030712 100%)",
        }}
      />
    </div>
  );
};
