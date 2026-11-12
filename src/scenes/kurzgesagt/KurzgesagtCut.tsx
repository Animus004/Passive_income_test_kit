import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Audio,
} from "remotion";
import { KurzgesagtCharacter, CharacterEmotion, CharacterProp } from "../../components/kurzgesagt/KurzgesagtCharacter";
import { KurzgesagtBackground } from "../../components/kurzgesagt/KurzgesagtBackground";
import {
  SweatingServerProp,
  LiquidTankProp,
  UnderwaterSubmarineProp,
  CartoonGaugeProp,
} from "../../components/kurzgesagt/KurzgesagtProps";
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

  // Determine Character Emotion & Props based on Cut Index and Stat
  let emotion: CharacterEmotion = "explaining";
  let handProp: CharacterProp = "none";
  let renderVisualProp: React.ReactNode = null;

  // Decide based on cut index and content
  if (cutIndex === 0) {
    emotion = "pointing";
    handProp = "magnifying_glass";
    renderVisualProp = <SweatingServerProp frame={frame} scale={1.15} />;
  } else if (cutIndex === 1) {
    emotion = "shocked";
    handProp = "thermometer";
    renderVisualProp = (
      <CartoonGaugeProp
        frame={frame}
        valueText={cut.statHighlight?.number || "100°C"}
        labelText={cut.statHighlight?.label || "GPU MELTDOWN LIMIT"}
        scale={1.2}
      />
    );
  } else if (cutIndex === 2) {
    emotion = "pointing";
    handProp = "flask";
    renderVisualProp = <LiquidTankProp frame={frame} scale={1.15} />;
  } else if (cutIndex === 3) {
    emotion = "explaining";
    renderVisualProp = <UnderwaterSubmarineProp frame={frame} scale={1.2} />;
  } else if (cutIndex === 4) {
    emotion = "pointing";
    renderVisualProp = (
      <CartoonGaugeProp
        frame={frame}
        valueText={cut.statHighlight?.number || "BILLIONS"}
        labelText={cut.statHighlight?.label || "AI COOLING SCALE"}
        scale={1.2}
      />
    );
  } else {
    emotion = "thinking";
    renderVisualProp = <LiquidTankProp frame={frame} scale={1.05} />;
  }

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

      {/* 2. Top Half: Dynamic Cartoon Prop & Story Graphics */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "5%",
          width: "90%",
          height: 620,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${0.9 + sceneEntry * 0.1})`,
          opacity: sceneEntry,
          zIndex: 5,
        }}
      >
        {renderVisualProp}
      </div>

      {/* 3. Bottom Half: Kurzgesagt Duck Scientist Character */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          zIndex: 20,
        }}
      >
        <KurzgesagtCharacter
          emotion={emotion}
          prop={handProp}
          subtitles={subtitles}
          scale={1.08}
        />
      </div>

      {/* 4. Playful Kurzgesagt Speech / Telemetry Pill at Top */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 22px",
          borderRadius: 100,
          background: "rgba(15, 23, 42, 0.8)",
          border: `2px solid ${themeConfig.primary}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#facc15",
            boxShadow: "0 0 10px #facc15",
          }}
        />
        <span
          style={{
            color: "#ffffff",
            fontSize: 20,
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

