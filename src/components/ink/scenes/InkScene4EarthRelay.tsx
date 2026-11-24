import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from "remotion";
import { useInkBoil } from "../useInkBoil";
import { InkStroke } from "../InkStroke";
import { InkStamp } from "../InkStamp";

export const InkScene4EarthRelay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boil = useInkBoil(3);

  // Tower 1 to 4 spring pop-ups
  const t1Spring = spring({ frame: frame - 20, fps, config: { damping: 10, stiffness: 260 } });
  const t2Spring = spring({ frame: frame - 45, fps, config: { damping: 10, stiffness: 260 } });
  const t3Spring = spring({ frame: frame - 70, fps, config: { damping: 10, stiffness: 260 } });
  const t4Spring = spring({ frame: frame - 95, fps, config: { damping: 10, stiffness: 260 } });

  // Beam segments between towers
  const beam1Progress = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beam2Progress = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beam3Progress = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Overshoot beam that misses into space
  const overshootProgress = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {frame === 5 && <Audio src={staticFile("sfx/pen_scratch.mp3")} volume={0.5} />}
      {frame === 20 && <Audio src={staticFile("sfx/pop.mp3")} volume={0.6} />}
      {frame === 45 && <Audio src={staticFile("sfx/pop.mp3")} volume={0.6} />}
      {frame === 70 && <Audio src={staticFile("sfx/pop.mp3")} volume={0.6} />}
      {frame === 95 && <Audio src={staticFile("sfx/pop.mp3")} volume={0.6} />}

      <svg
        viewBox="0 0 1080 1920"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          transform: `translate(${boil.dx}px, ${boil.dy}px)`,
        }}
      >
        {/* Section Header */}
        <g transform="translate(540, 320)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#0f172a"
            fontFamily="'Arial Black', -apple-system, sans-serif"
            fontSize="44"
            fontWeight="900"
            letterSpacing="2"
          >
            ENGINEERING THE CURVE
          </text>
          <text
            x="0"
            y="42"
            textAnchor="middle"
            fill="#64748b"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="20"
            fontWeight="bold"
            letterSpacing="3"
          >
            LINE-OF-SIGHT MICROWAVE GEOMETRY
          </text>
          <line x1="-360" y1="65" x2="360" y2="65" stroke="#0f172a" strokeWidth="2.5" />
        </g>

        {/* ========================================================= */}
        {/* SKETCHED EARTH CURVATURE HORIZON                          */}
        {/* ========================================================= */}
        <g id="earth-horizon" transform="translate(540, 1260)">
          {/* Earth Curvature Arc: Massive arc bending down on sides */}
          <InkStroke
            d="M -600 -120 Q 0 -360, 600 -120 L 600 500 L -600 500 Z"
            pathLength={3200}
            startFrame={5}
            drawDuration={30}
            strokeColor="#0f172a"
            strokeWidth={5}
            fillColor="#e0f2fe"
            fillOpacity={0.7}
          />

          {/* Earth Mantle Cross-Hatching for Technical Depth */}
          <g stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3, 5" opacity="0.6">
            <line x1="-400" y1="0" x2="-400" y2="250" />
            <line x1="-200" y1="-80" x2="-200" y2="250" />
            <line x1="0" y1="-140" x2="0" y2="250" />
            <line x1="200" y1="-80" x2="200" y2="250" />
            <line x1="400" y1="0" x2="400" y2="250" />
          </g>

          <text
            x="0"
            y="-40"
            textAnchor="middle"
            fill="#0369a1"
            fontFamily="'Arial Black', -apple-system, sans-serif"
            fontSize="30"
            fontWeight="900"
            letterSpacing="3"
          >
            EARTH'S PHYSICAL CURVATURE
          </text>
          <text
            x="0"
            y="-10"
            textAnchor="middle"
            fill="#64748b"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="18"
            fontWeight="bold"
          >
            DROPS ~8 INCHES PER MILE SQUARED
          </text>

          {/* ======================================================= */}
          {/* STRAIGHT BEAM THAT OVERSHOOTS INTO SPACE (The Problem) */}
          {/* ======================================================= */}
          {frame >= 25 && frame < 90 && (
            <g id="overshoot-problem">
              {/* Straight Tangent Line escaping into space */}
              <line
                x1="-380"
                y1="-290"
                x2={-380 + overshootProgress * 800}
                y2="-290"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="6, 6"
              />
              {overshootProgress >= 1 && (
                <text
                  x="300"
                  y="-310"
                  fill="#dc2626"
                  fontFamily="'Courier New', Courier, monospace"
                  fontSize="18"
                  fontWeight="bold"
                >
                  ⚡ BEAM MISSES INTO SPACE
                </text>
              )}
            </g>
          )}

          {/* ======================================================= */}
          {/* 4 MICROWAVE RELAY TOWERS ALONG THE CURVE                */}
          {/* ======================================================= */}
          {/* Tower 1 (x: -380, y on curve: -190) */}
          <g transform={`translate(-380, -190) scale(${t1Spring})`}>
            <line x1="0" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="5" />
            <line x1="-15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <line x1="15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <circle cx="0" cy="-120" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
          </g>

          {/* Tower 2 (x: -130, y on curve: -285) */}
          <g transform={`translate(-130, -285) scale(${t2Spring})`}>
            <line x1="0" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="5" />
            <line x1="-15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <line x1="15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <circle cx="0" cy="-120" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
          </g>

          {/* Tower 3 (x: 130, y on curve: -285) */}
          <g transform={`translate(130, -285) scale(${t3Spring})`}>
            <line x1="0" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="5" />
            <line x1="-15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <line x1="15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <circle cx="0" cy="-120" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
          </g>

          {/* Tower 4 (x: 380, y on curve: -190) */}
          <g transform={`translate(380, -190) scale(${t4Spring})`}>
            <line x1="0" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="5" />
            <line x1="-15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <line x1="15" y1="0" x2="0" y2="-120" stroke="#0f172a" strokeWidth="3" />
            <circle cx="0" cy="-120" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
          </g>

          {/* ======================================================= */}
          {/* RELAY BEAM CHAIN HOPPING TOWER TO TOWER                 */}
          {/* ======================================================= */}
          {/* Hop 1: Tower 1 (-380, -310) to Tower 2 (-130, -405) */}
          {beam1Progress > 0 && (
            <line
              x1="-380"
              y1="-310"
              x2={-380 + beam1Progress * 250}
              y2={-310 + beam1Progress * -95}
              stroke="#0284c7"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}

          {/* Hop 2: Tower 2 (-130, -405) to Tower 3 (130, -405) */}
          {beam2Progress > 0 && (
            <line
              x1="-130"
              y1="-405"
              x2={-130 + beam2Progress * 260}
              y2="-405"
              stroke="#0284c7"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}

          {/* Hop 3: Tower 3 (130, -405) to Tower 4 (380, -310) */}
          {beam3Progress > 0 && (
            <line
              x1="130"
              y1="-405"
              x2={130 + beam3Progress * 250}
              y2={-405 + beam3Progress * 95}
              stroke="#0284c7"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}

          {/* Hand-Drawn 30 MILES Dimension Callouts */}
          {frame >= 80 && (
            <g transform="translate(0, -435)">
              <line x1="-120" y1="0" x2="120" y2="0" stroke="#b45309" strokeWidth="2" markerEnd="url(#arrow)" />
              <rect x="-65" y="-14" width="130" height="28" rx="6" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill="#92400e"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="15"
                fontWeight="900"
              >
                |← 30 MILES →|
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* ========================================================= */}
      {/* PHYSICAL RUBBER STAMP: SPACED EVERY 30 MILES AT FRAME 90   */}
      {/* ========================================================= */}
      <div style={{ position: "absolute", top: "420px", left: "0", right: "0", display: "flex", justifyContent: "center", zIndex: 30 }}>
        <InkStamp
          text="SPACED EVERY 30 MILES"
          subtext="UNBROKEN LINE-OF-SIGHT OVER EARTH'S CURVATURE"
          startFrame={85}
          color="#0284c7"
          rotation={-2}
          size="large"
        />
      </div>
    </div>
  );
};
