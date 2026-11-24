import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";
import {
  ShortComposition,
  defaultProps,
  initialDurationInFrames,
} from "./Composition";
import { ShortCompositionProps } from "./types";
import currentShortData from "./data/current_short.json";
import { IcebergScene } from "./components/animations/IcebergScene";
import { InkDoodleExplainer } from "./scenes/InkDoodleExplainer";
import { InkDoodleGpsExplainer } from "./scenes/InkDoodleGpsExplainer";
import { AutonomousCompositionWrapper } from "./scenes/AutonomousCompositionWrapper";
import { DioramaCompositionWrapper } from "./scenes/DioramaCompositionWrapper";
import { WhalterExplainerWrapper } from "./scenes/WhalterExplainerWrapper";
import { CircleToonExplainerWrapper } from "./scenes/CircleToonExplainerWrapper";
import { PaperDollWhatIfExplainer } from "./scenes/PaperDollWhatIfExplainer";
import { Whalter1to1Explainer } from "./scenes/Whalter1to1Explainer";
import { CircleToonEp3Explainer } from "./scenes/CircleToonEp3Explainer";
import { MolassesShortExplainer } from "./scenes/MolassesShortExplainer";
import { TestMascotPreview } from "./scenes/TestMascotPreview";
import { Whalter3dDioramaStage } from "./components/whalter3d/Whalter3dDioramaStage";
import { OddlyToldTestShort } from "./scenes/OddlyToldTestShort";
import { AutonomousPopVectorExplainer } from "./scenes/AutonomousPopVectorExplainer";
import { PilotRigScene } from "./scenes/test_pilot/PilotRigScene";
import { TestNewGenreScene } from "./scenes/test_pilot/TestNewGenreScene";
import manifestEn from "./data/oddly_manifest_en.json";
import manifestHi from "./data/oddly_manifest_hi.json";
import fsMetadata from "../public/metadata.json";

const activeTitle = (currentShortData as any)?.videoTitle || "DATA DETECTIVE";

const calculateMetadata: CalculateMetadataFunction<ShortCompositionProps> = ({
  props,
}) => {
  const words = props.subtitles || defaultProps.subtitles || [];
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    // Seamless Infinite Loop: 0.06s cushion ensures loop without dead silence
    const dynamicFrames = Math.ceil((lastWord.end + 0.06) * 30);
    return {
      durationInFrames: Math.max(60, dynamicFrames),
      props: {
        ...defaultProps,
        ...props,
      },
    };
  }
  return {
    durationInFrames: initialDurationInFrames,
    props: {
      ...defaultProps,
      ...props,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Universal Composition */}
      <Composition
        id="ShortVideo"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />

      {/* Genre A: Style & Gear Advisor */}
      <Composition
        id="StyleAdvisor"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "style-advisor",
          hookBadge: activeTitle,
        }}
        calculateMetadata={calculateMetadata}
      />

      {/* Genre B: Data Detective (Cinematic B-Roll) */}
      <Composition
        id="DataDetective"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "data-detective",
          hookBadge: activeTitle,
        }}
        calculateMetadata={calculateMetadata}
      />

      {/* Genre C: 2D Cartoon Explainer (Kurzgesagt Style) */}
      <Composition
        id="KurzgesagtExplainer"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "kurzgesagt-explainer",
          hookBadge: activeTitle,
        }}
        calculateMetadata={calculateMetadata}
      />

      {/* Autonomous Production Pipeline: DailyShort */}
      <Composition
        id="DailyShort"
        component={ShortComposition}
        durationInFrames={initialDurationInFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          ...defaultProps,
          genre: "data-detective",
          hookBadge: activeTitle,
        }}
        calculateMetadata={calculateMetadata}
      />

      {/* Master Genre: High-Quality Ink Doodle Explainer */}
      <Composition
        id="InkDoodleExplainer"
        component={InkDoodleExplainer}
        durationInFrames={1186}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Fresh Episode 2: GPS Circle Spoofing Ink Doodle Explainer */}
      <Composition
        id="InkDoodleGpsExplainer"
        component={InkDoodleGpsExplainer}
        durationInFrames={1192}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Autonomous Limitless Ink Explainer */}
      <Composition
        id="AutonomousInkExplainer"
        component={AutonomousCompositionWrapper}
        durationInFrames={(fsMetadata as any)?.totalFrames || 1190}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 3D Motion Graphics Explainer: IcebergScene */}
      <Composition
        id="IcebergExplainer"
        component={IcebergScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          topLabel: "WHAT YOU SEE",
          topSubtext: "A remote concrete door in the snow",
          bottomLabel: "THE HIDDEN TRUTH",
          bottomSubtext: "1.3M seed varieties • 400ft permafrost vault",
        }}
      />
      {/* Mascot Anchor Preview */}
      <Composition
        id="MascotPreview"
        component={TestMascotPreview}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 3D Diorama Stage: The 10/10 Viral Tech Prototype */}
      <Composition
        id="DioramaExplainer"
        component={DioramaCompositionWrapper}
        durationInFrames={(fsMetadata as any)?.totalFrames || 1703}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Whalter-Style 2D Kinetic Character & Prop Engine */}
      <Composition
        id="WhalterExplainer"
        component={WhalterExplainerWrapper}
        durationInFrames={(fsMetadata as any)?.totalFrames || 1703}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Circle-Head "What-If" 2D Cartoon Animation Engine (Walter 1:1) */}
      <Composition
        id="CircleToonExplainer"
        component={CircleToonExplainerWrapper}
        durationInFrames={1233}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 3D Paper-Doll Shadow Diorama Stage (Three.js WebGL with Soft Shadows) */}
      <Composition
        id="PaperDollWhatIf"
        component={PaperDollWhatIfExplainer}
        durationInFrames={1416}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* True Whalter 1:1 What-If Cartoon Engine - English Master (@realwhalter Pixel-Perfect) */}
      <Composition
        id="WhalterTrue"
        component={Whalter1to1Explainer}
        durationInFrames={1580}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "en" as const }}
      />

      {/* True Whalter 1:1 What-If Cartoon Engine - Hindi Master with Hinglish Subtitles */}
      <Composition
        id="WhalterTrueHindi"
        component={Whalter1to1Explainer}
        durationInFrames={1632}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "hi" as const }}
      />

      {/* Episode #3 English Master: What If Every Human Slept for 7 Days Straight? */}
      <Composition
        id="CircleToonEp3En"
        component={CircleToonEp3Explainer}
        durationInFrames={1721}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "en" as const }}
      />
      <Composition
        id="WhalterEp3En"
        component={CircleToonEp3Explainer}
        durationInFrames={1721}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "en" as const }}
      />

      {/* Episode #3 Hindi Master: 7 Dino Ke Liye Sabhi Insaan So Gaye */}
      <Composition
        id="CircleToonEp3Hi"
        component={CircleToonEp3Explainer}
        durationInFrames={1881}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "hi" as const }}
      />
      <Composition
        id="WhalterEp3Hi"
        component={CircleToonEp3Explainer}
        durationInFrames={1881}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "hi" as const }}
      />

      {/* True Three.js 3D Diorama Stage Test: Bright Full-Bleed (Zero Black Void) */}
      <Composition
        id="Whalter3dTest"
        component={Whalter3dDioramaStage}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Absurd True History: The Great Boston Molasses Tsunami of 1919 (English Master) */}
      <Composition
        id="MolassesShortEn"
        component={MolassesShortExplainer}
        durationInFrames={2375}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "en" as const }}
      />

      {/* Absurd True History: The Great Boston Molasses Tsunami of 1919 (Hindi Master) */}
      <Composition
        id="MolassesShortHi"
        component={MolassesShortExplainer}
        durationInFrames={2600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: "hi" as const }}
      />

      {/* Modular 2D Vector Puppet Pilot Preview */}
      <Composition
        id="PilotRigPreview"
        component={PilotRigScene}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 2D Autonomous Pop-Vector Engine (AI Visual Coder + CAD Constraints - EN) */}
      <Composition
        id="OddlyToldShortEn"
        component={AutonomousPopVectorExplainer}
        durationInFrames={manifestEn.totalFrames || 941}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: 'en' as const }}
      />

      {/* 2D Autonomous Pop-Vector Engine (AI Visual Coder + CAD Constraints - HI) */}
      <Composition
        id="OddlyToldShortHi"
        component={AutonomousPopVectorExplainer}
        durationInFrames={manifestHi.totalFrames || 1221}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: 'hi' as const }}
      />

      {/* Studio Hand-Crafted Primitives (Reference / Fallback) */}
      <Composition
        id="OddlyToldStudioEn"
        component={OddlyToldTestShort}
        durationInFrames={manifestEn.totalFrames || 941}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: 'en' as const }}
      />
      <Composition
        id="OddlyToldStudioHi"
        component={OddlyToldTestShort}
        durationInFrames={manifestHi.totalFrames || 1221}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: 'hi' as const }}
      />

      {/* Legacy / Direct Preview Alias */}
      <Composition
        id="OddlyToldTest"
        component={OddlyToldTestShort}
        durationInFrames={manifestEn.totalFrames || 941}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: 'en' as const }}
      />

      {/* 2D Autonomous Pop-Vector Engine (True AI Visual Coder + Vision Watchdog with Eyes) */}
      <Composition
        id="AutonomousPopVector"
        component={AutonomousPopVectorExplainer}
        durationInFrames={manifestEn.totalFrames || 1120}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: 'en' as const }}
      />
      <Composition
        id="AutonomousPopVectorHi"
        component={AutonomousPopVectorExplainer}
        durationInFrames={manifestHi.totalFrames || 1220}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ language: 'hi' as const }}
      />
      {/* 4-Slot Daily Genre & Rig Verification Composition */}
      <Composition
        id="TestNewGenre"
        component={TestNewGenreScene}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
