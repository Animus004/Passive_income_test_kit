import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { ColorTheme } from '../theme/tokens';

export interface SubtitleWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface OddlyCaptionsProps {
  words: SubtitleWord[];
  theme: ColorTheme;
  chunkSize?: number; // words per phrase (default 3 to 5)
}

export const OddlyCaptions: React.FC<OddlyCaptionsProps> = ({
  words,
  theme,
  chunkSize = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Group words into bite-sized phrases (chunks)
  const chunks = useMemo(() => {
    const list: { start: number; end: number; words: SubtitleWord[] }[] = [];
    if (!words || words.length === 0) return list;

    for (let i = 0; i < words.length; i += chunkSize) {
      const slice = words.slice(i, i + chunkSize);
      list.push({
        start: slice[0].start,
        end: slice[slice.length - 1].end + 0.15,
        words: slice,
      });
    }
    return list;
  }, [words, chunkSize]);

  // Find active chunk
  const activeChunk = chunks.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  if (!activeChunk) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 220,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 100,
        padding: '0 40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px 20px',
          backgroundColor: theme.name === 'MIDNIGHT_INDIGO' ? '#0F0E17' : '#FFFFFF',
          padding: '16px 36px',
          borderRadius: 36,
          border: `6px solid ${theme.ink}`,
          boxShadow: `0 8px 0 ${theme.ink}`,
          maxWidth: '92%',
        }}
      >
        {activeChunk.words.map((item, idx) => {
          const isActive =
            currentTime >= item.start && currentTime <= item.end;
          const isPast = currentTime > item.end;

          // Elastic bounce for the active word
          const wordFrame = Math.max(0, Math.floor((currentTime - item.start) * fps));
          const popSpring = spring({
            frame: wordFrame,
            fps,
            config: { damping: 10, stiffness: 240, mass: 0.6 },
          });

          const scale = isActive ? 1 + popSpring * 0.15 : 1;
          const color = isActive
            ? theme.accent
            : isPast
            ? (theme.name === 'MIDNIGHT_INDIGO' ? '#94A3B8' : '#64748B')
            : theme.text;

          return (
            <span
              key={idx}
              style={{
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: 44,
                fontWeight: 900,
                textTransform: 'uppercase',
                color: color,
                display: 'inline-block',
                margin: '0 4px',
                transform: `scale(${scale})`,
                transition: 'color 0.1s ease',
                letterSpacing: '0.5px',
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
