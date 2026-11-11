import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // Animated counter from 0 to 99
  const count = Math.min(99, Math.floor(interpolate(frame, [10, 50], [0, 99], { extrapolateRight: "clamp" })));

  // Rotating energy ring
  const ringRotation = frame * 2.5;

  // Radar pulse
  const radarScale = 1 + (frame % 40) * 0.05;
  const radarOpacity = Math.max(0, 1 - (frame % 40) / 40);

  // Satellite vs Cable badge transition at frame 70
  const badgeSpring = spring({
    frame: frame - 65,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

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
        justifyContent: "flex-start",
        paddingTop: "260px",
        pointerEvents: "none",
      }}
    >
      {/* Central 99% Glowing Tech Ring HUD */}
      <div
        style={{
          position: "relative",
          width: "420px",
          height: "420px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${enterSpring})`,
        }}
      >
        {/* Radar Pulse Wave */}
        <div
          style={{
            position: "absolute",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            border: "3px solid #00F5FF",
            transform: `scale(${radarScale})`,
            opacity: radarOpacity,
            boxShadow: "0 0 25px #00F5FF",
          }}
        />

        {/* Rotating SVG Tech Ring */}
        <svg
          width="420"
          height="420"
          viewBox="0 0 420 420"
          style={{
            position: "absolute",
            transform: `rotate(${ringRotation}deg)`,
          }}
        >
          <circle
            cx="210"
            cy="210"
            r="185"
            stroke="rgba(0, 245, 255, 0.2)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="210"
            cy="210"
            r="185"
            stroke="#00F5FF"
            strokeWidth="8"
            strokeDasharray="180 70 80 50"
            fill="none"
            filter="drop-shadow(0 0 12px #00F5FF)"
          />
          <circle
            cx="210"
            cy="210"
            r="150"
            stroke="#FFE600"
            strokeWidth="4"
            strokeDasharray="80 120 40 90"
            fill="none"
            filter="drop-shadow(0 0 10px #FFE600)"
            style={{ transformOrigin: "center", transform: `rotate(${-ringRotation * 1.5}deg)` }}
          />
        </svg>

        {/* Interior Glowing Stat Card */}
        <div
          style={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            backgroundColor: "rgba(5, 12, 30, 0.85)",
            border: "2px solid rgba(0, 245, 255, 0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 40px rgba(0, 245, 255, 0.3), 0 0 50px rgba(0, 0, 0, 0.9)",
          }}
        >
          <span
            style={{
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              fontSize: "128px",
              fontWeight: 900,
              lineHeight: "1",
              color: "#00F5FF",
              textShadow: "0 0 35px #00F5FF, 0 4px 15px rgba(0,0,0,0.9)",
              letterSpacing: "-2px",
            }}
          >
            {count}%
          </span>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "4px",
              color: "#FFE600",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            OF ALL INTERNET
          </span>
        </div>
      </div>

      {/* Comparison Callout: Satellites vs Undersea Cables */}
      {frame >= 65 && (
        <div
          style={{
            marginTop: "50px",
            display: "flex",
            gap: "24px",
            transform: `scale(${badgeSpring})`,
          }}
        >
          {/* Satellites Crossed Out */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(30, 10, 15, 0.85)",
              border: "2px solid #FF0055",
              borderRadius: "20px",
              padding: "16px 26px",
              boxShadow: "0 0 25px rgba(255, 0, 85, 0.3)",
            }}
          >
            <span style={{ fontSize: "38px" }}>🛰️</span>
            <div>
              <div style={{ color: "#FF0055", fontWeight: 900, fontSize: "22px", letterSpacing: "1px" }}>
                SPACE / SATELLITES
              </div>
              <div style={{ color: "#FFAAAA", fontSize: "16px", fontWeight: 700 }}>
                ONLY 1% OF TRAFFIC ❌
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Depth Indicator Meter */}
      <div
        style={{
          position: "absolute",
          top: "840px",
          left: "80px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          padding: "10px 22px",
          borderRadius: "30px",
          border: "1px solid rgba(0, 245, 255, 0.3)",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#00F5FF",
            boxShadow: "0 0 10px #00F5FF",
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            color: "#00F5FF",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          DEPTH: -{Math.min(4200, Math.floor(frame * 25))}m OCEAN FLOOR
        </span>
      </div>
    </div>
  );
};

