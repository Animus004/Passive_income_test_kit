import React from "react";
import { Series, useVideoConfig } from "remotion";
import { KurzgesagtCut } from "./kurzgesagt/KurzgesagtCut";
import { SubtitleWord } from "../types";
import currentShortData from "../data/current_short.json";

interface KurzgesagtExplainerProps {
  subtitles?: SubtitleWord[];
}

export const KurzgesagtExplainer: React.FC<KurzgesagtExplainerProps> = ({
  subtitles = [],
}) => {
  const { durationInFrames } = useVideoConfig();

  const data = currentShortData as any;
  const rawCuts = data?.cuts || data?.scenes || [];
  const cutTimings: Array<{ cutId: number; durationInFrames: number }> =
    data?.cutTimings || [];

  const themeConfig = data?.themeConfig || {
    primary: "#38bdf8",
    accent: "#f59e0b",
  };

  const cuts =
    rawCuts.length > 0
      ? rawCuts
      : [
          {
            cutId: 1,
            voiceoverText: "Explaining tech data...",
            statHighlight: null,
          },
        ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Series>
        {cuts.map((cut: any, index: number) => {
          const cutId = cut.cutId || index + 1;
          const timing = cutTimings.find((t) => t.cutId === cutId);
          const cutDuration =
            timing?.durationInFrames ||
            Math.round(durationInFrames / cuts.length);

          return (
            <Series.Sequence key={cutId} durationInFrames={cutDuration}>
              <KurzgesagtCut
                cut={cut}
                cutIndex={index}
                durationInFrames={cutDuration}
                subtitles={subtitles}
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

