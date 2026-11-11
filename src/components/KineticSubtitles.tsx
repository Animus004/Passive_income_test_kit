import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { SubtitleWord, WordChunk } from "../types";

interface KineticSubtitlesProps {
  words: SubtitleWord[];
}

// Keyword-based emoji badges that pop with key words
const KEYWORD_EMOJIS: Record<string, string> = {
  "99%": "🌐",
  "internet": "🌐",
  "space": "🛰️",
  "satellites": "🛰️",
  "cables": "⚡",
  "fiber-optic": "⚡",
  "ocean": "🌊",
  "underwater": "🌊",
  "earthquakes": "🌋",
  "anchors": "⚓",
  "sharks": "🦈",
  "rubber": "🛡️",
  "choke": "⚠️",
  "cut": "✂️",
  "disconnected": "🚫",
  "cloud": "☁️",
  "subscribe": "🔔",
  "secrets": "🔥",
};

export const KineticSubtitles: React.FC<KineticSubtitlesProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Chunk words into high-retention 1 to 2 words per pop (never cramming)
  const chunks: WordChunk[] = useMemo(() => {
    if (!words || words.length === 0) return [];

    const result: WordChunk[] = [];
    let currentWords: SubtitleWord[] = [];

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      currentWords.push(w);

      const hasPunctuation = /[.?!,;:]$/.test(w.word);
      const isMaxChunk = currentWords.length >= 2;
      const isLastWord = i === words.length - 1;

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
  }, [words]);

  // Find currently active chunk
  const activeChunkIndex = useMemo(() => {
    return chunks.findIndex((chunk, i) => {
      const nextChunk = chunks[i + 1];
      const chunkEnd = nextChunk ? nextChunk.start : chunk.end + 0.6;
      return currentTime >= chunk.start && currentTime < chunkEnd;
    });
  }, [chunks, currentTime]);

  const activeChunk = activeChunkIndex !== -1 ? chunks[activeChunkIndex] : null;

  if (!activeChunk) {
    return null;
  }

  // Animation for chunk entry
  const chunkStartFrame = Math.floor(activeChunk.start * fps);
  const chunkSpring = spring({
    frame: frame - chunkStartFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 280,
      mass: 0.4,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "60%",
        left: "5%",
        transform: "translateY(-50%)",
        width: "90%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 20px",
        boxSizing: "border-box",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "28px",
          transform: `scale(${0.92 + chunkSpring * 0.08})`,
        }}
      >
        {activeChunk.words.map((w, index) => {
          const nextWord = activeChunk.words[index + 1];
          const wordEnd = nextWord ? nextWord.start : w.end;
          const isActive = currentTime >= w.start && currentTime < wordEnd;

          // Spring bounce animation specifically for active word
          const wordStartFrame = Math.floor(w.start * fps);
          const wordSpring = spring({
            frame: frame - wordStartFrame,
            fps,
            config: {
              damping: 9,
              stiffness: 260,
              mass: 0.35,
            },
          });

          // Check if clean word matches an emoji
          const cleanWord = w.word.toLowerCase().replace(/[^a-z0-9%]/g, "");
          const emoji = KEYWORD_EMOJIS[cleanWord];

          // Alternate highlight styles: electric yellow (#FFE600) and electric cyan (#00F5FF)
          const isYellow = (activeChunk.index + index) % 2 === 0;
          const highlightColor = isYellow ? "#FFE600" : "#00F5FF";

          // Dynamic scale: pops to ~1.22x then settles when active
          const scale = isActive
            ? 1 + wordSpring * 0.18
            : 1.0;

          return (
            <div
              key={`${activeChunk.index}-${index}-${w.word}`}
              style={{
                position: "relative",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "0 12px",
              }}
            >
              {/* Animated Floating Keyword Sticker / Emoji */}
              {isActive && emoji && (
                <span
                  style={{
                    position: "absolute",
                    top: "-55px",
                    fontSize: "44px",
                    transform: `scale(${1 + wordSpring * 0.3}) translateY(${-wordSpring * 10}px)`,
                    filter: "drop-shadow(0 0 15px rgba(255,255,255,0.8))",
                  }}
                >
                  {emoji}
                </span>
              )}

              <span
                style={{
                  display: "inline-block",
                  transform: `scale(${scale})`,
                  fontFamily:
                    "'Impact', 'Arial Black', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: "72px",
                  fontWeight: 900,
                  letterSpacing: "2.5px",
                  lineHeight: "1.05",
                  textTransform: "uppercase",
                  color: isActive ? highlightColor : "#FFFFFF",
                  WebkitTextStroke: isActive ? "6px #000000" : "4px #000000",
                  paintOrder: "stroke fill",
                  textShadow: isActive
                    ? `0 0 45px ${highlightColor}ee, 0 10px 25px rgba(0,0,0,0.95)`
                    : "0 8px 24px rgba(0,0,0,0.9)",
                  padding: "4px 16px",
                  borderRadius: "14px",
                  backgroundColor: isActive ? "rgba(0,0,0,0.55)" : "transparent",
                }}
              >
                {w.word}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
