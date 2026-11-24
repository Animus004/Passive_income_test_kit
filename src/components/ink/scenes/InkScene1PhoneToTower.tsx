import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Audio, staticFile } from "remotion";
import { useInkBoil } from "../useInkBoil";
import { InkStroke } from "../InkStroke";
import { InkStamp } from "../InkStamp";

export const InkScene1PhoneToTower: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boil = useInkBoil(3);

  // Transition from phone to countryside tower around frame 170
  const camY = interpolate(frame, [160, 220], [0, -380], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneOpacity = interpolate(frame, [160, 205], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camScale = interpolate(frame, [160, 220], [1.0, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tap button interaction at frame 38
  const tapProgress = spring({
    frame: frame - 38,
    fps,
    config: { damping: 10, stiffness: 280, mass: 0.4 },
  });
  const isTapped = frame >= 38;

  // Ripple waves from button tap
  const ripple1 = interpolate(frame, [38, 75], [0, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rippleAlpha1 = interpolate(frame, [38, 75], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ripple2 = interpolate(frame, [48, 85], [0, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rippleAlpha2 = interpolate(frame, [48, 85], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Microwave pulse waves from the tower (repeating every 30 frames after f220)
  const pulsePhase = Math.max(0, frame - 220);
  const pulse1 = (pulsePhase % 45) / 45;
  const pulse2 = ((pulsePhase + 22) % 45) / 45;

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
      {/* Background Drawing SFX */}
      {frame === 5 && <Audio src={staticFile("sfx/pen_scratch.mp3")} volume={0.5} />}
      {frame === 38 && <Audio src={staticFile("sfx/pop.mp3")} volume={0.7} />}
      {frame === 170 && <Audio src={staticFile("sfx/paper_slide.mp3")} volume={0.5} />}
      {frame === 190 && <Audio src={staticFile("sfx/pen_scribble.mp3")} volume={0.6} />}

      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translateY(${camY}px) scale(${camScale})`,
          transformOrigin: "center center",
        }}
      >
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
          {/* ========================================================= */}
          {/* SECTION A: FIRST-PERSON SMARTPHONE IN HANDS (f0 - f180)  */}
          {/* ========================================================= */}
          <g id="phone-unit" transform={`translate(540, 780)`} opacity={phoneOpacity}>
            {/* Illustrated Left Hand holding phone */}
            <InkStroke
              d="M -230 180 C -260 210, -280 270, -250 340 C -220 410, -180 430, -140 400 L -120 280 Z"
              pathLength={500}
              startFrame={2}
              drawDuration={20}
              strokeColor="#1e293b"
              strokeWidth={4}
              fillColor="#fed7aa"
              fillOpacity={0.8}
            />
            {/* Illustrated Right Hand holding phone */}
            <InkStroke
              d="M 230 180 C 260 210, 280 270, 250 340 C 220 410, 180 430, 140 400 L 120 280 Z"
              pathLength={500}
              startFrame={4}
              drawDuration={20}
              strokeColor="#1e293b"
              strokeWidth={4}
              fillColor="#fed7aa"
              fillOpacity={0.8}
            />

            {/* Phone Outer Body Chassis */}
            <InkStroke
              d="M -180 -320 L 180 -320 Q 210 -320 210 -290 L 210 290 Q 210 320 180 320 L -180 320 Q -210 320 -210 290 L -210 -290 Q -210 -320 -180 -320 Z"
              pathLength={1600}
              startFrame={0}
              drawDuration={25}
              strokeColor="#0f172a"
              strokeWidth={5}
              fillColor="#f8fafc"
              fillOpacity={0.95}
            />

            {/* Inner OLED Screen Bezel */}
            <InkStroke
              d="M -160 -290 L 160 -290 Q 180 -290 180 -270 L 180 270 Q 180 290 160 290 L -160 290 Q -180 290 -180 270 L -180 -270 Q -180 -290 -160 -290 Z"
              pathLength={1400}
              startFrame={10}
              drawDuration={20}
              strokeColor="#1e293b"
              strokeWidth={3}
              fillColor="#090d16"
              fillOpacity={0.98}
            />

            {/* Screen Content: App Header */}
            <text
              x="0"
              y="-250"
              textAnchor="middle"
              fill="#94a3b8"
              fontFamily="'Courier New', Courier, monospace"
              fontSize="16"
              fontWeight="bold"
              letterSpacing="2"
            >
              MOBILE STOCK TRADER • 5G
            </text>

            {/* App Stock Header */}
            <text
              x="-150"
              y="-208"
              fill="#ffffff"
              fontFamily="'Arial Black', -apple-system, sans-serif"
              fontSize="24"
              fontWeight="900"
            >
              NVDA
            </text>

            <text
              x="-150"
              y="-186"
              fill="#34d399"
              fontFamily="'Courier New', Courier, monospace"
              fontSize="14"
              fontWeight="bold"
            >
              ▲ +4.2% TODAY
            </text>

            <text
              x="150"
              y="-208"
              textAnchor="end"
              fill="#10b981"
              fontFamily="'Arial Black', -apple-system, sans-serif"
              fontSize="26"
              fontWeight="900"
            >
              $142.50
            </text>

            {/* Candlestick Chart Grid Lines */}
            <line x1="-150" y1="-150" x2="150" y2="-150" stroke="#1e293b" strokeWidth="1" strokeDasharray="3, 3" />
            <line x1="-150" y1="-80" x2="150" y2="-80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3, 3" />
            <line x1="-150" y1="-10" x2="150" y2="-10" stroke="#1e293b" strokeWidth="1" strokeDasharray="3, 3" />

            {/* Candlestick Bars Inking In (Shifted down 20px for breathing room) */}
            <g id="candlesticks" transform="translate(0, 20)">
              {/* Bar 1 */}
              <line x1="-130" y1="-140" x2="-130" y2="-90" stroke="#10b981" strokeWidth="2" />
              <rect x="-136" y="-125" width="12" height="25" fill="#10b981" stroke="#065f46" strokeWidth="1.5" />

              {/* Bar 2 */}
              <line x1="-95" y1="-130" x2="-95" y2="-70" stroke="#ef4444" strokeWidth="2" />
              <rect x="-101" y="-115" width="12" height="30" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />

              {/* Bar 3 */}
              <line x1="-60" y1="-150" x2="-60" y2="-85" stroke="#10b981" strokeWidth="2" />
              <rect x="-66" y="-140" width="12" height="35" fill="#10b981" stroke="#065f46" strokeWidth="1.5" />

              {/* Bar 4 */}
              <line x1="-25" y1="-165" x2="-25" y2="-105" stroke="#10b981" strokeWidth="2" />
              <rect x="-31" y="-155" width="12" height="40" fill="#10b981" stroke="#065f46" strokeWidth="1.5" />

              {/* Bar 5 */}
              <line x1="10" y1="-180" x2="10" y2="-120" stroke="#10b981" strokeWidth="2" />
              <rect x="4" y="-170" width="12" height="42" fill="#10b981" stroke="#065f46" strokeWidth="1.5" />

              {/* Bar 6 */}
              <line x1="45" y1="-195" x2="45" y2="-135" stroke="#10b981" strokeWidth="2" />
              <rect x="39" y="-185" width="12" height="40" fill="#10b981" stroke="#065f46" strokeWidth="1.5" />

              {/* Bar 7 (Spiking right) */}
              <line x1="80" y1="-215" x2="80" y2="-150" stroke="#10b981" strokeWidth="2" />
              <rect x="74" y="-205" width="12" height="45" fill="#10b981" stroke="#065f46" strokeWidth="1.5" />

              {/* Bar 8 (Peak) */}
              <line x1="115" y1="-235" x2="115" y2="-170" stroke="#10b981" strokeWidth="2" />
              <rect x="109" y="-225" width="12" height="48" fill="#10b981" stroke="#065f46" strokeWidth="1.5" />

              {/* Glowing Stock Trajectory Trend Line */}
              <InkStroke
                d="M -130 -110 L -95 -95 L -60 -130 L -25 -140 L 10 -155 L 45 -170 L 80 -195 L 115 -215"
                pathLength={350}
                startFrame={18}
                drawDuration={22}
                strokeColor="#34d399"
                strokeWidth={3.5}
              />
            </g>

            {/* [ BUY 100 SHARES ] BUTTON */}
            <g transform={`translate(0, 80) scale(${1 - tapProgress * 0.08})`}>
              <rect
                x="-140"
                y="-30"
                width="280"
                height="60"
                rx="14"
                fill={isTapped ? "#059669" : "#10b981"}
                stroke="#047857"
                strokeWidth="3"
                style={{
                  filter: isTapped ? "drop-shadow(0 0 16px rgba(16, 185, 129, 0.8))" : "none",
                }}
              />
              <text
                x="0"
                y="8"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="'Arial Black', -apple-system, sans-serif"
                fontSize="22"
                fontWeight="900"
                letterSpacing="1.5"
              >
                {isTapped ? "✓ ORDER EXECUTING" : "⚡ BUY 100 SHARES"}
              </text>
            </g>

            {/* Tap Ripple Shockwaves */}
            {isTapped && rippleAlpha1 > 0 && (
              <circle
                cx="0"
                cy="80"
                r={ripple1}
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                opacity={rippleAlpha1}
              />
            )}
            {isTapped && rippleAlpha2 > 0 && (
              <circle
                cx="0"
                cy="80"
                r={ripple2}
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
                opacity={rippleAlpha2}
              />
            )}

            {/* Order Routing Telemetry Box */}
            {isTapped && (
              <g transform="translate(0, 190)">
                <rect
                  x="-140"
                  y="-25"
                  width="280"
                  height="50"
                  rx="8"
                  fill="#111827"
                  stroke="#374151"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="-6"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontFamily="'Courier New', Courier, monospace"
                  fontSize="13"
                  fontWeight="bold"
                >
                  TARGET: WALL STREET SPEEDWAY
                </text>
                <text
                  x="0"
                  y="14"
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontFamily="'Courier New', Courier, monospace"
                  fontSize="13"
                  fontWeight="bold"
                >
                  LINK: OPEN AIR MICROWAVE ➔ 0.000 ms
                </text>
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* SECTION B: THE CLOUD MYTH & REJECTION STAMP (f100 - f200) */}
          {/* ========================================================= */}
          {frame >= 90 && frame < 210 && (
            <g id="cloud-myth" transform="translate(780, 320)" opacity={phoneOpacity}>
              {/* Dotted path leading up from phone */}
              <path
                d="M -180 200 Q -100 80, 0 0"
                fill="none"
                stroke="#64748b"
                strokeWidth="3"
                strokeDasharray="6, 6"
              />

              {/* Hand-drawn Cloud Shape */}
              <InkStroke
                d="M -90 0 C -120 -30, -100 -80, -60 -80 C -40 -120, 20 -120, 50 -80 C 90 -80, 110 -40, 90 0 C 110 30, 80 70, 40 60 C 20 80, -40 80, -60 60 C -100 60, -110 30, -90 0 Z"
                pathLength={600}
                startFrame={95}
                drawDuration={25}
                strokeColor="#475569"
                strokeWidth={3.5}
                fillColor="#e2e8f0"
                fillOpacity={0.65}
              />
              <text
                x="0"
                y="-5"
                textAnchor="middle"
                fill="#334155"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="18"
                fontWeight="900"
                letterSpacing="1"
              >
                "THE CLOUD"
              </text>
              <text
                x="0"
                y="18"
                textAnchor="middle"
                fill="#64748b"
                fontFamily="'Courier New', Courier, monospace"
                fontSize="12"
                fontWeight="bold"
              >
                (MYTH)
              </text>
            </g>
          )}

          {/* ========================================================= */}
          {/* SECTION C: COUNTRYSIDE HILLS & 300FT TOWER (f180 - f376) */}
          {/* ========================================================= */}
          {frame >= 160 && (
            <g id="countryside-stage" transform="translate(0, 1150)">
              {/* Rolling Hills Background Contour 1 */}
              <InkStroke
                d="M -50 480 Q 240 380, 540 430 T 1130 390 L 1130 850 L -50 850 Z"
                pathLength={2200}
                startFrame={165}
                drawDuration={30}
                strokeColor="#1e3a1e"
                strokeWidth={3}
                fillColor="#dcfce7"
                fillOpacity={0.55}
              />
              {/* Rolling Hills Foreground Contour 2 */}
              <InkStroke
                d="M -50 540 Q 320 450, 680 500 T 1130 460 L 1130 850 L -50 850 Z"
                pathLength={2200}
                startFrame={175}
                drawDuration={30}
                strokeColor="#14532d"
                strokeWidth={4}
                fillColor="#bbf7d0"
                fillOpacity={0.7}
              />

              {/* Grass Tufts & Fence Details */}
              <g stroke="#15803d" strokeWidth="2.5" strokeLinecap="round">
                <line x1="160" y1="520" x2="160" y2="495" />
                <line x1="160" y1="520" x2="150" y2="500" />
                <line x1="160" y1="520" x2="170" y2="500" />

                <line x1="880" y1="490" x2="880" y2="465" />
                <line x1="880" y1="490" x2="870" y2="470" />
                <line x1="880" y1="490" x2="890" y2="470" />
              </g>

              {/* --- 300FT STEEL LATTICE MICROWAVE TOWER --- */}
              <g id="microwave-tower" transform="translate(540, 500)">
                {/* Concrete Pier Foundation Footings */}
                <rect x="-85" y="-10" width="30" height="20" rx="4" fill="#94a3b8" stroke="#0f172a" strokeWidth="3" />
                <rect x="55" y="-10" width="30" height="20" rx="4" fill="#94a3b8" stroke="#0f172a" strokeWidth="3" />

                {/* Left Structural Steel Mast Leg */}
                <InkStroke
                  d="M -70 0 L -25 -520"
                  pathLength={600}
                  startFrame={185}
                  drawDuration={25}
                  strokeColor="#0f172a"
                  strokeWidth={6}
                />
                {/* Right Structural Steel Mast Leg */}
                <InkStroke
                  d="M 70 0 L 25 -520"
                  pathLength={600}
                  startFrame={185}
                  drawDuration={25}
                  strokeColor="#0f172a"
                  strokeWidth={6}
                />

                {/* Horizontal & Diagonal Cross Bracing (Lattice Structure) */}
                {/* Tier 1 */}
                <line x1="-65" y1="-80" x2="65" y2="-80" stroke="#0f172a" strokeWidth="3.5" />
                <line x1="-65" y1="0" x2="65" y2="-80" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="65" y1="0" x2="-65" y2="-80" stroke="#0f172a" strokeWidth="2.5" />

                {/* Tier 2 */}
                <line x1="-58" y1="-170" x2="58" y2="-170" stroke="#0f172a" strokeWidth="3.5" />
                <line x1="-65" y1="-80" x2="58" y2="-170" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="65" y1="-80" x2="-58" y2="-170" stroke="#0f172a" strokeWidth="2.5" />

                {/* Tier 3 */}
                <line x1="-50" y1="-260" x2="50" y2="-260" stroke="#0f172a" strokeWidth="3.5" />
                <line x1="-58" y1="-170" x2="50" y2="-260" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="58" y1="-170" x2="-50" y2="-260" stroke="#0f172a" strokeWidth="2.5" />

                {/* Tier 4 */}
                <line x1="-42" y1="-350" x2="42" y2="-350" stroke="#0f172a" strokeWidth="3.5" />
                <line x1="-50" y1="-260" x2="42" y2="-350" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="50" y1="-260" x2="-42" y2="-350" stroke="#0f172a" strokeWidth="2.5" />

                {/* Tier 5 */}
                <line x1="-34" y1="-440" x2="34" y2="-440" stroke="#0f172a" strokeWidth="3.5" />
                <line x1="-42" y1="-350" x2="34" y2="-440" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="42" y1="-350" x2="-34" y2="-440" stroke="#0f172a" strokeWidth="2.5" />

                {/* Top Mast Head & Red Aviation Beacon */}
                <line x1="-25" y1="-520" x2="25" y2="-520" stroke="#0f172a" strokeWidth="4" />
                <line x1="0" y1="-520" x2="0" y2="-570" stroke="#0f172a" strokeWidth="4" />
                <circle
                  cx="0"
                  cy="-575"
                  r="9"
                  fill="#ef4444"
                  stroke="#991b1b"
                  strokeWidth="2"
                  style={{
                    filter: frame % 20 < 10 ? "drop-shadow(0 0 12px #ef4444)" : "none",
                  }}
                />

                {/* Microwave Drum Dish (Left Side) */}
                <g transform="translate(-55, -420)">
                  <ellipse cx="0" cy="0" rx="32" ry="44" fill="#f8fafc" stroke="#0f172a" strokeWidth="4" />
                  <ellipse cx="-4" cy="0" rx="22" ry="34" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                  <circle cx="12" cy="0" r="7" fill="#0f172a" />
                  <line x1="12" y1="0" x2="32" y2="0" stroke="#0f172a" strokeWidth="4" />
                </g>

                {/* Microwave Drum Dish (Right Side - Firing Signal) */}
                <g transform="translate(55, -340)">
                  <ellipse cx="0" cy="0" rx="34" ry="48" fill="#f8fafc" stroke="#0f172a" strokeWidth="4" />
                  <ellipse cx="4" cy="0" rx="24" ry="36" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                  <circle cx="-12" cy="0" r="7" fill="#0f172a" />
                  <line x1="-12" y1="0" x2="-34" y2="0" stroke="#0f172a" strokeWidth="4" />

                  {/* Concentric Microwave Signal Arcs Firing Toward Right Horizon */}
                  {pulsePhase > 0 && (
                    <>
                      <path
                        d="M 60 -50 A 70 70 0 0 1 60 50"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="4"
                        strokeLinecap="round"
                        transform={`scale(${1 + pulse1 * 1.6})`}
                        opacity={1 - pulse1}
                      />
                      <path
                        d="M 60 -50 A 70 70 0 0 1 60 50"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        transform={`scale(${1 + pulse2 * 1.6})`}
                        opacity={1 - pulse2}
                      />
                    </>
                  )}
                </g>
              </g>
            </g>
          )}
        </svg>

        {/* ========================================================= */}
        {/* PHYSICAL RUBBER STAMPS                                    */}
        {/* ========================================================= */}
        {/* Stamp 1: Myth Busted Stamp over Cloud at Frame 140 */}
        {frame < 210 && (
          <div style={{ position: "absolute", top: "270px", right: "80px", zIndex: 30, opacity: phoneOpacity }}>
            <InkStamp
              text="[ ✗ NO CLOUD ]"
              subtext="HIGH-FREQUENCY MICROWAVE"
              startFrame={140}
              color="#dc2626"
              rotation={-5}
              size="medium"
            />
          </div>
        )}

        {/* Stamp 2: $300,000,000+ Infrastructure Stamp beside Tower at Frame 260 */}
        <div style={{ position: "absolute", top: "720px", left: "80px", zIndex: 30 }}>
          <InkStamp
            text="$300,000,000+ SPENT"
            subtext="STEEL TOWERS ACROSS COUNTRYSIDE"
            startFrame={260}
            color="#059669" // Emerald green
            rotation={-2}
            size="medium"
          />
        </div>
      </div>
    </div>
  );
};
