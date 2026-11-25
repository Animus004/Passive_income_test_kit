import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { DeclarativePopScene } from "./DeclarativePopScene";
import { OddlyCaptions } from "../components/OddlyCaptions";
import { COLOR_THEMES } from "../theme/tokens";
import manifestEn from "../data/oddly_manifest_en.json";
import manifestHi from "../data/oddly_manifest_hi.json";

export interface AutonomousPopVectorExplainerProps {
  language?: "en" | "hi";
  manifest?: any;
  audioSrc?: string;
}

export const AutonomousPopVectorExplainer: React.FC<AutonomousPopVectorExplainerProps> = ({
  language = "hi",
  manifest: manifestOverride,
  audioSrc,
}) => {
  const isHindi = language === "hi";
  const manifest = manifestOverride || (isHindi ? manifestHi : manifestEn);
  const resolvedAudio =
    audioSrc || staticFile(isHindi ? "oddly_master_hi.mp3" : "oddly_master_en.mp3");
  const beats = manifest?.beats || [];
  const words = manifest?.words || [];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FAF7F0",
        width: 1080,
        height: 1920,
        overflow: "hidden",
      }}
    >
      {/* Master Audio Track (Voiceover + Multi-Beat Foley SFX) */}
      <Audio src={resolvedAudio} volume={1.0} />

      {/* High-Contrast Frame Border (Oddly Told / Kurzgesagt Aesthetic) */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 36,
          right: 36,
          bottom: 36,
          border: "5px solid rgba(20,20,20,0.14)",
          borderRadius: 48,
          pointerEvents: "none",
          zIndex: 40,
        }}
      />

      {/* Pure Declarative Multi-Beat Scene Player (Zero Fragile TSX Generation) */}
      {beats.map((beat: any, idx: number) => {
        const fromFrame = idx === 0 ? 0 : beat.startFrame;
        const duration =
          idx === 0
            ? beat.endFrame || beat.durationInFrames + beat.startFrame
            : beat.durationInFrames || (beat.endFrame ? beat.endFrame - beat.startFrame : 120);

        // Filter words belonging to this beat for visemes & timing pulses
        const beatWords = words.filter(
          (w: any) =>
            w.start >= (beat.startSec || 0) &&
            w.end <= (beat.startSec || 0) + (beat.durationSec || 4.0)
        );

        return (
          <Sequence key={beat.id || idx} from={fromFrame} durationInFrames={duration}>
            <DeclarativePopScene
              beat={beat}
              sceneIndex={idx + 1}
              totalScenes={beats.length}
              beatWords={beatWords}
              isHindi={isHindi}
            />
          </Sequence>
        );
      })}

      {/* Kinetic Subtitles (Word-highlighted, mobile centered) */}
      <OddlyCaptions
        words={words}
        theme={COLOR_THEMES.SUNNY_GOLD}
        chunkSize={isHindi ? 3 : 4}
      />
    </AbsoluteFill>
  );
};
