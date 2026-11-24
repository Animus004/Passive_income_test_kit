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
import { Molasses3dStage } from "../components/molasses3d/Molasses3dStage";
import { MolassesGagOverlay } from "../components/molasses3d/toon/MolassesGagOverlay";
import { getShotAtFrame, MOLASSES_SHOTS_EN } from "../components/molasses3d/story";
import { PaperTextureOverlay } from "../components/whalter/PaperTextureOverlay";
import subtitlesEn from "../../public/subtitles_molasses_en.json";
import subtitlesHi from "../../public/subtitles_molasses_hi.json";
import { SubtitleWord, WordChunk } from "../types";

export interface MolassesShortExplainerProps {
  language?: "en" | "hi";
}

interface CutMeta {
  sceneIndex: number;
  startFrame: number;
  endFrame: number;
  tag: string;
  headline: string;
  badgeColor: string;
}

const CUTS_EN: CutMeta[] = [
  { sceneIndex: 1, startFrame: 0, endFrame: 210, tag: "BOSTON • JAN 15, 1919", headline: "THE SWEET TSUNAMI", badgeColor: "#facc15" },
  { sceneIndex: 2, startFrame: 208, endFrame: 597, tag: "LEAKING 50-FT TANK", headline: "THE BROWN PAINT COVER-UP", badgeColor: "#d97706" },
  { sceneIndex: 3, startFrame: 596, endFrame: 929, tag: "HEATWAVE STRIKES", headline: "FERMENTATION PRESSURE SPIKE", badgeColor: "#ef4444" },
  { sceneIndex: 4, startFrame: 928, endFrame: 1133, tag: "RIVET FAILURE", headline: "MACHINE-GUN RIVET POP", badgeColor: "#ef4444" },
  { sceneIndex: 5, startFrame: 1132, endFrame: 1387, tag: "2.3M GALLONS UNLEASHED", headline: "25-FOOT GLUCOSE TSUNAMI", badgeColor: "#f59e0b" },
  { sceneIndex: 6, startFrame: 1386, endFrame: 1591, tag: "TRAIN TRACKS SNAPPED", headline: "ELEVATED RAILWAY COLLAPSE", badgeColor: "#38bdf8" },
  { sceneIndex: 7, startFrame: 1589, endFrame: 1916, tag: "STUCK IN SYRUP", headline: "SOLIDIFIES LIKE WET CONCRETE", badgeColor: "#10b981" },
  { sceneIndex: 8, startFrame: 1915, endFrame: 2376, tag: "NON-NEWTONIAN FLUID", headline: "THE KETCHUP EFFECT & PANCAKES", badgeColor: "#facc15" },
];

const CUTS_HI: CutMeta[] = [
  { sceneIndex: 1, startFrame: 0, endFrame: 298, tag: "BOSTON • JAN 15, 1919", headline: "25 LAKH GALLON MEETHA SAILAAB", badgeColor: "#facc15" },
  { sceneIndex: 2, startFrame: 297, endFrame: 727, tag: "50-FOOT STEEL TANK", headline: "BROWN PAINT SE LEAK CHHUPAYA", badgeColor: "#d97706" },
  { sceneIndex: 3, startFrame: 726, endFrame: 1086, tag: "GARMI KA KEHER", headline: "GAS KA PRESSURE FATNE LAGA", badgeColor: "#ef4444" },
  { sceneIndex: 4, startFrame: 1084, endFrame: 1293, tag: "LOHE KE RIVETS", headline: "MACHINE GUN JAISA EXPLOSION", badgeColor: "#ef4444" },
  { sceneIndex: 5, startFrame: 1292, endFrame: 1501, tag: "STICKY TSUNAMI", headline: "25 FOOT UNCHA SAILAAB", badgeColor: "#f59e0b" },
  { sceneIndex: 6, startFrame: 1500, endFrame: 1707, tag: "TABAHI KA MANZAR", headline: "TRAIN KI PATRIYAN TOD DI", badgeColor: "#38bdf8" },
  { sceneIndex: 7, startFrame: 1706, endFrame: 2066, tag: "CHIPKATA DALDHAL", headline: "GEELI CEMENT KI TARAH JAM GAYA", badgeColor: "#10b981" },
  { sceneIndex: 8, startFrame: 2065, endFrame: 2601, tag: "NON-NEWTONIAN FLUID", headline: "KETCHUP EFFECT & PANCAKE KHUSHBOO", badgeColor: "#facc15" },
];

export const MolassesShortExplainer: React.FC<MolassesShortExplainerProps> = ({
  language = "en",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isHindi = language === "hi";
  const cuts = isHindi ? CUTS_HI : CUTS_EN;
  const audioFile = isHindi ? "voiceover_molasses_hi.mp3" : "voiceover_molasses_en.mp3";
  const subtitles: SubtitleWord[] = (isHindi ? subtitlesHi : subtitlesEn) as SubtitleWord[];

  // Determine active narrative shot
  const activeShotEn = useMemo(() => getShotAtFrame(frame), [frame]);
  let currentCut = isHindi ? 1 : activeShotEn.shotIndex;
  let activeCutStartFrame = isHindi ? 0 : activeShotEn.startFrame;

  if (isHindi) {
    for (const c of cuts) {
      if (frame >= c.startFrame && frame < c.endFrame) {
        currentCut = c.sceneIndex;
        activeCutStartFrame = c.startFrame;
        break;
      }
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

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F172A",
        fontFamily: "'Arial Black', Impact, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. Main Master Voiceover Audio */}
      <Audio src={staticFile(audioFile)} volume={1.0} />

      {/* 2. Deep Sub-Bass Ambient Bed */}
      <Audio src={staticFile("ambient.mp3")} volume={0.06} loop />

      {/* 3. Synchronized Foley Sound Effects Matrix */}
      <Sequence from={cuts[0]?.startFrame ?? 0} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={(cuts[0]?.startFrame ?? 0) + 18} durationInFrames={35}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>

      <Sequence from={cuts[1]?.startFrame ?? 202} durationInFrames={30}>
        <Audio src={staticFile("sfx/pen_scratch.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={(cuts[1]?.startFrame ?? 202) + 20} durationInFrames={20}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.35} />
      </Sequence>

      <Sequence from={cuts[2]?.startFrame ?? 597} durationInFrames={40}>
        <Audio src={staticFile("sfx/riser.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={(cuts[2]?.startFrame ?? 597) + 35} durationInFrames={30}>
        <Audio src={staticFile("sfx/air_release.mp3")} volume={0.4} />
      </Sequence>

      <Sequence from={cuts[3]?.startFrame ?? 936} durationInFrames={25}>
        <Audio src={staticFile("sfx/laser.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={(cuts[3]?.startFrame ?? 936) + 12} durationInFrames={25}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={(cuts[3]?.startFrame ?? 936) + 24} durationInFrames={25}>
        <Audio src={staticFile("sfx/stamp_thud.mp3")} volume={0.5} />
      </Sequence>

      <Sequence from={cuts[4]?.startFrame ?? 1131} durationInFrames={45}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.55} />
      </Sequence>
      <Sequence from={(cuts[4]?.startFrame ?? 1131) + 8} durationInFrames={35}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.45} />
      </Sequence>

      <Sequence from={cuts[5]?.startFrame ?? 1381} durationInFrames={50}>
        <Audio src={staticFile("sfx/rail_friction_screech.wav")} volume={0.4} />
      </Sequence>
      <Sequence from={(cuts[5]?.startFrame ?? 1381) + 20} durationInFrames={45}>
        <Audio src={staticFile("sfx/train_track_rumble.wav")} volume={0.35} />
      </Sequence>

      <Sequence from={cuts[6]?.startFrame ?? 1596} durationInFrames={30}>
        <Audio src={staticFile("sfx/stamp_thud.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={(cuts[6]?.startFrame ?? 1596) + 25} durationInFrames={25}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.4} />
      </Sequence>

      <Sequence from={cuts[7]?.startFrame ?? 1941} durationInFrames={25}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={(cuts[7]?.startFrame ?? 1941) + 30} durationInFrames={25}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={(cuts[7]?.startFrame ?? 1941) + 130} durationInFrames={30}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.35} />
      </Sequence>

      {/* 4. Full-Bleed 3D Diorama Stage */}
      <Molasses3dStage
        key={`cut_${currentCut}`}
        currentCut={currentCut}
        cutStartFrame={activeCutStartFrame}
        language={language}
      />

      {/* 4.5 Modular 2D Storytelling Gag Overlay (No Captions, Pure Visual Action Props) */}
      {!isHindi && <MolassesGagOverlay currentShot={activeShotEn} />}

      {/* 5. Procedural Line Boil & Vintage Grain Overlay */}
      <PaperTextureOverlay opacity={0.035} enableLineBoil={true} enableVignette={true} />

      {/* 6. Mr Omi's Signature 4-Frame White Flash after the Hook (SKILL.md / Bridge.tsx) */}
      {frame >= (activeShotEn.shotIndex === 8 ? activeShotEn.startFrame : 204) && frame < (activeShotEn.shotIndex === 8 ? activeShotEn.endFrame : 208) && (
        <AbsoluteFill
          style={{
            backgroundColor: "#ffffff",
            opacity: [1.0, 0.75, 0.45, 0.2][frame - (activeShotEn.shotIndex === 8 ? activeShotEn.startFrame : 204)],
            zIndex: 100,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
