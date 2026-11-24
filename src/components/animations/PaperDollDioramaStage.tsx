import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import * as THREE from "three";
import { SubtitleWord } from "../../types";

export interface PaperDollSceneCut {
  sceneIndex: number;
  startFrame: number;
  endFrame: number;
  name: string;
  headerTop: string;
  tickerAmount: string;
  tickerColor: string;
  statusLabel: string;
  environment: string;
}

interface PaperDollDioramaStageProps {
  currentCut: number;
  cuts?: PaperDollSceneCut[];
  totalFrames?: number;
  subtitles?: SubtitleWord[];
  episodeNumber?: string;
  topicTitle?: string;
}

/**
 * Procedural 2D Paper-Doll Canvas Texture Generator
 * Creates crisp, vector-styled paper cutout characters on 512x512 transparent canvases.
 */
function drawPaperDollCharacter(
  ctx: CanvasRenderingContext2D,
  options: {
    hairStyle: "boy_brown" | "nerd_black" | "girl_blonde" | "grandma_white" | "pilot_cap";
    eyeStyle: "shocked" | "panic" | "dots" | "dead_x" | "squint";
    mouthStyle: "scream" | "open_O" | "wavy" | "smile";
    shirtColor: string;
    prop?: "phone_dead" | "cheque" | "bread" | "cable_severed" | "candle" | "chocolate";
    propText?: string;
    armRaised?: boolean;
    paperBorder?: boolean;
  }
) {
  const { hairStyle, eyeStyle, mouthStyle, shirtColor, prop, propText, armRaised, paperBorder = true } = options;

  ctx.clearRect(0, 0, 512, 512);

  // White paper die-cut backing contour
  ctx.save();
  ctx.translate(256, 256);

  // 1. Stick Legs & Chunky Shoes
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#000000";
  ctx.lineCap = "round";

  // Left Leg
  ctx.beginPath();
  ctx.moveTo(-35, 90);
  ctx.lineTo(-35, 195);
  ctx.stroke();

  // Left Shoe
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(-48, 198, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Leg
  ctx.beginPath();
  ctx.moveTo(35, 90);
  ctx.lineTo(35, 195);
  ctx.stroke();

  // Right Shoe
  ctx.beginPath();
  ctx.ellipse(48, 198, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Torso (Chubby Bean / Pill Shape)
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.roundRect(-65, -30, 130, 130, [45, 45, 30, 30]);
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  // Neck Collar
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, -25, 22, 0, Math.PI);
  ctx.fill();
  ctx.stroke();

  // 3. Stick Arms & Hands
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000000";

  // Left Arm (bent or raised)
  ctx.beginPath();
  ctx.moveTo(-60, -10);
  if (armRaised) {
    ctx.lineTo(-115, -60);
    ctx.lineTo(-130, -110);
  } else {
    ctx.lineTo(-100, 40);
    ctx.lineTo(-75, 80);
  }
  ctx.stroke();

  // Left Hand
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath();
  ctx.arc(armRaised ? -130 : -75, armRaised ? -115 : 85, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Arm (holding prop)
  ctx.beginPath();
  ctx.moveTo(60, -10);
  ctx.lineTo(105, 35);
  ctx.lineTo(95, 75);
  ctx.stroke();

  // Right Hand
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath();
  ctx.arc(95, 80, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Props Hand-held
  if (prop === "phone_dead") {
    // Smartphone with red warning cross
    ctx.save();
    ctx.translate(110, 50);
    ctx.rotate(0.15);
    ctx.fillStyle = "#1e293b";
    ctx.roundRect(-25, -45, 50, 90, 8);
    ctx.fill();
    ctx.stroke();

    // Red screen of death
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(-20, -38, 40, 76);

    // White WiFi Disconnected symbol
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, -12);
    ctx.lineTo(12, 12);
    ctx.moveTo(12, -12);
    ctx.lineTo(-12, 12);
    ctx.stroke();
    ctx.restore();
  } else if (prop === "cable_severed") {
    // Severed glowing wire
    ctx.save();
    ctx.translate(110, 60);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-20, 20);
    ctx.lineTo(20, -20);
    ctx.stroke();
    // Yellow sparks
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(22, -22, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (prop === "cheque") {
    ctx.save();
    ctx.translate(100, 55);
    ctx.fillStyle = "#ecfdf5";
    ctx.roundRect(-45, -25, 90, 50, 6);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#059669";
    ctx.stroke();
    ctx.fillStyle = "#047857";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(propText || "$1M", 0, 5);
    ctx.restore();
  } else if (prop === "candle") {
    ctx.save();
    ctx.translate(105, 50);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(-10, -20, 20, 40);
    ctx.stroke();
    // Flame
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.ellipse(0, -28, 8, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Circle-Head (The Walter / CircleToon Trademark)
  ctx.fillStyle = "#fed7aa"; // Warm Peach Skin
  ctx.beginPath();
  ctx.arc(0, -115, 85, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 11;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  // 6. Hair Styles
  ctx.fillStyle = hairStyle === "nerd_black" ? "#0f172a" : hairStyle === "girl_blonde" ? "#facc15" : hairStyle === "grandma_white" ? "#e2e8f0" : "#78350f";
  if (hairStyle === "boy_brown" || hairStyle === "nerd_black") {
    ctx.beginPath();
    ctx.arc(0, -135, 90, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    ctx.stroke();
  } else if (hairStyle === "pilot_cap") {
    // Blue Pilot Cap with Gold Wings
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.ellipse(0, -165, 85, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Cap visor
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(0, -130, 95, 20, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    // Gold badge
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(0, -165, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Facial Expressions
  // Eyes
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#000000";
  if (eyeStyle === "shocked") {
    // Massive round shocked eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-28, -120, 24, 0, Math.PI * 2);
    ctx.arc(28, -120, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Tiny black pupils
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-28, -120, 6, 0, Math.PI * 2);
    ctx.arc(28, -120, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (eyeStyle === "panic") {
    // Spiraling panic / wide eyes with sweat drop
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-28, -120, 22, 0, Math.PI * 2);
    ctx.arc(28, -120, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Shaking pupil
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(-26, -118, 7, 0, Math.PI * 2);
    ctx.arc(26, -118, 7, 0, Math.PI * 2);
    ctx.fill();

    // Blue sweat drop on temple
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.ellipse(65, -160, 10, 18, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Classic black dot eyes
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-25, -120, 10, 0, Math.PI * 2);
    ctx.arc(25, -120, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  if (mouthStyle === "scream" || mouthStyle === "open_O") {
    // Gaping screaming mouth
    ctx.fillStyle = "#881337";
    ctx.beginPath();
    ctx.ellipse(0, -65, 26, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Tongue
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.arc(0, -50, 16, 0, Math.PI);
    ctx.fill();
  } else if (mouthStyle === "wavy") {
    // Wavy nervous squiggly line
    ctx.beginPath();
    ctx.moveTo(-25, -70);
    ctx.quadraticCurveTo(-12, -80, 0, -70);
    ctx.quadraticCurveTo(12, -60, 25, -70);
    ctx.stroke();
  } else {
    // Simple smile
    ctx.beginPath();
    ctx.arc(0, -80, 22, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Procedural 2D Cutout Environment Props (Plane, Server, ATM, City Buildings)
 */
function drawPropTexture(ctx: CanvasRenderingContext2D, type: "airplane" | "server_rack" | "atm_kiosk" | "frozen_city") {
  ctx.clearRect(0, 0, 512, 512);
  ctx.save();
  ctx.translate(256, 256);

  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000000";

  if (type === "airplane") {
    // Stylized Commercial Jetliner (Cutout paper style)
    ctx.fillStyle = "#f8fafc";
    // Fuselage
    ctx.beginPath();
    ctx.ellipse(0, 0, 160, 45, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wings
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(-80, 120);
    ctx.lineTo(-20, 120);
    ctx.lineTo(20, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail fin
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(-130, -10);
    ctx.lineTo(-170, -90);
    ctx.lineTo(-120, -90);
    ctx.lineTo(-90, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit & Passenger Windows
    ctx.fillStyle = "#0284c7";
    ctx.beginPath();
    ctx.ellipse(120, -15, 18, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Warning Red Compass Radar
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(120, -15, 36, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === "server_rack") {
    // Tech Server Tower with blinking dead lights
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-100, -180, 200, 360);
    ctx.stroke();

    // Slots
    for (let y = -140; y <= 140; y += 45) {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-80, y, 160, 30);
      ctx.stroke();

      // Dead red blinking LED
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(-60, y + 15, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "atm_kiosk") {
    // Bank ATM Machine
    ctx.fillStyle = "#334155";
    ctx.fillRect(-90, -150, 180, 300);
    ctx.stroke();

    // Screen
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(-65, -120, 130, 80);
    ctx.stroke();

    // Error text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("ATM OFFLINE", 0, -75);

    // Keypad & Card slot
    ctx.fillStyle = "#64748b";
    ctx.fillRect(-50, -10, 100, 45);
    ctx.stroke();
  }

  ctx.restore();
}

export const PaperDollDioramaStage: React.FC<PaperDollDioramaStageProps> = ({
  currentCut = 1,
  cuts = [],
  totalFrames = 1233,
  subtitles = [],
  episodeNumber = "#2",
  topicTitle = "GLOBAL INTERNET DELETED",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    dioramaGroup: THREE.Group;
    heroMesh: THREE.Mesh;
    heroTexture: THREE.CanvasTexture;
    heroCanvas: HTMLCanvasElement;
    heroCtx: CanvasRenderingContext2D;
    propMesh: THREE.Mesh;
    propTexture: THREE.CanvasTexture;
    propCanvas: HTMLCanvasElement;
    propCtx: CanvasRenderingContext2D;
    crowdGroup: THREE.Group;
    sunLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    spotLight: THREE.SpotLight;
  } | null>(null);

  // Active cut relative timing
  const activeCutData = cuts.find((c) => c.sceneIndex === currentCut) || cuts[currentCut - 1] || {
    sceneIndex: 1,
    startFrame: 0,
    endFrame: 135,
    name: "The Hook",
    headerTop: "WHAT IF THE INTERNET WAS",
    tickerAmount: "DELETED FOR 72H",
    tickerColor: "#ef4444",
    statusLabel: "12:01 AM • ZERO CONNECTION",
    environment: "desk_offline",
  };

  const cutStart = activeCutData.startFrame || 0;
  const f = Math.max(0, frame - cutStart);

  // Initialize Three.js WebGL Engine with Soft Shadows
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Studio soft shadows

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Obsidian Studio Navy

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(6.2, 7.8, 7.0);
    camera.lookAt(0, 1.2, 0);

    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    // 1. ISOMETRIC STUDIO TABLETOP (Ground Plane that receives shadows)
    const tableW = 12;
    const tableD = 10;
    const tableH = 0.5;
    const floorGeo = new THREE.BoxGeometry(tableW, tableH, tableD);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Matte Studio Slate
      roughness: 0.6,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -tableH / 2;
    floorMesh.receiveShadow = true;
    dioramaGroup.add(floorMesh);

    // Grid Floor Guide Lines (Papercraft Blueprint Aesthetic)
    const gridHelper = new THREE.GridHelper(tableW, 16, 0x38bdf8, 0x334155);
    gridHelper.position.y = 0.005;
    dioramaGroup.add(gridHelper);

    // 2. HERO PAPER-DOLL CHARACTER STANDING PLANE
    const heroCanvas = document.createElement("canvas");
    heroCanvas.width = 512;
    heroCanvas.height = 512;
    const heroCtx = heroCanvas.getContext("2d")!;
    drawPaperDollCharacter(heroCtx, {
      hairStyle: "boy_brown",
      eyeStyle: "panic",
      mouthStyle: "scream",
      shirtColor: "#2563eb",
      prop: "phone_dead",
      armRaised: true,
    });

    const heroTexture = new THREE.CanvasTexture(heroCanvas);
    heroTexture.minFilter = THREE.LinearFilter;
    heroTexture.magFilter = THREE.LinearFilter;

    const heroGeo = new THREE.PlaneGeometry(2.2, 2.2);
    const heroMat = new THREE.MeshStandardMaterial({
      map: heroTexture,
      transparent: true,
      alphaTest: 0.08,
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const heroMesh = new THREE.Mesh(heroGeo, heroMat);
    heroMesh.position.set(-0.6, 1.1, 0.4);
    heroMesh.rotation.y = 0.35;
    heroMesh.castShadow = true; // Projects shadow onto floorMesh!
    heroMesh.receiveShadow = false;
    dioramaGroup.add(heroMesh);

    // Acrylic base disc for hero standee
    const discGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 32);
    const discMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    const heroDisc = new THREE.Mesh(discGeo, discMat);
    heroDisc.position.set(-0.6, 0.02, 0.4);
    heroDisc.receiveShadow = true;
    dioramaGroup.add(heroDisc);

    // 3. SECONDARY PROP MESH (Airplane, Server, or ATM)
    const propCanvas = document.createElement("canvas");
    propCanvas.width = 512;
    propCanvas.height = 512;
    const propCtx = propCanvas.getContext("2d")!;
    drawPropTexture(propCtx, "airplane");

    const propTexture = new THREE.CanvasTexture(propCanvas);
    const propGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const propMat = new THREE.MeshStandardMaterial({
      map: propTexture,
      transparent: true,
      alphaTest: 0.08,
      roughness: 0.75,
      side: THREE.DoubleSide,
    });
    const propMesh = new THREE.Mesh(propGeo, propMat);
    propMesh.position.set(1.6, 1.3, -0.6);
    propMesh.rotation.y = -0.35;
    propMesh.castShadow = true;
    dioramaGroup.add(propMesh);

    // 4. BACKGROUND CROWD GROUP (Layered standees)
    const crowdGroup = new THREE.Group();
    dioramaGroup.add(crowdGroup);

    // 5. STUDIO LIGHTING RIG (Directional Sun Key Light for Real-Time Shadows)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.2);
    sunLight.position.set(7.5, 13.0, 6.0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.radius = 3.8; // Soft shadow dispersion
    scene.add(sunLight);

    const spotLight = new THREE.SpotLight(0x38bdf8, 4.0, 15, Math.PI / 4, 0.3);
    spotLight.position.set(-4, 8, -4);
    spotLight.target = heroMesh;
    scene.add(spotLight);

    threeRef.current = {
      renderer,
      scene,
      camera,
      dioramaGroup,
      heroMesh,
      heroTexture,
      heroCanvas,
      heroCtx,
      propMesh,
      propTexture,
      propCanvas,
      propCtx,
      crowdGroup,
      sunLight,
      ambientLight,
      spotLight,
    };

    return () => {
      renderer.dispose();
    };
  }, [width, height]);

  // Per-frame reactive animation & camera choreography
  useEffect(() => {
    if (!threeRef.current) return;
    const {
      renderer,
      scene,
      camera,
      heroMesh,
      heroTexture,
      heroCanvas,
      heroCtx,
      propMesh,
      propTexture,
      propCanvas,
      propCtx,
      sunLight,
    } = threeRef.current;

    // Update texture based on current scene cut
    if (currentCut === 1 || currentCut === 2) {
      // Scene 1 & 2: Hero looking at frozen phone / screen
      drawPaperDollCharacter(heroCtx, {
        hairStyle: "boy_brown",
        eyeStyle: "panic",
        mouthStyle: "scream",
        shirtColor: "#2563eb",
        prop: "phone_dead",
        armRaised: true,
      });
      drawPropTexture(propCtx, "server_rack");
      propMesh.position.set(1.5, 1.2, -0.4);
    } else if (currentCut === 3) {
      // Scene 3: Airplanes flying blind
      drawPaperDollCharacter(heroCtx, {
        hairStyle: "pilot_cap",
        eyeStyle: "shocked",
        mouthStyle: "open_O",
        shirtColor: "#1e3a8a",
        prop: "cable_severed",
        armRaised: false,
      });
      drawPropTexture(propCtx, "airplane");
      // Plane floating up and down
      propMesh.position.set(1.4, 2.2 + Math.sin(frame * 0.12) * 0.2, -0.2);
    } else if (currentCut === 4 || currentCut === 5) {
      // Scene 4 & 5: ATMs dead & grocery store freeze
      drawPaperDollCharacter(heroCtx, {
        hairStyle: "grandma_white",
        eyeStyle: "panic",
        mouthStyle: "scream",
        shirtColor: "#dc2626",
        prop: "candle",
        armRaised: true,
      });
      drawPropTexture(propCtx, "atm_kiosk");
      propMesh.position.set(1.6, 1.2, -0.3);
    } else {
      // Scene 6, 7 & 8: Barter economy & infinite loop
      drawPaperDollCharacter(heroCtx, {
        hairStyle: "nerd_black",
        eyeStyle: "shocked",
        mouthStyle: "wavy",
        shirtColor: "#059669",
        prop: "chocolate",
        armRaised: false,
      });
      drawPropTexture(propCtx, "server_rack");
      propMesh.position.set(1.6, 1.2, -0.4);
    }

    heroTexture.needsUpdate = true;
    propTexture.needsUpdate = true;

    // Stop-Motion Paper Wobble (Handcrafted physical aesthetic)
    const paperWobbleZ = Math.sin(frame * 0.18) * 0.035;
    const paperBobY = Math.abs(Math.sin(frame * 0.12)) * 0.04;
    heroMesh.rotation.z = paperWobbleZ;
    heroMesh.position.y = 1.1 + paperBobY;

    // Dynamic Camera Orbit & Spring Push-Ins
    const springPunch = spring({ frame: f, fps, config: { damping: 14, stiffness: 180 } });
    const targetZoom = interpolate(springPunch, [0, 1], [9.2, 7.8]);
    const targetAngle = 0.82 + Math.sin(frame * 0.015) * 0.06;

    camera.position.x = Math.cos(targetAngle) * targetZoom;
    camera.position.z = Math.sin(targetAngle) * targetZoom;
    camera.position.y = 6.4 - springPunch * 0.6;
    camera.lookAt(0, 1.0, 0);

    // Subtle sun shadow angle shift
    sunLight.position.x = 7.5 + Math.sin(frame * 0.02) * 1.5;

    renderer.render(scene, camera);
  }, [frame, currentCut, f, fps]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
      }}
    >
      {/* 1. Main Three.js 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* 2. Top Viral Header HUD (Metric Ticker & Emergency Banner) */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 40,
          right: 40,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            border: "3px solid #38bdf8",
            borderRadius: 24,
            padding: "16px 28px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.35)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "#94a3b8", fontSize: 20, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
              EPISODE {episodeNumber} • {activeCutData.headerTop || "WHAT IF"}
            </div>
            <div style={{ color: activeCutData.tickerColor || "#ef4444", fontSize: 44, fontWeight: 900, fontFamily: "'Impact', Arial Black, sans-serif" }}>
              {activeCutData.tickerAmount || "72 HOURS OFFLINE"}
            </div>
          </div>
          <div
            style={{
              backgroundColor: activeCutData.tickerColor || "#ef4444",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: 16,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            LIVE
          </div>
        </div>

        {/* Status Sub-badge */}
        <div
          style={{
            alignSelf: "flex-start",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            border: "2px solid #ef4444",
            borderRadius: 14,
            padding: "8px 18px",
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          ⚠️ {activeCutData.statusLabel || "CRITICAL SIMULATION"}
        </div>
      </div>
    </div>
  );
};
