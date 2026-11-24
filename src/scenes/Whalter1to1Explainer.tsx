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
import { WhalterStage, WhalterCutData } from "../components/whalter/WhalterStage";
import subtitlesEn from "../../public/subtitles_ep2_en.json";
import subtitlesHi from "../../public/subtitles_ep2_hi.json";
import subtitlesEp3En from "../../public/subtitles_ep3_en.json";
import subtitlesEp3Hi from "../../public/subtitles_ep3_hi.json";
import { SubtitleWord, WordChunk } from "../types";

export interface Whalter1to1ExplainerProps {
  language?: "en" | "hi";
  episode?: number;
}

// English Cut Timings (1,580 Frames @ 30fps = 52.66s)
const WHALTER_EP2_CUTS_EN: WhalterCutData[] = [
  {
    sceneIndex: 1,
    startFrame: 0,
    endFrame: 150,
    name: "The Blackout Hook",
    badgeText: "#2",
    metricText: "12:01:00 AM",
    metricColor: "#EF4444",
    contextTag: "ALL SCREENS FROZEN",
    heroExpression: "wavy",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 2,
    startFrame: 150,
    endFrame: 305,
    name: "Screens Freeze",
    badgeText: "#2",
    metricText: "8,000,000,000",
    metricColor: "#EF4444",
    contextTag: "DEVICES FROZEN WORLDWIDE",
    heroExpression: "wavy",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 3,
    startFrame: 305,
    endFrame: 500,
    name: "30,000 Planes Blind",
    badgeText: "#2",
    metricText: "30,000 JETS",
    metricColor: "#FACC15",
    contextTag: "GPS NAVIGATION OFFLINE",
    heroExpression: "panic",
    heroProp: "none",
    heroRole: "pilot",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 4,
    startFrame: 500,
    endFrame: 735,
    name: "Bank ATM Crash",
    badgeText: "#2",
    metricText: "$0.00 BALANCE",
    metricColor: "#EF4444",
    contextTag: "ATMS & CREDIT CARDS DEAD",
    heroExpression: "panic",
    heroProp: "card",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 5,
    startFrame: 735,
    endFrame: 925,
    name: "Supply Chain Freeze",
    badgeText: "#2",
    metricText: "EMPTY SHELVES",
    metricColor: "#F97316",
    contextTag: "DIGITAL DISPATCH HALTED",
    heroExpression: "shocked",
    heroProp: "beans",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 6,
    startFrame: 925,
    endFrame: 1170,
    name: "Power Grid Meltdown",
    badgeText: "#2",
    metricText: "48 HOURS",
    metricColor: "#DC2626",
    contextTag: "CONTINENTAL BLACKOUT",
    heroExpression: "panic",
    heroProp: "candle",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 7,
    startFrame: 1170,
    endFrame: 1465,
    name: "$12T Erased",
    badgeText: "#2",
    metricText: "-$12,000,000,000,000",
    metricColor: "#38BDF8",
    contextTag: "DATA PACKETS > MONEY",
    heroExpression: "smug",
    heroProp: "chocolate",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 8,
    startFrame: 1465,
    endFrame: 1580,
    name: "Infinite Loop",
    badgeText: "#2",
    metricText: "NO SIGNAL",
    metricColor: "#FACC15",
    contextTag: "RECONNECTING IN 3... 2... 1...",
    heroExpression: "skeptical",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
];

// Hindi Master Cut Timings (1,632 Frames @ 30fps = 54.40s)
const WHALTER_EP2_CUTS_HI: WhalterCutData[] = [
  {
    sceneIndex: 1,
    startFrame: 0,
    endFrame: 178,
    name: "The Blackout Hook",
    badgeText: "#2",
    metricText: "12:01:00 AM",
    metricColor: "#EF4444",
    contextTag: "INTERNET BAND HO GAYA",
    heroExpression: "wavy",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 2,
    startFrame: 178,
    endFrame: 349,
    name: "Screens Freeze",
    badgeText: "#2",
    metricText: "8,000,000,000",
    metricColor: "#EF4444",
    contextTag: "HAR SCREEN FREEZE",
    heroExpression: "wavy",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 3,
    startFrame: 349,
    endFrame: 570,
    name: "30,000 Planes Blind",
    badgeText: "#2",
    metricText: "30,000 JETS",
    metricColor: "#FACC15",
    contextTag: "GPS OFFLINE • ANDHE HO GAYE",
    heroExpression: "panic",
    heroProp: "none",
    heroRole: "pilot",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 4,
    startFrame: 570,
    endFrame: 747,
    name: "Bank ATM Crash",
    badgeText: "#2",
    metricText: "$0.00 BALANCE",
    metricColor: "#EF4444",
    contextTag: "SABHI ATMS THAP",
    heroExpression: "panic",
    heroProp: "card",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 5,
    startFrame: 747,
    endFrame: 952,
    name: "Supply Chain Freeze",
    badgeText: "#2",
    metricText: "SUPPLY STOPPED",
    metricColor: "#F97316",
    contextTag: "TRUCKS DIGITAL DISPATCH BAND",
    heroExpression: "shocked",
    heroProp: "beans",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 6,
    startFrame: 952,
    endFrame: 1177,
    name: "Power Grid Meltdown",
    badgeText: "#2",
    metricText: "48 HOURS",
    metricColor: "#DC2626",
    contextTag: "POORA CONTINENT ANDHERA",
    heroExpression: "panic",
    heroProp: "candle",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 7,
    startFrame: 1177,
    endFrame: 1485,
    name: "$12T Erased",
    badgeText: "#2",
    metricText: "-$12 TRILLION",
    metricColor: "#38BDF8",
    contextTag: "DATA PACKETS > MONEY",
    heroExpression: "smug",
    heroProp: "chocolate",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 8,
    startFrame: 1485,
    endFrame: 1632,
    name: "Infinite Loop",
    badgeText: "#2",
    metricText: "NO SIGNAL",
    metricColor: "#FACC15",
    contextTag: "WI-FI GAYAB IN 3... 2... 1...",
    heroExpression: "skeptical",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
];

// Episode #3: What If Every Human Slept for 7 Days Straight?
const WHALTER_EP3_CUTS_EN: WhalterCutData[] = [
  {
    sceneIndex: 1,
    startFrame: 0,
    endFrame: 239,
    name: "The 7-Day Sleep Hook",
    badgeText: "#3",
    metricText: "12:00:00 AM",
    metricColor: "#EF4444",
    contextTag: "8 BILLION ASLEEP",
    heroExpression: "panic",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 2,
    startFrame: 239,
    endFrame: 443,
    name: "Empty Streets & Drifting Vehicles",
    badgeText: "#3",
    metricText: "0 DRIVERS AWAKE",
    metricColor: "#F59E0B",
    contextTag: "TRAINS & CARS HALTED",
    heroExpression: "wavy",
    heroProp: "none",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 3,
    startFrame: 443,
    endFrame: 625,
    name: "Airplanes Falling Silent",
    badgeText: "#3",
    metricText: "30,000 JETS",
    metricColor: "#EF4444",
    contextTag: "AUTOPILOT FUEL EMPTY",
    heroExpression: "panic",
    heroProp: "none",
    heroRole: "pilot",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 4,
    startFrame: 625,
    endFrame: 825,
    name: "Automated Nuclear Scram",
    badgeText: "#3",
    metricText: "AUTO SCRAM",
    metricColor: "#10B981",
    contextTag: "MELTDOWN PREVENTION",
    heroExpression: "skeptical",
    heroProp: "none",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 5,
    startFrame: 825,
    endFrame: 1085,
    name: "Total Continental Blackout",
    badgeText: "#3",
    metricText: "72 HOURS",
    metricColor: "#DC2626",
    contextTag: "GRID COLLAPSE",
    heroExpression: "panic",
    heroProp: "candle",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 6,
    startFrame: 1085,
    endFrame: 1308,
    name: "Animals Reclaim Cities",
    badgeText: "#3",
    metricText: "0% SMOG",
    metricColor: "#38BDF8",
    contextTag: "WILD ANIMALS IN CITIES",
    heroExpression: "shocked",
    heroProp: "none",
    heroRole: "civilian",
    companionExpression: "smug",
  },
  {
    sceneIndex: 7,
    startFrame: 1308,
    endFrame: 1509,
    name: "The Day 7 Awakening",
    badgeText: "#3",
    metricText: "DAY 7: 12:00 AM",
    metricColor: "#FACC15",
    contextTag: "8 BILLION WAKE UP",
    heroExpression: "wavy",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 8,
    startFrame: 1509,
    endFrame: 1721,
    name: "The Infinite Loop",
    badgeText: "#3",
    metricText: "SLEEPING IN 3... 2... 1...",
    metricColor: "#FACC15",
    contextTag: "REALITY GLUE",
    heroExpression: "skeptical",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
];

const WHALTER_EP3_CUTS_HI: WhalterCutData[] = [
  {
    sceneIndex: 1,
    startFrame: 0,
    endFrame: 321,
    name: "The 7-Day Sleep Hook",
    badgeText: "#3",
    metricText: "12:00:00 AM",
    metricColor: "#EF4444",
    contextTag: "800 CRORE LOG BEHOSH",
    heroExpression: "panic",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 2,
    startFrame: 321,
    endFrame: 541,
    name: "Empty Streets & Drifting Vehicles",
    badgeText: "#3",
    metricText: "0 DRIVERS AWAKE",
    metricColor: "#F59E0B",
    contextTag: "GAADIYAN TAKRANE LAGI",
    heroExpression: "wavy",
    heroProp: "none",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 3,
    startFrame: 541,
    endFrame: 771,
    name: "Airplanes Falling Silent",
    badgeText: "#3",
    metricText: "30,000 JETS",
    metricColor: "#EF4444",
    contextTag: "FUEL KHATAM • PLANES DOWN",
    heroExpression: "panic",
    heroProp: "none",
    heroRole: "pilot",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 4,
    startFrame: 771,
    endFrame: 990,
    name: "Automated Nuclear Scram",
    badgeText: "#3",
    metricText: "AUTO SCRAM",
    metricColor: "#10B981",
    contextTag: "MELTDOWN ROK LIYA",
    heroExpression: "skeptical",
    heroProp: "none",
    heroRole: "civilian",
    companionExpression: "panic",
  },
  {
    sceneIndex: 5,
    startFrame: 990,
    endFrame: 1186,
    name: "Total Continental Blackout",
    badgeText: "#3",
    metricText: "72 GHANTE",
    metricColor: "#DC2626",
    contextTag: "POORA CONTINENT ANDHERA",
    heroExpression: "panic",
    heroProp: "candle",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 6,
    startFrame: 1186,
    endFrame: 1408,
    name: "Animals Reclaim Cities",
    badgeText: "#3",
    metricText: "0% POLLUTION",
    metricColor: "#38BDF8",
    contextTag: "JUNGLE KE JANWAR SHAHAR MEIN",
    heroExpression: "shocked",
    heroProp: "none",
    heroRole: "civilian",
    companionExpression: "smug",
  },
  {
    sceneIndex: 7,
    startFrame: 1408,
    endFrame: 1650,
    name: "The Day 7 Awakening",
    badgeText: "#3",
    metricText: "DAY 7: 12:00 AM",
    metricColor: "#FACC15",
    contextTag: "800 CRORE LOG JAAGE",
    heroExpression: "wavy",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
  {
    sceneIndex: 8,
    startFrame: 1650,
    endFrame: 1881,
    name: "The Infinite Loop",
    badgeText: "#3",
    metricText: "SO GAYE IN 3... 2... 1...",
    metricColor: "#FACC15",
    contextTag: "INSAAN HI DUNIYA HAIN",
    heroExpression: "skeptical",
    heroProp: "phone",
    heroRole: "civilian",
    companionExpression: "shocked",
  },
];

export const Whalter1to1Explainer: React.FC<Whalter1to1ExplainerProps> = ({
  language = "en",
  episode = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isEp3 = episode === 3;
  const isHindi = language === "hi";
  const cuts = isEp3
    ? (isHindi ? WHALTER_EP3_CUTS_HI : WHALTER_EP3_CUTS_EN)
    : (isHindi ? WHALTER_EP2_CUTS_HI : WHALTER_EP2_CUTS_EN);
  const totalFrames = isEp3
    ? (isHindi ? 1881 : 1721)
    : (isHindi ? 1632 : 1580);
  const audioFile = isEp3
    ? (isHindi ? "voiceover_ep3_hi.mp3" : "voiceover_ep3_en.mp3")
    : (isHindi ? "voiceover_ep2_hi.mp3" : "voiceover_ep2_en.mp3");
  const subtitles: SubtitleWord[] = isEp3
    ? ((isHindi ? subtitlesEp3Hi : subtitlesEp3En) as SubtitleWord[])
    : ((isHindi ? subtitlesHi : subtitlesEn) as SubtitleWord[]);

  // Active cut determination
  let currentCut = 1;
  for (const c of cuts) {
    if (frame >= c.startFrame && frame < c.endFrame) {
      currentCut = c.sceneIndex;
      break;
    }
  }

  const currentTime = frame / fps;

  // Kinetic Subtitles Chunking: Max 2 words per chunk, zero bleed across pauses
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

  // Active chunk visibility: Clears during pauses, never bleeds into next sentence
  const activeChunk = useMemo(() => {
    return chunks.find((c, i) => {
      const nextChunk = chunks[i + 1];
      const visualTail = 0.15;
      const maxDisplayEnd = c.end + visualTail;
      const chunkEnd = nextChunk ? Math.min(maxDisplayEnd, nextChunk.start) : maxDisplayEnd;
      return currentTime >= c.start && currentTime < chunkEnd;
    });
  }, [chunks, currentTime]);

  // SFX cue frames aligned dynamically with scene cut entries
  const cut1 = cuts[0]?.startFrame ?? 0;
  const cut2 = cuts[1]?.startFrame ?? 150;
  const cut3 = cuts[2]?.startFrame ?? 305;
  const cut4 = cuts[3]?.startFrame ?? 500;
  const cut5 = cuts[4]?.startFrame ?? 735;
  const cut6 = cuts[5]?.startFrame ?? 925;
  const cut7 = cuts[6]?.startFrame ?? 1170;
  const cut8 = cuts[7]?.startFrame ?? 1465;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0F172A",
        fontFamily: "'Arial Black', Impact, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. Main High-Quality Voiceover */}
      <Audio src={staticFile(audioFile)} volume={1.0} />

      {/* 2. Deep Ambient Atmospheric Bed */}
      <Audio src={staticFile("ambient.mp3")} volume={0.08} loop />

      {/* 3. Whalter Synchronized SFX Matrix */}
      {/* Scene 1: Whoosh + Sub Boom */}
      <Sequence from={cut1} durationInFrames={25}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={cut1 + 12} durationInFrames={35}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>

      {/* Scene 2: Glitch Freeze */}
      <Sequence from={cut2} durationInFrames={25}>
        <Audio src={staticFile("sfx/glitch.mp3")} volume={0.4} />
      </Sequence>

      {/* Scene 3: Cockpit Radar Alarm */}
      <Sequence from={cut3} durationInFrames={35}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.35} />
      </Sequence>

      {/* Scene 4: ATM Crash Thud */}
      <Sequence from={cut4} durationInFrames={30}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.4} />
      </Sequence>

      {/* Scene 5: Supply Chain Alarm */}
      <Sequence from={cut5} durationInFrames={35}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.35} />
      </Sequence>

      {/* Scene 6: Blackout Sub-Drop */}
      <Sequence from={cut6} durationInFrames={40}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>

      {/* Scene 7: Wealth Blip */}
      <Sequence from={cut7} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.35} />
      </Sequence>

      {/* Scene 8: Loop Whip */}
      <Sequence from={cut8} durationInFrames={15}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.4} />
      </Sequence>

      {/* 4. Whalter 1:1 Stage Engine */}
      <WhalterStage
        currentCut={currentCut}
        cuts={cuts}
        totalFrames={totalFrames}
        subtitles={subtitles}
      />

      {/* 5. Whalter Signature Kinetic Bottom Captions (1-2 Words Clean) */}
      {activeChunk && (
        <div
          style={{
            position: "absolute",
            top: 1540,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 90,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 36,
              padding: "10px 32px",
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              borderRadius: 22,
              boxShadow: "0 10px 35px rgba(0,0,0,0.7)",
            }}
          >
            {activeChunk.words.map((w, idx) => {
              const isCurrent = currentTime >= w.start && currentTime < w.end;
              const wordSpring = spring({
                frame: Math.max(0, frame - Math.floor(w.start * fps)),
                fps,
                config: { damping: 10, stiffness: 280 },
              });

              return (
                <span
                  key={`${activeChunk.index}-${idx}-${w.word}`}
                  style={{
                    display: "inline-block",
                    margin: "0 10px",
                    fontSize: 66,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    color: isCurrent ? "#FACC15" : "#FFFFFF",
                    stroke: "#000000",
                    WebkitTextStroke: "6px #000000",
                    paintOrder: "stroke fill",
                    letterSpacing: "1px",
                    transform: isCurrent
                      ? `scale(${1 + wordSpring * 0.12})`
                      : "scale(1.0)",
                    textShadow: "0 6px 18px rgba(0,0,0,0.9)",
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
