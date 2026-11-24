import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export type RoomEnvironmentType =
  | 'bedroom_dark'
  | 'kitchen_morning'
  | 'office_desk'
  | 'ancient_palace'
  | 'temple_vault'
  | 'modern_finance'
  | 'abstract_pop'
  | 'chaupar_board_arena'
  | 'durbar_throne_room'
  | 'subterranean_dungeon_vault'
  | 'puppet_stage_shadow';

export interface RoomEnvironmentProps {
  type: RoomEnvironmentType;
  accentColor?: string;
  children?: React.ReactNode;
}

export const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({
  type = 'bedroom_dark',
  accentColor = '#EF4444',
  children,
}) => {
  const frame = useCurrentFrame();
  const renderBackgroundPlate = () => {
    switch (type) {
      case 'bedroom_dark':
        return (
          <>
            {/* Deep Midnight Blue/Indigo Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 30%, #1E1B4B 0%, #0F172A 70%, #020617 100%)',
              }}
            />

            {/* Subtle Ethereal Moonbeam from top right window */}
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Bedroom Window Frame (Top Right) */}
              <rect x="750" y="200" width="240" height="340" rx="16" fill="#1E293B" stroke="#000000" strokeWidth="12" />
              <rect x="765" y="215" width="100" height="145" fill="#38BDF8" opacity="0.25" />
              <rect x="875" y="215" width="100" height="145" fill="#38BDF8" opacity="0.25" />
              <rect x="765" y="375" width="100" height="150" fill="#38BDF8" opacity="0.25" />
              <rect x="875" y="375" width="100" height="150" fill="#38BDF8" opacity="0.25" />

              {/* Angled Moonbeam Cast */}
              <polygon points="750,540 990,540 450,1500 200,1500" fill="#38BDF8" opacity="0.06" />

              {/* Floor Perspective Horizon Line (Y = 1350) */}
              <line x1="0" y1="1350" x2="1080" y2="1350" stroke="#000000" strokeWidth="10" />
              {/* Floor Base */}
              <rect x="0" y="1350" width="1080" height="570" fill="#0B0F19" />
              {/* Floor Planks Perspective Lines */}
              <line x1="200" y1="1350" x2="50" y2="1920" stroke="#1E293B" strokeWidth="6" />
              <line x1="540" y1="1350" x2="540" y2="1920" stroke="#1E293B" strokeWidth="6" />
              <line x1="880" y1="1350" x2="1030" y2="1920" stroke="#1E293B" strokeWidth="6" />
            </svg>
          </>
        );

      case 'kitchen_morning':
        return (
          <>
            {/* Cold Morning Slate Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 60%, #CBD5E1 100%)',
              }}
            />

            {/* Kitchen Tiles & Counter */}
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Subway Tile Grid (Upper Wall) */}
              <defs>
                <pattern id="kitchenTiles" width="120" height="60" patternUnits="userSpaceOnUse">
                  <rect width="120" height="60" fill="none" stroke="#94A3B8" strokeWidth="3" opacity="0.4" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="1080" height="1250" fill="url(#kitchenTiles)" />

              {/* Kitchen Counter Horizon (Y = 1250) */}
              <rect x="0" y="1250" width="1080" height="670" fill="#334155" stroke="#000000" strokeWidth="12" />
              {/* Counter Bevel Highlight */}
              <rect x="0" y="1250" width="1080" height="30" fill="#475569" />
            </svg>
          </>
        );

      case 'office_desk':
        return (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, #1E1B4B 0%, #1E293B 65%, #0F172A 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Subtle Minimal Architectural Frame */}
              <rect x="100" y="240" width="180" height="260" rx="14" fill="#0F172A" stroke="#000000" strokeWidth="8" />
              <rect x="115" y="255" width="150" height="230" fill="#3B82F6" opacity="0.25" />
              <line x1="130" y1="370" x2="250" y2="370" stroke="#38BDF8" strokeWidth="6" opacity="0.4" />

              {/* Wall Accent Horizon Line */}
              <line x1="0" y1="1200" x2="1080" y2="1200" stroke="#000000" strokeWidth="14" />

              {/* Grounded Desk Surface (Warm Modern Corporate Slate) */}
              <rect x="0" y="1200" width="1080" height="720" fill="#334155" />
              {/* Desk Bevel Edge */}
              <rect x="0" y="1200" width="1080" height="28" fill="#475569" stroke="#000000" strokeWidth="4" />

              {/* Giant Executive Desk Mat / Pad */}
              <rect x="140" y="1230" width="800" height="400" rx="24" fill="#1E293B" stroke="#000000" strokeWidth="8" />

              {/* Stylized Mechanical Keyboard & Mouse on Mat */}
              <rect x="220" y="1300" width="380" height="130" rx="16" fill="#0F172A" stroke="#000000" strokeWidth="8" />
              <rect x="240" y="1320" width="340" height="90" rx="8" fill="#38BDF8" opacity="0.25" />
              {/* Wireless Mouse */}
              <ellipse cx="680" cy="1365" rx="35" ry="55" fill="#0F172A" stroke="#000000" strokeWidth="8" />
              <circle cx="680" cy="1335" r="5" fill="#EF4444" />

              {/* Dynamic Screen Glow Horizon */}
              <ellipse cx="540" cy="1200" rx="450" ry="90" fill="#38BDF8" opacity="0.18" />
            </svg>
          </>
        );

      case 'ancient_palace':
        return (
          <>
            {/* Regal Saffron & Terracotta Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, #451A03 0%, #78350F 50%, #B45309 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Palace Archway Silhouette (Top) */}
              <path
                d="M 120 0 L 120 280 Q 540 180 960 280 L 960 0 Z"
                fill="#291203"
                stroke="#000000"
                strokeWidth="12"
              />
              {/* Left Monolithic Carved Pillar - Pushed to margin to avoid actor clip */}
              <rect x="15" y="220" width="85" height="1000" rx="10" fill="#78350F" stroke="#000000" strokeWidth="12" />
              <rect x="5" y="200" width="105" height="40" rx="8" fill="#92400E" stroke="#000000" strokeWidth="8" />
              <rect x="5" y="1180" width="105" height="40" rx="8" fill="#92400E" stroke="#000000" strokeWidth="8" />
              {/* Left Wall Torch with Warm Golden Glow */}
              <polygon points="57,520 45,580 69,580" fill="#000000" />
              <circle cx="57" cy="500" r="40" fill="#FEF08A" opacity="0.3" />
              <path d="M 57 470 Q 70 500 57 520 Q 44 500 57 470 Z" fill="#F97316" stroke="#000000" strokeWidth="5" />

              {/* Right Monolithic Carved Pillar - Pushed to margin */}
              <rect x="980" y="220" width="85" height="1000" rx="10" fill="#78350F" stroke="#000000" strokeWidth="12" />
              <rect x="970" y="200" width="105" height="40" rx="8" fill="#92400E" stroke="#000000" strokeWidth="8" />
              <rect x="970" y="1180" width="105" height="40" rx="8" fill="#92400E" stroke="#000000" strokeWidth="8" />
              {/* Right Wall Torch */}
              <polygon points="1022,520 1010,580 1034,580" fill="#000000" />
              <circle cx="1022" cy="500" r="40" fill="#FEF08A" opacity="0.3" />
              <path d="M 1022 470 Q 1035 500 1022 520 Q 1009 500 1022 470 Z" fill="#F97316" stroke="#000000" strokeWidth="5" />

              {/* Floor Horizon Line (Y = 1220) */}
              <line x1="0" y1="1220" x2="1080" y2="1220" stroke="#000000" strokeWidth="14" />
              {/* Stone Floor Foundation */}
              <rect x="0" y="1220" width="1080" height="700" fill="#1C1917" />
              {/* Royal Crimson Runner Rug */}
              <polygon points="260,1220 820,1220 980,1920 100,1920" fill="#991B1B" stroke="#000000" strokeWidth="10" />
              {/* Golden Rug Border Trim */}
              <line x1="280" y1="1220" x2="140" y2="1920" stroke="#FACC15" strokeWidth="8" />
              <line x1="800" y1="1220" x2="940" y2="1920" stroke="#FACC15" strokeWidth="8" />
            </svg>
          </>
        );

      case 'temple_vault':
        return (
          <>
            {/* Ancient Subterranean Granite Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 40%, #0F172A 0%, #020617 75%, #000000 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Massive Stone Blocks Pattern (Wall Texture) */}
              <line x1="0" y1="340" x2="1080" y2="340" stroke="#1E293B" strokeWidth="4" />
              <line x1="0" y1="620" x2="1080" y2="620" stroke="#1E293B" strokeWidth="4" />
              <line x1="0" y1="900" x2="1080" y2="900" stroke="#1E293B" strokeWidth="4" />
              <line x1="280" y1="340" x2="280" y2="620" stroke="#1E293B" strokeWidth="4" />
              <line x1="800" y1="340" x2="800" y2="620" stroke="#1E293B" strokeWidth="4" />
              <line x1="540" y1="620" x2="540" y2="900" stroke="#1E293B" strokeWidth="4" />

              {/* Heavy Stone Vault Archway Framing Top */}
              <path
                d="M 140 0 L 140 320 Q 540 180 940 320 L 940 0 Z"
                fill="#0F172A"
                stroke="#000000"
                strokeWidth="12"
              />

              {/* Mystical Naga / Serpent Pillar Left */}
              <rect x="70" y="320" width="80" height="900" rx="10" fill="#0F172A" stroke="#000000" strokeWidth="10" />
              <path d="M 110 400 Q 140 500 110 600 Q 80 700 110 800" stroke="#059669" strokeWidth="14" fill="none" opacity="0.6" />

              {/* Mystical Naga / Serpent Pillar Right */}
              <rect x="930" y="320" width="80" height="900" rx="10" fill="#0F172A" stroke="#000000" strokeWidth="10" />
              <path d="M 970 400 Q 940 500 970 600 Q 1000 700 970 800" stroke="#059669" strokeWidth="14" fill="none" opacity="0.6" />

              {/* Floor Horizon Line (Y = 1220) */}
              <line x1="0" y1="1220" x2="1080" y2="1220" stroke="#000000" strokeWidth="14" />
              {/* Granite Flagstone Floor */}
              <rect x="0" y="1220" width="1080" height="700" fill="#090D16" />
              <line x1="240" y1="1220" x2="100" y2="1920" stroke="#1E293B" strokeWidth="8" />
              <line x1="540" y1="1220" x2="540" y2="1920" stroke="#1E293B" strokeWidth="8" />
              <line x1="840" y1="1220" x2="980" y2="1920" stroke="#1E293B" strokeWidth="8" />

              {/* Mysterious Golden Center Floor Glow */}
              <ellipse cx="540" cy="1220" rx="380" ry="80" fill="#F59E0B" opacity="0.12" />
            </svg>
          </>
        );

      case 'modern_finance':
        return (
          <>
            {/* Obsidian Dark Mode Finance Slate */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, #030712 0%, #0B0F19 60%, #111827 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Candlestick Watermark Charts (Background Atmosphere) */}
              <g opacity="0.15">
                {/* Bullish Green Candles */}
                <line x1="220" y1="300" x2="220" y2="600" stroke="#10B981" strokeWidth="6" />
                <rect x="200" y="380" width="40" height="140" fill="#10B981" rx="4" />
                <line x1="360" y1="240" x2="360" y2="520" stroke="#10B981" strokeWidth="6" />
                <rect x="340" y="300" width="40" height="160" fill="#10B981" rx="4" />

                {/* Bearish Red Crash Candles */}
                <line x1="580" y1="350" x2="580" y2="750" stroke="#EF4444" strokeWidth="6" />
                <rect x="560" y="420" width="40" height="240" fill="#EF4444" rx="4" />
                <line x1="720" y1="500" x2="720" y2="880" stroke="#EF4444" strokeWidth="6" />
                <rect x="700" y="580" width="40" height="220" fill="#EF4444" rx="4" />
              </g>

              {/* Grid Horizon Line (Y = 1220) */}
              <line x1="0" y1="1220" x2="1080" y2="1220" stroke="#38BDF8" strokeWidth="6" opacity="0.5" />
              <rect x="0" y="1220" width="1080" height="700" fill="#030712" />

              {/* Cyber Matrix Floor Perspective Grid */}
              <line x1="180" y1="1220" x2="0" y2="1920" stroke="#1E293B" strokeWidth="5" />
              <line x1="360" y1="1220" x2="220" y2="1920" stroke="#1E293B" strokeWidth="5" />
              <line x1="540" y1="1220" x2="540" y2="1920" stroke="#1E293B" strokeWidth="5" />
              <line x1="720" y1="1220" x2="860" y2="1920" stroke="#1E293B" strokeWidth="5" />
              <line x1="900" y1="1220" x2="1080" y2="1920" stroke="#1E293B" strokeWidth="5" />
              <line x1="0" y1="1400" x2="1080" y2="1400" stroke="#1E293B" strokeWidth="4" />
              <line x1="0" y1="1620" x2="1080" y2="1620" stroke="#1E293B" strokeWidth="4" />
            </svg>
          </>
        );

      case 'abstract_pop':
      default:
        return (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#FAF7F0',
              }}
            />
            {/* Pop Comic Halftone Dots */}
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              <defs>
                <pattern id="popDots" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="4" fill="#000000" opacity="0.08" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="1080" height="1920" fill="url(#popDots)" />
              {/* Bold Stage Floor */}
              <line x1="0" y1="1300" x2="1080" y2="1300" stroke="#000000" strokeWidth="12" />
              <rect x="0" y="1300" width="1080" height="620" fill="#FEF08A" />
            </svg>
          </>
        );

      case 'chaupar_board_arena':
        return (
          <>
            {/* Dramatic Royal Crimson & Saffron Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 35%, #7C2D12 0%, #451A03 60%, #1C1917 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Grand Durbar Pillar Silhouettes at Outer Margins */}
              <rect x="15" y="100" width="85" height="1120" rx="12" fill="#78350F" stroke="#000000" strokeWidth="12" />
              <rect x="980" y="100" width="85" height="1120" rx="12" fill="#78350F" stroke="#000000" strokeWidth="12" />

              {/* Overhead Hanging Brass Oil Lamps */}
              <line x1="540" y1="0" x2="540" y2="280" stroke="#F59E0B" strokeWidth="6" />
              <circle cx="540" cy="300" r="32" fill="#D97706" stroke="#000000" strokeWidth="8" />
              <circle cx="540" cy="300" r="18" fill="#FDE047" />
              <circle cx="540" cy="300" r="80" fill="#F59E0B" opacity="0.18" />

              {/* Floor Horizon Line (Y = 1220) */}
              <line x1="0" y1="1220" x2="1080" y2="1220" stroke="#000000" strokeWidth="14" />
              <rect x="0" y="1220" width="1080" height="700" fill="#0C0A09" />

              {/* Ancient Chaupar Gaming Mat (Cross Pattern with Golden Border) */}
              <polygon points="340,1220 740,1220 920,1920 160,1920" fill="#991B1B" stroke="#000000" strokeWidth="12" />
              {/* Chaupar Golden Arm Crosslines */}
              <line x1="540" y1="1220" x2="540" y2="1920" stroke="#FACC15" strokeWidth="8" />
              <line x1="280" y1="1520" x2="800" y2="1520" stroke="#FACC15" strokeWidth="6" />
              <line x1="220" y1="1720" x2="860" y2="1720" stroke="#FACC15" strokeWidth="6" />
              {/* Center Home Square (Charkoni) */}
              <polygon points="500,1470 580,1470 600,1570 480,1570" fill="#DC2626" stroke="#FACC15" strokeWidth="6" />
            </svg>
          </>
        );

      case 'durbar_throne_room':
        return (
          <>
            {/* Grand Imperial Durbar Saffron Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, #581C87 0%, #3B0764 45%, #1E1B4B 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Royal Golden Archway (Jharokha Silhouette) */}
              <path
                d="M 100 0 L 100 240 Q 320 140 540 220 Q 760 140 980 240 L 980 0 Z"
                fill="#2E1065"
                stroke="#000000"
                strokeWidth="12"
              />
              <path
                d="M 120 0 L 120 220 Q 320 125 540 200 Q 760 125 960 220 L 960 0 Z"
                fill="none"
                stroke="#FACC15"
                strokeWidth="6"
              />

              {/* Royal Chhatri (Golden Parasol / Throne Canopy) in Background */}
              <path
                d="M 380 440 Q 540 320 700 440 Z"
                fill="#F59E0B"
                stroke="#000000"
                strokeWidth="10"
              />
              <line x1="540" y1="320" x2="540" y2="270" stroke="#FACC15" strokeWidth="8" />
              <polygon points="530,270 540,240 550,270" fill="#FACC15" stroke="#000000" strokeWidth="4" />

              {/* Flanking Ornate Pillars with Royal Violet Banners */}
              <rect x="20" y="200" width="80" height="1020" rx="10" fill="#6B21A8" stroke="#000000" strokeWidth="12" />
              <rect x="980" y="200" width="80" height="1020" rx="10" fill="#6B21A8" stroke="#000000" strokeWidth="12" />

              {/* Floor Horizon Line (Y = 1220) */}
              <line x1="0" y1="1220" x2="1080" y2="1220" stroke="#000000" strokeWidth="14" />
              {/* Regal Polished Marble Floor */}
              <rect x="0" y="1220" width="1080" height="700" fill="#0F172A" />
              {/* Imperial Gold Runway */}
              <polygon points="300,1220 780,1220 940,1920 140,1920" fill="#F59E0B" stroke="#000000" strokeWidth="10" />
              <polygon points="330,1220 750,1220 890,1920 190,1920" fill="#FDE047" />
            </svg>
          </>
        );

      case 'subterranean_dungeon_vault':
        return (
          <>
            {/* Dark Cold Granite & Torches (Subterranean Conspiracy) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 40%, #064E3B 0%, #022C22 50%, #020617 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Stone Dungeon Blocks */}
              <line x1="0" y1="300" x2="1080" y2="300" stroke="#047857" strokeWidth="3" opacity="0.4" />
              <line x1="0" y1="600" x2="1080" y2="600" stroke="#047857" strokeWidth="3" opacity="0.4" />
              <line x1="0" y1="900" x2="1080" y2="900" stroke="#047857" strokeWidth="3" opacity="0.4" />
              <line x1="320" y1="300" x2="320" y2="600" stroke="#047857" strokeWidth="3" opacity="0.4" />
              <line x1="760" y1="300" x2="760" y2="600" stroke="#047857" strokeWidth="3" opacity="0.4" />
              <line x1="540" y1="600" x2="540" y2="900" stroke="#047857" strokeWidth="3" opacity="0.4" />

              {/* Hanging Iron Chains from Ceiling */}
              <line x1="220" y1="0" x2="220" y2="380" stroke="#000000" strokeWidth="8" strokeDasharray="16 8" />
              <line x1="860" y1="0" x2="860" y2="380" stroke="#000000" strokeWidth="8" strokeDasharray="16 8" />

              {/* Left & Right Glowing Green/Teal Braziers */}
              <circle cx="220" cy="400" r="50" fill="#10B981" opacity="0.25" />
              <circle cx="220" cy="400" r="20" fill="#34D399" />
              <circle cx="860" cy="400" r="50" fill="#10B981" opacity="0.25" />
              <circle cx="860" cy="400" r="20" fill="#34D399" />

              {/* Floor Horizon Line (Y = 1220) */}
              <line x1="0" y1="1220" x2="1080" y2="1220" stroke="#000000" strokeWidth="14" />
              <rect x="0" y="1220" width="1080" height="700" fill="#020617" />
              <line x1="260" y1="1220" x2="120" y2="1920" stroke="#064E3B" strokeWidth="6" />
              <line x1="540" y1="1220" x2="540" y2="1920" stroke="#064E3B" strokeWidth="6" />
              <line x1="820" y1="1220" x2="960" y2="1920" stroke="#064E3B" strokeWidth="6" />
            </svg>
          </>
        );

      case 'puppet_stage_shadow':
        return (
          <>
            {/* Theatrical Dark Void with Spotlight Beam */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 20%, #1E1B4B 0%, #0F172A 50%, #020617 100%)',
              }}
            />
            <svg
              width="1080"
              height="1920"
              viewBox="0 0 1080 1920"
              fill="none"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* Overhead Spotlight Beam */}
              <polygon points="540,80 320,1220 760,1220" fill="#38BDF8" opacity="0.12" />

              {/* Hanging Glowing Golden & Red Puppet Strings */}
              <line x1="380" y1="0" x2="380" y2="700" stroke="#EF4444" strokeWidth="4" opacity="0.7" />
              <line x1="440" y1="0" x2="440" y2="650" stroke="#F59E0B" strokeWidth="4" opacity="0.8" />
              <line x1="640" y1="0" x2="640" y2="650" stroke="#F59E0B" strokeWidth="4" opacity="0.8" />
              <line x1="700" y1="0" x2="700" y2="700" stroke="#EF4444" strokeWidth="4" opacity="0.7" />

              {/* Wooden Puppeteer Cross Bars Suspended Above */}
              <rect x="360" y="240" width="100" height="14" rx="4" fill="#92400E" stroke="#000000" strokeWidth="4" />
              <rect x="620" y="240" width="100" height="14" rx="4" fill="#92400E" stroke="#000000" strokeWidth="4" />

              {/* Floor Horizon Line (Y = 1220) */}
              <line x1="0" y1="1220" x2="1080" y2="1220" stroke="#000000" strokeWidth="14" />
              <rect x="0" y="1220" width="1080" height="700" fill="#020617" />
              {/* Floor Spotlight Oval */}
              <ellipse cx="540" cy="1220" rx="360" ry="70" fill="#38BDF8" opacity="0.2" />
            </svg>
          </>
        );
    }
  };

  const renderForegroundLayer = () => {
    const isAncient = [
      'ancient_palace',
      'durbar_throne_room',
      'temple_vault',
      'chaupar_board_arena',
      'subterranean_dungeon_vault',
      'puppet_stage_shadow',
    ].includes(type);

    // Warm atmospheric breathing god-ray pulse
    const beamPulse = 0.08 + Math.sin((frame / 30) * Math.PI) * 0.025;

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 35,
          overflow: 'hidden',
          boxShadow: isAncient
            ? 'inset 0 0 160px rgba(0,0,0,0.7), inset 0 0 60px rgba(0,0,0,0.9)'
            : 'inset 0 0 120px rgba(0,0,0,0.45)',
        }}
      >
        {isAncient ? (
          <svg
            width="1080"
            height="1920"
            viewBox="0 0 1080 1920"
            fill="none"
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* Volumetric Warm God Ray angled from top-right window */}
            <polygon
              points="1080,0 800,0 200,1920 600,1920"
              fill="url(#godRayGrad)"
              opacity={beamPulse}
            />
            <defs>
              <linearGradient id="godRayGrad" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
                <stop offset="70%" stopColor="#FEF08A" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Top Rajputana Scalloped Jharokha Arch Valence */}
            <path
              d="M 0 0 L 1080 0 L 1080 80 Q 980 120 880 80 Q 780 130 680 80 Q 540 140 400 80 Q 300 130 200 80 Q 100 120 0 80 Z"
              fill="#1C1917"
              stroke="#000000"
              strokeWidth="6"
            />
            {/* Golden Carved Trim on Arch */}
            <path
              d="M 0 70 Q 100 110 200 70 Q 300 120 400 70 Q 540 130 680 70 Q 780 120 880 70 Q 980 110 1080 70"
              fill="none"
              stroke="#D97706"
              strokeWidth="4"
            />

            {/* Left Foreground Framing Pillar (Carved Royal Sandstone) */}
            <g id="fg_left_pillar">
              <rect x="-30" y="0" width="130" height="1920" fill="#1C1917" stroke="#000000" strokeWidth="8" />
              {/* Pillar Inner Shadow */}
              <rect x="85" y="0" width="15" height="1920" fill="#000000" opacity="0.4" />
              {/* Capital & Base Flutes */}
              <rect x="-30" y="80" width="145" height="24" rx="4" fill="#292524" stroke="#000000" strokeWidth="4" />
              <rect x="-30" y="104" width="135" height="12" fill="#D97706" />
              <line x1="25" y1="120" x2="25" y2="1850" stroke="#292524" strokeWidth="6" />
              <line x1="55" y1="120" x2="55" y2="1850" stroke="#44403C" strokeWidth="6" />
              {/* Pillar Base Plinth */}
              <rect x="-30" y="1840" width="145" height="80" fill="#292524" stroke="#000000" strokeWidth="6" />
              <rect x="-30" y="1830" width="135" height="10" fill="#D97706" />
            </g>

            {/* Right Foreground Framing Pillar */}
            <g id="fg_right_pillar">
              <rect x="980" y="0" width="130" height="1920" fill="#1C1917" stroke="#000000" strokeWidth="8" />
              {/* Pillar Inner Shadow */}
              <rect x="980" y="0" width="15" height="1920" fill="#000000" opacity="0.4" />
              {/* Capital & Base Flutes */}
              <rect x="965" y="80" width="145" height="24" rx="4" fill="#292524" stroke="#000000" strokeWidth="4" />
              <rect x="975" y="104" width="135" height="12" fill="#D97706" />
              <line x1="1025" y1="120" x2="1025" y2="1850" stroke="#44403C" strokeWidth="6" />
              <line x1="1055" y1="120" x2="1055" y2="1850" stroke="#292524" strokeWidth="6" />
              {/* Pillar Base Plinth */}
              <rect x="965" y="1840" width="145" height="80" fill="#292524" stroke="#000000" strokeWidth="6" />
              <rect x="975" y="1830" width="135" height="10" fill="#D97706" />
            </g>

            {/* Drifting Golden Embers & Sacred Temple Dust Particles */}
            {[
              { x: 180, speed: 2.2, size: 7, seed: 120 },
              { x: 320, speed: 1.8, size: 5, seed: 450 },
              { x: 460, speed: 2.5, size: 8, seed: 890 },
              { x: 620, speed: 1.6, size: 6, seed: 310 },
              { x: 740, speed: 2.1, size: 5, seed: 720 },
              { x: 860, speed: 2.8, size: 7, seed: 150 },
              { x: 260, speed: 1.9, size: 4, seed: 620 },
              { x: 530, speed: 2.4, size: 6, seed: 980 },
              { x: 800, speed: 1.7, size: 5, seed: 400 },
            ].map((p, i) => {
              const currentY = 1920 - ((frame * p.speed * 4 + p.seed) % 1920);
              const driftX = p.x + Math.sin((frame / 20) + i) * 16;
              const alpha = Math.sin((currentY / 1920) * Math.PI) * 0.75;
              return (
                <g key={i}>
                  <circle cx={driftX} cy={currentY} r={p.size * 1.8} fill="#F59E0B" opacity={alpha * 0.3} />
                  <circle cx={driftX} cy={currentY} r={p.size} fill="#FEF08A" opacity={alpha} />
                </g>
              );
            })}
          </svg>
        ) : (
          <svg
            width="1080"
            height="1920"
            viewBox="0 0 1080 1920"
            fill="none"
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* Modern Subtle Diagonal Screen Sheen */}
            <polygon points="0,0 450,0 150,1920 0,1920" fill="#FFFFFF" opacity="0.02" />
            {/* Minimalist Micro Dust Motes in Workplace Light */}
            {[
              { x: 250, speed: 1.2, size: 4, seed: 200 },
              { x: 520, speed: 1.5, size: 3, seed: 600 },
              { x: 780, speed: 1.1, size: 4, seed: 900 },
            ].map((p, i) => {
              const currentY = 1920 - ((frame * p.speed * 3 + p.seed) % 1920);
              const driftX = p.x + Math.cos((frame / 25) + i) * 12;
              const alpha = Math.sin((currentY / 1920) * Math.PI) * 0.4;
              return (
                <circle key={i} cx={driftX} cy={currentY} r={p.size} fill="#FFFFFF" opacity={alpha} />
              );
            })}
          </svg>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* 1. Background Environment Plate */}
      {renderBackgroundPlate()}

      {/* 2. Midground Stage Actors & Interactive Props */}
      {children}

      {/* 3. Foreground Framing & Cinematic Atmospheric Depth */}
      {renderForegroundLayer()}
    </AbsoluteFill>
  );
};
