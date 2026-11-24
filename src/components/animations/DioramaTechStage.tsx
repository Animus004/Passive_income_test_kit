import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import * as THREE from "three";

interface DioramaTechStageProps {
  currentCut?: number;
  cut1?: number;
  cut2?: number;
  cut3?: number;
  cut4?: number;
  cut5?: number;
  totalFrames?: number;
  topRightTag?: string;
  bottomLeftLabel?: string;
  bottomRightMetric?: string;
}

export const DioramaTechStage: React.FC<DioramaTechStageProps> = ({
  currentCut = 1,
  cut1 = 0,
  cut2 = 301,
  cut3 = 671,
  cut4 = 1102,
  cut5 = 1450,
  totalFrames = 1703,
  topRightTag = "SIGNAL // ABSORPTION",
  bottomLeftLabel = "CONCRETE MATRIX",
  bottomRightMetric = "POWER LOSS: -30dB/cm",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    dioramaGroup: THREE.Group;
    routerMesh: THREE.Mesh;
    laptopMesh: THREE.Mesh;
    wallMesh: THREE.Mesh;
    meshRelay: THREE.Mesh;
    meshConduit: THREE.Line;
    particles: THREE.Points;
    particlePos: Float32Array;
    particleSpeeds: Float32Array;
    waveRings: THREE.Mesh[];
    sparkParticles: THREE.Points;
    sparkPos: Float32Array;
    cyanLight: THREE.PointLight;
    redLight: THREE.PointLight;
    greenLight: THREE.PointLight;
    charGroup: THREE.Group;
    h2oStones: THREE.Mesh[];
  } | null>(null);

  // Setup Three.js 3D Diorama once
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
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17); // Deep OLED Obsidian Navy

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(7.5, 6.2, 7.5);
    camera.lookAt(0, 0.6, 0);

    // Root Diorama Group
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    // 1. FLOATING ISOMETRIC TECH PODIUM (Beveled Platform)
    const stageWidth = 7.2;
    const stageDepth = 6.2;
    const stageHeight = 0.45;
    const floorGeo = new THREE.BoxGeometry(stageWidth, stageHeight, stageDepth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.55,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -stageHeight / 2;
    floorMesh.receiveShadow = true;
    dioramaGroup.add(floorMesh);

    // Cyan base plinth glow
    const plinthGeo = new THREE.BoxGeometry(stageWidth + 0.2, 0.08, stageDepth + 0.2);
    const plinthMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -stageHeight - 0.04;
    dioramaGroup.add(plinth);

    // Floor Grid Helper (Isometric CAD lines)
    const gridHelper = new THREE.GridHelper(stageWidth, 14, 0x00f5ff, 0x1e293b);
    gridHelper.position.y = 0.005;
    dioramaGroup.add(gridHelper);

    // 2. THE HERO 3D CONCRETE BARRIER CROSS-SECTION (Angled cutaway slab)
    const wallThick = 0.35;
    const wallH = 2.2;
    const wallD = 2.6;
    const wallGeo = new THREE.BoxGeometry(wallThick, wallH, wallD);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.75,
      metalness: 0.2,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, wallH / 2, 0);
    wallMesh.rotation.y = -0.35;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    dioramaGroup.add(wallMesh);

    // Concrete internal steel rebar columns (Glowing crimson hazard)
    const rebarGeo = new THREE.CylinderGeometry(0.035, 0.035, wallH - 0.2, 16);
    const rebarMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xdc2626,
      emissiveIntensity: 0.4,
    });
    const rebar1 = new THREE.Mesh(rebarGeo, rebarMat);
    rebar1.position.set(0.3, wallH / 2, -0.7);
    dioramaGroup.add(rebar1);

    const rebar2 = new THREE.Mesh(rebarGeo, rebarMat);
    rebar2.position.set(-0.3, wallH / 2, 0.7);
    dioramaGroup.add(rebar2);

    // Concrete aggregate texture blocks (trapped H2O moisture blocks)
    const h2oStones: THREE.Mesh[] = [];
    for (let k = 0; k < 6; k++) {
      const stoneGeo = new THREE.DodecahedronGeometry(0.14 + (k % 3) * 0.04);
      const stoneMat = new THREE.MeshStandardMaterial({
        color: k % 2 === 0 ? 0x0284c7 : 0x475569,
        roughness: 0.5,
        metalness: 0.3,
        emissive: k % 2 === 0 ? 0x00f5ff : 0x000000,
        emissiveIntensity: k % 2 === 0 ? 0.45 : 0,
      });
      const stoneMesh = new THREE.Mesh(stoneGeo, stoneMat);
      stoneMesh.position.set(
        -0.2 + (k % 3) * 0.2,
        0.35 + k * 0.32,
        -0.9 + k * 0.36
      );
      dioramaGroup.add(stoneMesh);
      h2oStones.push(stoneMesh);
    }

    // 3. THE 3D ROUTER STATION (Left Zone)
    const routerGeo = new THREE.BoxGeometry(0.85, 0.24, 0.6);
    const routerMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
    });
    const routerMesh = new THREE.Mesh(routerGeo, routerMat);
    routerMesh.position.set(-2.2, 0.12, 0.4);
    routerMesh.rotation.y = 0.2;
    routerMesh.castShadow = true;
    dioramaGroup.add(routerMesh);

    // Dual Antennas
    const antGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.8, 12);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const ant1 = new THREE.Mesh(antGeo, antMat);
    ant1.position.set(-2.4, 0.6, 0.2);
    ant1.rotation.z = -0.15;
    dioramaGroup.add(ant1);

    const ant2 = new THREE.Mesh(antGeo, antMat);
    ant2.position.set(-2.4, 0.6, 0.6);
    ant2.rotation.z = -0.15;
    dioramaGroup.add(ant2);

    // 4. THE 3D LAPTOP / CLIENT RECEIVER (Right Zone)
    const laptopBaseGeo = new THREE.BoxGeometry(0.8, 0.04, 0.55);
    const laptopMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const laptopMesh = new THREE.Mesh(laptopBaseGeo, laptopMat);
    laptopMesh.position.set(2.1, 0.02, -0.4);
    laptopMesh.rotation.y = -0.4;
    laptopMesh.castShadow = true;
    dioramaGroup.add(laptopMesh);

    // Laptop Screen
    const screenGeo = new THREE.BoxGeometry(0.8, 0.55, 0.03);
    const screenMesh = new THREE.Mesh(screenGeo, laptopMat);
    screenMesh.position.set(2.1, 0.3, -0.65);
    screenMesh.rotation.y = -0.4;
    screenMesh.rotation.x = 0.2;
    dioramaGroup.add(screenMesh);

    // Screen Display (Warning Red Dead Zone)
    const dispGeo = new THREE.PlaneGeometry(0.72, 0.46);
    const dispMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const disp = new THREE.Mesh(dispGeo, dispMat);
    disp.position.set(2.1, 0.3, -0.63);
    disp.rotation.y = -0.4;
    disp.rotation.x = 0.2;
    dioramaGroup.add(disp);

    // 5. BEAT 4 MESH REPEATER NODE (Top-Center of Platform)
    const meshNodeGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.3, 24);
    const meshNodeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald Green Mesh Node
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      metalness: 0.5,
    });
    const meshRelay = new THREE.Mesh(meshNodeGeo, meshNodeMat);
    meshRelay.position.set(0, 0.15, -2.1);
    meshRelay.visible = false;
    dioramaGroup.add(meshRelay);

    // Curved bypass conduit line for mesh routing
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, 0.3, 0.4),
      new THREE.Vector3(0, 0.5, -2.1),
      new THREE.Vector3(2.1, 0.3, -0.4),
    ]);
    const conduitGeo = new THREE.TubeGeometry(curve, 32, 0.03, 8, false);
    const conduitMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0 });
    const meshConduit = new THREE.Mesh(conduitGeo, conduitMat);
    dioramaGroup.add(meshConduit);

    // 6. THE 2D PAPER DOLL STANDING CHARACTER (Stylized Acrylic Standee)
    const charGroup = new THREE.Group();
    charGroup.position.set(-1.2, 0.0, 1.8);
    charGroup.rotation.y = 0.5;
    dioramaGroup.add(charGroup);

    // Acrylic stand base
    const standGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.03, 24);
    const standMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const standMesh = new THREE.Mesh(standGeo, standMat);
    standMesh.position.y = 0.015;
    charGroup.add(standMesh);

    // Character Silhouette Body (Geometric stylized cat detective)
    const charBodyGeo = new THREE.BoxGeometry(0.55, 1.0, 0.025);
    const charBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1,
    });
    const charBody = new THREE.Mesh(charBodyGeo, charBodyMat);
    charBody.position.y = 0.55;
    charBody.castShadow = true;
    charGroup.add(charBody);

    // Cyan Monocle on character
    const monoGeo = new THREE.TorusGeometry(0.1, 0.02, 12, 24);
    const monoMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const mono = new THREE.Mesh(monoGeo, monoMat);
    mono.position.set(0.1, 0.8, 0.02);
    charGroup.add(mono);

    // Red Tie
    const tieGeo = new THREE.BoxGeometry(0.08, 0.25, 0.02);
    const tieMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.45, 0.02);
    charGroup.add(tie);

    // 7. VOLUMETRIC 3D RADIO WAVE RINGS (Expanding from router)
    const waveRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(0.4 + i * 0.4, 0.02, 12, 36, Math.PI);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.6 - i * 0.1,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.y = Math.PI / 2.3;
      ringMesh.rotation.x = Math.PI / 2.3;
      ringMesh.position.set(-2.2, 0.4, 0.4);
      dioramaGroup.add(ringMesh);
      waveRings.push(ringMesh);
    }

    // 8. HIGH-DENSITY 3D PHOTON PARTICLES (160 Particles)
    const pCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(pCount * 3);
    const particleSpeeds = new Float32Array(pCount);

    for (let i = 0; i < pCount; i++) {
      const idx = i * 3;
      particlePos[idx] = -2.2 + Math.random() * 2.1;
      particlePos[idx + 1] = 0.2 + Math.random() * 1.5;
      particlePos[idx + 2] = 0.3 + (Math.random() - 0.5) * 1.8;
      particleSpeeds[i] = 0.035 + Math.random() * 0.035;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, pMat);
    dioramaGroup.add(particles);

    // 9. COLLISION IMPACT SPARK SHOWER (Red packets shattered on concrete face)
    const sCount = 80;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sCount * 3);
    for (let i = 0; i < sCount; i++) {
      const idx = i * 3;
      sparkPos[idx] = -0.15 + (Math.random() - 0.5) * 0.1;
      sparkPos[idx + 1] = 0.3 + Math.random() * 1.5;
      sparkPos[idx + 2] = (Math.random() - 0.5) * 1.8;
    }
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xff2a2a,
      size: 0.065,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    dioramaGroup.add(sparkParticles);

    // 10. DYNAMIC VOLUMETRIC LIGHTING
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const sunKey = new THREE.DirectionalLight(0xffffff, 2.8);
    sunKey.position.set(6, 9, 6);
    sunKey.castShadow = true;
    sunKey.shadow.mapSize.width = 1024;
    sunKey.shadow.mapSize.height = 1024;
    scene.add(sunKey);

    const cyanLight = new THREE.PointLight(0x00f5ff, 4.5, 6.0);
    cyanLight.position.set(-2.2, 0.6, 0.4);
    dioramaGroup.add(cyanLight);

    const redLight = new THREE.PointLight(0xff2a2a, 4.0, 5.0);
    redLight.position.set(-0.15, 1.0, 0);
    dioramaGroup.add(redLight);

    const greenLight = new THREE.PointLight(0x10b981, 0, 5.0);
    greenLight.position.set(0, 0.8, -2.1);
    dioramaGroup.add(greenLight);

    threeRef.current = {
      renderer,
      scene,
      camera,
      dioramaGroup,
      routerMesh,
      laptopMesh,
      wallMesh,
      meshRelay,
      meshConduit,
      particles,
      particlePos,
      particleSpeeds,
      waveRings,
      sparkParticles,
      sparkPos,
      cyanLight,
      redLight,
      greenLight,
      charGroup,
      h2oStones,
    };

    return () => {
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      charBodyGeo.dispose();
      charBodyMat.dispose();
      routerGeo.dispose();
      routerMat.dispose();
      particleGeo.dispose();
      pMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, [width, height]);

  // Frame-by-Frame 5-Beat Animation Loop
  useEffect(() => {
    if (!threeRef.current) return;
    const {
      renderer,
      scene,
      camera,
      dioramaGroup,
      meshRelay,
      meshConduit,
      particles,
      particlePos,
      particleSpeeds,
      waveRings,
      sparkParticles,
      sparkPos,
      cyanLight,
      redLight,
      greenLight,
      charGroup,
      h2oStones,
    } = threeRef.current;

    // 1. 5-Beat Dynamic Camera Choreography:
    let targetRadius = 9.8;
    let targetAngle = 0.85;
    let targetCamY = 6.0;
    let lookTargetY = 0.6;
    let lookTargetX = 0;
    let lookTargetZ = 0;

    if (frame < cut2) {
      // Beat 1: Wide Isometric Orbit (0..301)
      const p = frame / (cut2 || 301);
      targetRadius = interpolate(p, [0, 1], [10.2, 8.8]);
      targetAngle = interpolate(p, [0, 1], [0.92, 0.76]);
      targetCamY = interpolate(p, [0, 1], [6.2, 5.4]);
      lookTargetY = 0.6;
    } else if (frame < cut3) {
      // Beat 2: Macro Dolly into Concrete Cross-Section (301..671)
      const p = (frame - cut2) / (cut3 - cut2);
      targetRadius = interpolate(p, [0, 1], [8.8, 5.5]);
      targetAngle = interpolate(p, [0, 1], [0.76, 0.45]);
      targetCamY = interpolate(p, [0, 1], [5.4, 2.9]);
      lookTargetY = interpolate(p, [0, 1], [0.6, 1.1]);
      lookTargetX = interpolate(p, [0, 1], [0, 0.1]);
    } else if (frame < cut4) {
      // Beat 3: Crisis Shock & Dead Zone Warning (671..1102)
      const p = (frame - cut3) / (cut4 - cut3);
      targetRadius = interpolate(p, [0, 1], [5.5, 7.8]);
      targetAngle = interpolate(p, [0, 1], [0.45, 1.10]);
      targetCamY = interpolate(p, [0, 1], [2.9, 4.6]);
      lookTargetY = 0.8;
      lookTargetX = interpolate(p, [0, 1], [0.1, 0.5]);
    } else if (frame < cut5) {
      // Beat 4: Tactical Overhead Mesh Routing (1102..1450)
      const p = (frame - cut4) / (cut5 - cut4);
      targetRadius = interpolate(p, [0, 1], [7.8, 10.4]);
      targetAngle = interpolate(p, [0, 1], [1.10, 0.95]);
      targetCamY = interpolate(p, [0, 1], [4.6, 7.2]);
      lookTargetY = 0.4;
      lookTargetZ = -0.5;
    } else {
      // Beat 5: Return to Beat 1 Starting Angle for Infinite Loop (1450..1703)
      const p = (frame - cut5) / (totalFrames - cut5);
      targetRadius = interpolate(p, [0, 1], [10.4, 10.2]);
      targetAngle = interpolate(p, [0, 1], [0.95, 0.92]);
      targetCamY = interpolate(p, [0, 1], [7.2, 6.2]);
      lookTargetY = 0.6;
    }

    camera.position.x = Math.cos(targetAngle) * targetRadius;
    camera.position.z = Math.sin(targetAngle) * targetRadius;
    camera.position.y = targetCamY;
    camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);

    // 2. Character Standee Micro-bobbing
    const charBob = Math.sin(frame * 0.15) * 0.02;
    charGroup.position.y = charBob;

    // 3. Volumetric Wave Rings Expansion
    waveRings.forEach((ring, idx) => {
      const ringProgress = ((frame * 2.5 + idx * 35) % 140) / 140;
      const ringScale = 0.3 + ringProgress * 2.4;
      ring.scale.set(ringScale, ringScale, 1);
      (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 * (1 - ringProgress));
    });

    // 4. H2O Moisture Stones Oscillation in Beat 2 & 3
    if (frame >= cut2 && frame < cut4) {
      h2oStones.forEach((stone, i) => {
        stone.rotation.x += 0.02;
        stone.rotation.y += 0.03;
        const pulse = 1.0 + Math.sin(frame * 0.2 + i) * 0.15;
        stone.scale.set(pulse, pulse, pulse);
      });
    }

    // 5. Mesh Relay Activation in Beat 4
    if (frame >= cut4 && frame < cut5) {
      meshRelay.visible = true;
      (meshConduit.material as THREE.MeshBasicMaterial).opacity = 0.85;
      greenLight.intensity = 3.5 + Math.sin(frame * 0.3) * 1.5;
    } else {
      meshRelay.visible = false;
      (meshConduit.material as THREE.MeshBasicMaterial).opacity = 0;
      greenLight.intensity = 0;
    }

    // 6. 3D High-Velocity Photon Swarm Animation
    const pCount = particlePos.length / 3;
    for (let i = 0; i < pCount; i++) {
      const idx = i * 3;
      particlePos[idx] += particleSpeeds[i];
      if (particlePos[idx] >= -0.15) {
        particlePos[idx] = -2.2;
        particlePos[idx + 1] = 0.2 + Math.random() * 1.4;
        particlePos[idx + 2] = 0.3 + (Math.random() - 0.5) * 1.8;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // 7. Collision Spark Jitter (Intensifies during Beat 3)
    const isCrisis = frame >= cut3 && frame < cut4;
    const sCount = sparkPos.length / 3;
    for (let i = 0; i < sCount; i++) {
      const idx = i * 3;
      sparkPos[idx + 1] += (Math.random() - 0.5) * (isCrisis ? 0.05 : 0.02);
    }
    sparkParticles.geometry.attributes.position.needsUpdate = true;

    // 8. Dynamic Light Pulsing
    cyanLight.intensity = 3.8 + Math.sin(frame * 0.25) * 1.2;
    redLight.intensity = (isCrisis ? 5.5 : 3.5) + Math.sin(frame * (isCrisis ? 0.6 : 0.35) + 1.0) * 2.0;

    // Render 3D Frame
    renderer.render(scene, camera);
  }, [frame]);

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden" }}>
      {/* THREE.JS 3D CANVAS */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* FLOATING 3D GLASS TELEMETRY BADGES */}
      {/* Left Transmitter HUD */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: "6%",
          backgroundColor: "rgba(10, 14, 23, 0.8)",
          border: "1.5px solid #00F5FF",
          borderRadius: 14,
          padding: "10px 18px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 25px rgba(0, 245, 255, 0.35)",
        }}
      >
        <div style={{ color: "#00F5FF", fontSize: 13, fontFamily: "monospace", fontWeight: 800, letterSpacing: 2 }}>
          ● TX EMITTER // 5.0 GHz
        </div>
        <div style={{ color: "#ffffff", fontSize: 22, fontWeight: 900, fontFamily: "monospace" }}>
          {bottomLeftLabel}
        </div>
      </div>

      {/* Center Barrier Warning HUD */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "8%",
          backgroundColor: "rgba(10, 14, 23, 0.85)",
          border: "1.5px solid #DC2626",
          borderRadius: 14,
          padding: "10px 18px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(220, 38, 38, 0.4)",
        }}
      >
        <div style={{ color: "#DC2626", fontSize: 13, fontFamily: "monospace", fontWeight: 800, letterSpacing: 2 }}>
          ⚠️ STATUS // {topRightTag}
        </div>
        <div style={{ color: "#ffffff", fontSize: 22, fontWeight: 900, fontFamily: "monospace" }}>
          {bottomRightMetric}
        </div>
      </div>
    </div>
  );
};
