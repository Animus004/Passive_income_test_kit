import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import * as THREE from "three";
import { drawBostonPose, BostonPose } from "./toon/bostonCharacters";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
} from "postprocessing";
import { InkPass, NOINK } from "../whalter3d/post/ink";
import { LensBlurEffect } from "../whalter3d/post/lensblur";
import { GradeEffect, GRADES } from "../whalter3d/post/grade";
import { OutputPass } from "../whalter3d/post/output";

export interface Molasses3dProps {
  currentCut?: number; // 1 to 8
  cutStartFrame?: number;
  language?: "en" | "hi";
}

/**
 * Procedural Riveted Industrial Steel Texture Generator
 * Saturated warm industrial steel (#5C6B73) and warm rust (#7C4D3B)
 */
function createSteelTankTexture(painted = false): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Base steel: Warm industrial steel (#5C6B73) or warm rust company paint (#7C4D3B)
  ctx.fillStyle = painted ? "#7C4D3B" : "#5C6B73";
  ctx.fillRect(0, 0, 512, 512);

  // Subtle warm rust / iron plate tone variations per row
  if (!painted) {
    const rustStops = ["#5C6B73", "#687680", "#7C4D3B", "#5C6B73"];
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = rustStops[r % rustStops.length];
      ctx.fillRect(0, r * 128, 512, 128);
    }
  }

  // Horizontal steel plate seams (crisp dark slate lines)
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 5;
  for (let y = 64; y <= 512; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();

    // Steel rivets along seams with high-contrast metallic highlights
    for (let x = 16; x < 512; x += 32) {
      ctx.fillStyle = painted ? "#a16207" : "#94a3b8";
      ctx.beginPath();
      ctx.arc(x, y - 10, 5, 0, Math.PI * 2);
      ctx.arc(x, y + 10, 5, 0, Math.PI * 2);
      ctx.fill();

      // Bright specular highlight on rivet head so rivets POP
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.arc(x - 1, y - 11, 2, 0, Math.PI * 2);
      ctx.arc(x - 1, y + 9, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sweet glossy dark amber molasses leak drips dripping down seams
  if (!painted) {
    for (let i = 0; i < 12; i++) {
      const lx = (i * 42) + 20;
      const ly = 128 + (i % 3) * 128;
      const lh = 50 + (i % 4) * 28;

      // Dark amber core
      ctx.fillStyle = "rgba(120, 53, 15, 0.95)";
      ctx.fillRect(lx, ly, 7, lh);
      ctx.beginPath();
      ctx.arc(lx + 3.5, ly + lh, 6, 0, Math.PI * 2);
      ctx.fill();

      // Golden syrup specular highlight
      ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
      ctx.fillRect(lx + 1, ly + 4, 2.5, lh - 8);
      ctx.beginPath();
      ctx.arc(lx + 2.5, ly + lh - 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

/**
 * Procedural Brick Warehouse Facade Texture Generator
 */
function createBrickFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Mortar
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(0, 0, 512, 512);

  // Red/Brown Victorian Bricks
  const brickColors = ["#991b1b", "#b91c1c", "#7f1d1d", "#881337"];
  const bw = 38;
  const bh = 14;

  let row = 0;
  for (let y = 4; y < 512; y += bh + 4) {
    const offset = (row % 2) * (bw / 2);
    for (let x = -bw + offset; x < 512; x += bw + 4) {
      ctx.fillStyle = brickColors[(row + Math.floor(x / bw)) % brickColors.length];
      ctx.fillRect(x, y, bw, bh);
    }
    row++;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  return texture;
}

/**
 * Procedural 1919 Victorian Iron Streetlamp with Warm Glowing Lantern
 */
function createVictorianStreetlamp(): THREE.Group {
  const lampGroup = new THREE.Group();
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.35, 12), ironMat);
  base.position.y = 0.175;
  base.castShadow = true;
  lampGroup.add(base);

  // Slender Cast Iron Column
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 2.3, 12), ironMat);
  pole.position.y = 1.35;
  pole.castShadow = true;
  lampGroup.add(pole);

  // Decorative Crossbar
  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), ironMat);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.y = 2.15;
  crossbar.castShadow = true;
  lampGroup.add(crossbar);

  // Lantern Housing Base
  const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.1, 6), ironMat);
  lanternBase.position.y = 2.55;
  lampGroup.add(lanternBase);

  // Glowing Lantern Glass
  const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 6), glassMat);
  lanternGlass.position.y = 2.74;
  lampGroup.add(lanternGlass);

  // Lantern Cap / Roof
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.18, 6), ironMat);
  cap.position.y = 2.98;
  cap.castShadow = true;
  lampGroup.add(cap);

  // Warm PointLight
  const lampLight = new THREE.PointLight(0xfef08a, 1.1, 4.5);
  lampLight.position.y = 2.74;
  lampGroup.add(lampLight);

  return lampGroup;
}

/**
 * Three.js 3D Diorama Stage for "The Great Boston Molasses Tsunami"
 */
export const Molasses3dStage: React.FC<Molasses3dProps> = ({
  currentCut = 1,
  cutStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const f = Math.max(0, frame - cutStartFrame);

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;
    inkPass: InkPass;
    lensPre: LensBlurEffect;
    lensMain: LensBlurEffect;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    baseCamPos: THREE.Vector3;
    baseCamTarget: THREE.Vector3;
    charMesh: THREE.Mesh;
    charTexture: THREE.CanvasTexture;
    charCanvas: HTMLCanvasElement;
    charCtx: CanvasRenderingContext2D;
    animatedProps: { [key: string]: any };
    charPos: THREE.Vector3;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.NoToneMapping; // Strictly handled in OutputPass at end of pipeline!
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 100);

    const animatedProps: { [key: string]: any } = {};

    let initialPose: BostonPose = "gentleman_stroll";
    if (currentCut === 1 || currentCut === 11 || currentCut === 12) initialPose = "gentleman_stroll";
    else if (currentCut === 2 || currentCut === 4) initialPose = "painter_ladder";
    else if (currentCut === 3 || currentCut === 5 || currentCut === 6) initialPose = "skeptical_citizen";
    else if (currentCut === 7 || currentCut === 9 || currentCut === 10) initialPose = "running_scared";
    else if (currentCut === 13) initialPose = "stuck_firefighter";
    else if (currentCut === 14) initialPose = "whacking_ketchup";
    else if (currentCut === 15) initialPose = "pancake_stack";

    // Lighting Rig (Mr. Omi Contrast & Color Rules)
    // 1. Warm Hemisphere Light: sky: #FFF5E4, ground: #283548, intensity: 0.9
    // Ensures zero pixels drop below #1E293B (deep slate/navy) so 3px black ink lines pop everywhere!
    const hemiLight = new THREE.HemisphereLight(0xfff5e4, 0x283548, 0.9);
    scene.add(hemiLight);

    // 2. Balanced Warm Key Sunlight (Lowered to 1.15 to prevent highlight blowout on characters)
    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.15);
    sunLight.position.set(4.5, 7.5, 4.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // 3. Cool Secondary Fill Light (Soft bounce from left/front, lifts all dark pockets)
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.45);
    fillLight.position.set(-5.0, 3.5, 3.5);
    scene.add(fillLight);

    let baseCamPos = new THREE.Vector3(0, 1.65, 5.4);
    let baseCamTarget = new THREE.Vector3(-0.15, 1.35, 0.0);
    let charPos = new THREE.Vector3(-0.52, 1.15, 1.1);

    // -------------------------------------------------------------
    // 3D SCENE BUILDS PER BEAT
    // -------------------------------------------------------------
    if (currentCut === 1) {
      // BEAT 1: THE OPENING HOOK (CHARACTER + DANGER TOGETHER IN 0s-2s)
      scene.background = new THREE.Color(0x7dd3fc);

      // Reframe opening shot: camera lower and closer so character + wave + streetlamp are framed together
      baseCamPos = new THREE.Vector3(0.0, 1.65, 5.2);
      baseCamTarget = new THREE.Vector3(0.0, 1.8, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Cobblestone ground (saturated cel slate, zero dark metallic crush)
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.MeshStandardMaterial({ color: 0x5b6b7f, roughness: 0.85, metalness: 0.0 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Brick Warehouses on Left & Right
      const brickTex = createBrickFacadeTexture();
      const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.8, metalness: 0.0 });

      const wLeft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 3.2), brickMat);
      wLeft.position.set(-2.8, 3.75, -2.5);
      wLeft.castShadow = true;
      wLeft.receiveShadow = true;
      scene.add(wLeft);

      const wRight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 3.2), brickMat);
      wRight.position.set(2.8, 3.75, -2.5);
      wRight.castShadow = true;
      wRight.receiveShadow = true;
      scene.add(wRight);

      // 1. Victorian Streetlamp shifted to far right edge instead of dead center
      const lamp = createVictorianStreetlamp();
      lamp.position.set(1.06, 0.0, 1.35);
      scene.add(lamp);

      // 2. Towering 25-Foot Molasses Tsunami Wave angled from upper-right down toward center-left!
      const waveGroup1 = new THREE.Group();
      waveGroup1.position.set(0.1, 0.65, -1.0);
      waveGroup1.rotation.z = -0.32; // Angle diagonally: upper-right sweeping down toward center-left!
      waveGroup1.rotation.y = 0.16;  // Face angled toward camera on right
      waveGroup1.rotation.x = -0.15; // Curl arching forward overhead

      const waveMat1 = new THREE.MeshStandardMaterial({
        color: 0x78350f, // Rich warm amber molasses brown
        emissive: 0x451a03, // Warm syrup lift so it doesn't crush to flat black
        emissiveIntensity: 0.42,
        roughness: 0.2,
        metalness: 0.15,
        side: THREE.DoubleSide,
      });

      // Curved Arching Tidal Wave Face: smooth procedural loft rising from street directly into the foam crest
      const xMin = -2.6;
      const xMax = 6.4;
      const segsX = 32;
      const segsY = 24;
      const waveGeo = new THREE.PlaneGeometry(xMax - xMin, 1, segsX, segsY);
      const posAttr = waveGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const px = posAttr.getX(i) + (xMin + xMax) / 2;
        const uY = posAttr.getY(i) + 0.5; // 0 (bottom) to 1 (top lip)
        const wy = -0.4 + uY * 2.2 + Math.pow(uY, 2.2) * 0.95; // reaches 2.75 at uY = 1
        const wz = -1.6 + uY * 1.2 + Math.pow(uY, 2.5) * 0.85; // curves forward to +0.45 at uY = 1
        posAttr.setXYZ(i, px, wy, wz);
      }
      waveGeo.computeVertexNormals();
      const waveMesh1 = new THREE.Mesh(waveGeo, waveMat1);
      waveMesh1.castShadow = true;
      waveMesh1.receiveShadow = true;
      waveGroup1.add(waveMesh1);

      // Bright Cream-White Frothy Foam Crest (#FFFBEB) with emissive pop
      const foamMat1 = new THREE.MeshStandardMaterial({
        color: 0xfffbeb, // Bright cream-white (#FFFBEB)
        emissive: 0xfffbeb,
        emissiveIntensity: 0.65, // Bright, vivid cream-white pop!
        roughness: 0.25,
        metalness: 0.0,
      });

      // Continuous curved foam lip along the apex of the curl (from fx = -2.6 to +6.4)
      const foamLip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, xMax - xMin, 20),
        foamMat1
      );
      foamLip.rotation.z = Math.PI / 2;
      foamLip.position.set((xMin + xMax) / 2, 2.75, 0.45);
      waveGroup1.add(foamLip);

      // Overlapping Organic Frothy Foam Curls & Cascading Droplets along the diagonal lip
      // Starts at fx = -2.6 (clearing upper-left gauge) and sweeps to fx = 6.2 (towering in upper-right)
      for (let fx = -2.6; fx <= 6.2; fx += 0.36) {
        // Main tumbling foam crest sphere
        const r1 = 0.35 + Math.sin(fx * 2.8) * 0.08;
        const curl = new THREE.Mesh(new THREE.SphereGeometry(r1, 16, 16), foamMat1);
        curl.position.set(
          fx,
          2.78 + Math.sin(fx * 1.5) * 0.10,
          0.48 + Math.cos(fx * 2.1) * 0.08
        );
        waveGroup1.add(curl);

        // Forward-curling foam droplet / splash hook
        const r2 = 0.22 + Math.cos(fx * 3.4) * 0.05;
        const splash = new THREE.Mesh(new THREE.SphereGeometry(r2, 12, 12), foamMat1);
        splash.position.set(
          fx + 0.10,
          2.52 + Math.sin(fx * 1.8) * 0.08,
          0.72 + Math.sin(fx * 2.5) * 0.06
        );
        waveGroup1.add(splash);

        // Secondary downward drips tumbling into the surge
        if (Math.abs(fx % 1.1) < 0.4) {
          const drip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), foamMat1);
          drip.position.set(fx, 2.22, 0.78);
          waveGroup1.add(drip);
        }
      }

      scene.add(waveGroup1);
      animatedProps.waveGroup1 = waveGroup1;

      // Character position: Prominently in foreground left, looking back at danger in terror
      charPos = new THREE.Vector3(-0.65, 1.15, 1.1);
    } else if (currentCut === 3 || currentCut === 5 || currentCut === 6) {
      // BEAT 3/5/6: HEATWAVE STRIKES & FERMENTATION PRESSURE BUILDS UP
      scene.background = new THREE.Color(0xfde047);

      baseCamPos = new THREE.Vector3(0.0, 2.1, 7.2);
      baseCamTarget = new THREE.Vector3(0.0, 2.6, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Cobblestone ground
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.MeshStandardMaterial({ color: 0x5b6b7f, roughness: 0.85, metalness: 0.0 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Warehouses spaced wider so bright yellow heatwave sky blazes prominently around tank
      const brickTex = createBrickFacadeTexture();
      const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.8, metalness: 0.0 });
      const wLeft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 3.2), brickMat);
      wLeft.position.set(-3.8, 3.75, -2.5);
      scene.add(wLeft);
      const wRight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 3.2), brickMat);
      wRight.position.set(3.8, 3.75, -2.5);
      scene.add(wRight);

      // Gigantic Tank
      const tankTex = createSteelTankTexture(false);
      const tankMat = new THREE.MeshStandardMaterial({
        map: tankTex,
        roughness: 0.75,
        metalness: 0.05,
      });
      const tankMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1.65, 1.65, 5.8, 36),
        tankMat
      );
      tankMesh.position.set(0.0, 2.9, -1.8);
      tankMesh.castShadow = true;
      tankMesh.receiveShadow = true;
      scene.add(tankMesh);
      animatedProps.tankMesh = tankMesh;

      const tankRoof = new THREE.Mesh(
        new THREE.SphereGeometry(1.68, 36, 12, 0, Math.PI * 2, 0, Math.PI * 0.4),
        tankMat
      );
      tankRoof.position.set(0.0, 5.75, -1.8);
      scene.add(tankRoof);

      const ironBandMat = new THREE.MeshStandardMaterial({
        color: 0x384556,
        roughness: 0.75,
        metalness: 0.05,
      });
      for (let by = 0.8; by <= 5.2; by += 1.1) {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(1.68, 1.68, 0.1, 36),
          ironBandMat
        );
        band.position.set(0.0, by, -1.8);
        scene.add(band);
      }

      // 3D Thermometer Sign on brick wall
      const thermGroup = new THREE.Group();
      const tBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1.8, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      thermGroup.add(tBack);

      const mercury = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.4, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      mercury.position.set(0, 0, 0.05);
      thermGroup.add(mercury);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      bulb.position.set(0, -0.7, 0.05);
      thermGroup.add(bulb);

      thermGroup.position.set(-1.5, 2.8, -0.8);
      scene.add(thermGroup);
      animatedProps.thermGroup = thermGroup;
      animatedProps.mercury = mercury;

      charPos = new THREE.Vector3(-0.95, 1.25, 0.3);
    } else if (currentCut === 2) {
      // BEAT 2: THE BROWN PAINT HACK (CLOSE-UP OF LEAKING TANK & PAINTER)
      scene.background = new THREE.Color(0x7dd3fc);

      baseCamPos = new THREE.Vector3(0.0, 1.9, 5.2);
      baseCamTarget = new THREE.Vector3(0.0, 1.6, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Cobblestone
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.MeshStandardMaterial({ color: 0x5b6b7f, roughness: 0.85, metalness: 0.0 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Close-Up Curved Tank Wall (Placed far enough back so ladder & painter never clip)
      const tankTex = createSteelTankTexture(false);
      const tankMat = new THREE.MeshStandardMaterial({ map: tankTex, roughness: 0.75, metalness: 0.05 });
      const tankWall = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 6.0, 48), tankMat);
      tankWall.position.set(0, 2.5, -4.2);
      scene.add(tankWall);

      // Wooden Painter's Ladder leaning against tank
      const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
      const ladderL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.2, 12), woodMat);
      ladderL.position.set(-0.35, 1.5, 0.1);
      ladderL.rotation.x = 0.22;
      scene.add(ladderL);
      const ladderR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.2, 12), woodMat);
      ladderR.position.set(0.35, 1.5, 0.1);
      ladderR.rotation.x = 0.22;
      scene.add(ladderR);
      for (let ry = 0.4; ry <= 2.8; ry += 0.35) {
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 12), woodMat);
        rung.position.set(0.0, ry, 0.1 + (1.5 - ry) * 0.22);
        rung.rotation.z = Math.PI / 2;
        scene.add(rung);
      }

      // Wooden bucket on ground catching leaking brown syrup
      const bucket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.16, 0.38, 16),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      bucket.position.set(0.95, 0.19, 0.3);
      scene.add(bucket);

      charPos = new THREE.Vector3(0.0, 1.65, 0.55); // painter proudly standing on ladder!
    } else if (currentCut === 4) {
      // BEAT 4: MACHINE-GUN RIVETS (THE SNAP)
      scene.background = new THREE.Color(0xf59e0b);

      baseCamPos = new THREE.Vector3(0.0, 1.8, 5.2);
      baseCamTarget = new THREE.Vector3(0.0, 1.5, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Curved Tank Wall bulging in background
      const tankTex = createSteelTankTexture(true);
      const tankWall = new THREE.Mesh(
        new THREE.CylinderGeometry(3.2, 3.2, 5.0, 36),
        new THREE.MeshStandardMaterial({ map: tankTex, roughness: 0.75, metalness: 0.05 })
      );
      tankWall.position.set(-0.4, 2.0, -4.5);
      scene.add(tankWall);
      animatedProps.tankWall = tankWall;

      // Group of 12 Heavy Iron Machine-Gun Rivets
      const rivetGroup = new THREE.Group();
      const rivetMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.35, roughness: 0.4 });
      const rivets: THREE.Mesh[] = [];
      for (let ri = 0; ri < 12; ri++) {
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 12), rivetMat);
        r.rotation.x = Math.PI / 2;
        r.position.set(-1.2 + (ri % 4) * 0.7, 1.0 + Math.floor(ri / 4) * 0.5, -2.5);
        rivetGroup.add(r);
        rivets.push(r);
      }
      scene.add(rivetGroup);
      animatedProps.rivets = rivets;

      charPos = new THREE.Vector3(0.9, 1.25, 0.6);
    } else if (currentCut === 9) {
      // BEAT 9: THE 25-FOOT MOLASSES TSUNAMI EXPLOSION
      scene.background = new THREE.Color(0x38bdf8);

      baseCamPos = new THREE.Vector3(2.2, 2.5, 6.5);
      baseCamTarget = new THREE.Vector3(-0.3, 1.4, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.MeshStandardMaterial({ color: 0x5b6b7f, roughness: 0.85, metalness: 0.0 })
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // Brick buildings along left alley wall
      const brickTex = createBrickFacadeTexture();
      const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.8, metalness: 0.0 });
      const bWall = new THREE.Mesh(new THREE.BoxGeometry(1.5, 7.0, 16.0), brickMat);
      bWall.position.set(-3.2, 3.5, -2.0);
      scene.add(bWall);

      // GIGANTIC 25-FOOT GLOSSY CARAMEL-BROWN MOLASSES TSUNAMI WAVE!
      const waveGroup = new THREE.Group();
      const waveMat = new THREE.MeshStandardMaterial({
        color: 0x854d0e,
        roughness: 0.2,
        metalness: 0.15,
      });

      // Towering Curved Tidal Wave Wall
      const waveCurvature = new THREE.Mesh(
        new THREE.CylinderGeometry(3.0, 3.5, 9.0, 32, 1, false, 0, Math.PI * 0.7),
        waveMat
      );
      waveCurvature.rotation.z = Math.PI / 2;
      waveCurvature.rotation.y = -0.25;
      waveCurvature.position.set(-0.5, 2.6, 0.0);
      waveGroup.add(waveCurvature);

      // White Foam Crest Lip on Wave Top
      const foamMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6, metalness: 0.0 });
      const waveFoam = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.35, 0.5), foamMat);
      waveFoam.rotation.y = -0.25;
      waveFoam.position.set(-0.5, 3.8, 0.5);
      waveGroup.add(waveFoam);

      // Wave Incline Ramp surging along ground
      const waveRamp = new THREE.Mesh(
        new THREE.BoxGeometry(9.0, 1.6, 4.5),
        waveMat
      );
      waveRamp.rotation.y = -0.25;
      waveRamp.position.set(-0.5, 0.8, -1.8);
      waveGroup.add(waveRamp);

      // Surfing Crates & Barrels bobbing on the crest!
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, metalness: 0.0 });
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.7, 16), barrelMat);
      b1.position.set(-1.2, 3.4, 0.8);
      b1.rotation.set(0.5, 0.2, 0.9);
      waveGroup.add(b1);

      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), barrelMat);
      b2.position.set(0.8, 3.1, 0.6);
      b2.rotation.set(-0.4, 0.6, -0.3);
      waveGroup.add(b2);

      waveGroup.position.set(0, 0, -4.5);
      scene.add(waveGroup);
      animatedProps.waveGroup = waveGroup;

      charPos = new THREE.Vector3(0.5, 1.25, 1.4); // fleeing frantically in foreground!
    } else if (currentCut === 10 || currentCut === 6) {
      // BEAT 10: THE BUCKLING ELEVATED RAILWAY TRACKS & TROLLEY
      scene.background = new THREE.Color(0x7dd3fc);

      baseCamPos = new THREE.Vector3(0.0, 2.1, 7.5);
      baseCamTarget = new THREE.Vector3(0.0, 1.8, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Elevated Railway Trestles & Tracks
      const trackGroup = new THREE.Group();
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x384556, metalness: 0.05, roughness: 0.75 });

      // Support pillars
      [-2.2, 0.0, 2.2].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.5, 0.18), ironMat);
        pillar.position.set(px, 1.25, 0);
        trackGroup.add(pillar);
      });

      // Crossbeams and Rails
      const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.18, 1.2), ironMat);
      crossbeam.position.set(0, 2.45, 0);
      trackGroup.add(crossbeam);

      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.08, 0.08), ironMat);
      rail1.position.set(0, 2.58, -0.35);
      trackGroup.add(rail1);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.08, 0.08), ironMat);
      rail2.position.set(0, 2.58, 0.35);
      trackGroup.add(rail2);

      // Green Boston Streetcar / Trolley on Tracks
      const trolleyGroup = new THREE.Group();
      const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
      const trolleyBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 0.85), trolleyMat);
      trolleyBody.position.y = 0.5;
      trolleyGroup.add(trolleyBody);
      const trolleyRoof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.95), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
      trolleyRoof.position.y = 0.98;
      trolleyGroup.add(trolleyRoof);

      trolleyGroup.position.set(0.4, 2.58, 0);
      trackGroup.add(trolleyGroup);

      scene.add(trackGroup);
      animatedProps.trackGroup = trackGroup;
      animatedProps.trolleyGroup = trolleyGroup;

      charPos = new THREE.Vector3(-1.1, 1.15, 0.6);
    } else if (currentCut === 11 || currentCut === 12 || currentCut === 13 || currentCut === 7) {
      // BEAT 11/12/13: FLOODED STREET & STUCK CITIZENS IN SYRUP
      scene.background = new THREE.Color(0xfef3c7);

      baseCamPos = new THREE.Vector3(0.0, 1.8, 5.8);
      baseCamTarget = new THREE.Vector3(0.0, 1.25, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Street flooded with 0.35m deep caramel brown syrup
      const syrupPool = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({
          color: 0x854d0e,
          roughness: 0.2,
          metalness: 0.15,
        })
      );
      syrupPool.rotation.x = -Math.PI / 2;
      syrupPool.position.y = 0.28;
      scene.add(syrupPool);

      // Floating Top Hats in the sweet river
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
      [-1.4, 1.2].forEach((hx, i) => {
        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16), hatMat);
        hat.position.set(hx, 0.35, (i - 0.5) * 1.2);
        hat.rotation.set(0.3, 0.1, 0.4);
        scene.add(hat);
      });

      charPos = new THREE.Vector3(0.0, 1.25, 0.2); // Firefighter standee stuck!
    } else {
      // BEAT 8: THE KETCHUP BOTTLE & BOSTON SUMMER PANCAKE ENDING
      scene.background = new THREE.Color(0xfef3c7);

      baseCamPos = new THREE.Vector3(0.0, 1.6, 5.0);
      baseCamTarget = new THREE.Vector3(0.0, 1.25, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Warm Oak Wood Table / Windowsill
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 0.85, 2.5),
        new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7, metalness: 0.0 })
      );
      table.position.set(0, 0.42, 0);
      scene.add(table);

      charPos = new THREE.Vector3(0.0, 1.25, 0.2);
    }

    // -------------------------------------------------------------
    // HERO 2D CHARACTER STANDEE
    // -------------------------------------------------------------
    const charCanvas = document.createElement("canvas");
    charCanvas.width = 1024;
    charCanvas.height = 1024;
    const charCtx = charCanvas.getContext("2d")!;
    drawBostonPose(charCtx, initialPose);

    const charTexture = new THREE.CanvasTexture(charCanvas);
    charTexture.minFilter = THREE.LinearFilter;
    charTexture.magFilter = THREE.LinearFilter;

    const charGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const charMat = new THREE.MeshStandardMaterial({
      map: charTexture,
      transparent: true,
      alphaTest: 0.05,
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const charMesh = new THREE.Mesh(charGeo, charMat);
    charMesh.position.copy(charPos);
    charMesh.castShadow = true;
    charMesh.layers.set(NOINK);
    scene.add(charMesh);

    // -------------------------------------------------------------
    // POST-PROCESSING PIPELINE (STRICT PASS ORDER)
    // 1. RenderPass
    // 2. InkOutlinePass (3px #000000 solid comic outlines)
    // 3. DepthOfField / BokehPass (lensPre + lensMain)
    // 4. ColorGradePass (GradeEffect)
    // 5. OutputPass (Neutral Tone Mapping + Linear-to-sRGB strictly as final pass)
    // -------------------------------------------------------------
    const composer = new EffectComposer(renderer, { multisampling: 0 });
    composer.setSize(width, height);

    // 1. RenderPass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 2. InkOutlinePass (3px solid #000000 comic outlines that pop everywhere)
    const inkPass = new InkPass(scene, camera, {
      color: "#000000",
      widthNear: 3.0,
      widthFar: 2.2,
      distNear: 5,
      distFar: 70,
      creaseScale: 0.8,
    });
    composer.addPass(inkPass);

    // 3. DepthOfField / BokehPass
    const lensPre = new LensBlurEffect({ maxCoC: 28, nearScale: 1.2, stage: { taps: 8, spread: 0.287, nearTaps: 0, rot: 0.61 } });
    const lensMain = new LensBlurEffect({ maxCoC: 28, nearScale: 1.2, stage: { taps: 20, spread: 0.958, nearTaps: 8, rot: 0 } });
    composer.addPass(new EffectPass(camera, lensPre));
    composer.addPass(new EffectPass(camera, lensMain));

    // 4. ColorGradePass
    const gradeEffect = new GradeEffect(GRADES.day, 0.75);
    composer.addPass(new EffectPass(camera, gradeEffect));

    // 5. OutputPass (Final pass: Khronos Neutral Tone Mapping + Linear-to-sRGB)
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    threeRef.current = {
      renderer,
      composer,
      inkPass,
      lensPre,
      lensMain,
      scene,
      camera,
      baseCamPos,
      baseCamTarget,
      charMesh,
      charTexture,
      charCanvas,
      charCtx,
      animatedProps,
      charPos,
    };

    return () => {
      inkPass.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [width, height, currentCut]);

  // ---------------------------------------------------------------
  // PER-FRAME DYNAMIC PHYSICS & CAMERA CHOREOGRAPHY
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!threeRef.current) return;
    const {
      composer,
      camera,
      baseCamPos,
      baseCamTarget,
      charMesh,
      animatedProps,
      lensPre,
      lensMain,
      charPos,
      charCtx,
      charTexture,
    } = threeRef.current;

    const springPunch = spring({ frame: f, fps, config: { damping: 14, stiffness: 220 } });
    const creepZoom = 1.0 - f * 0.0018;

    const swayX = Math.sin(frame * 0.04) * 0.012;
    const swayY = Math.cos(frame * 0.04) * 0.008;

    let currentCharPos = charPos.clone();
    let charRotZ = 0;
    let activePose: BostonPose = "gentleman_stroll";
    let impactShakeX = 0;
    let impactShakeY = 0;

    if (currentCut === 1) {
      activePose = "gentleman_stroll";
      currentCharPos.y = 1.15 + Math.sin(frame * 0.08) * 0.015;

      // Dynamic 6s progression: imminent rupture visualization (00:00–00:06, f from 0 to 180)
      const tHold = Math.min(1.0, f / 180.0);

      // Swelling seam blister grows larger as internal pressure builds
      if (animatedProps.seamBulge) {
        const bulgeScale = 1.0 + tHold * 0.45 + Math.sin(f * 0.14) * 0.08;
        animatedProps.seamBulge.scale.set(1.4 * bulgeScale, 0.7 * bulgeScale, 0.5 * bulgeScale);
      }

      // Lengthening the drip stream slightly over the 6 seconds
      if (animatedProps.drip2) {
        const dripLen = 1.0 + tHold * 0.35 + Math.sin(f * 0.12) * 0.04;
        animatedProps.drip2.scale.set(1.0 + tHold * 0.15, dripLen, 1.0 + tHold * 0.15);
        // Anchor top of drip at seam level (~1.855), extending downward
        animatedProps.drip2.position.y = 1.855 - (0.95 * dripLen) / 2;
      }

      // Sliding downward teardrop bulb
      if (animatedProps.dropBulb1) {
        const bulbY = 1.855 - (0.95 * (1.0 + tHold * 0.35));
        animatedProps.dropBulb1.position.y = bulbY - Math.abs(Math.sin(f * 0.15)) * 0.03;
        const bulbScale = 1.0 + tHold * 0.3 + Math.sin(f * 0.2) * 0.1;
        animatedProps.dropBulb1.scale.set(bulbScale, bulbScale * 1.25, bulbScale);
      }

      // Scaling the puddle on the floor (scale: 0.6 -> 1.15) over 6 seconds
      if (animatedProps.puddle) {
        const puddleScale = interpolate(tHold, [0, 1], [0.6, 1.15]);
        animatedProps.puddle.scale.set(puddleScale, 1.0, puddleScale);
      }

      // Towering wave surging slightly forward and rising
      if (animatedProps.waveGroup1) {
        const surgeT = interpolate(f, [0, 208], [0, 1], { extrapolateRight: "clamp" });
        animatedProps.waveGroup1.position.set(
          0.1,
          0.65 + surgeT * 0.25,
          -1.0 + surgeT * 0.4
        );
      }
    } else if (currentCut === 2 || currentCut === 4) {
      // Painter on ladder painting brown streaks
      activePose = "painter_ladder";
      currentCharPos.y = 1.65 + Math.sin(frame * 0.3) * 0.02;
    } else if (currentCut === 3 || currentCut === 5 || currentCut === 6) {
      // Bulging steel tank under internal gas pressure & heatwave
      activePose = "skeptical_citizen";
      if (animatedProps.tankMesh) {
        const bulge = 1.0 + Math.sin(f * 0.12) * 0.08;
        animatedProps.tankMesh.scale.set(bulge, 1.0, bulge);
      }
      if (animatedProps.mercury) {
        // Mercury rises in thermometer
        const riseT = Math.min(1.0, f / 120.0);
        animatedProps.mercury.scale.set(1, interpolate(riseT, [0, 1], [0.3, 1.4]), 1);
      }
    } else if (currentCut === 7) {
      // Machine-gun rivets popping off!
      activePose = "running_scared";
      if (animatedProps.rivets && Array.isArray(animatedProps.rivets)) {
        animatedProps.rivets.forEach((r: THREE.Mesh, i: number) => {
          // Continuous staggered looping rivet machine-gun stream
          const rivetLoop = ((f + i * 5) % 32) / 32.0;
          r.position.z = interpolate(rivetLoop, [0, 1], [-2.5, 4.8]);
          r.position.x = -1.2 + (i % 4) * 0.7 + (rivetLoop - 0.5) * 0.6;
          r.rotation.z += 0.35;
          r.rotation.x = Math.PI / 2 + Math.sin(f * 0.2) * 0.1;
        });
      }
      // Camera kicks on rivet pops
      if (f % 8 < 3) {
        impactShakeY = (f % 2 === 0 ? 1 : -1) * 0.035;
        impactShakeX = (f % 2 === 0 ? -1 : 1) * 0.02;
      }
    } else if (currentCut === 9) {
      // 25-Foot Molasses Tsunami Wave rushing down street
      activePose = "running_scared";
      if (animatedProps.waveGroup) {
        // Wave rolls forward down street behind the fleeing citizen
        const waveZ = interpolate(f, [0, 220], [-4.5, 1.2]);
        animatedProps.waveGroup.position.z = waveZ;
      }
      // Character running frantically towards camera from the wave
      currentCharPos.z = 1.4 + Math.sin(frame * 0.4) * 0.1;
      currentCharPos.y = 1.25 + Math.abs(Math.sin(frame * 0.4)) * 0.08;
    } else if (currentCut === 10 || currentCut === 6) {
      // Buckling elevated train tracks
      activePose = "stuck_firefighter";
      if (animatedProps.trackGroup) {
        // S-curve buckle on tracks
        const buckle = Math.sin(f * 0.15) * 0.12;
        animatedProps.trackGroup.rotation.z = buckle;
      }
      if (animatedProps.trolleyGroup) {
        animatedProps.trolleyGroup.rotation.z = Math.sin(f * 0.25) * 0.18;
      }
    } else if (currentCut === 11 || currentCut === 12 || currentCut === 13 || currentCut === 7) {
      // Stuck Firefighter pulling leg out of syrup
      activePose = "stuck_firefighter";
      const syrupT = Math.sin(frame * 0.1) * 0.5 + 0.5;
      drawBostonPose(charCtx, "stuck_firefighter", { frame, syrupStretch: syrupT });
      charTexture.needsUpdate = true;
    } else if (currentCut === 14 || currentCut === 15 || currentCut === 8) {
      // Ketchup bottle whacking -> Pancake ending
      if (f < 160) {
        activePose = "whacking_ketchup";
      } else {
        activePose = "pancake_stack";
      }
    }

    if (currentCut !== 7 && currentCut !== 13) {
      drawBostonPose(charCtx, activePose, { frame });
      charTexture.needsUpdate = true;
    }

    // In shots where MolassesGagOverlay renders the full character action, hide the 3D diorama billboard character
    charMesh.visible = ![3, 12, 13, 14, 15].includes(currentCut);

    charMesh.position.copy(currentCharPos);
    charMesh.rotation.z = charRotZ;
    // Procedural idle breathing scaleY ±1.5% via Math.sin(frame * 0.12)
    const charBreath = Math.sin(frame * 0.12);
    charMesh.scale.set(1.0 - charBreath * 0.008, 1.0 + charBreath * 0.015, 1.0);

    // Mr Omi's Camera Grammar (SKILL.md & motion.md):
    // 1. Continuous slow push-in during holds (0.22%/frame):
    const pushFactor = Math.exp(-0.0022 * f);

    // 2. Symmetric smootherstep glide on cut entry (first 24 frames):
    const entryProgress = Math.min(1.0, f / 24.0);
    const entryGlide = entryProgress * entryProgress * (3 - 2 * entryProgress);

    // 3. Impact kicks: offset flips sign every frame (15 Hz) decaying in 6-8 frames:
    let kickY = 0;
    let kickX = 0;
    if (currentCut === 4 && f % 10 < 7) {
      // Machine-gun rivet pops
      const kickF = f % 10;
      kickY = (kickF % 2 === 0 ? 1 : -1) * 0.05 * Math.exp(-kickF / 3);
      kickX = (kickF % 2 === 0 ? -1 : 1) * 0.03 * Math.exp(-kickF / 3);
    } else if (currentCut === 5 && f < 18) {
      // 25-ft Tsunami burst
      kickY = (f % 2 === 0 ? 1 : -1) * 0.07 * Math.exp(-f / 6);
      kickX = (f % 2 === 0 ? -1 : 1) * 0.04 * Math.exp(-f / 6);
    }

    // 4. Subtle Dutch tilt roll on dramatic beats (Cut 5 & Cut 6):
    const camRoll = (currentCut === 5 || currentCut === 6) ? 0.035 : 0;
    camera.rotation.z = camRoll;

    // 5. Dolly camera along line of sight toward target
    const startCamZ = baseCamPos.z * 1.08;
    const curCamZ = startCamZ + (baseCamPos.z - startCamZ) * entryGlide;
    const dollyZ = baseCamTarget.z + (curCamZ - baseCamTarget.z) * pushFactor;

    camera.position.set(
      baseCamTarget.x + (baseCamPos.x - baseCamTarget.x) * pushFactor + kickX,
      baseCamTarget.y + (baseCamPos.y - baseCamTarget.y) * pushFactor + kickY,
      dollyZ
    );
    camera.lookAt(baseCamTarget.x, baseCamTarget.y, baseCamTarget.z);

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const curFocus = Math.max(0.5, currentCharPos.clone().sub(camera.position).dot(camDir));
    lensPre.uniforms.get("focus")!.value = curFocus;
    lensMain.uniforms.get("focus")!.value = curFocus;

    composer.render();
  }, [frame, fps, currentCut, f]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
};
