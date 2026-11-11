import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { Mascot } from "../../components/Mascot";
import { BackgroundMedia } from "../../components/BackgroundMedia";
import { SubtitleWord } from "../../types";

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
}

export const Scene3Reality: React.FC<SceneProps> = ({ subtitles = [], sceneData }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 120 },
  });

  // Dynamic Exit transition whip-out
  const exitWhip = interpolate(
    frame,
    [Math.max(0, durationInFrames - 16), durationInFrames],
    [0, -1200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const exitOpacity = interpolate(
    frame,
    [Math.max(0, durationInFrames - 12), durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const statNumStr = sceneData?.statHighlight?.number || "99%";
  const targetCounter = parseInt(statNumStr.replace(/\D/g, "")) || 99;
  const statUnit = statNumStr.replace(/[0-9]/g, "") || "%";
  const statLabel = sceneData?.statHighlight?.label || "UNDERSEA FIBER-OPTIC CABLES";
  const badgeText = sceneData?.badge || "⚡ THE PHYSICAL TRUTH // 03";
  const subMetrics = sceneData?.subMetrics || ["1.4 MILLION KM", "SPEED OF LIGHT"];
  const mascotPose = sceneData?.mascotEmotion || "scanning";

  // Rapid 0 -> Target Counter with strict clamping
  const realityCounter = Math.max(
    0,
    Math.round(
      interpolate(frame, [15, 65], [0, targetCounter], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Fiber optic data pulse offsets (animating at -frame * 12)
  const pulseOffset = -frame * 12;

  // Bioluminescent ocean bubbles / floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      x: ((i * 37 + 19) % 94) + 3,
      startY: (i * 61 + 23) % 100,
      size: (i % 4) * 2 + 3,
      speed: 0.3 + (i % 3) * 0.25,
      glow: (i % 2 === 0 ? "#38bdf8" : "#06b6d4"),
    }));
  }, []);

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${exitWhip}px) scale(${entrySpring})`,
        opacity: exitOpacity,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#020617",
      }}
    >
      <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.8} />
      <Audio src={staticFile("sfx/blip.mp3")} volume={0.65} />

      {/* Counter Riser Audio Sweep during 0 -> 99% Interpolation */}
      <Sequence from={10} durationInFrames={60}>
        <Audio src={staticFile("sfx/riser.mp3")} volume={0.5} />
      </Sequence>

      {/* Layer 0: Dynamic Abyssal Ocean Noise Texture & Vignette */}
      <BackgroundMedia themeColor="#06b6d4" opacity={0.3} />

      {/* Full-Bleed Abyssal Ocean Gradient Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, rgba(6, 182, 212, 0.22) 0%, rgba(2, 6, 23, 0.95) 70%, #020617 100%)",
        }}
      />

      {/* Bioluminescent rising particles / plankton */}
      {particles.map((p, i) => {
        const currentY = ((p.startY * 19.2 - frame * p.speed * 4) % 1920 + 1920) % 1920;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: currentY,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.glow,
              boxShadow: `0 0 ${p.size * 3}px ${p.glow}`,
              opacity: 0.45 + Math.sin(frame * 0.1 + i) * 0.25,
            }}
          />
        );
      })}

      {/* Full-Bleed Undersea Fiber Optic Cable Highway (SVG) */}
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <defs>
          <linearGradient id="oceanCableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
          </linearGradient>
          <filter id="neonCableGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cable 1: Upper Swelling Wave */}
        <path
          d="M -100 480 C 250 420, 480 620, 800 490 S 1050 460, 1180 540"
          fill="none"
          stroke="#0c4a6e"
          strokeWidth={16}
          opacity={0.5}
        />
        <path
          d="M -100 480 C 250 420, 480 620, 800 490 S 1050 460, 1180 540"
          fill="none"
          stroke="#38bdf8"
          strokeWidth={6}
          strokeDasharray="20 40"
          strokeDashoffset={pulseOffset}
          filter="url(#neonCableGlow)"
        />

        {/* Cable 2: Main Center Data Spine */}
        <path
          d="M -80 780 C 300 700, 520 920, 820 760 S 1060 840, 1180 810"
          fill="none"
          stroke="#0369a1"
          strokeWidth={22}
          opacity={0.65}
        />
        <path
          d="M -80 780 C 300 700, 520 920, 820 760 S 1060 840, 1180 810"
          fill="none"
          stroke="#06b6d4"
          strokeWidth={10}
          opacity={0.8}
        />
        <path
          d="M -80 780 C 300 700, 520 920, 820 760 S 1060 840, 1180 810"
          fill="none"
          stroke="#ffffff"
          strokeWidth={6}
          strokeDasharray="20 40"
          strokeDashoffset={pulseOffset}
          filter="url(#neonCableGlow)"
        />

        {/* Cable 3: Lower Seabed Highway */}
        <path
          d="M -60 1060 C 200 1140, 540 980, 850 1120 S 1040 1080, 1160 1150"
          fill="none"
          stroke="#0284c7"
          strokeWidth={18}
          opacity={0.55}
        />
        <path
          d="M -60 1060 C 200 1140, 540 980, 850 1120 S 1040 1080, 1160 1150"
          fill="none"
          stroke="#67e8f9"
          strokeWidth={7}
          strokeDasharray="20 40"
          strokeDashoffset={pulseOffset}
          filter="url(#neonCableGlow)"
        />

        {/* Direct Conduit Feeding into the 99% Meter */}
        <path
          d="M 540 820 C 540 700, 540 600, 540 480"
          fill="none"
          stroke="#0369a1"
          strokeWidth={14}
          opacity={0.6}
        />
        <path
          d="M 540 820 C 540 700, 540 600, 540 480"
          fill="none"
          stroke="#38bdf8"
          strokeWidth={8}
          strokeDasharray="20 40"
          strokeDashoffset={pulseOffset}
          filter="url(#neonCableGlow)"
        />

        {/* Seabed Repeater / Amplification Junction Node */}
        <g transform="translate(540, 820)">
          <circle r={36} fill="#082f49" stroke="#38bdf8" strokeWidth={4} />
          <circle
            r={18}
            fill="#38bdf8"
            opacity={0.8 + Math.sin(frame * 0.2) * 0.2}
            filter="url(#neonCableGlow)"
          />
          {/* Signal rings emanating */}
          <circle
            r={40 + ((frame * 2) % 45)}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={2}
            opacity={1 - ((frame * 2) % 45) / 45}
          />
        </g>
      </svg>

      {/* Top Header Pill Badge */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "12px 36px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #0284c7, #06b6d4)",
            border: "2px solid #ffffff",
            boxShadow: "0 0 50px rgba(6, 182, 212, 0.8), 0 10px 30px rgba(0,0,0,0.8)",
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 950,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {badgeText}
        </div>
      </div>

      {/* Massive Hero Stat Display (Dominating Center Third) */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Giant Number Counter */}
        <div
          style={{
            fontSize: 200,
            fontWeight: 950,
            color: "#ffffff",
            fontFamily: "'Impact', 'Montserrat', sans-serif",
            letterSpacing: -4,
            lineHeight: 0.9,
            textShadow:
              "0 0 40px #06b6d4, 0 0 80px #0284c7, 0 0 140px rgba(6, 182, 212, 0.9), 0 10px 20px rgba(0,0,0,0.9)",
          }}
        >
          {realityCounter}{statUnit}
        </div>

        {/* Hero Title */}
        <div
          style={{
            marginTop: 15,
            fontSize: 38,
            fontWeight: 950,
            color: "#38bdf8",
            letterSpacing: 4,
            textTransform: "uppercase",
            textShadow: "0 0 25px rgba(56, 189, 248, 0.9)",
            padding: "0 60px",
          }}
        >
          {statLabel}
        </div>

        {/* Stat Highlights Bar */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 16,
            padding: "0 40px",
          }}
        >
          {subMetrics.map((m: string, i: number) => (
            <div
              key={i}
              style={{
                padding: "10px 22px",
                borderRadius: 16,
                background: "rgba(12, 74, 110, 0.65)",
                border: "1.5px solid rgba(56, 189, 248, 0.5)",
                color: "#e0f2fe",
                fontSize: 20,
                fontWeight: 800,
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* --- INTERACTIVE MASCOT LASER SCANNER BEAM --- */}
      {/* Physically connects Mascot visor to the undersea fiber optic cable */}
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 8,
        }}
      >
        <defs>
          <filter id="mascotLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Primary Laser Beam */}
        <line
          x1={860}
          y1={1620}
          x2={640 + Math.sin(frame * 0.1) * 200}
          y2={1080 + Math.cos(frame * 0.1) * 35}
          stroke="#06b6d4"
          strokeWidth={4.5}
          opacity={0.85}
          filter="url(#mascotLaserGlow)"
        />
        <line
          x1={860}
          y1={1620}
          x2={640 + Math.sin(frame * 0.1) * 200}
          y2={1080 + Math.cos(frame * 0.1) * 35}
          stroke="#ffffff"
          strokeWidth={2}
          opacity={0.95}
        />

        {/* Laser Impact Reticle / Sensor Pulse on Cable */}
        <g
          transform={`translate(${640 + Math.sin(frame * 0.1) * 200}, ${
            1080 + Math.cos(frame * 0.1) * 35
          })`}
        >
          <circle
            r={18 + Math.sin(frame * 0.25) * 4}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            transform={`rotate(${frame * 4})`}
            filter="url(#mascotLaserGlow)"
          />
          <circle r={5} fill="#ffffff" filter="url(#mascotLaserGlow)" />
          {/* Spark discharge */}
          <circle
            r={24 + ((frame * 2) % 20)}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={1.5}
            opacity={1 - ((frame * 2) % 20) / 20}
          />
        </g>
      </svg>

      {/* Mascot: Anchored Bottom-Right in Analytical Scanner Mode */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          width: 340,
          height: 385,
          zIndex: 5,
        }}
      >
        <Mascot
          pose={mascotPose === "scanning" ? "analytical" : mascotPose}
          subtitles={subtitles}
        />
      </div>
    </AbsoluteFill>
  );
};
