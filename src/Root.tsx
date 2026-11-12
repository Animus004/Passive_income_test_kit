import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";
import {
  ShortComposition,
  defaultProps,
  initialDurationInFrames,
} from "./Composition";
import { ShortCompositionProps } from "./types";

const calculateMetadata: CalculateMetadataFunction<ShortCompositionProps> = ({
  props,
}) => {
  const words = props.subtitles || defaultProps.subtitles || [];
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    const dynamicFrames = Math.ceil((lastWord.end + 0.8) * 30);
    return {
      durationInFrames: Math.max(60, dynamicFrames),
      props: {
        ...defaultProps,
        ...props,
      },
    };
  }
  return {
    durationInFrames: initialDurationInFrames,
    props: {
      ...defaultProps,
      ...props,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Universal Composition */}
      <Composition
        id="ShortVideo"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />

      {/* Genre A: Style & Gear Advisor */}
      <Composition
        id="StyleAdvisor"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "style-advisor",
          hookBadge: "🛑 STOP BUYING CHEAP DESK CHAIRS!",
        }}
        calculateMetadata={calculateMetadata}
      />

      {/* Genre B: Data Detective (Cinematic B-Roll) */}
      <Composition
        id="DataDetective"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "data-detective",
          hookBadge: "🔎 THE SATELLITE INTERNET MYTH!",
        }}
        calculateMetadata={calculateMetadata}
      />

      {/* Genre C: 2D Cartoon Explainer (Kurzgesagt Style) */}
      <Composition
        id="KurzgesagtExplainer"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "kurzgesagt-explainer",
          hookBadge: "🦆 DATA DETECTIVE • EXPLAINED",
        }}
        calculateMetadata={calculateMetadata}
      />

      {/* Autonomous Production Pipeline: DailyShort */}
      <Composition
        id="DailyShort"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "data-detective",
          hookBadge: "🔎 DATA DETECTIVE DAILY",
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
