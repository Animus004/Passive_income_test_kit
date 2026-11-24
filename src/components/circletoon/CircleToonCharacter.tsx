import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitleWord } from "../../types";

export type HairStyle = "boy_brown" | "grandma_white" | "girl_blonde" | "nerd_black" | "bald";
export type EyeStyle = "dots" | "squint" | "wink" | "panic" | "screaming" | "sleeping";
export type MouthStyle = "talk" | "open_O" | "smile" | "wavy" | "teeth" | "sleeping_drool" | "snoring";

interface CircleToonCharacterProps {
  x?: number;
  y?: number;
  scale?: number;
  flipX?: boolean;
  shirtColor?: string;
  hairStyle?: HairStyle;
  eyeStyle?: EyeStyle;
  mouthStyle?: MouthStyle;
  subtitles?: SubtitleWord[];
  holdingProp?: "cheque" | "phone" | "bread" | "chocolate" | "none";
  propText?: string;
  bounceOffset?: number;
  hasTie?: boolean;
  isSpeakingNarrator?: boolean;
}

export const CircleToonCharacter: React.FC<CircleToonCharacterProps> = ({
  x = 0,
  y = 0,
  scale = 1.0,
  flipX = false,
  shirtColor = "#2563eb",
  hairStyle = "boy_brown",
  eyeStyle = "dots",
  mouthStyle = "talk",
  subtitles = [],
  holdingProp = "none",
  propText = "$1,000,000",
  bounceOffset = 0,
  hasTie = false,
  isSpeakingNarrator = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Natural idle breathing bob
  const breath = Math.sin((frame / fps) * Math.PI * 2.5 + bounceOffset) * 4;

  // Audio-reactive mouth flapping
  const currentTimeSec = frame / fps;
  const isSpeaking = subtitles.some(
    (w) => currentTimeSec >= w.start && currentTimeSec <= w.end
  );
  const talkCycle = Math.abs(Math.sin(frame * 0.85));
  const mouthFlapH = isSpeaking ? talkCycle * 18 + 4 : 4;

  // Eye blinking
  const blinkCycle = (frame + bounceOffset * 20) % 90;
  const isBlinking = blinkCycle >= 86 && blinkCycle <= 88;
  const eyeScaleY = isBlinking ? 0.1 : 1.0;

  return (
    <g
      transform={`translate(${x}, ${y + breath}) scale(${scale * (flipX ? -1 : 1)}, ${scale})`}
      style={{ pointerEvents: "none" }}
    >
      {/* --- 1. SHADOW --- */}
      <ellipse cx="0" cy="225" rx="35" ry="8" fill="rgba(0, 0, 0, 0.3)" />

      {/* --- 2. STICK LEGS & SHOES --- */}
      {/* Left Leg */}
      <line x1="-12" y1="120" x2="-12" y2="220" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="-16" cy="222" rx="14" ry="6" fill="#000000" />

      {/* Right Leg */}
      <line x1="12" y1="120" x2="12" y2="220" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="16" cy="222" rx="14" ry="6" fill="#000000" />

      {/* --- 3. PILL / BEAN TORSO --- */}
      <rect
        x="-32"
        y="10"
        width="64"
        height="125"
        rx="32"
        fill={shirtColor}
        stroke="#000000"
        strokeWidth="9"
      />

      {/* Shirt Buttons or Red Tie */}
      {hasTie ? (
        <g>
          {/* White shirt collar */}
          <polygon points="-12,12 12,12 0,26" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
          {/* Red Tie */}
          <polygon points="-6,24 6,24 8,82 0,96 -8,82" fill="#ef4444" stroke="#000000" strokeWidth="3" />
        </g>
      ) : (
        <>
          <circle cx="0" cy="35" r="3.5" fill="#000000" opacity="0.65" />
          <circle cx="0" cy="60" r="3.5" fill="#000000" opacity="0.65" />
          <circle cx="0" cy="85" r="3.5" fill="#000000" opacity="0.65" />
          <circle cx="0" cy="110" r="3.5" fill="#000000" opacity="0.65" />
        </>
      )}

      {/* --- 4. STICK ARMS & PROPS --- */}
      {holdingProp === "cheque" ? (
        <g>
          {/* Arms holding cheque forward */}
          <line x1="-24" y1="35" x2="-45" y2="72" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          <line x1="24" y1="35" x2="45" y2="72" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          {/* Big White Cheque / Card (Walter 1:1) */}
          <g transform="translate(0, 72) rotate(-2)">
            <rect x="-62" y="-18" width="124" height="36" rx="3" fill="#ffffff" stroke="#000000" strokeWidth="3.5" />
            <text x="0" y="6" textAnchor="middle" fill="#000000" fontFamily="'Arial Black', Impact, sans-serif" fontSize="15" fontWeight="900" letterSpacing="-0.5px">
              {propText}
            </text>
          </g>
          {/* Hands gripping edges */}
          <circle cx="-48" cy="72" r="6.5" fill="#000000" />
          <circle cx="48" cy="72" r="6.5" fill="#000000" />
        </g>
      ) : holdingProp === "phone" ? (
        <g>
          {/* Right Arm Holding Smartphone */}
          <line x1="24" y1="35" x2="45" y2="55" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          <line x1="-24" y1="35" x2="-28" y2="95" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          {/* Smartphone */}
          <g transform="translate(50, 50) rotate(15)">
            <rect x="-14" y="-25" width="28" height="50" rx="5" fill="#0f172a" stroke="#000000" strokeWidth="3" />
            <rect x="-11" y="-20" width="22" height="38" rx="2" fill="#38bdf8" />
            <text x="0" y="-5" textAnchor="middle" fill="#ffffff" fontFamily="sans-serif" fontSize="6" fontWeight="bold">+$1M</text>
          </g>
          <circle cx="45" cy="55" r="7" fill="#000000" />
        </g>
      ) : holdingProp === "chocolate" ? (
        <g>
          {/* Right Arm Holding Golden Chocolate Bar */}
          <line x1="24" y1="35" x2="45" y2="60" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          <line x1="-24" y1="35" x2="-28" y2="95" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          {/* Chocolate Bar */}
          <g transform="translate(45, 60) rotate(-10)">
            <rect x="-14" y="-22" width="28" height="44" rx="4" fill="#78350f" stroke="#000000" strokeWidth="3" />
            <rect x="-14" y="-22" width="28" height="20" rx="3" fill="#facc15" stroke="#000000" strokeWidth="2" />
            <text x="0" y="-8" textAnchor="middle" fill="#000000" fontFamily="'Arial Black', sans-serif" fontSize="7" fontWeight="bold">GOLD</text>
          </g>
          <circle cx="45" cy="60" r="7" fill="#000000" />
        </g>
      ) : (
        <g>
          {/* Arms hanging naturally or screaming */}
          {eyeStyle === "screaming" || mouthStyle === "open_O" ? (
            <g>
              {/* Hands on head in shock */}
              <line x1="-24" y1="35" x2="-45" y2="-10" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
              <line x1="24" y1="35" x2="45" y2="-10" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
              <circle cx="-45" cy="-10" r="8" fill="#000000" />
              <circle cx="45" cy="-10" r="8" fill="#000000" />
            </g>
          ) : (
            <g>
              <line x1="-24" y1="35" x2="-28" y2="105" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
              <line x1="24" y1="35" x2="28" y2="105" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
              <circle cx="-28" cy="105" r="7" fill="#000000" />
              <circle cx="28" cy="105" r="7" fill="#000000" />
            </g>
          )}
        </g>
      )}

      {/* --- 5. CIRCLE HEAD --- */}
      <circle cx="0" cy="-25" r="48" fill="#fde68a" stroke="#000000" strokeWidth="9" />

      {/* --- 6. HAIR STYLES --- */}
      {hairStyle === "boy_brown" && (
        <path
          d="M -46 -35 C -46 -75 -15 -80 0 -80 C 25 -80 46 -70 46 -35 C 38 -30 20 -40 5 -35 C -10 -30 -30 -42 -46 -35 Z"
          fill="#451a03"
          stroke="#000000"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      )}
      {hairStyle === "grandma_white" && (
        <g>
          {/* White Hair Bun */}
          <circle cx="0" cy="-80" r="18" fill="#ffffff" stroke="#000000" strokeWidth="6" />
          <path
            d="M -46 -25 C -46 -75 0 -80 46 -25 C 20 -40 -20 -40 -46 -25 Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="6"
          />
        </g>
      )}
      {hairStyle === "girl_blonde" && (
        <g>
          <path
            d="M -46 -30 C -46 -75 0 -80 46 -30 C 25 -45 -25 -45 -46 -30 Z"
            fill="#facc15"
            stroke="#000000"
            strokeWidth="6"
          />
          {/* Pigtails */}
          <circle cx="-50" cy="-20" r="12" fill="#facc15" stroke="#000000" strokeWidth="5" />
          <circle cx="50" cy="-20" r="12" fill="#facc15" stroke="#000000" strokeWidth="5" />
        </g>
      )}
      {hairStyle === "nerd_black" && (
        <path
          d="M -46 -35 C -46 -78 0 -80 46 -35 C 15 -48 -15 -48 -46 -35 Z"
          fill="#0f172a"
          stroke="#000000"
          strokeWidth="6"
        />
      )}

      {/* --- 7. EYES & EXPRESSIONS --- */}
      {eyeStyle === "dots" && (
        <g transform={`scale(1, ${eyeScaleY})`} style={{ transformOrigin: "0px -25px" }}>
          <circle cx="-16" cy="-25" r="7" fill="#000000" />
          <circle cx="16" cy="-25" r="7" fill="#000000" />
        </g>
      )}
      {eyeStyle === "sleeping" && (
        <g>
          {/* Peaceful closed sleeping curved eyes */}
          <path d="M -24 -25 Q -16 -17 -8 -25" fill="none" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
          <path d="M 8 -25 Q 16 -17 24 -25" fill="none" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {eyeStyle === "screaming" && (
        <g>
          <circle cx="-18" cy="-28" r="14" fill="#ffffff" stroke="#000000" strokeWidth="4" />
          <circle cx="-18" cy="-28" r="6" fill="#000000" />
          <circle cx="18" cy="-28" r="14" fill="#ffffff" stroke="#000000" strokeWidth="4" />
          <circle cx="18" cy="-28" r="6" fill="#000000" />
        </g>
      )}
      {eyeStyle === "squint" && (
        <g>
          {/* Half-lidded bored eyes */}
          <line x1="-26" y1="-28" x2="-8" y2="-28" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
          <path d="M -26 -28 C -26 -20 -8 -20 -8 -28 Z" fill="#000000" />
          <line x1="8" y1="-28" x2="26" y2="-28" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
          <path d="M 8 -28 C 8 -20 26 -20 26 -28 Z" fill="#000000" />
        </g>
      )}
      {eyeStyle === "panic" && (
        <g>
          {/* Shivering small dots */}
          <circle cx={-16 + Math.sin(frame) * 2} cy="-25" r="5" fill="#000000" />
          <circle cx={16 + Math.cos(frame) * 2} cy="-25" r="5" fill="#000000" />
          {/* Sweat drop on forehead */}
          <path
            d="M 28 -55 C 24 -60 24 -68 30 -68 C 36 -68 36 -60 32 -55 Z"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="2"
          />
        </g>
      )}

      {/* Glasses (e.g. for grandma or nerd) */}
      {(hairStyle === "grandma_white" || hairStyle === "nerd_black") && (
        <g>
          <circle cx="-16" cy="-25" r="14" fill="none" stroke="#000000" strokeWidth="4" />
          <circle cx="16" cy="-25" r="14" fill="none" stroke="#000000" strokeWidth="4" />
          <line x1="-2" y1="-25" x2="2" y2="-25" stroke="#000000" strokeWidth="4" />
        </g>
      )}

      {/* --- 8. MOUTHS --- */}
      {mouthStyle === "open_O" || eyeStyle === "screaming" ? (
        <ellipse cx="0" cy="-5" rx="12" ry="16" fill="#b91c1c" stroke="#000000" strokeWidth="5" />
      ) : mouthStyle === "snoring" ? (
        <ellipse cx="0" cy="-6" rx="9" ry="12" fill="#7f1d1d" stroke="#000000" strokeWidth="4.5" />
      ) : mouthStyle === "sleeping_drool" ? (
        <g>
          <path d="M -10 -7 Q 0 -3 10 -7" fill="none" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
          {/* Blue cartoon drool droplet */}
          <path d="M 6 -5 Q 11 4 8 11 Q 5 11 6 -5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        </g>
      ) : mouthStyle === "smile" ? (
        <path d="M -14 -8 Q 0 4 14 -8" fill="none" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
      ) : mouthStyle === "teeth" ? (
        <g transform="translate(0, -6)">
          <rect x="-14" y="-6" width="28" height="12" rx="3" fill="#ffffff" stroke="#000000" strokeWidth="4" />
          <line x1="-5" y1="-6" x2="-5" y2="6" stroke="#000000" strokeWidth="2.5" />
          <line x1="5" y1="-6" x2="5" y2="6" stroke="#000000" strokeWidth="2.5" />
        </g>
      ) : mouthStyle === "wavy" ? (
        <path d="M -15 -6 Q -8 -2 -2 -7 Q 5 -12 12 -6" fill="none" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
      ) : isSpeakingNarrator && isSpeaking ? (
        <ellipse cx="0" cy="-6" rx="8" ry={mouthFlapH} fill="#b91c1c" stroke="#000000" strokeWidth="4" />
      ) : (
        <path d="M -10 -6 Q 0 -2 10 -6" fill="none" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
      )}
    </g>
  );
};
