import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from "remotion";
import { useInkBoil } from "../useInkBoil";
import { InkStroke } from "../InkStroke";
import { InkStamp } from "../InkStamp";

export const InkScene3CableSnap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boil = useInkBoil(3);

  // Tachometer needle swings from 14.2ms to 11.2ms starting at frame 35
  const needleSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.6 },
  });

  // Needle angle: 14.2ms is ~45deg, 11.2ms is ~-55deg
  const needleAngle = interpolate(needleSpring, [0, 1], [45, -55]);

  // Current latency value interpolated
  const currentLatency = interpolate(needleSpring, [0, 1], [14.2, 11.2]).toFixed(1);

  // Cable snap happens at frame 50
  const isSnapped = frame >= 50;
  const snapGap = interpolate(frame, [50, 75], [0, 90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      {frame === 35 && <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.5} />}
      {frame === 50 && <Audio src={staticFile("sfx/thud.mp3")} volume={0.7} />}

      <svg
        viewBox="0 0 1080 1920"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
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
            THE 3.0 MILLISECOND SACRIFICE
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
            NEW YORK TO LONDON EXCHANGE SPEEDWAY
          </text>
          <line x1="-360" y1="65" x2="360" y2="65" stroke="#0f172a" strokeWidth="2.5" />
        </g>

        {/* ========================================================= */}
        {/* TACHOMETER GAUGE (Center)                                 */}
        {/* ========================================================= */}
        <g transform="translate(540, 680)">
          {/* Gauge Outer Dial Arc */}
          <InkStroke
            d="M -230 110 A 240 240 0 1 1 230 110"
            pathLength={1200}
            startFrame={5}
            drawDuration={25}
            strokeColor="#0f172a"
            strokeWidth={6}
            fillColor="#f8fafc"
            fillOpacity={0.9}
          />

          {/* Dial Tick Marks */}
          <g stroke="#334155" strokeWidth="3" strokeLinecap="round">
            {/* 10 ms (Leftmost) */}
            <line x1="-195" y1="50" x2="-165" y2="40" />
            {/* 11.2 ms (Green Target) */}
            <line x1="-160" y1="-80" x2="-135" y2="-65" stroke="#059669" strokeWidth="5" />
            {/* 12.5 ms (Midpoint) */}
            <line x1="-50" y1="-190" x2="-40" y2="-160" />
            {/* 14.2 ms (Old Cable Baseline) */}
            <line x1="130" y1="-110" x2="110" y2="-90" stroke="#dc2626" strokeWidth="5" />
            {/* 16 ms (Rightmost) */}
            <line x1="195" y1="50" x2="165" y2="40" />
          </g>

          {/* Subsea Cable Arc (Red Zone) */}
          <path
            d="M 60 -170 A 220 220 0 0 1 195 50"
            fill="none"
            stroke="#fca5a5"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Microwave Arc (Green Zone) */}
          <path
            d="M -195 50 A 220 220 0 0 1 -40 -185"
            fill="none"
            stroke="#86efac"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Digital Readout Box (Positioned cleanly below needle pivot) */}
          <rect x="-150" y="60" width="300" height="95" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="3" />
          <text
            x="0"
            y="118"
            textAnchor="middle"
            fill={frame >= 45 ? "#34d399" : "#ffffff"}
            fontFamily="'Arial Black', -apple-system, sans-serif"
            fontSize="48"
            fontWeight="900"
          >
            {currentLatency} ms
          </text>
          <text
            x="0"
            y="142"
            textAnchor="middle"
            fill="#94a3b8"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="13"
            fontWeight="bold"
            letterSpacing="2"
          >
            ONE-WAY TRADING LATENCY
          </text>

          {/* Rotating Needle (Clean unobstructed pivot) */}
          <g transform={`rotate(${needleAngle})`}>
            <polygon points="-6,12 6,12 0,-175" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="3.5" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* PHYSICAL SUBSEA CABLE SNAPPING (Bottom Half)              */}
        {/* ========================================================= */}
        <g transform="translate(540, 1160)">
          <text
            x="0"
            y="-50"
            textAnchor="middle"
            fill="#475569"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="18"
            fontWeight="bold"
            letterSpacing="2"
          >
            TRANSATLANTIC SUBSEA FIBER CABLE (5,000 KM)
          </text>

          {/* Left Cable Half */}
          <g transform={`translate(${-snapGap}, 0)`}>
            {/* Outer Armor Sheath */}
            <rect x="-420" y="-20" width="400" height="40" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="3.5" />
            {/* Inner Core */}
            <line x1="-420" y1="0" x2="-20" y2="0" stroke="#38bdf8" strokeWidth="8" />

            {/* Severed Ragged Edges if Snapped */}
            {isSnapped && (
              <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                <line x1="-20" y1="-18" x2="-8" y2="-12" />
                <line x1="-20" y1="-5" x2="-2" y2="0" stroke="#f59e0b" strokeWidth="4" />
                <line x1="-20" y1="10" x2="-10" y2="15" />
                <line x1="-20" y1="18" x2="-5" y2="24" />
              </g>
            )}
          </g>

          {/* Right Cable Half */}
          <g transform={`translate(${snapGap}, 0)`}>
            {/* Outer Armor Sheath */}
            <rect x="20" y="-20" width="400" height="40" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="3.5" />
            {/* Inner Core */}
            <line x1="20" y1="0" x2="420" y2="0" stroke="#38bdf8" strokeWidth="8" />

            {/* Severed Ragged Edges if Snapped */}
            {isSnapped && (
              <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                <line x1="20" y1="-18" x2="8" y2="-12" />
                <line x1="20" y1="-5" x2="2" y2="0" stroke="#f59e0b" strokeWidth="4" />
                <line x1="20" y1="10" x2="10" y2="15" />
                <line x1="20" y1="18" x2="5" y2="24" />
              </g>
            )}
          </g>

          {/* Electric Sparks at Snap Point */}
          {isSnapped && (
            <g transform={`scale(${1 + boil.dx * 0.1})`}>
              <line x1="-20" y1="-30" x2="25" y2="-15" stroke="#f59e0b" strokeWidth="3" />
              <line x1="15" y1="-35" x2="-10" y2="30" stroke="#eab308" strokeWidth="3" />
              <line x1="-15" y1="20" x2="20" y2="25" stroke="#f59e0b" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="14" fill="#fbbf24" opacity={0.6} />
            </g>
          )}
        </g>
      </svg>

      {/* ========================================================= */}
      {/* PHYSICAL RUBBER STAMPS                                    */}
      {/* ========================================================= */}
      {/* Stamp 1: -3.0 Milliseconds Shaved below the tachometer */}
      <div style={{ position: "absolute", top: "900px", left: "0", right: "0", display: "flex", justifyContent: "center", zIndex: 30 }}>
        <InkStamp
          text="-3.0 MILLISECONDS SHAVED"
          subtext="AIR MICROWAVE BEATS OCEAN FIBER"
          startFrame={45}
          color="#059669"
          rotation={-1.5}
          size="medium"
        />
      </div>

      {/* Stamp 2: ABANDONED Stamp over the snapped cable */}
      <div style={{ position: "absolute", top: "1140px", left: "0", right: "0", display: "flex", justifyContent: "center", zIndex: 30 }}>
        <InkStamp
          text="⚡ ABANDONED ⚡"
          subtext="TOO SLOW FOR MODERN HIGH-FREQUENCY TRADING"
          startFrame={65}
          color="#dc2626"
          rotation={2}
          size="large"
        />
      </div>
    </div>
  );
};
