import React from "react";
import {
  AbsoluteFill,
  Img,
  Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  Audio,
} from "remotion";
import { CutData } from "../data_detective/DynamicCut";
import { SubtitleWord } from "../../types";
import brollManifest from "../../data/broll_manifest.json";
import { PovDoodleScene } from "../../components/animations/PovDoodleScene";
import { IcebergScene } from "../../components/animations/IcebergScene";
import { TeardownScene } from "../../components/animations/TeardownScene";
import { SplitFlapScene } from "../../components/animations/SplitFlapScene";
import { StatChartScene } from "../../components/animations/StatChartScene";
import { TechTerminalScene } from "../../components/director/TechTerminalScene";
import { AlertThreatScene } from "../../components/director/AlertThreatScene";
import { FiberVsAirScene } from "../../components/animations/FiberVsAirScene";
import { CableSnapScene } from "../../components/animations/CableSnapScene";
import { EarthCurvatureRelayScene } from "../../components/animations/EarthCurvatureRelayScene";

interface KurzgesagtCutProps {
  cut: CutData;
  cutIndex: number;
  durationInFrames: number;
  subtitles?: SubtitleWord[];
  themeConfig?: {
    primary: string;
    accent: string;
  };
  totalCuts: number;
}

export const KurzgesagtCut: React.FC<KurzgesagtCutProps> = ({
  cut,
  cutIndex,
  durationInFrames,
  subtitles = [],
  themeConfig = { primary: "#38bdf8", accent: "#f59e0b" },
  totalCuts,
}) => {
  const frame = useCurrentFrame();

  // Dynamic Camera Drift (slow, playful zoom)
  const camScale = interpolate(frame, [0, durationInFrames], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });

  // Dynamic B-Roll Image Zoom inside the Holo-Portal
  const brollZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {
    extrapolateRight: "clamp",
  });

  const cutManifest = (brollManifest as any)?.cuts?.[`cut_${cut.cutId}`];
  const hasBroll = cutManifest?.file && (cutManifest.type === "video" || cutManifest.type === "image");
  
  const cutArchetype = (cut as any).animationArchetype;
  const isProceduralArchetype = [
    "pov_doodle",
    "iceberg",
    "the_iceberg",
    "teardown",
    "exploded_view",
    "split_flap",
    "globe_arcs",
    "stat_chart",
    "terminal_bloom",
    "alert_threat",
    "speedometer_gauge",
    "comparison_split",
  ].includes(cutArchetype);

  // If LLM selected a procedural motion graphic archetype, render it dynamically; otherwise render authentic B-roll
  const animType = isProceduralArchetype
    ? cutArchetype
    : (hasBroll ? "broll" : "stat_chart");
    
  const isVideo = animType === "broll" && cutManifest?.type === "video" && cutManifest?.file?.endsWith(".mp4");
  const mediaSrc = staticFile(cutManifest?.file || `broll/cut_${cut.cutId}.jpg`);

  // Dynamic Scene Props derived directly from LLM Script Directives:
  const povStamp = cut.statHighlight?.number
    ? `${cut.statHighlight.label || "METRIC"}: ${cut.statHighlight.number}`
    : ((cut as any).causeAndEffect?.finalState?.match(/'([^']+)'/)?.[1] || "SYSTEM ACTIVE");
  const povSub = (cut as any).visualMetaphor?.slice(0, 36)?.toUpperCase() || "CRITICAL INVESTIGATION";

  const icebergTop = "WHAT YOU SEE";
  const icebergTopSub = (cut as any).causeAndEffect?.initialState?.slice(0, 38) || "The visible surface infrastructure";
  const icebergBottom = "THE HIDDEN TRUTH";
  const icebergBottomSub = cut.statHighlight?.number
    ? `${cut.statHighlight.number} • ${cut.statHighlight.label}`
    : ((cut as any).causeAndEffect?.finalState?.slice(0, 42) || "Massive submerged subterranean network");

  const teardownTitle = (cut as any).visualMetaphor?.slice(0, 32)?.toUpperCase() || "CORE ARCHITECTURE";
  const teardownCount = cut.statHighlight?.number
    ? `${cut.statHighlight.number} ${cut.statHighlight.label}`
    : ((cut as any).tangibleItems?.length ? `${(cut as any).tangibleItems.length} HARDWARE MODULES` : "HIGH-PRECISION HARDWARE");

  const splitMetric = cut.statHighlight?.number || "0.001 ms";
  const splitLabel = cut.statHighlight?.label || "SYSTEM LATENCY";

  const globeTitle = (cut as any).causeAndEffect?.finalState?.match(/'([^']+)'/)?.[1]
    || ((cut as any).visualMetaphor?.slice(0, 32)?.toUpperCase() || "GLOBAL NETWORK ACTIVE");
  const globeSub = cut.statHighlight?.number
    ? `${cut.statHighlight.number} ${cut.statHighlight.label}`.toUpperCase()
    : "CONTINENTAL NODES SYNCHRONIZED";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070c26",
        overflow: "hidden",
        transform: `scale(${camScale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Cut Audio Pop SFX */}
      {cutIndex === 0 ? (
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.65} />
      ) : (
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.45} />
      )}

      {/* 1. Full-Bleed 1080x1920 Cinematic Bespoke Motion Graphics Scene */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {animType === "pov_doodle" ? (
          <PovDoodleScene
            stampText={povStamp}
            subtext={povSub}
            topic={cut.voiceoverText}
          />
        ) : animType === "iceberg" || animType === "the_iceberg" ? (
          <IcebergScene
            topLabel={icebergTop}
            topSubtext={icebergTopSub}
            bottomLabel={icebergBottom}
            bottomSubtext={icebergBottomSub}
            subterraneanTag={cut.statHighlight?.number ? `${cut.statHighlight.label} • ${cut.statHighlight.number}` : "DEEP INFRASTRUCTURE • 90% HIDDEN"}
          />
        ) : animType === "teardown" || animType === "exploded_view" ? (
          <TeardownScene
            title={teardownTitle}
            countLabel={teardownCount}
            topic={cut.voiceoverText}
          />
        ) : animType === "split_flap" ? (
          <SplitFlapScene
            targetTemp={splitMetric}
            metricLabel={splitLabel}
          />
        ) : animType === "globe_arcs" || animType === "earth_curvature" ? (
          <EarthCurvatureRelayScene
            title={globeTitle}
            subtext={globeSub}
          />
        ) : animType === "stat_chart" ? (
          <StatChartScene
            title="REWRITING GEOGRAPHY FOR SPEED"
            metricNumber="0.000003s"
            metricLabel="FINANCIAL ADVANTAGE"
            subtext="BILLIONS IN HIGH-FREQUENCY ARBITRAGE"
            color="#10b981"
          />
        ) : animType === "terminal_bloom" ? (
          <TechTerminalScene
            title={teardownTitle}
            codeSnippet={`execute_relay_stream(nodes=24, latency='0.001ms');`}
            status="RELAY LINK: ACTIVE & ENCRYPTED"
            color={themeConfig.primary}
          />
        ) : animType === "alert_threat" ? (
          <AlertThreatScene
            title="CRITICAL WARNING"
            subtitle={(cut as any).visualMetaphor?.slice(0, 36) || "INFRASTRUCTURE RISK"}
            alertText={cut.statHighlight?.number ? `${cut.statHighlight.label}: ${cut.statHighlight.number}` : "SYSTEM ANOMALY DETECTED"}
            color="#ef4444"
          />
        ) : animType === "speedometer_gauge" || animType === "cable_snap" ? (
          <CableSnapScene
            title="THE 3.0 MS SACRIFICE"
            metricLabel="SYSTEM LATENCY"
          />
        ) : animType === "comparison_split" ? (
          <FiberVsAirScene
            title="SPEED OF LIGHT SHOWDOWN"
            subtext="OPEN AIR MICROWAVE VS. SOLID GLASS FIBER"
          />
        ) : isVideo ? (
          <Video
            src={mediaSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${brollZoom})`,
              transformOrigin: "center center",
              display: "block",
            }}
            loop
            muted
          />
        ) : (
          <Img
            src={mediaSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${brollZoom})`,
              transformOrigin: "center center",
              display: "block",
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        )}

        {/* Cinematic Vignette Overlay (keeps subtitles and HUD crystal clear) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: animType !== "broll"
              ? "linear-gradient(180deg, rgba(3, 7, 18, 0.25) 0%, transparent 22%, transparent 55%, rgba(3, 7, 18, 0.88) 100%)"
              : "linear-gradient(180deg, rgba(3, 7, 18, 0.78) 0%, rgba(3, 7, 18, 0.18) 22%, rgba(3, 7, 18, 0.15) 55%, rgba(3, 7, 18, 0.88) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Subtle Tech Grid / Vignette Accents */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(3, 7, 18, 0.6) 100%)`,
            pointerEvents: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
