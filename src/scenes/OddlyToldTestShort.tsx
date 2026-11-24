import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { COLOR_THEMES, ColorTheme } from '../theme/tokens';
import { OddlyBeatRenderer, OddlyBeatProps } from '../components/OddlyBeatRenderer';
import { OddlyCaptions } from '../components/OddlyCaptions';

import manifestEn from '../data/oddly_manifest_en.json';
import manifestHi from '../data/oddly_manifest_hi.json';

export interface OddlyToldTestShortProps {
  language?: 'en' | 'hi';
}

const THEME_CYCLE: ColorTheme[] = [
  COLOR_THEMES.SUNNY_GOLD,
  COLOR_THEMES.ELECTRIC_CYAN,
  COLOR_THEMES.MIDNIGHT_INDIGO,
  COLOR_THEMES.MINT_EMERALD,
  COLOR_THEMES.SUNSET_CORAL,
];

export const OddlyToldTestShort: React.FC<OddlyToldTestShortProps> = ({
  language = 'en',
}) => {
  const frame = useCurrentFrame();
  const manifest = language === 'hi' ? manifestHi : manifestEn;
  const isHindi = language === 'hi';
  const audioFileName = isHindi ? 'oddly_master_hi.mp3' : 'oddly_master_en.mp3';

  // Find active beat for dynamic background & caption theme
  const activeBeatIndex = manifest.beats.findIndex((b: any, i: number) => {
    const start = i === 0 ? 0 : b.startFrame;
    const end = b.endFrame || b.startFrame + b.durationInFrames;
    return frame >= start && frame < end;
  });
  const currentBeat = activeBeatIndex >= 0 ? manifest.beats[activeBeatIndex] : manifest.beats[0];

  // Resolve theme: explicit beat theme or cycle
  const getBeatTheme = (beat: any, idx: number): ColorTheme => {
    if (beat.theme && (COLOR_THEMES as any)[beat.theme]) {
      return (COLOR_THEMES as any)[beat.theme];
    }
    // Night beats (like 2 AM, late night, sleep) automatically use MIDNIGHT_INDIGO
    const titleUpper = (beat.title || '').toUpperCase();
    if (titleUpper.includes('2:00 AM') || titleUpper.includes('MIDNIGHT') || titleUpper.includes('NIGHT') || titleUpper.includes('SLEEP')) {
      return COLOR_THEMES.MIDNIGHT_INDIGO;
    }
    return THEME_CYCLE[idx % THEME_CYCLE.length];
  };

  const currentTheme = getBeatTheme(currentBeat, Math.max(0, activeBeatIndex));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: currentTheme.bg,
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* Master Audio Track (Voiceover + Ducked Lo-Fi + Transition SFX) */}
      <Audio src={staticFile(audioFileName)} />

      {/* High-Contrast Frame Border (Oddly Told Aesthetic) */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 36,
          right: 36,
          bottom: 36,
          border: `5px solid ${currentTheme.ink}18`,
          borderRadius: 48,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Dynamic Beat Sequences */}
      {manifest.beats.map((beat: any, idx: number) => {
        const beatTheme = getBeatTheme(beat, idx);
        // Hook beat (idx === 0) MUST start at frame 0 so the video is never empty
        const fromFrame = idx === 0 ? 0 : beat.startFrame;
        const duration = idx === 0
          ? (beat.endFrame || beat.durationInFrames + beat.startFrame)
          : (beat.durationInFrames || (beat.endFrame ? beat.endFrame - beat.startFrame : 120));

        return (
          <Sequence
            key={beat.id || idx}
            from={fromFrame}
            durationInFrames={duration}
          >
            <OddlyBeatRenderer
              beat={beat as OddlyBeatProps}
              theme={beatTheme}
              language={language}
            />
          </Sequence>
        );
      })}

      {/* Kinetic Subtitles (Word-highlighted, mobile centered) */}
      <OddlyCaptions
        words={manifest.words}
        theme={currentTheme}
        chunkSize={isHindi ? 3 : 4}
      />
    </AbsoluteFill>
  );
};
