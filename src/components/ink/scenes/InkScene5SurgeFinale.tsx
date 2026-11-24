import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from "remotion";
import { useInkBoil } from "../useInkBoil";
import { InkStamp } from "../InkStamp";

export const InkScene5SurgeFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boil = useInkBoil(3);

  // Chart Spike animation (Frames 15 to 90)
  const surgeSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.7 },
  });

  const chartLength = interpolate(surgeSpring, [0, 1], [0, 1200]);

  // Tower reveal at the peak of the chart around frame 70
  const towerSpring = spring({
    frame: frame - 65,
    fps,
    config: { damping: 10, stiffness: 240 },
  });

  // Radiating broadcast rings from the peak tower
  const broadcastPhase = Math.max(0, frame - 75);
  const ring1 = (broadcastPhase % 40) / 40;
  const ring2 = ((broadcastPhase + 20) % 40) / 40;

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
      {frame === 5 && <Audio src={staticFile("sfx/pen_scribble.mp3")} volume={0.6} />}
      {frame === 20 && <Audio src={staticFile("sfx/riser.mp3")} volume={0.5} />}
      {frame === 65 && <Audio src={staticFile("sfx/laser.mp3")} volume={0.6} />}

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
        {/* Top Technical Margin Label */}
        <g transform="translate(100, 180)">
          <text
            x="0"
            y="0"
            fill="#64748b"
            fontFamily="'Courier New', Courier, monospace"
            fontSize="18"
            fontWeight="bold"
            letterSpacing="3"
          >
            FIG 05 • HIGH-FREQUENCY REVENUE ARBITRAGE
          </text>
          <line x1="0" y1="15" x2="880" y2="15" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>

        {/* ========================================================= */}
        {/* MASSIVE CANDLESTICK CHART SPIKING UPWARD                  */}
        {/* ========================================================= */}
        <g transform="translate(100, 1580)">
          {/* Chart Floor Baseline */}
          <line x1="0" y1="0" x2="880" y2="0" stroke="#0f172a" strokeWidth="4" />

          {/* Background Grid Lines */}
          <g stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4, 6">
            <line x1="0" y1="-250" x2="880" y2="-250" />
            <line x1="0" y1="-500" x2="880" y2="-500" />
            <line x1="0" y1="-750" x2="880" y2="-750" />
          </g>

          {/* Translucent Green Watercolor Area Wash under the surge */}
          <path
            d={`M 50 0 L 50 -120 L 180 -220 L 320 -380 L 480 -600 L 640 -860 L 780 -1050 L 780 0 Z`}
            fill="#dcfce7"
            fillOpacity={0.65}
            stroke="none"
          />

          {/* Surging Candlestick Bars */}
          {/* Bar 1 */}
          <rect x="70" y="-140" width="22" height="60" fill="#10b981" stroke="#047857" strokeWidth="2" />
          {/* Bar 2 */}
          <rect x="180" y="-240" width="22" height="80" fill="#10b981" stroke="#047857" strokeWidth="2" />
          {/* Bar 3 */}
          <rect x="300" y="-390" width="22" height="110" fill="#10b981" stroke="#047857" strokeWidth="2" />
          {/* Bar 4 */}
          <rect x="420" y="-580" width="22" height="140" fill="#10b981" stroke="#047857" strokeWidth="2" />
          {/* Bar 5 */}
          <rect x="540" y="-780" width="22" height="160" fill="#10b981" stroke="#047857" strokeWidth="2" />
          {/* Bar 6 (Spike Peak) */}
          <rect x="670" y="-1020" width="24" height="200" fill="#10b981" stroke="#047857" strokeWidth="2.5" />

          {/* Main Neon Green Trajectory Vector Line */}
          <path
            d="M 50 -80 L 180 -190 L 320 -340 L 460 -520 L 600 -740 L 740 -980 L 780 -1060"
            fill="none"
            stroke="#059669"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1400"
            strokeDashoffset={1400 - chartLength}
            style={{
              filter: "drop-shadow(0 0 16px rgba(16, 185, 129, 0.8))",
            }}
          />

          {/* ======================================================= */}
          {/* PEAK TOWER SILHOUETTE AT THE TOP OF THE SPIKE           */}
          {/* ======================================================= */}
          {towerSpring > 0 && (
            <g transform={`translate(780, -1060) scale(${towerSpring})`}>
              {/* Mast Legs */}
              <line x1="0" y1="0" x2="-25" y2="-180" stroke="#0f172a" strokeWidth="5" />
              <line x1="0" y1="0" x2="25" y2="-180" stroke="#0f172a" strokeWidth="5" />
              <line x1="-25" y1="-180" x2="25" y2="-180" stroke="#0f172a" strokeWidth="4" />
              {/* Cross Braces */}
              <line x1="-15" y1="-90" x2="15" y2="-90" stroke="#0f172a" strokeWidth="3" />
              <line x1="0" y1="0" x2="15" y2="-90" stroke="#0f172a" strokeWidth="2" />
              <line x1="0" y1="0" x2="-15" y2="-90" stroke="#0f172a" strokeWidth="2" />
              {/* Top Spire */}
              <line x1="0" y1="-180" x2="0" y2="-230" stroke="#0f172a" strokeWidth="4" />
              <circle cx="0" cy="-235" r="8" fill="#ef4444" />

              {/* Microwave Drum Dishes */}
              <ellipse cx="-20" cy="-150" rx="16" ry="24" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
              <ellipse cx="20" cy="-120" rx="16" ry="24" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />

              {/* Radiating Broadcast Rings */}
              {broadcastPhase > 0 && (
                <>
                  <circle
                    cx="0"
                    cy="-235"
                    r={ring1 * 120}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="4"
                    opacity={1 - ring1}
                  />
                  <circle
                    cx="0"
                    cy="-235"
                    r={ring2 * 120}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    opacity={1 - ring2}
                  />
                </>
              )}
            </g>
          )}
        </g>
      </svg>

      {/* ========================================================= */}
      {/* PHYSICAL RUBBER STAMPS: GRAND FINALE                      */}
      {/* ========================================================= */}
      {/* Stamp 1: 0.000001s Speed Advantage at Frame 50 (Cleanly below tower beacon rings) */}
      <div style={{ position: "absolute", top: "360px", left: "80px", zIndex: 30 }}>
        <InkStamp
          text="⚡ 0.000001s ADVANTAGE"
          subtext="BILLIONS IN HIGH-FREQUENCY ARBITRAGE"
          startFrame={50}
          color="#059669"
          rotation={-2}
          size="medium"
        />
      </div>

      {/* Stamp 2: Rewriting Physical Geography at Frame 85 */}
      <div style={{ position: "absolute", top: "1210px", left: "0", right: "0", display: "flex", justifyContent: "center", zIndex: 30 }}>
        <InkStamp
          text="REWRITING PHYSICAL GEOGRAPHY"
          subtext="THE HIDDEN NETWORK POWERING EVERY TRADE"
          startFrame={80}
          color="#0f172a"
          rotation={1}
          size="medium"
        />
      </div>
    </div>
  );
};
