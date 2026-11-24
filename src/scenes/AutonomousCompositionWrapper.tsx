import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { KineticSubtitles } from "../components/KineticSubtitles";
import defaultSubtitles from "../../public/subtitles.json";
import { SubtitleWord } from "../types";
import { AutonomousInkExplainer } from "./AutonomousInkExplainer";
import { InkMascot, InkMascotPose } from "../components/InkMascot";
import currentStoryData from "../data/current_limitless_phase1.json";

export const AutonomousCompositionWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = (currentStoryData as any)?.sceneCuts || [];
  const totalFrames = (currentStoryData as any)?.totalFrames || 1190;

  // Determine active beat and pose
  let currentCut = 1;
  for (const c of cuts) {
    if (frame >= c.startFrame && frame < c.endFrame) {
      currentCut = c.sceneIndex;
      break;
    }
  }

  // Reactive pose choreography matching the story arc:
  // Beat 1: "inspecting" (Laser scanning the initial mystery)
  // Beat 2: "pointing" (Directing focus to the mechanism)
  // Beat 3: "alert" (High tension / extreme physics)
  // Beat 4: "inspecting" (Scientific proof verification)
  // Beat 5: "eureka" (Resolution & celebratory thumbs-up)
  const poseMap: Record<number, InkMascotPose> = {
    1: "inspecting",
    2: "pointing",
    3: "alert",
    4: "inspecting",
    5: "eureka",
  };
  const activePose = poseMap[currentCut] || "inspecting";

  // Dynamic cut boundary frames for programmatic sound design
  const cut1 = cuts[0]?.startFrame ?? 0;
  const cut2 = cuts[1]?.startFrame ?? 240;
  const cut3 = cuts[2]?.startFrame ?? 480;
  const cut4 = cuts[3]?.startFrame ?? 720;
  const cut5 = cuts[4]?.startFrame ?? 960;
  const loopWhipFrame = Math.max(0, totalFrames - 12);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#faf7f0",
        fontFamily: "'Arial Black', -apple-system, sans-serif",
      }}
    >
      {/* 1. Main High-Quality Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} volume={1.0} />

      {/* 2. Subtle Ambient Tension / Lofi BGM */}
      <Audio src={staticFile("ambient.mp3")} volume={0.08} loop />

      {/* 3. Programmatic Tactile Foley / SFX on Micro-Events */}
      {/* Beat 1 Start: Instant Sensory Shock */}
      <Sequence from={cut1} durationInFrames={35}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={cut1} durationInFrames={30}>
        <Audio src={staticFile("sfx/glitch.mp3")} volume={0.25} />
      </Sequence>

      {/* Beat 2 Transition: Technical Mechanism */}
      <Sequence from={cut2} durationInFrames={30}>
        <Audio src={staticFile("sfx/paper_slide.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={cut2} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.2} />
      </Sequence>

      {/* Beat 3 Transition: Crisis / Physical Threat */}
      <Sequence from={cut3} durationInFrames={60}>
        <Audio src={staticFile("sfx/sub_boom.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={cut3} durationInFrames={45}>
        <Audio src={staticFile("sfx/alarm.mp3")} volume={0.2} />
      </Sequence>

      {/* Beat 4 Transition: Countermeasure Precision */}
      <Sequence from={cut4} durationInFrames={35}>
        <Audio src={staticFile("sfx/laser.mp3")} volume={0.25} />
      </Sequence>
      <Sequence from={cut4} durationInFrames={25}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.2} />
      </Sequence>

      {/* Beat 5 Transition: Takeaway */}
      <Sequence from={cut5} durationInFrames={30}>
        <Audio src={staticFile("sfx/blip.mp3")} volume={0.25} />
      </Sequence>

      {/* Loop Whip: Seamless Transition back to Frame 0 */}
      <Sequence from={loopWhipFrame} durationInFrames={18}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.3} />
      </Sequence>

      {/* 4. The Bespoke Hand-Drawn Ink Visuals */}
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10 }}>
        <AutonomousInkExplainer />
      </div>

      {/* 5. The Permanent Visual Anchor: Cipher the Ink Detective */}
      <svg
        viewBox="0 0 1080 1920"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 35,
          pointerEvents: "none",
        }}
      >
        <InkMascot
          pose={activePose}
          x={820}
          y={1360}
          scale={1.35}
        />
      </svg>

      {/* 6. Gold Standard Kinetic Subtitles */}
      <AbsoluteFill style={{ zIndex: 50, pointerEvents: "none" }}>
        <KineticSubtitles words={defaultSubtitles as SubtitleWord[]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
