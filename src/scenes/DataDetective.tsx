import React from "react";
import { Series, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene1Hook } from "./data_detective/Scene1Hook";
import { Scene2Myth } from "./data_detective/Scene2Myth";
import { Scene3Reality } from "./data_detective/Scene3Reality";
import { Scene4Danger } from "./data_detective/Scene4Danger";
import { Scene5Resolution } from "./data_detective/Scene5Resolution";
import { SubtitleWord } from "../types";
import currentShortData from "../data/current_short.json";

interface DataDetectiveProps {
  subtitles?: SubtitleWord[];
}

export const DataDetective: React.FC<DataDetectiveProps> = ({ subtitles = [] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Active Camera Rig: Continuous subtle slow zoom so the screen never looks frozen
  const camZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });
  const camBreathX = Math.sin(frame * 0.02) * 1.5;
  const camBreathY = Math.cos(frame * 0.025) * 2.0;

  // Frame allocation dynamically synchronized to voiceover timestamps
  const timings = (currentShortData as any)?.sceneTimings || {};
  const s1 = timings.s1 || 274;
  const s2 = timings.s2 || 272;
  const s3 = timings.s3 || 213;
  const s4 = timings.s4 || 258;
  const s5 = Math.max(45, durationInFrames - (s1 + s2 + s3 + s4));

  const scenes = (currentShortData as any)?.scenes || [];
  const visualTheme = (currentShortData as any)?.visualTheme || "space";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${camZoom}) translate(${camBreathX}px, ${camBreathY}px)`,
        transformOrigin: "center center",
      }}
    >
      <Series>
        {/* Scene 1: The Hook (Full-screen dramatic typography, mascot center-stage, rapid zoom-in punch) */}
        <Series.Sequence durationInFrames={s1}>
          <Scene1Hook subtitles={subtitles} sceneData={scenes[0]} visualTheme={visualTheme} />
        </Series.Sequence>

        {/* Scene 2: The Myth (Misconception telemetry, mascot reacting skeptically) */}
        <Series.Sequence durationInFrames={s2}>
          <Scene2Myth subtitles={subtitles} sceneData={scenes[1]} visualTheme={visualTheme} />
        </Series.Sequence>

        {/* Scene 3: The Physical Reality (Themed Hero graphic, data meter, mascot scanning with laser) */}
        <Series.Sequence durationInFrames={s3}>
          <Scene3Reality subtitles={subtitles} sceneData={scenes[2]} visualTheme={visualTheme} />
        </Series.Sequence>

        {/* Scene 4: The Danger / Bottlenecks (Warning pattern, hazard stamps, shock reaction) */}
        <Series.Sequence durationInFrames={s4}>
          <Scene4Danger
            subtitles={subtitles}
            sceneData={scenes[3]}
            chipRelFrames={timings.chipRelFrames}
            visualTheme={visualTheme}
          />
        </Series.Sequence>

        {/* Scene 5: Outro / Resolution (Clean layout reset, endless retention loop portal) */}
        <Series.Sequence durationInFrames={s5}>
          <Scene5Resolution subtitles={subtitles} sceneData={scenes[4]} visualTheme={visualTheme} />
        </Series.Sequence>
      </Series>
    </div>
  );
};
