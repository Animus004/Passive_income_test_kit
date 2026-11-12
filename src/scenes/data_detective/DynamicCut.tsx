import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Audio,
} from "remotion";

interface StatHighlight {
  number: string;
  label: string;
}

export interface CutData {
  cutId: number;
  voiceoverText: string;
  visualQuery: string;
  cameraMotion?: string;
  statHighlight?: StatHighlight | null;
}

interface DynamicCutProps {
  cut: CutData;
  cutIndex: number;
  durationInFrames: number;
  theme: string;
  themeConfig: {
    primary: string;
    accent: string;
    bgGradient?: string;
  };
  totalCuts: number;
}

export const DynamicCut: React.FC<DynamicCutProps> = ({
  cut,
  cutIndex,
  durationInFrames,
  theme,
  themeConfig,
  totalCuts,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic Camera Motion (Ken Burns effect)
  const motion = cut.cameraMotion || (cutIndex % 2 === 0 ? "zoom_in" : "zoom_out");
  
  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  if (motion === "zoom_out") {
    scale = interpolate(frame, [0, durationInFrames], [1.14, 1.0], {
      extrapolateRight: "clamp",
    });
  } else if (motion === "pan_left") {
    scale = 1.1;
    translateX = interpolate(frame, [0, durationInFrames], [20, -25], {
      extrapolateRight: "clamp",
    });
  } else if (motion === "tilt_up") {
    scale = 1.1;
    translateY = interpolate(frame, [0, durationInFrames], [30, -20], {
      extrapolateRight: "clamp",
    });
  } else {
    // Default zoom_in
    scale = interpolate(frame, [0, durationInFrames], [1.0, 1.14], {
      extrapolateRight: "clamp",
    });
  }

  // Quick initial cut impact flash (first 4 frames)
  const cutFlashOpacity = interpolate(frame, [0, 4], [0.35, 0], {
    extrapolateRight: "clamp",
  });

  // Stat Highlight Card entrance spring
  const statSpring = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 180,
      mass: 0.5,
    },
  });

  const mediaSrc = staticFile(`broll/cut_${cut.cutId}.jpg`);
  const hasStat = cut.statHighlight && cut.statHighlight.number;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", overflow: "hidden" }}>
      {/* Cut Transition Audio Trigger */}
      {cutIndex === 0 ? (
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.7} />
      ) : (
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.5} />
      )}

      {/* Layer 0: Full-Bleed B-Roll Image with Smooth Ken Burns Camera */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={mediaSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            // Fallback: graceful hide if file missing
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      </div>

      {/* Layer 1: Cinematic Color Wash matching Theme */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${themeConfig.primary}18 0%, rgba(2, 6, 23, 0.45) 80%)`,
          mixBlendMode: "color-dodge",
          pointerEvents: "none",
        }}
      />

      {/* Layer 2: Documentary Vignette & Gradients (Top & Bottom Darkness for High Contrast) */}
      <AbsoluteFill
        style={{
          background: `
            linear-gradient(to bottom, rgba(2, 6, 23, 0.75) 0%, rgba(2, 6, 23, 0.2) 20%, transparent 40%),
            linear-gradient(to top, rgba(2, 6, 23, 0.95) 0%, rgba(2, 6, 23, 0.75) 30%, transparent 60%),
            radial-gradient(ellipse at center, transparent 40%, rgba(2, 6, 23, 0.7) 100%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: Subtle High-Tech Grid Dots (Documentary Texture) */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />

      {/* Layer 4: Initial Cut Lens Flash */}
      {cutFlashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#ffffff",
            opacity: cutFlashOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Layer 5: Dynamic Data HUD Card (Rendered ONLY when this cut mentions a stat) */}
      {hasStat && (
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 80,
            width: 920,
            transform: `scale(${0.9 + statSpring * 0.1})`,
            opacity: statSpring,
            borderRadius: 24,
            background: "rgba(10, 15, 30, 0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `2px solid ${themeConfig.primary}88`,
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px ${themeConfig.primary}33`,
            padding: "24px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 4,
                color: "rgba(255, 255, 255, 0.8)",
                textTransform: "uppercase",
              }}
            >
              {cut.statHighlight?.label}
            </span>
            <span
              style={{
                fontSize: 82,
                fontWeight: 900,
                color: themeConfig.accent || "#eab308",
                lineHeight: 1.05,
                textShadow: `0 0 35px ${themeConfig.accent}88`,
                letterSpacing: -1,
                marginTop: 4,
              }}
            >
              {cut.statHighlight?.number}
            </span>
          </div>

          {/* Minimalist Tech HUD Badge Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderRadius: 100,
              background: `${themeConfig.primary}22`,
              border: `1px solid ${themeConfig.primary}55`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: themeConfig.primary,
                boxShadow: `0 0 10px ${themeConfig.primary}`,
              }}
            />
            <span
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              TELEMETRY
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

