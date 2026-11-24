import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SubtitleWord } from "../../types";

export type WhalterPose = "shocked" | "thinking" | "alarm" | "eureka" | "explaining";

interface WhalterCharacterProps {
  pose?: WhalterPose;
  subtitles?: SubtitleWord[];
  scale?: number;
  flipX?: boolean;
  style?: React.CSSProperties;
}

export const WhalterCharacter: React.FC<WhalterCharacterProps> = ({
  pose = "explaining",
  subtitles = [],
  scale = 1.0,
  flipX = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Natural squash & stretch idle breathing (2-second loop)
  const breath = Math.sin((frame / fps) * Math.PI * 2);
  const breathY = breath * 6;
  const earWiggle = Math.sin(frame * 0.18) * 3;

  // 2. Snappy Entry Spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.6 },
  });

  // 3. Eye Blinking (blinks naturally every ~85 frames for 4 frames)
  const blinkCycle = frame % 85;
  const isBlinking = blinkCycle >= 81 && blinkCycle <= 84;
  const eyeScaleY = isBlinking ? 0.08 : 1.0;

  // 4. Audio-Reactive Mouth Flap (Whalter-style talking head)
  const currentTimeSec = frame / fps;
  const isSpeaking = subtitles.some(
    (w) => currentTimeSec >= w.start && currentTimeSec <= w.end
  );
  const talkFlap = Math.abs(Math.sin(frame * 0.85));
  const mouthHeight = isSpeaking ? talkFlap * 22 + 4 : pose === "shocked" ? 28 : 3;

  // 5. Pose Configuration & Dynamic Facial Expressions
  let headTilt = 0;
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  let eyebrowLift = 0;
  let eyebrowSlant = 0;
  let leftArmAngle = 0;
  let rightArmAngle = 0;
  let sweatOpacity = 0;
  let auraColor = "transparent";

  switch (pose) {
    case "shocked":
      headTilt = Math.sin(frame * 1.6) * 4; // trembling shock
      pupilOffsetX = 0;
      pupilOffsetY = 0;
      eyebrowLift = -18;
      sweatOpacity = 0.9;
      leftArmAngle = -65 + Math.sin(frame * 1.5) * 6; // hands to head
      rightArmAngle = 65 + Math.cos(frame * 1.5) * 6;
      auraColor = "rgba(239, 68, 68, 0.25)";
      break;

    case "thinking":
      headTilt = 7 + Math.sin(frame * 0.08) * 2;
      pupilOffsetX = 5;
      pupilOffsetY = -8; // looking up thoughtfully at water molecules
      eyebrowLift = -4;
      eyebrowSlant = 10;
      rightArmAngle = -115; // hand to chin
      leftArmAngle = 10;
      auraColor = "rgba(56, 189, 248, 0.2)";
      break;

    case "alarm":
      headTilt = Math.sin(frame * 2.2) * 5; // chaotic panic
      eyebrowLift = -15;
      eyebrowSlant = -8;
      sweatOpacity = 1.0;
      leftArmAngle = -85 + Math.sin(frame * 2.0) * 12; // flailing arms
      rightArmAngle = 85 + Math.cos(frame * 2.0) * 12;
      auraColor = "rgba(220, 38, 38, 0.35)";
      break;

    case "eureka":
      headTilt = -4;
      pupilOffsetX = 4;
      pupilOffsetY = -4;
      eyebrowLift = -10;
      rightArmAngle = -75 + Math.sin(frame * 0.2) * 5; // pointing proudly to mesh network
      leftArmAngle = 18;
      auraColor = "rgba(16, 185, 129, 0.3)";
      break;

    case "explaining":
    default:
      headTilt = Math.sin(frame * 0.12) * 3;
      pupilOffsetX = 2;
      pupilOffsetY = 0;
      rightArmAngle = -38 + Math.sin(frame * 0.25) * 10; // natural hand gestures
      leftArmAngle = 16 + Math.cos(frame * 0.2) * 6;
      auraColor = "rgba(0, 245, 255, 0.15)";
      break;
  }

  return (
    <div
      style={{
        position: "relative",
        width: 440,
        height: 560,
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
        viewBox="0 0 360 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* High-Contrast Tactical Ink Gradients */}
          <linearGradient id="cipherCoatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="cipherFurGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="monocleGlassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.35" />
          </linearGradient>

          <filter id="characterDropGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor={auraColor} />
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* --- BASE AMBIENT SHADOW --- */}
        <ellipse
          cx="180"
          cy="465"
          rx={90 + breath * 5}
          ry={14 + breath * 2}
          fill="rgba(0, 0, 0, 0.45)"
          filter="blur(8px)"
        />

        {/* --- MAIN CHARACTER GROUP --- */}
        <g filter="url(#characterDropGlow)">
          {/* 1. BUSHY TECHNICAL FOX TAIL (Snappy bobbing behind) */}
          <g transform={`rotate(${Math.sin(frame * 0.12) * 8} 90 380)`}>
            <path
              d="M 100 390 C 40 410 -20 370 -30 300 C -38 240 0 220 30 250 C 15 280 30 340 90 365 Z"
              fill="url(#cipherFurGrad)"
              stroke="#0f172a"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* White Tail Tip */}
            <path
              d="M 5 258 C -15 240 -25 280 -25 300 C -20 320 0 310 15 285 Z"
              fill="#ffffff"
            />
          </g>

          {/* 2. TRENCH COAT TORSO & BLUEPRINT LAPEL */}
          <path
            d="M 115 240 L 80 440 L 280 440 L 245 240 Z"
            fill="url(#cipherCoatGrad)"
            stroke="#0f172a"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Golden Badge / Technical Stylus in Coat Pocket */}
          <rect x="130" y="270" width="10" height="30" rx="3" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          <circle cx="135" cy="265" r="5" fill="#facc15" stroke="#0f172a" strokeWidth="2" />

          {/* Coat Lapel & Collar V-Shape */}
          <path
            d="M 140 240 L 180 330 L 220 240"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 180 330 L 180 440"
            fill="none"
            stroke="#0f172a"
            strokeWidth="4"
          />

          {/* 3. ARMS & HANDS (Dynamic Posing) */}
          {/* Left Arm */}
          <g transform={`rotate(${leftArmAngle} 115 260)`}>
            <path
              d="M 115 260 Q 80 320 75 360"
              fill="none"
              stroke="url(#cipherCoatGrad)"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <circle cx="75" cy="360" r="16" fill="url(#cipherFurGrad)" stroke="#0f172a" strokeWidth="4" />
          </g>

          {/* Right Arm */}
          <g transform={`rotate(${rightArmAngle} 245 260)`}>
            <path
              d="M 245 260 Q 280 320 285 360"
              fill="none"
              stroke="url(#cipherCoatGrad)"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <circle cx="285" cy="360" r="16" fill="url(#cipherFurGrad)" stroke="#0f172a" strokeWidth="4" />

            {/* Eureka Lightbulb / Pointing Spark on Hand */}
            {pose === "eureka" && (
              <g transform="translate(285, 330)">
                <circle cx="0" cy="-20" r="14" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />
                <path d="M -6 -10 L 6 -10 L 4 -4 L -4 -4 Z" fill="#94a3b8" />
                <line x1="0" y1="-38" x2="0" y2="-46" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
                <line x1="-15" y1="-32" x2="-22" y2="-38" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
                <line x1="15" y1="-32" x2="22" y2="-38" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* 4. HEAD GROUP (Tiltable) */}
          <g transform={`rotate(${headTilt} 180 200)`}>
            {/* EARS */}
            {/* Left Ear */}
            <g transform={`rotate(${-earWiggle} 130 110)`}>
              <polygon points="110,130 130,50 160,110" fill="url(#cipherFurGrad)" stroke="#0f172a" strokeWidth="5" strokeLinejoin="round" />
              <polygon points="120,120 132,70 150,110" fill="#fef08a" />
            </g>
            {/* Right Ear */}
            <g transform={`rotate(${earWiggle} 230 110)`}>
              <polygon points="200,110 230,50 250,130" fill="url(#cipherFurGrad)" stroke="#0f172a" strokeWidth="5" strokeLinejoin="round" />
              <polygon points="210,110 228,70 240,120" fill="#fef08a" />
            </g>

            {/* Head Base */}
            <ellipse
              cx="180"
              cy="165"
              rx="68"
              ry="58"
              fill="url(#cipherFurGrad)"
              stroke="#0f172a"
              strokeWidth="5"
            />

            {/* White Fur Cheeks / Muzzle Mask */}
            <path
              d="M 125 170 C 120 205 140 225 180 225 C 220 225 240 205 235 170 C 215 185 195 180 180 180 C 165 180 145 185 125 170 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* EYEBROWS */}
            <g transform={`translate(0, ${eyebrowLift})`}>
              <line
                x1="135"
                y1={132 + eyebrowSlant}
                x2="162"
                y2={132 - eyebrowSlant}
                stroke="#0f172a"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line
                x1="198"
                y1={132 - eyebrowSlant}
                x2="225"
                y2={132 + eyebrowSlant}
                stroke="#0f172a"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>

            {/* EYES (Blinking & Pupil Tracking) */}
            {/* Left Eye */}
            <g transform={`translate(148, 148) scale(1, ${eyeScaleY})`}>
              <ellipse cx="0" cy="0" rx="14" ry="16" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
              <ellipse cx={pupilOffsetX} cy={pupilOffsetY} rx="7" ry="9" fill="#0f172a" />
              <circle cx={pupilOffsetX + 3} cy={pupilOffsetY - 3} r="3" fill="#ffffff" />
            </g>

            {/* Right Eye: CYBER MONOCLE (Iconic Cipher Ocular) */}
            <g transform={`translate(212, 148) scale(1, ${eyeScaleY})`}>
              {/* Natural Eye behind glass */}
              <ellipse cx="0" cy="0" rx="14" ry="16" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
              <ellipse cx={pupilOffsetX} cy={pupilOffsetY} rx="7" ry="9" fill="#0f172a" />
              <circle cx={pupilOffsetX + 3} cy={pupilOffsetY - 3} r="3" fill="#ffffff" />

              {/* Glowing Cyan Ocular Frame */}
              <circle cx="0" cy="0" r="22" fill="url(#monocleGlassGrad)" stroke="#00f5ff" strokeWidth="4" filter="drop-shadow(0 0 8px #00f5ff)" />
              {/* Crosshair Scanner Reticle */}
              <line x1="-18" y1="0" x2="-8" y2="0" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
              <line x1="8" y1="0" x2="18" y2="0" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
              <line x1="0" y1="-18" x2="0" y2="-8" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
              <line x1="0" y1="8" x2="0" y2="18" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
            </g>

            {/* Monocle Cord connecting to coat */}
            <path
              d="M 234 148 Q 255 185 240 240"
              fill="none"
              stroke="#00f5ff"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />

            {/* NOSE */}
            <polygon points="174,182 186,182 180,190" fill="#0f172a" />

            {/* MOUTH (Audio-Reactive Flapping or Expressive Shapes) */}
            {pose === "shocked" || isSpeaking ? (
              <path
                d={`M 166 198 Q 180 ${198 + mouthHeight} 194 198 Q 180 ${196 + mouthHeight * 0.4} 166 198 Z`}
                fill="#b91c1c"
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M 170 198 Q 180 205 190 198"
                fill="none"
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}

            {/* SWEAT DROPLETS (Whalter-style comedic stress) */}
            {sweatOpacity > 0 && (
              <g opacity={sweatOpacity}>
                <path
                  d="M 115 120 C 110 115 110 105 118 105 C 126 105 126 115 121 120 Z"
                  fill="#38bdf8"
                  stroke="#0284c7"
                  strokeWidth="2"
                  transform={`translate(0, ${Math.sin(frame * 0.3) * 6})`}
                />
                <path
                  d="M 245 115 C 240 110 240 100 248 100 C 256 100 256 110 251 115 Z"
                  fill="#38bdf8"
                  stroke="#0284c7"
                  strokeWidth="2"
                  transform={`translate(0, ${Math.cos(frame * 0.3) * 6})`}
                />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
