import React from "react";
import { Series, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DynamicCut, CutData } from "./data_detective/DynamicCut";
import { SubtitleWord } from "../types";
import currentShortData from "../data/current_short.json";

interface DataDetectiveProps {
  subtitles?: SubtitleWord[];
}

export const DataDetective: React.FC<DataDetectiveProps> = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Active Camera Breath: Continuous subtle slow documentary drift
  const camZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });
  const camBreathX = Math.sin(frame * 0.018) * 1.5;
  const camBreathY = Math.cos(frame * 0.022) * 2.0;

  const data = currentShortData as any;
  const rawCuts: CutData[] = data?.cuts || data?.scenes || [];
  const cutTimings: Array<{ cutId: number; durationInFrames: number }> =
    data?.cutTimings || [];

  const visualTheme = data?.visualTheme || "cyber";
  const themeConfig = data?.themeConfig || {
    primary: "#38bdf8",
    accent: "#f59e0b",
    bgGradient: "radial-gradient(ellipse at 50% 25%, #1e1b4b 0%, #030712 75%)",
  };

  // If no cuts defined, provide safe fallback
  const cuts = rawCuts.length > 0 ? rawCuts : [
    {
      cutId: 1,
      voiceoverText: data?.fullVoiceover || "Investigating hidden data systems...",
      visualQuery: data?.topic || "high tech infrastructure",
      cameraMotion: "zoom_in",
      statHighlight: null,
    },
  ];

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
        {cuts.map((cut: CutData, index: number) => {
          const cutId = cut.cutId || index + 1;
          const timing = cutTimings.find((t) => t.cutId === cutId);
          // If timing exists use it, otherwise evenly divide
          const cutDuration = timing?.durationInFrames || Math.round(durationInFrames / cuts.length);

          return (
            <Series.Sequence key={cutId} durationInFrames={cutDuration}>
              <DynamicCut
                cut={cut}
                cutIndex={index}
                durationInFrames={cutDuration}
                theme={visualTheme}
                themeConfig={themeConfig}
                totalCuts={cuts.length}
              />
            </Series.Sequence>
          );
        })}
      </Series>
    </div>
  );
};
