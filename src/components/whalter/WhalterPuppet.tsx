import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitleWord } from "../../types";

export type PuppetPose =
  | "standing_idle"
  | "sitting_bench"
  | "slumped_bench"
  | "sitting_cockpit"
  | "slumped_steering_wheel"
  | "waking_up"
  | "panic_shake"
  | "look_camera";

export type PuppetMouth =
  | "neutral_smile"
  | "small_o"
  | "dropped_jaw"
  | "snore_mouth"
  | "talking_cycle"
  | "panicked_grimace";

export type PuppetEyes =
  | "normal"
  | "shock_wide"
  | "squint_skeptical"
  | "closed_peaceful"
  | "glance_camera";

interface WhalterPuppetProps {
  x?: number;
  y?: number;
  scale?: number;
  flipX?: boolean;
  shirtColor?: string;
  pose?: PuppetPose;
  mouth?: PuppetMouth;
  eyes?: PuppetEyes;
  subtitles?: SubtitleWord[];
  isSpeaking?: boolean;
  showSnoreBubbles?: boolean;
  headwear?: "none" | "nightcap" | "headset" | "headset_nightcap";
}

/**
 * Premium 2.5D Whalter Character Puppet Rig (Storybook Indie Quality)
 * 
 * Anatomically grounded:
 * - Proper proportions: stylized hair, expressive eyes with catchlights, cute hoodie with seams
 * - No stick legs: filled trousers with form shadow, proper red canvas sneakers with rubber soles
 * - Clean pose handling: in-bed waist cutoff (zero clipping through mattresses), natural seated bends
 */
export const WhalterPuppet: React.FC<WhalterPuppetProps> = ({
  x = 540,
  y = 1200,
  scale = 1.0,
  flipX = false,
  shirtColor = "#2563eb",
  pose = "standing_idle",
  mouth = "neutral_smile",
  eyes = "normal",
  subtitles = [],
  isSpeaking = false,
  showSnoreBubbles = false,
  headwear = "none",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Natural idle breathing bob
  const isSleeping =
    pose === "slumped_bench" ||
    pose === "sitting_cockpit" ||
    pose === "slumped_steering_wheel";

  const breath = isSleeping
    ? Math.sin((frame / fps) * Math.PI * 1.5) * 3.0
    : Math.sin((frame / fps) * Math.PI * 2.2) * 4.0;

  // Panic jitter
  const panicX = pose === "panic_shake" ? (frame % 2 === 0 ? -4 : 4) : 0;
  const panicY = pose === "panic_shake" ? (frame % 3 === 0 ? -3 : 3) : 0;

  // Natural Eyelid Blinking
  const blinkCycle = frame % 92;
  const isBlinking = eyes !== "closed_peaceful" && blinkCycle >= 88 && blinkCycle <= 90;

  // Audio-reactive mouth movement
  const currentTimeSec = frame / fps;
  const activeWord = subtitles.find(
    (w) => currentTimeSec >= w.start && currentTimeSec <= w.end
  );
  const isAudioActive = isSpeaking || !!activeWord;
  const talkFlap = isAudioActive ? Math.abs(Math.sin(frame * 0.9)) : 0;

  const uid = `whalter_rig_${Math.round(x)}_${Math.round(y)}_${pose}`;

  return (
    <g
      transform={`translate(${x + panicX}, ${y + breath + panicY}) scale(${scale * (flipX ? -1 : 1)}, ${scale})`}
      style={{ pointerEvents: "none" }}
    >
      <defs>
        {/* Soft 2.5D Cylindrical Hoodie Shading */}
        <linearGradient id={`${uid}_hoodie`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor={shirtColor} />
          <stop offset="85%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Soft Skin Gradient */}
        <linearGradient id={`${uid}_skin`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="65%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fba772" />
        </linearGradient>

        {/* Hair Gradient */}
        <linearGradient id={`${uid}_hair`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>

        {/* Denim Pants Gradient */}
        <linearGradient id={`${uid}_pants`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="40%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Ground Contact Shadow */}
        <radialGradient id={`${uid}_contactShadow`}>
          <stop offset="0%" stopColor="rgba(15, 23, 42, 0.7)" />
          <stop offset="50%" stopColor="rgba(15, 23, 42, 0.3)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
        </radialGradient>
      </defs>

      {/* =========================================================================
          1. FLOOR CONTACT SHADOW
          ========================================================================= */}
      {(pose === "standing_idle" || pose === "look_camera") && (
        <ellipse cx="0" cy="225" rx="75" ry="18" fill={`url(#${uid}_contactShadow)`} />
      )}
      {pose === "sitting_bench" && (
        <ellipse cx="0" cy="210" rx="65" ry="16" fill={`url(#${uid}_contactShadow)`} />
      )}

      {/* =========================================================================
          2. LEGS & SNEAKERS (Standing / Walking / Looking at Camera)
          ========================================================================= */}
      {(pose === "standing_idle" || pose === "look_camera" || pose === "panic_shake") && (
        <g>
          {/* Left Leg (Trousers with volume & slight outward stance) */}
          <path
            d="M -30 100 L -46 195 Q -48 208 -52 216 L -24 216 Q -20 200 -16 100 Z"
            fill={`url(#${uid}_pants)`}
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Left Sneaker (angled slightly outward) */}
          <g transform="translate(-56, 214) rotate(-6)">
            <path d="M 0 0 L 40 0 Q 48 0 48 12 L -6 12 Q -8 0 0 0 Z" fill="#ef4444" stroke="#000000" strokeWidth="3" />
            <rect x="-8" y="10" width="58" height="7" rx="3" fill="#f8fafc" stroke="#000000" strokeWidth="2" />
            <path d="M 28 2 Q 46 2 46 10 L 26 10 Z" fill="#f8fafc" />
            <line x1="10" y1="3" x2="22" y2="3" stroke="#ffffff" strokeWidth="2.5" />
          </g>

          {/* Right Leg (Trousers with volume & slight outward stance) */}
          <path
            d="M 16 100 L 20 200 Q 22 208 26 216 L 54 216 Q 50 205 32 100 Z"
            fill={`url(#${uid}_pants)`}
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Right Sneaker (angled slightly outward) */}
          <g transform="translate(20, 214) rotate(6)">
            <path d="M 0 0 L 40 0 Q 48 0 48 12 L -6 12 Q -8 0 0 0 Z" fill="#ef4444" stroke="#000000" strokeWidth="3" />
            <rect x="-8" y="10" width="58" height="7" rx="3" fill="#f8fafc" stroke="#000000" strokeWidth="2" />
            <path d="M 28 2 Q 46 2 46 10 L 26 10 Z" fill="#f8fafc" />
            <line x1="10" y1="3" x2="22" y2="3" stroke="#ffffff" strokeWidth="2.5" />
          </g>
        </g>
      )}

      {/* =========================================================================
          3. SITTING ON BENCH (Thighs forward, knees bent naturally)
          ========================================================================= */}
      {pose === "sitting_bench" && (
        <g>
          {/* Bent Thighs & Lower Legs */}
          <path
            d="M -35 100 L -45 150 L -42 205 L -18 205 L -18 150 L -18 100 Z"
            fill={`url(#${uid}_pants)`}
            stroke="#000000"
            strokeWidth="4"
          />
          <path
            d="M 18 100 L 18 150 L 18 205 L 42 205 L 45 150 L 35 100 Z"
            fill={`url(#${uid}_pants)`}
            stroke="#000000"
            strokeWidth="4"
          />
          {/* Sneakers */}
          <g transform="translate(-46, 204)">
            <ellipse cx="14" cy="5" rx="18" ry="8" fill="#ef4444" stroke="#000000" strokeWidth="3" />
            <rect x="-4" y="9" width="36" height="5" rx="2" fill="#f8fafc" stroke="#000000" strokeWidth="2" />
          </g>
          <g transform="translate(16, 204)">
            <ellipse cx="14" cy="5" rx="18" ry="8" fill="#ef4444" stroke="#000000" strokeWidth="3" />
            <rect x="-4" y="9" width="36" height="5" rx="2" fill="#f8fafc" stroke="#000000" strokeWidth="2" />
          </g>
        </g>
      )}

      {/* =========================================================================
          4. TORSO & HOODIE (Pose-Specific)
          ========================================================================= */}
      {pose === "slumped_bench" ? (
        // Curled sideways sleeping posture resting on bench
        <g transform="translate(10, 15) rotate(14)">
          <ellipse cx="10" cy="85" rx="50" ry="16" fill="rgba(0,0,0,0.3)" filter="blur(4px)" />
          <path
            d="M -45 -10 C -55 30 -50 90 -30 110 C -10 120 40 110 50 85 C 60 50 45 -10 30 -20 Z"
            fill={`url(#${uid}_hoodie)`}
            stroke="#000000"
            strokeWidth="6"
          />
          <path d="M -20 40 Q 5 50 25 35" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
          <path d="M 25 10 Q 55 20 40 50 Q 20 60 0 45" fill={`url(#${uid}_hoodie)`} stroke="#000000" strokeWidth="5" />
          <circle cx="35" cy="52" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
        </g>
      ) : pose === "slumped_steering_wheel" ? (
        // Hunched forward over car steering wheel
        <g transform="translate(0, 10)">
          <ellipse cx="0" cy="65" rx="58" ry="50" fill={`url(#${uid}_hoodie)`} stroke="#000000" strokeWidth="7" />
          <path d="M -45 40 Q -70 80 -40 100 Q -10 105 10 95" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
          <path d="M 45 40 Q 70 80 40 100 Q 10 105 -10 95" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
          <circle cx="-30" cy="98" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
          <circle cx="30" cy="98" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
        </g>
      ) : (
        // Standard Upright / Waking / In-Bed Torso
        <g>
          {/* Main Hoodie Body */}
          <path
            d="M -46 5 C -56 45 -52 105 -35 120 C -15 130 15 130 35 120 C 52 105 56 45 46 5 C 35 -15 -35 -15 -46 5 Z"
            fill={`url(#${uid}_hoodie)`}
            stroke="#000000"
            strokeWidth="7"
          />
          {/* Kangaroo Pocket */}
          <path
            d="M -30 65 Q 0 60 30 65 L 24 110 Q 0 115 -24 110 Z"
            fill="#1d4ed8"
            stroke="#000000"
            strokeWidth="5"
          />
          {/* Drawstrings */}
          <line x1="-12" y1="10" x2="-14" y2="45" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="-14" cy="47" r="3" fill="#ffffff" />
          <line x1="12" y1="10" x2="14" y2="45" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="14" cy="47" r="3" fill="#ffffff" />

          {/* Arms */}
          {pose === "waking_up" ? (
            <g>
              {/* Hands stretched up in shock holding phone */}
              <path d="M -42 15 Q -75 -25 -55 -75" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="-55" cy="-78" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
              <path d="M 42 15 Q 75 -25 55 -75" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="55" cy="-78" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
              {/* Cozy Bed Duvet folded across waist (matching bed styling) */}
              <g transform="translate(0, 110)">
                {/* White folded sheet edge */}
                <path
                  d="M -130 0 Q 0 -18 130 0 L 135 22 Q 0 4 -135 22 Z"
                  fill="#f8fafc"
                  stroke="#000000"
                  strokeWidth="5"
                />
                {/* Teal/sage quilted blanket body */}
                <path
                  d="M -135 20 Q 0 2 135 20 L 145 90 Q 0 75 -145 90 Z"
                  fill="#0d9488"
                  stroke="#000000"
                  strokeWidth="6"
                />
                {/* Quilt stitching highlights */}
                <path d="M -90 35 Q 0 20 90 35" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray="6 4" />
                <path d="M -100 60 Q 0 45 100 60" fill="none" stroke="#0f766e" strokeWidth="3" strokeDasharray="6 4" />
              </g>
            </g>
          ) : pose === "sitting_cockpit" ? (
            <g>
              {/* Arms forward resting on cockpit armrest / steering yoke */}
              <path d="M -42 20 Q -65 55 -30 85" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="-28" cy="85" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
              <path d="M 42 20 Q 65 55 30 85" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="28" cy="85" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
            </g>
          ) : pose === "panic_shake" ? (
            <g>
              <path d="M -42 30 Q -65 10 -40 -15" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="20" strokeLinecap="round" />
              <circle cx="-40" cy="-18" r="15" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
              <path d="M 42 30 Q 65 10 40 -15" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="20" strokeLinecap="round" />
              <circle cx="40" cy="-18" r="15" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
            </g>
          ) : pose === "look_camera" ? (
            <g>
              <path d="M -42 20 Q -65 50 -45 80" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="-45" cy="80" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
              <path d="M 42 20 Q 65 40 50 65" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="50" cy="65" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
            </g>
          ) : (
            <g>
              {/* Natural relaxed arms */}
              <path d="M -42 20 Q -55 60 -45 95" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="-45" cy="95" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
              <path d="M 42 20 Q 55 60 45 95" fill="none" stroke={`url(#${uid}_hoodie)`} strokeWidth="22" strokeLinecap="round" />
              <circle cx="45" cy="95" r="14" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
            </g>
          )}
        </g>
      )}

      {/* =========================================================================
          5. HEAD & FACIAL RIG (Catchlight Eyes, Hair Tufts, Cheeks)
          ========================================================================= */}
      <g
        transform={
          pose === "slumped_bench"
            ? "translate(10, -15) rotate(20)"
            : pose === "slumped_steering_wheel"
            ? "translate(0, -10) rotate(-8)"
            : "translate(0, -40)"
        }
      >
        {/* Chin drop shadow */}
        <ellipse cx="0" cy="38" rx="36" ry="12" fill="rgba(15, 23, 42, 0.4)" filter="blur(3px)" />

        {/* Ears */}
        <ellipse cx="-48" cy="2" rx="12" ry="16" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />
        <ellipse cx="48" cy="2" rx="12" ry="16" fill={`url(#${uid}_skin)`} stroke="#000000" strokeWidth="4" />

        {/* Head Contour */}
        <path
          d="M -46 -15 C -48 -55 48 -55 46 -15 C 48 25 35 48 0 48 C -35 48 -48 25 -46 -15 Z"
          fill={`url(#${uid}_skin)`}
          stroke="#000000"
          strokeWidth="6"
        />

        {/* Blushing Cheeks */}
        <ellipse cx="-28" cy="15" rx="11" ry="6" fill="#f43f5e" opacity="0.35" filter="blur(2px)" />
        <ellipse cx="28" cy="15" rx="11" ry="6" fill="#f43f5e" opacity="0.35" filter="blur(2px)" />

        {/* Stylized Modern Hair Tufts */}
        <path
          d="M -48 -22 C -52 -62 -20 -72 0 -72 C 24 -72 52 -60 48 -22 C 40 -35 25 -38 10 -35 C -5 -38 -25 -32 -48 -22 Z"
          fill={`url(#${uid}_hair)`}
          stroke="#000000"
          strokeWidth="6"
        />
        <path d="M -15 -68 Q -28 -88 -8 -82 Q -12 -72 -15 -68 Z" fill={`url(#${uid}_hair)`} stroke="#000000" strokeWidth="4" />
        <path d="M 5 -69 Q 22 -85 28 -74 Q 18 -68 5 -69 Z" fill={`url(#${uid}_hair)`} stroke="#000000" strokeWidth="4" />

        {/* Eyebrows */}
        {eyes === "shock_wide" || pose === "panic_shake" ? (
          <g>
            <path d="M -30 -28 Q -20 -38 -8 -30" fill="none" stroke="#451a03" strokeWidth="5" strokeLinecap="round" />
            <path d="M 8 -30 Q 20 -38 30 -28" fill="none" stroke="#451a03" strokeWidth="5" strokeLinecap="round" />
          </g>
        ) : eyes === "closed_peaceful" ? (
          <g>
            <path d="M -28 -18 Q -18 -24 -8 -20" fill="none" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
            <path d="M 8 -20 Q 18 -24 28 -18" fill="none" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d="M -28 -20 Q -18 -25 -8 -20" fill="none" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
            <path d="M 8 -20 Q 18 -25 28 -20" fill="none" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* Expressive Anime/Cartoon Eyes with Catchlights */}
        {isBlinking || eyes === "closed_peaceful" ? (
          <g>
            <path d="M -28 -4 Q -18 8 -8 -4" fill="none" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
            <path d="M 8 -4 Q 18 8 28 -4" fill="none" stroke="#000000" strokeWidth="5" strokeLinecap="round" />
          </g>
        ) : eyes === "shock_wide" || pose === "panic_shake" ? (
          <g>
            <circle cx="-18" cy="-6" r="14" fill="#ffffff" stroke="#000000" strokeWidth="4.5" />
            <circle cx="18" cy="-6" r="14" fill="#ffffff" stroke="#000000" strokeWidth="4.5" />
            <circle cx="-18" cy="-6" r="5.5" fill="#000000" />
            <circle cx="18" cy="-6" r="5.5" fill="#000000" />
            <circle cx="-16" cy="-8" r="2.2" fill="#ffffff" />
            <circle cx="20" cy="-8" r="2.2" fill="#ffffff" />
          </g>
        ) : (
          <g>
            <ellipse cx="-18" cy="-4" rx="11" ry="14" fill="#ffffff" stroke="#000000" strokeWidth="4" />
            <ellipse cx="18" cy="-4" rx="11" ry="14" fill="#ffffff" stroke="#000000" strokeWidth="4" />
            <ellipse cx="-17" cy="-3" rx="6.5" ry="8.5" fill="#0f172a" />
            <ellipse cx="19" cy="-3" rx="6.5" ry="8.5" fill="#0f172a" />
            <circle cx="-19" cy="-6" r="2.5" fill="#ffffff" />
            <circle cx="-15" cy="-1" r="1.5" fill="#ffffff" />
            <circle cx="17" cy="-6" r="2.5" fill="#ffffff" />
            <circle cx="21" cy="-1" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* Nose */}
        <path d="M -2 4 Q 0 7 3 5" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mouths */}
        {mouth === "dropped_jaw" || pose === "panic_shake" ? (
          <g transform="translate(0, 18)">
            <path d="M -14 0 Q 0 -4 14 0 C 16 16 -16 16 -14 0 Z" fill="#7f1d1d" stroke="#000000" strokeWidth="4" />
            <rect x="-8" y="0" width="16" height="4" rx="1" fill="#ffffff" />
            <ellipse cx="0" cy="11" rx="8" ry="4" fill="#f43f5e" />
          </g>
        ) : mouth === "snore_mouth" ? (
          <ellipse cx="0" cy="20" rx="6" ry="8" fill="#450a0a" stroke="#000000" strokeWidth="3" />
        ) : mouth === "talking_cycle" || isAudioActive ? (
          <g transform={`translate(0, 18) scale(1, ${0.5 + talkFlap * 0.9})`}>
            <ellipse cx="0" cy="0" rx="9" ry="7" fill="#7f1d1d" stroke="#000000" strokeWidth="3.5" />
            <rect x="-6" y="-5" width="12" height="3" fill="#ffffff" />
            <ellipse cx="0" cy="3" rx="5" ry="3" fill="#f43f5e" />
          </g>
        ) : (
          <path d="M -10 18 Q 0 25 10 18" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
        )}

        {/* Sweat Droplet */}
        {(pose === "panic_shake" || eyes === "shock_wide") && (
          <g transform="translate(32, -18)">
            <path d="M 0 -10 Q 6 0 0 8 Q -6 0 0 -10 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <circle cx="-1" cy="2" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* Headwear Accoutrements */}
        {(headwear === "nightcap" || headwear === "headset_nightcap") && (
          <g transform="translate(10, -68) rotate(-18)">
            <path d="M -38 0 C -42 -40 25 -65 65 -50 C 40 -30 25 -10 32 0 Z" fill="#ef4444" stroke="#000000" strokeWidth="5" />
            <path d="M -15 -28 Q 0 -35 25 -22" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 10 -48 Q 28 -52 48 -40" stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="70" cy="-50" r="14" fill="#ffffff" stroke="#000000" strokeWidth="4" />
          </g>
        )}

        {(headwear === "headset" || headwear === "headset_nightcap") && (
          <g>
            <path d="M -48 -30 Q 0 -65 48 -30" fill="none" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
            <rect x="-56" y="-15" width="16" height="32" rx="6" fill="#1e293b" stroke="#000000" strokeWidth="4" />
            <rect x="40" y="-15" width="16" height="32" rx="6" fill="#1e293b" stroke="#000000" strokeWidth="4" />
            <path d="M 46 5 Q 35 30 14 26" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <circle cx="12" cy="26" r="5" fill="#38bdf8" />
          </g>
        )}

        {/* Snore Bubbles */}
        {showSnoreBubbles && (
          <g transform="translate(35, -45)">
            {[0, 1, 2].map((idx) => {
              const loop = (frame * 1.5 + idx * 35) % 90;
              const zX = Math.sin(frame * 0.1 + idx) * 16 + idx * 12;
              const zY = -loop * 1.8;
              const op = Math.sin((loop / 90) * Math.PI);
              const sz = 0.7 + (loop / 90) * 0.7;
              return (
                <g key={`snore_z_${idx}`} transform={`translate(${zX}, ${zY}) scale(${sz})`} opacity={op}>
                  <text
                    x="0"
                    y="0"
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="4"
                    paintOrder="stroke fill"
                    fontFamily="'Arial Black', Impact, sans-serif"
                    fontSize="32"
                    fontWeight="900"
                  >
                    Z
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </g>
    </g>
  );
};
