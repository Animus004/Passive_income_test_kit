import React from "react";
import { useCurrentFrame, Video, Img, staticFile } from "remotion";
import brollManifest from "../data/broll_manifest.json";

interface BackgroundMediaProps {
  sceneKey?: "scene1" | "scene2" | "scene3" | string;
  videoSrc?: string;
  imageSrc?: string;
  opacity?: number;
  enableNoise?: boolean;
  themeColor?: string;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  sceneKey,
  videoSrc,
  imageSrc,
  opacity = 0.42,
  enableNoise = true,
  themeColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  // Subtle Ken-Burns cinematic scale and drift for imagery
  const kenBurnsScale = 1.0 + (frame * 0.0015);
  const driftX = Math.sin(frame * 0.015) * 25;
  const driftY = Math.cos(frame * 0.018) * 20;

  // Frame offset for film grain cadence
  const grainShiftX = (frame * 13) % 16;
  const grainShiftY = (frame * 17) % 16;

  // Check manifest if available
  let resolvedVideo = videoSrc;
  let resolvedImage = imageSrc;

  if (sceneKey && !resolvedVideo && !resolvedImage) {
    try {
      const info = (brollManifest as any)?.scenes?.[sceneKey];
      if (info?.type === "video" && info.file) {
        resolvedVideo = info.file;
      } else if (info?.type === "image" && info.file) {
        resolvedImage = info.file;
      }
    } catch (e) {}
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        backgroundColor: "#030712",
      }}
    >
      {/* 1. Real B-Roll Video Layer */}
      {resolvedVideo && (
        <Video
          src={staticFile(resolvedVideo)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity,
            filter: "brightness(0.65) contrast(1.25)",
            transform: `scale(${kenBurnsScale})`,
          }}
          loop
          muted
        />
      )}

      {/* 2. Real High-Resolution Photo Layer with Ken Burns Motion */}
      {!resolvedVideo && resolvedImage && (
        <Img
          src={staticFile(resolvedImage)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity,
            filter: "brightness(0.65) contrast(1.25)",
            transform: `scale(${kenBurnsScale}) translate(${driftX * 0.5}px, ${driftY * 0.5}px)`,
          }}
        />
      )}

      {/* 3. Deep Atmospheric Ambient Mesh Texture */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-20%",
          width: "140%",
          height: "140%",
          transform: `translate(${driftX}px, ${driftY}px)`,
          background: `
            radial-gradient(circle at 30% 30%, ${themeColor}26 0%, transparent 55%),
            radial-gradient(circle at 75% 70%, rgba(147, 51, 234, 0.16) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0.9) 0%, #030712 100%)
          `,
          opacity: 0.85,
        }}
      />

      {/* High-Performance Micro-Dot Film Grain */}
      {enableNoise && (
        <div
          style={{
            position: "absolute",
            inset: -20,
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 0)",
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
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(3, 7, 18, 0.8) 80%, #030712 100%)",
        }}
      />
    </div>
  );
};
