import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import { Mascot } from "../../components/Mascot";
import { BackgroundMedia } from "../../components/BackgroundMedia";
import { SubtitleWord } from "../../types";

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
}

export const Scene1Hook: React.FC<SceneProps> = ({ subtitles = [], sceneData }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance Punch Zoom
  const zoomSpring = spring({
    frame,
    fps,
    config: { damping: 9, mass: 0.4, stiffness: 140 },
  });

  // Dynamic Exit transition whip-out on last 16 frames
  const exitWhip = interpolate(
    frame,
    [Math.max(0, durationInFrames - 18), durationInFrames],
    [0, -1200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const exitOpacity = interpolate(
    frame,
    [Math.max(0, durationInFrames - 14), durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const badgeText = sceneData?.badge || "🔎 DATA REALITY CHECK // 01";
  const headline = sceneData?.headline || "WHERE DOES THE INTERNET ACTUALLY LIVE?";
  const mascotPose = sceneData?.mascotEmotion || "pointing";

  // Animated Earth wireframe rotation and pulse
  const earthRot = interpolate(frame, [0, 274], [0, 180]);
  const earthPulse = 1 + Math.sin(frame * 0.08) * 0.04;

  // Network Nodes for the global mesh
  const networkNodes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 240 + ((i * 19) % 80);
      return {
        id: i,
        x: 540 + Math.cos(angle) * radius,
        y: 680 + Math.sin(angle) * (radius * 0.75),
        size: (i % 3) * 3 + 5,
      };
    });
  }, []);

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${exitWhip}px) scale(${zoomSpring})`,
        opacity: exitOpacity,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#020617",
      }}
    >
      <Audio src={staticFile("sfx/thud.mp3")} volume={0.85} />

      {/* Layer 0: Dynamic Background Particle Texture & Vignette */}
      <BackgroundMedia themeColor="#38bdf8" opacity={0.32} />

      {/* --- FULL-BLEED NETWORK MESH BACKGROUND --- */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.75 }}
      >
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Bioluminescent Atmosphere */}
        <circle cx={540} cy={680} r={340} fill="url(#earthGlow)" />

        {/* Global Network Interconnect Lines */}
        {networkNodes.map((n, i) => {
          const next = networkNodes[(i + 5) % networkNodes.length];
          const linePulse = 0.2 + Math.sin(frame * 0.1 + i) * 0.15;
          return (
            <line
              key={`line-${i}`}
              x1={n.x}
              y1={n.y}
              x2={next.x}
              y2={next.y}
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="8 6"
              opacity={linePulse}
            />
          );
        })}

        {/* Network Nodes */}
        {networkNodes.map((n) => (
          <g key={`node-${n.id}`}>
            {/* Soft Ambient Glow Halo */}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.size * 1.8}
              fill="#38bdf8"
              opacity={0.35}
            />
            {/* Core Node */}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.size}
              fill="#ffffff"
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.size * 2.5}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={1}
              opacity={0.4}
            />
          </g>
        ))}

        {/* Rotating 3D Wireframe Earth Sphere */}
        <g transform={`translate(540, 680) scale(${earthPulse}) rotate(${earthRot}) translate(-540, -680)`}>
          {/* Outer Ring Glow Halo */}
          <circle
            cx={540}
            cy={680}
            r={240}
            fill="none"
            stroke="#0284c7"
            strokeWidth={8}
            opacity={0.35}
          />
          <circle
            cx={540}
            cy={680}
            r={240}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={3}
          />
          {/* Latitude Lines */}
          <ellipse cx={540} cy={680} rx={240} ry={160} fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.6} />
          <ellipse cx={540} cy={680} rx={240} ry={80} fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.6} />
          <line x1={300} y1={680} x2={780} y2={680} stroke="#38bdf8" strokeWidth={2} opacity={0.8} />
          {/* Longitude Lines */}
          <ellipse cx={540} cy={680} rx={160} ry={240} fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.6} />
          <ellipse cx={540} cy={680} rx={80} ry={240} fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.6} />
          <line x1={540} y1={440} x2={540} y2={920} stroke="#38bdf8" strokeWidth={2} opacity={0.8} />
        </g>
      </svg>

      {/* --- TOP HOOK TYPOGRAPHY (FULL-BLEED BOLD) --- */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Sleek Pill Badge */}
        <div
          style={{
            padding: "10px 32px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #0369a1, #0284c7)",
            border: "2px solid #ffffff",
            boxShadow: "0 0 35px #38bdf8, 0 10px 20px rgba(0,0,0,0.6)",
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 950,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {badgeText}
        </div>

        <div style={{ fontSize: 44, fontWeight: 900, color: "#94a3b8", letterSpacing: 3, marginBottom: 8 }}>
          DO YOU REALLY KNOW?
        </div>

        <div
          style={{
            fontSize: 78,
            fontWeight: 950,
            color: "#ffffff",
            lineHeight: 1.08,
            textShadow: "0 0 50px #38bdf8, 0 0 100px #0284c7",
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            textTransform: "uppercase",
            maxWidth: 960,
          }}
        >
          {headline}
        </div>
      </div>

      {/* Floating Curious Question Mark reacting to opening hook */}
      <div
        style={{
          position: "absolute",
          top: 720,
          left: "calc(50% - 45px)",
          fontSize: 90,
          textShadow: "0 0 35px #38bdf8",
          transform: `translateY(${Math.sin(frame * 0.15) * 14}px) scale(${1 + Math.sin(frame * 0.2) * 0.12})`,
        }}
      >
        ❓
      </div>

      {/* --- MASCOT CENTER-STAGE & EXPRESSIVE --- */}
      <Mascot
        pose={mascotPose}
        subtitles={subtitles}
        themeColor="#38bdf8"
        accentColor="#f59e0b"
        scale={1.15}
        style={{
          left: "calc(50% - 170px)",
          bottom: 90,
          zIndex: 5,
        }}
      />
    </AbsoluteFill>
  );
};
