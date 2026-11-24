import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitleWord } from "../../types";

export type WhalterExpression = "skeptical" | "shocked" | "panic" | "smug" | "wavy" | "screaming";
export type WhalterHair = "brown" | "blonde" | "black" | "purple" | "grey";
export type WhalterProp = "phone" | "controller" | "candle" | "chocolate" | "beans" | "watch" | "card" | "none";
export type WhalterRole = "civilian" | "pilot" | "trader" | "hoarder";

interface WhalterTrueCharacterProps {
  x?: number;
  y?: number;
  scale?: number;
  flipX?: boolean;
  shirtColor?: string;
  hairColor?: WhalterHair;
  expression?: WhalterExpression;
  prop?: WhalterProp;
  role?: WhalterRole;
  subtitles?: SubtitleWord[];
  bounceOffset?: number;
  isHero?: boolean;
}

export const WhalterTrueCharacter: React.FC<WhalterTrueCharacterProps> = ({
  x = 0,
  y = 0,
  scale = 1.0,
  flipX = false,
  shirtColor = "#2563eb", // Signature Whalter Royal Blue
  hairColor = "brown",
  expression = "skeptical",
  prop = "none",
  role = "civilian",
  subtitles = [],
  bounceOffset = 0,
  isHero = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Natural idle breathing bob
  const breath = Math.sin((frame / fps) * Math.PI * 2.2 + bounceOffset) * 4;

  // Audio-reactive mouth flap for hero
  const currentTimeSec = frame / fps;
  const isSpeaking = isHero && subtitles.some(
    (w) => currentTimeSec >= w.start && currentTimeSec <= w.end
  );
  const talkFlap = Math.abs(Math.sin(frame * 0.9));

  // Eye blinking
  const blinkCycle = (frame + Math.floor(bounceOffset * 30)) % 95;
  const isBlinking = blinkCycle >= 91 && blinkCycle <= 93;

  // Hair color palette
  const hairHex = {
    brown: "#6B3A19",
    blonde: "#EAB308",
    black: "#18181B",
    purple: "#7C3AED",
    grey: "#9CA3AF",
  }[hairColor];

  const uniqueId = `whalter_grad_${x}_${y}_${shirtColor.replace("#", "")}`;

  return (
    <g
      transform={`translate(${x}, ${y + breath}) scale(${scale * (flipX ? -1 : 1)}, ${scale})`}
      style={{ pointerEvents: "none" }}
    >
      <defs>
        {/* Soft 2.5D Cylindrical Shading Gradient */}
        <linearGradient id={`${uniqueId}_body`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
          <stop offset="25%" stopColor={shirtColor} />
          <stop offset="75%" stopColor={shirtColor} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </linearGradient>

        {/* Soft Head Gradient */}
        <linearGradient id={`${uniqueId}_head`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>

      {/* --- 1. FLOOR CONTACT SHADOW --- */}
      <ellipse cx="0" cy="235" rx="36" ry="9" fill="rgba(0, 0, 0, 0.45)" filter="blur(3px)" />

      {/* --- 2. STICK LEGS & SHOES --- */}
      {/* Left Leg */}
      <line x1="-14" y1="130" x2="-14" y2="230" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="-18" cy="232" rx="14" ry="6" fill="#000000" />

      {/* Right Leg */}
      <line x1="14" y1="130" x2="14" y2="230" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="18" cy="232" rx="14" ry="6" fill="#000000" />

      {/* --- 3. WHALTER CAPSULE / PILL BODY --- */}
      {/* Pill shape: Rounded capsule */}
      <rect
        x="-38"
        y="-25"
        width="76"
        height="165"
        rx="38"
        fill={`url(#${uniqueId}_body)`}
        stroke="#000000"
        strokeWidth="8"
      />

      {/* Neck Collar Accent / Tie */}
      {role === "trader" ? (
        <g>
          {/* White Shirt Collar */}
          <polygon points="-16,-18 0,-5 16,-18 0,-12" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
          {/* Red Tie */}
          <polygon points="-6,-5 6,-5 10,75 0,95 -10,75" fill="#DC2626" stroke="#000000" strokeWidth="4" />
        </g>
      ) : role === "pilot" ? (
        <g>
          {/* White Pilot Shirt Collar */}
          <polygon points="-16,-18 0,-5 16,-18 0,-12" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
          {/* Black Pilot Tie */}
          <polygon points="-5,-5 5,-5 8,65 0,80 -8,65" fill="#0F172A" stroke="#000000" strokeWidth="4" />
          {/* Left Epaulet with Gold Stripes */}
          <rect x="-42" y="-12" width="16" height="10" rx="2" fill="#0F172A" stroke="#000000" strokeWidth="3" />
          <line x1="-40" y1="-7" x2="-28" y2="-7" stroke="#FBBF24" strokeWidth="3" />
          {/* Right Epaulet with Gold Stripes */}
          <rect x="26" y="-12" width="16" height="10" rx="2" fill="#0F172A" stroke="#000000" strokeWidth="3" />
          <line x1="28" y1="-7" x2="40" y2="-7" stroke="#FBBF24" strokeWidth="3" />
        </g>
      ) : (
        <path
          d="M -22 -15 Q 0 -5 22 -15"
          fill="none"
          stroke="#000000"
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}

      {/* The 3 Signature Whalter Black Button Dots */}
      {role !== "trader" && role !== "pilot" && (
        <g>
          <circle cx="0" cy="20" r="4.5" fill="#000000" />
          <circle cx="0" cy="52" r="4.5" fill="#000000" />
          <circle cx="0" cy="84" r="4.5" fill="#000000" />
        </g>
      )}

      {/* --- 4. STICK ARMS & HANDS --- */}
      {/* Left Arm */}
      <path
        d="M -36 5 Q -65 45 -48 85"
        fill="none"
        stroke="#000000"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="-48" cy="85" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />

      {/* Right Arm */}
      {prop === "phone" ? (
        <g>
          {/* Bent holding phone */}
          <path
            d="M 36 5 Q 60 35 45 65"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="45" cy="65" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
          {/* Smartphone */}
          <rect x="42" y="45" width="22" height="38" rx="4" fill="#0F172A" stroke="#000000" strokeWidth="4" />
          <rect x="45" y="49" width="16" height="30" fill="#38BDF8" />
        </g>
      ) : prop === "controller" ? (
        <g>
          <path
            d="M 36 5 Q 55 35 25 60"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="25" cy="60" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
          {/* Video Game Controller */}
          <rect x="-18" y="52" width="36" height="20" rx="8" fill="#18181B" stroke="#000000" strokeWidth="4" />
          <circle cx="-9" cy="62" r="3" fill="#EF4444" />
          <circle cx="9" cy="62" r="3" fill="#22C55E" />
        </g>
      ) : prop === "candle" ? (
        <g>
          <path
            d="M 36 5 Q 60 35 48 65"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="48" cy="65" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
          {/* Candle */}
          <rect x="45" y="50" width="10" height="22" fill="#FEF08A" stroke="#000000" strokeWidth="3" />
          {/* Flame */}
          <ellipse cx="50" cy="44" rx="4" ry="7" fill="#F97316" />
        </g>
      ) : prop === "chocolate" ? (
        <g>
          <path
            d="M 36 5 Q 60 35 48 65"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="48" cy="65" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
          {/* Gold Foil Chocolate Bar */}
          <rect x="40" y="44" width="22" height="34" rx="3" fill="#D97706" stroke="#000000" strokeWidth="4" />
          <rect x="42" y="46" width="18" height="18" fill="#FBBF24" />
          <line x1="42" y1="55" x2="60" y2="55" stroke="#78350F" strokeWidth="2" />
        </g>
      ) : prop === "beans" ? (
        <g>
          <path
            d="M 36 5 Q 60 35 48 65"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="48" cy="65" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
          {/* Canned Beans Tin */}
          <rect x="40" y="45" width="22" height="32" rx="4" fill="#94A3B8" stroke="#000000" strokeWidth="4" />
          <rect x="42" y="52" width="18" height="16" fill="#0284C7" />
        </g>
      ) : prop === "watch" ? (
        <g>
          <path
            d="M 36 5 Q 60 35 48 65"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="48" cy="65" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
          {/* Gold Luxury Watch Held Up */}
          <circle cx="50" cy="56" r="11" fill="#FBBF24" stroke="#000000" strokeWidth="4" />
          <circle cx="50" cy="56" r="7" fill="#FFFFFF" />
          <line x1="50" y1="56" x2="50" y2="52" stroke="#000000" strokeWidth="2" />
          <line x1="50" y1="56" x2="54" y2="56" stroke="#000000" strokeWidth="2" />
        </g>
      ) : prop === "card" ? (
        <g>
          <path
            d="M 36 5 Q 60 35 48 65"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="48" cy="65" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
          {/* Green Credit Card */}
          <rect x="42" y="48" width="28" height="18" rx="3" fill="#10B981" stroke="#000000" strokeWidth="4" />
          <rect x="46" y="53" width="7" height="6" rx="1" fill="#FBBF24" />
        </g>
      ) : (
        <g>
          <path
            d="M 36 5 Q 65 45 48 85"
            fill="none"
            stroke="#000000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="48" cy="85" r="9" fill="#FFFBEB" stroke="#000000" strokeWidth="5" />
        </g>
      )}

      {/* --- 5. HEAD & PALE SKIN --- */}
      <circle
        cx="0"
        cy="-95"
        r="68"
        fill={`url(#${uniqueId}_head)`}
        stroke="#000000"
        strokeWidth="8"
      />

      {/* --- 6. SIGNATURE WHALTER BOWL-CUT HAIR OR PILOT CAP --- */}
      {role === "pilot" ? (
        <g>
          {/* Pilot Hair Peeking */}
          <path
            d="M -67 -105 C -65 -150 65 -150 67 -105 Z"
            fill="#18181B"
          />
          {/* Captain Navy Hat Dome */}
          <path
            d="M -65 -118 C -70 -175 70 -175 65 -118 Z"
            fill="#0F172A"
            stroke="#000000"
            strokeWidth="8"
          />
          {/* Black Visor Brim */}
          <ellipse cx="0" cy="-116" rx="68" ry="14" fill="#000000" />
          {/* Gold Hat Cord */}
          <line x1="-55" y1="-122" x2="55" y2="-122" stroke="#FBBF24" strokeWidth="5" />
          {/* Gold Wing Badge Crest */}
          <polygon points="0,-152 -14,-135 14,-135" fill="#FBBF24" stroke="#000000" strokeWidth="3" />
          <circle cx="0" cy="-140" r="5" fill="#DC2626" />
        </g>
      ) : (
        <g>
          {/* Main bowl cap */}
          <path
            d="M -67 -105 C -65 -170 65 -170 67 -105 C 55 -95 40 -115 15 -105 C -5 -98 -25 -118 -45 -102 C -58 -108 -65 -100 -67 -105 Z"
            fill={hairHex}
            stroke="#000000"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          {/* Angular center bang notch */}
          <path
            d="M -12 -125 L 0 -105 L 12 -125"
            fill="none"
            stroke="#000000"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* --- 7. FACIAL FEATURES & WHALTER EXPRESSIONS --- */}
      {/* INWARD-SLANTED WORRY EYEBROWS */}
      <line x1="-32" y1="-118" x2="-12" y2="-112" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
      <line x1="32" y1="-118" x2="12" y2="-112" stroke="#000000" strokeWidth="7" strokeLinecap="round" />

      {/* EYES */}
      {isBlinking ? (
        <g>
          <line x1="-30" y1="-95" x2="-14" y2="-95" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
          <line x1="14" y1="-95" x2="30" y2="-95" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
        </g>
      ) : expression === "shocked" ? (
        // Shocked round circle eyes
        <g>
          <circle cx="-22" cy="-95" r="14" fill="#FFFFFF" stroke="#000000" strokeWidth="6" />
          <circle cx="-22" cy="-95" r="5" fill="#000000" />
          <circle cx="22" cy="-95" r="14" fill="#FFFFFF" stroke="#000000" strokeWidth="6" />
          <circle cx="22" cy="-95" r="5" fill="#000000" />
        </g>
      ) : expression === "smug" ? (
        // Smug laughing squint (^ ^)
        <g>
          <path d="M -30 -92 Q -22 -104 -14 -92" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
          <path d="M 14 -92 Q 22 -104 30 -92" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
        </g>
      ) : (
        // Signature Whalter Skeptical Squint (heavy upper lid line)
        <g>
          {/* Left Eye */}
          <line x1="-32" y1="-98" x2="-12" y2="-98" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="-22" cy="-91" rx="8" ry="6" fill="#000000" />

          {/* Right Eye */}
          <line x1="12" y1="-98" x2="32" y2="-98" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="22" cy="-91" rx="8" ry="6" fill="#000000" />
        </g>
      )}

      {/* MOUTH */}
      {isSpeaking ? (
        // Audio-reactive mouth flap
        <ellipse cx="0" cy="-60" rx="14" ry={talkFlap * 14 + 4} fill="#881337" stroke="#000000" strokeWidth="5" />
      ) : expression === "wavy" || expression === "panic" ? (
        // Wavy panic mouth (~)
        <path
          d="M -18 -60 Q -9 -68 0 -60 Q 9 -52 18 -60"
          fill="none"
          stroke="#000000"
          strokeWidth="6"
          strokeLinecap="round"
        />
      ) : expression === "shocked" ? (
        // Open 'O' shock mouth
        <ellipse cx="0" cy="-58" rx="10" ry="16" fill="#881337" stroke="#000000" strokeWidth="6" />
      ) : expression === "smug" ? (
        // Sly smile
        <path
          d="M -16 -62 Q 0 -50 16 -62"
          fill="none"
          stroke="#000000"
          strokeWidth="6"
          strokeLinecap="round"
        />
      ) : (
        // Signature deadpan flat line
        <line x1="-16" y1="-62" x2="16" y2="-62" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
      )}

      {/* Blue Sweat Drop (for Panic / Wavy) */}
      {(expression === "panic" || expression === "wavy") && (
        <path
          d="M 52 -115 C 50 -125 58 -135 62 -130 C 66 -125 56 -105 52 -115 Z"
          fill="#38BDF8"
          stroke="#000000"
          strokeWidth="4"
        />
      )}
    </g>
  );
};
