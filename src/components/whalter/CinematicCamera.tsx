import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface CinematicCameraProps {
  children: React.ReactNode;
  zoom?: number;
  focusX?: number;
  focusY?: number;
  shakeFrame?: number;
  shakeStrength?: number;
  enableHandheld?: boolean;
}

/**
 * Dynamic 2.5D Cinematic Camera Rig for Authentic Indie Shorts
 * 
 * Features:
 * 1. Ambient Handheld Drift (subtle living camera float)
 * 2. Instant Snap Punch-Ins (dramatic comedic/shock zooms)
 * 3. High-Frequency Decaying Impact Shake (explosions, slams, scrams)
 */
export const CinematicCamera: React.FC<CinematicCameraProps> = ({
  children,
  zoom = 1.0,
  focusX = 540,
  focusY = 960,
  shakeFrame = -1,
  shakeStrength = 14,
  enableHandheld = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Ambient Handheld Float (Organic sub-pixel drift)
  const driftX = enableHandheld ? Math.sin((frame / fps) * Math.PI * 0.8) * 4.5 : 0;
  const driftY = enableHandheld ? Math.cos((frame / fps) * Math.PI * 0.6) * 3.5 : 0;
  const driftRotate = enableHandheld ? Math.sin((frame / fps) * Math.PI * 0.4) * 0.35 : 0;

  // 2. Camera Shake Physics (Decays exponentially over 15 frames)
  let shakeOffsetX = 0;
  let shakeOffsetY = 0;
  let shakeAngle = 0;

  if (shakeFrame >= 0 && frame >= shakeFrame) {
    const elapsed = frame - shakeFrame;
    if (elapsed < 18) {
      const decay = Math.max(0, 1 - elapsed / 18);
      shakeOffsetX = Math.sin(elapsed * 2.4) * shakeStrength * decay;
      shakeOffsetY = Math.cos(elapsed * 3.1) * (shakeStrength * 0.8) * decay;
      shakeAngle = Math.sin(elapsed * 2.8) * 0.9 * decay;
    }
  }

  // 3. Smooth Camera Transformation Pivot
  // Scaling centered around (focusX, focusY)
  const totalX = driftX + shakeOffsetX;
  const totalY = driftY + shakeOffsetY;
  const totalRot = driftRotate + shakeAngle;

  const transformStyle: React.CSSProperties = {
    width: "1080px",
    height: "1920px",
    transformOrigin: `${focusX}px ${focusY}px`,
    transform: `translate(${totalX}px, ${totalY}px) scale(${zoom}) rotate(${totalRot}deg)`,
    transition: "transform 0.12s cubic-bezier(0.2, 0.9, 0.3, 1.2)",
    willChange: "transform",
  };

  return <div style={transformStyle}>{children}</div>;
};
