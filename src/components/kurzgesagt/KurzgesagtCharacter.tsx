import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitleWord } from "../../types";

export type CharacterEmotion =
  | "idle"
  | "pointing"
  | "thinking"
  | "shocked"
  | "explaining"
  | "celebrating";

export type CharacterProp =
  | "none"
  | "magnifying_glass"
  | "thermometer"
  | "flask"
  | "microchip"
  | "chart";

interface KurzgesagtCharacterProps {
  emotion?: CharacterEmotion;
  prop?: CharacterProp;
  subtitles?: SubtitleWord[];
  scale?: number;
  flipX?: boolean;
  style?: React.CSSProperties;
}

export const KurzgesagtCharacter: React.FC<KurzgesagtCharacterProps> = ({
  emotion = "explaining",
  prop = "none",
  subtitles = [],
  scale = 1.0,
  flipX = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entry Bounce Spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.6 },
  });

  // 2. Squash & Stretch Idle Breathing
  const breath = Math.sin((frame / fps) * Math.PI * 2);
  const breathY = breath * 6;
  const scaleSquashY = 1.0 + breath * 0.025;
  const scaleSquashX = 1.0 - breath * 0.015;

  // 3. Eye Blinking (blinks naturally every ~100 frames for 4 frames)
  const blinkCycle = frame % 95;
  const isBlinking = blinkCycle >= 91 && blinkCycle <= 94;
  const eyeScaleY = isBlinking ? 0.08 : 1.0;

  // 4. Speech Synchronization (Audio-reactive beak flapping)
  const currentTimeSec = frame / fps;
  const isSpeaking = subtitles.some(
    (w) => currentTimeSec >= w.start && currentTimeSec <= w.end
  );

  // Dynamic beak flap height
  const talkFlap = Math.abs(Math.sin(frame * 0.75));
  const beakGap = isSpeaking ? talkFlap * 18 + 4 : emotion === "shocked" ? 20 : 2;

  // 5. Emotion-driven Angles & Poses
  let headTilt = 0;
  let leftWingAngle = 12;
  let rightWingAngle = -12;
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  let eyebrowLift = 0;
  let eyebrowSlant = 0;

  switch (emotion) {
    case "pointing":
      headTilt = -5;
      rightWingAngle = -65 + Math.sin(frame * 0.15) * 6; // pointing up at infographic
      pupilOffsetX = 4;
      pupilOffsetY = -4;
      eyebrowLift = -6;
      break;

    case "thinking":
      headTilt = 8 + Math.sin(frame * 0.05) * 3;
      rightWingAngle = -110; // wing to chin
      pupilOffsetX = 3;
      pupilOffsetY = -6; // looking up thoughtfully
      eyebrowSlant = 8;
      break;

    case "shocked":
      headTilt = Math.sin(frame * 1.8) * 4; // trembling shock
      leftWingAngle = -55 + Math.sin(frame * 1.2) * 8;
      rightWingAngle = 55 + Math.cos(frame * 1.2) * 8;
      pupilOffsetX = 0;
      pupilOffsetY = 0;
      eyebrowLift = -14; // eyebrows raised high
      break;

    case "celebrating":
      headTilt = Math.sin(frame * 0.2) * 6;
      leftWingAngle = -75 + Math.sin(frame * 0.3) * 10;
      rightWingAngle = 75 + Math.cos(frame * 0.3) * 10;
      eyebrowLift = -8;
      break;

    case "explaining":
    default:
      headTilt = Math.sin(frame * 0.1) * 3;
      rightWingAngle = -35 + Math.sin(frame * 0.25) * 12;
      leftWingAngle = 18 + Math.cos(frame * 0.2) * 6;
      pupilOffsetX = 2;
      pupilOffsetY = 0;
      break;
  }

  return (
    <div
      style={{
        position: "relative",
        width: 380,
        height: 480,
        transform: `
          scale(${entrySpring * scale})
          scaleX(${flipX ? -1 : 1})
          translateY(${breathY}px)
        `,
        transformOrigin: "bottom center",
        pointerEvents: "none",
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Kurzgesagt Vibrant Duck Colors */}
          <linearGradient id="duckBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" /> {/* Warm bright yellow */}
            <stop offset="70%" stopColor="#fbbf24" /> {/* Golden yellow */}
            <stop offset="100%" stopColor="#f59e0b" /> {/* Rich shadow yellow */}
          </linearGradient>

          <linearGradient id="duckBellyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          <linearGradient id="beakGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="scientistCoatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Soft Flat Shadow */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#020617" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* 1. Ground Shadow */}
        <ellipse
          cx="160"
          cy="380"
          rx={75 + breath * 4}
          ry={14 + breath * 2}
          fill="rgba(2, 6, 23, 0.4)"
          filter="blur(5px)"
        />

        {/* 2. Feet (Cute orange duck flippers) */}
        <g id="feet">
          {/* Left Foot */}
          <path
            d="M 125 365 Q 110 375 100 378 Q 120 382 135 376 Z"
            fill="#f97316"
            stroke="#c2410c"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Right Foot */}
          <path
            d="M 185 365 Q 200 375 210 378 Q 190 382 175 376 Z"
            fill="#f97316"
            stroke="#c2410c"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>

        {/* 3. Left Wing (Behind Body) */}
        <g transform={`rotate(${leftWingAngle} 85 240)`}>
          <path
            d="M 85 220 C 60 230 45 270 65 295 C 80 305 95 280 92 250 Z"
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>

        {/* 4. Main Body (Round, cuddly Kurzgesagt silhouette) */}
        <g transform={`scale(${scaleSquashX} ${scaleSquashY})`} style={{ transformOrigin: "160px 280px" }}>
          {/* Body Base */}
          <ellipse
            cx="160"
            cy="275"
            rx="68"
            ry="75"
            fill="url(#duckBodyGrad)"
            stroke="#d97706"
            strokeWidth="4"
          />

          {/* Cute Scientist Lab Coat */}
          <path
            d="M 105 250 C 105 320 120 345 160 345 C 200 345 215 320 215 250 C 190 265 130 265 105 250 Z"
            fill="url(#scientistCoatGrad)"
            stroke="#cbd5e1"
            strokeWidth="3"
          />
          {/* Coat Collar & Buttons */}
          <path d="M 145 255 L 160 280 L 175 255" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="160" cy="300" r="4" fill="#38bdf8" />
          <circle cx="160" cy="320" r="4" fill="#38bdf8" />

          {/* Chest Pen Pocket with Data Stylus */}
          <rect x="180" y="275" width="18" height="22" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <line x1="186" y1="270" x2="186" y2="280" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
          <line x1="192" y1="272" x2="192" y2="280" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* 5. Head Rig (Rotates slightly with emotion) */}
        <g transform={`rotate(${headTilt} 160 160)`}>
          {/* Head Sphere */}
          <circle
            cx="160"
            cy="150"
            r="62"
            fill="url(#duckBodyGrad)"
            stroke="#d97706"
            strokeWidth="4"
          />

          {/* Cute Duck Cheeks Blush */}
          <ellipse cx="118" cy="172" rx="10" ry="6" fill="#f87171" opacity="0.45" />
          <ellipse cx="202" cy="172" rx="10" ry="6" fill="#f87171" opacity="0.45" />

          {/* --- BEAK & MOUTH RIG (Audio Reactive) --- */}
          {/* Lower Beak (drops down when speaking) */}
          <g transform={`translate(0, ${beakGap})`}>
            <path
              d="M 132 178 Q 160 205 188 178 Z"
              fill="#ea580c"
              stroke="#c2410c"
              strokeWidth="3"
            />
            {/* Open mouth pink interior & tongue when speaking */}
            {beakGap > 6 && (
              <ellipse
                cx="160"
                cy="186"
                rx="14"
                ry={beakGap * 0.4}
                fill="#dc2626"
              />
            )}
            {beakGap > 6 && (
              <circle
                cx="160"
                cy="189"
                r="7"
                fill="#f87171"
              />
            )}
          </g>

          {/* Upper Beak */}
          <path
            d="M 125 174 Q 160 162 195 174 Q 160 190 125 174 Z"
            fill="url(#beakGrad)"
            stroke="#c2410c"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Cute Nostril Dots */}
          <circle cx="152" cy="170" r="2" fill="#c2410c" />
          <circle cx="168" cy="170" r="2" fill="#c2410c" />

          {/* --- EXPRESSIVE EYES --- */}
          {/* Left Eye */}
          <g transform={`translate(132, 138) scale(1, ${eyeScaleY})`}>
            {/* White Sclera */}
            <circle cx="0" cy="0" r="17" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
            {/* Dark Pupil with Catchlight */}
            <circle cx={pupilOffsetX} cy={pupilOffsetY} r="10" fill="#0f172a" />
            <circle cx={pupilOffsetX + 3} cy={pupilOffsetY - 3} r="3.5" fill="#ffffff" />
            <circle cx={pupilOffsetX - 2} cy={pupilOffsetY + 2} r="1.5" fill="#ffffff" />
          </g>

          {/* Right Eye */}
          <g transform={`translate(188, 138) scale(1, ${eyeScaleY})`}>
            {/* White Sclera */}
            <circle cx="0" cy="0" r="17" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
            {/* Dark Pupil with Catchlight */}
            <circle cx={pupilOffsetX} cy={pupilOffsetY} r="10" fill="#0f172a" />
            <circle cx={pupilOffsetX + 3} cy={pupilOffsetY - 3} r="3.5" fill="#ffffff" />
            <circle cx={pupilOffsetX - 2} cy={pupilOffsetY + 2} r="1.5" fill="#ffffff" />
          </g>

          {/* --- SCIENTIST GLASSES (Iconic Kurzgesagt Touch) --- */}
          <g id="glasses">
            <circle cx="132" cy="138" r="22" fill="none" stroke="#0284c7" strokeWidth="4" />
            <circle cx="188" cy="138" r="22" fill="none" stroke="#0284c7" strokeWidth="4" />
            <line x1="154" y1="138" x2="166" y2="138" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
            {/* Glass Lens Reflection Glint */}
            <line x1="120" y1="126" x2="136" y2="142" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="176" y1="126" x2="192" y2="142" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* --- EYEBROWS (Change with emotion) --- */}
          {/* Left Eyebrow */}
          <path
            d={`M 118 ${112 + eyebrowLift + eyebrowSlant} Q 132 ${106 + eyebrowLift} 146 ${114 + eyebrowLift - eyebrowSlant}`}
            fill="none"
            stroke="#92400e"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Right Eyebrow */}
          <path
            d={`M 174 ${114 + eyebrowLift - eyebrowSlant} Q 188 ${106 + eyebrowLift} 202 ${112 + eyebrowLift + eyebrowSlant}`}
            fill="none"
            stroke="#92400e"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Cute Little Feather Crest on Top */}
          <path
            d="M 160 90 C 150 70 170 65 164 88 C 175 75 185 82 170 92 Z"
            fill="#fbbf24"
            stroke="#d97706"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>

        {/* 6. Right Wing (Interactive / Pointing / Holding Prop) */}
        <g transform={`rotate(${rightWingAngle} 235 240)`}>
          <path
            d="M 235 220 C 260 230 275 270 255 295 C 240 305 225 280 228 250 Z"
            fill="url(#duckBodyGrad)"
            stroke="#d97706"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Prop Attached to Right Wing if specified */}
          {prop === "magnifying_glass" && (
            <g transform="translate(260, 270) rotate(45)">
              <circle cx="0" cy="0" r="22" fill="rgba(56, 189, 248, 0.25)" stroke="#0284c7" strokeWidth="5" />
              <rect x="-4" y="22" width="8" height="28" rx="4" fill="#92400e" stroke="#78350f" strokeWidth="2" />
              <line x1="-12" y1="-12" x2="4" y2="4" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            </g>
          )}

          {prop === "thermometer" && (
            <g transform="translate(260, 260) rotate(20)">
              <rect x="-8" y="-40" width="16" height="60" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
              <circle cx="0" cy="22" r="14" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" />
              <rect x="-4" y="-15" width="8" height="35" rx="4" fill="#ef4444" />
              {/* Steam puffs */}
              <circle cx="-12" cy="-45" r="4" fill="#cbd5e1" opacity="0.7" />
              <circle cx="8" cy="-55" r="6" fill="#cbd5e1" opacity="0.6" />
            </g>
          )}

          {prop === "flask" && (
            <g transform="translate(260, 270) rotate(-15)">
              <path
                d="M -8 -20 L 8 -20 L 8 -10 L 20 18 C 22 24 16 28 8 28 L -8 28 C -16 28 -22 24 -20 18 L -8 -10 Z"
                fill="rgba(56, 189, 248, 0.3)"
                stroke="#0284c7"
                strokeWidth="3"
              />
              <path d="M -16 12 L 16 12 L 12 24 L -12 24 Z" fill="#38bdf8" />
              <circle cx="-2" cy="18" r="3" fill="#ffffff" opacity="0.8" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

