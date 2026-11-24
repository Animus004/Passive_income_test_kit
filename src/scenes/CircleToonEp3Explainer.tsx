import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { Whalter3dDioramaStage } from "../components/whalter3d/Whalter3dDioramaStage";
import { CinematicCamera } from "../components/whalter/CinematicCamera";
import { PaperTextureOverlay } from "../components/whalter/PaperTextureOverlay";
import subtitlesEn from "../../public/subtitles_ep3_en.json";
import subtitlesHi from "../../public/subtitles_ep3_hi.json";
import { SubtitleWord, WordChunk } from "../types";

export interface CircleToonEp3ExplainerProps {
  language?: "en" | "hi";
}

interface CutMeta {
  sceneIndex: number;
  startFrame: number;
  endFrame: number;
  counterText: string;
  counterColor: string;
  statusText: string;
}

/**
 * Exact Sentence-Synchronized Narrative Beats extracted directly from Whisper:
 * Total English Duration: 57.36s (1,721 frames)
 * Total Hindi Duration: 62.71s (1,881 frames)
 */
const CUTS_EN: CutMeta[] = [
  { sceneIndex: 1, startFrame: 0, endFrame: 164, counterText: "11:59:50 PM", counterColor: "#facc15", statusText: "WHAT IF EVERYONE SLEPT?" },
  { sceneIndex: 2, startFrame: 164, endFrame: 235, counterText: "12:00:00 AM", counterColor: "#ef4444", statusText: "8 BILLION PEOPLE COLLAPSE" },
  { sceneIndex: 3, startFrame: 235, endFrame: 440, counterText: "0 DRIVERS", counterColor: "#ef4444", statusText: "HIGHWAYS DRIFT TO A HALT" },
  { sceneIndex: 4, startFrame: 440, endFrame: 622, counterText: "30,000 JETS", counterColor: "#38bdf8", statusText: "AUTOPILOT ENGAGED" },
  { sceneIndex: 5, startFrame: 622, endFrame: 822, counterText: "AUTO-SCRAM", counterColor: "#10b981", statusText: "NUCLEAR CONTROL RODS DROP" },
  { sceneIndex: 6, startFrame: 822, endFrame: 959, counterText: "72 HOURS", counterColor: "#f59e0b", statusText: "POWER GRIDS EXHAUSTED" },
  { sceneIndex: 7, startFrame: 959, endFrame: 1082, counterText: "TOTAL BLACKOUT", counterColor: "#ef4444", statusText: "CONTINENTS IN DARKNESS" },
  { sceneIndex: 8, startFrame: 1082, endFrame: 1305, counterText: "0% POLLUTION", counterColor: "#22c55e", statusText: "NATURE RECLAIMS BOULEVARDS" },
  { sceneIndex: 9, startFrame: 1305, endFrame: 1506, counterText: "DAY 7 REACHED", counterColor: "#ef4444", statusText: "168 MISSED CALLS • WAKE UP!" },
  { sceneIndex: 10, startFrame: 1506, endFrame: 1721, counterText: "WHAT WOULD YOU DO?", counterColor: "#38bdf8", statusText: "COMMENT YOUR SURVIVAL PLAN 👇" },
];

const CUTS_HI: CutMeta[] = [
  { sceneIndex: 1, startFrame: 0, endFrame: 176, counterText: "11:59:50 PM", counterColor: "#facc15", statusText: "KYA HO AGAR SAB SO JAYEIN?" },
  { sceneIndex: 2, startFrame: 176, endFrame: 318, counterText: "12:00:00 AM", counterColor: "#ef4444", statusText: "800 CRORE LOG BEHOSH" },
  { sceneIndex: 3, startFrame: 318, endFrame: 528, counterText: "0 DRIVERS", counterColor: "#ef4444", statusText: "SADKON PAR GAADIYAN BAND" },
  { sceneIndex: 4, startFrame: 528, endFrame: 770, counterText: "30,000 PLANES", counterColor: "#38bdf8", statusText: "AUTOPILOT PAR HAWA MEIN" },
  { sceneIndex: 5, startFrame: 770, endFrame: 986, counterText: "AUTO-SCRAM", counterColor: "#10b981", statusText: "NUCLEAR PLANTS SAFE SHUTDOWN" },
  { sceneIndex: 6, startFrame: 986, endFrame: 1080, counterText: "72 GHANTE", counterColor: "#f59e0b", statusText: "BIJLI GRIDS THAP" },
  { sceneIndex: 7, startFrame: 1080, endFrame: 1184, counterText: "POORA ANDHERA", counterColor: "#ef4444", statusText: "POORI DUNIYA MEIN ANDHERA" },
  { sceneIndex: 8, startFrame: 1184, endFrame: 1405, counterText: "0% SMOG", counterColor: "#22c55e", statusText: "SADKON PAR DEER & BIRDS" },
  { sceneIndex: 9, startFrame: 1405, endFrame: 1646, counterText: "DAY 7 AAYA", counterColor: "#ef4444", statusText: "168 MISSED CALLS • JAAGO!" },
  { sceneIndex: 10, startFrame: 1646, endFrame: 1881, counterText: "AAP KYA KAROGE?", counterColor: "#38bdf8", statusText: "COMMENTS MEIN BATAO 👇" },
];

export const CircleToonEp3Explainer: React.FC<CircleToonEp3ExplainerProps> = ({
  language = "en",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isHindi = language === "hi";
  const cuts = isHindi ? CUTS_HI : CUTS_EN;
  const audioFile = isHindi ? "voiceover_ep3_hi.mp3" : "voiceover_ep3_en.mp3";
  const subtitles: SubtitleWord[] = (isHindi ? subtitlesHi : subtitlesEn) as SubtitleWord[];

  // Determine active cut based on exact sentence boundaries
  let currentCut = 1;
  let activeCut = cuts[0];

  for (const c of cuts) {
    if (frame >= c.startFrame && frame < c.endFrame) {
      currentCut = c.sceneIndex;
      activeCut = c;
      break;
    }
  }

  const currentTime = frame / fps;

  // Kinetic Subtitles: Max 2 words per chunk, zero bleed
  const chunks: WordChunk[] = useMemo(() => {
    if (!subtitles || subtitles.length === 0) return [];
    const result: WordChunk[] = [];
    let currentWords: SubtitleWord[] = [];

    for (let i = 0; i < subtitles.length; i++) {
      const w = subtitles[i];
      const nextW = subtitles[i + 1];
      currentWords.push(w);

      const hasPunctuation = /[.?!]$/.test(w.word);
      const isPause = nextW ? nextW.start - w.end > 0.35 : false;
      const isMaxChunk = currentWords.length >= 2;
      const isLastWord = i === subtitles.length - 1;

      if (hasPunctuation || isPause || isMaxChunk || isLastWord) {
        result.push({
          words: currentWords,
          start: currentWords[0].start,
          end: currentWords[currentWords.length - 1].end,
          index: result.length,
        });
        currentWords = [];
      }
    }
    return result;
  }, [subtitles]);

  const activeChunk = useMemo(() => {
    return chunks.find((c, i) => {
      const nextChunk = chunks[i + 1];
      const visualTail = 0.15;
      const maxDisplayEnd = c.end + visualTail;
      const chunkEnd = nextChunk ? Math.min(maxDisplayEnd, nextChunk.start) : maxDisplayEnd;
      return currentTime >= c.start && currentTime < chunkEnd;
    });
  }, [chunks, currentTime]);

  // Cinematic Camera Rig Dynamics - Synchronized to Narrative Beats
  let targetZoom = 1.0;
  let focusX = 540;
  let focusY = 960;
  let shakeFrame = -1;
  let shakeStrength = 14;

  if (currentCut === 1) {
    targetZoom = 1.06;
    focusX = 540;
    focusY = 1070;
  } else if (currentCut === 2) {
    targetZoom = 1.28;
    focusX = 480;
    focusY = 1140;
    shakeFrame = activeCut.startFrame + 12;
    shakeStrength = 16;
  } else if (currentCut === 3) {
    targetZoom = 1.08;
    focusX = 540;
    focusY = 1300;
    shakeFrame = activeCut.startFrame + 28;
    shakeStrength = 18;
  } else if (currentCut === 4) {
    targetZoom = 1.16;
    focusX = 780;
    focusY = 1150;
  } else if (currentCut === 5) {
    targetZoom = 1.22;
    focusX = 680;
    focusY = 1140;
  } else if (currentCut === 6) {
    targetZoom = 1.02;
    focusX = 540;
    focusY = 960;
  } else if (currentCut === 7) {
    targetZoom = 1.38;
    focusX = 540;
    focusY = 960;
  } else if (currentCut === 8) {
    targetZoom = 1.12;
    focusX = 540;
    focusY = 1120;
  } else if (currentCut === 9) {
    targetZoom = 1.20;
    focusX = 760;
    focusY = 1100;
    shakeFrame = activeCut.startFrame;
    shakeStrength = 22;
  } else if (currentCut === 10) {
    targetZoom = 1.24;
    focusX = 540;
    focusY = 1020;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F172A",
        fontFamily: "'Arial Black', Impact, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. Main Voiceover Audio */}
      <Audio src={staticFile(audioFile)} volume={1.0} />

      {/* 2. Deep Ambient Bed */}
      <Audio src={staticFile("ambient.mp3")} volume={0.08} loop />

      {/* 3. Narrative Foley SFX Matrix */}
      <Sequence from={cuts[0]?.startFrame ?? 0} durationInFrames={25}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={cuts[1]?.startFrame ?? 164} durationInFrames={35}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={(cuts[1]?.startFrame ?? 164) + 15} durationInFrames={25}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={(cuts[2]?.startFrame ?? 235) + 26} durationInFrames={25}>
        <Audio src={staticFile("sfx/glitch.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={cuts[3]?.startFrame ?? 440} durationInFrames={35}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={cuts[4]?.startFrame ?? 622} durationInFrames={30}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={cuts[5]?.startFrame ?? 822} durationInFrames={40}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={cuts[6]?.startFrame ?? 959} durationInFrames={25}>
        <Audio src={staticFile("sfx/glitch.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={cuts[7]?.startFrame ?? 1082} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={cuts[8]?.startFrame ?? 1305} durationInFrames={45}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={cuts[9]?.startFrame ?? 1506} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.4} />
      </Sequence>

      {/* 4. Full-Bleed 3D Diorama Stage (Three.js WebGL + 2D Paper-Doll Whalter) */}
      <Whalter3dDioramaStage
        currentCut={currentCut}
        cutStartFrame={activeCut.startFrame}
        subtitles={subtitles}
      />

      {/* 5. Procedural Line Boil & Paper Grain Shader Overlay */}
      <PaperTextureOverlay opacity={0.035} enableLineBoil={true} enableVignette={true} />

      {/* 6. Centered Kinetic Subtitles - Positioned safely at lower-chest level */}
      {activeChunk && (
        <div
          style={{
            position: "absolute",
            top: 1380,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 40px",
            zIndex: 40,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "14px",
              padding: "16px 32px",
              borderRadius: "20px",
              backgroundColor: "rgba(2, 6, 23, 0.88)",
              border: "3px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.7)",
            }}
          >
            {activeChunk.words.map((w, idx) => {
              const isWordActive = currentTime >= w.start && currentTime <= w.end;
              return (
                <span
                  key={`${w.word}_${idx}`}
                  style={{
                    color: isWordActive ? "#FACC15" : "#FFFFFF",
                    fontSize: "52px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    textShadow: isWordActive
                      ? "0 0 20px rgba(250, 204, 21, 0.85), 0 4px 8px rgba(0,0,0,0.9)"
                      : "0 4px 8px rgba(0,0,0,0.9)",
                    transform: isWordActive ? "scale(1.08)" : "scale(1.0)",
                    transition: "transform 0.08s ease-out, color 0.08s ease-out",
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
