import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import { GlassCard } from "../components/depth/GlassCard";
import { Mascot } from "../components/Mascot";
import { SubtitleWord } from "../types";

export interface StyleAdvisorData {
  hookTitle: string;
  avoidItem: {
    title: string;
    flaw: string;
    price: string;
  };
  upgradeItem: {
    title: string;
    advantage: string;
    rating: string;
  };
  verdict: string;
}

interface StyleAdvisorProps {
  data?: StyleAdvisorData;
  subtitles?: SubtitleWord[];
}

export const StyleAdvisor: React.FC<StyleAdvisorProps> = ({
  data = {
    hookTitle: "STOP BUYING CHEAP DESK CHAIRS! 🛑💺",
    avoidItem: {
      title: "Racer Gaming Chairs",
      flaw: "Traps heat & zero lumbar support",
      price: "$180 TRAP",
    },
    upgradeItem: {
      title: "Ergonomic Mesh Chair",
      advantage: "Full lumbar contour + breathable airflow",
      rating: "PRO LEVEL ⭐⭐⭐⭐⭐",
    },
    verdict: "Save your spine! Invest in mesh ergonomics.",
  },
  subtitles = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dynamic Mascot Pose based on timeline
  // 0 - 30%: Facepalm at the mistake
  // 30% - 75%: Pointing up at the upgrade card
  // 75% - 100%: Idle / Victory
  const progress = frame / durationInFrames;
  const mascotPose = progress < 0.35 ? "facepalm" : progress < 0.8 ? "pointing" : "idle";

  // Card Springs
  const avoidSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 100 },
  });

  const upgradeSpring = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 100 },
  });

  const verdictSpring = spring({
    frame: Math.max(0, frame - 180),
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 110 },
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {/* Sound Effects Timeline */}
      <Sequence from={0} durationInFrames={30}>
        <Audio src={staticFile("sfx/thud.mp3")} volume={0.8} />
      </Sequence>
      <Sequence from={15} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.6} />
      </Sequence>
      <Sequence from={90} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.7} />
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.8} />
      </Sequence>
      <Sequence from={180} durationInFrames={20}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.9} />
      </Sequence>

      {/* Hero Visual Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 220,
          gap: 20,
        }}
      >
        {/* Hook Alert Badge */}
        <div
          style={{
            padding: "12px 34px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #dc2626, #ef4444)",
            border: "2px solid #ffffff",
            boxShadow: "0 0 40px rgba(239, 68, 68, 0.8), 0 10px 25px rgba(0,0,0,0.6)",
            color: "#ffffff",
            fontSize: 26,
            fontWeight: 950,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          {data.hookTitle}
        </div>

        {/* 1. AVOID THIS CARD (Red Theme) */}
        <div
          style={{
            transform: `scale(${avoidSpring}) translateX(${interpolate(avoidSpring, [0, 1], [-80, 0])}px)`,
            opacity: avoidSpring,
          }}
        >
          <GlassCard width={840} color="#ef4444">
            <div
              style={{
                padding: "24px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(239, 68, 68, 0.08)",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: 8,
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 950,
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  ❌ AVOID THIS
                </div>
                <div style={{ fontSize: 32, fontWeight: 950, color: "#ffffff" }}>
                  {data.avoidItem.title}
                </div>
                <div style={{ fontSize: 20, color: "#f87171", fontWeight: 700, marginTop: 4 }}>
                  ⚠️ {data.avoidItem.flaw}
                </div>
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 950,
                  color: "#ef4444",
                  border: "2px solid #ef4444",
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                {data.avoidItem.price}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 2. UPGRADE TO CARD (Cyan / Gold Theme) */}
        <div
          style={{
            transform: `scale(${upgradeSpring}) translateX(${interpolate(upgradeSpring, [0, 1], [80, 0])}px)`,
            opacity: upgradeSpring,
          }}
        >
          <GlassCard width={840} color="#22c55e">
            <div
              style={{
                padding: "26px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(34, 197, 94, 0.08)",
                border: "2px solid #22c55e",
                borderRadius: 28,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: 8,
                    background: "#22c55e",
                    color: "#000000",
                    fontSize: 16,
                    fontWeight: 950,
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  ✅ UPGRADE TO
                </div>
                <div style={{ fontSize: 34, fontWeight: 950, color: "#ffffff" }}>
                  {data.upgradeItem.title}
                </div>
                <div style={{ fontSize: 20, color: "#4ade80", fontWeight: 700, marginTop: 4 }}>
                  ✨ {data.upgradeItem.advantage}
                </div>
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 950,
                  color: "#22c55e",
                  background: "rgba(34, 197, 94, 0.2)",
                  padding: "10px 18px",
                  borderRadius: 14,
                  border: "1px solid #22c55e",
                }}
              >
                {data.upgradeItem.rating}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 3. PRO VERDICT */}
        <div
          style={{
            transform: `scale(${verdictSpring})`,
            opacity: verdictSpring,
            width: 840,
            padding: "18px 28px",
            borderRadius: 20,
            background: "rgba(15, 23, 42, 0.9)",
            border: "1.5px solid #38bdf8",
            boxShadow: "0 0 35px rgba(56, 189, 248, 0.4)",
            textAlign: "center",
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          💡 <span style={{ color: "#38bdf8" }}>PRO VERDICT:</span> {data.verdict}
        </div>
      </div>

      {/* Reactive Mascot in Bottom-Left */}
      <Mascot
        pose={mascotPose}
        subtitles={subtitles}
        themeColor="#ef4444"
        accentColor="#22c55e"
      />
    </AbsoluteFill>
  );
};

