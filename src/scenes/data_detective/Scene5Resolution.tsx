import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Sequence,
} from "remotion";
import { Mascot } from "../../components/Mascot";
import { BackgroundMedia } from "../../components/BackgroundMedia";
import { SubtitleWord } from "../../types";
import { ThemeAtmosphere, ThemeLoopPortal, getThemeConfig } from "./ThemeVisuals";

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
  visualTheme?: string;
}

export const Scene5Resolution: React.FC<SceneProps> = ({
  subtitles = [],
  sceneData,
  visualTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const theme = visualTheme || sceneData?.visualTheme || "space";
  const colors = getThemeConfig(theme);

  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 110 },
  });

  // Accelerating camera punch / zoom during the final 15 frames (0.5s trailing buffer)
  const punchStartFrame = Math.max(0, durationInFrames - 15);
  const punchProgress = interpolate(
    frame,
    [punchStartFrame, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // Ease-in accelerating curve (punchProgress^2): scale 1.0 -> 1.15 into portal
  const loopPunchScale = 1.0 + Math.pow(punchProgress, 2) * 0.15;

  const badgeText = sceneData?.badge || "💡 THE DATA VERDICT // 05";
  const headline = sceneData?.headline || "THE REVEAL IS UNSTOPPABLE!";
  const subheadline = sceneData?.subheadline || "PHYSICAL REALITY ALWAYS WINS";
  const loopKicker = sceneData?.loopKicker || "⚡ LEAVING EVERYONE STILL ASKING... ⚡";
  const mascotPose = sceneData?.mascotEmotion || "celebrating";

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${entrySpring * loopPunchScale})`,
        transformOrigin: "540px 780px",
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: colors.bg,
      }}
    >
      <Audio src={staticFile("sfx/pop.mp3")} volume={0.8} />

      {/* Trailing 15-frame buffer whoosh SFX into infinite retention loop */}
      <Sequence from={punchStartFrame} durationInFrames={15}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.9} />
      </Sequence>

      {/* Layer 0: Background Texture */}
      <BackgroundMedia themeColor={colors.primary} opacity={0.32} />

      {/* Dynamic Themed Atmosphere */}
      <ThemeAtmosphere theme={theme} frame={frame} />

      {/* --- TOP VERDICT BADGE & HEADLINE --- */}
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
            boxShadow: `0 0 35px ${colors.glow}`,
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
            color: "#ffffff",
            letterSpacing: 2,
            textTransform: "uppercase",
            textShadow: `0 0 30px ${colors.glow}`,
            lineHeight: 1.15,
            maxWidth: 960,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.accent,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 10,
          }}
        >
          {subheadline}
        </div>
      </div>

      {/* --- CENTER THEMED INFINITE LOOP PORTAL --- */}
      <div
        style={{
          position: "absolute",
          top: 480,
          left: 240,
          width: 600,
          height: 600,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThemeLoopPortal
          theme={theme}
          frame={frame}
          kickerText={loopKicker}
        />
      </div>

      {/* --- MASCOT: CELEBRATING / DANCING IN LOWER RIGHT --- */}
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
