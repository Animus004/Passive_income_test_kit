import { Pen, blobPts, headBlob, thickAngle, INK, SKIN, mul, mix } from "./toon";

export type WhalterPose =
  | "standing_coffee"
  | "slumped_bench"
  | "slumped_car"
  | "slumped_pilot"
  | "slumped_desk"
  | "holding_flashlight"
  | "sleeping_curb"
  | "waking_bed"
  | "pointing_camera";

const HOODIE = "#2563eb";
const HOODIE_SHADE = "#1d4ed8";
const PANTS = "#334155";
const BOOTS = "#1e1b2e";
const HAIR = "#451a03";
const SH_SKIN: [number, number, number] = [0.96, 0.86, 0.84];
const SH_CLOTH: [number, number, number] = [0.64, 0.66, 0.74];
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";

export interface WhalterAnimOpts {
  frame?: number;
  blink?: number; // 0 = open, 0.5 = half-lidded, 1.0 = shut
  headTilt?: number; // degrees
  lookX?: number; // -1 .. 1
  snotScale?: number; // 0.6 .. 1.4
  breath?: number; // 0 .. 1
  mouthOpen?: number; // 0 .. 1
  seed?: number;
}

/**
 * Mathematical 2D Paper-Doll Whalter Generator (Style Bible v2)
 * - 3.5 Head-Heights adult proportions
 * - Bean head (H/W 0.94, crown 1.75, jaw 2.3, egg -0.12)
 * - Plum ink (#241726) weighted outline
 * - Deadpan lidded eyes (0.26 W spacing)
 * - Dynamic 4-frame blinks, breathing snot bubble, and micro-acting
 * - Zero blush cheeks, zero eye catchlights
 * - Stick limbs (0.055 W) with ink-dot hands
 */
export function drawWhalterPose(
  ctx: CanvasRenderingContext2D,
  pose: WhalterPose,
  opts: WhalterAnimOpts = {}
) {
  const seed = opts.seed ?? 42;
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);

  // Design Canvas: scale 600x1000 coordinate space to fit nicely on 1024x1024
  ctx.save();
  ctx.translate(512, 512);
  ctx.scale(0.95, 0.95);
  ctx.translate(-300, -500);

  const light = -Math.PI * 0.65; // upper-left light
  const thick = thickAngle(light);

  // Adult proportions
  const a = 114;
  const H = headBlob(seed, a, 0);
  const W = 2 * H.a;
  const HH = 2 * H.b;
  const u = W / 100;
  const ow = 5 * u;

  const isSleeping =
    pose === "slumped_bench" ||
    pose === "slumped_car" ||
    pose === "slumped_pilot" ||
    pose === "slumped_desk" ||
    pose === "sleeping_curb";

  // Coordinates
  const sole = 960;
  const torsoH = 1.1 * HH;
  const legH = 1.4 * HH;
  const isGroundSitting = pose === "sleeping_curb";
  const torsoBot = isGroundSitting ? sole - 0.45 * HH : sole - legH;
  const chin = torsoBot - torsoH;
  const hc = chin - H.b;
  const crown = hc - H.b;
  const hipY = torsoBot - 0.12 * HH;
  const cx = 300;

  // -----------------------------------------------------------
  // 1. LEGS (Standing Poses)
  // -----------------------------------------------------------
  if (pose === "standing_coffee" || pose === "holding_flashlight" || pose === "pointing_camera") {
    const legCol = mix(PANTS, INK, 0.45);
    const legW = 7.5 * u;
    const footW = 9.5 * u;

    for (const side of [-1, 1]) {
      const hx = cx + side * 15 * u;
      const fx = cx + side * 22 * u;
      const fy = sole - 4 * u;
      p.stroke([[hx, hipY], [fx, fy]], legW, legCol);
      // Plum shoes
      p.stroke([[fx - side * 4 * u, fy], [fx + side * 14 * u, fy + 0.5 * u]], footW + 2, INK);
      p.stroke([[fx - side * 4 * u, fy], [fx + side * 14 * u, fy + 0.5 * u]], footW, BOOTS);
    }
  } else if (pose === "sleeping_curb") {
    // Slumped sitting on grass with legs relaxed forward
    const legCol = mix(PANTS, INK, 0.45);
    const legW = 7.5 * u;
    const footW = 9.5 * u;
    for (const side of [-1, 1]) {
      const hx = cx + side * 15 * u;
      const kx = cx + side * 46 * u;
      const ky = hipY + 0.18 * HH;
      const fx = cx + side * 66 * u;
      const fy = sole - 10 * u;
      p.stroke([[hx, hipY], [kx, ky], [fx, fy]], legW, legCol);
      p.stroke([[fx - side * 2 * u, fy], [fx + side * 14 * u, fy - 2 * u]], footW, BOOTS);
    }
  } else if (pose === "slumped_bench" || pose === "slumped_car") {
    // Seated / slumped bent legs
    const legCol = mix(PANTS, INK, 0.45);
    const legW = 7.5 * u;
    const footW = 9.5 * u;
    for (const side of [-1, 1]) {
      const hx = cx + side * 15 * u;
      const kx = cx + side * 36 * u;
      const ky = hipY + 0.22 * HH;
      const fx = cx + side * 44 * u;
      const fy = sole - 12 * u;
      p.stroke([[hx, hipY], [kx, ky], [fx, fy]], legW, legCol);
      p.stroke([[fx - side * 2 * u, fy], [fx + side * 12 * u, fy - 4 * u]], footW, BOOTS);
    }
  }

  // -----------------------------------------------------------
  // 2. TORSO & HOODIE (Bean Shape)
  // -----------------------------------------------------------
  const T = {
    a: (0.86 * W) / 2,
    b: torsoH / 2,
    nTop: 2.2,
    nBot: 2.6,
    egg: 0.12,
    asym: 0,
    rot: 0,
    noise: 0.006,
    seed: seed + 5,
  };
  const tcy = torsoBot - T.b;
  const tp = blobPts(cx, tcy, T);

  // Tilt if slumped
  if (isSleeping) {
    p.rot = [0.18, cx, hipY];
  } else {
    p.rot = null;
  }

  // Torso fill & outline
  const jacketCol = pose === "slumped_pilot" ? "#ffffff" : HOODIE;
  p.gradFill(tp, jacketCol, mul(jacketCol, SH_CLOTH), light);

  // Clothing details clipped to torso
  p.clip(tp, () => {
    if (pose === "slumped_pilot") {
      // Pilot black tie & gold epaulets
      p.band([[cx, chin + 10 * u], [cx, torsoBot - 15 * u]], "#0f172a", 6 * u, 1.2 * u);
      p.band([[cx - 32 * u, chin + 12 * u], [cx - 14 * u, chin + 12 * u]], "#eab308", 4 * u, 1.2 * u);
      p.band([[cx + 14 * u, chin + 12 * u], [cx + 32 * u, chin + 12 * u]], "#eab308", 4 * u, 1.2 * u);
    } else if (pose !== "waking_bed") {
      // Kangaroo pocket
      const pkPts = [
        [cx - 24 * u, torsoBot - 28 * u],
        [cx + 24 * u, torsoBot - 28 * u],
        [cx + 20 * u, torsoBot - 6 * u],
        [cx - 20 * u, torsoBot - 6 * u],
      ] as [number, number][];
      p.poly(pkPts, HOODIE_SHADE, 2.5 * u);

      // White Drawstrings
      p.stroke([[cx - 7 * u, chin + 6 * u], [cx - 8 * u, chin + 26 * u]], 2.4 * u, WHITE);
      p.stroke([[cx + 7 * u, chin + 6 * u], [cx + 8 * u, chin + 26 * u]], 2.4 * u, WHITE);
      p.dot(cx - 8 * u, chin + 27 * u, 2.8 * u, WHITE);
      p.dot(cx + 8 * u, chin + 27 * u, 2.8 * u, WHITE);
    }
  });
  p.inkRing(tp, ow, thick);

  // -----------------------------------------------------------
  // 3. ARMS & PROPS
  // -----------------------------------------------------------
  const armCol = mix(jacketCol, INK, 0.45);
  const shL: [number, number] = [cx - 0.78 * T.a, chin + 0.14 * HH];
  const shR: [number, number] = [cx + 0.78 * T.a, chin + 0.14 * HH];

  if (pose === "standing_coffee") {
    // Left arm hanging relaxed
    p.stroke([[shL[0], shL[1]], [cx - 1.15 * T.a, chin + 0.55 * HH], [cx - 1.1 * T.a, torsoBot - 0.05 * HH]], 5.2 * u, armCol);
    p.dot(cx - 1.1 * T.a, torsoBot - 0.05 * HH, 5.5 * u, INK);

    // Right arm bent holding coffee cup
    const handX = cx + 0.85 * T.a + 12 * u;
    const handY = chin + 0.55 * HH;
    p.stroke([[shR[0], shR[1]], [cx + 1.15 * T.a, chin + 0.42 * HH], [handX, handY]], 5.2 * u, armCol);
    p.dot(handX, handY, 5.5 * u, INK);

    // Coffee cup
    p.poly([[handX + 6 * u, handY - 14 * u], [handX + 22 * u, handY - 14 * u], [handX + 19 * u, handY + 12 * u], [handX + 9 * u, handY + 12 * u]], "#ffffff", 2 * u);
    p.poly([[handX + 7.5 * u, handY - 4 * u], [handX + 20.5 * u, handY - 4 * u], [handX + 19.5 * u, handY + 6 * u], [handX + 8.5 * u, handY + 6 * u]], "#b45309", 0);
    p.poly([[handX + 5 * u, handY - 18 * u], [handX + 23 * u, handY - 18 * u], [handX + 23 * u, handY - 14 * u], [handX + 5 * u, handY - 14 * u]], "#dc2626", 2 * u);
  } else if (pose === "holding_flashlight") {
    // Left arm down
    p.stroke([[shL[0], shL[1]], [cx - 1.15 * T.a, chin + 0.55 * HH], [cx - 1.1 * T.a, torsoBot - 0.05 * HH]], 5.2 * u, armCol);
    p.dot(cx - 1.1 * T.a, torsoBot - 0.05 * HH, 5.5 * u, INK);

    // Right arm raised holding flashlight
    const handX = cx + 0.85 * T.a + 14 * u;
    const handY = chin + 0.4 * HH;
    p.stroke([[shR[0], shR[1]], [cx + 1.18 * T.a, chin + 0.3 * HH], [handX, handY]], 5.2 * u, armCol);
    p.dot(handX, handY, 5.5 * u, INK);

    // Yellow flashlight
    p.poly([[handX + 6 * u, handY - 8 * u], [handX + 26 * u, handY - 8 * u], [handX + 26 * u, handY + 8 * u], [handX + 6 * u, handY + 8 * u]], "#eab308", 2 * u);
    p.poly([[handX + 26 * u, handY - 12 * u], [handX + 34 * u, handY - 12 * u], [handX + 34 * u, handY + 12 * u], [handX + 26 * u, handY + 12 * u]], "#0f172a", 2 * u);
    p.ell(handX + 34 * u, handY, 3 * u, 11 * u, "#fef08a", 1.5 * u);
  } else if (pose === "pointing_camera") {
    // Left arm down
    p.stroke([[shL[0], shL[1]], [cx - 1.15 * T.a, chin + 0.55 * HH], [cx - 1.1 * T.a, torsoBot - 0.05 * HH]], 5.2 * u, armCol);
    p.dot(cx - 1.1 * T.a, torsoBot - 0.05 * HH, 5.5 * u, INK);

    // Right arm pointing at viewer
    const handX = cx + 0.7 * T.a + 16 * u;
    const handY = chin + 0.38 * HH;
    p.stroke([[shR[0], shR[1]], [cx + 1.05 * T.a, chin + 0.35 * HH], [handX, handY]], 5.2 * u, armCol);
    // Pointing finger
    p.stroke([[handX, handY], [handX + 16 * u, handY - 4 * u]], 4.5 * u, INK);
    p.dot(handX, handY, 5.5 * u, INK);
  } else if (pose === "waking_bed") {
    // Both arms thrown up clutching head in shock
    p.stroke([[shL[0], shL[1]], [cx - 1.25 * T.a, chin + 0.05 * HH], [cx - 0.65 * T.a, chin - 0.25 * HH]], 5.2 * u, armCol);
    p.dot(cx - 0.65 * T.a, chin - 0.25 * HH, 5.5 * u, INK);

    p.stroke([[shR[0], shR[1]], [cx + 1.25 * T.a, chin + 0.05 * HH], [cx + 0.65 * T.a, chin - 0.25 * HH]], 5.2 * u, armCol);
    p.dot(cx + 0.65 * T.a, chin - 0.25 * HH, 5.5 * u, INK);

    // Teal Duvet across waist
    const duvetPts = [
      [cx - 150 * u, torsoBot - 12 * u],
      [cx + 150 * u, torsoBot - 12 * u],
      [cx + 150 * u, sole + 40 * u],
      [cx - 150 * u, sole + 40 * u],
    ] as [number, number][];
    p.poly(duvetPts, "#0d9488", ow);
    // White sheet fold
    p.poly([[cx - 146 * u, torsoBot - 12 * u], [cx + 146 * u, torsoBot - 12 * u], [cx + 146 * u, torsoBot + 4 * u], [cx - 146 * u, torsoBot + 4 * u]], "#ffffff", 2 * u);
  } else {
    // Sleeping/slumped relaxed arms
    p.stroke([[shL[0], shL[1]], [cx - 1.15 * T.a, chin + 0.45 * HH], [cx - 0.8 * T.a, torsoBot + 0.05 * HH]], 5.2 * u, armCol);
    p.dot(cx - 0.8 * T.a, torsoBot + 0.05 * HH, 5.5 * u, INK);

    p.stroke([[shR[0], shR[1]], [cx + 1.15 * T.a, chin + 0.45 * HH], [cx + 0.8 * T.a, torsoBot + 0.05 * HH]], 5.2 * u, armCol);
    p.dot(cx + 0.8 * T.a, torsoBot + 0.05 * HH, 5.5 * u, INK);
  }

  // -----------------------------------------------------------
  // 4. BEAN HEAD & HAIR
  // -----------------------------------------------------------
  const headRotDeg = opts.headTilt ?? 0;
  const headRot = (headRotDeg * Math.PI) / 180;
  p.rot = headRot ? [headRot, cx, chin] : null;

  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, SKIN, mul(SKIN, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);

  // Hair: Hair cap using head contour + characteristic Whalter spikes
  const cutHair = crown + 0.42 * HH;
  const hairPts = hp.filter(([_, y]) => y < cutHair).map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as [number, number]);
  if (hairPts.length > 2) {
    p.shadedFill(hairPts, HAIR, mul(HAIR, SH_CLOTH), light, H.a, 0.35);
    p.poly(hairPts, null, ow);
    // Characteristic Whalter hair spikes on top
    p.poly([[cx - 15, crown + 10], [cx - 28, crown - 25], [cx - 5, crown - 12]], HAIR, 2.5 * u);
    p.poly([[cx + 10, crown + 10], [cx + 32, crown - 22], [cx + 18, crown - 8]], HAIR, 2.5 * u);
  }

  // Pilot Nightcap (Cut 4)
  if (pose === "slumped_pilot") {
    p.poly([[cx - 55 * u, crown + 20 * u], [cx + 55 * u, crown - 10 * u], [cx + 75 * u, crown + 55 * u], [cx - 30 * u, crown + 35 * u]], "#ef4444", ow);
    p.poly([[cx - 60 * u, crown + 15 * u], [cx + 40 * u, crown - 15 * u], [cx + 40 * u, crown - 4 * u], [cx - 60 * u, crown + 26 * u]], "#ffffff", 2 * u);
    p.dot(cx + 75 * u, crown + 55 * u, 9 * u, "#ffffff");
  }

  // -----------------------------------------------------------
  // 5. DEADPAN / CARTOON FACE (0 BLUSH, 0 CATCHLIGHTS)
  // -----------------------------------------------------------
  const eyeY = hc;
  const eyeGap = 26 * u; // 0.26 W spacing
  const lookOffset = (opts.lookX ?? 0) * 3 * u;
  const blink = opts.blink ?? 0;

  if (isSleeping) {
    // Sleeping curved arc eyes
    p.arc(cx - eyeGap / 2, eyeY, 7 * u, 5 * u, 200, 340, 4.2 * u);
    p.arc(cx + eyeGap / 2, eyeY, 7 * u, 5 * u, 200, 340, 4.2 * u);

    // Peaceful sleeping smile
    p.arc(cx, eyeY + 18 * u, 7 * u, 4 * u, 20, 160, 3.8 * u);

    // Dynamic Translucent Blue Snot Bubble (Breathing inflation/deflation)
    const snotR = Math.max(3 * u, 7 * u * (opts.snotScale ?? 1.0));
    p.ell(cx + 16 * u, eyeY + 16 * u - (snotR - 7 * u) * 0.4, snotR, snotR, "rgba(186, 230, 253, 0.75)", 1.8 * u);
    // Subtle glassy catchlight on the bubble
    p.dot(cx + 16 * u - snotR * 0.32, eyeY + 16 * u - snotR * 0.32, Math.max(1, snotR * 0.22), "rgba(255, 255, 255, 0.85)");
  } else if (pose === "waking_bed") {
    // Shock eyes (wide sclera circles with small black pupils, NO shine dots)
    const shockR = 10 * u;
    for (const side of [-1, 1]) {
      const ex = cx + side * (eyeGap / 2);
      if (blink >= 0.8) {
        p.stroke([[ex - shockR, eyeY], [ex + shockR, eyeY]], 3.8 * u);
      } else {
        p.ell(ex, eyeY, shockR, shockR, WHITE, 2.8 * u);
        p.dot(ex + lookOffset, eyeY, 3.2 * u, INK);
        // High shocked brows
        p.arc(ex, eyeY - 18 * u, 8 * u, 3 * u, 200, 340, 3.5 * u);
      }
    }
    // O-mouth
    p.ell(cx, eyeY + 22 * u, 8 * u, 10 * u, MOUTH, 2.8 * u);
  } else {
    // Iconic Deadpan Lidded Eyes (half-disc with crisp lid line)
    for (const side of [-1, 1]) {
      const ex = cx + side * (eyeGap / 2);
      if (blink >= 0.75) {
        // Fully shut blink dash
        p.stroke([[ex - 8.5 * u, eyeY - u], [ex + 8.5 * u, eyeY - u]], 4.2 * u);
      } else if (blink > 0.25) {
        // Half-lidded transition blink
        p.ell(ex + lookOffset, eyeY - u, 6.5 * u, 2.5 * u, INK, 0, 0, 180);
        p.stroke([[ex - 8.5 * u, eyeY - u], [ex + 8.5 * u, eyeY - u]], 4.0 * u);
      } else {
        // Half-disc pupil
        p.ell(ex + lookOffset, eyeY - u, 6.5 * u, 5.5 * u, INK, 0, 0, 180);
        // Crisp upper lid line
        p.stroke([[ex - 8.5 * u, eyeY - u], [ex + 8.5 * u, eyeY - u]], 3.8 * u);
      }
      // Deadpan brow
      p.stroke([[ex - 8 * u, eyeY - 16 * u], [ex + 8 * u, eyeY - 17 * u]], 3.5 * u);
    }
    // Neutral smirk or talking mouth
    const my = eyeY + 20 * u;
    if (opts.mouthOpen && opts.mouthOpen > 0.25) {
      p.ell(cx, my, 6.5 * u, 3.5 * u * opts.mouthOpen + 2 * u, MOUTH, 2.2 * u);
    } else {
      p.stroke([[cx - 5.5 * u, my], [cx + 5.5 * u, my - 1 * u]], 3.8 * u);
    }
  }

  p.rot = null;
  ctx.restore();
}
