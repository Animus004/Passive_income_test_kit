import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface StackItem {
  label: string;
  color?: string;
  hasEyes?: boolean;
  dropFrame?: number;
}

export interface StackTowerProps {
  theme: ColorTheme;
  title?: string;
  items?: StackItem[];
  dropDelays?: number[];
}

export const StackTower: React.FC<StackTowerProps> = ({
  theme,
  title,
  items = [],
  dropDelays,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // If items not provided or empty, create a clean 3-tier stack from title or generic layers
  const effectiveItems: StackItem[] = items.length > 0 ? items : [
    { label: title || 'SYSTEM LAYER 1', color: '#60A5FA', hasEyes: false },
    { label: 'PROCESSING LOAD', color: '#FBBF24', hasEyes: true },
    { label: 'CRITICAL FAILURE', color: '#F43F5E', hasEyes: true },
  ];

  // Gentle wobble of the entire tower after multiple drops
  const towerWobble = Math.sin(frame * 0.15) * Math.min(2.5, frame * 0.04);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 420,
        position: 'relative',
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 140,
            backgroundColor: theme.accent,
            color: '#FFFFFF',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 26,
            fontWeight: 900,
            textTransform: 'uppercase',
            padding: '12px 32px',
            borderRadius: 30,
            border: `5px solid ${theme.ink}`,
            boxShadow: `0 6px 0 ${theme.ink}`,
            letterSpacing: '1px',
          }}
        >
          {title}
        </div>
      )}

      {/* Tower Stack Container (Standard Column, wobble on whole assembly) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          transform: `rotate(${towerWobble}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        {/* Render items top-to-bottom: item[3] on top, item[0] on bottom */}
        {effectiveItems
          .map((item, idx) => ({ item, idx }))
          .reverse()
          .map(({ item, idx }) => {
            const dropDelay =
              item.dropFrame !== undefined
                ? item.dropFrame
                : dropDelays && dropDelays[idx] !== undefined
                ? dropDelays[idx]
                : idx * 28;

            const isStarted = frame >= dropDelay;
            const dropSpring = spring({
              frame: Math.max(0, frame - dropDelay),
              fps,
              config: { damping: 9, stiffness: 180, mass: 0.9 },
            });

            // Drop from top with squish on landing
            const translateY = interpolate(dropSpring, [0, 1], [-900, 0]);
            const squishY = interpolate(dropSpring, [0, 0.85, 1], [1.2, 0.82, 1]);
            const squishX = interpolate(dropSpring, [0, 0.85, 1], [0.85, 1.15, 1]);

            const blockWidth = 440 - idx * 28; // Taper: wider on bottom, smaller on top
            const blockBg = item.color || theme.primary;

            return (
              <div
                key={idx}
                style={{
                  width: blockWidth,
                  height: 92,
                  backgroundColor: blockBg,
                  borderRadius: 24,
                  border: `7px solid ${theme.ink}`,
                  boxShadow: `0 8px 0 ${theme.ink}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transform: `translateY(${translateY}px) scale(${squishX}, ${squishY})`,
                  transformOrigin: 'bottom center',
                  opacity: isStarted ? 1 : 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: 22,
                    fontWeight: 900,
                    color: theme.ink,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    padding: '0 16px',
                  }}
                >
                  {item.label}
                </span>

                {item.hasEyes && isStarted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -24,
                      right: 28,
                      zIndex: 5,
                    }}
                  >
                    <GooglyEyes size={42} spacing={6} glance="down" inkColor={theme.ink} delay={4} />
                  </div>
                )}
              </div>
            );
          })}

        {/* Heavy Table Base (Firmly planted at the bottom of the stack) */}
        <div
          style={{
            width: 520,
            height: 24,
            backgroundColor: theme.ink,
            borderRadius: 12,
            boxShadow: `0 6px 0 ${theme.ink}40`,
            marginTop: 6,
          }}
        />
      </div>
    </div>
  );
};
