import React from "react";
import { AbsoluteFill, Series, Audio, staticFile } from "remotion";
import { InkPaperBackground } from "../components/ink/InkPaperBackground";
import { GpsScene1ShipToAirport } from "../components/ink/scenes/gps/GpsScene1ShipToAirport";
import { GpsScene2GhostCircles } from "../components/ink/scenes/gps/GpsScene2GhostCircles";
import { GpsScene3SpoofingAntenna } from "../components/ink/scenes/gps/GpsScene3SpoofingAntenna";
import { GpsScene4DigitalDeception } from "../components/ink/scenes/gps/GpsScene4DigitalDeception";
import { GpsScene5SilentWarfareFinale } from "../components/ink/scenes/gps/GpsScene5SilentWarfareFinale";
import { KineticSubtitles } from "../components/KineticSubtitles";
import defaultSubtitles from "../../public/subtitles.json";
import { SubtitleWord } from "../types";

interface InkDoodleGpsExplainerProps {
  subtitles?: SubtitleWord[];
}

export const InkDoodleGpsExplainer: React.FC<InkDoodleGpsExplainerProps> = ({
  subtitles = defaultSubtitles as SubtitleWord[],
}) => {
  // Cut frame durations from public/metadata.json (1192 total)
  const cut1Duration = 285;
  const cut2Duration = 212;
  const cut3Duration = 229;
  const cut4Duration = 264;
  const cut5Duration = 202;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#faf7f0",
        fontFamily: "'Arial Black', -apple-system, sans-serif",
      }}
    >
      {/* 1. Warm Archival Sketchpad Paper Surface */}
      <InkPaperBackground showGrid={true} />

      {/* 2. Main High-Quality Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} volume={1.0} />

      {/* 3. Subtle Ambient Lofi / Acoustic Tension BGM */}
      <Audio src={staticFile("ambient.mp3")} volume={0.09} loop />

      {/* 4. The 5 Bespoke Hand-Drawn Ink Scenes */}
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10 }}>
        <Series>
          <Series.Sequence durationInFrames={cut1Duration}>
            <GpsScene1ShipToAirport />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut2Duration}>
            <GpsScene2GhostCircles />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut3Duration}>
            <GpsScene3SpoofingAntenna />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut4Duration}>
            <GpsScene4DigitalDeception />
          </Series.Sequence>

          <Series.Sequence durationInFrames={cut5Duration}>
            <GpsScene5SilentWarfareFinale />
          </Series.Sequence>
        </Series>
      </div>

      {/* 5. Kinetic Subtitles in Lower Third */}
      <KineticSubtitles words={subtitles} />
    </AbsoluteFill>
  );
};
