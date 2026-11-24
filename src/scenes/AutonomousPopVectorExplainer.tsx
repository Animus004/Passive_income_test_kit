import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from "remotion";
import { Scene1 } from "./autonomous_pop/Scene1";
import { Scene2 } from "./autonomous_pop/Scene2";
import { Scene3 } from "./autonomous_pop/Scene3";
import { Scene4 } from "./autonomous_pop/Scene4";
import { Scene5 } from "./autonomous_pop/Scene5";
import { Scene6 } from "./autonomous_pop/Scene6";
import { Scene7 } from "./autonomous_pop/Scene7";
import { Scene8 } from "./autonomous_pop/Scene8";
import { Scene9 } from "./autonomous_pop/Scene9";
import { Scene10 } from "./autonomous_pop/Scene10";
import { Scene11 } from "./autonomous_pop/Scene11";
import { Scene12 } from "./autonomous_pop/Scene12";
import { OddlyCaptions } from "../components/OddlyCaptions";
import { COLOR_THEMES } from "../theme/tokens";
import manifestEn from "../data/oddly_manifest_en.json";
import manifestHi from "../data/oddly_manifest_hi.json";

const SCENE_COMPONENTS: Record<number, React.FC> = {
  1: Scene1,
  2: Scene2,
  3: Scene3,
  4: Scene4,
  5: Scene5,
  6: Scene6,
  7: Scene7,
  8: Scene8,
  9: Scene9,
  10: Scene10,
  11: Scene11,
  12: Scene12,
};

export interface AutonomousPopVectorExplainerProps {
  language?: "en" | "hi";
}

export const AutonomousPopVectorExplainer: React.FC<AutonomousPopVectorExplainerProps> = ({
  language = "hi",
}) => {
  const isHindi = language === "hi";
  const manifest = isHindi ? manifestHi : manifestEn;
  const audioFile = isHindi ? "oddly_master_hi.mp3" : "oddly_master_en.mp3";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FAF7F0",
        width: 1080,
        height: 1920,
        overflow: "hidden",
      }}
    >
      {/* Master Audio Track (Voiceover + SFX) */}
      <Audio src={staticFile(audioFile)} volume={1.0} />

      {/* High-Contrast Frame Border (Oddly Told Aesthetic) */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 36,
          right: 36,
          bottom: 36,
          border: "5px solid rgba(20,20,20,0.12)",
          borderRadius: 48,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Bespoke AI-Coded Vector Scenes */}
      {manifest.beats.map((beat: any, idx: number) => {
        const SceneComp = SCENE_COMPONENTS[beat.id] || SCENE_COMPONENTS[1] || AbsoluteFill;
        const fromFrame = idx === 0 ? 0 : beat.startFrame;
        const duration =
          idx === 0
            ? beat.endFrame || beat.durationInFrames + beat.startFrame
            : beat.durationInFrames || (beat.endFrame ? beat.endFrame - beat.startFrame : 120);

        return (
          <Sequence key={beat.id || idx} from={fromFrame} durationInFrames={duration}>
            <SceneComp />
          </Sequence>
        );
      })}

      {/* Kinetic Subtitles (Word-highlighted, mobile centered) */}
      <OddlyCaptions
        words={manifest.words || []}
        theme={COLOR_THEMES.SUNNY_GOLD}
        chunkSize={isHindi ? 3 : 4}
      />
    </AbsoluteFill>
  );
};
