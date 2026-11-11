import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { Mascot } from "../../components/Mascot";
import { BackgroundMedia } from "../../components/BackgroundMedia";
import { SubtitleWord } from "../../types";
import { ThemeAtmosphere, ThemeHookGraphic, getThemeConfig } from "./ThemeVisuals";

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
  visualTheme?: string;
}

export const Scene1Hook: React.FC<SceneProps> = ({
  subtitles = [],
  sceneData,
  visualTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const theme = visualTheme || sceneData?.visualTheme || "space";
  const colors = getThemeConfig(theme);

  // Entrance Punch Zoom
  const zoomSpring = spring({
    frame,
    fps,
    config: { damping: 9, mass: 0.4, stiffness: 140 },
  });

  // Dynamic Exit Transition: Explosive Scale Punch Zoom-Through into Scene 2
  const exitFrameTrigger = Math.max(0, durationInFrames - 14);
  const exitPunchProgress = interpolate(
    frame,
    [exitFrameTrigger, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const exitScale = 1.0 + Math.pow(exitPunchProgress, 2) * 1.5;
  const exitOpacity = interpolate(
    frame,
    [Math.max(0, durationInFrames - 10), durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const badgeText = sceneData?.badge || "🔎 DATA REALITY CHECK // 01";
  const headline = sceneData?.headline || "WHERE DOES THE DATA ACTUALLY LIVE?";
  const mascotPose = sceneData?.mascotEmotion || "pointing";

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoomSpring * exitScale})`,
        transformOrigin: "center center",
        opacity: exitOpacity,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: colors.bg,
      }}
    >
      <Audio src={staticFile("sfx/thud.mp3")} volume={0.85} />

      {/* Exit Zoom-Through Laser/Whoosh SFX */}
      <Sequence from={exitFrameTrigger} durationInFrames={14}>
        <Audio src={staticFile("sfx/laser.mp3")} volume={0.7} />
      </Sequence>

      {/* Layer 0: Dynamic B-Roll & Background Particles */}
      <BackgroundMedia sceneKey="scene1" themeColor={colors.primary} opacity={0.35} />

      {/* Dynamic Themed Atmosphere */}
      <ThemeAtmosphere theme={theme} frame={frame} />

      {/* Themed Centerpiece Graphic */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 190,
          width: 700,
          height: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThemeHookGraphic theme={theme} frame={frame} />
      </div>

      {/* --- TOP HOOK TYPOGRAPHY (FULL-BLEED BOLD) --- */}
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
        {/* Sleek Pill Badge */}
        <div
          style={{
            padding: "10px 32px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
            border: "2px solid #ffffff",
            boxShadow: `0 0 35px ${colors.glow}, 0 10px 20px rgba(0,0,0,0.6)`,
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 950,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {badgeText}
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: "#94a3b8",
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          DO YOU REALLY KNOW?
        </div>

        {/* Dynamic Main Question */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 950,
            color: "#ffffff",
            letterSpacing: 2,
            lineHeight: 1.15,
            textTransform: "uppercase",
            maxWidth: 960,
            textShadow: `0 0 30px ${colors.glow}`,
          }}
        >
          {headline}
        </div>
      </div>

      {/* --- MASCOT: EXPRESSIVE AT BOTTOM-CENTER --- */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Mascot subtitles={subtitles} pose={mascotPose} />
      </div>
    </AbsoluteFill>
  );
};
