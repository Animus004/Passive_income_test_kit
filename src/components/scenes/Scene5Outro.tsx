import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Bell rocking vibration
  const bellAngle = Math.sin(frame * 0.4) * 20;

  // Subscribe button pulse
  const subScale = 1 + Math.sin(frame * 0.15) * 0.05;

  // Floating heart & fire emojis
  const floatingEmojis = [
    { emoji: "🔥", x: -280, y: -(frame * 4) % 400 },
    { emoji: "⚡", x: 260, y: -((frame * 4) + 120) % 400 },
    { emoji: "🌊", x: -180, y: -((frame * 3) + 200) % 400 },
    { emoji: "🚀", x: 200, y: -((frame * 3.5) + 60) % 400 },
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
        transform: `scale(${enterSpring})`,
      }}
    >
      {/* Floating Reaction Emojis */}
      {floatingEmojis.map((item, idx) => (
        <span
          key={idx}
          style={{
            position: "absolute",
            top: "650px",
            left: `calc(50% + ${item.x}px)`,
            transform: `translateY(${item.y}px)`,
            fontSize: "44px",
            opacity: 0.85,
            filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* The Cloud is Under Ocean Punchline Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(5, 15, 35, 0.92)",
          border: "3px solid #00F5FF",
          borderRadius: "32px",
          padding: "30px 50px",
          boxShadow: "0 0 50px rgba(0, 245, 255, 0.5)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "72px", marginBottom: "12px" }}>
          ☁️ ➔ 🌊
        </div>
        <div
          style={{
            fontFamily: "'Impact', sans-serif",
            fontSize: "64px",
            color: "#00F5FF",
            letterSpacing: "2px",
            textShadow: "0 0 30px #00F5FF",
          }}
        >
          THE CLOUD IS UNDERWATER
        </div>
        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "22px",
            fontWeight: 800,
            color: "#FFE600",
            letterSpacing: "4px",
            marginTop: "8px",
          }}
        >
          RESTING ON THE SEABED
        </div>
      </div>

      {/* High-Converting Animated Subscribe Button */}
      <div
        style={{
          marginTop: "60px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          backgroundColor: "#FF0000",
          borderRadius: "50px",
          padding: "20px 48px",
          boxShadow: "0 0 50px rgba(255, 0, 0, 0.8), 0 10px 25px rgba(0,0,0,0.8)",
          transform: `scale(${subScale})`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "44px",
            transform: `rotate(${bellAngle}deg)`,
            transformOrigin: "top center",
          }}
        >
          🔔
        </span>
        <span
          style={{
            fontFamily: "'Montserrat', 'Arial Black', sans-serif",
            fontSize: "36px",
            fontWeight: 900,
            letterSpacing: "3px",
            color: "#FFFFFF",
            textTransform: "uppercase",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          SUBSCRIBE FOR MORE!
        </span>
      </div>

      {/* Animated Click Cursor Finger */}
      <div
        style={{
          marginTop: "15px",
          fontSize: "48px",
          transform: `translate(120px, -20px) scale(${1 + Math.sin(frame * 0.3) * 0.15})`,
        }}
      >
        👆
      </div>
    </div>
  );
};

