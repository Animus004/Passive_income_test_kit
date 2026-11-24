import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface WeightOnWireProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  hasEyes?: boolean;
}

export const WeightOnWire: React.FC<WeightOnWireProps> = ({
  theme,
  title,
  badgeText,
  hasEyes = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Vertical drop spring with bounce
  const dropSpring = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 140, mass: 1.0 },
  });

  // Elastic wire length
  const wireLength = interpolate(dropSpring, [0, 1], [0, 360]);

  // Pendulum sway physics
  const swayDamping = Math.max(0.2, 1 - frame * 0.008);
  const swayAngle = Math.sin(frame * 0.14) * 16 * swayDamping;

  // Lightbulb glowing pulse
  const glowScale = 1 + Math.sin(frame * 0.25) * 0.06;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        paddingBottom: 220,
      }}
    >
      {/* Badge at top */}
      {badgeText && (
        <div
          style={{
            position: 'absolute',
            top: 130,
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
            zIndex: 10,
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Ceiling Anchor Point */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          width: 80,
          height: 18,
          backgroundColor: theme.ink,
          borderRadius: '0 0 12px 12px',
        }}
      />

      {/* Pendulum Assembly (swaying from ceiling anchor) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transformOrigin: 'top center',
          transform: `rotate(${swayAngle}deg)`,
        }}
      >
        {/* Elastic Wire */}
        <div
          style={{
            width: 8,
            height: wireLength,
            backgroundColor: theme.ink,
          }}
        />

        {/* Hanging Weight: Chunky Glowing Lightbulb with Googly Eyes */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${glowScale})`,
          }}
        >
          {/* Lightbulb Screw Base */}
          <div
            style={{
              width: 50,
              height: 30,
              backgroundColor: '#94A3B8',
              border: `6px solid ${theme.ink}`,
              borderRadius: '6px 6px 0 0',
              marginBottom: -4,
              zIndex: 5,
            }}
          />

          {/* Glowing Bulb Body */}
          <div
            style={{
              width: 240,
              height: 240,
              backgroundColor: '#FDE047',
              borderRadius: '50% 50% 40% 40%',
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 0 45px #FDE04780, 0 12px 0 ${theme.ink}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Filament Glow Lines */}
            <svg
              style={{
                position: 'absolute',
                top: 25,
                width: 100,
                height: 60,
              }}
              viewBox="0 0 100 60"
            >
              <path
                d="M 20 50 Q 35 10 50 40 Q 65 10 80 50"
                fill="none"
                stroke="#EAB308"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>

            {/* Googly Eyes */}
            {hasEyes && (
              <div style={{ marginTop: 25, zIndex: 10 }}>
                <GooglyEyes size={58} spacing={10} glance="up" inkColor={theme.ink} delay={6} />
              </div>
            )}

            {/* Cute smile */}
            <div
              style={{
                width: 28,
                height: 14,
                borderRadius: '0 0 14px 14px',
                border: `5px solid ${theme.ink}`,
                borderTop: 'none',
                marginTop: 14,
              }}
            />
          </div>
        </div>
      </div>

      {/* Title Banner at bottom */}
      {title && (
        <div
          style={{
            position: 'absolute',
            bottom: 300,
            backgroundColor: theme.name === 'MIDNIGHT_INDIGO' ? '#0F0E17' : '#FFFFFF',
            color: theme.accent,
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 34,
            fontWeight: 900,
            textTransform: 'uppercase',
            padding: '16px 36px',
            borderRadius: 28,
            border: `6px solid ${theme.ink}`,
            boxShadow: `0 8px 0 ${theme.ink}`,
            letterSpacing: '-0.5px',
            textAlign: 'center',
          }}
        >
          💡 {title}
        </div>
      )}
    </div>
  );
};
