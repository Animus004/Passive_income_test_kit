import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { CircleToonCharacter } from "./CircleToonCharacter";
import { SubtitleWord } from "../../types";

interface CircleToonStageProps {
  currentCut: number;
  cuts?: Array<{
    sceneIndex: number;
    startFrame: number;
    endFrame: number;
    environment: string;
  }>;
  totalFrames?: number;
  subtitles?: SubtitleWord[];
}

export const CircleToonStage: React.FC<CircleToonStageProps> = ({
  currentCut,
  cuts = [],
  totalFrames = 1233,
  subtitles = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Active cut relative timing
  const activeCutData = cuts.find((c) => c.sceneIndex === currentCut) || cuts[currentCut - 1];
  const cutStart = activeCutData?.startFrame ?? 0;
  const f = Math.max(0, frame - cutStart);

  const springEntry = spring({ frame: f, fps, config: { damping: 12, stiffness: 180 } });
  const springPunch = spring({ frame: f, fps, config: { damping: 9, stiffness: 220 } });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* ================================================================ */}
      {/* SCENE 1: THE DENSE HOOK CROWD (0..135, 0-4.5s)                   */}
      {/* ================================================================ */}
      {currentCut === 1 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
            {/* Sky */}
            <rect width="1080" height="1920" fill="#bae6fd" />

            {/* City Buildings with Black Outlines & Pastel Fills */}
            <rect x="0" y="240" width="220" height="900" fill="#fed7aa" stroke="#000000" strokeWidth="8" />
            <rect x="40" y="300" width="70" height="90" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />
            <rect x="40" y="440" width="70" height="90" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />
            <rect x="40" y="580" width="70" height="90" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />

            <rect x="220" y="180" width="300" height="960" fill="#fef08a" stroke="#000000" strokeWidth="8" />
            <rect x="260" y="260" width="80" height="100" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />
            <rect x="380" y="260" width="80" height="100" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />
            <rect x="260" y="400" width="80" height="100" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />
            <rect x="380" y="400" width="80" height="100" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />

            <rect x="520" y="220" width="260" height="920" fill="#bbf7d0" stroke="#000000" strokeWidth="8" />
            <rect x="560" y="320" width="75" height="95" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />
            <rect x="670" y="320" width="75" height="95" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />

            <rect x="780" y="160" width="300" height="980" fill="#e9d5ff" stroke="#000000" strokeWidth="8" />
            <rect x="830" y="240" width="85" height="100" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />
            <rect x="950" y="240" width="85" height="100" fill="#7dd3fc" stroke="#000000" strokeWidth="6" />

            {/* Dark Horizon Divider Wall */}
            <rect x="0" y="1040" width="1080" height="880" fill="#f8fafc" stroke="#000000" strokeWidth="8" />

            {/* Back Row Characters (scale 0.9) */}
            {[
              { x: 120, y: 1100, color: "#ef4444", hair: "boy_brown", offset: 0.1 },
              { x: 280, y: 1080, color: "#10b981", hair: "girl_blonde", offset: 0.5 },
              { x: 440, y: 1110, color: "#8b5cf6", hair: "grandma_white", offset: 0.8 },
              { x: 600, y: 1090, color: "#f59e0b", hair: "nerd_black", offset: 0.3 },
              { x: 760, y: 1115, color: "#06b6d4", hair: "boy_brown", offset: 0.7 },
              { x: 920, y: 1085, color: "#ec4899", hair: "girl_blonde", offset: 0.4 },
            ].map((c, i) => (
              <CircleToonCharacter
                key={`b_${i}`}
                x={c.x}
                y={c.y}
                scale={0.9}
                shirtColor={c.color}
                hairStyle={c.hair as any}
                holdingProp="cheque"
                propText="$1,000,000"
                bounceOffset={c.offset}
                subtitles={subtitles}
              />
            ))}

            {/* Middle Row Characters (scale 1.15) */}
            {[
              { x: 180, y: 1220, color: "#1e293b", hair: "nerd_black", offset: 0.4, tie: true },
              { x: 360, y: 1200, color: "#ec4899", hair: "grandma_white", offset: 0.9, tie: false },
              { x: 540, y: 1230, color: "#1e293b", hair: "boy_brown", offset: 0.2, tie: true },
              { x: 720, y: 1210, color: "#f97316", hair: "girl_blonde", offset: 0.6, tie: false },
              { x: 900, y: 1240, color: "#3b82f6", hair: "boy_brown", offset: 0.3, tie: false },
            ].map((c, i) => (
              <CircleToonCharacter
                key={`m_${i}`}
                x={c.x}
                y={c.y}
                scale={1.15}
                shirtColor={c.color}
                hairStyle={c.hair as any}
                holdingProp="cheque"
                propText="$1,000,000"
                hasTie={c.tie}
                bounceOffset={c.offset}
                subtitles={subtitles}
              />
            ))}

            {/* Front Row Hero Characters (scale 1.4) */}
            <CircleToonCharacter
              x={300}
              y={1520}
              scale={1.4}
              shirtColor="#2563eb"
              hairStyle="boy_brown"
              eyeStyle="dots"
              mouthStyle="talk"
              isSpeakingNarrator={true}
              holdingProp="cheque"
              propText="$1,000,000"
              subtitles={subtitles}
            />
            <CircleToonCharacter
              x={780}
              y={1520}
              scale={1.4}
              shirtColor="#ea580c"
              hairStyle="girl_blonde"
              eyeStyle="dots"
              mouthStyle="smile"
              holdingProp="cheque"
              propText="$1,000,000"
              bounceOffset={0.7}
              subtitles={subtitles}
            />

            {/* Fluttering Dollar Bills */}
            {[...Array(12)].map((_, idx) => {
              const fallY = ((f * 12 + idx * 95) % 1200) + 100;
              const swayX = Math.sin(f * 0.1 + idx) * 35 + idx * 90;
              return (
                <g key={`bill_${idx}`} transform={`translate(${swayX}, ${fallY}) rotate(${Math.sin(f * 0.15 + idx) * 30})`}>
                  <rect x="-24" y="-12" width="48" height="24" rx="3" fill="#86efac" stroke="#000000" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="5" fill="#15803d" />
                  <text x="0" y="3" textAnchor="middle" fill="#15803d" fontFamily="'Arial Black', sans-serif" fontSize="8" fontWeight="bold">$</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* ================================================================ */}
      {/* SCENE 2: 8 BILLION PHONES BUZZING (135..300, 4.5-10.0s)          */}
      {/* ================================================================ */}
      {currentCut === 2 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {/* Intense screen vibration calculation */}
          {(() => {
            const shakeX = Math.sin(f * 1.8) * 12;
            const shakeY = Math.cos(f * 2.2) * 6;
            const shakeRot = Math.sin(f * 1.5) * 4;
            const pulseRadius = (f * 16) % 360;

            return (
              <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
                {/* Midnight Bedroom Sky & Window */}
                <rect width="1080" height="1920" fill="#090d16" />

                {/* Night Sky Stars & Crescent Moon */}
                <circle cx="920" cy="280" r="70" fill="#fef08a" />
                <circle cx="950" cy="260" r="65" fill="#090d16" />

                {/* Window Frame in Bedroom */}
                <rect x="740" y="160" width="300" height="340" fill="none" stroke="#1e293b" strokeWidth="12" />
                <line x1="890" y1="160" x2="890" y2="500" stroke="#1e293b" strokeWidth="8" />
                <line x1="740" y1="330" x2="1040" y2="330" stroke="#1e293b" strokeWidth="8" />

                {/* Bed with Sleeping / Shocked Character */}
                <rect x="0" y="1260" width="1080" height="660" fill="#1e293b" stroke="#000000" strokeWidth="8" />
                {/* Pillow */}
                <rect x="80" y="1200" width="220" height="100" rx="20" fill="#f8fafc" stroke="#000000" strokeWidth="6" />
                {/* Character Waking Up in Shock */}
                <CircleToonCharacter
                  x={190}
                  y={1180}
                  scale={1.2}
                  shirtColor="#3b82f6"
                  hairStyle="boy_brown"
                  eyeStyle="screaming"
                  mouthStyle="open_O"
                  subtitles={subtitles}
                />
                {/* Blue Blanket */}
                <path d="M 0 1280 L 1080 1280 L 1080 1920 L 0 1920 Z" fill="#2563eb" stroke="#000000" strokeWidth="8" />
                {/* Blanket Fold Line */}
                <path d="M 0 1280 Q 540 1340 1080 1280" fill="none" stroke="#1d4ed8" strokeWidth="12" />

                {/* Nightstand Table */}
                <rect x="260" y="660" width="560" height="660" rx="16" fill="#78350f" stroke="#000000" strokeWidth="10" />
                <rect x="290" y="700" width="500" height="240" rx="8" fill="#92400e" stroke="#000000" strokeWidth="6" />
                <circle cx="540" cy="820" r="14" fill="#facc15" stroke="#000000" strokeWidth="4" />

                {/* Concentric Vibration Shockwaves */}
                <circle cx="540" cy="800" r={160 + pulseRadius} fill="none" stroke="#22c55e" strokeWidth="6" opacity={Math.max(0, 1 - pulseRadius / 360)} />
                <circle cx="540" cy="800" r={80 + pulseRadius * 0.7} fill="none" stroke="#86efac" strokeWidth="4" opacity={Math.max(0, 1 - pulseRadius / 360)} />

                {/* Vibration Lines */}
                <path d="M 230 680 Q 200 800 230 920" fill="none" stroke="#facc15" strokeWidth="8" strokeLinecap="round" />
                <path d="M 200 700 Q 170 800 200 900" fill="none" stroke="#facc15" strokeWidth="6" strokeLinecap="round" />
                <path d="M 850 680 Q 880 800 850 920" fill="none" stroke="#facc15" strokeWidth="8" strokeLinecap="round" />
                <path d="M 880 700 Q 910 800 880 900" fill="none" stroke="#facc15" strokeWidth="6" strokeLinecap="round" />

                {/* THE GIANT VIBRATING SMARTPHONE */}
                <g
                  transform={`translate(${540 + shakeX}, ${820 + shakeY}) rotate(${shakeRot}) scale(${springPunch})`}
                  style={{ transformOrigin: "0px 0px" }}
                >
                  {/* Phone Case */}
                  <rect x="-220" y="-360" width="440" height="720" rx="46" fill="#0f172a" stroke="#000000" strokeWidth="12" />

                  {/* Lit Screen */}
                  <rect x="-195" y="-335" width="390" height="670" rx="32" fill="#020617" stroke="#22c55e" strokeWidth="4" />

                  {/* Speaker Slit & Front Camera */}
                  <rect x="-45" y="-315" width="90" height="10" rx="5" fill="#334155" />
                  <circle cx="65" cy="-310" r="5" fill="#334155" />

                  {/* Clock on Lock Screen */}
                  <text x="0" y="-230" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="64" fontWeight="900">
                    12:00
                  </text>
                  <text x="0" y="-195" textAnchor="middle" fill="#94a3b8" fontFamily="'Arial Black', sans-serif" fontSize="20" fontWeight="bold">
                    Midnight • Friday
                  </text>

                  {/* Glowing Push Notification Card */}
                  <g transform="translate(0, -30)">
                    {/* Notification Box */}
                    <rect x="-180" y="-120" width="360" height="240" rx="20" fill="#064e3b" stroke="#22c55e" strokeWidth="5" />

                    {/* App Header */}
                    <circle cx="-140" cy="-80" r="20" fill="#22c55e" />
                    <text x="-140" y="-72" textAnchor="middle" fill="#000000" fontFamily="'Arial Black', sans-serif" fontSize="22" fontWeight="900">$</text>
                    <text x="-105" y="-72" fill="#86efac" fontFamily="'Arial Black', sans-serif" fontSize="16" fontWeight="bold">
                      GLOBAL CENTRAL BANK
                    </text>

                    {/* Notification Title */}
                    <text x="-140" y="-25" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="18" fontWeight="bold">
                      DIRECT DEPOSIT CONFIRMED
                    </text>

                    {/* Gigantic Glowing Amount */}
                    <text x="0" y="35" textAnchor="middle" fill="#4ade80" fontFamily="'Arial Black', Impact, sans-serif" fontSize="42" fontWeight="900" letterSpacing="-0.5px">
                      +$1,000,000.00
                    </text>

                    {/* Status Pill */}
                    <rect x="-140" y="60" width="280" height="34" rx="17" fill="#022c22" stroke="#22c55e" strokeWidth="2" />
                    <text x="0" y="83" textAnchor="middle" fill="#86efac" fontFamily="'Arial Black', sans-serif" fontSize="14" fontWeight="bold">
                      AVAILABLE IMMEDIATELY
                    </text>
                  </g>

                  {/* 8 Billion Counter Badge */}
                  <g transform="translate(0, 240)">
                    <rect x="-180" y="-25" width="360" height="50" rx="12" fill="#ef4444" stroke="#000000" strokeWidth="4" />
                    <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', Impact, sans-serif" fontSize="20" fontWeight="900">
                      ⚡ 8,000,000,000 PHONES BUZZING ⚡
                    </text>
                  </g>
                </g>
              </svg>
            );
          })()}
        </div>
      )}

      {/* ================================================================ */}
      {/* SCENE 3: 95% WORKERS QUIT & CELEBRATE (300..430, 10.0-14.33s)    */}
      {/* ================================================================ */}
      {currentCut === 3 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {(() => {
            // High energy jumping worker animation
            const jumpY = Math.abs(Math.sin(f * 0.25)) * -140;

            return (
              <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
                {/* Office Grey Wall */}
                <rect width="1080" height="1920" fill="#e2e8f0" />

                {/* Fluorescent Ceiling Lights with Light Cones */}
                <rect x="180" y="0" width="240" height="40" fill="#ffffff" stroke="#000000" strokeWidth="6" />
                <polygon points="180,40 100,500 500,500 420,40" fill="#fef9c3" opacity="0.3" />

                <rect x="660" y="0" width="240" height="40" fill="#ffffff" stroke="#000000" strokeWidth="6" />
                <polygon points="660,40 580,500 980,500 900,40" fill="#fef9c3" opacity="0.3" />

                {/* Office Wall Clock Showing 12:05 */}
                <circle cx="540" cy="240" r="90" fill="#ffffff" stroke="#000000" strokeWidth="8" />
                <line x1="540" y1="240" x2="540" y2="180" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
                <line x1="540" y1="240" x2="570" y2="240" stroke="#000000" strokeWidth="6" strokeLinecap="round" />

                {/* Green Glowing EXIT Sign */}
                <g transform="translate(900, 200)">
                  <rect x="-80" y="-35" width="160" height="70" rx="8" fill="#15803d" stroke="#000000" strokeWidth="6" />
                  <text x="0" y="12" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="28" fontWeight="900">
                    EXIT →
                  </text>
                </g>

                {/* Office Cubicle Grey Fabric Partition */}
                <rect x="60" y="600" width="960" height="660" rx="8" fill="#94a3b8" stroke="#000000" strokeWidth="10" />
                {/* Sticky Notes on Cubicle */}
                <rect x="120" y="650" width="90" height="90" fill="#fef08a" stroke="#000000" strokeWidth="3" transform="rotate(-6 165 695)" />
                <text x="165" y="700" textAnchor="middle" fill="#000000" fontFamily="sans-serif" fontSize="12" fontWeight="bold">MEETING 9AM</text>

                <rect x="250" y="660" width="80" height="80" fill="#fbcfe8" stroke="#000000" strokeWidth="3" transform="rotate(8 290 700)" />
                <text x="290" y="705" textAnchor="middle" fill="#000000" fontFamily="sans-serif" fontSize="12" fontWeight="bold">REPORTS</text>

                {/* Office Desk */}
                <rect x="140" y="1040" width="800" height="220" fill="#78350f" stroke="#000000" strokeWidth="10" />
                <rect x="200" y="1260" width="60" height="260" fill="#451a03" stroke="#000000" strokeWidth="8" />
                <rect x="820" y="1260" width="60" height="260" fill="#451a03" stroke="#000000" strokeWidth="8" />

                {/* Computer Monitor with Excel Spreadsheet & Red Crash Chart */}
                <rect x="420" y="780" width="240" height="180" rx="6" fill="#0f172a" stroke="#000000" strokeWidth="8" />
                <rect x="440" y="800" width="200" height="140" fill="#ffffff" stroke="#000000" strokeWidth="4" />
                {/* Excel Green Grid & Downward Red Arrow */}
                <line x1="440" y1="835" x2="640" y2="835" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="440" y1="870" x2="640" y2="870" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="440" y1="905" x2="640" y2="905" stroke="#cbd5e1" strokeWidth="2" />
                <polyline points="450,820 490,850 540,840 630,930" fill="none" stroke="#dc2626" strokeWidth="6" />
                {/* Monitor Stand */}
                <rect x="520" y="960" width="40" height="80" fill="#334155" stroke="#000000" strokeWidth="6" />
                <rect x="480" y="1025" width="120" height="20" rx="4" fill="#1e293b" stroke="#000000" strokeWidth="6" />

                {/* Spilled Coffee Mug */}
                <g transform="translate(320, 1020) rotate(70)">
                  <rect x="-20" y="-30" width="40" height="60" rx="6" fill="#ffffff" stroke="#000000" strokeWidth="4" />
                  <ellipse cx="25" cy="15" rx="35" ry="12" fill="#78350f" opacity="0.8" />
                </g>

                {/* Knocked Over Swivel Chair */}
                <g transform="translate(240, 1380) rotate(-40)">
                  <rect x="-40" y="-80" width="80" height="110" rx="14" fill="#1e293b" stroke="#000000" strokeWidth="8" />
                  <rect x="-10" y="30" width="20" height="60" fill="#475569" stroke="#000000" strokeWidth="6" />
                  <circle cx="-30" cy="90" r="12" fill="#000000" />
                  <circle cx="30" cy="90" r="12" fill="#000000" />
                </g>

                {/* Flying Paperwork / Memos Confetti Shower */}
                {[...Array(24)].map((_, i) => {
                  const paperY = ((f * 14 + i * 85) % 1100) + 400;
                  const paperX = ((i * 137) % 960) + 60;
                  const paperRot = Math.sin(f * 0.1 + i) * 120 + i * 25;
                  return (
                    <g key={`paper_${i}`} transform={`translate(${paperX}, ${paperY}) rotate(${paperRot})`}>
                      <rect x="-22" y="-30" width="44" height="60" fill="#ffffff" stroke="#000000" strokeWidth="3" />
                      <line x1="-14" y1="-18" x2="14" y2="-18" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="-14" y1="-8" x2="14" y2="-8" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="-14" y1="2" x2="14" y2="2" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="-14" y1="12" x2="6" y2="12" stroke="#94a3b8" strokeWidth="2" />
                    </g>
                  );
                })}

                {/* Ecstatic Jumping Worker with Arms in Air */}
                <g transform={`translate(0, ${jumpY})`}>
                  <CircleToonCharacter
                    x={620}
                    y={1340}
                    scale={1.55}
                    shirtColor="#1e293b"
                    hasTie={true}
                    hairStyle="boy_brown"
                    eyeStyle="wink"
                    mouthStyle="teeth"
                    subtitles={subtitles}
                  />
                  {/* Party Hat on Head */}
                  <g transform="translate(620, 1160) rotate(15)">
                    <polygon points="0,-70 -30,0 30,0" fill="#facc15" stroke="#000000" strokeWidth="6" />
                    <circle cx="0" cy="-75" r="8" fill="#ef4444" />
                    <circle cx="-10" cy="-25" r="5" fill="#3b82f6" />
                    <circle cx="10" cy="-45" r="5" fill="#10b981" />
                  </g>
                </g>

                {/* Giant Red Rubber Stamp: 95% QUIT! */}
                <g
                  transform={`translate(540, 500) rotate(-8) scale(${springPunch})`}
                  style={{ transformOrigin: "0px 0px" }}
                >
                  <rect x="-260" y="-70" width="520" height="140" rx="18" fill="#fee2e2" stroke="#ef4444" strokeWidth="12" />
                  <text x="0" y="24" textAnchor="middle" fill="#dc2626" fontFamily="'Arial Black', Impact, sans-serif" fontSize="72" fontWeight="900" letterSpacing="-1px">
                    95% QUIT!
                  </text>
                </g>
              </svg>
            );
          })()}
        </div>
      )}

      {/* ================================================================ */}
      {/* SCENE 4: THE GHOST MANSION & SOLD SIGN (430..630, 14.33-21.0s)   */}
      {/* ================================================================ */}
      {currentCut === 4 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
            {/* Sky & Sun */}
            <rect width="1080" height="1920" fill="#7dd3fc" />
            <circle cx="940" cy="280" r="80" fill="#facc15" stroke="#000000" strokeWidth="6" />

            {/* Suburban Street Grass & Pavement */}
            <rect x="0" y="1120" width="1080" height="800" fill="#cbd5e1" stroke="#000000" strokeWidth="8" />
            <rect x="0" y="1040" width="1080" height="90" fill="#86efac" stroke="#000000" strokeWidth="8" />

            {/* 2D Cartoon Mansion */}
            <g transform={`scale(${springEntry})`} style={{ transformOrigin: "540px 900px" }}>
              <rect x="180" y="580" width="720" height="470" fill="#fef08a" stroke="#000000" strokeWidth="10" />
              <polygon points="120,590 540,290 960,590" fill="#ef4444" stroke="#000000" strokeWidth="10" strokeLinejoin="round" />
              <rect x="740" y="330" width="90" height="160" fill="#b91c1c" stroke="#000000" strokeWidth="8" />

              <rect x="250" y="650" width="160" height="150" fill="#bae6fd" stroke="#000000" strokeWidth="8" />
              <line x1="330" y1="650" x2="330" y2="800" stroke="#000000" strokeWidth="6" />
              <line x1="250" y1="725" x2="410" y2="725" stroke="#000000" strokeWidth="6" />

              <rect x="670" y="650" width="160" height="150" fill="#bae6fd" stroke="#000000" strokeWidth="8" />
              <line x1="750" y1="650" x2="750" y2="800" stroke="#000000" strokeWidth="6" />
              <line x1="670" y1="725" x2="830" y2="725" stroke="#000000" strokeWidth="6" />

              <rect x="470" y="810" width="140" height="240" fill="#0284c7" stroke="#000000" strokeWidth="8" />
              <circle cx="585" cy="930" r="10" fill="#facc15" stroke="#000000" strokeWidth="4" />

              {/* Giant Red SOLD Sign with Wooden Post */}
              <g transform="translate(780, 890)">
                <line x1="0" y1="0" x2="0" y2="200" stroke="#78350f" strokeWidth="16" strokeLinecap="round" />
                <g transform="rotate(-6)">
                  <rect x="-110" y="-55" width="220" height="110" rx="10" fill="#dc2626" stroke="#000000" strokeWidth="8" />
                  <polygon points="-30,-55 0,-80 30,-55" fill="#facc15" stroke="#000000" strokeWidth="4" />
                  <text x="0" y="16" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="48" fontWeight="900">
                    SOLD
                  </text>
                </g>
              </g>
            </g>

            {/* Characters: Shocked Grandma & Puzzled Boy */}
            <CircleToonCharacter
              x={390}
              y={1220}
              scale={1.55}
              shirtColor="#a855f7"
              hairStyle="grandma_white"
              eyeStyle="screaming"
              mouthStyle="open_O"
              subtitles={subtitles}
            />
            <CircleToonCharacter
              x={600}
              y={1220}
              scale={1.55}
              shirtColor="#2563eb"
              hairStyle="boy_brown"
              eyeStyle="dots"
              mouthStyle="talk"
              isSpeakingNarrator={true}
              subtitles={subtitles}
            />
          </svg>
        </div>
      )}

      {/* ================================================================ */}
      {/* SCENE 5: HYPERINFLATION GROCERY STORE (630..830, 21.0-27.66s)    */}
      {/* ================================================================ */}
      {currentCut === 5 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
            {/* Supermarket Interior Wall */}
            <rect width="1080" height="1920" fill="#f8fafc" />

            {/* Supermarket Shelves */}
            <rect x="80" y="360" width="920" height="680" fill="#fef08a" stroke="#000000" strokeWidth="10" />
            <line x1="80" y1="580" x2="1000" y2="580" stroke="#000000" strokeWidth="10" />
            <line x1="80" y1="800" x2="1000" y2="800" stroke="#000000" strokeWidth="10" />

            {/* Empty Shelves Stickers */}
            <g transform="translate(300, 500) rotate(-4)">
              <rect x="-80" y="-20" width="160" height="40" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="3" />
              <text x="0" y="7" textAnchor="middle" fill="#dc2626" fontFamily="'Arial Black', sans-serif" fontSize="14" fontWeight="bold">EMPTY</text>
            </g>
            <g transform="translate(780, 500) rotate(5)">
              <rect x="-80" y="-20" width="160" height="40" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="3" />
              <text x="0" y="7" textAnchor="middle" fill="#dc2626" fontFamily="'Arial Black', sans-serif" fontSize="14" fontWeight="bold">SOLD OUT</text>
            </g>

            {/* Lone Loaf of Bread on Center Shelf */}
            <g transform={`translate(540, 750) scale(${springEntry})`}>
              <ellipse cx="0" cy="-30" rx="140" ry="80" fill="#d97706" stroke="#000000" strokeWidth="8" />
              <ellipse cx="0" cy="-30" rx="115" ry="60" fill="#f59e0b" />
              <path d="M -70 -50 Q -50 -10 -30 -50" fill="none" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
              <path d="M -15 -55 Q 0 -15 15 -55" fill="none" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
              <path d="M 35 -50 Q 55 -10 75 -50" fill="none" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />

              {/* Giant Red Price Tag */}
              <g transform="translate(0, 110)">
                <rect x="-190" y="-45" width="380" height="90" rx="16" fill="#dc2626" stroke="#000000" strokeWidth="8" />
                <text x="0" y="16" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', Impact, sans-serif" fontSize="56" fontWeight="900">
                  $50,000!
                </text>
              </g>
            </g>

            {/* Floor */}
            <rect x="0" y="1120" width="1080" height="800" fill="#e2e8f0" stroke="#000000" strokeWidth="8" />

            {/* Abandoned Delivery Truck in Window */}
            <g transform="translate(850, 1260)">
              <rect x="-90" y="-60" width="180" height="100" fill="#cbd5e1" stroke="#000000" strokeWidth="6" />
              <circle cx="-50" cy="40" r="22" fill="#000000" />
              <circle cx="50" cy="40" r="22" fill="#000000" />
              <text x="0" y="-10" textAnchor="middle" fill="#ef4444" fontFamily="'Arial Black', sans-serif" fontSize="14" fontWeight="bold">NO DRIVERS</text>
            </g>

            {/* Main Character in Panic */}
            <CircleToonCharacter
              x={480}
              y={1300}
              scale={1.7}
              shirtColor="#2563eb"
              hairStyle="boy_brown"
              eyeStyle="panic"
              mouthStyle="wavy"
              subtitles={subtitles}
            />
          </svg>
        </div>
      )}

      {/* ================================================================ */}
      {/* SCENE 6: 72 HOURS LATER / CASH IS TRASH (830..930, 27.66-31.0s)  */}
      {/* ================================================================ */}
      {currentCut === 6 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {(() => {
            // Clock/Calendar flip calculation
            const elapsedHours = Math.min(72, Math.floor((f / 60) * 72));

            return (
              <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
                {/* Dark Gritty Alleyway */}
                <rect width="1080" height="1920" fill="#334155" />

                {/* Brick Wall Texture */}
                {[...Array(14)].map((_, r) => (
                  <line
                    key={`brick_${r}`}
                    x1="0"
                    y1={240 + r * 60}
                    x2="1080"
                    y2={240 + r * 60}
                    stroke="#1e293b"
                    strokeWidth="4"
                  />
                ))}

                {/* Animated 72-Hour Flip Clock Widget */}
                <g transform="translate(540, 360)">
                  <rect x="-240" y="-70" width="480" height="140" rx="20" fill="#0f172a" stroke="#000000" strokeWidth="10" />
                  <rect x="-220" y="-50" width="440" height="100" rx="12" fill="#1e293b" />
                  <text x="0" y="24" textAnchor="middle" fill="#facc15" fontFamily="'Arial Black', Impact, sans-serif" fontSize="62" fontWeight="900" letterSpacing="1px">
                    ⏱️ {elapsedHours} HOURS
                  </text>
                </g>

                {/* Sidewalk & Street */}
                <rect x="0" y="1120" width="1080" height="800" fill="#64748b" stroke="#000000" strokeWidth="8" />
                <rect x="0" y="1100" width="1080" height="30" fill="#94a3b8" />

                {/* GIANT DUMPSTER OVERFLOWING WITH CASH */}
                <g transform="translate(360, 960)">
                  {/* Dumpster Body */}
                  <rect x="-240" y="-20" width="480" height="360" rx="12" fill="#15803d" stroke="#000000" strokeWidth="10" />
                  {/* Stencil Label */}
                  <rect x="-180" y="60" width="360" height="60" fill="#166534" />
                  <text x="0" y="104" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', Impact, sans-serif" fontSize="32" fontWeight="900">
                    TRASH / RECYCLE
                  </text>

                  {/* Piles of Cash Overflowing from Rim */}
                  {[
                    { x: -160, y: -60, rot: -15 },
                    { x: -90, y: -90, rot: 10 },
                    { x: 0, y: -110, rot: -5 },
                    { x: 90, y: -80, rot: 25 },
                    { x: 160, y: -50, rot: -20 },
                  ].map((p, i) => (
                    <g key={`pile_${i}`} transform={`translate(${p.x}, ${p.y}) rotate(${p.rot})`}>
                      <rect x="-55" y="-25" width="110" height="50" rx="4" fill="#86efac" stroke="#000000" strokeWidth="4" />
                      <circle cx="0" cy="0" r="14" fill="#15803d" />
                      <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="16" fontWeight="900">
                        $100
                      </text>
                    </g>
                  ))}

                  {/* Cash Sacks with Dollar Signs */}
                  <g transform="translate(-180, 20) rotate(-25)">
                    <circle cx="0" cy="0" r="50" fill="#d97706" stroke="#000000" strokeWidth="6" />
                    <text x="0" y="16" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', sans-serif" fontSize="48" fontWeight="900">$</text>
                  </g>
                </g>

                {/* Stacks of Cash Tumbling Across the Street */}
                {[...Array(14)].map((_, i) => {
                  const billX = ((i * 85 + f * 10) % 1100);
                  const billY = 1260 + (i % 4) * 60;
                  const billRot = Math.sin(f * 0.2 + i) * 45;
                  return (
                    <g key={`trash_bill_${i}`} transform={`translate(${billX}, ${billY}) rotate(${billRot})`}>
                      <rect x="-35" y="-18" width="70" height="36" rx="4" fill="#86efac" stroke="#000000" strokeWidth="3" />
                      <circle cx="0" cy="0" r="8" fill="#15803d" />
                      <text x="0" y="4" textAnchor="middle" fill="#15803d" fontFamily="'Arial Black', sans-serif" fontSize="10" fontWeight="bold">$</text>
                    </g>
                  );
                })}

                {/* Disgusted Character Kicking Money Aside */}
                <CircleToonCharacter
                  x={780}
                  y={1300}
                  scale={1.65}
                  shirtColor="#2563eb"
                  hairStyle="boy_brown"
                  eyeStyle="squint"
                  mouthStyle="wavy"
                  subtitles={subtitles}
                />

                {/* Red Warning Banner: CASH IS WORTHLESS */}
                <g
                  transform={`translate(540, 720) rotate(-4) scale(${springPunch})`}
                  style={{ transformOrigin: "0px 0px" }}
                >
                  <rect x="-260" y="-55" width="520" height="110" rx="16" fill="#dc2626" stroke="#000000" strokeWidth="8" />
                  <text x="0" y="18" textAnchor="middle" fill="#ffffff" fontFamily="'Arial Black', Impact, sans-serif" fontSize="46" fontWeight="900">
                    CASH = $0.00
                  </text>
                </g>
              </svg>
            );
          })()}
        </div>
      )}

      {/* ================================================================ */}
      {/* SCENE 7: ENDLESS FIELD & BARTER ECONOMY (930..1050, 31.0-35.0s)  */}
      {/* ================================================================ */}
      {currentCut === 7 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
            {/* Sky */}
            <rect width="1080" height="1920" fill="#87ceeb" />

            {/* Endless Green Receding Grid Field */}
            <rect x="0" y="800" width="1080" height="1120" fill="#4ade80" stroke="#000000" strokeWidth="8" />

            {/* Perspective Grid Lines */}
            {[...Array(11)].map((_, i) => (
              <line
                key={`grid_v_${i}`}
                x1={540 + (i - 5) * 40}
                y1="800"
                x2={540 + (i - 5) * 280}
                y2="1920"
                stroke="#16a34a"
                strokeWidth="4"
              />
            ))}

            {/* Endless Crowd of Characters on Horizon */}
            {[...Array(8)].map((_, i) => (
              <CircleToonCharacter
                key={`horiz_${i}`}
                x={120 + i * 120}
                y={760}
                scale={0.65}
                shirtColor={i % 2 === 0 ? "#ef4444" : "#3b82f6"}
                hairStyle="boy_brown"
                eyeStyle="squint"
                mouthStyle="smile"
                bounceOffset={i * 0.2}
                subtitles={subtitles}
              />
            ))}

            {/* Mid-Row Characters */}
            {[...Array(5)].map((_, i) => (
              <CircleToonCharacter
                key={`mid_${i}`}
                x={180 + i * 180}
                y={980}
                scale={1.05}
                shirtColor={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#f59e0b" : "#8b5cf6"}
                hairStyle={i % 2 === 0 ? "girl_blonde" : "nerd_black"}
                eyeStyle="dots"
                mouthStyle="smile"
                bounceOffset={i * 0.4}
                subtitles={subtitles}
              />
            ))}

            {/* Foreground Main Character Holding Golden Chocolate Bar */}
            <CircleToonCharacter
              x={380}
              y={1300}
              scale={1.65}
              shirtColor="#2563eb"
              hairStyle="boy_brown"
              eyeStyle="dots"
              mouthStyle="talk"
              isSpeakingNarrator={true}
              holdingProp="chocolate"
              subtitles={subtitles}
            />

            {/* Second Character Holding Cash Bill / Trade Offer */}
            <CircleToonCharacter
              x={720}
              y={1300}
              scale={1.65}
              shirtColor="#dc2626"
              hairStyle="nerd_black"
              eyeStyle="squint"
              mouthStyle="teeth"
              holdingProp="cheque"
              propText="CASH = $0"
              subtitles={subtitles}
            />
          </svg>
        </div>
      )}

      {/* ================================================================ */}
      {/* SCENE 8: THE PARADOX & MIDNIGHT CLOCK LOOP (1050..1233, 35-41.05s)*/}
      {/* ================================================================ */}
      {currentCut === 8 && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none">
            {/* Dark Midnight Wall */}
            <rect width="1080" height="1920" fill="#0f172a" />

            {/* Giant Glowing Cartoon Wall Clock */}
            <g transform={`translate(540, 720) scale(${springEntry})`}>
              <circle cx="0" cy="0" r="280" fill="#f8fafc" stroke="#000000" strokeWidth="14" />
              <circle cx="0" cy="0" r="250" fill="none" stroke="#cbd5e1" strokeWidth="4" />

              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hr, idx) => {
                const angle = (idx / 12) * Math.PI * 2 - Math.PI / 2;
                const nx = Math.cos(angle) * 190;
                const ny = Math.sin(angle) * 190;
                return (
                  <text
                    key={hr}
                    x={nx}
                    y={ny + 14}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontFamily="'Arial Black', sans-serif"
                    fontSize="42"
                    fontWeight="900"
                  >
                    {hr}
                  </text>
                );
              })}

              {/* Hour Hand (Points to 12) */}
              <line x1="0" y1="0" x2="0" y2="-120" stroke="#000000" strokeWidth="14" strokeLinecap="round" />
              {/* Minute Hand (Sweeping to 12) */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-170"
                stroke="#000000"
                strokeWidth="10"
                strokeLinecap="round"
                transform={`rotate(${interpolate(f, [0, totalFrames - 1050], [-25, 0])})`}
              />
              {/* Second Hand (Ticking fast) */}
              <line
                x1="0"
                y1="25"
                x2="0"
                y2="-190"
                stroke="#dc2626"
                strokeWidth="5"
                strokeLinecap="round"
                transform={`rotate(${f * 18})`}
              />
              <circle cx="0" cy="0" r="14" fill="#dc2626" />
            </g>

            {/* Floor */}
            <rect x="0" y="1160" width="1080" height="760" fill="#1e293b" stroke="#000000" strokeWidth="8" />

            {/* Main Character Standing in Center, looking back at clock */}
            <CircleToonCharacter
              x={540}
              y={1320}
              scale={1.75}
              shirtColor="#2563eb"
              hairStyle="boy_brown"
              eyeStyle="dots"
              mouthStyle="talk"
              isSpeakingNarrator={true}
              holdingProp="phone"
              subtitles={subtitles}
            />
          </svg>
        </div>
      )}
    </div>
  );
};
