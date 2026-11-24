/**
 * Modular Storytelling Gag Library for "The Great Boston Molasses Tsunami of 1919"
 * Location: src/components/molasses3d/toon/molassesGags.ts
 * 
 * Implements the approved Shot-by-Shot Visual Gag Board:
 * 1. 50 SWIMMING POOLS gauge + 35 MPH Speedometer
 * 2. Tin Foil Tank crinkle + Executive pencil tap
 * 3. Angry Mob ("IT'S STICKY!" protest sign, spoon, kid licking rivet)
 * 4. Painter on ladder with mop brush + "Shhh!" gesture
 * 5. Calendar flip to JAN 15 + Exploding Thermometer
 * 6. Bloated Balloon Tank with green gas bubbles & kettle steam
 * 7. Snapping orange chains + Machine-gun rivets flying at camera
 * 9. Citizen paddling on floating wooden door in 25-ft tsunami
 * 10. Snapping elevated train tracks (matchsticks) + teetering trolley
 * 11. Citizen floating calmly on wooden crate with umbrella
 * 12. Citizen licking finger + Green Acid thought bubble
 * 13. Shoe-pop gag (socked foot out of glued boot) + frozen dog
 * 14. 57 Ketchup bottle whacking -> massive red avalanche
 * 15. Boston brick rowhouse wafting pancake steam + sniffing citizen
 */

import { Pen, thickAngle, INK, mix } from "../../whalter3d/toon/toon";

const BOSTON_SKIN = "#F4D5B8";

// -------------------------------------------------------------
// -------------------------------------------------------------
// SHOT 1: "50 SWIMMING POOLS" GAUGE + 35 MPH SPEEDOMETER
// Layout: Top 14% (y = 240px), Shorter Height (ends at y = 680px)
// Shifted to gx = 115 so it sits cleanly in upper-left sky, leaving the Victorian
// gentleman (head at y ≈ 870, x ≈ 180) 100% visible from top hat to shoes!
// -------------------------------------------------------------
export function drawShot1GaugeAndSpeedo(ctx: CanvasRenderingContext2D, frame: number, progress = 0) {
  const p = new Pen(ctx);

  ctx.save();

  // --- GAUGE (UPPER-LEFT SKY: gx = 115, top: 240px, bottom: 680px) ---
  const gx = 115; // Left of character's head
  const gaugeTopY = 240;
  const gaugeBottomY = 680; // Ends safely ~190px ABOVE top hat (y ≈ 870px)

  // 1. Label Card: "50 SWIMMING POOLS" (y: 240 to 290)
  const cardW = 88;
  const cardTop = gaugeTopY;
  const cardBottom = gaugeTopY + 50;
  p.poly([
    [gx - cardW, cardTop],
    [gx + cardW, cardTop],
    [gx + cardW, cardBottom],
    [gx - cardW, cardBottom],
  ], "#facc15", 4);

  ctx.fillStyle = "#09090b";
  ctx.font = "bold 17px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("50 SWIMMING POOLS", gx, cardTop + 33);

  // Top Brass Collar / Bracket
  p.poly([[gx - 32, cardBottom + 2], [gx + 32, cardBottom + 2], [gx + 32, cardBottom + 12], [gx - 32, cardBottom + 12]], "#b45309", 2.5);

  // 2. Glass Measuring Column (y: 302 to 662)
  const colTop = cardBottom + 12;
  const colBottom = gaugeBottomY - 18;
  const colHalfW = 28;

  // Outer tube backing
  p.poly([
    [gx - colHalfW, colTop],
    [gx + colHalfW, colTop],
    [gx + colHalfW, colBottom],
    [gx - colHalfW, colBottom],
  ], "#1e293b", 4.5);

  // Dark inner reservoir
  p.poly([
    [gx - (colHalfW - 3), colTop + 2],
    [gx + (colHalfW - 3), colTop + 2],
    [gx + (colHalfW - 3), colBottom - 2],
    [gx - (colHalfW - 3), colBottom - 2],
  ], "#0f172a", 0);

  // Rising Thick Molasses Level
  const fillT = Math.min(1.0, 0.44 + progress * 0.56);
  const liquidH = (colBottom - colTop - 4) * fillT;
  const liquidTop = colBottom - 2 - liquidH;

  // Molasses body
  p.poly([
    [gx - (colHalfW - 4), liquidTop],
    [gx + (colHalfW - 4), liquidTop],
    [gx + (colHalfW - 4), colBottom - 2],
    [gx - (colHalfW - 4), colBottom - 2],
  ], "#d97706", 0);

  // Golden amber froth meniscus cap
  p.poly([
    [gx - (colHalfW - 4), liquidTop],
    [gx + (colHalfW - 4), liquidTop],
    [gx + (colHalfW - 4), liquidTop + 10],
    [gx - (colHalfW - 4), liquidTop + 10],
  ], "#f59e0b", 0);

  // Specular glass highlight streak along left edge
  p.stroke([[gx - (colHalfW - 7), colTop + 6], [gx - (colHalfW - 7), colBottom - 6]], 2, "rgba(255, 255, 255, 0.5)");

  // White Measuring Scale Tick Marks along right edge
  const numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    const ty = colBottom - 4 - (i * ((colBottom - colTop - 8) / numTicks));
    p.stroke([[gx + 6, ty], [gx + (colHalfW - 4), ty]], 2, "#f8fafc");
  }

  // Bottom Brass Collar & Mounting Base (y: 662 to 680)
  p.poly([[gx - 32, colBottom], [gx + 32, colBottom], [gx + 32, colBottom + 8], [gx - 32, colBottom + 8]], "#b45309", 2.5);
  p.poly([[gx - 38, colBottom + 8], [gx + 38, colBottom + 8], [gx + 38, gaugeBottomY], [gx - 38, gaugeBottomY]], "#78350f", 3);

  // --- VINTAGE 35 MPH SPEEDOMETER (UPPER-RIGHT: sx = 855, sy = 320) ---
  const sx = 855;
  const sy = 320;
  const sr = 80;

  // Brass outer bezel with heavy ink outline
  p.ell(sx, sy, sr, sr, "#b45309", 6);
  p.ell(sx, sy, sr - 8, sr - 8, "#fef3c7", 3);

  // Redline zone from 30 to 45 MPH
  p.arc(sx, sy, sr - 18, sr - 18, 280, 360, 10, "#ef4444");

  // Speedometer Numerals (0, 15, 30, 35)
  ctx.fillStyle = "#09090b";
  ctx.font = "bold 17px 'Arial Black', sans-serif";
  ctx.fillText("0", sx - 42, sy + 34);
  ctx.fillText("15", sx - 48, sy - 14);
  ctx.fillText("30", sx, sy - 44);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 21px Impact, sans-serif";
  ctx.fillText("35 MPH", sx + 36, sy - 16);

  // Pinning Needle (Violently vibrating at 35 MPH redline)
  const needleJitter = Math.sin(frame * 0.95) * 0.09;
  const needleAngle = 0.46 + needleJitter;
  const nx = sx + Math.cos(needleAngle) * 60;
  const ny = sy - Math.sin(needleAngle) * 60;
  // Needle stroke with black outline
  p.stroke([[sx, sy], [nx, ny]], 5, INK);
  p.stroke([[sx, sy], [nx, ny]], 2.8, "#ef4444");
  p.dot(sx, sy, 7, INK);
  p.dot(sx, sy, 4.5, "#d97706");

  // Steaming Hiss Puffs from Speedometer
  const steamPulse = Math.sin(frame * 0.5) * 4;
  p.ell(sx + 52 + steamPulse, sy - 62, 12, 10, "#ffffff", 2);
  p.ell(sx + 68 + steamPulse, sy - 75, 15, 12, "#ffffff", 2);

  ctx.restore();
}

// -------------------------------------------------------------
// SHOT 5: CALENDAR FLIP ("JAN 15") + EXPLODING THERMOMETER
// -------------------------------------------------------------
export function drawShot5CalendarAndThermometer(ctx: CanvasRenderingContext2D, frame: number, progress = 0) {
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);
  const u = 2.4;

  ctx.save();
  ctx.translate(512, 512);

  // --- RETRO WALL CALENDAR (LEFT / CENTER) ---
  const cx = -155;
  const cy = -20;
  const cw = 110 * u;
  const ch = 135 * u;

  // Calendar wooden hanger backboard
  p.poly([[cx - cw - 10 * u, cy - ch - 25 * u], [cx + cw + 10 * u, cy - ch - 25 * u], [cx + cw + 10 * u, cy + ch + 10 * u], [cx - cw - 10 * u, cy + ch + 10 * u]], "#78350f", 5 * u);
  // Metal hanging rings
  p.ell(cx - 50 * u, cy - ch - 20 * u, 8 * u, 8 * u, "#94a3b8", 3 * u);
  p.ell(cx + 50 * u, cy - ch - 20 * u, 8 * u, 8 * u, "#94a3b8", 3 * u);

  // White Calendar Paper Pad
  p.poly([[cx - cw, cy - ch], [cx + cw, cy - ch], [cx + cw, cy + ch], [cx - cw, cy + ch]], "#f8fafc", 4 * u);

  // Red Header Bar: "JANUARY 1919"
  p.poly([[cx - cw, cy - ch], [cx + cw, cy - ch], [cx + cw, cy - ch + 45 * u], [cx - cw, cy - ch + 45 * u]], "#dc2626", 0);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("JANUARY 1919", cx, cy - ch + 32 * u);

  // Giant Bold Red Date: "15"
  ctx.fillStyle = "#09090b";
  ctx.font = "bold 130px Impact, sans-serif";
  ctx.fillText("15", cx, cy + 60 * u);

  ctx.fillStyle = "#64748b";
  ctx.font = "bold 22px 'Arial Black', sans-serif";
  ctx.fillText("WEDNESDAY", cx, cy + 105 * u);

  // Flying torn page corner fluttering off in heatwave wind
  const flutter = Math.sin(frame * 0.4) * 12 * u;
  p.poly([
    [cx + cw - 35 * u, cy + ch],
    [cx + cw, cy + ch - 35 * u],
    [cx + cw + 15 * u + flutter, cy + ch + 15 * u + flutter]
  ], "#e2e8f0", 2.5 * u);

  // --- OUTDOOR BRASS THERMOMETER (RIGHT SIDE) ---
  const tx = 210;
  const ty = 0;
  const tH = 180 * u;

  // Brass mounting plate
  p.poly([[tx - 35 * u, ty - tH - 20 * u], [tx + 35 * u, ty - tH - 20 * u], [tx + 35 * u, ty + 120 * u], [tx - 35 * u, ty + 120 * u]], "#b45309", 5 * u);

  // Glass tube
  p.poly([[tx - 12 * u, ty - tH], [tx + 12 * u, ty - tH], [tx + 12 * u, ty + 70 * u], [tx - 12 * u, ty + 70 * u]], "#f1f5f9", 3 * u);
  // Bottom bulb
  p.ell(tx, ty + 75 * u, 24 * u, 24 * u, "#ef4444", 4 * u);

  // ROCKETING RED MERCURY
  // Temperature spikes from 2° to boiling 45°
  const heatT = Math.min(1.0, progress * 1.3);
  const mercuryHeight = interpolate(heatT, 0.25, 1.15); // shoots past 1.0 into explosion!
  const mercuryTop = (ty + 70 * u) - ((tH + 70 * u) * Math.min(1.0, mercuryHeight));

  p.poly([[tx - 8 * u, mercuryTop], [tx + 8 * u, mercuryTop], [tx + 8 * u, ty + 70 * u], [tx - 8 * u, ty + 70 * u]], "#dc2626", 0);

  // Temperature Labels: +30° SPIKE! (Positioned safely between calendar and thermometer)
  p.poly([[tx - 110 * u, ty - 60 * u], [tx - 20 * u, ty - 60 * u], [tx - 20 * u, ty - 15 * u], [tx - 110 * u, ty - 15 * u]], "#ef4444", 3 * u);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Impact, sans-serif";
  ctx.fillText("+30° HEAT", tx - 65 * u, ty - 32 * u);

  // EXPLODING TOP BULB PARTICLES (When heatT > 0.75)
  if (heatT > 0.75) {
    const popFrame = frame % 10;
    // Glass shards bursting
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + popFrame * 0.2;
      const dist = 30 * u + popFrame * 8 * u;
      const sx = tx + Math.cos(ang) * dist;
      const sy = (ty - tH) + Math.sin(ang) * dist;
      p.poly([[sx, sy], [sx + 6 * u, sy + 3 * u], [sx + 3 * u, sy + 8 * u]], "#f8fafc", 2 * u);
    }
    // Red mercury droplets popping out the top
    p.dot(tx, ty - tH - 25 * u, 8 * u, "#dc2626");
    p.dot(tx - 15 * u, ty - tH - 35 * u, 6 * u, "#ef4444");
    p.dot(tx + 18 * u, ty - tH - 40 * u, 7 * u, "#ef4444");
  }

  ctx.restore();
}

// -------------------------------------------------------------
// SHOT 3: ANGRY TOWN MOB ("IT'S STICKY!" SIGN, SPOON, LEAK LICKER)
// -------------------------------------------------------------
export function drawShot3AngryMob(ctx: CanvasRenderingContext2D, frame: number, progress = 0) {
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);
  const u = 2.4;

  ctx.save();
  ctx.translate(512, 512);

  // 1. MOTHER ON LEFT WAVING WOODEN SPOON
  const mx = -220;
  const my = 180;
  // Dress & Apron
  p.poly([[mx - 25 * u, my], [mx + 25 * u, my], [mx + 40 * u, my + 180 * u], [mx - 40 * u, my + 180 * u]], "#0284c7", 5 * u);
  p.poly([[mx - 18 * u, my + 20 * u], [mx + 18 * u, my + 20 * u], [mx + 25 * u, my + 160 * u], [mx - 25 * u, my + 160 * u]], "#f8fafc", 3 * u);
  // Head
  p.ell(mx, my - 45 * u, 28 * u, 30 * u, BOSTON_SKIN, 5 * u);
  // Angry Eyes & Screaming Mouth
  p.stroke([[mx - 15 * u, my - 55 * u], [mx - 3 * u, my - 48 * u]], 3 * u, INK);
  p.stroke([[mx + 3 * u, my - 48 * u], [mx + 15 * u, my - 55 * u]], 3 * u, INK);
  p.ell(mx, my - 32 * u, 8 * u, 10 * u, "#5a1e28", 2.5 * u); // screaming mouth
  // Arm waving wooden spoon furiously
  const spoonAng = Math.sin(frame * 0.5) * 0.4;
  const spoonHandX = mx + 30 * u + Math.cos(spoonAng) * 25 * u;
  const spoonHandY = my - 60 * u + Math.sin(spoonAng) * 20 * u;
  p.stroke([[mx + 15 * u, my + 10 * u], [spoonHandX, spoonHandY]], 6 * u, "#0284c7");
  p.dot(spoonHandX, spoonHandY, 6 * u, BOSTON_SKIN);
  p.stroke([[spoonHandX, spoonHandY], [spoonHandX + 22 * u, spoonHandY - 30 * u]], 4 * u, "#b45309"); // spoon handle
  p.ell(spoonHandX + 25 * u, spoonHandY - 35 * u, 8 * u, 12 * u, "#b45309", 2 * u); // spoon bowl
  // Brown molasses drip landing on her hat!
  p.dot(mx, my - 78 * u, 9 * u, "#78350f");

  // 2. MUSTACHIOED SHOPKEEPER IN CENTER HOLDING "IT'S STICKY!" SIGN
  const sx = 0;
  const sy = 140;
  p.poly([[sx - 30 * u, sy], [sx + 30 * u, sy], [sx + 35 * u, sy + 200 * u], [sx - 35 * u, sy + 200 * u]], "#475569", 5 * u);
  p.ell(sx, sy - 50 * u, 32 * u, 34 * u, BOSTON_SKIN, 5 * u);
  // Big black mustache & furious eyebrows
  p.poly([[sx - 20 * u, sy - 35 * u], [sx, sy - 40 * u], [sx + 20 * u, sy - 35 * u], [sx, sy - 25 * u]], "#09090b", 2 * u);
  p.stroke([[sx - 22 * u, sy - 65 * u], [sx - 5 * u, sy - 58 * u]], 4 * u, INK);
  p.stroke([[sx + 5 * u, sy - 58 * u], [sx + 22 * u, sy - 65 * u]], 4 * u, INK);
  // PROTEST SIGN: "IT'S STICKY!"
  const signBob = Math.sin(frame * 0.3) * 6 * u;
  const postX = sx + 50 * u;
  const postY = sy - 100 * u + signBob;
  // Sign pole
  p.stroke([[postX, sy + 60 * u], [postX, postY]], 6 * u, "#78350f");
  // Sign board
  p.poly([[postX - 70 * u, postY - 50 * u], [postX + 70 * u, postY - 50 * u], [postX + 70 * u, postY], [postX - 70 * u, postY]], "#fef08a", 4 * u);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 26px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("IT'S STICKY!", postX, postY - 16 * u);

  // 3. MISCHIEVOUS KID ON RIGHT LICKING THE TANK RIVET
  const kx = 240;
  const ky = 200;
  p.poly([[kx - 18 * u, ky], [kx + 18 * u, ky], [kx + 22 * u, ky + 140 * u], [kx - 22 * u, ky + 140 * u]], "#f97316", 4 * u);
  p.ell(kx, ky - 35 * u, 24 * u, 25 * u, BOSTON_SKIN, 4 * u);
  // Happy closed eyes and big pink tongue licking the golden syrup drip
  p.arc(kx - 8 * u, ky - 40 * u, 6 * u, 4 * u, 20, 160, 2.5 * u);
  p.arc(kx + 8 * u, ky - 40 * u, 6 * u, 4 * u, 20, 160, 2.5 * u);
  p.ell(kx + 15 * u, ky - 28 * u, 8 * u, 12 * u, "#f43f5e", 2 * u); // licking tongue!
  p.dot(kx + 26 * u, ky - 34 * u, 8 * u, "#d97706"); // sweet amber drip!

  ctx.restore();
}

// -------------------------------------------------------------
// SHOT 12: CITIZEN LICKING FINGER + GREEN ACID THOUGHT BUBBLE
// -------------------------------------------------------------
export function drawShot12AcidContrast(ctx: CanvasRenderingContext2D, frame: number, progress = 0) {
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);
  const u = 2.4;

  ctx.save();
  ctx.translate(512, 512);

  // CITIZEN IN CENTER KNEE-DEEP IN SYRUP LICKING FINGER
  const cx = -60;
  const cy = 120;

  // Brown syrup flood line at knee height
  p.poly([[-400, cy + 100 * u], [400, cy + 100 * u], [400, 450], [-400, 450]], "#78350f", 4 * u);

  // Trenchcoat Torso
  p.poly([[cx - 32 * u, cy], [cx + 32 * u, cy], [cx + 38 * u, cy + 110 * u], [cx - 38 * u, cy + 110 * u]], "#334155", 5 * u);
  // Head
  p.ell(cx, cy - 45 * u, 32 * u, 34 * u, BOSTON_SKIN, 5 * u);
  // Smiling eyes & happy grin
  p.arc(cx - 10 * u, cy - 50 * u, 7 * u, 5 * u, 20, 160, 3 * u);
  p.arc(cx + 10 * u, cy - 50 * u, 7 * u, 5 * u, 20, 160, 3 * u);
  p.arc(cx, cy - 30 * u, 10 * u, 8 * u, 20, 160, 3 * u); // pleasant grin

  // Hand raised licking index finger
  const lickBob = Math.sin(frame * 0.25) * 3 * u;
  p.stroke([[cx + 25 * u, cy + 10 * u], [cx + 28 * u, cy - 25 * u + lickBob]], 6 * u, "#334155");
  p.dot(cx + 28 * u, cy - 25 * u + lickBob, 6 * u, BOSTON_SKIN);
  p.dot(cx + 24 * u, cy - 30 * u + lickBob, 5 * u, "#d97706"); // molasses drop on fingertip!

  // THOUGHT BUBBLE (TOP RIGHT): SIZZLING GREEN ACID + SKULL
  const bx = 180;
  const by = -140;

  // Small connector bubbles
  p.dot(cx + 40 * u, cy - 80 * u, 6 * u, "#f8fafc");
  p.dot(cx + 65 * u, cy - 110 * u, 10 * u, "#f8fafc");
  p.dot(bx - 60 * u, by + 40 * u, 14 * u, "#f8fafc");

  // Giant main cloud thought bubble
  p.ell(bx, by, 110 * u, 80 * u, "#f8fafc", 5 * u);
  p.ell(bx - 40 * u, by - 20 * u, 60 * u, 50 * u, "#f8fafc", 0);
  p.ell(bx + 40 * u, by - 20 * u, 60 * u, 50 * u, "#f8fafc", 0);
  p.ell(bx, by + 25 * u, 70 * u, 45 * u, "#f8fafc", 0);

  // Toxic Green Acid Puddle Inside Thought Bubble
  p.poly([[bx - 80 * u, by + 10 * u], [bx + 80 * u, by + 10 * u], [bx + 75 * u, by + 45 * u], [bx - 75 * u, by + 45 * u]], "#22c55e", 0);
  // Sizzling acid bubbles
  p.dot(bx - 40 * u, by + 15 * u, 8 * u, "#4ade80");
  p.dot(bx + 30 * u, by + 20 * u, 10 * u, "#4ade80");

  // Dissolving Streetlamp & Acid Sizzle Smoke
  p.stroke([[bx - 20 * u, by + 10 * u], [bx - 20 * u, by - 35 * u]], 5 * u, "#1e293b"); // melting pole
  // Cartoon Acid Skull Symbol
  p.ell(bx + 20 * u, by - 15 * u, 22 * u, 20 * u, "#ffffff", 3 * u);
  p.dot(bx + 14 * u, by - 18 * u, 4 * u, "#09090b"); // eye socket L
  p.dot(bx + 26 * u, by - 18 * u, 4 * u, "#09090b"); // eye socket R
  p.stroke([[bx + 16 * u, by - 4 * u], [bx + 24 * u, by - 4 * u]], 2.5 * u, "#09090b");

  ctx.restore();
}

// -------------------------------------------------------------
// SHOT 13: THE CLEAN SHOE-POP GAG + FROZEN DOG
// -------------------------------------------------------------
export function drawShot13ShoePop(ctx: CanvasRenderingContext2D, frame: number, progress = 0) {
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);
  const u = 2.4;

  ctx.save();
  ctx.translate(512, 512);

  // Deep brown molasses swamp covering lower street
  p.poly([[-450, 150], [450, 150], [450, 480], [-450, 480]], "#78350f", 5 * u);

  // GENTLEMAN PULLING SOCKED FOOT OUT OF GLUED BOOT
  const gx = -120;
  const gy = 80;

  // Left Leg: firmly planted in syrup
  p.stroke([[gx - 18 * u, gy], [gx - 25 * u, gy + 120 * u]], 7 * u, "#1e293b");

  // Right Leg: Raised high in the air with white sock!
  const legLift = Math.sin(frame * 0.2) * 8 * u;
  const sockFootY = gy + 60 * u + legLift;
  p.stroke([[gx + 18 * u, gy], [gx + 35 * u, sockFootY]], 7 * u, "#1e293b");
  // White sock foot completely bare of shoe!
  p.poly([[gx + 30 * u, sockFootY], [gx + 48 * u, sockFootY + 5 * u], [gx + 46 * u, sockFootY + 20 * u], [gx + 26 * u, sockFootY + 16 * u]], "#f8fafc", 3 * u);
  p.stroke([[gx + 40 * u, sockFootY + 2 * u], [gx + 40 * u, sockFootY + 14 * u]], 2 * u, "#dc2626"); // red sock stripe!

  // The Glued Black Boot: Completely stuck behind down in the brown molasses with syrup strings!
  const bootX = gx + 50 * u;
  const bootY = gy + 130 * u;
  p.poly([[bootX - 12 * u, bootY], [bootX + 16 * u, bootY], [bootX + 18 * u, bootY + 22 * u], [bootX - 14 * u, bootY + 22 * u]], "#000000", 3 * u);
  // Gooey syrup strands connecting boot to lifted sock
  p.stroke([[bootX, bootY], [gx + 38 * u, sockFootY + 18 * u]], 2.5 * u, "#b45309");

  // Gentleman Torso & Panicked Face
  p.poly([[gx - 32 * u, gy - 80 * u], [gx + 32 * u, gy - 80 * u], [gx + 38 * u, gy], [gx - 38 * u, gy]], "#334155", 5 * u);
  p.ell(gx, gy - 125 * u, 32 * u, 34 * u, BOSTON_SKIN, 5 * u);
  // Wide shock eyes & open mouth
  p.ell(gx - 10 * u, gy - 130 * u, 9 * u, 9 * u, "#ffffff", 2 * u);
  p.ell(gx + 10 * u, gy - 130 * u, 9 * u, 9 * u, "#ffffff", 2 * u);
  p.dot(gx - 10 * u, gy - 130 * u, 4 * u, INK);
  p.dot(gx + 10 * u, gy - 130 * u, 4 * u, INK);
  p.ell(gx, gy - 105 * u, 10 * u, 14 * u, INK, 0); // "O" mouth

  // FROZEN STRAY DOG ON RIGHT (Stuck mid-stride like a museum statue)
  const dx = 180;
  const dy = 160;
  // Dog Body & Head
  p.poly([[dx - 45 * u, dy], [dx + 30 * u, dy], [dx + 35 * u, dy + 45 * u], [dx - 40 * u, dy + 45 * u]], "#b45309", 4 * u);
  p.ell(dx + 40 * u, dy - 15 * u, 22 * u, 18 * u, "#b45309", 4 * u);
  p.poly([[dx + 25 * u, dy - 30 * u], [dx + 35 * u, dy - 18 * u], [dx + 20 * u, dy - 18 * u]], "#78350f", 2 * u); // floppy ear
  // Four paws firmly embedded in molasses
  p.stroke([[dx - 35 * u, dy + 45 * u], [dx - 35 * u, dy + 70 * u]], 5 * u, "#78350f");
  p.stroke([[dx + 25 * u, dy + 45 * u], [dx + 25 * u, dy + 70 * u]], 5 * u, "#78350f");

  // Only the dog's eyes dart back and forth!
  const dogDart = (Math.floor(frame / 30) % 2 === 0) ? -3 * u : 3 * u;
  p.ell(dx + 42 * u, dy - 18 * u, 7 * u, 7 * u, "#ffffff", 2 * u);
  p.dot(dx + 42 * u + dogDart, dy - 18 * u, 3.5 * u, INK);

  ctx.restore();
}

// -------------------------------------------------------------
// SHOT 14: THE 57 KETCHUP BOTTLE WHACK -> RED AVALANCHE
// -------------------------------------------------------------
export function drawShot14KetchupGag(ctx: CanvasRenderingContext2D, frame: number, progress = 0) {
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);
  const u = 2.4;

  ctx.save();
  ctx.translate(512, 512);

  // Table Surface & White Porcelain Plate
  p.poly([[-450, 220], [450, 220], [450, 480], [-450, 480]], "#b45309", 5 * u); // wood table
  p.ell(0, 250, 160 * u, 45 * u, "#f8fafc", 5 * u); // plate rim
  p.ell(0, 250, 120 * u, 32 * u, "#e2e8f0", 3 * u); // plate center

  // Silver Fork on Left
  p.stroke([[-180 * u, 240], [-180 * u, 280]], 5 * u, "#94a3b8");
  p.poly([[-185 * u, 225], [-175 * u, 225], [-175 * u, 240], [-185 * u, 240]], "#94a3b8", 2 * u);

  // KETCHUP BOTTLE INVERTED OVER PLATE
  const bx = 0;
  const by = 40;

  // Bottle Body (Glass octagon)
  p.poly([
    [bx - 35 * u, by - 140 * u],
    [bx + 35 * u, by - 140 * u],
    [bx + 45 * u, by],
    [bx + 18 * u, by + 60 * u],
    [bx - 18 * u, by + 60 * u],
    [bx - 45 * u, by]
  ], "#dc2626", 5 * u);

  // White "57" Diamond Label
  p.poly([[bx, by - 80 * u], [bx + 28 * u, by - 55 * u], [bx, by - 30 * u], [bx - 28 * u, by - 55 * u]], "#f8fafc", 3 * u);
  ctx.fillStyle = "#09090b";
  ctx.font = "bold 24px Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("57", bx, by - 48 * u);

  // CARTOON HAND SLAPPING BOTTLE BOTTOM
  const whackCycle = (frame % 36);
  const isWhacking = whackCycle < 14;
  const handOffset = isWhacking ? Math.sin(whackCycle * 0.6) * 15 * u : 0;
  const hx = bx + 40 * u + handOffset;
  const hy = by - 160 * u;

  p.poly([[hx, hy], [hx + 40 * u, hy - 15 * u], [hx + 35 * u, hy + 25 * u], [hx - 5 * u, hy + 20 * u]], BOSTON_SKIN, 4 * u);
  // Impact Starburst on whack
  if (isWhacking && whackCycle < 5) {
    p.stroke([[bx + 30 * u, by - 150 * u], [bx + 60 * u, by - 170 * u]], 4 * u, "#facc15");
    p.stroke([[bx + 30 * u, by - 130 * u], [bx + 65 * u, by - 120 * u]], 4 * u, "#facc15");
  }

  // RED KETCHUP AVALANCHE (Triggered on second half of progress)
  if (progress > 0.45) {
    const avalancheT = Math.min(1.0, (progress - 0.45) / 0.55);
    const redScale = interpolate(avalancheT, 0.2, 1.35);
    // Huge crimson mountain burying the plate
    p.poly([
      [0 - 140 * u * redScale, 270],
      [0 - 80 * u * redScale, 210 - 40 * u * redScale],
      [0, 160 - 70 * u * redScale],
      [0 + 80 * u * redScale, 210 - 40 * u * redScale],
      [0 + 140 * u * redScale, 270],
      [0, 290]
    ], "#dc2626", 5 * u);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// SHOT 15: BOSTON RED-BRICK WALL + SNIFFING CITIZEN + PANCAKE BUBBLE
// -------------------------------------------------------------
export function drawShot15PancakeBricks(ctx: CanvasRenderingContext2D, frame: number, progress = 0) {
  ctx.clearRect(0, 0, 1024, 1024);
  const p = new Pen(ctx);
  const u = 2.4;

  ctx.save();
  ctx.translate(512, 512);

  // RED BRICK ROWHOUSE WALL (BACKGROUND)
  const brickRows = 8;
  const brickCols = 7;
  const bw = 65 * u;
  const bh = 30 * u;

  for (let r = 0; r < brickRows; r++) {
    const rowOffset = (r % 2 === 0) ? 0 : bw / 2;
    for (let c = -4; c <= 4; c++) {
      const bx = c * bw + rowOffset;
      const by = -280 + r * bh;
      p.poly([[bx, by], [bx + bw - 4 * u, by], [bx + bw - 4 * u, by + bh - 4 * u], [bx, by + bh - 4 * u]], (r + c) % 3 === 0 ? "#991b1b" : "#b91c1c", 2 * u);
    }
  }

  // Golden Aroma Steam Waves wafting off the warm bricks
  for (let i = -2; i <= 2; i++) {
    const steamX = i * 75 * u;
    const wave = Math.sin(frame * 0.15 + i) * 15 * u;
    p.stroke([
      [steamX, 100],
      [steamX + wave, 20],
      [steamX - wave, -60],
      [steamX + wave, -140]
    ], 5 * u, "#f59e0b");
  }

  // CITIZEN PRESSING NOSE TO BRICK WALL
  const cx = -100;
  const cy = 120;
  p.poly([[cx - 30 * u, cy], [cx + 30 * u, cy], [cx + 35 * u, cy + 180 * u], [cx - 35 * u, cy + 180 * u]], "#1e293b", 5 * u);
  // Head leaning forward right against brick
  p.ell(cx + 25 * u, cy - 50 * u, 32 * u, 32 * u, BOSTON_SKIN, 5 * u);
  // Big happy cartoon nose pressed against wall
  p.ell(cx + 52 * u, cy - 48 * u, 12 * u, 8 * u, BOSTON_SKIN, 3 * u);
  // Contented closed eyes and ecstatic sniffing smile
  p.arc(cx + 20 * u, cy - 56 * u, 8 * u, 5 * u, 20, 160, 3 * u);
  p.arc(cx + 28 * u, cy - 35 * u, 10 * u, 7 * u, 20, 160, 3 * u);

  // PANCAKE THOUGHT BUBBLE
  const tx = 170;
  const ty = -140;

  // Cloud bubble outline
  p.ell(tx, ty, 100 * u, 75 * u, "#f8fafc", 5 * u);
  p.ell(tx - 35 * u, ty - 20 * u, 55 * u, 45 * u, "#f8fafc", 0);
  p.ell(tx + 35 * u, ty - 20 * u, 55 * u, 45 * u, "#f8fafc", 0);

  // Connectors
  p.dot(cx + 50 * u, cy - 85 * u, 6 * u, "#f8fafc");
  p.dot(cx + 80 * u, cy - 110 * u, 10 * u, "#f8fafc");

  // STACK OF 3 GOLDEN BUTTERED PANCAKES WITH SYRUP
  const py = ty + 15 * u;
  p.ell(tx, py + 16 * u, 55 * u, 16 * u, "#d97706", 3 * u); // bottom pancake
  p.ell(tx, py, 52 * u, 15 * u, "#d97706", 3 * u); // middle pancake
  p.ell(tx, py - 16 * u, 48 * u, 14 * u, "#f59e0b", 3 * u); // top pancake
  // Melting Yellow Butter Square
  p.poly([[tx - 10 * u, py - 26 * u], [tx + 10 * u, py - 26 * u], [tx + 12 * u, py - 16 * u], [tx - 8 * u, py - 16 * u]], "#facc15", 2 * u);
  // Dripping syrup ribbons down stack
  p.stroke([[tx - 15 * u, py - 16 * u], [tx - 15 * u, py + 22 * u]], 4 * u, "#78350f");
  p.stroke([[tx + 20 * u, py - 16 * u], [tx + 22 * u, py + 18 * u]], 4 * u, "#78350f");

  ctx.restore();
}

function interpolate(t: number, a: number, b: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
