import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";

export const Scene3Threats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen shake during earthquake (frames 0 to 45)
  const shakeX = frame < 45 ? Math.sin(frame * 1.5) * 8 : 0;
  const shakeY = frame < 45 ? Math.cos(frame * 1.8) * 6 : 0;

  // Staggered threat cards
  const card1Spring = spring({ frame: frame - 5, fps, config: { damping: 11, stiffness: 220 } });
  const card2Spring = spring({ frame: frame - 40, fps, config: { damping: 11, stiffness: 220 } });
  const card3Spring = spring({ frame: frame - 80, fps, config: { damping: 10, stiffness: 240 } });

  // Flashing red alert pulse
  const alertFlash = (Math.sin(frame * 0.25) + 1) / 2;

  // Shark bite jaw motion
  const jawAngle = Math.abs(Math.sin(frame * 0.2)) * 25;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "240px",
        pointerEvents: "none",
      }}
    >
      {/* Red Warning Vignette Flash */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          boxShadow: `inset 0 0 120px rgba(255, 0, 50, ${0.25 + alertFlash * 0.3})`,
          border: `4px solid rgba(255, 0, 80, ${0.4 + alertFlash * 0.5})`,
          boxSizing: "border-box",
        }}
      />

      {/* Critical Alert Header */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "14px",
          backgroundColor: `rgba(220, 20, 60, ${0.85 + alertFlash * 0.15})`,
          padding: "16px 40px",
          borderRadius: "50px",
          boxShadow: "0 0 40px rgba(255, 0, 80, 0.8)",
          transform: `scale(${1 + alertFlash * 0.05})`,
        }}
      >
        <span style={{ fontSize: "36px" }}>⚠️</span>
        <span
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: "36px",
            color: "#FFFFFF",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          CRITICAL THREATS AT 4000m
        </span>
      </div>

      {/* 3 Major Threats Visual Cards */}
      <div
        style={{
          marginTop: "50px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          width: "840px",
        }}
      >
        {/* Threat 1: Seismic Earthquakes */}
        {frame >= 5 && (
          <div
            style={{
              transform: `scale(${card1Spring})`,
              display: "flex",
              alignItems: "center",
              gap: "24px",
              backgroundColor: "rgba(20, 10, 15, 0.9)",
              border: "2px solid #FF5500",
              borderRadius: "24px",
              padding: "20px 32px",
              boxShadow: "0 0 30px rgba(255, 85, 0, 0.4)",
            }}
          >
            <span style={{ fontSize: "52px" }}>🌋</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#FF5500", fontSize: "28px", fontWeight: 900, letterSpacing: "1px" }}>
                UNDERWATER EARTHQUAKES
              </div>
              <div style={{ color: "#E2E8F0", fontSize: "19px", fontWeight: 700, marginTop: "4px" }}>
                Deep-sea landslides severing high-speed trunk lines
              </div>
            </div>
            {/* Seismic wave pulse graphic */}
            <div style={{ width: "80px", height: "40px", display: "flex", alignItems: "center", gap: "4px" }}>
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: "8px",
                    height: `${h * 38 * (1 + Math.sin(frame * 0.4 + i) * 0.4)}px`,
                    backgroundColor: "#FF5500",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Threat 2: Massive Ship Anchors */}
        {frame >= 40 && (
          <div
            style={{
              transform: `scale(${card2Spring})`,
              display: "flex",
              alignItems: "center",
              gap: "24px",
              backgroundColor: "rgba(20, 10, 15, 0.9)",
              border: "2px solid #EAB308",
              borderRadius: "24px",
              padding: "20px 32px",
              boxShadow: "0 0 30px rgba(234, 179, 8, 0.4)",
            }}
          >
            <span style={{ fontSize: "52px" }}>⚓</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#EAB308", fontSize: "28px", fontWeight: 900, letterSpacing: "1px" }}>
                CARGO SHIP ANCHORS
              </div>
              <div style={{ color: "#E2E8F0", fontSize: "19px", fontWeight: 700, marginTop: "4px" }}>
                Dragging 10-ton anchors across shallow continental shelves
              </div>
            </div>
          </div>
        )}

        {/* Threat 3: Shark Bites */}
        {frame >= 80 && (
          <div
            style={{
              transform: `scale(${card3Spring})`,
              display: "flex",
              alignItems: "center",
              gap: "24px",
              backgroundColor: "rgba(40, 10, 20, 0.92)",
              border: "3px solid #EF4444",
              borderRadius: "24px",
              padding: "20px 32px",
              boxShadow: "0 0 45px rgba(239, 68, 68, 0.6)",
            }}
          >
            {/* Animated Shark Silhouette & Jaws */}
            <div
              style={{
                fontSize: "60px",
                transform: `rotate(${Math.sin(frame * 0.15) * 10 + jawAngle}deg)`,
                display: "inline-block",
              }}
            >
              🦈
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#EF4444", fontSize: "30px", fontWeight: 900, letterSpacing: "1px" }}>
                SHARKS BITING THE CABLES!
              </div>
              <div style={{ color: "#FCA5A5", fontSize: "19px", fontWeight: 700, marginTop: "4px" }}>
                Electromagnetic fields attract sharks that bite through Kevlar!
              </div>
            </div>
            <span
              style={{
                fontFamily: "'Impact', sans-serif",
                fontSize: "28px",
                color: "#FFE600",
                transform: `scale(${1 + Math.sin(frame * 0.3) * 0.15})`,
              }}
            >
              CHOMP! ⚡
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
