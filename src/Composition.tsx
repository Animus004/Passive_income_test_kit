import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Background } from "./components/Background";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { ProgressOverlay } from "./components/ProgressOverlay";
import { DynamicVisuals } from "./components/DynamicVisuals";
import { StyleAdvisor } from "./scenes/StyleAdvisor";
import { DataDetective } from "./scenes/DataDetective";
import { KurzgesagtExplainer } from "./scenes/KurzgesagtExplainer";
import { Mascot } from "./components/Mascot";
import { ShortCompositionProps, SubtitleWord } from "./types";
import defaultSubtitles from "../public/subtitles.json";
import defaultMetadata from "../public/metadata.json";
import defaultStoryboard from "../public/storyboard.json";
import currentShortData from "./data/current_short.json";

const fallbackTitle = (currentShortData as any)?.videoTitle || "DATA DETECTIVE";

export const ShortComposition: React.FC<ShortCompositionProps> = ({
  genre = "tech-fact",
  hookBadge = fallbackTitle,
  subtitles = (defaultSubtitles as SubtitleWord[]),
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 5-Layer Cinematic Depth Background (for non-full-bleed genres) */}
      {genre !== "data-detective" && (
        <Background
          themeColor={
            genre === "style-advisor"
              ? "#ef4444"
              : defaultStoryboard?.storyboard?.themeColor || "#38bdf8"
          }
        />
      )}

      {/* Main Voiceover (100% Volume) */}
      <Audio src={staticFile("voiceover.mp3")} volume={1.0} />

      {/* Ambient BGM (-18dB / ~12% volume) */}
      <Audio src={staticFile("ambient.mp3")} volume={0.12} loop />

      {/* Dynamic Visual Genre Scene (Layer 3 & Character Mascot) */}
      {genre === "style-advisor" ? (
        <StyleAdvisor subtitles={subtitles} />
      ) : genre === "kurzgesagt-explainer" ? (
        <KurzgesagtExplainer subtitles={subtitles} />
      ) : genre === "data-detective" ? (
        <DataDetective subtitles={subtitles} />
      ) : (
        <>
          <DynamicVisuals />
          <Mascot subtitles={subtitles} />
        </>
      )}

      {/* Kinetic Subtitles (2-3 words per flash, centered with high contrast) */}
      <KineticSubtitles words={subtitles} />

      {/* Top Hook Badge & Retention Progress Bar */}
      <ProgressOverlay
        badgeTitle={hookBadge}
        showBadges={genre === "tech-fact"}
      />
    </AbsoluteFill>
  );
};

export const defaultProps: ShortCompositionProps = {
  genre: "tech-fact",
  hookBadge: fallbackTitle,
  subtitles: defaultSubtitles as SubtitleWord[],
};

export const initialDurationInFrames = defaultMetadata?.totalFrames || 900;
