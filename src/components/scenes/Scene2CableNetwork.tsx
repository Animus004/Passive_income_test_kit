import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const Scene2CableNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 200 },
  });

  // Light pulse position across fiber cable (0% to 100%)
  const pulse1 = (frame * 3) % 100;
  const pulse2 = ((frame * 3) + 40) % 100;
  const pulse3 = ((frame * 3) + 75) % 100;

  // Staggered entry for data badges
  const badge1Spring = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 220 } });
  const badge2Spring = spring({ frame: frame - 30, fps, config: { damping: 12, stiffness: 220 } });
  const badge3Spring = spring({ frame: frame - 50, fps, config: { damping: 12, stiffness: 220 } });

  // Animated miles counter: 0 -> 800,000
  const miles = Math.min(800000, Math.floor(interpolate(frame, [0, 45], [100000, 800000], { extrapolateRight: "clamp" })));

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
      {/* 800,000 Miles Giant Stat Banner */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(10, 20, 40, 0.9)",
          border: "2px solid #00F5FF",
          borderRadius: "28px",
          padding: "24px 48px",
          boxShadow: "0 0 45px rgba(0, 245, 255, 0.4), inset 0 0 25px rgba(0, 245, 255, 0.15)",
        }}
      >
        <span
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: "88px",
            color: "#FFE600",
            letterSpacing: "1px",
            lineHeight: "1",
            textShadow: "0 0 30px rgba(255, 230, 0, 0.7), 0 4px 10px #000",
          }}
        >
          {miles.toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "24px",
            fontWeight: 900,
            letterSpacing: "5px",
            color: "#FFFFFF",
            textTransform: "uppercase",
            marginTop: "6px",
          }}
        >
          MILES OF SUBSEA FIBER
        </span>
      </div>

      {/* Animated Glowing Fiber Cable Cross Section */}
      <div
        style={{
          marginTop: "45px",
          width: "900px",
          height: "120px",
          position: "relative",
          backgroundColor: "rgba(3, 8, 20, 0.8)",
          borderRadius: "60px",
          border: "3px solid rgba(0, 245, 255, 0.5)",
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(0, 245, 255, 0.3)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Core glow guide lines */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "8px",
            background: "linear-gradient(90deg, #00F5FF, #A855F7, #FFE600)",
            filter: "blur(2px)",
          }}
        />

        {/* Rapid Light Pulses Racing Through Glass Fiber */}
        <div
          style={{
            position: "absolute",
            left: `${pulse1}%`,
            width: "140px",
            height: "24px",
            borderRadius: "12px",
            background: "linear-gradient(90deg, transparent, #FFFFFF, #00F5FF, transparent)",
            boxShadow: "0 0 30px #00F5FF, 0 0 15px #FFFFFF",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${pulse2}%`,
            width: "140px",
            height: "24px",
            borderRadius: "12px",
            background: "linear-gradient(90deg, transparent, #FFFFFF, #FFE600, transparent)",
            boxShadow: "0 0 30px #FFE600, 0 0 15px #FFFFFF",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${pulse3}%`,
            width: "140px",
            height: "24px",
            borderRadius: "12px",
            background: "linear-gradient(90deg, transparent, #FFFFFF, #A855F7, transparent)",
            boxShadow: "0 0 30px #A855F7, 0 0 15px #FFFFFF",
          }}
        />
      </div>

      {/* Floating Traffic Badges (Streams, Bank Transfers, Emails) */}
      <div
        style={{
          marginTop: "45px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          width: "820px",
        }}
      >
        {frame >= 10 && (
          <div
            style={{
              transform: `scale(${badge1Spring})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "2px solid #3B82F6",
              borderRadius: "20px",
              padding: "16px 30px",
              boxShadow: "0 0 25px rgba(59, 130, 246, 0.3)",
            }}
          >
            <span style={{ fontSize: "36px" }}>🎥</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF" }}>ALL GLOBAL 4K STREAMING</span>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#38BDF8" }}>99% THROUGH GLASS</span>
          </div>
        )}

        {frame >= 30 && (
          <div
            style={{
              transform: `scale(${badge2Spring})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "2px solid #10B981",
              borderRadius: "20px",
              padding: "16px 30px",
              boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)",
            }}
          >
            <span style={{ fontSize: "36px" }}>💳</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF" }}>GLOBAL BANK TRANSFERS</span>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#34D399" }}>$10 TRILLION / DAY</span>
          </div>
        )}

        {frame >= 50 && (
          <div
            style={{
              transform: `scale(${badge3Spring})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              border: "2px solid #F59E0B",
              borderRadius: "20px",
              padding: "16px 30px",
              boxShadow: "0 0 25px rgba(245, 158, 11, 0.3)",
            }}
          >
            <span style={{ fontSize: "36px" }}>✉️</span>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF" }}>EMAILS & MESSAGES</span>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#FBBF24" }}>350 BILLION DAILY</span>
          </div>
        )}
      </div>
    </div>
  );
};

