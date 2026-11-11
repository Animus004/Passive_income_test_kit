import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import { Mascot } from "../../components/Mascot";
import { BackgroundMedia } from "../../components/BackgroundMedia";
import { SubtitleWord } from "../../types";
import { ThemeAtmosphere, ThemeMythGraphic, getThemeConfig } from "./ThemeVisuals";

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
  visualTheme?: string;
}

export const Scene2Myth: React.FC<SceneProps> = ({
  subtitles = [],
  sceneData,
  visualTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const theme = visualTheme || sceneData?.visualTheme || "space";
  const colors = getThemeConfig(theme);

  // Entrance Spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 120 },
  });

  // Dynamic Exit transition
  const exitWhip = interpolate(
    frame,
    [Math.max(0, durationInFrames - 17), durationInFrames],
    [0, -1200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const exitOpacity = interpolate(
    frame,
    [Math.max(0, durationInFrames - 12), durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const statNumStr = sceneData?.statHighlight?.number || "70%";
  const targetCounter = parseInt(statNumStr.replace(/\D/g, "")) || 70;
  const statUnit = statNumStr.includes("%") ? "%" : "";
  const statLabel = sceneData?.statHighlight?.label || "WIDESPREAD MYTH";
  const badgeText = sceneData?.badge || "⚡ THE SPEED MYTH // 02";
  const mascotPose = sceneData?.mascotEmotion || "facepalm";

  // Rapid 0 -> Target Counter with strict clamping to prevent negative glitch on entry
  const mythCounter = Math.max(
    0,
    Math.round(
      interpolate(frame, [15, 75], [0, targetCounter], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${exitWhip}px) scale(${entrySpring})`,
        opacity: exitOpacity,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: colors.bg,
      }}
    >
      <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.7} />

      {/* Layer 0: Dynamic Background Particle Texture & Vignette */}
      <BackgroundMedia themeColor={colors.primary} opacity={0.32} />

      {/* Dynamic Themed Atmosphere */}
      <ThemeAtmosphere theme={theme} frame={frame} />

      {/* --- TOP SATELLITE HUD HEADER --- */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            padding: "8px 28px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
            border: "1.5px solid #ffffff",
            boxShadow: `0 0 25px ${colors.glow}`,
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          {badgeText}
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: 950,
            color: "#e2e8f0",
            letterSpacing: 2,
            textTransform: "uppercase",
            textShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          THE POPULAR MISCONCEPTION
        </div>
      </div>

      {/* --- CENTER MYTH VISUAL GRAPHIC --- */}
      <div
        style={{
          position: "absolute",
          top: 410,
          left: 190,
          width: 700,
          height: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThemeMythGraphic
          theme={theme}
          frame={frame}
          statNumber={`${mythCounter}${statUnit}`}
        />
      </div>

      {/* --- BOTTOM STAT LABEL BANNER --- */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          left: 0,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: colors.accent,
            letterSpacing: 3,
            textTransform: "uppercase",
            textShadow: `0 0 15px ${colors.glow}`,
          }}
        >
          {statLabel}
        </div>
      </div>

      {/* --- MASCOT: SKEPTICAL / FACEPALM IN LOWER RIGHT --- */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 50,
          zIndex: 10,
        }}
      >
        <Mascot subtitles={subtitles} pose={mascotPose} />
      </div>
    </AbsoluteFill>
  );
};
