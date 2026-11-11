import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface ProgressOverlayProps {
  badgeTitle?: string;
  ctaText?: string;
  showBadges?: boolean;
}

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({
  badgeTitle = "⚡ DID YOU KNOW?",
  ctaText = "SUBSCRIBE FOR DAILY SECRETS",
  showBadges = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress percentage (0% to 100%)
  const progressPercent = Math.min(100, Math.max(0, (frame / durationInFrames) * 100));

  // Pulse animation for badges
  const pulse = 1 + Math.sin(frame * 0.08) * 0.04;

  return (
    <>
      {/* Top Retention Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "12px",
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #00F5FF 0%, #FFE600 50%, #FF007A 100%)",
            boxShadow: "0 0 16px rgba(0, 245, 255, 0.8)",
          }}
        />
      </div>

      {/* Optional Top Curiosity Hook Badge (only if showBadges is true) */}
      {showBadges && (
        <div
          style={{
            position: "absolute",
            top: "120px",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 90,
          }}
        >
          <div
            style={{
              transform: `scale(${pulse})`,
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(10, 15, 30, 0.85)",
              border: "2px solid #FFE600",
              borderRadius: "999px",
              padding: "14px 34px",
              boxShadow: "0 0 30px rgba(255, 230, 0, 0.4), inset 0 0 15px rgba(255, 230, 0, 0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              style={{
                fontFamily: "'Montserrat', -apple-system, sans-serif",
                fontSize: "30px",
                fontWeight: 900,
                letterSpacing: "3px",
                color: "#FFE600",
                textTransform: "uppercase",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              }}
            >
              {badgeTitle}
            </span>
          </div>
        </div>
      )}

      {/* Optional Bottom Retention & CTA Hook (only if showBadges is true) */}
      {showBadges && (
        <div
          style={{
            position: "absolute",
            bottom: "220px",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 90,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              border: "1.5px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "40px",
              padding: "12px 28px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#FF0055",
                boxShadow: "0 0 10px #FF0055",
              }}
            />
            <span
              style={{
                fontFamily: "'Montserrat', -apple-system, sans-serif",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "2px",
                color: "#FFFFFF",
                textTransform: "uppercase",
                opacity: 0.9,
              }}
            >
              {ctaText}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

