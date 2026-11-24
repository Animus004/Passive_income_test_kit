import { Pen, blobPts, headBlob, thickAngle, INK, mul, mix } from "../../whalter3d/toon/toon";

// Balanced BOSTON_SKIN tone albedo to prevent highlight blowout under key light
const BOSTON_SKIN = "#F4D5B8";

export type BostonPose =
  | "gentleman_stroll"
  | "painter_ladder"
  | "skeptical_citizen"
  | "running_scared"
  | "stuck_firefighter"
  | "whacking_ketchup"
  | "pancake_stack";

export interface BostonAnimOpts {
  frame?: number;
  blink?: number;
  headTilt?: number;
  armAngle?: number;
  syrupStretch?: number;
}

/**
 * 2D Paper-Doll Cast Generator for 1919 Boston
 * Authentic period costumes: Top hats, Painter overalls, Firefighter turnouts, Ketchup bottle & Pancakes
 */
export function drawBostonPose(
  ctx: CanvasRenderingContext2D,
  pose: BostonPose,
  opts: BostonAnimOpts = {}
) {
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);
  const frame = opts.frame ?? 0;

  ctx.save();
  ctx.translate(512, 512);
  ctx.scale(0.95, 0.95);
  ctx.translate(-300, -500);

  const cx = 300;
  const sole = 960;
  const u = 2.4; // unit scale
  const ow = 5 * u;
  const light = -Math.PI * 0.65;
  const thick = thickAngle(light);

  if (pose === "gentleman_stroll") {
    // Victorian Gentleman in Top Hat & Long Trenchcoat
    // Subtle alive breathing bob & micro-tilt during camera holds
    const breathCycle = Math.sin(frame * 0.12);
    const headBobY = breathCycle * (1.6 * u);
    const hx = cx;
    const hy = 320 + headBobY;

    // Legs
    p.stroke([[cx - 14 * u, 720], [cx - 16 * u, 950]], 7 * u, "#1e293b");
    p.stroke([[cx + 14 * u, 720], [cx + 20 * u, 950]], 7 * u, "#1e293b");
    // Shiny black boots
    p.poly([[cx - 24 * u, 940], [cx - 6 * u, 940], [cx - 4 * u, 960], [cx - 26 * u, 960]], "#000000", 2 * u);
    p.poly([[cx + 12 * u, 940], [cx + 30 * u, 940], [cx + 32 * u, 960], [cx + 10 * u, 960]], "#000000", 2 * u);

    // Dark Charcoal Trenchcoat
    const coatPts: [number, number][] = [
      [cx - 36 * u, 420],
      [cx + 36 * u, 420],
      [cx + 44 * u, 750],
      [cx - 44 * u, 750],
    ];
    p.poly(coatPts, "#334155", ow);
    // Gold buttons
    for (let by = 460; by <= 680; by += 45) {
      p.dot(cx, by, 3 * u, "#eab308");
    }

    // Walking Cane in Left Hand with subtle breathing sway
    const caneSway = Math.sin(frame * 0.1) * (1.8 * u);
    p.stroke([[cx - 42 * u, 550], [cx - 52 * u + caneSway, 960]], 3.5 * u, "#78350f");
    p.dot(cx - 42 * u, 550, 6 * u, "#eab308"); // gold handle

    // Head with organic breathing bob
    p.ell(hx, hy, 36 * u, 38 * u, BOSTON_SKIN, ow);

    // Eye Dart Logic: Looks back/up at the bulging tank, then nervously darts forward, then snaps back
    const dartCycle = (frame % 80);
    const isDarting = dartCycle > 42 && dartCycle < 62;
    const eyeDartX = isDarting ? -4.5 * u : 0;
    const eyeDartY = isDarting ? 1.8 * u : 0;

    // Expressive Nervous Eyes: Wide sclera
    p.ell(hx - 12 * u, hy - 8, 8 * u, 9 * u, "#ffffff", 2 * u);
    p.ell(hx + 12 * u, hy - 8, 8 * u, 9 * u, "#ffffff", 2 * u);

    // Pupils with responsive darting animation
    p.dot(hx - 8 * u + eyeDartX, hy - 10 + eyeDartY, 4.2 * u, INK);
    p.dot(hx + 16 * u + eyeDartX, hy - 10 + eyeDartY, 4.2 * u, INK);

    // Worried high arched eyebrows with twitch
    const browTwitch = Math.sin(frame * 0.25) * (1.2 * u);
    p.stroke([[hx - 20 * u, hy - 30 + browTwitch], [hx - 6 * u, hy - 22]], 3 * u, INK);
    p.stroke([[hx + 6 * u, hy - 22], [hx + 22 * u, hy - 32 + browTwitch]], 3 * u, INK);

    // Mustache
    p.poly([
      [hx - 22 * u, hy + 22],
      [hx, hy + 15],
      [hx + 22 * u, hy + 22],
      [hx + 16 * u, hy + 32],
      [hx, hy + 25],
      [hx - 16 * u, hy + 32]
    ], "#451a03", 2 * u);

    // Uneasy squiggly mouth under mustache
    p.stroke([[hx - 8 * u, hy + 38], [hx + 2 * u, hy + 41], [hx + 10 * u, hy + 36]], 2.5 * u, INK);

    // Dynamic Sweat-Drop Bob & Quiver on temple
    const sweatBobY = Math.sin(frame * 0.22) * (2.8 * u);
    const sweatR = 3.6 * u + Math.sin(frame * 0.18) * (0.6 * u);
    p.dot(hx + 28 * u, hy - 2 + sweatBobY, sweatR + 1.2 * u, INK); // crisp black ink border
    p.dot(hx + 28 * u, hy - 2 + sweatBobY, sweatR, "#38bdf8"); // bright cyan-blue drop
    p.dot(hx + 27 * u, hy - 3 + sweatBobY, sweatR * 0.4, "#ffffff"); // specular highlight

    // Victorian Silk Top Hat
    p.poly([[hx - 48 * u, hy - 45], [hx + 48 * u, hy - 45], [hx + 46 * u, hy - 35], [hx - 46 * u, hy - 35]], "#000000", 2 * u); // brim
    p.poly([[hx - 32 * u, hy - 190], [hx + 32 * u, hy - 190], [hx + 34 * u, hy - 45], [hx - 34 * u, hy - 45]], "#09090b", ow); // tall crown
    p.poly([[hx - 34 * u, hy - 65], [hx + 34 * u, hy - 65], [hx + 34 * u, hy - 45], [hx - 34 * u, hy - 45]], "#dc2626", 0); // red ribbon

  } else if (pose === "painter_ladder") {
    // Company Painter in White Overalls frantically painting brown paint
    // Natural head nodding & nervous alive animation
    const painterNod = Math.sin(frame * 0.24) * (2.0 * u);
    const phX = cx;
    const phY = 320 + painterNod;

    // White painter trousers with brown syrup splatters
    p.stroke([[cx - 16 * u, 680], [cx - 25 * u, 950]], 8 * u, "#f8fafc");
    p.stroke([[cx + 16 * u, 680], [cx + 10 * u, 950]], 8 * u, "#f8fafc");
    // Painter Boots
    p.dot(cx - 25 * u, 950, 7 * u, "#475569");
    p.dot(cx + 10 * u, 950, 7 * u, "#475569");

    // White overalls
    const overPts: [number, number][] = [
      [cx - 34 * u, 430],
      [cx + 34 * u, 430],
      [cx + 38 * u, 700],
      [cx - 38 * u, 700],
    ];
    p.poly(overPts, "#f1f5f9", ow);
    // Brown molasses syrup stains on overalls!
    p.dot(cx - 12 * u, 520, 9 * u, "#78350f");
    p.dot(cx + 15 * u, 610, 11 * u, "#78350f");
    p.dot(cx - 4 * u, 660, 7 * u, "#78350f");

    // Left arm holding brown paint bucket (with crisp ink border)
    p.stroke([[cx - 25 * u, 440], [cx - 45 * u, 540]], 9 * u, INK);
    p.stroke([[cx - 25 * u, 440], [cx - 45 * u, 540]], 6 * u, "#f8fafc");
    p.dot(cx - 45 * u, 540, 8 * u, INK);
    p.dot(cx - 45 * u, 540, 6 * u, BOSTON_SKIN);
    // Metal bucket with dark brown paint
    p.poly([[cx - 60 * u, 550], [cx - 30 * u, 550], [cx - 35 * u, 620], [cx - 55 * u, 620]], "#94a3b8", 2 * u);
    p.poly([[cx - 58 * u, 552], [cx - 32 * u, 552], [cx - 32 * u, 565], [cx - 58 * u, 565]], "#78350f", 0); // bucket full of brown molasses!

    // 2-KEYFRAME LOOPING ARM STROKE (±15° wrist/elbow swing) with CRISP INK BORDER LAYER
    const strokeLoop = Math.sin(frame * 0.26); // smooth looping brush rhythm
    const strokeAng = strokeLoop * (15 * Math.PI / 180); // ±15° wrist/elbow swing
    const shoulderX = cx + 25 * u;
    const shoulderY = 440;
    const elbowX = shoulderX + 22 * u + Math.sin(strokeAng) * (14 * u);
    const elbowY = shoulderY - 25 * u - Math.cos(strokeAng) * (8 * u);
    const handX = elbowX + 26 * u + Math.cos(strokeAng * 1.25) * (20 * u);
    const handY = elbowY - 24 * u + Math.sin(strokeAng * 1.25) * (16 * u);

    // LAYER 1: Solid #000000 comic ink border around arm to prevent sleeve blending into white overalls
    p.stroke([[shoulderX, shoulderY], [elbowX, elbowY], [handX, handY]], 9.5 * u, INK);
    // LAYER 2: White sleeve fill on top of outline
    p.stroke([[shoulderX, shoulderY], [elbowX, elbowY], [handX, handY]], 6.0 * u, "#f8fafc");

    // Hand holding brush: ink outline + skin fill
    p.dot(handX, handY, 8.0 * u, INK);
    p.dot(handX, handY, 5.8 * u, BOSTON_SKIN);

    // Wooden Paintbrush with crisp outline and dripping molasses
    const handleStartX = handX - 8 * u;
    const handleStartY = handY + 6 * u;
    const handleEndX = handX + 26 * u + Math.cos(strokeAng) * (8 * u);
    const handleEndY = handY - 22 * u + Math.sin(strokeAng) * (8 * u);
    // Handle outline + wood fill
    p.stroke([[handleStartX, handleStartY], [handleEndX, handleEndY]], 5.5 * u, INK);
    p.stroke([[handleStartX, handleStartY], [handleEndX, handleEndY]], 3.5 * u, "#b45309");

    // Paintbrush Bristles swinging against the tank
    const bristleTipX = handleEndX + 20 * u + Math.sin(strokeAng) * (10 * u);
    const bristleTipY = handleEndY - 14 * u - Math.cos(strokeAng) * (8 * u);
    p.poly([
      [handleEndX - 6 * u, handleEndY - 4 * u],
      [bristleTipX - 4 * u, bristleTipY - 6 * u],
      [bristleTipX + 8 * u, bristleTipY + 6 * u],
      [handleEndX + 6 * u, handleEndY + 4 * u]
    ], "#451a03", 2 * u);

    // Wet brown paint drip from brush tip swinging in rhythm
    const dripY = bristleTipY + 10 * u + Math.sin(frame * 0.35) * (3.5 * u);
    p.dot(bristleTipX + 2 * u, dripY, 5.5 * u + Math.sin(frame * 0.2) * 1.5, "#78350f");

    // Head with white painter cap
    p.ell(phX, phY, 34 * u, 36 * u, BOSTON_SKIN, ow);
    // Shifty eyes glancing sideways at the tank leaks
    const painterEyeShift = Math.sin(frame * 0.15) * (2.5 * u);
    p.dot(phX - 8 * u + painterEyeShift, phY - 2, 4 * u, INK);
    p.dot(phX + 16 * u + painterEyeShift, phY - 2, 4 * u, INK);
    // Nervous tense grin
    p.stroke([[phX - 10 * u, phY + 25], [phX + 12 * u, phY + 22]], 3 * u, INK);

    // Painter flat cap with ink outline
    p.poly([[phX - 42 * u, phY - 40], [phX + 42 * u, phY - 40], [phX + 25 * u, phY - 90], [phX - 35 * u, phY - 90]], "#e2e8f0", ow);
    p.stroke([[phX + 25 * u, phY - 40], [phX + 52 * u, phY - 38]], 3.5 * u, "#94a3b8"); // visor

  } else if (pose === "running_scared") {
    // Frantically fleeing citizen with flying bowler hat and screaming face
    const runCycle = Math.sin(frame * 0.7);
    const legL_X = cx - 35 * u * runCycle;
    const legL_Y = 880 + Math.abs(runCycle) * 40;
    const legR_X = cx + 35 * u * runCycle;
    const legR_Y = 880 + (1 - Math.abs(runCycle)) * 40;

    // Running legs
    p.stroke([[cx - 15 * u, 650], [legL_X, legL_Y]], 8 * u, "#1e293b");
    p.stroke([[cx + 15 * u, 650], [legR_X, legR_Y]], 8 * u, "#1e293b");
    p.dot(legL_X, legL_Y, 8 * u, "#000000");
    p.dot(legR_X, legR_Y, 8 * u, "#000000");

    // Flapping brown trenchcoat leaning forward
    const coatLean = 30;
    const coatPts: [number, number][] = [
      [cx - 36 * u + coatLean, 430],
      [cx + 36 * u + coatLean, 430],
      [cx + 48 * u, 700],
      [cx - 52 * u, 670],
    ];
    p.poly(coatPts, "#78350f", ow);

    // Arms waving in panic!
    const armWave = Math.sin(frame * 0.9);
    p.stroke([[cx - 30 * u + coatLean, 440], [cx - 75 * u, 370 + armWave * 30]], 6.5 * u, "#78350f");
    p.stroke([[cx + 30 * u + coatLean, 440], [cx + 80 * u, 360 - armWave * 30]], 6.5 * u, "#78350f");
    p.dot(cx - 75 * u, 370 + armWave * 30, 6.5 * u, BOSTON_SKIN);
    p.dot(cx + 80 * u, 360 - armWave * 30, 6.5 * u, BOSTON_SKIN);

    // Head tilted back in terror
    const headX = cx + coatLean + 10;
    const headY = 320;
    p.ell(headX, headY, 34 * u, 36 * u, BOSTON_SKIN, ow);

    // Huge terrified white circular eyes
    p.ell(headX - 14 * u, headY - 5, 10 * u, 12 * u, "#ffffff", 2 * u);
    p.dot(headX - 14 * u, headY - 5, 3.5 * u, INK);
    p.ell(headX + 14 * u, headY - 5, 10 * u, 12 * u, "#ffffff", 2 * u);
    p.dot(headX + 14 * u, headY - 5, 3.5 * u, INK);

    // Wide screaming mouth
    p.ell(headX, headY + 28, 12 * u, 16 * u, "#450a0a", 2 * u);

    // Bowler hat flying off in the air!
    const hatY = headY - 90 * u - Math.abs(Math.sin(frame * 0.4)) * 30;
    const hatX = headX - 30 * u;
    p.poly([[hatX - 35 * u, hatY + 15 * u], [hatX + 35 * u, hatY + 15 * u], [hatX + 25 * u, hatY - 20 * u], [hatX - 25 * u, hatY - 20 * u]], "#0f172a", ow);
    p.stroke([[hatX - 45 * u, hatY + 15 * u], [hatX + 45 * u, hatY + 15 * u]], 4 * u, "#0f172a");

  } else if (pose === "skeptical_citizen") {
    // Victorian citizen checking heatwave thermometer & bulging tank
    p.stroke([[cx - 15 * u, 680], [cx - 18 * u, 950]], 7.5 * u, "#1e293b");
    p.stroke([[cx + 15 * u, 680], [cx + 18 * u, 950]], 7.5 * u, "#1e293b");
    p.dot(cx - 18 * u, 950, 8 * u, "#000000");
    p.dot(cx + 18 * u, 950, 8 * u, "#000000");

    // Blue Victorian suit coat
    const suitPts: [number, number][] = [
      [cx - 36 * u, 430],
      [cx + 36 * u, 430],
      [cx + 42 * u, 720],
      [cx - 42 * u, 720],
    ];
    p.poly(suitPts, "#1e3a5f", ow);

    // Right arm raised scratching bowler hat
    p.stroke([[cx + 30 * u, 440], [cx + 55 * u, 380], [cx + 35 * u, 280]], 6 * u, "#1e3a5f");
    p.dot(cx + 35 * u, 280, 6 * u, BOSTON_SKIN);

    // Left hand holding handkerchief wiping forehead sweat
    p.stroke([[cx - 30 * u, 440], [cx - 45 * u, 520]], 6 * u, "#1e3a5f");
    p.dot(cx - 45 * u, 520, 6 * u, BOSTON_SKIN);
    p.poly([[cx - 55 * u, 510], [cx - 35 * u, 510], [cx - 40 * u, 560], [cx - 50 * u, 560]], "#ffffff", 2 * u);

    // Head
    p.ell(cx, 320, 34 * u, 36 * u, BOSTON_SKIN, ow);
    // Skeptical / bewildered side-glance
    p.dot(cx - 14 * u, 315, 4 * u, INK);
    p.dot(cx + 10 * u, 315, 4 * u, INK);
    // Sweat drop on forehead!
    p.dot(cx - 24 * u, 290, 4.5 * u, "#38bdf8");
    // Wavy skeptical mouth
    p.stroke([[cx - 12 * u, 348], [cx, 342], [cx + 15 * u, 350]], 3 * u, INK);

    // Bowler Hat
    p.poly([[cx - 40 * u, 280], [cx + 40 * u, 280], [cx + 30 * u, 220], [cx - 30 * u, 220]], "#0f172a", ow);
    p.stroke([[cx - 50 * u, 280], [cx + 50 * u, 280]], 4 * u, "#0f172a");

  } else if (pose === "stuck_firefighter") {
    // Boston Firefighter stuck in knee-deep syrup, pulling leg up
    // Deep brown syrup pool line at y = 820
    const stretch = opts.syrupStretch ?? 1.0;

    // Left leg stuck firmly in syrup
    p.stroke([[cx - 16 * u, 650], [cx - 20 * u, 850]], 8.5 * u, "#1e293b");

    // Right leg lifted in air trying to escape!
    const liftY = 740 - Math.min(100, stretch * 60);
    p.stroke([[cx + 16 * u, 650], [cx + 35 * u, liftY]], 8.5 * u, "#1e293b");
    p.dot(cx + 35 * u, liftY, 8 * u, "#000000"); // foot pulled out of boot!

    // Elastic gooey brown syrup filament stretching from ground to lifted foot!
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.moveTo(cx + 15 * u, 880);
    ctx.quadraticCurveTo(cx + 30 * u, (880 + liftY) / 2, cx + 35 * u, liftY + 5);
    ctx.lineTo(cx + 42 * u, liftY + 5);
    ctx.quadraticCurveTo(cx + 38 * u, (880 + liftY) / 2, cx + 55 * u, 880);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 2 * u;
    ctx.stroke();

    // Firefighter Bright Yellow Coat
    const coatPts: [number, number][] = [
      [cx - 38 * u, 420],
      [cx + 38 * u, 420],
      [cx + 42 * u, 680],
      [cx - 42 * u, 680],
    ];
    p.poly(coatPts, "#eab308", ow);
    // Silver reflective stripes
    p.stroke([[cx - 40 * u, 520], [cx + 40 * u, 520]], 5 * u, "#ffffff");
    p.stroke([[cx - 41 * u, 630], [cx + 41 * u, 630]], 5 * u, "#ffffff");

    // Arms waving in frustration/balance
    p.stroke([[cx - 35 * u, 440], [cx - 65 * u, 380]], 6 * u, "#eab308");
    p.stroke([[cx + 35 * u, 440], [cx + 65 * u, 390]], 6 * u, "#eab308");
    p.dot(cx - 65 * u, 380, 7 * u, "#000000"); // glove
    p.dot(cx + 65 * u, 390, 7 * u, "#000000");

    // Head with shocked expression
    p.ell(cx, 320, 34 * u, 36 * u, BOSTON_SKIN, ow);
    // Shock eyes
    p.ell(cx - 12 * u, 315, 8 * u, 8 * u, "#ffffff", 2 * u);
    p.dot(cx - 12 * u, 315, 3.5 * u, INK);
    p.ell(cx + 12 * u, 315, 8 * u, 8 * u, "#ffffff", 2 * u);
    p.dot(cx + 12 * u, 315, 3.5 * u, INK);
    // O-mouth
    p.ell(cx, 350, 7 * u, 9 * u, "#5a1e28", 2 * u);

    // Red Vintage Firefighter Helmet
    p.poly([[cx - 52 * u, 275], [cx + 52 * u, 275], [cx + 50 * u, 290], [cx - 50 * u, 290]], "#b91c1c", 2 * u); // wide brim
    p.poly([[cx - 36 * u, 160], [cx + 36 * u, 160], [cx + 42 * u, 275], [cx - 42 * u, 275]], "#dc2626", ow); // dome
    p.poly([[cx - 10 * u, 190], [cx + 10 * u, 190], [cx + 12 * u, 230], [cx - 12 * u, 230]], "#fbbf24", 2 * u); // gold shield badge

  } else if (pose === "whacking_ketchup") {
    // 2D Everyday Analogy: Hand whacking the bottom of a glass ketchup bottle over a giant burger!
    // Giant juicy burger on plate
    const plateY = 560;
    // Plate
    p.ell(cx, plateY + 40, 160 * u, 30 * u, "#ffffff", ow);
    // Bottom Bun
    p.poly([[cx - 120 * u, plateY], [cx + 120 * u, plateY], [cx + 110 * u, plateY + 30 * u], [cx - 110 * u, plateY + 30 * u]], "#d97706", ow);
    // Brown Burger Patty
    p.poly([[cx - 125 * u, plateY - 15 * u], [cx + 125 * u, plateY - 15 * u], [cx + 120 * u, plateY], [cx - 120 * u, plateY]], "#451a03", ow);
    // Green Lettuce ruffle
    p.stroke([[cx - 130 * u, plateY - 20 * u], [cx + 130 * u, plateY - 20 * u]], 8 * u, "#22c55e");
    // Yellow Cheese slice dripping
    p.poly([[cx - 110 * u, plateY - 25 * u], [cx + 110 * u, plateY - 25 * u], [cx + 70 * u, plateY - 5 * u], [cx - 60 * u, plateY - 2 * u]], "#facc15", 2 * u);
    // Top Bun (Dome)
    p.ell(cx, plateY - 45 * u, 120 * u, 45 * u, "#d97706", ow, 180, 360);

    // Glass Ketchup Bottle held upside down
    const botX = cx;
    const botY = plateY - 220 * u;
    // Glass bottle body
    p.poly([[botX - 45 * u, botY], [botX + 45 * u, botY], [botX + 35 * u, botY + 140 * u], [botX - 35 * u, botY + 140 * u]], "#dc2626", ow);
    // White label: "KETCHUP 57"
    p.poly([[botX - 38 * u, botY + 30 * u], [botX + 38 * u, botY + 30 * u], [botX + 34 * u, botY + 110 * u], [botX - 34 * u, botY + 110 * u]], "#ffffff", 2 * u);
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("57", botX, botY + 80 * u);

    // Narrow neck & white cap pointed at burger
    p.poly([[botX - 18 * u, botY + 140 * u], [botX + 18 * u, botY + 140 * u], [botX + 15 * u, botY + 190 * u], [botX - 15 * u, botY + 190 * u]], "#ef4444", 2 * u);
    p.poly([[botX - 14 * u, botY + 190 * u], [botX + 14 * u, botY + 190 * u], [botX + 14 * u, botY + 205 * u], [botX - 14 * u, botY + 205 * u]], "#ffffff", 2 * u);

    // EXPLODING KETCHUP SPLAT if frame >= 20!
    if (frame % 30 > 12) {
      // Massive red explosion onto burger
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(cx, plateY - 40 * u, 48 * u, 0, Math.PI * 2);
      ctx.fill();
      // Flying red droplets
      for (let di = 0; di < 8; di++) {
        const ang = (di * Math.PI) / 4;
        const dx = cx + Math.cos(ang) * 90 * u;
        const dy = plateY - 40 * u + Math.sin(ang) * 50 * u;
        p.dot(dx, dy, 7 * u, "#dc2626");
      }
    }

    // Animated Hand whacking the bottom of the bottle!
    const whackOffset = Math.abs(Math.sin(frame * 0.5)) * 25;
    const handY = botY - 30 * u - whackOffset;
    // Palm
    p.ell(botX, handY, 32 * u, 22 * u, BOSTON_SKIN, ow);
    // Finger knuckles
    p.stroke([[botX - 25 * u, handY - 10 * u], [botX + 25 * u, handY - 10 * u]], 5 * u, INK);
    // Action impact lines
    p.stroke([[botX - 50 * u, botY - 5 * u], [botX - 65 * u, botY - 15 * u]], 3 * u, INK);
    p.stroke([[botX + 50 * u, botY - 5 * u], [botX + 65 * u, botY - 15 * u]], 3 * u, INK);

  } else if (pose === "pancake_stack") {
    // Boston Summer Ending: Warm delicious stack of pancakes on windowsill smelling like sweet syrup
    const py = 480;
    // Ceramic Plate
    p.ell(cx, py + 80 * u, 180 * u, 35 * u, "#f8fafc", ow);

    // 4 Fluffy Golden Pancakes stacked up
    const pancakeColors = ["#f59e0b", "#d97706", "#f59e0b", "#d97706"];
    for (let pi = 0; pi < 4; pi++) {
      const curY = py + (3 - pi) * 28 * u;
      p.ell(cx, curY, 140 * u, 28 * u, pancakeColors[pi], ow);
      // Dark golden cooked edge
      p.ell(cx, curY + 6 * u, 138 * u, 24 * u, null, 2 * u);
    }

    // Cube of yellow melting butter on top
    const butterY = py - 35 * u;
    p.poly([[cx - 24 * u, butterY - 20 * u], [cx + 10 * u, butterY - 28 * u], [cx + 28 * u, butterY - 10 * u], [cx - 6 * u, butterY - 2 * u]], "#fde047", 2 * u);
    p.poly([[cx - 24 * u, butterY - 20 * u], [cx - 6 * u, butterY - 2 * u], [cx - 6 * u, butterY + 18 * u], [cx - 24 * u, butterY]], "#eab308", 2 * u);
    p.poly([[cx - 6 * u, butterY - 2 * u], [cx + 28 * u, butterY - 10 * u], [cx + 28 * u, butterY + 10 * u], [cx - 6 * u, butterY + 18 * u]], "#facc15", 2 * u);

    // Glossy amber molasses syrup dripping down the sides!
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.ellipse(cx, py - 5 * u, 80 * u, 18 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    // Drips dripping down the stack
    [[-70, 40], [-25, 65], [35, 75], [80, 45]].forEach(([dx, len]) => {
      p.poly([[cx + dx * u - 6 * u, py], [cx + dx * u + 6 * u, py], [cx + dx * u + 4 * u, py + len * u], [cx + dx * u - 4 * u, py + len * u]], "#78350f", 0);
      p.dot(cx + dx * u, py + len * u, 5 * u, "#78350f");
    });

    // Wavy Cartoon Aroma Steam Lines
    const steamT = frame * 0.08;
    for (const sx of [-50, 0, 50]) {
      ctx.strokeStyle = "rgba(217, 119, 6, 0.7)";
      ctx.lineWidth = 4 * u;
      ctx.beginPath();
      for (let y = 0; y < 140; y += 10) {
        const xOffset = Math.sin(steamT + y * 0.05 + sx) * 16 * u;
        const curX = cx + sx * u + xOffset;
        const curY = py - 70 * u - y * u;
        if (y === 0) ctx.moveTo(curX, curY);
        else ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}
