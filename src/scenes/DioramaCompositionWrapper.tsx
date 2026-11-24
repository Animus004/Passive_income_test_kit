import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { DioramaTechStage } from "../components/animations/DioramaTechStage";
import { KineticSubtitles } from "../components/KineticSubtitles";
import defaultSubtitles from "../../public/subtitles.json";
import { SubtitleWord } from "../types";
import currentStoryData from "../data/current_limitless_phase1.json";

export const DioramaCompositionWrapper: React.FC = () => {
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

  // Exact beat transition frames for programmatic tactile SFX
  const cut1 = cuts[0]?.startFrame ?? 0;
  const cut2 = cuts[1]?.startFrame ?? 301;
  const cut3 = cuts[2]?.startFrame ?? 671;
  const cut4 = cuts[3]?.startFrame ?? 1102;
  const cut5 = cuts[4]?.startFrame ?? 1450;
  const loopWhipFrame = Math.max(0, totalFrames - 12);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0E17",
        fontFamily: "'Arial Black', -apple-system, sans-serif",
      }}
    >
      {/* 1. Main High-Quality Voiceover (ElevenLabs) */}
      <Audio src={staticFile("voiceover.mp3")} volume={1.0} />

      {/* 2. Deep Ambient Sci-Fi Music */}
      <Audio src={staticFile("ambient.mp3")} volume={0.09} loop />

      {/* 3. Programmatic Tactile Foley / SFX on Micro-Events */}
      {/* Beat 1 Start: Instant Sensory Shock */}
      <Sequence from={cut1} durationInFrames={35}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={cut1} durationInFrames={30}>
        <Audio src={staticFile("sfx/glitch.mp3")} volume={0.25} />
      </Sequence>

      {/* Beat 2 Transition: Molecular Macro Zoom */}
      <Sequence from={cut2} durationInFrames={30}>
        <Audio src={staticFile("sfx/paper_slide.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={cut2} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.2} />
      </Sequence>

      {/* Beat 3 Transition: Crisis / Packet Collapse */}
      <Sequence from={cut3} durationInFrames={60}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={cut3} durationInFrames={45}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.2} />
      </Sequence>

      {/* Beat 4 Transition: Mesh Network Routing */}
      <Sequence from={cut4} durationInFrames={35}>
        <Audio src={staticFile("sfx/laser.mp3")} volume={0.28} />
      </Sequence>
      <Sequence from={cut4} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.2} />
      </Sequence>

      {/* Beat 5 Transition: Eternal Challenge */}
      <Sequence from={cut5} durationInFrames={30}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.25} />
      </Sequence>

      {/* Loop Whip: Seamless Transition back to Frame 0 */}
      <Sequence from={loopWhipFrame} durationInFrames={18}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.3} />
      </Sequence>

      {/* 4. THE THREE.JS 3D DIORAMA STAGE */}
      <DioramaTechStage
        currentCut={currentCut}
        cut1={cut1}
        cut2={cut2}
        cut3={cut3}
        cut4={cut4}
        cut5={cut5}
        totalFrames={totalFrames}
        topRightTag={currentScene.topRightTag || "SIGNAL // ABSORPTION"}
        bottomLeftLabel={currentScene.bottomLeftLabel || "CONCRETE MATRIX"}
        bottomRightMetric={currentScene.bottomRightMetric || "POWER LOSS: -30dB/cm"}
      />

      {/* 5. TOP BRANDING HUD (Ultra Modern AAA Glass Header) */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(17, 24, 39, 0.75)",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 16,
          padding: "14px 24px",
          backdropFilter: "blur(12px)",
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#DC2626", boxShadow: "0 0 10px #DC2626" }} />
          <span style={{ color: "#ffffff", fontFamily: "monospace", fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>
            DATA DETECTIVE // CUT 0{currentCut}
          </span>
        </div>
        <span style={{ color: "#00F5FF", fontFamily: "monospace", fontSize: 18, fontWeight: 800 }}>
          {currentScene.topRightTag || "ISO // CAM_01"}
        </span>
      </div>

      {/* 6. Gold Standard Kinetic Subtitles */}
      <AbsoluteFill style={{ zIndex: 50, pointerEvents: "none" }}>
        <KineticSubtitles words={defaultSubtitles as SubtitleWord[]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
