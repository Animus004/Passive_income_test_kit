import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { WhalterKineticEngine } from "../components/whalter/WhalterKineticEngine";
import { KineticSubtitles } from "../components/KineticSubtitles";
import defaultSubtitles from "../../public/subtitles.json";
import { SubtitleWord } from "../types";
import currentStoryData from "../data/current_limitless_phase1.json";

export const WhalterExplainerWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = (currentStoryData as any)?.sceneCuts || [];
  const totalFrames = (currentStoryData as any)?.totalFrames || 1703;

  // Determine active beat
  let currentCut = 1;
  let currentScene = (currentStoryData as any)?.scenes?.[0] || {};
  for (const c of cuts) {
    if (frame >= c.startFrame && frame < c.endFrame) {
      currentCut = c.sceneIndex;
      currentScene = (currentStoryData as any)?.scenes?.[c.sceneIndex - 1] || currentScene;
      break;
    }
  }

  // Exact beat transition frames
  const cut1 = cuts[0]?.startFrame ?? 0;
  const cut2 = cuts[1]?.startFrame ?? 301;
  const cut3 = cuts[2]?.startFrame ?? 671;
  const cut4 = cuts[3]?.startFrame ?? 1102;
  const cut5 = cuts[4]?.startFrame ?? 1450;
  const loopWhipFrame = Math.max(0, totalFrames - 12);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070B14",
        fontFamily: "'Arial Black', -apple-system, sans-serif",
      }}
    >
      {/* 1. Main High-Quality Voiceover (ElevenLabs) */}
      <Audio src={staticFile("voiceover.mp3")} volume={1.0} />

      {/* 2. Deep Ambient Sci-Fi Music */}
      <Audio src={staticFile("ambient.mp3")} volume={0.09} loop />

      {/* 3. Programmatic Foley / SFX on Micro-Events */}
      {/* Beat 1 Start: Instant Whoosh & Slab Slam */}
      <Sequence from={cut1} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={cut1 + 14} durationInFrames={40}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={cut1 + 18} durationInFrames={30}>
        <Audio src={staticFile("sfx/stamp_slam.mp3")} volume={0.4} />
      </Sequence>

      {/* Beat 2 Transition: Molecular Macro Zoom */}
      <Sequence from={cut2} durationInFrames={30}>
        <Audio src={staticFile("sfx/paper_slide.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={cut2} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.25} />
      </Sequence>

      {/* Beat 3 Transition: Crisis Shock & Alarm */}
      <Sequence from={cut3} durationInFrames={50}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={cut3} durationInFrames={45}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.25} />
      </Sequence>

      {/* Beat 4 Transition: Mesh Network Routing Laser */}
      <Sequence from={cut4} durationInFrames={35}>
        <Audio src={staticFile("sfx/laser.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={cut4 + 10} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.25} />
      </Sequence>

      {/* Beat 5 Transition: Eternal Challenge Loop */}
      <Sequence from={cut5} durationInFrames={30}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.25} />
      </Sequence>

      {/* Loop Whip: Seamless Transition back to Frame 0 */}
      <Sequence from={loopWhipFrame} durationInFrames={18}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>

      {/* 4. THE WHALTER-STYLE 2D KINETIC CHARACTER & PROP ENGINE */}
      <WhalterKineticEngine
        currentCut={currentCut}
        cut1={cut1}
        cut2={cut2}
        cut3={cut3}
        cut4={cut4}
        cut5={cut5}
        totalFrames={totalFrames}
        subtitles={defaultSubtitles as SubtitleWord[]}
        topRightTag={currentScene.topRightTag || "SIGNAL // ABSORPTION"}
        bottomLeftLabel={currentScene.bottomLeftLabel || "CONCRETE MATRIX"}
        bottomRightMetric={currentScene.bottomRightMetric || "POWER LOSS: -30dB/cm"}
      />

      {/* 5. Center-Lower Kinetic Word-by-Word Subtitles */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <KineticSubtitles
          words={defaultSubtitles as SubtitleWord[]}
        />
      </div>
    </AbsoluteFill>
  );
};
