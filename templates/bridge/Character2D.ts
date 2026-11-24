/**
 * Character2D: Base Procedural 2D-in-3D Character Component for Mr. Omi Cartoon Shorts
 * Location: templates/bridge/Character2D.ts
 * 
 * Provides automatic life-loops so characters never look frozen during camera holds:
 * - Idle breathing (scaleY ±1.5% via Math.sin(frame * 0.12))
 * - Gentle head micro-tilts (Math.sin(frame * 0.08) * 0.035 rad)
 * - Automatic 4-frame eye blink every ~95 frames ([0.5, 1.0, 1.0, 0.5])
 * - Procedural pose drives: idle, painting, pointing, panic, talking
 * - Permanent 2.5px solid #000000 inner outline on foreground arms/hands to prevent torso bleed
 */

import * as THREE from "three";
import { Pen, blobPts, headBlob, thickAngle, INK, mul, mix } from "./toon";

export type CharacterPose = "idle" | "painting" | "pointing" | "panic" | "talking";

export interface Character2DProps {
  frame: number;
  pose?: CharacterPose;
  facing?: number; // -1 = left, 0 = forward, 1 = right
  skinColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  hatType?: "none" | "tophat" | "cap" | "bowler";
  hatColor?: string;
  accessory?: "none" | "cane" | "brush_and_bucket" | "newspaper";
  expression?: "neutral" | "nervous" | "shock" | "grin" | "talking";
  progress?: number; // 0 to 1 shot progression
}

/**
 * Calculates procedural life loop transforms for a 3D sprite mesh
 */
export function getCharacterLifeTransforms(frame: number, baseScaleY = 1.0) {
  // Idle breathing oscillation ±1.5% via Math.sin(frame * 0.12)
  const breath = Math.sin(frame * 0.12);
  const scaleY = baseScaleY * (1.0 + breath * 0.015);
  const scaleX = 1.0 - breath * 0.008; // subtle volume conservation
  
  // Gentle head / body micro-tilt
  const tiltZ = Math.sin(frame * 0.08) * 0.025; // ~1.5 degrees
  
  // Automatic 4-frame eye blink every ~95 frames
  const blinkCycle = frame % 95;
  const isBlinking = blinkCycle < 4;
  const lid = isBlinking ? [0.5, 1.0, 1.0, 0.5][blinkCycle] : 0.0;
  
  return { scaleX, scaleY, tiltZ, lid };
}

/**
 * Draws procedural character onto a 2D canvas with life loops and limb separation
 */
export function drawCharacter2D(
  ctx: CanvasRenderingContext2D,
  props: Character2DProps
) {
  const {
    frame,
    pose = "idle",
    facing = 0,
    skinColor = "#F4D5B8",
    shirtColor = "#f1f5f9",
    pantsColor = "#1e293b",
    hatType = "tophat",
    hatColor = "#09090b",
    accessory = "none",
    expression = "neutral",
  } = props;

  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);

  ctx.save();
  ctx.translate(512, 512);

  // Apply procedural life-loop breathing to the canvas root
  const life = getCharacterLifeTransforms(frame);
  ctx.scale(life.scaleX * 0.95, life.scaleY * 0.95);
  ctx.rotate(life.tiltZ);
  ctx.translate(-300, -500);

  const cx = 300;
  const u = 2.4; // base unit
  const ow = 5 * u; // outer stroke weight
  const INNER_BORDER = 3.2 * u; // permanent inner arm/hand outline weight (>= 2.5px)

  // 1. LEGS & SHOES
  p.stroke([[cx - 15 * u, 700], [cx - 18 * u, 950]], 7.5 * u, pantsColor);
  p.stroke([[cx + 15 * u, 700], [cx + 18 * u, 950]], 7.5 * u, pantsColor);
  p.poly([[cx - 26 * u, 940], [cx - 8 * u, 940], [cx - 6 * u, 960], [cx - 28 * u, 960]], "#000000", 2 * u);
  p.poly([[cx + 10 * u, 940], [cx + 28 * u, 940], [cx + 30 * u, 960], [cx + 8 * u, 960]], "#000000", 2 * u);

  // 2. TORSO (Jacket / Shirt / Overalls)
  const torsoPts: [number, number][] = [
    [cx - 36 * u, 420],
    [cx + 36 * u, 420],
    [cx + 42 * u, 720],
    [cx - 42 * u, 720],
  ];
  p.poly(torsoPts, shirtColor, ow);

  // 3. PROCEDURAL ARM & HAND DRIVERS BY POSE
  let armLAng = 0.0;
  let armRAng = 0.0;
  let handL: [number, number] = [cx - 44 * u, 550];
  let handR: [number, number] = [cx + 44 * u, 550];
  let elbowL: [number, number] = [cx - 40 * u, 480];
  let elbowR: [number, number] = [cx + 40 * u, 480];

  if (pose === "idle") {
    // Subtle relaxed breathing sway
    const armSway = Math.sin(frame * 0.12) * (2.0 * u);
    handL = [cx - 44 * u + armSway, 560];
    handR = [cx + 44 * u - armSway, 560];
  } else if (pose === "painting") {
    // 2-keyframe looping arm stroke: ±15° wrist/elbow swing (~1.2 Hz)
    const paintStroke = Math.sin(frame * 0.26);
    armRAng = paintStroke * (15 * Math.PI / 180); // ±15° swing
    elbowR = [cx + 46 * u + Math.sin(armRAng) * (14 * u), 420 - Math.cos(armRAng) * (8 * u)];
    handR = [elbowR[0] + 26 * u + Math.cos(armRAng * 1.25) * (20 * u), elbowR[1] - 22 * u + Math.sin(armRAng * 1.25) * (16 * u)];
    // Left arm holds paint bucket
    handL = [cx - 44 * u, 540];
  } else if (pose === "pointing") {
    // Right arm firmly extended with subtle authoritative micro-bob
    const pointBob = Math.sin(frame * 0.18) * (4.0 * u);
    elbowR = [cx + 50 * u, 430];
    handR = [cx + 90 * u, 400 + pointBob];
  } else if (pose === "panic") {
    // Frantic waving arms oscillating overhead
    const waveR = Math.sin(frame * 0.45);
    const waveL = Math.cos(frame * 0.45);
    elbowR = [cx + 48 * u, 380 + waveR * 20];
    handR = [cx + 80 * u, 310 + waveR * 35];
    elbowL = [cx - 48 * u, 380 + waveL * 20];
    handL = [cx - 80 * u, 310 + waveL * 35];
  } else if (pose === "talking") {
    // Conversational gesture oscillation with open palm
    const talkGesture = Math.sin(frame * 0.3);
    elbowR = [cx + 45 * u, 440];
    handR = [cx + 65 * u, 440 - talkGesture * 25];
    elbowL = [cx - 42 * u, 450];
    handL = [cx - 55 * u, 490 + talkGesture * 15];
  }

  // --- DRAW LEFT ARM WITH ENFORCED INNER BORDER ---
  // Layer A: Crisp #000000 ink outline to separate arm from torso
  p.stroke([[cx - 30 * u, 430], elbowL, handL], 9.5 * u, INK);
  // Layer B: Shirt fill
  p.stroke([[cx - 30 * u, 430], elbowL, handL], 6.0 * u, shirtColor);
  // Hand Left: ink border + skin fill
  p.dot(handL[0], handL[1], 8.0 * u, INK);
  p.dot(handL[0], handL[1], 5.8 * u, skinColor);

  // --- DRAW RIGHT ARM WITH ENFORCED INNER BORDER ---
  // Layer A: Crisp #000000 ink outline
  p.stroke([[cx + 30 * u, 430], elbowR, handR], 9.5 * u, INK);
  // Layer B: Shirt fill
  p.stroke([[cx + 30 * u, 430], elbowR, handR], 6.0 * u, shirtColor);
  // Hand Right: ink border + skin fill
  p.dot(handR[0], handR[1], 8.0 * u, INK);
  p.dot(handR[0], handR[1], 5.8 * u, skinColor);

  // --- ACCESSORIES (Brush, Cane, Bucket) ---
  if (accessory === "brush_and_bucket" || pose === "painting") {
    // Paint bucket in left hand
    p.poly([[handL[0] - 15 * u, handL[1] + 10], [handL[0] + 15 * u, handL[1] + 10], [handL[0] + 10 * u, handL[1] + 50], [handL[0] - 10 * u, handL[1] + 50]], "#94a3b8", 2 * u);
    p.poly([[handL[0] - 13 * u, handL[1] + 12], [handL[0] + 13 * u, handL[1] + 12], [handL[0] + 13 * u, handL[1] + 20], [handL[0] - 13 * u, handL[1] + 20]], "#78350f", 0);
    // Paintbrush in right hand swinging with arm
    const brushEnd: [number, number] = [handR[0] + 25 * u + Math.cos(armRAng) * 10, handR[1] - 20 * u + Math.sin(armRAng) * 10];
    p.stroke([[handR[0] - 6 * u, handR[1] + 4 * u], brushEnd], 5.5 * u, INK);
    p.stroke([[handR[0] - 6 * u, handR[1] + 4 * u], brushEnd], 3.5 * u, "#b45309");
    // Bristles
    const bristleTip: [number, number] = [brushEnd[0] + 18 * u, brushEnd[1] - 12 * u];
    p.poly([[brushEnd[0] - 5 * u, brushEnd[1] - 3 * u], [bristleTip[0] - 3 * u, bristleTip[1] - 5 * u], [bristleTip[0] + 6 * u, bristleTip[1] + 5 * u], [brushEnd[0] + 5 * u, brushEnd[1] + 3 * u]], "#451a03", 2 * u);
    p.dot(bristleTip[0], bristleTip[1] + 8 * u, 5.5 * u, "#78350f");
  } else if (accessory === "cane") {
    p.stroke([[handL[0], handL[1]], [cx - 52 * u, 960]], 3.5 * u, "#78350f");
    p.dot(handL[0], handL[1], 6.0 * u, "#eab308");
  }

  // 4. HEAD & EXPRESSION
  const headBobY = Math.sin(frame * 0.12) * (1.5 * u);
  const hy = 320 + headBobY;
  p.ell(cx, hy, 36 * u, 38 * u, skinColor, ow);

  // Automatic 4-frame eye blink every ~95 frames
  const lid = life.lid;
  const isEyeClosed = lid >= 0.8;

  // Eyes
  if (isEyeClosed) {
    // 4-frame closed blink line
    p.stroke([[cx - 18 * u, hy - 8], [cx - 6 * u, hy - 8]], 3.5 * u, INK);
    p.stroke([[cx + 6 * u, hy - 8], [cx + 18 * u, hy - 8]], 3.5 * u, INK);
  } else {
    // Open eyes with wide sclera and responsive pupils
    p.ell(cx - 12 * u, hy - 8, 8 * u, 9 * u, "#ffffff", 2 * u);
    p.ell(cx + 12 * u, hy - 8, 8 * u, 9 * u, "#ffffff", 2 * u);
    
    // Pupils looking in facing direction
    const pOffX = facing === -1 ? -4.0 * u : facing === 1 ? 4.0 * u : 0;
    p.dot(cx - 12 * u + pOffX, hy - 8, 4.2 * u, INK);
    p.dot(cx + 12 * u + pOffX, hy - 8, 4.2 * u, INK);
  }

  // Eyebrows
  p.stroke([[cx - 20 * u, hy - 24], [cx - 6 * u, hy - 20]], 3 * u, INK);
  p.stroke([[cx + 6 * u, hy - 20], [cx + 20 * u, hy - 24]], 3 * u, INK);

  // Mouth
  if (expression === "nervous") {
    p.stroke([[cx - 8 * u, hy + 38], [cx + 2 * u, hy + 41], [cx + 10 * u, hy + 36]], 2.5 * u, INK);
  } else if (expression === "shock") {
    p.ell(cx, hy + 36, 6 * u, 8 * u, INK, 0);
  } else {
    p.stroke([[cx - 10 * u, hy + 36], [cx + 10 * u, hy + 36]], 2.5 * u, INK);
  }

  // 5. HAT (Top Hat / Flat Cap)
  if (hatType === "tophat") {
    p.poly([[cx - 48 * u, hy - 45], [cx + 48 * u, hy - 45], [cx + 46 * u, hy - 35], [cx - 46 * u, hy - 35]], "#000000", 2 * u); // brim
    p.poly([[cx - 32 * u, hy - 190], [cx + 32 * u, hy - 190], [cx + 34 * u, hy - 45], [cx - 34 * u, hy - 45]], hatColor, ow); // crown
    p.poly([[cx - 34 * u, hy - 65], [cx + 34 * u, hy - 65], [cx + 34 * u, hy - 45], [cx - 34 * u, hy - 45]], "#dc2626", 0); // ribbon
  } else if (hatType === "cap") {
    p.poly([[cx - 42 * u, hy - 40], [cx + 42 * u, hy - 40], [cx + 25 * u, hy - 90], [cx - 35 * u, hy - 90]], hatColor, ow);
    p.stroke([[cx + 25 * u, hy - 40], [cx + 52 * u, hy - 38]], 3.5 * u, "#94a3b8");
  }

  ctx.restore();
}
