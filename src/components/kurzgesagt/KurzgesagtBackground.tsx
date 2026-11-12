import React from "react";
import { useCurrentFrame } from "remotion";

interface BackgroundProps {
  theme?: string;
  primaryColor?: string;
}

export const KurzgesagtBackground: React.FC<BackgroundProps> = ({
  theme = "cyber",
  primaryColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#070c26", // Deep rich Kurzgesagt midnight blue
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* 1. Nebula Gradients & Large Planetary Glows */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "-20%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}38 0%, rgba(7, 12, 38, 0) 70%)`,
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "-25%",
          width: 650,
          height: 650,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, rgba(7, 12, 38, 0) 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* 2. Floating Science Rings & Dashed Orbital Paths */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          right: "-12%",
          width: 620,
          height: 620,
          borderRadius: "50%",
          border: "3px dashed rgba(255, 255, 255, 0.18)",
          transform: `rotate(${frame * 0.08}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "3%",
          right: "-18%",
          width: 750,
          height: 750,
          borderRadius: "50%",
          border: "2px dashed rgba(56, 189, 248, 0.12)",
          transform: `rotate(${-frame * 0.05}deg)`,
        }}
      />

      {/* 3. Background Laboratory Silhouettes (Servers & Screens in Distance) */}
      <div
        style={{
          position: "absolute",
          bottom: 440,
          left: 0,
          width: "100%",
          height: 380,
          display: "flex",
          justifyContent: "space-between",
          padding: "0 40px",
          opacity: 0.22,
          pointerEvents: "none",
        }}
      >
        {/* Left Server Silhouette */}
        <div style={{ width: 140, height: 320, background: "#1e293b", borderRadius: 16, border: "2px solid #38bdf8", padding: 12 }}>
          <div style={{ width: "100%", height: 30, background: "#0f172a", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ width: "100%", height: 30, background: "#0f172a", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ width: "100%", height: 30, background: "#0f172a", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ width: "100%", height: 30, background: "#0f172a", borderRadius: 6 }} />
        </div>

        {/* Right Terminal Silhouette */}
        <div style={{ width: 160, height: 280, background: "#1e293b", borderRadius: 16, border: "2px solid #eab308", padding: 12 }}>
          <div style={{ width: "100%", height: 120, background: "#020617", borderRadius: 10, border: "2px solid #475569" }} />
          <div style={{ width: "60%", height: 16, background: "#38bdf8", borderRadius: 4, marginTop: 16 }} />
          <div style={{ width: "80%", height: 12, background: "#64748b", borderRadius: 4, marginTop: 8 }} />
        </div>
      </div>

      {/* 4. Twinkling 4-Point Cartoon Stars & Floating Particles */}
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {/* Star 1 */}
        <g transform={`translate(140, 150) scale(${0.85 + Math.sin(frame * 0.1) * 0.25})`}>
          <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#facc15" />
        </g>
        {/* Star 2 */}
        <g transform={`translate(940, 240) scale(${0.75 + Math.cos(frame * 0.12) * 0.2})`}>
          <path d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z" fill="#38bdf8" />
        </g>
        {/* Star 3 */}
        <g transform={`translate(180, 520) scale(${0.7 + Math.sin(frame * 0.09) * 0.2})`}>
          <path d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z" fill="#f472b6" />
        </g>
        {/* Star 4 */}
        <g transform={`translate(880, 640) scale(${0.9 + Math.sin(frame * 0.14) * 0.25})`}>
          <path d="M 0 -15 Q 0 0 15 0 Q 0 0 0 15 Q 0 0 -15 0 Q 0 0 0 -15 Z" fill="#facc15" />
        </g>
        {/* Science Orbit Atom Diagram on left */}
        <g transform={`translate(110, 360) rotate(${frame * 0.2})`} opacity="0.25">
          <ellipse cx="0" cy="0" rx="45" ry="16" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="45" ry="16" fill="none" stroke="#38bdf8" strokeWidth="2" transform="rotate(60)" />
          <ellipse cx="0" cy="0" rx="45" ry="16" fill="none" stroke="#38bdf8" strokeWidth="2" transform="rotate(120)" />
          <circle cx="0" cy="0" r="5" fill="#facc15" />
        </g>
      </svg>

      {/* 5. Rich Laboratory Stage Floor / Isometric Ground Line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 460,
          background: "linear-gradient(to bottom, #0d1538 0%, #070a1e 100%)",
          borderTop: `5px solid ${primaryColor}`,
          boxShadow: `0 -10px 30px ${primaryColor}33`,
        }}
      >
        {/* Stage Grid Perspective Lines */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.08) 1.5px, transparent 1.5px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "70px 60px",
          }}
        />
        {/* Ground Glow Neon Laser Beam */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 85%)`,
            filter: "blur(5px)",
          }}
        />
      </div>
    </div>
  );
};
