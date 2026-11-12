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
import { KurzgesagtCharacter, CharacterEmotion, CharacterProp } from "../../components/kurzgesagt/KurzgesagtCharacter";
import { KurzgesagtBackground } from "../../components/kurzgesagt/KurzgesagtBackground";
import { CartoonGaugeProp } from "../../components/kurzgesagt/KurzgesagtProps";
import { CutData } from "../data_detective/DynamicCut";
import { SubtitleWord } from "../../types";

interface KurzgesagtCutProps {
  cut: CutData;
  cutIndex: number;
  durationInFrames: number;
  subtitles?: SubtitleWord[];
  themeConfig?: {
    primary: string;
    accent: string;
  };
  totalCuts: number;
}

export const KurzgesagtCut: React.FC<KurzgesagtCutProps> = ({
  cut,
  cutIndex,
  durationInFrames,
  subtitles = [],
  themeConfig = { primary: "#38bdf8", accent: "#f59e0b" },
  totalCuts,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy Scene Entry Punch
  const sceneEntry = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 160, mass: 0.5 },
  });

  // Dynamic Camera Drift (slow, playful zoom)
  const camScale = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });

  // Dynamic B-Roll Image Zoom inside the Holo-Portal
  const brollZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {
    extrapolateRight: "clamp",
  });

  // Alternating character position for visual energy (Left on even, Right on odd facing in)
  const isRightSide = cutIndex % 2 === 1;

  // Determine Character Emotion & Props dynamically based on actual cut content
  const hasStat = Boolean(cut.statHighlight && cut.statHighlight.number);
  let emotion: CharacterEmotion = "explaining";
  let handProp: CharacterProp = "none";

  if (hasStat) {
    emotion = "shocked";
    handProp = "none";
  } else if (cutIndex === 0) {
    emotion = "pointing";
    handProp = "magnifying_glass";
  } else if (cutIndex === totalCuts - 1) {
    emotion = "thinking";
    handProp = "none";
  } else {
    emotion = cutIndex % 2 === 0 ? "pointing" : "explaining";
    handProp = "none";
  }

  const mediaSrc = staticFile(`broll/cut_${cut.cutId}.jpg`);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070c26",
        overflow: "hidden",
        transform: `scale(${camScale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Cut Audio Pop SFX */}
      {cutIndex === 0 ? (
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.65} />
      ) : (
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.45} />
      )}

      {/* 1. Kurzgesagt Aesthetic Background */}
      <KurzgesagtBackground primaryColor={themeConfig.primary} />

      {/* 2. Top-Middle Area: Dynamic Story Portal / Gauge (100% Tied to this Cut) */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "6%",
          width: "88%",
          height: 760,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${0.88 + sceneEntry * 0.12})`,
          opacity: sceneEntry,
          zIndex: 5,
        }}
      >
        {hasStat ? (
          // Dynamic Gauge for Stat Highlights
          <CartoonGaugeProp
            frame={frame}
            valueText={cut.statHighlight!.number}
            labelText={cut.statHighlight!.label}
            scale={1.35}
          />
        ) : (
          // Dynamic Holo-Portal Frame displaying the topic's actual B-roll
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 580,
              borderRadius: 36,
              overflow: "hidden",
              border: `5px solid ${themeConfig.primary}`,
              boxShadow: `0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px ${themeConfig.primary}44`,
              background: "#030712",
            }}
          >
            <Img
              src={mediaSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${brollZoom})`,
                transformOrigin: "center center",
                display: "block",
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            {/* Glossy Reflection Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%, rgba(0, 0, 0, 0.4) 100%)`,
                pointerEvents: "none",
              }}
            />
            {/* Tech Corner Accents */}
            <div
              style={{
                position: "absolute",
                top: 18,
                left: 20,
                padding: "6px 16px",
                borderRadius: 100,
                background: "rgba(15, 23, 42, 0.85)",
                border: `1.5px solid ${themeConfig.primary}`,
                color: themeConfig.primary,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              VISUAL REEL #{cut.cutId}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Third: Hero Scale Kurzgesagt Duck Scientist Character */}
      <div
        style={{
          position: "absolute",
          bottom: 15,
          left: isRightSide ? "auto" : 40,
          right: isRightSide ? 40 : "auto",
          zIndex: 20,
        }}
      >
        <KurzgesagtCharacter
          emotion={emotion}
          prop={handProp}
          subtitles={subtitles}
          scale={1.48}
          flipX={isRightSide}
        />
      </div>

      {/* 4. Playful Kurzgesagt Channel Header Pill at Top */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 26px",
          borderRadius: 100,
          background: "rgba(15, 23, 42, 0.88)",
          border: `2.5px solid ${themeConfig.primary}`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.5)`,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#facc15",
            boxShadow: "0 0 12px #facc15",
          }}
        />
        <span
          style={{
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          DATA DETECTIVE • EXPLAINED
        </span>
      </div>
    </AbsoluteFill>
  );
};
