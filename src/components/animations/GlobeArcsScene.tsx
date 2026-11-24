import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import * as THREE from "three";

interface GlobeArcsSceneProps {
  sealTitle?: string;
  sealSubtitle?: string;
}

export const GlobeArcsScene: React.FC<GlobeArcsSceneProps> = ({
  sealTitle = "CIVILIZATION BACKUP: ONLINE",
  sealSubtitle = "1.3M BIOLOGICAL BLUEPRINTS SECURED",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    globeGroup: THREE.Group;
    resetLines: THREE.Line[];
    rebootArcs: THREE.Line[];
    cropSprouts: THREE.Group[];
  } | null>(null);

  // Springs for HUD seal entry
  const sealSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  // Rotation of the 3D globe
  const globeRotY = interpolate(frame, [0, 240], [-0.4, 0.8]);

  // Phase 1: Pull back (collapse/reset) from frame 6 to 24 (1 to 0)
  const pullBackProgress = interpolate(frame, [6, 24], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: Reboot arc shoot-out from frame 32 to 70 (0 to 1)
  const rebootProgress = interpolate(frame, [32, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isCrop = /crop|seed|food|sprout|agriculture|plant|bio/i.test(sealTitle + sealSubtitle);

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
    renderer.toneMappingExposure = 1.3;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 12.0);
    camera.lookAt(0, 0, 0);

    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, -0.2, 0);
    scene.add(globeGroup);

    // 1. 3D VECTOR GLOBE (Dark core + Cyan wireframe + Atmosphere halo)
    const globeRadius = 2.4;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 28, 20);

    const innerMat = new THREE.MeshBasicMaterial({ color: 0x071126 });
    const innerSphere = new THREE.Mesh(sphereGeo, innerMat);
    globeGroup.add(innerSphere);

    const wireGeo = new THREE.WireframeGeometry(sphereGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Latitude ring
    const latGeo = new THREE.RingGeometry(globeRadius * 0.99, globeRadius * 1.01, 64);
    const latMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const latRing = new THREE.Mesh(latGeo, latMat);
    latRing.rotation.x = Math.PI / 2;
    globeGroup.add(latRing);

    // Atmospheric Planetary Limb Glow Halo
    const haloGeo = new THREE.SphereGeometry(globeRadius * 1.08, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // Helper: Spherical to 3D Cartesian coordinates
    const toVec3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 2. SVALBARD BEACON (Located around 78° N, 15° E)
    const svalbardPos = toVec3(78, 15, globeRadius);

    const pinGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.copy(svalbardPos);
    globeGroup.add(pinMesh);

    const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85 });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.copy(svalbardPos).multiplyScalar(1.2);
    beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), svalbardPos.clone().normalize());
    globeGroup.add(beamMesh);

    // 3. TARGET CONTINENT DESTINATIONS (8 Primary Arc Endpoints)
    const destinations = [
      { lat: 41, lon: -93, name: "North America (Midwest)" },
      { lat: -14, lon: -51, name: "South America (Cerrado)" },
      { lat: 48, lon: 3, name: "Western Europe" },
      { lat: 49, lon: 32, name: "Eastern Europe (Ukraine)" },
      { lat: 9, lon: 8, name: "West Africa (Sahel)" },
      { lat: 28, lon: 77, name: "South Asia (India)" },
      { lat: 34, lon: 114, name: "East Asia (China)" },
      { lat: -33, lon: 147, name: "Australia (Murray-Darling)" },
    ];

    const resetLines: THREE.Line[] = [];
    const rebootArcs: THREE.Line[] = [];

    destinations.forEach((dest) => {
      const targetPos = toVec3(dest.lat, dest.lon, globeRadius);
      const midPoint = svalbardPos.clone().add(targetPos).multiplyScalar(0.5);
      const altitude = globeRadius * 1.48;
      midPoint.normalize().multiplyScalar(altitude);

      // A. Old network lines that pull back (Collapse)
      const oldCurve = new THREE.QuadraticBezierCurve3(svalbardPos, midPoint, targetPos);
      const oldPoints = oldCurve.getPoints(40);
      const oldGeo = new THREE.BufferGeometry().setFromPoints(oldPoints);
      const oldMat = new THREE.LineBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.6,
      });
      const oldLine = new THREE.Line(oldGeo, oldMat);
      globeGroup.add(oldLine);
      resetLines.push(oldLine);

      // B. Golden reboot arcs that shoot outward
      const rebootCurve = new THREE.QuadraticBezierCurve3(svalbardPos, midPoint, targetPos);
      const rebootPoints = rebootCurve.getPoints(50);
      const rebootGeo = new THREE.BufferGeometry().setFromPoints(rebootPoints);
      const rebootMat = new THREE.LineBasicMaterial({
        color: 0xfacc15, // brilliant gold
        transparent: true,
        opacity: 0,
      });
      const rebootLine = new THREE.Line(rebootGeo, rebootMat);
      globeGroup.add(rebootLine);
      rebootArcs.push(rebootLine);
    });

    // =============================================================
    // 4. 3D CROPS GROWING AROUND THE WORLD ON THE GLOBE SURFACE
    // 21 Agricultural Breadbaskets covering all continents
    // =============================================================
    const cropHubs = [
      // North America
      { lat: 41, lon: -93, type: "corn" },
      { lat: 37, lon: -120, type: "sprout" },
      { lat: 51, lon: -105, type: "wheat" },
      // South America
      { lat: -13, lon: -56, type: "sprout" },
      { lat: -34, lon: -61, type: "wheat" },
      { lat: 4, lon: -73, type: "corn" },
      // Europe & Black Sea
      { lat: 47, lon: 3, type: "wheat" },
      { lat: 49, lon: 32, type: "wheat" },
      { lat: 52, lon: 19, type: "sprout" },
      // Africa
      { lat: 29, lon: 31, type: "wheat" },
      { lat: 10, lon: 8, type: "sprout" },
      { lat: -1, lon: 37, type: "corn" },
      { lat: -29, lon: 26, type: "corn" },
      // Asia
      { lat: 30, lon: 76, type: "wheat" },
      { lat: 25, lon: 85, type: "rice" },
      { lat: 34, lon: 114, type: "wheat" },
      { lat: 30, lon: 119, type: "rice" },
      { lat: 15, lon: 101, type: "rice" },
      { lat: 10, lon: 106, type: "rice" },
      // Australia & Pacific
      { lat: -34, lon: 146, type: "wheat" },
      { lat: -31, lon: 117, type: "wheat" },
    ];

    const cropSprouts: THREE.Group[] = [];

    const primaryThemeHex = isCrop ? 0x10b981 : 0x38bdf8;
    const accentThemeHex = isCrop ? 0xfacc15 : 0xf59e0b;

    // Shared geometries for procedural nodes (Crops OR Telecom Relay Towers)
    const stemGeo = isCrop 
      ? new THREE.CylinderGeometry(0.018, 0.028, 0.42, 6)
      : new THREE.CylinderGeometry(0.012, 0.026, 0.48, 4); // tapered radio lattice mast
    stemGeo.translate(0, isCrop ? 0.21 : 0.24, 0);
    const stemMat = new THREE.MeshBasicMaterial({ color: isCrop ? 0x10b981 : 0x64748b });

    const leafGeo = new THREE.ConeGeometry(0.045, 0.16, 5);
    leafGeo.translate(0, 0.08, 0);
    const leafMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

    // Telecom Dish / Antenna Head for Tech/Finance vs Grain Head for Biology
    const techDishGeo = new THREE.CylinderGeometry(0.055, 0.01, 0.03, 12);
    techDishGeo.rotateX(Math.PI / 2);
    const techDishMat = new THREE.MeshBasicMaterial({ color: accentThemeHex });

    const beaconTipGeo = new THREE.SphereGeometry(0.032, 8, 8);
    const beaconTipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const wheatHeadGeo = new THREE.CylinderGeometry(0.022, 0.045, 0.22, 6);
    wheatHeadGeo.translate(0, 0.11, 0);
    const wheatHeadMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const ringGeo = new THREE.RingGeometry(0.04, 0.14, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: primaryThemeHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });

    cropHubs.forEach((hub) => {
      const hubPos = toVec3(hub.lat, hub.lon, globeRadius);
      const sproutGroup = new THREE.Group();
      sproutGroup.position.copy(hubPos);
      sproutGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hubPos.clone().normalize());

      // Base ring pulse
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      sproutGroup.add(ring);

      // Central Mast / Stem
      const stem = new THREE.Mesh(stemGeo, stemMat);
      sproutGroup.add(stem);

      if (isCrop) {
        // Crop leaves
        const leafL = new THREE.Mesh(leafGeo, leafMat);
        leafL.position.set(0, 0.16, 0);
        leafL.rotation.z = 0.55;
        sproutGroup.add(leafL);

        const leafR = new THREE.Mesh(leafGeo, leafMat);
        leafR.position.set(0, 0.24, 0);
        leafR.rotation.z = -0.55;
        sproutGroup.add(leafR);

        const headMesh = new THREE.Mesh(wheatHeadGeo, wheatHeadMat);
        headMesh.position.set(0, 0.42, 0);
        sproutGroup.add(headMesh);
      } else {
        // High-Tech Relay Mast with dual microwave transceivers and glowing beacon tip
        const dish1 = new THREE.Mesh(techDishGeo, techDishMat);
        dish1.position.set(0.03, 0.36, 0);
        sproutGroup.add(dish1);

        const dish2 = new THREE.Mesh(techDishGeo, techDishMat);
        dish2.position.set(-0.03, 0.42, 0);
        dish2.rotation.y = Math.PI;
        sproutGroup.add(dish2);

        const tip = new THREE.Mesh(beaconTipGeo, beaconTipMat);
        tip.position.set(0, 0.50, 0);
        sproutGroup.add(tip);
      }

      sproutGroup.scale.set(0.001, 0.001, 0.001);
      globeGroup.add(sproutGroup);
      cropSprouts.push(sproutGroup);
    });

    threeRef.current = { renderer, scene, camera, globeGroup, resetLines, rebootArcs, cropSprouts };

    return () => {
      renderer.dispose();
      sphereGeo.dispose();
      innerMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      latGeo.dispose();
      latMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      stemGeo.dispose();
      stemMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      wheatHeadGeo.dispose();
      wheatHeadMat.dispose();
      techDishGeo.dispose();
      techDishMat.dispose();
      beaconTipGeo.dispose();
      beaconTipMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [width, height]);

  // Update per frame
  useEffect(() => {
    if (!threeRef.current) return;
    const { renderer, scene, camera, globeGroup, resetLines, rebootArcs, cropSprouts } = threeRef.current;

    globeGroup.rotation.y = globeRotY;
    globeGroup.rotation.x = 0.35;

    // Phase 1: Retract old lines into Svalbard (scale down length or fade out)
    resetLines.forEach((line) => {
      (line.material as THREE.LineBasicMaterial).opacity = pullBackProgress * 0.7;
    });

    // Phase 2: Reboot arcs ignite and shoot outward
    rebootArcs.forEach((line) => {
      const arcOp = rebootProgress > 0.05 ? Math.min(1, rebootProgress * 1.5) : 0;
      (line.material as THREE.LineBasicMaterial).opacity = arcOp;
    });

    // Phase 3: 3D CROPS GROW AROUND THE WORLD
    // As reboot arcs strike continents, crops sprout and shoot upward around the curvature of the Earth
    cropSprouts.forEach((sprout, idx) => {
      const startF = 34 + (idx % 6) * 4; // staggered wave around globe
      if (frame >= startF) {
        const growthProg = Math.min(1, (frame - startF) / 16);
        // Spring bounce expansion
        const s = Math.sin(growthProg * Math.PI * 0.5) * 1.15;
        const finalS = Math.min(1.0, s);
        sprout.scale.set(finalS, finalS, finalS);
      } else {
        sprout.scale.set(0.001, 0.001, 0.001);
      }
    });

    renderer.render(scene, camera);
  }, [frame, globeRotY, pullBackProgress, rebootProgress]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. DEEP SPACE COSMOS WITH AURORA ACCENT */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 25%, #082f49 0%, #030712 65%, #000000 100%)",
        }}
      />

      {/* Ripple Aurora Curtain at Top */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: 0,
          width: "100%",
          height: 350,
          background: "linear-gradient(180deg, rgba(16, 185, 129, 0.22) 0%, rgba(56, 189, 248, 0.15) 60%, transparent 100%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* 2. THREE.JS 3D ROTATING GLOBE WITH CROPS GROWING AROUND THE WORLD */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* 3. NARRATIVE STATE HUD PILL: RESET -> REBOOT */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
        }}
      >
        {frame < 28 ? (
          <div
            style={{
              padding: "8px 22px",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              border: "1.5px solid #ef4444",
              borderRadius: 100,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 0 25px rgba(239, 68, 68, 0.4)",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
            <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>
              SYSTEM COLLAPSE • NETWORK RETRACTING
            </span>
          </div>
        ) : (
          <div
            style={{
              padding: "8px 22px",
              backgroundColor: isCrop ? "rgba(16, 185, 129, 0.2)" : "rgba(56, 189, 248, 0.2)",
              border: `1.5px solid ${isCrop ? "#10b981" : "#38bdf8"}`,
              borderRadius: 100,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: `0 0 25px ${isCrop ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)"}`,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: isCrop ? "#10b981" : "#38bdf8", boxShadow: `0 0 8px ${isCrop ? "#10b981" : "#38bdf8"}` }} />
            <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>
              {isCrop ? "GLOBAL REBOOT • 21 CONTINENTAL BREADBASKETS AWAKENED" : "GLOBAL RELAY • 21 CONTINENTAL NODES ACTIVE"}
            </span>
          </div>
        )}
      </div>

      {/* 4. CLIMACTIC HERO HUD SEAL AT BOTTOM */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          maxWidth: 620,
          transform: `scale(${sealSpring}) translateY(${(1 - sealSpring) * 30}px)`,
          opacity: sealSpring,
          zIndex: 25,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.88)",
            border: "2px solid #10b981",
            borderRadius: 24,
            padding: "20px 24px",
            textAlign: "center",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(16, 185, 129, 0.35)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 100,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              marginBottom: 10,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 10px #10b981" }} />
            <span style={{ color: "#10b981", fontSize: 14, fontWeight: 800, letterSpacing: 2 }}>GLOBAL NETWORK ACTIVE</span>
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 1,
              lineHeight: 1.15,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            {sealTitle}
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
              marginTop: 6,
            }}
          >
            {sealSubtitle}
          </div>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.9)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
