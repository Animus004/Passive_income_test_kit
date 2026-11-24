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
import { CircleToonHeader } from "../components/circletoon/CircleToonHeader";
import { CircleToonStage } from "../components/circletoon/CircleToonStage";
import defaultSubtitles from "../../public/subtitles.json";
import storyData from "../data/current_whatif_short.json";
import { SubtitleWord, WordChunk } from "../types";

export const CircleToonExplainerWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cuts = storyData.cuts || [];
  const totalFrames = storyData.totalFrames || 1233;

  // Determine active cut
  let currentCut = 1;
  let activeCut = cuts[0] || {
    tickerAmount: "$1,000,000",
    tickerColor: "#22c55e",
    statusLabel: "12:00 AM • MIDNIGHT",
  };

  for (const c of cuts) {
    if (frame >= c.startFrame && frame < c.endFrame) {
      currentCut = c.sceneIndex;
      activeCut = c;
      break;
    }
  }

  const loopWhipFrame = Math.max(0, totalFrames - 15);

  // Subtitles logic - clean Walter-style centered captions
  const subtitles: SubtitleWord[] = defaultSubtitles as SubtitleWord[];
  const currentTime = frame / fps;

  // Group words into bite-sized 2-3 word chunks
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
        backgroundColor: "#0F172A",
        fontFamily: "'Arial Black', Impact, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. Main High-Quality Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} volume={1.0} />

      {/* 2. Deep Sci-Fi Ambient Music */}
      <Audio src={staticFile("ambient.mp3")} volume={0.08} loop />

      {/* 3. Narrative Micro-SFX on all 8 Scene Cuts */}
      {/* Cut 1 (0): Midnight Buzz & Cash Drop */}
      <Sequence from={0} durationInFrames={25}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={12} durationInFrames={35}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={18} durationInFrames={30}>
        <Audio src={staticFile("sfx/stamp_slam.mp3")} volume={0.4} />
      </Sequence>

      {/* Cut 2 (135): 8 Billion Phones Buzzing */}
      <Sequence from={135} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={145} durationInFrames={35}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.35} />
      </Sequence>

      {/* Cut 3 (300): 95% Workers Quit & Throw Papers */}
      <Sequence from={300} durationInFrames={30}>
        <Audio src={staticFile("sfx/paper_slide.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={310} durationInFrames={35}>
        <Audio src={staticFile("sfx/stamp_slam.mp3")} volume={0.45} />
      </Sequence>

      {/* Cut 4 (430): Ghost Mansion Sold */}
      <Sequence from={430} durationInFrames={25}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={440} durationInFrames={30}>
        <Audio src={staticFile("sfx/camera_snap.mp3")} volume={0.35} />
      </Sequence>

      {/* Cut 5 (630): Hyperinflation Grocery Panic */}
      <Sequence from={630} durationInFrames={45}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={638} durationInFrames={30}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.4} />
      </Sequence>

      {/* Cut 6 (830): 72 Hours Later / Cash is Trash */}
      <Sequence from={830} durationInFrames={30}>
        <Audio src={staticFile("sfx/glitch.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={840} durationInFrames={30}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.4} />
      </Sequence>

      {/* Cut 7 (930): Chocolate Barter Economy */}
      <Sequence from={930} durationInFrames={30}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.35} />
      </Sequence>

      {/* Cut 8 (1050): Paradox Loop */}
      <Sequence from={1050} durationInFrames={30}>
        <Audio src={staticFile("sfx/paper_slide.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={loopWhipFrame} durationInFrames={15}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.4} />
      </Sequence>

      {/* 4. The 2D Circle-Head Vector Stage (8 Dynamic Environments) */}
      <CircleToonStage
        currentCut={currentCut}
        cuts={cuts}
        totalFrames={totalFrames}
        subtitles={subtitles}
      />

      {/* 5. Walter's Top Viral Retention Header (Permanent Number Counter) */}
      <CircleToonHeader
        seriesNumber={(activeCut as any).headerTop || storyData.seriesNumber || "#1"}
        counterText={activeCut.tickerAmount}
        counterColor={activeCut.tickerColor}
        statusText={activeCut.statusLabel}
      />

      {/* 6. High-Retention Kinetic Subtitles (Walter 1:1 Clean Floating Bold) */}
      {activeChunk && (
        <div
          style={{
            position: "absolute",
            top: 1440,
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
              maxWidth: 960,
              padding: "4px 16px",
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

              // Keywords to highlight in electric colors
              const isHighlight =
                /million|midnight|billion|worthless|chocolate|gold|rich|nobody|everyone|50,000|1,000,000|quit|hours/i.test(
                  cleanWord
                );

              const color = isHighlight ? "#FACC15" : "#FFFFFF";

              return (
                <span
                  key={`${activeChunk.index}-${idx}-${w.word}`}
                  style={{
                    display: "inline-block",
                    fontSize: 66,
                    fontWeight: 900,
                    color: color,
                    stroke: "#000000",
                    WebkitTextStroke: "8px #000000",
                    paintOrder: "stroke fill",
                    letterSpacing: "-0.5px",
                    transform: isCurrent
                      ? `scale(${1 + wordSpring * 0.14})`
                      : "scale(1.0)",
                    textShadow: "0 6px 16px rgba(0,0,0,0.9)",
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
