import React, { useMemo } from "react";
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

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
}

export const Scene5Resolution: React.FC<SceneProps> = ({ subtitles = [], sceneData }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

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
  const headline = sceneData?.headline || "THE CLOUD IS UNDERWATER!";
  const subheadline = sceneData?.subheadline || "🌊 99% OF ALL DATA IS ON OCEAN FLOORS";
  const loopKicker = sceneData?.loopKicker || "⚡ LEAVING EVERYONE STILL ASKING... ⚡";
  const mascotPose = sceneData?.mascotEmotion || "celebrating";

  const portalSpin = frame * 2.2;
  const loopPillPulse = 1 + Math.sin(frame * 0.15) * 0.04;

  // Floating ambient embers / data particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      x: ((i * 37 + 13) % 94) + 3,
      startY: (i * 59 + 17) % 100,
      size: (i % 3) * 2 + 3,
      speed: 0.25 + (i % 3) * 0.2,
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${entrySpring * loopPunchScale})`,
        transformOrigin: "540px 780px",
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#030712",
      }}
    >
      <Audio src={staticFile("sfx/pop.mp3")} volume={0.85} />

      {/* Trailing 15-frame buffer: quick riser / whoosh sound effect during the loop wipe */}
      <Sequence from={punchStartFrame}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.9} />
      </Sequence>

      {/* Layer 0: Full-Bleed Background Media Texture & Vignette */}
      <BackgroundMedia themeColor="#38bdf8" opacity={0.32} />

      {/* Floating Ambient Sparks */}
      {particles.map((p, i) => {
        const currentY = ((p.startY * 19.2 - frame * p.speed * 4) % 1920 + 1920) % 1920;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: currentY,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: "#38bdf8",
              boxShadow: "0 0 15px #38bdf8",
              opacity: 0.35 + Math.sin(frame * 0.1 + i) * 0.25,
            }}
          />
        );
      })}

      {/* Mind Blown Header Badge */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "12px 36px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #dc2626, #f59e0b)",
            border: "2px solid #ffffff",
            boxShadow: "0 0 50px rgba(245, 158, 11, 0.8), 0 10px 30px rgba(0,0,0,0.8)",
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 950,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {badgeText}
        </div>
      </div>

      {/* Full-Bleed Hero Resolution Typography */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            fontSize: 92,
            marginBottom: 10,
            filter: "drop-shadow(0 0 35px rgba(56, 189, 248, 0.8))",
          }}
        >
          ☁️ ➔ 🌊
        </div>

        <div
          style={{
            fontSize: 70,
            fontWeight: 950,
            color: "#ffffff",
            fontFamily: "'Impact', 'Montserrat', sans-serif",
            letterSpacing: 3,
            lineHeight: 1.05,
            textShadow:
              "0 0 35px #38bdf8, 0 0 80px #0284c7, 0 10px 25px rgba(0,0,0,0.9)",
          }}
        >
          {headline}
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 30,
            fontWeight: 800,
            color: "#38bdf8",
            letterSpacing: 2,
            textTransform: "uppercase",
            textShadow: "0 0 20px rgba(56, 189, 248, 0.6)",
          }}
        >
          {subheadline}
        </div>

        {/* --- INFINITE RETENTION LOOP PORTAL (Seamless Loop Bridge) --- */}
        {/* Replaces static Subscribe card so the video loops endlessly back to hook */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Animated Cybernetic Vortex Tunnel */}
          <svg
            width={340}
            height={340}
            style={{
              position: "absolute",
              top: -30,
              transform: `rotate(${portalSpin}deg)`,
              filter: "drop-shadow(0 0 30px rgba(56, 189, 248, 0.6))",
            }}
          >
            <circle
              cx={170}
              cy={170}
              r={150}
              fill="none"
              stroke="#0284c7"
              strokeWidth={3}
              strokeDasharray="25 15"
              opacity={0.7}
            />
            <circle
              cx={170}
              cy={170}
              r={125}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2.5}
              strokeDasharray="15 20"
              opacity={0.8}
            />
            <circle
              cx={170}
              cy={170}
              r={100}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="8 12"
              opacity={0.65}
            />
          </svg>

          {/* Glowing Retention Bridge Kicker */}
          <div
            style={{
              transform: `scale(${loopPillPulse})`,
              marginTop: 105,
              padding: "18px 36px",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(14, 165, 233, 0.9), rgba(2, 132, 199, 0.95))",
              border: "2px solid #ffffff",
              boxShadow:
                "0 0 50px rgba(56, 189, 248, 0.85), 0 10px 30px rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: "'Impact', 'Arial Black', -apple-system, sans-serif",
                fontSize: 27,
                fontWeight: 950,
                color: "#ffffff",
                letterSpacing: 2,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {loopKicker}
            </span>
          </div>
        </div>
      </div>

      {/* Mascot: Anchored Bottom-Left pointing into the loop portal */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          width: 340,
          height: 385,
          zIndex: 5,
        }}
      >
        <Mascot pose={mascotPose} subtitles={subtitles} />
      </div>
    </AbsoluteFill>
  );
};
