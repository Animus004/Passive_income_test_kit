import React from 'react';

export type StageConnectorType = 'puppet_strings' | 'emi_chains' | 'tension_cords';

export interface StageConnectorProps {
  type?: StageConnectorType;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  tension?: number; // 0 (slack/catenary sag) to 1.0 (taut)
  tugIntensity?: number; // Real-time vibration / tug oscillation offset
  opacity?: number;
  attachCrowns?: boolean; // Whether miniature golden marionette crowns hang at target
  crownBob?: number; // Marionette bob offset in reaction to tugging
}

export const StageConnector: React.FC<StageConnectorProps> = ({
  type = 'puppet_strings',
  fromX,
  fromY,
  toX,
  toY,
  tension = 1.0,
  tugIntensity = 0,
  opacity = 1.0,
  attachCrowns = false,
  crownBob = 0,
}) => {
  if (opacity <= 0.01) return null;

  // Smart Kinematic Hand Anchoring:
  // When character is on right stage (fromX > toX), anchor cords directly to the forward outstretched hand
  // rather than the character's facial center, ensuring 100% facial clarity!
  const effectiveFromX = fromX > toX && fromX >= 700 ? fromX - 115 : fromX;
  const effectiveFromY = fromX > toX && fromX >= 700 ? fromY + 65 : fromY;

  // Mid-stage catenary sag control point
  const midX = (effectiveFromX + toX) / 2;
  const sagFactor = Math.max(0, 1.0 - tension) * 120 + 20;
  const dynamicSag = sagFactor + tugIntensity * 1.5;
  const midY = Math.min(effectiveFromY, toY) - 40 + dynamicSag;

  const STROKE = '#000000';
  const STROKE_WIDTH = 4;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 35,
        opacity,
      }}
      viewBox="0 0 1080 1920"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glowing string filters */}
        <filter id="string_glow_amber" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.8" />
        </filter>
        <filter id="string_glow_crimson" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.8" />
        </filter>
      </defs>

      {type === 'puppet_strings' && (
        <g id="stage_puppet_strings_rig">
          {/* 1. Main Tension Connecting Cords (Shakuni hands to Cross / Crowns) */}
          {/* Upper Amber Cord (Outer control) */}
          <path
            d={`M ${effectiveFromX} ${effectiveFromY} Q ${midX + 20} ${midY} ${toX + 30} ${toY}`}
            stroke="#F59E0B"
            strokeWidth="5"
            strokeDasharray="14 6"
            strokeLinecap="round"
            filter="url(#string_glow_amber)"
          />
          {/* Center Crimson Cord (Inner control - high tension) */}
          <path
            d={`M ${effectiveFromX - 20} ${effectiveFromY + 15} Q ${midX} ${midY + 25} ${toX} ${toY + 10}`}
            stroke="#EF4444"
            strokeWidth="6"
            strokeDasharray="16 8"
            strokeLinecap="round"
            filter="url(#string_glow_crimson)"
          />
          {/* Lower Amber Cord */}
          <path
            d={`M ${effectiveFromX - 40} ${effectiveFromY + 30} Q ${midX - 20} ${midY + 50} ${toX - 30} ${toY}`}
            stroke="#F59E0B"
            strokeWidth="5"
            strokeDasharray="12 6"
            strokeLinecap="round"
            filter="url(#string_glow_amber)"
          />

          {/* 2. Vertical Drop Cords from target down to Marionettes */}
          {attachCrowns && (
            <g id="marionette_crowns">
              {/* Left Crown String */}
              <line
                x1={toX - 35}
                y1={toY}
                x2={toX - 35}
                y2={toY + 160 + crownBob}
                stroke="#EF4444"
                strokeWidth="5"
                strokeDasharray="10 5"
              />
              {/* Left Miniature Golden Royal Crown */}
              <g transform={`translate(${toX - 35}, ${toY + 160 + crownBob})`}>
                <polygon
                  points="-25,30 25,30 25,0 12,14 0,0 -12,14 -25,0"
                  fill="#FACC15"
                  stroke={STROKE}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinejoin="round"
                />
                <circle cx="-16" cy="20" r="3" fill="#DC2626" />
                <circle cx="0" cy="20" r="3" fill="#2563EB" />
                <circle cx="16" cy="20" r="3" fill="#DC2626" />
                {/* Helpless puppet drop shadow */}
                <ellipse cx="0" cy="45" rx="22" ry="6" fill="#000000" opacity="0.3" />
              </g>

              {/* Right Crown String */}
              <line
                x1={toX + 35}
                y1={toY}
                x2={toX + 35}
                y2={toY + 140 - crownBob * 0.8}
                stroke="#F59E0B"
                strokeWidth="5"
                strokeDasharray="10 5"
              />
              {/* Right Miniature Golden Royal Crown */}
              <g transform={`translate(${toX + 35}, ${toY + 140 - crownBob * 0.8})`}>
                <polygon
                  points="-25,30 25,30 25,0 12,14 0,0 -12,14 -25,0"
                  fill="#FACC15"
                  stroke={STROKE}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinejoin="round"
                />
                <circle cx="-16" cy="20" r="3" fill="#DC2626" />
                <circle cx="0" cy="20" r="3" fill="#2563EB" />
                <circle cx="16" cy="20" r="3" fill="#DC2626" />
                {/* Helpless puppet drop shadow */}
                <ellipse cx="0" cy="45" rx="22" ry="6" fill="#000000" opacity="0.3" />
              </g>
            </g>
          )}
        </g>
      )}

      {type === 'emi_chains' && (
        <g id="stage_emi_chains_rig">
          <path
            d={`M ${fromX} ${fromY} Q ${midX} ${midY + 40} ${toX} ${toY}`}
            stroke="#334155"
            strokeWidth="14"
            strokeDasharray="20 12"
            strokeLinecap="round"
          />
          <path
            d={`M ${fromX} ${fromY} Q ${midX} ${midY + 40} ${toX} ${toY}`}
            stroke="#94A3B8"
            strokeWidth="6"
            strokeDasharray="20 12"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};
