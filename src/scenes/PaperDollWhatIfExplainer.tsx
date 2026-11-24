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
import { PaperDollDioramaStage, PaperDollSceneCut } from "../components/animations/PaperDollDioramaStage";
import defaultSubtitles from "../../public/subtitles_ep2_en.json";
import storyData from "../data/whatif_ep2_manifest.json";
import { SubtitleWord, WordChunk } from "../types";

export const PaperDollWhatIfExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cuts = (storyData.cuts as PaperDollSceneCut[]) || [];
  const totalFrames = storyData.totalFrames || 1416;

  // Determine active cut
  let currentCut = 1;
  let activeCut: PaperDollSceneCut = cuts[0] || {
    sceneIndex: 1,
    startFrame: 0,
    endFrame: 125,
    name: "The Hook",
    headerTop: "WHAT IF THE INTERNET WAS",
    tickerAmount: "DELETED FOR 72H",
    tickerColor: "#ef4444",
    statusLabel: "12:01 AM • ZERO CONNECTION",
    environment: "desk_offline",
  };

  for (const c of cuts) {
    if (frame >= c.startFrame && frame < c.endFrame) {
      currentCut = c.sceneIndex;
      activeCut = c;
      break;
    }
  }

  const loopWhipFrame = Math.max(0, totalFrames - 15);

  // Subtitles logic - high-retention 2-3 word kinetic chunks
  const subtitles: SubtitleWord[] = defaultSubtitles as SubtitleWord[];
  const currentTime = frame / fps;

  const chunks: WordChunk[] = useMemo(() => {
    if (!subtitles || subtitles.length === 0) return [];
    const result: WordChunk[] = [];
    let currentWords: SubtitleWord[] = [];

    for (let i = 0; i < subtitles.length; i++) {
      const w = subtitles[i];
      currentWords.push(w);
      const hasPunctuation = /[.?!,;:]$/.test(w.word);
      const isMaxChunk = currentWords.length >= 3;
      const isLastWord = i === subtitles.length - 1;

      if (hasPunctuation || isMaxChunk || isLastWord) {
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
      const chunkEnd = nextChunk ? nextChunk.start : c.end + 0.5;
      return currentTime >= c.start && currentTime < chunkEnd;
    });
  }, [chunks, currentTime]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0F1D",
        fontFamily: "'Arial Black', Impact, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. Main High-Quality Voiceover */}
      <Audio src={staticFile("voiceover_ep2_en.mp3")} volume={1.0} />

      {/* 2. Deep Ambient Atmospheric Bed */}
      <Audio src={staticFile("ambient.mp3")} volume={0.08} loop />

      {/* 3. Narrative Micro-SFX synchronized with scene cuts */}
      {/* Cut 1 (0): Emergency Hook Whoosh & Sub-Drop */}
      <Sequence from={0} durationInFrames={25}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={12} durationInFrames={35}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={18} durationInFrames={30}>
        <Audio src={staticFile("sfx/stamp_slam.mp3")} volume={0.4} />
      </Sequence>

      {/* Cut 2: Screens Freeze / Glitch Alarm */}
      <Sequence from={cuts[1]?.startFrame || 135} durationInFrames={30}>
        <Audio src={staticFile("sfx/glitch.mp3")} volume={0.4} />
      </Sequence>

      {/* Cut 3: Airplanes Radar Alert */}
      <Sequence from={cuts[2]?.startFrame || 300} durationInFrames={35}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.35} />
      </Sequence>

      {/* Cut 4: ATMs Failure Thud */}
      <Sequence from={cuts[3]?.startFrame || 430} durationInFrames={30}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.4} />
      </Sequence>

      {/* Cut 5: Supply Chain Alarm */}
      <Sequence from={cuts[4]?.startFrame || 630} durationInFrames={35}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.35} />
      </Sequence>

      {/* Cut 6: Power Grid Desync & Sub Drop */}
      <Sequence from={cuts[5]?.startFrame || 830} durationInFrames={40}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>

      {/* Cut 7: Barter Economy Blip */}
      <Sequence from={cuts[6]?.startFrame || 930} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.35} />
      </Sequence>

      {/* Cut 8: Infinite Loop Whip */}
      <Sequence from={loopWhipFrame} durationInFrames={15}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.4} />
      </Sequence>

      {/* 4. Three.js 3D Paper-Doll Shadow Stage */}
      <PaperDollDioramaStage
        currentCut={currentCut}
        cuts={cuts}
        totalFrames={totalFrames}
        subtitles={subtitles}
        episodeNumber={storyData.seriesNumber || "#2"}
        topicTitle={storyData.title || "WHAT IF"}
      />

      {/* 5. High-Retention Kinetic Subtitles (1-3 Words Bold) */}
      {activeChunk && (
        <div
          style={{
            position: "absolute",
            top: 1420,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: 14,
              maxWidth: 980,
              padding: "6px 20px",
            }}
          >
            {activeChunk.words.map((w, idx) => {
              const cleanWord = w.word.replace(/[^a-zA-Z0-9$%]/g, "");
              const isCurrent = currentTime >= w.start && currentTime < w.end;
              const wordSpring = spring({
                frame: Math.max(0, frame - Math.floor(w.start * fps)),
                fps,
                config: { damping: 10, stiffness: 240 },
              });

              // Keywords highlighted in high-contrast electric colors
              const isHighlight =
                /internet|deleted|hours|freeze|blind|airplanes|gps|atms|dead|power|darkness|offline|midnight|money|worthless/i.test(
                  cleanWord
                );

              const color = isHighlight ? "#FACC15" : "#FFFFFF";

              return (
                <span
                  key={`${activeChunk.index}-${idx}-${w.word}`}
                  style={{
                    display: "inline-block",
                    fontSize: 68,
                    fontWeight: 900,
                    color: color,
                    stroke: "#000000",
                    WebkitTextStroke: "8px #000000",
                    paintOrder: "stroke fill",
                    letterSpacing: "-0.5px",
                    transform: isCurrent
                      ? `scale(${1 + wordSpring * 0.15})`
                      : "scale(1.0)",
                    textShadow: "0 8px 24px rgba(0,0,0,0.95)",
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
