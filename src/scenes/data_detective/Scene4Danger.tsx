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

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
  chipRelFrames?: number[];
}

export const Scene4Danger: React.FC<SceneProps> = ({ subtitles = [], sceneData, chipRelFrames }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance Spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 9, mass: 0.4, stiffness: 140 },
  });

  const cFrames = chipRelFrames || [88, 125, 175];
  const cf1 = cFrames[0] ?? 88;
  const cf2 = cFrames[1] ?? 125;
  const cf3 = cFrames[2] ?? 175;

  // Staggered Springs synchronized to voiceover timestamps
  const chip1Spring = spring({
    frame: frame - cf1,
    fps,
    config: { damping: 12, mass: 0.45, stiffness: 160 },
  });
  const chip2Spring = spring({
    frame: frame - cf2,
    fps,
    config: { damping: 12, mass: 0.45, stiffness: 160 },
  });
  const chip3Spring = spring({
    frame: frame - cf3,
    fps,
    config: { damping: 12, mass: 0.45, stiffness: 160 },
  });

  // Dynamic Exit transition
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

  // Seismic screen shake on entrance and on each chip impact
  const isImpact =
    (frame >= cf1 && frame <= cf1 + 14) ||
    (frame >= cf2 && frame <= cf2 + 14) ||
    (frame >= cf3 && frame <= cf3 + 17);
  const shakeIntensity = isImpact
    ? 14
    : interpolate(frame, [0, 45, 90], [8, 4, 1], { extrapolateRight: "clamp" });
  const shakeX = Math.sin(frame * 2.8) * shakeIntensity;
  const shakeY = Math.cos(frame * 3.1) * shakeIntensity;

  const badgeText = sceneData?.badge || "CRITICAL INFRASTRUCTURE ALERT // ALL UNDERSEA BACKBONES";
  const headline = sceneData?.headline || "FRAGILE CABLES AT RISK!";
  const chips = sceneData?.chipList || ["⚓ SHIP ANCHORS", "🌋 DEEP SUBSEA QUAKES", "🦈 SHARK ATTACKS"];
  const mascotPose = sceneData?.mascotEmotion || "shocked";

  // Emergency flashing pulse
  const flashAlpha = Math.sin(frame * 0.4) * 0.35 + 0.65;

  // Mascot interactive ducking: physically flinches and cowers beneath the falling chips
  const duckY = interpolate(frame, [0, 88, 125, 175, 210], [0, 25, 55, 90, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const duckScaleY = interpolate(frame, [0, 88, 125, 175, 210], [1, 0.94, 0.86, 0.76, 0.82], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const duckScaleX = interpolate(frame, [0, 88, 125, 175, 210], [1, 1.05, 1.12, 1.22, 1.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px) translateX(${exitWhip}px) scale(${entrySpring})`,
        opacity: exitOpacity,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#090102",
      }}
    >
      <Audio src={staticFile("sfx/thud.mp3")} volume={0.9} />
      <Audio src={staticFile("sfx/pop.mp3")} volume={0.75} />

      {/* Layer 0: Emergency Particle Noise & Edge Vignette */}
      <BackgroundMedia themeColor="#ef4444" opacity={0.35} />

      {/* Chip 1 Audio Trigger: Synchronized to cf1 */}
      <Sequence from={cf1} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.65} />
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.8} />
      </Sequence>

      {/* Chip 2 Audio Trigger: Synchronized to cf2 */}
      <Sequence from={cf2} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.65} />
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.85} />
      </Sequence>

      {/* Chip 3 Audio Trigger: Synchronized to cf3 */}
      <Sequence from={cf3} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.7} />
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.95} />
      </Sequence>

      {/* --- FULL-SCREEN DIAGONAL HAZARD WARNING PATTERN --- */}
      {/* Breaks the rigid card layout with diagonal caution stripes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(239, 68, 68, 0.12) 0px, rgba(239, 68, 68, 0.12) 35px, rgba(15, 2, 4, 0.85) 35px, rgba(15, 2, 4, 0.85) 70px)",
          opacity: flashAlpha,
        }}
      />

      {/* Angled Hazard Tape Across Top */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: -40,
          right: -40,
          padding: "12px 0",
          background: "linear-gradient(90deg, #991b1b, #ef4444, #991b1b)",
          transform: "rotate(-2.5deg)",
          boxShadow: "0 0 45px rgba(239, 68, 68, 0.85), 0 8px 25px rgba(0,0,0,0.9)",
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: 26,
            fontWeight: 950,
            color: "#ffffff",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {badgeText}
        </span>
      </div>

      {/* Severed Cable & Electrical Arcs (Full Bleed SVG) */}
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <defs>
          <filter id="sparkGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Severed Cable Segment */}
        <path
          d="M -50 480 C 200 440, 350 510, 470 460"
          fill="none"
          stroke="#450a0a"
          strokeWidth={28}
          strokeLinecap="round"
        />
        <path
          d="M -50 480 C 200 440, 350 510, 470 460"
          fill="none"
          stroke="#ef4444"
          strokeWidth={12}
          strokeLinecap="round"
          filter="url(#sparkGlow)"
        />

        {/* Right Severed Cable Segment */}
        <path
          d="M 610 490 C 730 440, 880 510, 1130 460"
          fill="none"
          stroke="#450a0a"
          strokeWidth={28}
          strokeLinecap="round"
        />
        <path
          d="M 610 490 C 730 440, 880 510, 1130 460"
          fill="none"
          stroke="#f59e0b"
          strokeWidth={12}
          strokeLinecap="round"
          filter="url(#sparkGlow)"
        />

        {/* Severed Gap Sparking Plasma & Lightning Arcs */}
        <g transform="translate(540, 475)">
          <circle
            r={30 + ((frame * 3) % 60)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={3}
            opacity={1 - ((frame * 3) % 60) / 60}
          />
          <circle
            r={15 + ((frame * 2.5) % 40)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            opacity={1 - ((frame * 2.5) % 40) / 40}
          />

          <path
            d={`M -65 -10 Q 0 ${Math.sin(frame * 0.8) * 35}, 65 10`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={4}
            filter="url(#sparkGlow)"
          />
          <path
            d={`M -60 15 Q ${Math.cos(frame * 1.1) * 30} -25, 60 -15`}
            fill="none"
            stroke="#fef08a"
            strokeWidth={3}
            filter="url(#sparkGlow)"
          />
        </g>
      </svg>

      {/* Hero Hazard Callout & Warning Cards */}
      <div
        style={{
          position: "absolute",
          top: 210,
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
            fontSize: 64,
            fontWeight: 950,
            color: "#ffffff",
            fontFamily: "'Impact', 'Montserrat', sans-serif",
            letterSpacing: 2,
            lineHeight: 1.05,
            textShadow:
              "0 0 35px #ef4444, 0 0 70px #b91c1c, 0 10px 25px rgba(0,0,0,0.9)",
          }}
        >
          {headline}
        </div>

        {/* 3 Giant Angled Threat Stamps (Drop in with Voiceover Cues) */}
        <div
          style={{
            marginTop: 340,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
            width: "100%",
          }}
        >
          {/* Chip 1 */}
          <div
            style={{
              transform: `translateY(${(1 - chip1Spring) * -80}px) rotate(-3.5deg) scale(${chip1Spring})`,
              opacity: chip1Spring,
              padding: "16px 48px",
              borderRadius: 20,
              background: "linear-gradient(90deg, #991b1b, #ef4444)",
              border: "3.5px solid #ffffff",
              boxShadow: "0 0 45px rgba(239, 68, 68, 0.9), 0 10px 25px rgba(0,0,0,0.9)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Impact', 'Montserrat', sans-serif",
                fontSize: 42,
                fontWeight: 950,
                color: "#ffffff",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {chips[0] || "⚓ SHIP ANCHORS"}
            </span>
          </div>

          {/* Chip 2 */}
          <div
            style={{
              transform: `translateY(${(1 - chip2Spring) * -80}px) rotate(3deg) scale(${chip2Spring})`,
              opacity: chip2Spring,
              padding: "16px 48px",
              borderRadius: 20,
              background: "linear-gradient(90deg, #d97706, #f59e0b)",
              border: "3.5px solid #ffffff",
              boxShadow: "0 0 45px rgba(245, 158, 11, 0.9), 0 10px 25px rgba(0,0,0,0.8)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Impact', 'Montserrat', sans-serif",
                fontSize: 42,
                fontWeight: 950,
                color: "#ffffff",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {chips[1] || "🌋 DEEP SUBSEA QUAKES"}
            </span>
          </div>

          {/* Chip 3 */}
          <div
            style={{
              transform: `translateY(${(1 - chip3Spring) * -80}px) rotate(-2deg) scale(${chip3Spring})`,
              opacity: chip3Spring,
              padding: "16px 48px",
              borderRadius: 20,
              background: "linear-gradient(90deg, #991b1b, #ef4444)",
              border: "3.5px solid #ffffff",
              boxShadow: "0 0 45px rgba(239, 68, 68, 0.9), 0 10px 25px rgba(0,0,0,0.9)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Impact', 'Montserrat', sans-serif",
                fontSize: 42,
                fontWeight: 950,
                color: "#ffffff",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {chips[2] || "🦈 SHARK ATTACKS"}
            </span>
          </div>
        </div>
      </div>

      {/* Mascot: Physically ducks and cowers beneath the falling hazard chips */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          width: 340,
          height: 385,
          zIndex: 5,
          transform: `translateY(${duckY}px) scale(${duckScaleX}, ${duckScaleY})`,
          transformOrigin: "bottom center",
          transition: "transform 0.05s ease-out",
        }}
      >
        <Mascot pose={mascotPose || "shocked"} subtitles={subtitles} />
      </div>
    </AbsoluteFill>
  );
};
