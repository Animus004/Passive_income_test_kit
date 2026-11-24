import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import * as THREE from "three";

interface IcebergSceneProps {
  topLabel?: string;
  topSubtext?: string;
  bottomLabel?: string;
  bottomSubtext?: string;
  subterraneanTag?: string;
}

export const IcebergScene: React.FC<IcebergSceneProps> = ({
  topLabel = "WHAT YOU SEE",
  topSubtext = "The visible surface",
  bottomLabel = "THE HIDDEN TRUTH",
  bottomSubtext = "The massive underlying infrastructure",
  subterraneanTag = "DEEP INFRASTRUCTURE • 90% HIDDEN",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    icebergGroup: THREE.Group;
    topMesh: THREE.Mesh;
    bottomMesh: THREE.Mesh;
    wireMesh: THREE.LineSegments;
    particles: THREE.Points;
    arrowGroup: THREE.Group;
    arrowShaft: THREE.Mesh;
    arrowTip: THREE.Mesh;
    shockwaveRing: THREE.Mesh;
    bunkerGroup: THREE.Group;
  } | null>(null);

  // Setup Three.js scene once
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
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.4, 9.0);

    // Group that holds the entire iceberg
    const icebergGroup = new THREE.Group();
    scene.add(icebergGroup);

    // 1. TOP TIP (Above water: faceted snow/ice)
    const topGeo = new THREE.ConeGeometry(1.6, 2.2, 7, 2);
    const topPos = topGeo.attributes.position;
    for (let i = 0; i < topPos.count; i++) {
      const y = topPos.getY(i);
      if (y > -1.0) {
        topPos.setX(i, topPos.getX(i) * (0.85 + Math.sin(i * 3.7) * 0.15));
        topPos.setZ(i, topPos.getZ(i) * (0.85 + Math.cos(i * 2.3) * 0.15));
      }
    }
    topGeo.computeVertexNormals();

    const topMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdfa,
      roughness: 0.35,
      metalness: 0.05,
      flatShading: true,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 1.0;
    icebergGroup.add(topMesh);

    // Surface Wedge Entrance portal at top of mountain
    const portalGeo = new THREE.BoxGeometry(0.5, 0.7, 0.6);
    const portalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.3,
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.position.set(0, 1.2, 0.85);
    portalMesh.rotation.x = -0.15;
    icebergGroup.add(portalMesh);

    // 2. MASSIVE ICE BODY (Submerged deep permafrost)
    const bottomGeo = new THREE.CylinderGeometry(1.7, 3.4, 7.5, 9, 4);
    const bPos = bottomGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const y = bPos.getY(i);
      const bulge = Math.sin(((y + 3.75) / 7.5) * Math.PI) * 0.9;
      const noise = (Math.sin(i * 4.1 + y * 2.0) + Math.cos(i * 3.2)) * 0.25;
      bPos.setX(i, bPos.getX(i) * (1.0 + bulge + noise));
      bPos.setZ(i, bPos.getZ(i) * (1.0 + bulge + noise));
    }
    bottomGeo.computeVertexNormals();

    const bottomMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.18,
      metalness: 0.15,
      transmission: 0.65,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });
    const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
    bottomMesh.position.y = -3.75;
    icebergGroup.add(bottomMesh);

    // Wireframe overlay on submerged ice
    const wireGeo = new THREE.WireframeGeometry(bottomGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.45,
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    wireMesh.position.copy(bottomMesh.position);
    icebergGroup.add(wireMesh);

    // =============================================================
    // 3. SUBTERRANEAN PERMAFROST SEED VAULT BUNKER COMPLEX
    // (Located at the bottom depth right where the arrow plunges!)
    // =============================================================
    const bunkerGroup = new THREE.Group();
    bunkerGroup.position.set(0.2, -2.6, 0.7);
    icebergGroup.add(bunkerGroup);

    // Main Fortified Vault Bunker Hull
    const bunkerGeo = new THREE.BoxGeometry(1.8, 1.0, 1.2);
    const bunkerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // industrial dark slate titanium
      roughness: 0.35,
      metalness: 0.75,
    });
    const bunkerMesh = new THREE.Mesh(bunkerGeo, bunkerMat);
    bunkerGroup.add(bunkerMesh);

    // Wireframe on bunker edges for high-tech blueprint aesthetic
    const bWireGeo = new THREE.WireframeGeometry(bunkerGeo);
    const bWireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    const bWireMesh = new THREE.LineSegments(bWireGeo, bWireMat);
    bunkerGroup.add(bWireMesh);

    // Circular Blast Door with glowing cyan rim
    const doorGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 16);
    doorGeo.rotateX(Math.PI / 2);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0, 0.62);
    bunkerGroup.add(doorMesh);

    const doorRimGeo = new THREE.RingGeometry(0.32, 0.36, 24);
    const doorRimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const doorRim = new THREE.Mesh(doorRimGeo, doorRimMat);
    doorRim.position.set(0, 0, 0.69);
    bunkerGroup.add(doorRim);

    // Glowing Cryo-Storage Windows (Amber/Gold seed glow inside)
    const windowGeo = new THREE.BoxGeometry(0.4, 0.1, 0.02);
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let w = -1; w <= 1; w += 2) {
      const win = new THREE.Mesh(windowGeo, windowMat);
      win.position.set(w * 0.55, 0.22, 0.61);
      bunkerGroup.add(win);
    }

    // Vertical Access Shaft Tunnel leading down through the ice to the bunker
    const shaftTunnelGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.2, 12);
    const shaftTunnelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.5,
    });
    const shaftTunnel = new THREE.Mesh(shaftTunnelGeo, shaftTunnelMat);
    shaftTunnel.position.set(0, 1.8, -0.2);
    bunkerGroup.add(shaftTunnel);

    // =============================================================
    // 4. GLOWING NEON ARROW (Plunges from entrance peak down to bunker)
    // =============================================================
    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);

    // Arrow Shaft (Cylinder)
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 16);
    shaftGeo.translate(0, -0.5, 0); // anchor at top so scaling grows downward
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15, // glowing yellow / gold
      transparent: true,
      opacity: 0.9,
    });
    const arrowShaft = new THREE.Mesh(shaftGeo, shaftMat);
    arrowShaft.position.set(0.6, 1.4, 0.4);
    arrowGroup.add(arrowShaft);

    // Arrow Chevron Cone Tip
    const tipGeo = new THREE.ConeGeometry(0.16, 0.4, 16);
    tipGeo.rotateX(Math.PI); // point downward
    const tipMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.95,
    });
    const arrowTip = new THREE.Mesh(tipGeo, tipMat);
    arrowTip.position.set(0.6, 1.4, 0.4);
    arrowGroup.add(arrowTip);

    // Impact Shockwave Ring right on the bunker roof
    const shockwaveGeo = new THREE.RingGeometry(0.05, 0.15, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwaveRing = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveRing.rotation.x = -Math.PI / 2;
    shockwaveRing.position.set(0.6, -2.1, 0.4);
    scene.add(shockwaveRing);

    // 5. UNDERWATER FLOATING PARTICLES
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particleCoords[i] = (Math.random() - 0.5) * 12;
      particleCoords[i + 1] = -Math.random() * 8 - 0.5;
      particleCoords[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particleCoords, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. LIGHTING SETUP
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 8, 5);
    scene.add(sunLight);

    const deepLight = new THREE.DirectionalLight(0x0284c7, 3.5);
    deepLight.position.set(-3, -6, 4);
    scene.add(deepLight);

    const ambLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambLight);

    threeRef.current = {
      renderer,
      scene,
      camera,
      icebergGroup,
      topMesh,
      bottomMesh,
      wireMesh,
      particles,
      arrowGroup,
      arrowShaft,
      arrowTip,
      shockwaveRing,
      bunkerGroup,
    };

    return () => {
      renderer.dispose();
      topGeo.dispose();
      topMat.dispose();
      portalGeo.dispose();
      portalMat.dispose();
      bottomGeo.dispose();
      bottomMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      bunkerGeo.dispose();
      bunkerMat.dispose();
      bWireGeo.dispose();
      bWireMat.dispose();
      doorGeo.dispose();
      doorMat.dispose();
      doorRimGeo.dispose();
      doorRimMat.dispose();
      windowGeo.dispose();
      windowMat.dispose();
      shaftTunnelGeo.dispose();
      shaftTunnelMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      tipGeo.dispose();
      tipMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [width, height]);

  // Update animation per frame
  useEffect(() => {
    if (!threeRef.current) return;
    const {
      renderer,
      scene,
      camera,
      icebergGroup,
      particles,
      arrowShaft,
      arrowTip,
      shockwaveRing,
    } = threeRef.current;

    // Organic buoyancy bobbing
    const bob = Math.sin(frame * 0.05) * 0.12;
    icebergGroup.position.y = -0.3 + bob;

    // Slow cinematic 3D yaw rotation
    icebergGroup.rotation.y = frame * 0.008;
    icebergGroup.rotation.z = Math.sin(frame * 0.03) * 0.02;

    // Particle subtle upward drift
    const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 1; i < posAttr.count * 3; i += 3) {
      let y = posAttr.array[i] + 0.015;
      if (y > 0) y = -8.5;
      posAttr.array[i] = y;
    }
    posAttr.needsUpdate = true;

    // =============================================================
    // GUIDED DOWNHILL CAMERA MOTION & PLUNGING ARROW
    // Arrow plunges from entrance Y = 1.4 down to subterranean bunker roof Y = -2.1
    // =============================================================
    const arrowStartFrame = 14;
    const arrowEndFrame = 48;
    const arrowProgress = interpolate(frame, [arrowStartFrame, arrowEndFrame], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const startY = 1.4;
    const destY = -2.1; // bunker roof
    const totalDist = startY - destY; // 3.5 units
    const currentTipY = startY - totalDist * arrowProgress;

    if (frame < arrowStartFrame) {
      arrowShaft.scale.y = 0.001;
      arrowTip.position.y = startY;
      arrowTip.visible = false;
      arrowShaft.visible = false;
    } else {
      arrowTip.visible = true;
      arrowShaft.visible = true;
      arrowShaft.scale.y = totalDist * arrowProgress;
      arrowTip.position.y = currentTipY - 0.2;
    }

    // Impact Shockwave Ring when arrow hits the bunker roof (frame 48 to 75)
    if (frame >= arrowEndFrame) {
      const ringProg = Math.min(1, (frame - arrowEndFrame) / 20);
      shockwaveRing.scale.set(1 + ringProg * 8, 1 + ringProg * 8, 1);
      (shockwaveRing.material as THREE.MeshBasicMaterial).opacity = (1 - ringProg) * 0.85;
    } else {
      (shockwaveRing.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    // GUIDED CAMERA TRAJECTORY:
    // Follows the arrow from top mountain peak down to the subterranean bunker!
    const camY = interpolate(frame, [0, 14, 52], [2.4, 2.4, -2.0], {
      extrapolateRight: "clamp",
    });
    const camZ = interpolate(frame, [0, 14, 52], [9.2, 9.2, 10.8], {
      extrapolateRight: "clamp",
    });
    const lookY = interpolate(frame, [0, 14, 52], [1.4, 1.4, -2.4], {
      extrapolateRight: "clamp",
    });

    camera.position.set(0, camY, camZ);
    camera.lookAt(0, lookY, 0);

    renderer.render(scene, camera);
  }, [frame]);

  // UI Motion Physics
  const topBadgeOpacity = interpolate(frame, [0, 8, 22, 32], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  const bottomBadgeSpring = spring({
    frame: frame - 46,
    fps,
    config: { damping: 13, stiffness: 150, mass: 0.7 },
  });

  const waterlineY = height * 0.36;

  const currentDepth = Math.round(
    interpolate(frame, [14, 48], [0, 400], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* LAYER 1: 2-STAGE ENVIRONMENT BACKGROUND (SKY & OCEAN DEPTH) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: waterlineY,
          background: "linear-gradient(180deg, #93c5fd 0%, #dbeafe 65%, #f0fdfa 100%)",
        }}
      >
        {/* Distant Arctic Mountain Range Silhouette along Horizon */}
        <svg
          viewBox="0 0 1080 200"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 180,
            opacity: 0.45,
            pointerEvents: "none",
          }}
        >
          <polygon
            points="0,200 60,90 140,150 240,70 350,130 460,50 560,110 680,60 800,140 920,80 1020,130 1080,90 1080,200"
            fill="#94a3b8"
          />
          <polygon
            points="0,200 100,120 190,160 300,100 420,145 520,95 640,150 750,110 860,160 980,105 1080,140 1080,200"
            fill="#e2e8f0"
          />
        </svg>

        {/* Polar Blizzard Fog Band on Horizon */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 70,
            background: "linear-gradient(180deg, transparent 0%, rgba(240, 253, 250, 0.75) 100%)",
            filter: "blur(6px)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Volumetric Ocean / Permafrost Abyss Background */}
      <div
        style={{
          position: "absolute",
          top: waterlineY,
          left: 0,
          width: "100%",
          height: height - waterlineY,
          background: "linear-gradient(180deg, #0284c7 0%, #0369a1 20%, #0c4a6e 50%, #082f49 75%, #020617 100%)",
        }}
      />

      {/* Underwater Light Streaks */}
      <div
        style={{
          position: "absolute",
          top: waterlineY,
          left: "-20%",
          width: "140%",
          height: 600,
          background: "radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.35) 0%, rgba(3, 105, 161, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* LAYER 2: THREE.JS 3D CANVAS */}
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

      {/* LAYER 3: WATERLINE FOAM & SURFACE DISTORTION */}
      <div
        style={{
          position: "absolute",
          top: waterlineY - 6,
          left: 0,
          width: "100%",
          height: 12,
          background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.2) 100%)",
          boxShadow: "0 0 15px rgba(255,255,255,0.7), 0 2px 8px rgba(56,189,248,0.5)",
        }}
      />

      {/* LAYER 4: GUIDED DEPTH TELEMETRY HUD (Active during plunge) */}
      {frame >= 14 && (
        <div
          style={{
            position: "absolute",
            top: "22%",
            right: 45,
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            border: "1.5px solid #facc15",
            borderRadius: 14,
            padding: "8px 18px",
            boxShadow: "0 0 20px rgba(250, 204, 21, 0.3)",
            zIndex: 15,
          }}
        >
          <div style={{ color: "#facc15", fontSize: 20 }}>⬇</div>
          <div>
            <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>DEPTH TELEMETRY</div>
            <div style={{ color: "#ffffff", fontSize: 24, fontWeight: 900, fontFamily: "monospace" }}>
              -{currentDepth} FT
            </div>
          </div>
        </div>
      )}

      {/* LAYER 5: TOP LABEL (The Mountain Peak Entrance) */}
      <div
        style={{
          position: "absolute",
          top: waterlineY - 210,
          right: 50,
          opacity: topBadgeOpacity,
          transform: `translateY(${(1 - topBadgeOpacity) * 20}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            color: "#0f172a",
            padding: "8px 20px",
            borderRadius: 9999,
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: "0.08em",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            border: "2px solid rgba(255,255,255,0.9)",
          }}
        >
          {topLabel}
        </div>
        <div
          style={{
            marginTop: 6,
            color: "#1e293b",
            fontSize: 18,
            fontWeight: 700,
            textShadow: "0 1px 4px rgba(255,255,255,0.8)",
          }}
        >
          {topSubtext}
        </div>
      </div>

      {/* LAYER 6: BOTTOM "HIDDEN TRUTH" CARD (Springs open at bunker depth) */}
      {frame >= 46 && (
        <div
          style={{
            position: "absolute",
            bottom: "34%",
            left: 50,
            maxWidth: 420,
            transform: `scale(${bottomBadgeSpring}) translateY(${(1 - bottomBadgeSpring) * 35}px)`,
            opacity: Math.min(1, bottomBadgeSpring * 1.5),
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              backdropFilter: "blur(20px)",
              padding: "20px 24px",
              borderRadius: 22,
              border: "2px solid #38bdf8",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(56, 189, 248, 0.35)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#38bdf8",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
              {subterraneanTag}
            </div>
            <div
              style={{
                color: "#ffffff",
                fontSize: 30,
                fontWeight: 900,
                lineHeight: 1.15,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              {bottomLabel}
            </div>
            <div
              style={{
                marginTop: 8,
                color: "#cbd5e1",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {bottomSubtext}
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 120px rgba(0,0,0,0.7)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
