import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import * as THREE from "three";

interface TeardownSceneProps {
  title?: string;
  countLabel?: string;
  topic?: string;
}

export const TeardownScene: React.FC<TeardownSceneProps> = ({
  title = "HARDWARE ARCHITECTURE",
  countLabel = "ULTRA-LOW LATENCY FPGA",
  topic = "",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
    layers: THREE.Mesh[];
    coreElements: THREE.Object3D[];
  } | null>(null);

  const fullContext = `${topic} ${title} ${countLabel}`.toLowerCase();
  const isBio = /seed|crop|food|sprout|bio|botan|vault|arctic/i.test(fullContext);

  // Springs for staggered explosion
  const explodeSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.8 },
  });

  const labelSpring1 = spring({ frame: frame - 28, fps, config: { damping: 12, stiffness: 180 } });
  const labelSpring2 = spring({ frame: frame - 42, fps, config: { damping: 12, stiffness: 180 } });
  const labelSpring3 = spring({ frame: frame - 56, fps, config: { damping: 12, stiffness: 180 } });

  // Camera drift
  const camRotY = interpolate(frame, [0, 250], [-0.35, 0.35]);

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
    camera.position.set(0, 0.8, 13.0);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // STUDIO LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 3.2);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 2.2);
    dirLight2.position.set(-6, -4, 4);
    scene.add(dirLight2);

    // Studio floor ring
    const ringGeo = new THREE.RingGeometry(2.8, 2.85, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -2.8;
    scene.add(ringMesh);

    // 5 EXPLODED LAYERS OF THE ASSEMBLY
    const layers: THREE.Mesh[] = [];
    const coreElements: THREE.Object3D[] = [];

    // Layer 0: Heavy Base Tray / Ground Plane Chassis
    const baseGeo = new THREE.BoxGeometry(3.6, 0.4, 2.4);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    group.add(baseMesh);
    layers.push(baseMesh);

    // Layer 1: Motherboard / Matrix PCB Substrate
    const rackGeo = new THREE.BoxGeometry(3.4, 0.35, 2.2);
    const rackMat = new THREE.MeshStandardMaterial({
      color: isBio ? 0x1e293b : 0x064e3b, // Dark green PCB substrate or slate
      roughness: 0.3,
      metalness: 0.6,
    });
    const rackMesh = new THREE.Mesh(rackGeo, rackMat);
    group.add(rackMesh);
    layers.push(rackMesh);

    // Layer 2: CORE PROCESSING SLAB (FPGA microchips OR Seed ampoules)
    const coreTrayGeo = new THREE.BoxGeometry(3.2, 0.25, 2.0);
    const coreTrayMat = new THREE.MeshStandardMaterial({
      color: isBio ? 0x1e3a8a : 0x0284c7,
      roughness: 0.25,
      metalness: 0.5,
    });
    const coreTrayMesh = new THREE.Mesh(coreTrayGeo, coreTrayMat);
    group.add(coreTrayMesh);
    layers.push(coreTrayMesh);

    if (isBio) {
      // 3D Seed Ampoules
      const vialGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12);
      const vialMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.2,
      });
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          const vx = -1.2 + c * 0.6;
          const vz = -0.6 + r * 0.6;
          const vialMesh = new THREE.Mesh(vialGeo, vialMat);
          vialMesh.position.set(vx, 0.28, vz);
          coreTrayMesh.add(vialMesh);
          coreElements.push(vialMesh);
        }
      }
    } else {
      // 3D Silicon FPGA Processing Core & Transceiver Array
      const chipGeo = new THREE.BoxGeometry(0.55, 0.15, 0.55);
      const chipMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.2,
        metalness: 0.9,
      });
      const heatSinkGeo = new THREE.BoxGeometry(0.45, 0.1, 0.45);
      const heatSinkMat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Copper heat spreader
        roughness: 0.2,
        metalness: 0.85,
      });

      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          const cx = -1.05 + c * 0.7;
          const cz = -0.45 + r * 0.9;
          const chipMesh = new THREE.Mesh(chipGeo, chipMat);
          chipMesh.position.set(cx, 0.2, cz);
          const heatSink = new THREE.Mesh(heatSinkGeo, heatSinkMat);
          heatSink.position.set(0, 0.1, 0);
          chipMesh.add(heatSink);
          coreTrayMesh.add(chipMesh);
          coreElements.push(chipMesh);
        }
      }
    }

    // Layer 3: RF Shielding / Vapor Barrier Pack
    const foilGeo = new THREE.BoxGeometry(3.35, 0.25, 2.15);
    const foilMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    });
    const foilMesh = new THREE.Mesh(foilGeo, foilMat);
    group.add(foilMesh);
    layers.push(foilMesh);

    // Layer 4: Hardened Exterior Alloy Enclosure
    const lidGeo = new THREE.BoxGeometry(3.7, 0.35, 2.5);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.85,
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    group.add(lidMesh);
    layers.push(lidMesh);

    // Wireframe accents
    const wireGeo = new THREE.WireframeGeometry(lidGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.6 });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    lidMesh.add(wireMesh);

    threeRef.current = { renderer, scene, camera, group, layers, coreElements };

    return () => {
      renderer.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      rackGeo.dispose();
      rackMat.dispose();
      coreTrayGeo.dispose();
      coreTrayMat.dispose();
      foilGeo.dispose();
      foilMat.dispose();
      lidGeo.dispose();
      lidMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [width, height, isBio]);

  // Update exploded heights & rotation per frame
  useEffect(() => {
    if (!threeRef.current) return;
    const { renderer, scene, camera, group, layers } = threeRef.current;

    group.rotation.y = camRotY;
    group.rotation.x = 0.28;

    // Explode offsets:
    layers[0].position.y = -0.4 - explodeSpring * 1.2;
    layers[1].position.y = -0.1 - explodeSpring * 0.6;
    layers[2].position.y = 0.2 + explodeSpring * 0.2;
    layers[3].position.y = 0.5 + explodeSpring * 0.9;
    layers[4].position.y = 0.8 + explodeSpring * 1.6;

    renderer.render(scene, camera);
  }, [frame, explodeSpring, camRotY]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. DARK STUDIO STAGE BACKGROUND */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 45%, #0f172a 0%, #030712 70%, #000000 100%)",
        }}
      />

      {/* Overhead Volumetric Spotlight Cone */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 1300,
          background: "radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.16) 0%, rgba(14, 165, 233, 0.05) 45%, transparent 75%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Height Calibration Marks */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: "25%",
          height: "45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: 0.35,
          fontFamily: "monospace",
          fontSize: 11,
          color: "#38bdf8",
        }}
      >
        <span>+2.4m ──</span>
        <span>+1.8m ──</span>
        <span>+1.2m ──</span>
        <span>+0.6m ──</span>
        <span>0.0m ──</span>
      </div>

      {/* Cyber Grid Base on Stage Floor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "45%",
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: "perspective(600px) rotateX(65deg)",
          transformOrigin: "bottom center",
          pointerEvents: "none",
        }}
      />

      {/* 2. THREE.JS EXPLODED VIEW CANVAS */}
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

      {/* 3. TECHNICAL LEADER LINES & CALLOUT LABELS */}
      {/* Label 1: Top Enclosure */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "60%",
          transform: `scale(${labelSpring1}) translateX(${(1 - labelSpring1) * 30}px)`,
          opacity: labelSpring1,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 2, backgroundColor: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              border: "1.5px solid #38bdf8",
              padding: "8px 16px",
              borderRadius: 12,
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ color: "#38bdf8", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>01 CHASSIS</div>
            <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 900 }}>
              {isBio ? "TITANIUM BLAST CRATE" : "MIL-SPEC ALLOY HOUSING"}
            </div>
          </div>
        </div>
      </div>

      {/* Label 2: CORE ARRAY */}
      <div
        style={{
          position: "absolute",
          top: "41%",
          left: "5%",
          transform: `scale(${labelSpring2}) translateX(${(1 - labelSpring2) * -30}px)`,
          opacity: labelSpring2,
          zIndex: 25,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              border: "2px solid #f59e0b",
              padding: "12px 18px",
              borderRadius: 16,
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 30px rgba(245, 158, 11, 0.35)",
              maxWidth: 380,
            }}
          >
            <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>
              02 {isBio ? "FOOD CORE MATRIX" : "SILICON ACCELERATOR ARRAY"}
            </div>
            <div style={{ color: "#ffffff", fontSize: 22, fontWeight: 900 }}>{countLabel}</div>

            {/* Badges */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {(isBio
                ? ["🌾 WHEAT", "🌽 CORN", "🍚 RICE", "🥕 CARROT", "🌱 SPROUT"]
                : ["⚡ 0.001ms", "📶 60 GHz", "🔧 FPGA LOGIC", "🔒 ENCRYPTED", "📡 BEAM"]
              ).map((tag, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    padding: "4px 8px",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#ffffff",
                    fontWeight: 700,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: 40, height: 2, backgroundColor: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }} />
        </div>
      </div>

      {/* Label 3: Bottom Base / Interface */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "58%",
          transform: `scale(${labelSpring3}) translateX(${(1 - labelSpring3) * 30}px)`,
          opacity: labelSpring3,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 2, backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              border: "1.5px solid #10b981",
              padding: "8px 16px",
              borderRadius: 12,
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ color: "#10b981", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>03 SUBSYSTEM</div>
            <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 900 }}>
              {isBio ? "HERMETIC NITROGEN SHIELD" : "DIRECT FIBER & MICROWAVE BUS"}
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner at Top */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            border: "1.5px solid #38bdf8",
            padding: "8px 24px",
            borderRadius: 999,
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 25px rgba(56, 189, 248, 0.35)",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
          <span style={{ color: "#38bdf8", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>
            3D EXPLODED ARCHITECTURE
          </span>
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            marginTop: 8,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
