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
import { ThemeAtmosphere, ThemeRealityGraphic, getThemeConfig } from "./ThemeVisuals";

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
  visualTheme?: string;
}

export const Scene3Reality: React.FC<SceneProps> = ({
  subtitles = [],
  sceneData,
  visualTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const theme = visualTheme || sceneData?.visualTheme || "space";
  const colors = getThemeConfig(theme);

  // Entrance spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 120 },
  });

  // Dynamic Exit transition whip-out
  const exitWhip = interpolate(
    frame,
    [Math.max(0, durationInFrames - 16), durationInFrames],
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

  const statNumStr = sceneData?.statHighlight?.number || "99%";
  const targetCounter = parseInt(statNumStr.replace(/\D/g, "")) || 99;
  const statUnit = statNumStr.replace(/[0-9]/g, "") || "%";
  const statLabel = sceneData?.statHighlight?.label || "THE PHYSICAL REALITY";
  const badgeText = sceneData?.badge || "⚡ THE PHYSICAL TRUTH // 03";
  const subMetrics = sceneData?.subMetrics || ["SPEED OF LIGHT", "MASSIVE SCALE"];
  const mascotPose = sceneData?.mascotEmotion || "scanning";

  // Rapid 0 -> Target Counter with strict clamping
  const realityCounter = Math.max(
    0,
    Math.round(
      interpolate(frame, [15, 65], [0, targetCounter], {
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
      <Audio src={staticFile("sfx/riser.mp3")} volume={0.8} />

      {/* Layer 0: Background Texture */}
      <BackgroundMedia themeColor={colors.primary} opacity={0.32} />

      {/* Dynamic Themed Atmosphere */}
      <ThemeAtmosphere theme={theme} frame={frame} />

      {/* Themed Reality Centerpiece Graphic */}
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 90,
          width: 900,
          height: 900,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThemeRealityGraphic
          theme={theme}
          frame={frame}
          statNumber={statNumStr}
          statLabel={statLabel}
        />
      </div>

      {/* --- TOP BADGE & REVEAL HEADER --- */}
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
            fontSize: 44,
            fontWeight: 950,
            color: "#e2e8f0",
            letterSpacing: 2,
            textTransform: "uppercase",
            textShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          THE ACTUAL INFRASTRUCTURE
        </div>
      </div>

      {/* --- MASSIVE CENTER HERO STAT READOUT --- */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: 0,
          width: "100%",
          textAlign: "center",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {/* Massive 160px Counter */}
        <div
          style={{
            fontSize: 160,
            fontWeight: 950,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: -2,
            textShadow: `0 0 60px ${colors.glow}, 0 10px 40px rgba(0,0,0,0.9)`,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
          }}
        >
          <span>{realityCounter}</span>
          <span style={{ fontSize: 90, color: colors.accent, marginLeft: 8 }}>
            {statUnit}
          </span>
        </div>

        {/* Hero Stat Label */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: colors.primary,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginTop: 12,
            textShadow: `0 0 25px ${colors.glow}`,
            maxWidth: 900,
          }}
        >
          {statLabel}
        </div>

        {/* Dual Sub-Metric Chips */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 28,
            justifyContent: "center",
          }}
        >
          {subMetrics.map((m: string, i: number) => (
            <div
              key={i}
              style={{
                padding: "8px 22px",
                borderRadius: 14,
                backgroundColor: "rgba(3, 7, 18, 0.75)",
                border: `1.5px solid ${colors.primary}`,
                color: "#e2e8f0",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                boxShadow: `0 0 20px rgba(0,0,0,0.8)`,
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* --- MASCOT: SCANNING WITH VISIBLE LASER AT BOTTOM LEFT --- */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 50,
          zIndex: 10,
        }}
      >
        <Mascot subtitles={subtitles} pose={mascotPose} />
      </div>
    </AbsoluteFill>
  );
};
