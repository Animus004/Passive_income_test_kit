import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import * as THREE from "three";
import { SubtitleWord } from "../../types";
import { drawWhalterPose, WhalterPose } from "./toon/whalterCharacterGen";
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass,
  ToneMappingEffect,
  ToneMappingMode,
  BlendFunction,
} from "postprocessing";
import { InkPass, NOINK } from "./post/ink";
import { LensBlurEffect } from "./post/lensblur";

export interface Whalter3dDioramaProps {
  currentCut?: number; // 1 to 10
  cutStartFrame?: number;
  subtitles?: SubtitleWord[];
}

/**
 * Procedural Checkered Taxi Texture Generator
 */
function createTaxiCheckersTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#eab308";
  ctx.fillRect(0, 0, 512, 128);

  const boxSize = 32;
  for (let y = 0; y < 128; y += boxSize) {
    for (let x = 0; x < 512; x += boxSize) {
      const isBlack = (Math.floor(x / boxSize) + Math.floor(y / boxSize)) % 2 === 0;
      ctx.fillStyle = isBlack ? "#000000" : "#ffffff";
      ctx.fillRect(x, y, boxSize, boxSize);
    }
  }

  // Gold borders
  ctx.fillStyle = "#ca8a04";
  ctx.fillRect(0, 0, 512, 6);
  ctx.fillRect(0, 122, 512, 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Procedural Cockpit Flight HUD Texture
 */
function createCockpitHudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 300;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(2, 44, 34, 0.85)";
  ctx.roundRect(10, 10, 492, 280, 20);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#10b981";
  ctx.stroke();

  ctx.fillStyle = "#10b981";
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AUTOPILOT ENGAGED", 256, 75);

  ctx.fillStyle = "#34d399";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("ALT: 36,000 FT • CRUISE", 256, 130);
  ctx.fillText("HDG: 270° • MACH 0.82", 256, 175);

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("FUEL REMAINING: 6.2 HRS", 256, 235);

  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(180, 200);
  ctx.lineTo(220, 200);
  ctx.moveTo(292, 200);
  ctx.lineTo(332, 200);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Procedural Cockpit Flight Deck Instruments Texture
 */
function createCockpitDashTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 512, 256);

  // Primary Flight Display
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(30, 30, 180, 90);
  ctx.fillStyle = "#92400e";
  ctx.fillRect(30, 120, 180, 90);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 180, 180);

  // Radar Screen
  ctx.fillStyle = "#022c22";
  ctx.beginPath();
  ctx.arc(380, 120, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(380, 120, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(380, 40);
  ctx.lineTo(380, 200);
  ctx.moveTo(300, 120);
  ctx.lineTo(460, 120);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Procedural Cherenkov Nuclear Reactor Core Pool Texture
 */
function createReactorPoolTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 320);
  grad.addColorStop(0, "#a5f3fc");
  grad.addColorStop(0.35, "#06b6d4");
  grad.addColorStop(0.75, "#0284c7");
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Fuel rod grids
  ctx.strokeStyle = "rgba(14, 165, 233, 0.8)";
  ctx.lineWidth = 4;
  for (let x = 80; x <= 432; x += 58) {
    for (let y = 80; y <= 432; y += 58) {
      ctx.fillStyle = "#0369a1";
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return new THREE.CanvasTexture(canvas);
}

/**
 * Procedural Nuclear SCRAM Safety Terminal Texture
 */
function createNuclearScramTexture(status: "safe" | "warning" = "safe"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = status === "safe" ? "#022c22" : "#450a0a";
  ctx.fillRect(0, 0, 512, 256);

  ctx.lineWidth = 6;
  ctx.strokeStyle = status === "safe" ? "#10b981" : "#ef4444";
  ctx.strokeRect(10, 10, 492, 236);

  ctx.fillStyle = status === "safe" ? "#10b981" : "#f87171";
  ctx.font = "bold 38px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(status === "safe" ? "AUTO-SCRAM COMPLETE" : "CRITICAL WARNING: ZERO INPUT", 256, 75);

  ctx.fillStyle = status === "safe" ? "#34d399" : "#fca5a5";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(status === "safe" ? "ALL CONTROL RODS INSERTED" : "INITIATING EMERGENCY SCRAM...", 256, 130);
  ctx.fillText(status === "safe" ? "CORE TEMP: 42°C • SAFE" : "GRID INTERLOCKS TRIPPED", 256, 175);

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(status === "safe" ? "RADIATION: 0.00 mSv/h • CONTAINED" : "OPERATOR UNRESPONSIVE", 256, 220);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Three.js 3D Diorama Stage for Remotion
 * Full-bleed 3D environment with procedural dynamic keyframe physics,
 * continuous motion, cause-and-effect animations, and zero static holds.
 */
export const Whalter3dDioramaStage: React.FC<Whalter3dDioramaProps> = ({
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
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 100);

    const animatedProps: { [key: string]: any } = {};

    let initialPose: WhalterPose = "standing_coffee";
    if (currentCut === 1 || currentCut === 2) initialPose = "standing_coffee";
    else if (currentCut === 3) initialPose = "slumped_car";
    else if (currentCut === 4) initialPose = "slumped_pilot";
    else if (currentCut === 5) initialPose = "slumped_desk";
    else if (currentCut === 6 || currentCut === 7) initialPose = "holding_flashlight";
    else if (currentCut === 8) initialPose = "sleeping_curb";
    else if (currentCut === 9) initialPose = "slumped_bench"; // starts asleep under duvet, pops to waking_bed!
    else if (currentCut === 10) initialPose = "pointing_camera";

    // -------------------------------------------------------------
    // LIGHTING RIG
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.set(4.0, 8.0, 5.0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.radius = 3.0;
    scene.add(sunLight);

    let baseCamPos = new THREE.Vector3(0, 2.2, 7.8);
    let baseCamTarget = new THREE.Vector3(0, 1.6, 0);
    let charPos = new THREE.Vector3(0, 1.20, 0.4);

    // -------------------------------------------------------------
    // SCENE GEOMETRY PER CUT
    // -------------------------------------------------------------
    if (currentCut === 1 || currentCut === 2) {
      // DOWNTOWN CITY PLAZA & CLOCK TOWER
      scene.background = new THREE.Color(0x38bdf8);

      baseCamPos = new THREE.Vector3(0.0, 2.2, 7.8);
      baseCamTarget = new THREE.Vector3(0.0, 1.6, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Sky
      const sky = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 30),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa })
      );
      sky.position.set(0, 8, -6.5);
      scene.add(sky);

      // Cobblestone ground
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Clock Tower
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 5.8, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.6 })
      );
      tower.position.set(0.0, 2.9, -3.8);
      tower.castShadow = true;
      tower.receiveShadow = true;
      scene.add(tower);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.05, 1.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0.0, 6.6, -3.8);
      roof.castShadow = true;
      scene.add(roof);

      // Clock Face
      const clockCanvas = document.createElement("canvas");
      clockCanvas.width = 512;
      clockCanvas.height = 512;
      const cCtx = clockCanvas.getContext("2d")!;
      cCtx.fillStyle = currentCut === 2 ? "#ef4444" : "#ffedd5";
      cCtx.beginPath();
      cCtx.arc(256, 256, 240, 0, Math.PI * 2);
      cCtx.fill();
      cCtx.lineWidth = 14;
      cCtx.strokeStyle = "#451a03";
      cCtx.stroke();
      for (let h = 0; h < 12; h++) {
        const ang = (h * Math.PI) / 6;
        cCtx.beginPath();
        cCtx.moveTo(256 + Math.cos(ang) * 190, 256 + Math.sin(ang) * 190);
        cCtx.lineTo(256 + Math.cos(ang) * 220, 256 + Math.sin(ang) * 220);
        cCtx.stroke();
      }
      cCtx.lineWidth = 16;
      cCtx.beginPath();
      cCtx.moveTo(256, 256);
      cCtx.lineTo(256, 90);
      cCtx.stroke();
      cCtx.lineWidth = 10;
      cCtx.beginPath();
      cCtx.moveTo(256, 256);
      cCtx.lineTo(currentCut === 2 ? 256 : 246, 75);
      cCtx.stroke();

      const clockTexture = new THREE.CanvasTexture(clockCanvas);
      const clockFace = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.12, 32),
        new THREE.MeshBasicMaterial({ map: clockTexture })
      );
      clockFace.rotation.x = Math.PI / 2;
      clockFace.position.set(0.0, 4.2, -3.15);
      scene.add(clockFace);
      animatedProps.clockFace = clockFace;

      // Buildings
      const b1 = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 4.8, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.7 })
      );
      b1.position.set(-1.7, 2.4, -3.6);
      scene.add(b1);

      const b2 = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 4.8, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7 })
      );
      b2.position.set(1.7, 2.4, -3.6);
      scene.add(b2);

      // Wooden Park Bench
      const benchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
      const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.4), benchMat);
      benchSeat.position.set(-0.85, 0.32, -0.6);
      benchSeat.castShadow = true;
      benchSeat.receiveShadow = true;
      scene.add(benchSeat);
      animatedProps.benchSeat = benchSeat;

      const benchBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.07), benchMat);
      benchBack.position.set(-0.85, 0.58, -0.8);
      scene.add(benchBack);

      // Lamp & Topiaries
      const lampPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 3.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
      );
      lampPole.position.set(0.95, 1.7, -0.6);
      scene.add(lampPole);

      const lantern = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.32, 0.26),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      lantern.position.set(0.95, 3.4, -0.6);
      scene.add(lantern);

      // Dynamic Coffee Cup & Spilling Coffee Puddle (Cut 2 Physics)
      if (currentCut === 2) {
        const cupGroup = new THREE.Group();
        const cupBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.04, 0.14, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
        );
        cupBody.castShadow = true;
        cupGroup.add(cupBody);
        const cupLid = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.025, 16),
          new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
        );
        cupLid.position.y = 0.08;
        cupGroup.add(cupLid);
        cupGroup.position.set(0.35, 1.25, 0.2);
        scene.add(cupGroup);
        animatedProps.coffeeCup = cupGroup;

        // Coffee splash brown puddle on ground
        const puddle = new THREE.Mesh(
          new THREE.CircleGeometry(0.22, 16),
          new THREE.MeshBasicMaterial({ color: 0x451a03, transparent: true, opacity: 0.85 })
        );
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(0.44, 0.015, 0.2);
        puddle.scale.set(0, 0, 0);
        scene.add(puddle);
        animatedProps.coffeeSplash = puddle;
      }

      charPos = new THREE.Vector3(0.12, 1.25, 0.2);
    } else if (currentCut === 3) {
      // HIGHWAY DRIFT TO A HALT & TRAFFIC CRASH
      scene.background = new THREE.Color(0x7dd3fc);

      baseCamPos = new THREE.Vector3(0.0, 2.0, 7.4);
      baseCamTarget = new THREE.Vector3(0.0, 1.1, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Sky & Hills
      const sky = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 30),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      sky.position.set(0, 8, -8.0);
      scene.add(sky);

      const hillMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
      for (let hx = -6; hx <= 6; hx += 2.8) {
        const hMesh = new THREE.Mesh(new THREE.SphereGeometry(3.6, 16, 16), hillMat);
        hMesh.position.set(hx, -1.4, -7.5);
        scene.add(hMesh);
      }

      // Asphalt Highway
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
      );
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      scene.add(road);

      // Lane Lines
      for (let lz = -12; lz <= 12; lz += 3.5) {
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(0.12, 1.8),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(0.6, 0.02, lz);
        scene.add(stripe);
      }

      // Guardrail
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(35, 0.35, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 })
      );
      rail.position.set(0, 0.5, -2.5);
      scene.add(rail);

      // Yellow Taxi
      const taxiGroup = new THREE.Group();
      const taxiBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.48, 0.95),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
      );
      taxiBody.position.y = 0.42;
      taxiBody.castShadow = true;
      taxiGroup.add(taxiBody);

      const taxiCabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.42, 0.82),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
      );
      taxiCabin.position.set(-0.1, 0.82, 0);
      taxiCabin.castShadow = true;
      taxiGroup.add(taxiCabin);

      const checkerTexture = createTaxiCheckersTexture();
      const checkerMat = new THREE.MeshBasicMaterial({ map: checkerTexture });
      const checkerMesh = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.1, 0.97), checkerMat);
      checkerMesh.position.y = 0.42;
      taxiGroup.add(checkerMesh);

      const roofSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.15, 0.2),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      roofSign.position.set(-0.1, 1.1, 0);
      taxiGroup.add(roofSign);

      // 4 Wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const hubMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7 });
      const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
      const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.17, 16);
      const taxiWheels: THREE.Mesh[] = [];

      [
        [-0.5, 0.2, 0.48],
        [0.5, 0.2, 0.48],
        [-0.5, 0.2, -0.48],
        [0.5, 0.2, -0.48],
      ].forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, wy, wz);
        w.castShadow = true;
        taxiGroup.add(w);
        taxiWheels.push(w);

        const hub = new THREE.Mesh(hubGeo, hubMat);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(wx, wy, wz);
        taxiGroup.add(hub);
      });

      taxiGroup.position.set(2.2, 0, 0.1);
      scene.add(taxiGroup);
      animatedProps.taxiGroup = taxiGroup;
      animatedProps.taxiWheels = taxiWheels;

      // Red Compact Car Behind
      const redCarGroup = new THREE.Group();
      const redBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.38, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
      );
      redBody.position.y = 0.32;
      redCarGroup.add(redBody);
      const redCabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.34, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
      );
      redCabin.position.set(-0.05, 0.62, 0);
      redCarGroup.add(redCabin);
      [[-0.35, 0.16, 0.4], [0.35, 0.16, 0.4], [-0.35, 0.16, -0.4], [0.35, 0.16, -0.4]].forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, wy, wz);
        redCarGroup.add(w);
      });
      redCarGroup.position.set(-4.5, 0, 0.1);
      scene.add(redCarGroup);
      animatedProps.redCarGroup = redCarGroup;

      // Comic "BUMP!" Star Burst
      const bumpCanvas = document.createElement("canvas");
      bumpCanvas.width = 256;
      bumpCanvas.height = 256;
      const bCtx = bumpCanvas.getContext("2d")!;
      bCtx.fillStyle = "#facc15";
      bCtx.beginPath();
      for (let p = 0; p < 16; p++) {
        const rad = p % 2 === 0 ? 115 : 55;
        const ang = (p * Math.PI) / 8;
        const px = 128 + Math.cos(ang) * rad;
        const py = 128 + Math.sin(ang) * rad;
        if (p === 0) bCtx.moveTo(px, py);
        else bCtx.lineTo(px, py);
      }
      bCtx.closePath();
      bCtx.fill();
      bCtx.lineWidth = 8;
      bCtx.strokeStyle = "#000000";
      bCtx.stroke();
      bCtx.fillStyle = "#dc2626";
      bCtx.font = "bold 44px sans-serif";
      bCtx.textAlign = "center";
      bCtx.fillText("BUMP!", 128, 142);

      const bumpTex = new THREE.CanvasTexture(bumpCanvas);
      const bumpMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.95),
        new THREE.MeshBasicMaterial({ map: bumpTex, transparent: true })
      );
      bumpMesh.position.set(-0.85, 0.95, -0.15);
      bumpMesh.scale.set(0, 0, 0);
      bumpMesh.layers.set(NOINK);
      scene.add(bumpMesh);
      animatedProps.bumpMesh = bumpMesh;

      charPos = new THREE.Vector3(0.35, 1.15, 0.35);
    } else if (currentCut === 4) {
      // AIRLINER FLIGHT DECK (STARRY SKY, DRIFTING CLOUDS & HUD)
      scene.background = new THREE.Color(0x020617);

      baseCamPos = new THREE.Vector3(0.0, 1.45, 5.2);
      baseCamTarget = new THREE.Vector3(0.0, 1.05, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      const sky = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 30),
        new THREE.MeshBasicMaterial({ color: 0x075985 })
      );
      sky.position.set(0, 7, -7.0);
      scene.add(sky);

      // Glittering Stars
      const starGeo = new THREE.BufferGeometry();
      const starCount = 80;
      const starPos = new Float32Array(starCount * 3);
      for (let si = 0; si < starCount * 3; si += 3) {
        starPos[si] = (Math.random() - 0.5) * 16;
        starPos[si + 1] = 2 + Math.random() * 8;
        starPos[si + 2] = -6.5 + Math.random() * 1.5;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 });
      const starPoints = new THREE.Points(starGeo, starMat);
      scene.add(starPoints);

      // Clouds (Continuous High-Speed Flight Z-Drift)
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
      const clouds: THREE.Mesh[] = [];
      for (let ci = 0; ci < 8; ci++) {
        const cMesh = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 12), cloudMat);
        cMesh.position.set((ci - 3.5) * 1.8, -0.2, -8.0 + ci * 1.4);
        cMesh.scale.set(1.6, 0.4, 1.2);
        scene.add(cMesh);
        clouds.push(cMesh);
      }
      animatedProps.clouds = clouds;

      // Cockpit Dashboard
      const dashTexture = createCockpitDashTexture();
      const dashMat = new THREE.MeshStandardMaterial({ map: dashTexture, roughness: 0.5 });
      const dash = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 1.4), dashMat);
      dash.position.set(0.0, 0.35, -0.2);
      dash.rotation.x = 0.25;
      scene.add(dash);

      // Flight Control Yokes
      const yokeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const yokeColGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12);
      const yokeWheelGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 16, Math.PI * 1.4);
      const yokes: THREE.Mesh[] = [];

      [-0.6, 0.45].forEach((yx) => {
        const col = new THREE.Mesh(yokeColGeo, yokeMat);
        col.position.set(yx, 0.65, 0.35);
        col.rotation.x = 0.25;
        scene.add(col);

        const wheel = new THREE.Mesh(yokeWheelGeo, yokeMat);
        wheel.position.set(yx, 0.92, 0.42);
        wheel.rotation.z = Math.PI * 0.8;
        scene.add(wheel);
        yokes.push(wheel);
      });
      animatedProps.yokeL = yokes[0];
      animatedProps.yokeR = yokes[1];

      // Holographic Green Autopilot HUD
      const hudTexture = createCockpitHudTexture();
      const hudMat = new THREE.MeshBasicMaterial({ map: hudTexture, transparent: true });
      const hudMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.75), hudMat);
      hudMesh.position.set(-0.35, 1.15, -0.8);
      hudMesh.rotation.x = -0.15;
      hudMesh.rotation.y = 0.15;
      hudMesh.layers.set(NOINK);
      scene.add(hudMesh);
      animatedProps.hudMesh = hudMesh;

      charPos = new THREE.Vector3(0.45, 1.15, 0.85);
    } else if (currentCut === 5) {
      // NUCLEAR CONTROL ROOM (CHERENKOV POOL & SCRAM)
      scene.background = new THREE.Color(0x0f172a);

      baseCamPos = new THREE.Vector3(0.0, 1.55, 5.8);
      baseCamTarget = new THREE.Vector3(0.0, 1.2, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Observation window into Cherenkov pool
      const poolTexture = createReactorPoolTexture();
      const poolMat = new THREE.MeshBasicMaterial({ map: poolTexture });
      const poolWindow = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.4), poolMat);
      poolWindow.position.set(0, 2.9, -4.45);
      scene.add(poolWindow);

      // Heavy Boron Control Rod Cluster
      const rodGroup = new THREE.Group();
      const rodMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
      const tipMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
      for (let rx = -1.2; rx <= 1.2; rx += 0.6) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 16), rodMat);
        rod.position.set(rx, 1.1, 0);
        rodGroup.add(rod);
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 16), tipMat);
        tip.position.set(rx, 0.0, 0);
        rodGroup.add(tip);
      }
      rodGroup.position.set(0, 3.6, -4.2);
      scene.add(rodGroup);
      animatedProps.rodGroup = rodGroup;

      // Cherenkov Water Shockwave Ripple
      const ripple = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.25, 32),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      ripple.rotation.x = -Math.PI / 2;
      ripple.position.set(0, 1.72, -4.2);
      ripple.scale.set(0, 0, 0);
      scene.add(ripple);
      animatedProps.waterRipple = ripple;

      // Control Desk
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.75, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
      );
      desk.position.set(0, 0.45, -0.4);
      desk.castShadow = true;
      scene.add(desk);

      // SCRAM Status Monitor
      const scramTexture = createNuclearScramTexture("safe");
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.8),
        new THREE.MeshBasicMaterial({ map: scramTexture })
      );
      panel.position.set(-0.55, 1.15, -0.25);
      panel.rotation.y = 0.15;
      scene.add(panel);

      // Red SCRAM Button
      const scramButton = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
      );
      scramButton.position.set(0.65, 0.88, -0.2);
      scene.add(scramButton);
      animatedProps.scramButton = scramButton;

      charPos = new THREE.Vector3(0.45, 1.25, 0.2);
    } else if (currentCut === 6 || currentCut === 7) {
      // TOTAL BLACKOUT & FLASHLIGHT BEAM
      scene.background = new THREE.Color(0x020617);

      baseCamPos = new THREE.Vector3(0.0, 1.65, 5.4);
      baseCamTarget = new THREE.Vector3(0.0, 1.25, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      ambientLight.intensity = 0.35;
      sunLight.intensity = 0.2;

      // Real Flashlight Spotlight
      const flashLight = new THREE.SpotLight(0xfef08a, 6.0, 15, 0.55, 0.6, 1.2);
      flashLight.position.set(0.35, 1.4, 0.5);
      flashLight.target.position.set(0.35, 1.3, -4.5);
      flashLight.castShadow = true;
      scene.add(flashLight);
      scene.add(flashLight.target);
      animatedProps.flashLight = flashLight;

      // Flickering Candle
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef08a })
      );
      candle.position.set(-1.1, 0.9, -0.6);
      scene.add(candle);

      const candleLight = new THREE.PointLight(0xf59e0b, 1.8, 4.0);
      candleLight.position.set(-1.1, 1.05, -0.6);
      scene.add(candleLight);
      animatedProps.candleLight = candleLight;

      charPos = new THREE.Vector3(0.2, 1.35, 0.2);
    } else if (currentCut === 8) {
      // NATURE RECLAIMS BOULEVARDS
      scene.background = new THREE.Color(0x7dd3fc);

      baseCamPos = new THREE.Vector3(0.0, 1.6, 5.8);
      baseCamTarget = new THREE.Vector3(0.0, 1.15, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Road & Curb
      const asphaltRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
      );
      asphaltRoad.rotation.x = -Math.PI / 2;
      scene.add(asphaltRoad);

      const grassVerge = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 35),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 })
      );
      grassVerge.rotation.x = -Math.PI / 2;
      grassVerge.position.set(2.0, 0.04, 0);
      scene.add(grassVerge);

      // Lush Tree
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.24, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      trunk.position.set(-2.8, 1.6, -3.0);
      scene.add(trunk);

      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
      const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 14), foliageMat);
      foliage1.position.set(-2.8, 3.6, -3.0);
      scene.add(foliage1);
      animatedProps.foliage1 = foliage1;

      const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 14), foliageMat);
      foliage2.position.set(-2.2, 4.2, -2.8);
      scene.add(foliage2);
      animatedProps.foliage2 = foliage2;

      // Cartoon Baby Deer
      const deerCanvas = document.createElement("canvas");
      deerCanvas.width = 512;
      deerCanvas.height = 512;
      const deerCtx = deerCanvas.getContext("2d")!;
      deerCtx.save();
      deerCtx.translate(256, 256);
      deerCtx.fillStyle = "#b45309";
      deerCtx.lineWidth = 6;
      deerCtx.strokeStyle = "#000000";

      deerCtx.fillRect(-45, 50, 8, 55);
      deerCtx.strokeRect(-45, 50, 8, 55);
      deerCtx.fillRect(-20, 50, 8, 55);
      deerCtx.strokeRect(-20, 50, 8, 55);
      deerCtx.fillRect(15, 50, 8, 55);
      deerCtx.strokeRect(15, 50, 8, 55);
      deerCtx.fillRect(40, 50, 8, 55);
      deerCtx.strokeRect(40, 50, 8, 55);

      deerCtx.beginPath();
      deerCtx.ellipse(0, 40, 75, 48, 0, 0, Math.PI * 2);
      deerCtx.fill();
      deerCtx.stroke();

      deerCtx.beginPath();
      deerCtx.moveTo(40, 30);
      deerCtx.lineTo(65, -15);
      deerCtx.lineTo(95, -10);
      deerCtx.lineTo(60, 45);
      deerCtx.closePath();
      deerCtx.fill();
      deerCtx.stroke();

      deerCtx.beginPath();
      deerCtx.ellipse(82, -22, 34, 26, 0.25, 0, Math.PI * 2);
      deerCtx.fill();
      deerCtx.stroke();

      deerCtx.fillStyle = "#ffffff";
      deerCtx.beginPath();
      deerCtx.arc(-25, 28, 6, 0, Math.PI * 2);
      deerCtx.arc(5, 24, 7, 0, Math.PI * 2);
      deerCtx.fill();

      deerCtx.fillStyle = "#000000";
      deerCtx.beginPath();
      deerCtx.arc(88, -25, 8, 0, Math.PI * 2);
      deerCtx.fill();
      deerCtx.restore();

      const deerTexture = new THREE.CanvasTexture(deerCanvas);
      const deerMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshStandardMaterial({ map: deerTexture, transparent: true, roughness: 0.8 })
      );
      deerMesh.position.set(-2.4, 0.95, 0.4);
      deerMesh.layers.set(NOINK);
      scene.add(deerMesh);
      animatedProps.deerMesh = deerMesh;

      charPos = new THREE.Vector3(0.45, 0.72, 0.2);
    } else if (currentCut === 9) {
      // MORNING AWAKENING IN BEDROOM
      scene.background = new THREE.Color(0xfef3c7);

      baseCamPos = new THREE.Vector3(0.0, 1.7, 5.8);
      baseCamTarget = new THREE.Vector3(0.0, 1.25, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Bed
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 3.2), woodMat);
      bedFrame.position.set(0.4, 0.3, 0.0);
      scene.add(bedFrame);

      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.45, 3.0),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
      );
      mattress.position.set(0.4, 0.65, 0.0);
      scene.add(mattress);

      // Alarm Clock
      const clockBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
      );
      clockBody.position.set(-1.3, 0.96, -0.4);
      clockBody.rotation.x = Math.PI / 2;
      scene.add(clockBody);
      animatedProps.alarmClock = clockBody;

      // Buzzing Smartphone
      const phoneCanvas = document.createElement("canvas");
      phoneCanvas.width = 512;
      phoneCanvas.height = 896;
      const phoneCtx = phoneCanvas.getContext("2d")!;
      phoneCtx.fillStyle = "#ef4444";
      phoneCtx.fillRect(0, 0, 512, 896);
      phoneCtx.fillStyle = "#ffffff";
      phoneCtx.font = "bold 130px sans-serif";
      phoneCtx.textAlign = "center";
      phoneCtx.fillText("168", 256, 320);
      phoneCtx.font = "bold 44px sans-serif";
      phoneCtx.fillText("MISSED CALLS", 256, 420);
      phoneCtx.roundRect(56, 520, 400, 100, 24);
      phoneCtx.fill();
      phoneCtx.fillStyle = "#dc2626";
      phoneCtx.font = "bold 42px sans-serif";
      phoneCtx.fillText("OCTOBER 7", 256, 585);

      const phoneTexture = new THREE.CanvasTexture(phoneCanvas);
      const phoneMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.95, 0.04),
        new THREE.MeshBasicMaterial({ map: phoneTexture })
      );
      phoneMesh.position.set(-0.35, 1.45, 0.5);
      phoneMesh.rotation.set(-0.08, 0.2, 0.12);
      scene.add(phoneMesh);
      animatedProps.phoneMesh = phoneMesh;

      charPos = new THREE.Vector3(0.5, 0.88, 0.2);
    } else {
      // CUT 10: 4TH-WALL QUESTION & SURVIVAL PLAN
      scene.background = new THREE.Color(0xfef3c7);

      baseCamPos = new THREE.Vector3(0.0, 1.5, 5.0);
      baseCamTarget = new THREE.Vector3(0.0, 1.25, 0.0);
      camera.position.copy(baseCamPos);
      camera.lookAt(baseCamTarget);

      // Comic Bubble: "WHAT WOULD YOU DO? 👇"
      const bubbleCanvas = document.createElement("canvas");
      bubbleCanvas.width = 512;
      bubbleCanvas.height = 256;
      const bubbleCtx = bubbleCanvas.getContext("2d")!;
      bubbleCtx.fillStyle = "#facc15";
      bubbleCtx.roundRect(10, 10, 492, 236, 40);
      bubbleCtx.fill();
      bubbleCtx.lineWidth = 12;
      bubbleCtx.strokeStyle = "#000000";
      bubbleCtx.stroke();
      bubbleCtx.fillStyle = "#000000";
      bubbleCtx.font = "bold 52px sans-serif";
      bubbleCtx.textAlign = "center";
      bubbleCtx.fillText("WHAT WOULD", 256, 95);
      bubbleCtx.fillText("YOU DO? 👇", 256, 175);

      const bubbleTexture = new THREE.CanvasTexture(bubbleCanvas);
      const bubbleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.8),
        new THREE.MeshBasicMaterial({ map: bubbleTexture, transparent: true })
      );
      bubbleMesh.position.set(-0.65, 4.5, 0.4);
      bubbleMesh.layers.set(NOINK);
      scene.add(bubbleMesh);
      animatedProps.bubbleMesh = bubbleMesh;

      charPos = new THREE.Vector3(0.18, 1.25, 0.2);
    }

    // -------------------------------------------------------------
    // HERO 2D PAPER-DOLL CHARACTER STANDEE
    // -------------------------------------------------------------
    const charCanvas = document.createElement("canvas");
    charCanvas.width = 1024;
    charCanvas.height = 1024;
    const charCtx = charCanvas.getContext("2d")!;
    drawWhalterPose(charCtx, initialPose);

    const charTexture = new THREE.CanvasTexture(charCanvas);
    charTexture.minFilter = THREE.LinearFilter;
    charTexture.magFilter = THREE.LinearFilter;

    const charGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const charMat = new THREE.MeshStandardMaterial({
      map: charTexture,
      transparent: true,
      alphaTest: 0.05,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const charMesh = new THREE.Mesh(charGeo, charMat);
    charMesh.position.copy(charPos);
    charMesh.castShadow = true;
    charMesh.receiveShadow = false;
    charMesh.layers.set(NOINK);
    scene.add(charMesh);

    // -------------------------------------------------------------
    // POST-PROCESSING PIPELINE
    // -------------------------------------------------------------
    const composer = new EffectComposer(renderer, { multisampling: 0 });
    composer.setSize(width, height);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const inkPass = new InkPass(scene, camera, {
      color: "#0b0a0c",
      widthNear: 4.8,
      widthFar: 3.2,
      distNear: 5,
      distFar: 70,
      creaseScale: 0.8,
    });
    composer.addPass(inkPass);

    const lensPre = new LensBlurEffect({ maxCoC: 28, nearScale: 1.2, stage: { taps: 8, spread: 0.287, nearTaps: 0, rot: 0.61 } });
    const lensMain = new LensBlurEffect({ maxCoC: 28, nearScale: 1.2, stage: { taps: 20, spread: 0.958, nearTaps: 8, rot: 0 } });

    const bloom = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      intensity: 0.45,
      luminanceThreshold: 1.0,
      luminanceSmoothing: 0.2,
      mipmapBlur: true,
      levels: 6,
      radius: 0.6,
    });

    const toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
    composer.addPass(new EffectPass(camera, lensPre));
    composer.addPass(new EffectPass(camera, lensMain));
    composer.addPass(new EffectPass(camera, bloom, toneMapping));

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
    const { composer, camera, baseCamPos, baseCamTarget, charMesh, animatedProps, lensPre, lensMain, charPos, charCtx, charTexture } = threeRef.current;

    const springPunch = spring({ frame: f, fps, config: { damping: 14, stiffness: 220 } });

    // STYLE BIBLE: Every hold creeps 0.15 - 0.35 % / frame (continuous push-in)
    const creepZoom = 1.0 - f * 0.0022;
    const punchZoom = (currentCut === 2 || currentCut === 9 || currentCut === 10)
      ? interpolate(springPunch, [0, 1], [1.08, 1.0])
      : 1.0;

    const swayX = Math.sin(frame * 0.04) * 0.015;
    const swayY = Math.cos(frame * 0.04) * 0.008;

    // -------------------------------------------------------------
    // PER-CUT OBJECT & CHARACTER PHYSICS SIMULATION
    // -------------------------------------------------------------
    let currentCharPos = charPos.clone();
    let charRotZ = 0;
    let activePose: WhalterPose = "standing_coffee";
    let impactShakeX = 0;
    let impactShakeY = 0;

    if (currentCut === 1) {
      activePose = "standing_coffee";
      currentCharPos.y = 1.25 + Math.sin(frame * 0.08) * 0.012;
      currentCharPos.x = 0.12 + Math.sin(frame * 0.04) * 0.008;
    } else if (currentCut === 2) {
      // 8 BILLION SLEEP COLLAPSE BEAT
      if (f < 14) {
        activePose = "standing_coffee";
        currentCharPos.set(0.12, 1.25, 0.2);
        charRotZ = 0;
        if (animatedProps.coffeeCup) {
          animatedProps.coffeeCup.position.set(0.35, 1.25, 0.2);
          animatedProps.coffeeCup.rotation.set(0, 0, 0);
        }
      } else if (f < 24) {
        // Falling transition: buckle knees, drop cup, tilt towards bench
        const t = (f - 14) / 10.0;
        activePose = f < 17 ? "standing_coffee" : "slumped_bench";
        currentCharPos.x = interpolate(t, [0, 1], [0.12, -0.85]);
        currentCharPos.y = interpolate(t, [0, 1], [1.25, 0.75]);
        currentCharPos.z = interpolate(t, [0, 1], [0.2, -0.45]);
        charRotZ = interpolate(t, [0, 1], [0, -0.28]);

        if (animatedProps.coffeeCup) {
          const cupT = f - 14;
          const cupY = Math.max(0.08, 1.25 - 0.5 * 0.026 * (cupT * cupT));
          animatedProps.coffeeCup.position.set(0.35 + cupT * 0.009, cupY, 0.2);
          animatedProps.coffeeCup.rotation.z = cupT * 0.3;
        }
      } else {
        // Collapsed on the bench
        activePose = "slumped_bench";
        currentCharPos.set(-0.85, 0.75, -0.45);
        charRotZ = -0.28;

        if (animatedProps.coffeeCup) {
          animatedProps.coffeeCup.position.set(0.44, 0.08, 0.2);
          animatedProps.coffeeCup.rotation.set(Math.PI / 2, 0, 0.9);
        }
        if (animatedProps.coffeeSplash) {
          const splashT = Math.min(1.0, (f - 23) / 8.0);
          animatedProps.coffeeSplash.scale.set(splashT, splashT, splashT);
        }

        if (animatedProps.benchSeat && f >= 24 && f <= 34) {
          const flex = Math.sin((f - 24) * 0.6) * Math.exp(-(f - 24) * 0.3) * 0.04;
          animatedProps.benchSeat.position.y = 0.32 - flex;
        }

        // Camera impact kick on collapse hit at f = 24..32
        if (f >= 24 && f <= 32) {
          const kickProgress = (f - 24) / 8;
          const sign = (f - 24) % 2 === 0 ? 1 : -1;
          impactShakeY = sign * (1 - kickProgress) * 0.06;
          impactShakeX = -sign * (1 - kickProgress) * 0.03;
        }
      }
    } else if (currentCut === 3) {
      // HIGHWAY DRIFT & TRAFFIC CRASH BEAT
      activePose = "slumped_car";

      // 1. Taxi motion
      if (animatedProps.taxiGroup) {
        let taxiX = 0;
        let taxiZ = -0.2;
        let taxiRotY = 0;
        let taxiPitchX = 0;

        if (f < 20) {
          taxiX = interpolate(f, [0, 20], [2.2, 0.4]);
          taxiZ = 0.1;
          taxiRotY = 0;
        } else if (f < 32) {
          const t = (f - 20) / 12;
          taxiX = interpolate(t, [0, 1], [0.4, -0.1]);
          taxiZ = interpolate(t, [0, 1], [0.1, -0.3]);
          taxiRotY = interpolate(t, [0, 1], [0, -0.32]);
        } else {
          // Impact jolt at f=32!
          const postHit = f - 32;
          const hitBounce = Math.sin(postHit * 0.7) * Math.exp(-postHit * 0.25) * 0.12;
          taxiX = -0.1 - hitBounce * 0.5;
          taxiZ = -0.3;
          taxiRotY = -0.35;
          taxiPitchX = hitBounce * 0.4;
        }

        animatedProps.taxiGroup.position.set(taxiX, 0, taxiZ);
        animatedProps.taxiGroup.rotation.y = taxiRotY;
        animatedProps.taxiGroup.rotation.x = taxiPitchX;

        if (animatedProps.taxiWheels && Array.isArray(animatedProps.taxiWheels)) {
          const spinSpeed = f < 20 ? 0.35 : f < 32 ? 0.12 : 0;
          animatedProps.taxiWheels.forEach((w: THREE.Mesh) => {
            w.rotation.y += spinSpeed;
          });
        }
      }

      // 2. Red Compact Car approaching from behind
      if (animatedProps.redCarGroup) {
        let redX = -4.5;
        let redZ = -0.4;
        let redRotY = 0;

        if (f < 32) {
          redX = interpolate(f, [0, 32], [-4.5, -1.45]);
          redZ = interpolate(f, [0, 32], [0.1, -0.45]);
          redRotY = -0.15;
        } else {
          const postHit = f - 32;
          const rebound = Math.sin(postHit * 0.6) * Math.exp(-postHit * 0.3) * 0.08;
          redX = -1.45 + rebound;
          redZ = -0.45;
          redRotY = -0.22;
        }

        animatedProps.redCarGroup.position.set(redX, 0, redZ);
        animatedProps.redCarGroup.rotation.y = redRotY;
      }

      // 3. Comic "BUMP!" Star Burst
      if (animatedProps.bumpMesh) {
        if (f < 32) {
          animatedProps.bumpMesh.scale.set(0, 0, 0);
        } else {
          const pop = Math.min(1.0, (f - 32) / 6.0);
          const popScale = interpolate(pop, [0, 0.6, 1], [0, 1.35, 1.0]);
          animatedProps.bumpMesh.scale.set(popScale, popScale, 1);
          animatedProps.bumpMesh.rotation.z = Math.sin((f - 32) * 0.15) * 0.12;
        }
      }

      // 4. Character Whalter inside Taxi jolts forward on collision!
      if (f < 32) {
        currentCharPos.set(0.35, 1.15, 0.35);
        charRotZ = 0;
      } else {
        const joltT = f - 32;
        const jolt = Math.sin(joltT * 0.8) * Math.exp(-joltT * 0.28) * 0.35;
        currentCharPos.set(0.35 - jolt * 0.2, 1.15 - Math.abs(jolt) * 0.1, 0.35);
        charRotZ = -jolt;
      }

      // 5. Impact camera shake at f = 32..42
      if (f >= 32 && f <= 42) {
        const kickProgress = (f - 32) / 10;
        const sign = (f - 32) % 2 === 0 ? 1 : -1;
        impactShakeY = sign * (1 - kickProgress) * 0.08;
        impactShakeX = -sign * (1 - kickProgress) * 0.05;
      }
    } else if (currentCut === 4) {
      // AIRLINER FLIGHT DECK BEAT
      activePose = "slumped_pilot";
      currentCharPos.set(0.45, 1.15, 0.85);

      // Cloud drift at 500 knots
      if (animatedProps.clouds && Array.isArray(animatedProps.clouds)) {
        animatedProps.clouds.forEach((c: THREE.Mesh, i: number) => {
          c.position.z += 0.08;
          if (c.position.z > 2.0) {
            c.position.z = -10.0;
            c.position.x = ((i % 5) - 2) * 2.2 + (Math.sin(frame + i) * 0.5);
          }
        });
      }

      // Yokes actively oscillating
      if (animatedProps.yokeL && animatedProps.yokeR) {
        const yokeAngle = Math.sin(f * 0.07) * 0.09;
        animatedProps.yokeL.rotation.z = Math.PI * 0.8 + yokeAngle;
        animatedProps.yokeR.rotation.z = Math.PI * 0.8 + yokeAngle;
      }

      // HUD pulse
      if (animatedProps.hudMesh) {
        const pulse = 0.95 + Math.sin(f * 0.15) * 0.08;
        animatedProps.hudMesh.scale.set(pulse, pulse, 1);
      }
    } else if (currentCut === 5) {
      // NUCLEAR AUTO-SCRAM BEAT
      activePose = "slumped_desk";
      currentCharPos.set(0.45, 1.25, 0.2);

      // Control rods slam down into core
      if (animatedProps.rodGroup) {
        if (f < 18) {
          animatedProps.rodGroup.position.y = 3.6;
        } else if (f < 28) {
          const t = (f - 18) / 10.0;
          animatedProps.rodGroup.position.y = interpolate(t, [0, 1], [3.6, 0.5]);
        } else {
          const settle = Math.sin((f - 28) * 0.8) * Math.exp(-(f - 28) * 0.4) * 0.04;
          animatedProps.rodGroup.position.y = 0.5 + settle;
        }
      }

      // Cherenkov water ripple shockwave
      if (animatedProps.waterRipple) {
        if (f < 28) {
          animatedProps.waterRipple.scale.set(0, 0, 0);
        } else {
          const ripT = (f - 28) / 25.0;
          const rScale = interpolate(ripT, [0, 1], [0.1, 4.0]);
          animatedProps.waterRipple.scale.set(rScale, rScale, 1);
        }
      }

      if (animatedProps.scramButton) {
        animatedProps.scramButton.position.y = f >= 18 ? 0.83 : 0.88;
      }

      if (f >= 28 && f <= 36) {
        const kickProgress = (f - 28) / 8;
        const sign = (f - 28) % 2 === 0 ? 1 : -1;
        impactShakeY = sign * (1 - kickProgress) * 0.06;
      }
    } else if (currentCut === 6 || currentCut === 7) {
      // TOTAL BLACKOUT & FLASHLIGHT BEAM
      activePose = "holding_flashlight";
      currentCharPos.set(0.2, 1.35, 0.2);

      // Flashlight spotlight actively sweeping room & window
      if (animatedProps.flashLight && animatedProps.flashLight.target) {
        const sweepX = Math.sin(f * 0.05) * 2.8;
        const sweepY = 1.3 + Math.cos(f * 0.07) * 0.8;
        animatedProps.flashLight.target.position.set(sweepX, sweepY, -4.5);
      }

      if (animatedProps.candleLight) {
        animatedProps.candleLight.intensity = 1.8 + Math.sin(f * 0.35) * 0.4 + Math.sin(f * 0.8) * 0.2;
      }
    } else if (currentCut === 8) {
      // NATURE RECLAIMS BOULEVARDS
      activePose = "sleeping_curb";
      currentCharPos.set(0.45, 0.72, 0.2);

      // Baby deer physically walks out onto empty road
      if (animatedProps.deerMesh) {
        let deerX = -2.4;
        let deerY = 0.95;
        let deerRotZ = 0;

        if (f < 70) {
          const walkT = f / 70.0;
          deerX = interpolate(walkT, [0, 1], [-2.4, -0.95]);
          deerY = 0.95 + Math.abs(Math.sin(f * 0.22)) * 0.06;
          deerRotZ = Math.sin(f * 0.12) * 0.06;
        } else {
          deerX = -0.95;
          deerY = 0.95;
          deerRotZ = Math.sin((f - 70) * 0.06) * 0.05;
        }

        animatedProps.deerMesh.position.set(deerX, deerY, 0.4);
        animatedProps.deerMesh.rotation.z = deerRotZ;
      }

      if (animatedProps.foliage1 && animatedProps.foliage2) {
        animatedProps.foliage1.rotation.z = Math.sin(f * 0.05) * 0.04;
        animatedProps.foliage2.rotation.z = -Math.sin(f * 0.06) * 0.05;
      }
    } else if (currentCut === 9) {
      // MORNING AWAKENING BEAT
      if (animatedProps.alarmClock) {
        animatedProps.alarmClock.rotation.z = Math.PI / 2 + Math.sin(f * 1.5) * 0.25;
      }

      if (animatedProps.phoneMesh) {
        animatedProps.phoneMesh.rotation.z = 0.12 + Math.sin(f * 0.9) * 0.08;
        animatedProps.phoneMesh.position.y = 1.45 + Math.sin(f * 0.5) * 0.04;
      }

      if (f < 16) {
        activePose = "slumped_bench";
        currentCharPos.set(0.5, 0.88, 0.2);
        charRotZ = -1.57; // lying flat asleep in bed!
      } else {
        // Pop bolt upright in bed!
        activePose = "waking_bed";
        const wakeT = Math.min(1.0, (f - 16) / 5.0);
        currentCharPos.set(
          0.5,
          interpolate(wakeT, [0, 1], [0.88, 1.45]),
          0.2
        );
        charRotZ = interpolate(wakeT, [0, 1], [-1.57, 0.0]);
      }
    } else if (currentCut === 10) {
      // 4TH-WALL CTA & SURVIVAL PLAN BEAT
      activePose = "pointing_camera";
      currentCharPos.set(0.18, 1.25, 0.2);

      if (animatedProps.bubbleMesh) {
        if (f < 25) {
          const bProgress = f / 25.0;
          const bY = interpolate(bProgress, [0, 0.7, 1], [4.5, 1.95, 2.15]);
          animatedProps.bubbleMesh.position.set(-0.65, bY, 0.4);
        } else {
          animatedProps.bubbleMesh.position.set(-0.65, 2.15 + Math.sin(f * 0.08) * 0.03, 0.4);
        }
      }
    }

    // Camera positioning
    const rollAngle = (currentCut === 2 || currentCut === 4 || currentCut === 7) ? 0.035 : 0;
    camera.rotation.z = rollAngle;

    camera.position.set(
      baseCamPos.x + swayX + impactShakeX,
      baseCamPos.y + swayY + impactShakeY,
      baseCamPos.z * creepZoom * punchZoom
    );
    camera.lookAt(baseCamTarget.x, baseCamTarget.y, baseCamTarget.z);

    // Dynamic thin-lens DOF focus
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const curFocus = Math.max(0.5, currentCharPos.clone().sub(camera.position).dot(camDir));
    lensPre.uniforms.get("focus")!.value = curFocus;
    lensMain.uniforms.get("focus")!.value = curFocus;

    // -----------------------------------------------------------
    // HERO 2D CHARACTER MICRO-ANIMATIONS
    // -----------------------------------------------------------
    const blinkCycle = frame % 65;
    let blink = 0;
    if (blinkCycle === 0 || blinkCycle === 3) blink = 0.5;
    else if (blinkCycle === 1 || blinkCycle === 2) blink = 1.0;

    const snotScale = 1.0 + Math.sin(frame * 0.12) * 0.32;
    const headTilt = Math.sin(frame * 0.09) * 2.5 + (springPunch * 1.5);
    const lookX = Math.sin(frame * 0.05) * 0.35;
    const isTalking = currentCut === 1 || currentCut === 10;
    const mouthOpen = isTalking ? Math.max(0, Math.sin(frame * 0.6) * 0.8) : 0;

    drawWhalterPose(charCtx, activePose, {
      frame,
      blink,
      headTilt,
      lookX,
      snotScale,
      mouthOpen,
    });
    charTexture.needsUpdate = true;

    charMesh.position.copy(currentCharPos);
    charMesh.rotation.z = charRotZ;

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
