import React from "react";
import { AbsoluteFill, Series, Audio, staticFile } from "remotion";
import { InkPaperBackground } from "../components/ink/InkPaperBackground";
import { InkScene1PhoneToTower } from "../components/ink/scenes/InkScene1PhoneToTower";
import { InkScene2SpeedOfLight } from "../components/ink/scenes/InkScene2SpeedOfLight";
import { InkScene3CableSnap } from "../components/ink/scenes/InkScene3CableSnap";
import { InkScene4EarthRelay } from "../components/ink/scenes/InkScene4EarthRelay";
import { InkScene5SurgeFinale } from "../components/ink/scenes/InkScene5SurgeFinale";
import { KineticSubtitles } from "../components/KineticSubtitles";
import defaultSubtitles from "../../public/subtitles.json";
import { SubtitleWord } from "../types";

interface InkDoodleExplainerProps {
  subtitles?: SubtitleWord[];
}

export const InkDoodleExplainer: React.FC<InkDoodleExplainerProps> = ({
  subtitles = defaultSubtitles as SubtitleWord[],
}) => {
  // Cut frame durations from public/metadata.json
  const cut1Duration = 376;
  const cut2Duration = 173;
  const cut3Duration = 222;
  const cut4Duration = 218;
  const cut5Duration = 196;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#faf7f0",
        fontFamily: "'Arial Black', -apple-system, sans-serif",
      }}
    >
      {/* 1. Warm Archival Sketchpad Paper Surface (Tactile Grain & Guidelines) */}
      <InkPaperBackground showGrid={true} />

      {/* 2. Main High-Quality Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} volume={1.0} />

      {/* 3. Subtle Ambient Lofi / Acoustic Tension BGM */}
      <Audio src={staticFile("ambient.mp3")} volume={0.09} loop />

      {/* 4. The 5 Bespoke Hand-Drawn Ink Scenes */}
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10 }}>
        <Series>
          <Series.Sequence durationInFrames={cut1Duration}>
            <InkScene1PhoneToTower />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut2Duration}>
            <InkScene2SpeedOfLight />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut3Duration}>
            <InkScene3CableSnap />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut4Duration}>
            <InkScene4EarthRelay />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut5Duration}>
            <InkScene5SurgeFinale />
          </Series.Sequence>
        </Series>
      </div>

      {/* 5. Kinetic Subtitles in Lower Third (76%) */}
      <KineticSubtitles words={subtitles} />
    </AbsoluteFill>
  );
};
