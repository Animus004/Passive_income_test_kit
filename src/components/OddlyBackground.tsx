import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ColorTheme, COLOR_THEMES } from '../theme/tokens';

export type BackgroundPatternType = 'dots' | 'grid' | 'burst' | 'floor' | 'plain';

export interface OddlyBackgroundProps {
  theme?: ColorTheme;
  pattern?: BackgroundPatternType;
  accentFloorColor?: string;
}

export const OddlyBackground: React.FC<OddlyBackgroundProps> = ({
  theme = COLOR_THEMES.SUNNY_GOLD,
  pattern = 'dots',
  accentFloorColor,
}) => {
  const frame = useCurrentFrame();

  const renderPattern = () => {
    switch (pattern) {
      case 'dots': {
        // Comic Halftone Dot Matrix with subtle organic breathing
        const dotSize = 7 + Math.sin(frame * 0.08) * 1.5;
        return (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.14,
            }}
          >
            <defs>
              <pattern
                id="comic-halftone"
                x="0"
                y="0"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="24" cy="24" r={dotSize} fill={theme.ink} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#comic-halftone)" />
          </svg>
        );
      }

      case 'grid': {
        // Technical Blueprint / Matrix Grid
        return (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.12,
            }}
          >
            <defs>
              <pattern
                id="tech-grid"
                x="0"
                y="0"
                width="64"
                height="64"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="64" y2="0" stroke={theme.ink} strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2="64" stroke={theme.ink} strokeWidth="2" />
                <circle cx="0" cy="0" r="3" fill={theme.ink} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-grid)" />
          </svg>
        );
      }

      case 'burst': {
        // High-octane Manga / Comic Radial Burst Lines
        const rotation = frame * 0.3;
        return (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 1800,
              height: 1800,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              opacity: 0.08,
              pointerEvents: 'none',
            }}
          >
            <svg width="1800" height="1800" viewBox="0 0 1800 1800">
              {Array.from({ length: 32 }).map((_, i) => {
                const angle = (i * 360) / 32;
                return (
                  <polygon
                    key={i}
                    points="900,900 870,0 930,0"
                    fill={theme.ink}
                    transform={`rotate(${angle} 900 900)`}
                  />
                );
              })}
            </svg>
          </div>
        );
      }

      case 'floor': {
        // Grounded Horizon / Isometric Room Plane (Desk or Room Perspective)
        const floorColor = accentFloorColor || (theme.name === 'MIDNIGHT_INDIGO' ? '#141238' : '#00000010');
        return (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* Lower floor / desk surface */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '42%',
                backgroundColor: floorColor,
                borderTop: `6px solid ${theme.ink}30`,
              }}
            >
              {/* Subtle perspective floor boards / grid */}
              <svg width="100%" height="100%" style={{ opacity: 0.15 }}>
                <line x1="15%" y1="0%" x2="5%" y2="100%" stroke={theme.ink} strokeWidth="4" />
                <line x1="38%" y1="0%" x2="32%" y2="100%" stroke={theme.ink} strokeWidth="4" />
                <line x1="62%" y1="0%" x2="68%" y2="100%" stroke={theme.ink} strokeWidth="4" />
                <line x1="85%" y1="0%" x2="95%" y2="100%" stroke={theme.ink} strokeWidth="4" />
              </svg>
            </div>
          </div>
        );
      }

      case 'plain':
      default: {
        // Floating organic micro-particles
        return (
          <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: `${20 + i * 16}%`,
                  left: `${15 + ((i * 23) % 70)}%`,
                  width: 8 + (i % 3) * 4,
                  height: 8 + (i % 3) * 4,
                  backgroundColor: theme.ink,
                  opacity: 0.08,
                  borderRadius: '50%',
                  transform: `translateY(${Math.sin((frame + i * 15) * 0.1) * 12}px)`,
                }}
              />
            ))}
          </div>
        );
      }
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.bg,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {renderPattern()}
    </div>
  );
};

export default OddlyBackground;
