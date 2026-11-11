import React from "react";
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SubtitleWord } from "../types";

export type MascotPose = "idle" | "pointing" | "facepalm" | "analytical" | "shocked";

interface MascotProps {
  pose?: MascotPose;
  subtitles?: SubtitleWord[];
  themeColor?: string;
  accentColor?: string;
  scale?: number;
  style?: React.CSSProperties;
}

export const Mascot: React.FC<MascotProps> = ({
  pose = "idle",
  subtitles = [],
  themeColor = "#38bdf8",
  accentColor = "#f59e0b",
  scale = 1.0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entry Bounce Spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 100 },
  });

  // 2. Sinusoidal Floating / Breathing motion: Math.sin((frame / fps) * Math.PI) * 4
  const floatY = Math.sin((frame / fps) * Math.PI * 1.5) * 6;

  // 3. Periodic Eye Blinks (every 105 frames for ~5 frames)
  const blinkCycle = frame % 105;
  const isBlinking = blinkCycle >= 100 && blinkCycle <= 104;
  const eyeScaleY = isBlinking ? 0.1 : 1.0;

  // 4. Audio-Reactive Mouth Movements synchronized to TTS active speech
  const currentTimeSec = frame / fps;
  const isSpeaking = subtitles.some(
    (w) => currentTimeSec >= w.start && currentTimeSec <= w.end
  );

  // When speaking, mouth oscillates rapidly; when quiet, gentle closed smile
  const mouthOpenHeight = isSpeaking
    ? Math.abs(Math.sin(frame * 0.9)) * 16 + 6
    : 4;
  const mouthWidth = isSpeaking ? 28 : 22;

  // 5. Expressive Gestures & Head Tilt based on Pose
  let headTilt = 0;
  let leftArmAngle = 15;
  let rightArmAngle = -15;

  if (pose === "pointing") {
    headTilt = -6;
    rightArmAngle = -65 + Math.sin(frame * 0.1) * 8; // pointing up at cards
  } else if (pose === "facepalm") {
    headTilt = 10;
    rightArmAngle = 110; // hand raised to head
  } else if (pose === "analytical") {
    headTilt = 8 * Math.sin(frame * 0.04);
    leftArmAngle = 35;
    rightArmAngle = -35;
  } else if (pose === "shocked") {
    headTilt = Math.sin(frame * 1.5) * 8; // tremor
    leftArmAngle = -45 + Math.sin(frame * 0.8) * 12;
    rightArmAngle = 45 + Math.cos(frame * 0.8) * 12;
  }

  // Scanner beam for analytical mode
  const scannerSweep = Math.sin(frame * 0.1) * 25;

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        bottom: 40,
        width: 340,
        height: 385,
        transform: `
          scale(${entrySpring * scale})
          translateY(${floatY}px)
        `,
        transformOrigin: "bottom center",
        pointerEvents: "none",
        zIndex: 5,
        filter: `drop-shadow(0 25px 40px rgba(0,0,0,0.95)) drop-shadow(0 0 35px ${themeColor}88)`,
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 220 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyber Helmet Gradients */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="visorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={themeColor} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>
        </defs>

        {/* --- SHADOW BASE --- */}
        <ellipse
          cx="110"
          cy="242"
          rx="55"
          ry="8"
          fill="rgba(0,0,0,0.6)"
          filter="blur(4px)"
        />

        {/* --- JETPACK / THRUSTER PULSE --- */}
        <ellipse
          cx="110"
          cy="226"
          rx={14 + Math.sin(frame * 0.3) * 3}
          ry={16 + Math.cos(frame * 0.3) * 4}
          fill={themeColor}
          opacity={0.7}
          filter="blur(6px)"
        />

        {/* --- LEFT ARM (Background / Left side) --- */}
        <g transform={`rotate(${leftArmAngle} 65 160)`}>
          <rect
            x="48"
            y="150"
            width="18"
            height="44"
            rx="9"
            fill="url(#bodyGrad)"
            stroke={themeColor}
            strokeWidth="2"
          />
          <circle cx="57" cy="198" r="10" fill={themeColor} opacity={0.9} />
        </g>

        {/* --- ROBOT TORSO --- */}
        <g transform="translate(0, 0)">
          {/* Main Body Chassis */}
          <rect
            x="70"
            y="135"
            width="80"
            height="85"
            rx="24"
            fill="url(#bodyGrad)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          {/* Core Power Arc Reactor */}
          <circle
            cx="110"
            cy="176"
            r="16"
            fill="rgba(15,23,42,0.9)"
            stroke={themeColor}
            strokeWidth="3"
          />
          <circle
            cx="110"
            cy="176"
            r="9"
            fill={themeColor}
            opacity={0.85 + Math.sin(frame * 0.1) * 0.15}
          />
          {/* Status Indicator Lights */}
          <circle cx="88" cy="150" r="3" fill="#22c55e" />
          <circle cx="98" cy="150" r="3" fill={accentColor} />
          <circle cx="108" cy="150" r="3" fill="#ef4444" />
        </g>

        {/* --- RIGHT ARM (Interactive / Posing Arm) --- */}
        <g transform={`rotate(${rightArmAngle} 155 160)`}>
          <rect
            x="154"
            y="150"
            width="18"
            height="50"
            rx="9"
            fill="url(#bodyGrad)"
            stroke={themeColor}
            strokeWidth="2"
          />
          <circle cx="163" cy="204" r="11" fill={accentColor} opacity={0.9} />
          {/* Pointing Laser fingertip indicator */}
          {pose === "pointing" && (
            <circle
              cx="163"
              cy="214"
              r="6"
              fill="#ffffff"
              filter="blur(1px)"
            />
          )}
        </g>

        {/* --- HEAD RIG (Rotates with headTilt) --- */}
        <g transform={`rotate(${headTilt} 110 95)`}>
          {/* Antennas */}
          <line
            x1="110"
            y1="40"
            x2="110"
            y2="18"
            stroke="url(#glowGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="110"
            cy="14"
            r="7"
            fill={themeColor}
            filter={`drop-shadow(0 0 6px ${themeColor})`}
          />

          {/* Outer Cyber Helmet */}
          <rect
            x="50"
            y="38"
            width="120"
            height="100"
            rx="32"
            fill="url(#bodyGrad)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2.5"
          />

          {/* OLED Screen Visor Face */}
          <rect
            x="60"
            y="52"
            width="100"
            height="72"
            rx="20"
            fill="url(#visorGrad)"
            stroke={themeColor}
            strokeWidth="2"
          />

          {/* Analytical Scanner Laser Sweep */}
          {pose === "analytical" && (
            <line
              x1="62"
              y1={88 + scannerSweep}
              x2="158"
              y2={88 + scannerSweep}
              stroke="#ef4444"
              strokeWidth="2"
              opacity={0.8}
              filter="blur(1px)"
            />
          )}

          {/* Facepalm Sweat Drop */}
          {pose === "facepalm" && (
            <path
              d="M 152 56 C 152 50 156 46 156 46 C 156 46 160 50 160 56 C 160 59 157 62 154 62 C 152 62 150 59 152 56 Z"
              fill="#38bdf8"
              opacity={0.9}
            />
          )}

          {/* --- EYES RIG (Periodic Blink with eyeScaleY) --- */}
          <g transform={`translate(110, 80) scale(1, ${eyeScaleY}) translate(-110, -80)`}>
            {/* Left Eye */}
            <rect
              x={pose === "shocked" ? 72 : 76}
              y={pose === "shocked" ? 68 : 72}
              width={pose === "shocked" ? 26 : 20}
              height={pose === "shocked" ? 24 : 18}
              rx={pose === "shocked" ? 12 : 9}
              fill={pose === "shocked" ? "#ef4444" : themeColor}
              filter={`drop-shadow(0 0 8px ${pose === "shocked" ? "#ef4444" : themeColor})`}
            />
            {/* Eye Highlight */}
            <circle cx="82" cy="76" r="3" fill="#ffffff" />

            {/* Right Eye */}
            <rect
              x={pose === "shocked" ? 122 : 124}
              y={pose === "shocked" ? 68 : 72}
              width={pose === "shocked" ? 26 : 20}
              height={pose === "shocked" ? 24 : 18}
              rx={pose === "shocked" ? 12 : 9}
              fill={pose === "shocked" ? "#ef4444" : themeColor}
              filter={`drop-shadow(0 0 8px ${pose === "shocked" ? "#ef4444" : themeColor})`}
            />
            {/* Eye Highlight */}
            <circle cx="130" cy="76" r="3" fill="#ffffff" />
          </g>

          {/* --- AUDIO-REACTIVE MOUTH --- */}
          <ellipse
            cx="110"
            cy="104"
            rx={mouthWidth / 2}
            ry={mouthOpenHeight / 2}
            fill={isSpeaking ? themeColor : "none"}
            stroke={themeColor}
            strokeWidth={isSpeaking ? 0 : 3}
            filter={`drop-shadow(0 0 6px ${themeColor})`}
          />
        </g>
      </svg>
    </div>
  );
};
