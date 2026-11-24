import React from "react";
import { useCurrentFrame } from "remotion";

interface PaperTextureOverlayProps {
  opacity?: number;
  enableLineBoil?: boolean;
  enableVignette?: boolean;
}

/**
 * Procedural Hand-Drawn "Line Boil" & Paper Grain Filter
 * 
 * Creates the authentic indie animation feel:
 * 1. SVG feTurbulence displacement jittering at 8 FPS (classic cartoon line boil)
 * 2. Film grain & paper tooth texture canvas
 * 3. Soft cinematic edge vignette
 */
export const PaperTextureOverlay: React.FC<PaperTextureOverlayProps> = ({
  opacity = 0.045,
  enableLineBoil = true,
  enableVignette = true,
}) => {
  const frame = useCurrentFrame();

  // 8 FPS Line Boil: Seed shifts every 4 frames (at 30fps: 30 / 4 = 7.5 ~ 8 FPS)
  const boilSeed = enableLineBoil ? Math.floor(frame / 4) * 17 + 1 : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {/* SVG Filter Definition for Hand-Drawn Contour Roughness */}
      <svg
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter id="handDrawnLineBoil" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
              seed={boilSeed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* SVG Canvas Paper Grain Noise Pattern */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity,
          mixBlendMode: "multiply",
        }}
      >
        <filter id="paperGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
            seed={Math.floor(frame / 6) * 31}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paperGrain)" fill="#000000" />
      </svg>

      {/* Cinematic 9:16 Radial Edge Vignette */}
      {enableVignette && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(10,15,30,0.38) 100%)",
            mixBlendMode: "multiply",
          }}
        />
      )}
    </div>
  );
};
