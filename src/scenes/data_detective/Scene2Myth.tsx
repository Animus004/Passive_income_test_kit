import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import { Mascot } from "../../components/Mascot";
import { BackgroundMedia } from "../../components/BackgroundMedia";
import { SubtitleWord } from "../../types";

interface SceneProps {
  subtitles?: SubtitleWord[];
  sceneData?: any;
}

export const Scene2Myth: React.FC<SceneProps> = ({ subtitles = [], sceneData }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance Spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 120 },
  });

  // Dynamic Exit transition
  const exitWhip = interpolate(
    frame,
    [Math.max(0, durationInFrames - 17), durationInFrames],
    [0, -1200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const exitOpacity = interpolate(
    frame,
    [Math.max(0, durationInFrames - 12), durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const statNumStr = sceneData?.statHighlight?.number || "70%";
  const targetCounter = parseInt(statNumStr.replace(/\D/g, "")) || 70;
  const statUnit = statNumStr.includes("%") ? "%" : "";
  const statLabel = sceneData?.statHighlight?.label || "ASSUME SATELLITES";
  const badgeText = sceneData?.badge || "🛰️ THE SPACE MYTH // 02";
  const mascotPose = sceneData?.mascotEmotion || "facepalm";

  // Rapid 0 -> Target Counter with strict clamping to prevent negative glitch on entry
  const mythCounter = Math.max(
    0,
    Math.round(
      interpolate(frame, [15, 75], [0, targetCounter], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Satellites orbiting around centered Earth (540, 960) at different angles and speeds
  const sat1Angle = (frame * 0.035) % (Math.PI * 2);
  const sat2Angle = (frame * 0.028 + 2.5) % (Math.PI * 2);
  const sat3Angle = (frame * 0.042 + 4.2) % (Math.PI * 2);

  // Laser beam dash offset
  const laserOffset = (frame * 12) % 60;

  // Twinkling background stars
  const stars = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      x: ((i * 41 + 17) % 96) + 2,
      y: (i * 67 + 29) % 100,
      size: (i % 3) * 1.5 + 2,
      opacity: 0.2 + ((i % 5) * 0.15),
    }));
  }, []);

  const centerX = 540;
  const centerY = 780;

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${exitWhip}px) scale(${entrySpring})`,
        opacity: exitOpacity,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#030712",
      }}
    >
      <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.75} />
      <Audio src={staticFile("sfx/blip.mp3")} volume={0.6} />

      {/* Layer 0: Cosmic Texture & Dark Edge Vignette */}
      <BackgroundMedia themeColor="#f59e0b" opacity={0.28} />

      {/* --- TWINKLING COSMIC STARS --- */}
      {stars.map((s, idx) => {
        const twinkle = 0.5 + Math.sin(frame * 0.1 + idx) * 0.5;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: `0 0 ${s.size * 2}px #ffffff`,
              opacity: s.opacity * twinkle,
            }}
          />
        );
      })}

      {/* --- TOP HEADER BADGE --- */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: "12px 36px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #d97706, #f59e0b)",
            border: "2px solid #ffffff",
            boxShadow: "0 0 50px rgba(245, 158, 11, 0.8), 0 10px 25px rgba(0,0,0,0.8)",
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 950,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {badgeText}
        </div>
      </div>

      {/* --- CENTERED EARTH GLOBE & TILTED ORBITS (540, 960) --- */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <radialGradient id="spaceAtmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#1e3a8a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Earth Atmospheric Halo */}
        <circle cx={centerX} cy={centerY} r={360} fill="url(#spaceAtmosphere)" />

        {/* Orbit Path 1 (Horizontal Inclined) */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={460}
          ry={160}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2.5}
          strokeDasharray="10 10"
          transform={`rotate(-20 ${centerX} ${centerY})`}
          opacity={0.65}
        />

        {/* Orbit Path 2 (Steep Vertical Inclined) */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={480}
          ry={180}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2.5}
          strokeDasharray="14 12"
          transform={`rotate(38 ${centerX} ${centerY})`}
          opacity={0.55}
        />

        {/* Orbit Path 3 (Opposite Incline) */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={450}
          ry={190}
          fill="none"
          stroke="#a855f7"
          strokeWidth={2.5}
          strokeDasharray="12 12"
          transform={`rotate(-58 ${centerX} ${centerY})`}
          opacity={0.5}
        />

        {/* Earth Central Globe (Centered at 540, 960) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={230}
          fill="radial-gradient(circle at 35% 35%, #1e40af 0%, #0f172a 75%, #020617 100%)"
          stroke="#38bdf8"
          strokeWidth={4.5}
          filter="drop-shadow(0 0 55px rgba(56, 189, 248, 0.75))"
        />

        {/* Stylized Continents on Globe */}
        <circle cx={centerX - 40} cy={centerY - 25} r={75} fill="#10b981" opacity={0.3} filter="blur(14px)" />
        <circle cx={centerX + 50} cy={centerY + 20} r={95} fill="#0ea5e9" opacity={0.25} filter="blur(16px)" />

        {/* --- LASER BEAMS FROM SATELLITES TO EARTH --- */}
        {/* Sat 1 Beam */}
        <line
          x1={centerX + Math.cos(sat1Angle) * 440}
          y1={centerY + Math.sin(sat1Angle) * 150}
          x2={centerX}
          y2={centerY}
          stroke="#f59e0b"
          strokeWidth={3}
          strokeDasharray="20 15"
          strokeDashoffset={-laserOffset}
          filter="drop-shadow(0 0 10px #f59e0b)"
          opacity={0.8}
        />

        {/* Sat 2 Beam */}
        <line
          x1={centerX + Math.cos(sat2Angle) * 460}
          y1={centerY + Math.sin(sat2Angle) * 170}
          x2={centerX}
          y2={centerY}
          stroke="#38bdf8"
          strokeWidth={3}
          strokeDasharray="25 15"
          strokeDashoffset={-laserOffset}
          filter="drop-shadow(0 0 10px #38bdf8)"
          opacity={0.8}
        />

        {/* Sat 3 Beam */}
        <line
          x1={centerX + Math.cos(sat3Angle) * 430}
          y1={centerY + Math.sin(sat3Angle) * 180}
          x2={centerX}
          y2={centerY}
          stroke="#a855f7"
          strokeWidth={3}
          strokeDasharray="20 15"
          strokeDashoffset={-laserOffset}
          filter="drop-shadow(0 0 10px #a855f7)"
          opacity={0.8}
        />

        {/* Satellites */}
        {/* Satellite 1 */}
        <g transform={`translate(${centerX + Math.cos(sat1Angle) * 440}, ${centerY + Math.sin(sat1Angle) * 150})`}>
          <circle cx={0} cy={0} r={20} fill="#f59e0b" filter="drop-shadow(0 0 18px #f59e0b)" />
          <text x={-14} y={8} fontSize={26}>🛰️</text>
        </g>

        {/* Satellite 2 */}
        <g transform={`translate(${centerX + Math.cos(sat2Angle) * 460}, ${centerY + Math.sin(sat2Angle) * 170})`}>
          <circle cx={0} cy={0} r={20} fill="#38bdf8" filter="drop-shadow(0 0 18px #38bdf8)" />
          <text x={-14} y={8} fontSize={26}>🛰️</text>
        </g>

        {/* Satellite 3 */}
        <g transform={`translate(${centerX + Math.cos(sat3Angle) * 430}, ${centerY + Math.sin(sat3Angle) * 180})`}>
          <circle cx={0} cy={0} r={20} fill="#a855f7" filter="drop-shadow(0 0 18px #a855f7)" />
          <text x={-14} y={8} fontSize={26}>🛰️</text>
        </g>
      </svg>

      {/* --- STATISTIC COUNTER DIRECTLY SUPERIMPOSED OVER EARTH GLOBE --- */}
      <div
        style={{
          position: "absolute",
          top: centerY,
          left: centerX,
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: 220,
            fontWeight: 950,
            color: "#ffffff",
            lineHeight: 0.85,
            textShadow:
              "0 0 40px #f59e0b, 0 0 80px #ea580c, 0 0 130px rgba(245, 158, 11, 0.95), 0 10px 30px rgba(0,0,0,0.95)",
            letterSpacing: -4,
          }}
        >
          {mythCounter}{statUnit}
        </div>
        <div
          style={{
            marginTop: 18,
            padding: "10px 32px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #d97706, #f59e0b)",
            border: "2.5px solid #ffffff",
            boxShadow: "0 0 40px rgba(245, 158, 11, 0.9), 0 8px 25px rgba(0,0,0,0.8)",
            color: "#ffffff",
            fontSize: 26,
            fontWeight: 950,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {statLabel}
        </div>
      </div>

      {/* --- MASCOT ANCHORED BOTTOM-LEFT --- */}
      <Mascot
        pose={mascotPose}
        subtitles={subtitles}
        themeColor="#f59e0b"
        accentColor="#ef4444"
        scale={1.05}
        style={{
          left: 60,
          bottom: 40,
          zIndex: 5,
        }}
      />
    </AbsoluteFill>
  );
};
