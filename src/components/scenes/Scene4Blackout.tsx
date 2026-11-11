import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";

export const Scene4Blackout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 220 },
  });

  // Glitch strobe effect
  const isGlitch = frame % 6 === 0 || frame % 11 === 0;
  const glitchOffset = isGlitch ? (frame % 2 === 0 ? 12 : -12) : 0;

  // Severed cable spark particles
  const sparks = [
    { x: -50, y: -40, size: 8, color: "#FFE600" },
    { x: 30, y: -60, size: 10, color: "#00F5FF" },
    { x: -20, y: 50, size: 6, color: "#FF0055" },
    { x: 60, y: 30, size: 9, color: "#FFFFFF" },
    { x: -70, y: 10, size: 7, color: "#FFE600" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "240px",
        pointerEvents: "none",
        transform: `translate(${glitchOffset}px, 0)`,
      }}
    >
      {/* Glitch Overlay Lines */}
      {isGlitch && (
        <div
          style={{
            position: "absolute",
            top: `${(frame * 37) % 85}%`,
            left: 0,
            width: "100%",
            height: "80px",
            backgroundColor: "rgba(255, 0, 50, 0.25)",
            filter: "invert(1)",
          }}
        />
      )}

      {/* Severed Cable Visual Graphic */}
      <div
        style={{
          position: "relative",
          width: "720px",
          height: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${enterSpring})`,
        }}
      >
        {/* Left Cable Half */}
        <div
          style={{
            width: "280px",
            height: "50px",
            background: "linear-gradient(90deg, #1E293B, #0F172A)",
            border: "3px solid #EF4444",
            borderRadius: "20px 0 0 20px",
            boxShadow: "0 0 25px rgba(239, 68, 68, 0.5)",
            transform: "rotate(-4deg)",
          }}
        />

        {/* Severed Gap with Explosive Sparks */}
        <div
          style={{
            width: "100px",
            height: "100px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              transform: `scale(${1 + Math.sin(frame * 0.5) * 0.25})`,
            }}
          >
            ⚡
          </span>
          {/* Flying Sparks */}
          {sparks.map((s, idx) => {
            const spread = 1 + (frame % 8) * 0.4;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  transform: `translate(${s.x * spread}px, ${s.y * spread}px)`,
                  width: s.size,
                  height: s.size,
                  borderRadius: "50%",
                  backgroundColor: s.color,
                  boxShadow: `0 0 15px ${s.color}`,
                }}
              />
            );
          })}
        </div>

        {/* Right Cable Half */}
        <div
          style={{
            width: "280px",
            height: "50px",
            background: "linear-gradient(90deg, #0F172A, #1E293B)",
            border: "3px solid #EF4444",
            borderRadius: "0 20px 20px 0",
            boxShadow: "0 0 25px rgba(239, 68, 68, 0.5)",
            transform: "rotate(4deg)",
          }}
        />
      </div>

      {/* Catastrophic Blackout Warning Banner */}
      <div
        style={{
          marginTop: "40px",
          backgroundColor: "rgba(30, 0, 10, 0.95)",
          border: "3px solid #FF0055",
          borderRadius: "26px",
          padding: "24px 44px",
          textAlign: "center",
          boxShadow: "0 0 50px rgba(255, 0, 85, 0.7)",
        }}
      >
        <div
          style={{
            fontFamily: "'Impact', sans-serif",
            fontSize: "64px",
            color: "#FF0055",
            letterSpacing: "3px",
            textShadow: "0 0 30px #FF0055",
          }}
        >
          🚨 GLOBAL BLACKOUT 🚨
        </div>
        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "24px",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "4px",
            marginTop: "6px",
          }}
        >
          IF JUST A FEW CHOKEPOINTS ARE CUT
        </div>
      </div>

      {/* Offline Status Badges */}
      <div
        style={{
          marginTop: "35px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "780px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(10, 10, 15, 0.85)",
            border: "2px solid rgba(255, 0, 80, 0.4)",
            borderRadius: "18px",
            padding: "14px 28px",
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#FFFFFF" }}>🌐 CONTINENTAL CONNECTIVITY</span>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "#EF4444" }}>OFFLINE // 0 KB/s</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(10, 10, 15, 0.85)",
            border: "2px solid rgba(255, 0, 80, 0.4)",
            borderRadius: "18px",
            padding: "14px 28px",
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#FFFFFF" }}>🏦 FINANCIAL CLEARING HOUSES</span>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "#EF4444" }}>HALTED INSTANTLY</span>
        </div>
      </div>
    </div>
  );
};

