import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { WhalterCharacter, WhalterPose } from "./WhalterCharacter";
import { WhalterPropsStage } from "./WhalterPropsStage";
import { SubtitleWord } from "../../types";

interface WhalterKineticEngineProps {
  currentCut: number;
  cut1: number;
  cut2: number;
  cut3: number;
  cut4: number;
  cut5: number;
  totalFrames: number;
  subtitles?: SubtitleWord[];
  topRightTag?: string;
  bottomLeftLabel?: string;
  bottomRightMetric?: string;
}

export const WhalterKineticEngine: React.FC<WhalterKineticEngineProps> = ({
  currentCut,
  cut1,
  cut2,
  cut3,
  cut4,
  cut5,
  totalFrames,
  subtitles = [],
  topRightTag = "SIGNAL // ABSORPTION",
  bottomLeftLabel = "CONCRETE MATRIX",
  bottomRightMetric = "POWER LOSS: -30dB/cm",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Determine Character Pose based on narrative beat & dramatic moments
  let pose: WhalterPose = "explaining";
  if (currentCut === 1) {
    pose = frame > cut1 + 18 ? "shocked" : "explaining";
  } else if (currentCut === 2) {
    pose = "thinking";
  } else if (currentCut === 3) {
    pose = "alarm";
  } else if (currentCut === 4) {
    pose = "eureka";
  } else if (currentCut === 5) {
    pose = "explaining";
  }

  // 2. Camera Punch Zooms (1.0x -> 1.12x on beat transitions)
  let beatRelFrame = frame - cut1;
  if (currentCut === 2) beatRelFrame = frame - cut2;
  if (currentCut === 3) beatRelFrame = frame - cut3;
  if (currentCut === 4) beatRelFrame = frame - cut4;
  if (currentCut === 5) beatRelFrame = frame - cut5;

  const punchSpring = spring({
    frame: beatRelFrame,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.5 },
  });
  const cameraZoom = interpolate(punchSpring, [0, 0.4, 1], [1.08, 1.14, 1.0]);

  // 3. Screen Shake on Heavy Impact (e.g. Beat 1 slab slam)
  let shakeX = 0;
  let shakeY = 0;
  if (currentCut === 1 && beatRelFrame >= 12 && beatRelFrame <= 26) {
    const decay = 1 - (beatRelFrame - 12) / 14;
    shakeX = Math.sin(frame * 2.8) * 14 * decay;
    shakeY = Math.cos(frame * 2.4) * 10 * decay;
  } else if (currentCut === 3 && beatRelFrame >= 0 && beatRelFrame <= 18) {
    const decay = 1 - beatRelFrame / 18;
    shakeX = Math.sin(frame * 3.2) * 8 * decay;
    shakeY = Math.cos(frame * 3.0) * 8 * decay;
  }

  // 4. Background Ambient Tint based on narrative heat
  let bgGlowColor = "rgba(0, 245, 255, 0.12)";
  if (currentCut === 2) bgGlowColor = "rgba(56, 189, 248, 0.15)";
  if (currentCut === 3) bgGlowColor = "rgba(239, 68, 68, 0.22)";
  if (currentCut === 4) bgGlowColor = "rgba(16, 185, 129, 0.20)";

  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1920,
        backgroundColor: "#070B14",
        overflow: "hidden",
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${cameraZoom})`,
        transformOrigin: "center 70%",
      }}
    >
      {/* --- 1. DYNAMIC NEBULA GLOWS & TECH GRID BACKDROP --- */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${bgGlowColor} 0%, rgba(7, 11, 20, 0) 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Cyber Grid Lines */}
      <svg
        width="1080"
        height="1920"
        style={{ position: "absolute", inset: 0, opacity: 0.14, pointerEvents: "none" }}
      >
        <defs>
          <pattern id="whalterGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#38bdf8" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#whalterGrid)" />
      </svg>

      {/* --- 2. TOP HUD HEADER (High Precision Scientific Brand) --- */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 50,
          right: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 64,
          padding: "0 28px",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "2px solid rgba(56, 189, 248, 0.3)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: currentCut === 3 ? "#ef4444" : "#00f5ff",
              boxShadow: `0 0 12px ${currentCut === 3 ? "#ef4444" : "#00f5ff"}`,
            }}
          />
          <span
            style={{
              color: "#f8fafc",
              fontFamily: "'Courier New', monospace",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            DATA DETECTIVE // BEAT 0{currentCut}
          </span>
        </div>

        <span
          style={{
            color: currentCut === 3 ? "#ef4444" : currentCut === 4 ? "#10b981" : "#00f5ff",
            fontFamily: "'Courier New', monospace",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          {topRightTag}
        </span>
      </div>

      {/* Top Floating Metric Badge */}
      <div
        style={{
          position: "absolute",
          top: 156,
          right: 50,
          padding: "10px 22px",
          background: "rgba(15, 23, 42, 0.9)",
          borderRadius: 12,
          border: `2px solid ${currentCut === 3 ? "#ef4444" : currentCut === 4 ? "#10b981" : "#38bdf8"}`,
          zIndex: 10,
        }}
      >
        <span
          style={{
            color: currentCut === 3 ? "#ef4444" : currentCut === 4 ? "#10b981" : "#f8fafc",
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          {bottomRightMetric}
        </span>
      </div>

      {/* --- 3. THE KINETIC PROPS STAGE (Center Top) --- */}
      <WhalterPropsStage
        currentCut={currentCut}
        cut1={cut1}
        cut2={cut2}
        cut3={cut3}
        cut4={cut4}
        cut5={cut5}
        totalFrames={totalFrames}
      />

      {/* --- 4. THE HERO CHARACTER (Large Talking Head in Center-Bottom) --- */}
      <div
        style={{
          position: "absolute",
          bottom: 260,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 5,
        }}
      >
        <WhalterCharacter
          pose={pose}
          subtitles={subtitles}
          scale={1.42}
        />
      </div>
    </div>
  );
};
