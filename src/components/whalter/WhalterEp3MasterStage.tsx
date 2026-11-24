import React from "react";
import { useCurrentFrame, useVideoConfig, spring, Img, staticFile } from "remotion";
import { WhalterPuppet } from "./WhalterPuppet";
import { SubtitleWord } from "../../types";

interface WhalterEp3MasterStageProps {
  currentCut: number;
  subtitles?: SubtitleWord[];
  cutStartFrame?: number;
}

/**
 * Pathway A: True 2.5D Storybook Production Stage for Episode #3
 * 
 * Powered by:
 * - High-Resolution 9:16 Illustrated Background Plates (@realwhalter / Ghibli Storybook Standard)
 * - Grounded 2.5D Whalter Puppet Rig with zero stick limbs & anatomically correct poses
 * - Kinetic Comedic Foley & Word-Level Action Timing
 */
export const WhalterEp3MasterStage: React.FC<WhalterEp3MasterStageProps> = ({
  currentCut = 1,
  subtitles = [],
  cutStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - cutStartFrame);

  const springPunch = spring({ frame: f, fps, config: { damping: 9, stiffness: 240 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "1080px",
        height: "1920px",
        overflow: "hidden",
      }}
    >
      {/* =========================================================================
          BEAT 1: DOWNTOWN CITY PLAZA AT SUNSET (Whalter Relaxing with Coffee)
          Background: Rich hand-painted storybook cobblestone plaza & clock tower
          ========================================================================= */}
      {currentCut === 1 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat1_plaza.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* SVG Overlay: Whalter in Foreground Plaza */}
          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <defs>
              <filter id="propShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Whalter Standing on Cobblestone Walkway */}
            <g transform="translate(540, 1150)">
              <WhalterPuppet
                x={0}
                y={0}
                scale={1.45}
                pose="standing_idle"
                mouth="neutral_smile"
                eyes="normal"
                subtitles={subtitles}
              />
              {/* Steaming Coffee Cup in Hand */}
              <g transform="translate(60, 95) rotate(12)" filter="url(#propShadow)">
                <polygon points="-12,-20 12,-20 8,16 -8,16" fill="#f8fafc" stroke="#000000" strokeWidth="3" />
                <rect x="-14" y="-24" width="28" height="6" rx="2" fill="#ef4444" stroke="#000000" strokeWidth="2.5" />
                <polygon points="-11,-8 11,-8 9,8 -9,8" fill="#b45309" />
                <path d="M -4 -30 Q 2 -40 -2 -50" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 4 -32 Q -2 -42 4 -52" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 2: THE MIDNIGHT SLEEP DROP (Clock Strikes 12:00, Whalter Collapses)
          Background: Downtown Plaza at Midnight under Moonlit Sky
          ========================================================================= */}
      {currentCut === 2 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat2_sleep_drop.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <defs>
              <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Pulsing 12:00:00 AM Alert Header (cleanly below top channel header) */}
            <g transform="translate(540, 310)" filter="url(#neonGlow)">
              <rect x="-160" y="-35" width="320" height="70" rx="14" fill="#020617" stroke="#ef4444" strokeWidth="5" />
              <text x="0" y="14" fill="#ef4444" fontSize="38" fontFamily="'Arial Black', Impact" fontWeight="900" textAnchor="middle">
                12:00:00 AM
              </text>
            </g>

            {/* Tumbling Coffee Cup Spilling in Slow Motion */}
            <g transform={`translate(${380 + f * 5}, ${1420 + f * 10}) rotate(${f * 15}) scale(1.3)`}>
              <polygon points="-16,-26 16,-26 12,22 -12,22" fill="#f8fafc" stroke="#000000" strokeWidth="4" />
              <rect x="-18" y="-32" width="36" height="8" rx="3" fill="#ef4444" stroke="#000000" strokeWidth="3" />
              <path d="M 0 -26 Q 30 -50 45 -20 Q 30 10 10 -10 Z" fill="#78350f" stroke="#000000" strokeWidth="3" />
              <circle cx="55" cy="-40" r="7" fill="#78350f" />
              <circle cx="68" cy="-15" r="5" fill="#78350f" />
              <circle cx="40" cy="15" r="6" fill="#78350f" />
            </g>

            {/* Whalter Slumped Asleep Directly on the Park Bench */}
            <g transform="translate(240, 1500) scale(1.35) rotate(-6)">
              <WhalterPuppet
                x={0}
                y={0}
                pose="slumped_bench"
                eyes="closed_peaceful"
                mouth="snore_mouth"
                showSnoreBubbles={true}
              />
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 3: HIGHWAY TRAFFIC DRIFT & CRASH (Cinematic First-Person Cockpit View)
          Background: Multi-lane metropolitan highway at night
          ========================================================================= */}
      {currentCut === 3 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat3_traffic.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            {/* Windshield A-Pillars Framing the Highway */}
            <path d="M 0 0 L 140 0 L 100 1920 L 0 1920 Z" fill="#0f172a" />
            <path d="M 940 0 L 1080 0 L 1080 1920 L 980 1920 Z" fill="#0f172a" />
            {/* Top Windshield Tint Strip & Rearview Mirror */}
            <rect x="0" y="0" width="1080" height="180" fill="rgba(15, 23, 42, 0.45)" />
            <g transform="translate(540, 160)">
              <rect x="-14" y="-80" width="28" height="60" fill="#1e293b" />
              <rect x="-110" y="-20" width="220" height="70" rx="14" fill="#020617" stroke="#334155" strokeWidth="6" />
              <rect x="-100" y="-12" width="200" height="54" rx="8" fill="#1e3a8a" opacity="0.6" />
            </g>

            {/* Pulsing Comic HONK Rings */}
            <g transform="translate(540, 1420)">
              <circle cx="0" cy="0" r={80 + (f % 18) * 8} fill="none" stroke="#facc15" strokeWidth={6 - (f % 18) * 0.3} opacity={1 - (f % 18) / 18} />
              <circle cx="0" cy="0" r={50 + (f % 12) * 6} fill="none" stroke="#ef4444" strokeWidth={4 - (f % 12) * 0.3} opacity={1 - (f % 12) / 12} />
            </g>

            {/* Car Dashboard Base */}
            <path
              d="M 0 1380 Q 540 1310 1080 1380 L 1080 1920 L 0 1920 Z"
              fill="#0f172a"
              stroke="#020617"
              strokeWidth="10"
            />
            {/* Dashboard Trim & A/C Vents */}
            <path d="M 80 1420 Q 540 1360 1000 1420" fill="none" stroke="#334155" strokeWidth="6" />
            <rect x="200" y="1460" width="120" height="45" rx="10" fill="#020617" stroke="#1e293b" strokeWidth="4" />
            <rect x="760" y="1460" width="120" height="45" rx="10" fill="#020617" stroke="#1e293b" strokeWidth="4" />
            {/* Flashing Hazard Light Button */}
            <g transform="translate(540, 1435)">
              <rect x="-35" y="-18" width="70" height="36" rx="8" fill={f % 14 < 7 ? "#ef4444" : "#450a0a"} stroke="#000000" strokeWidth="3" />
              <polygon points="0,-10 -12,8 12,8" fill="#ffffff" />
            </g>

            {/* Large Steering Wheel with Whalter Slumped Asleep on Horn */}
            <g transform="translate(540, 1560)">
              {/* Outer Steering Wheel Rim */}
              <circle cx="0" cy="0" r="230" fill="none" stroke="#1e293b" strokeWidth="38" />
              <circle cx="0" cy="0" r="230" fill="none" stroke="#000000" strokeWidth="6" />
              {/* Steering Spokes */}
              <rect x="-225" y="-14" width="450" height="28" fill="#334155" />
              <rect x="-18" y="0" width="36" height="225" fill="#334155" />
              {/* Center Horn Pad */}
              <circle cx="0" cy="0" r="82" fill="#020617" stroke="#1e293b" strokeWidth="8" />

              {/* Whalter Slumped Forward on Wheel Pad */}
              <g transform="translate(0, -90) scale(1.35)">
                <WhalterPuppet
                  x={0}
                  y={0}
                  pose="slumped_steering_wheel"
                  eyes="closed_peaceful"
                  mouth="snore_mouth"
                  showSnoreBubbles={true}
                />
              </g>

              {/* Comic HONKKKK Label */}
              <g transform="translate(0, 140)">
                <text x="0" y="0" fill="#ef4444" fontSize="42" fontFamily="'Arial Black', Impact" fontWeight="900" textAnchor="middle" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.8))">
                  HONK! HONK!
                </text>
              </g>
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 4: COMMERCIAL AIRLINER COCKPIT (Whalter Co-Pilot Asleep at 30,000 FT)
          Background: High-res painted cockpit with starry sky and illuminated avionics
          ========================================================================= */}
      {currentCut === 4 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat4_cockpit.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="hudPlateGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.45)" />
                <stop offset="100%" stopColor="rgba(6, 78, 59, 0.65)" />
              </linearGradient>
            </defs>

            {/* Central Holographic HUD Combiner Screen (positioned cleanly in upper windshield) */}
            <g transform="translate(540, 440)">
              <rect x="-240" y="-60" width="480" height="120" rx="18" fill="url(#hudPlateGlow)" stroke="#10b981" strokeWidth="6" />
              <text x="0" y="-10" fill="#34d399" fontSize="28" fontFamily="'Arial Black'" fontWeight="900" textAnchor="middle">
                AUTOPILOT ENGAGED
              </text>
              <text x="0" y="26" fill="#a7f3d0" fontSize="18" fontFamily="sans-serif" fontWeight="800" textAnchor="middle">
                ALT: 30,000 FT • FUEL: 6.2 HRS REMAINING
              </text>
            </g>

            {/* Whalter Co-Pilot Asleep in Right Captain Seat with Headset & Nightcap */}
            <g transform="translate(870, 1220) scale(1.4)">
              <WhalterPuppet
                x={0}
                y={0}
                pose="sitting_cockpit"
                eyes="closed_peaceful"
                mouth="snore_mouth"
                headwear="headset_nightcap"
                showSnoreBubbles={true}
              />
            </g>

            {/* Captain on Left Seat Asleep */}
            <g transform="translate(210, 1220) scale(1.4)">
              <WhalterPuppet
                x={0}
                y={0}
                flipX={true}
                shirtColor="#0f172a"
                pose="sitting_cockpit"
                eyes="closed_peaceful"
                mouth="snore_mouth"
                headwear="headset"
                showSnoreBubbles={true}
              />
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 5: NUCLEAR POWER PLANT CONTROL ROOM SCRAM
          Background: Industrial control room with observation window overlooking reactor core
          ========================================================================= */}
      {currentCut === 5 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat5_nuclear.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            {/* Status Header (cleanly below top channel header) */}
            <g transform="translate(540, 320)">
              <rect x="-240" y="-30" width="480" height="60" rx="12" fill="#065f46" stroke="#10b981" strokeWidth="5" />
              <text x="0" y="10" fill="#34d399" fontSize="24" fontFamily="'Arial Black'" fontWeight="900" textAnchor="middle">
                REACTOR #4: AUTO-SCRAM ACTIVE
              </text>
            </g>

            {/* Whalter Operator Fast Asleep on Console Desk */}
            <g transform="translate(680, 1380) scale(1.4)">
              <WhalterPuppet
                x={0}
                y={0}
                pose="slumped_bench"
                eyes="closed_peaceful"
                mouth="snore_mouth"
                showSnoreBubbles={true}
              />
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 6: CONTINENTAL GRID BLACKOUT (Skyline Windows Click Dark)
          Background: Towering city skyline plunged into blackness under Milky Way
          ========================================================================= */}
      {currentCut === 6 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat6_blackout.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* =========================================================================
          BEAT 7: PITCH-BLACK ROOM & WHALTER'S PANIC BLINK
          Total darkness with expressive glowing cartoon eyes
          ========================================================================= */}
      {currentCut === 7 && (
        <div style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#000000" }}>
          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <g transform="translate(540, 960) scale(2.4)">
              {/* Flying panic sweat drops */}
              <circle cx="35" cy="-20" r="4" fill="#38bdf8" />
              <circle cx="-35" cy="-15" r="3.5" fill="#38bdf8" />

              {/* Expressive White Eyeballs Blinking in Fear */}
              {f % 40 < 4 ? (
                <g>
                  <line x1="-25" y1="0" x2="-5" y2="0" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                  <line x1="5" y1="0" x2="25" y2="0" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                </g>
              ) : (
                <g>
                  <ellipse cx="-16" cy="0" rx="14" ry="18" fill="#ffffff" stroke="#38bdf8" strokeWidth="3" />
                  <ellipse cx="16" cy="0" rx="14" ry="18" fill="#ffffff" stroke="#38bdf8" strokeWidth="3" />
                  <circle cx={-16 + Math.sin(f * 0.3) * 5} cy="0" r="6" fill="#000000" />
                  <circle cx={16 + Math.sin(f * 0.3) * 5} cy="0" r="6" fill="#000000" />
                  <circle cx={-14 + Math.sin(f * 0.3) * 5} cy="-3" r="2" fill="#ffffff" />
                  <circle cx={18 + Math.sin(f * 0.3) * 5} cy="-3" r="2" fill="#ffffff" />
                </g>
              )}
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 8: NATURE RECLAIMS THE HIGHWAY (Deer Sniffing Sleeping Whalter's Shoe)
          Background: Serene overgrown boulevard with weeping willows & sunbeams
          ========================================================================= */}
      {currentCut === 8 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat8_overgrown.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="deerBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="60%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <radialGradient id="deerShadow">
                <stop offset="0%" stopColor="rgba(15, 23, 42, 0.6)" />
                <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
              </radialGradient>
            </defs>

            {/* Whalter Sleeping on the Grass Curb */}
            <g transform="translate(660, 1380) scale(1.4)">
              <WhalterPuppet
                x={0}
                y={0}
                pose="slumped_bench"
                eyes="closed_peaceful"
                mouth="snore_mouth"
                showSnoreBubbles={true}
              />
            </g>

            {/* Illustrated Storybook Cartoon Deer Sniffing Whalter's Shoe */}
            <g transform={`translate(${380 + Math.sin(f * 0.05) * 10}, 1280) scale(1.25)`}>
              {/* Ground Contact Shadow */}
              <ellipse cx="60" cy="180" rx="120" ry="24" fill="url(#deerShadow)" />

              {/* Hind Legs */}
              <path d="M -40 60 Q -55 110 -45 175 L -30 175 Q -38 120 -25 70 Z" fill="#78350f" stroke="#000000" strokeWidth="5" />
              <rect x="-47" y="168" width="18" height="10" rx="3" fill="#1e293b" />
              <path d="M -20 60 Q -35 110 -25 175 L -10 175 Q -18 120 -5 70 Z" fill="#92400e" stroke="#000000" strokeWidth="5" />
              <rect x="-27" y="168" width="18" height="10" rx="3" fill="#1e293b" />

              {/* Fawn Body */}
              <ellipse cx="20" cy="50" rx="85" ry="52" fill="url(#deerBodyGrad)" stroke="#000000" strokeWidth="6" />
              {/* White Fluffy Underbelly */}
              <path d="M -30 75 Q 20 95 65 70 Q 20 65 -30 75 Z" fill="#f8fafc" />
              {/* White Dappled Spots on Back */}
              <circle cx="-10" cy="25" r="5" fill="#fef3c7" opacity="0.9" />
              <circle cx="15" cy="20" r="6" fill="#fef3c7" opacity="0.9" />
              <circle cx="40" cy="30" r="5" fill="#fef3c7" opacity="0.9" />
              <circle cx="0" cy="42" r="4.5" fill="#fef3c7" opacity="0.9" />
              <circle cx="25" cy="46" r="4.5" fill="#fef3c7" opacity="0.9" />

              {/* Little Fluffy White Tail */}
              <ellipse cx="-75" cy="25" rx="16" ry="12" fill="#ffffff" stroke="#000000" strokeWidth="4" />

              {/* Forelegs */}
              <path d="M 60 70 L 68 175 L 82 175 L 80 70 Z" fill="#78350f" stroke="#000000" strokeWidth="5" />
              <rect x="67" y="168" width="16" height="10" rx="3" fill="#1e293b" />
              <path d="M 85 70 L 95 175 L 110 175 L 105 70 Z" fill="#92400e" stroke="#000000" strokeWidth="5" />
              <rect x="94" y="168" width="16" height="10" rx="3" fill="#1e293b" />

              {/* Neck & Head Bent Down Sniffing */}
              <g transform="translate(85, 40) rotate(24)">
                {/* Neck */}
                <path d="M -10 -25 L 50 35 L 35 65 L -20 10 Z" fill="url(#deerBodyGrad)" stroke="#000000" strokeWidth="6" />
                {/* Head */}
                <path d="M 30 20 Q 80 45 90 70 Q 70 85 45 70 Q 25 50 30 20 Z" fill="url(#deerBodyGrad)" stroke="#000000" strokeWidth="6" />
                {/* Muzzle & Nose */}
                <ellipse cx="82" cy="72" rx="14" ry="11" fill="#fef3c7" stroke="#000000" strokeWidth="3" />
                <circle cx="86" cy="75" r="5" fill="#0f172a" />
                {/* Closed Peaceful Eye */}
                <path d="M 52 42 Q 60 48 68 42" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
                {/* Cute Ear */}
                <ellipse cx="25" cy="15" rx="18" ry="9" fill="#b45309" stroke="#000000" strokeWidth="4" transform="rotate(-30 25 15)" />
                <ellipse cx="25" cy="15" rx="12" ry="5" fill="#fca5a5" transform="rotate(-30 25 15)" />
                {/* Stylized Little Antlers */}
                <path d="M 32 10 L 38 -20 M 36 -8 L 48 -14 M 38 -20 L 30 -30 M 38 -20 L 46 -30" fill="none" stroke="#451a03" strokeWidth="5" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 9: COZY BEDROOM ON DAY 7 (Whalter Wakes Up: 168 Missed Calls)
          Background: High-res painted bedroom with morning sunlight streaming in
          ========================================================================= */}
      {currentCut === 9 && (
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <Img
            src={staticFile("backgrounds/ep3_beat9_bedroom.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <defs>
              <filter id="phoneShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#020617" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Whalter Bolting Upright in Bed (Sitting squarely in the bed on white mattress!) */}
            <g transform="translate(810, 1160)">
              <WhalterPuppet
                x={0}
                y={0}
                scale={1.45}
                pose="waking_up"
                eyes="shock_wide"
                mouth="dropped_jaw"
              />
            </g>

            {/* Smartphone in Whalter's Hand: 168 MISSED CALLS */}
            <g transform={`translate(630, 960) scale(${springPunch * 1.05}) rotate(-8)`} filter="url(#phoneShadow)">
              <rect x="-85" y="-140" width="170" height="280" rx="24" fill="#0f172a" stroke="#000000" strokeWidth="10" />
              <rect x="-72" y="-120" width="144" height="240" rx="14" fill="#ef4444" />
              <text x="0" y="-40" fill="#ffffff" fontSize="48" fontFamily="'Arial Black'" fontWeight="900" textAnchor="middle">
                168
              </text>
              <text x="0" y="0" fill="#fecaca" fontSize="16" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
                MISSED CALLS
              </text>
              <rect x="-60" y="30" width="120" height="35" rx="8" fill="#ffffff" />
              <text x="0" y="54" fill="#dc2626" fontSize="14" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
                OCTOBER 7
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* =========================================================================
          BEAT 10: 4TH-WALL QUESTION & SURVIVAL PLAN CALLOUT
          Studio stage with spotlight on Whalter & comic speech bubble
          ========================================================================= */}
      {currentCut === 10 && (
        <div style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#0f172a" }}>
          <svg viewBox="0 0 1080 1920" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <defs>
              <radialGradient id="stageSpotlight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#334155" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
              </radialGradient>
            </defs>

            <circle cx="540" cy="980" r="500" fill="url(#stageSpotlight)" />

            {/* Whalter Looking Directly at Camera */}
            <g transform="translate(540, 1040)">
              <WhalterPuppet
                x={0}
                y={0}
                scale={1.55}
                pose="look_camera"
                eyes="glance_camera"
                mouth="talking_cycle"
                subtitles={subtitles}
              />
            </g>

            {/* Yellow Comic Speech Bubble */}
            <g transform={`translate(540, 580) scale(${springPunch * 1.25})`}>
              <rect x="-330" y="-80" width="660" height="160" rx="32" fill="#facc15" stroke="#000000" strokeWidth="12" />
              <polygon points="-20,80 20,80 0,130" fill="#facc15" stroke="#000000" strokeWidth="12" />
              <rect x="-10" y="70" width="20" height="15" fill="#facc15" />
              <text x="0" y="-12" fill="#000000" fontSize="32" fontFamily="'Arial Black', Impact" fontWeight="900" textAnchor="middle">
                I'D SLEEP FOR A MONTH! 😴
              </text>
              <text x="0" y="38" fill="#1e293b" fontSize="24" fontFamily="sans-serif" fontWeight="800" textAnchor="middle">
                WHAT WOULD YOU DO? DROP IT 👇
              </text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};
