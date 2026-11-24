import React from "react";
import { useCurrentFrame, interpolate, Audio, staticFile } from "remotion";
import { useInkBoil } from "../useInkBoil";
import { InkStroke } from "../InkStroke";
import { InkStamp } from "../InkStamp";

export const InkScene2SpeedOfLight: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useInkBoil(3);

  // Speed of Light Race (Frames 30 to 130)
  // Track 1 (Air): Hits finish at frame 85
  const airProgress = interpolate(frame, [30, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Track 2 (Glass): 30% slower, hits finish at frame 125
  const glassProgress = interpolate(frame, [30, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse positions
  const startX = 140;
  const finishX = 940;
  const airX = startX + airProgress * (finishX - startX);
  const glassX = startX + glassProgress * (finishX - startX);

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
      {frame === 30 && <Audio src={staticFile("sfx/laser.mp3")} volume={0.6} />}
      {frame === 85 && <Audio src={staticFile("sfx/pop.mp3")} volume={0.6} />}

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
        <g transform="translate(540, 360)">
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
            SPEED OF LIGHT SHOWDOWN
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
            OPEN AIR MICROWAVE vs SOLID GLASS FIBER
          </text>
          <line x1="-360" y1="65" x2="360" y2="65" stroke="#0f172a" strokeWidth="2.5" />
        </g>

        {/* ========================================================= */}
        {/* TRACK 1: OPEN AIR MICROWAVE (Top Half)                   */}
        {/* ========================================================= */}
        <g transform="translate(0, 560)">
          {/* Track Frame Border */}
          <InkStroke
            d="M 100 0 L 980 0 L 980 240 L 100 240 Z"
            pathLength={2200}
            startFrame={5}
            drawDuration={20}
            strokeColor="#0284c7"
            strokeWidth={3.5}
            fillColor="#f0f9ff"
            fillOpacity={0.8}
          />

          <text
            x="140"
            y="45"
            fill="#0369a1"
            fontFamily="'Arial Black', -apple-system, sans-serif"
            fontSize="26"
            fontWeight="900"
          >
            📡 OPEN AIR (MICROWAVE RELAY)
          </text>
          <text
            x="940"
            y="45"
            textAnchor="end"
            fill="#0284c7"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="22"
            fontWeight="bold"
          >
            300,000 KM/S (100% C)
          </text>

          {/* Straight Beam Guide Line */}
          <line
            x1="140"
            y1="140"
            x2="940"
            y2="140"
            stroke="#93c5fd"
            strokeWidth="3"
            strokeDasharray="6, 6"
          />

          {/* Winning Air Beam Tracer (Draws as it travels) */}
          <line
            x1="140"
            y1="140"
            x2={airX}
            y2="140"
            stroke="#0284c7"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Leading Photon Head */}
          {frame >= 30 && (
            <circle
              cx={airX}
              cy="140"
              r="14"
              fill="#38bdf8"
              stroke="#0369a1"
              strokeWidth="3"
              style={{
                filter: "drop-shadow(0 0 14px rgba(56, 189, 248, 0.9))",
              }}
            />
          )}

          {/* Finish Target Dish */}
          <circle cx="940" cy="140" r="22" fill="#e0f2fe" stroke="#0369a1" strokeWidth="3" />
          <circle cx="940" cy="140" r="7" fill="#0284c7" />

          {airProgress >= 1 && (
            <text
              x="940"
              y="205"
              textAnchor="end"
              fill="#059669"
              fontFamily="'Arial Black', -apple-system, sans-serif"
              fontSize="20"
              fontWeight="900"
            >
              ✓ ARRIVES FIRST
            </text>
          )}
        </g>

        {/* ========================================================= */}
        {/* TRACK 2: SOLID GLASS FIBER OPTIC (Bottom Half)           */}
        {/* ========================================================= */}
        <g transform="translate(0, 920)">
          {/* Track Frame Border */}
          <InkStroke
            d="M 100 0 L 980 0 L 980 280 L 100 280 Z"
            pathLength={2300}
            startFrame={15}
            drawDuration={20}
            strokeColor="#b91c1c"
            strokeWidth={3.5}
            fillColor="#fef2f2"
            fillOpacity={0.8}
          />

          <text
            x="140"
            y="45"
            fill="#991b1b"
            fontFamily="'Arial Black', -apple-system, sans-serif"
            fontSize="23"
            fontWeight="900"
          >
            🧪 SOLID GLASS FIBER CABLE
          </text>
          <text
            x="940"
            y="45"
            textAnchor="end"
            fill="#dc2626"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="20"
            fontWeight="bold"
          >
            200,000 KM/S (-30%)
          </text>

          {/* Glass Cladding Conduit (Top and Bottom walls) */}
          <rect x="140" y="90" width="800" height="90" rx="10" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />

          {/* Internal Zigzag Refraction Bouncing Line */}
          <path
            d="M 140 135 L 200 95 L 280 175 L 360 95 L 440 175 L 520 95 L 600 175 L 680 95 L 760 175 L 840 95 L 940 135"
            fill="none"
            stroke="#f87171"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lagging Glass Photon Head */}
          {frame >= 30 && (
            <circle
              cx={glassX}
              cy={135 + Math.sin(glassProgress * Math.PI * 10) * 35}
              r="14"
              fill="#ef4444"
              stroke="#991b1b"
              strokeWidth="3"
              style={{
                filter: "drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))",
              }}
            />
          )}

          {/* Technical Refraction Drag Details */}
          <text
            x="140"
            y="230"
            fill="#7f1d1d"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="18"
            fontWeight="bold"
          >
            REFRACTION INDEX: n = 1.468 (SOLID SILICA GLASS)
          </text>
          <text
            x="140"
            y="256"
            fill="#dc2626"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="18"
            fontWeight="bold"
          >
            LIGHT MUST CONSTANTLY BOUNCE ➔ TRAVELS 30% SLOWER
          </text>
        </g>
      </svg>

      {/* ========================================================= */}
      {/* PHYSICAL RUBBER STAMP: -30% SPEED PENALTY AT FRAME 70     */}
      {/* ========================================================= */}
      <div style={{ position: "absolute", top: "1230px", left: "140px", right: "140px", zIndex: 30, display: "flex", justifyContent: "center" }}>
        <InkStamp
          text="-30% SPEED PENALTY IN GLASS"
          subtext="WHY WALL STREET ABANDONED FIBER"
          startFrame={65}
          color="#dc2626"
          rotation={-2}
          size="medium"
        />
      </div>
    </div>
  );
};
