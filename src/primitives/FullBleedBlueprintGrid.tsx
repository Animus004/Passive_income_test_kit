import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface FullBleedBlueprintGridProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  countdownSeconds?: number;
  systemStatus?: string;
  subText?: string;
}

export const FullBleedBlueprintGrid: React.FC<FullBleedBlueprintGridProps> = ({
  theme,
  title,
  badgeText,
  countdownSeconds = 4,
  systemStatus = 'CRITICAL OVERLOAD',
  subText,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance pop
  const entrance = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.6 },
  });

  // Countdown timer math: decrements every 20 frames
  const currentCount = Math.max(1, countdownSeconds - Math.floor(frame / 22));
  const isPanic = currentCount <= 2;

  // Pulse effect
  const pulse = Math.sin(frame * 0.4) * 0.05;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 220,
        position: 'relative',
        transform: `scale(${entrance})`,
      }}
    >
      {/* HUD Corner Brackets */}
      <svg
        style={{
          position: 'absolute',
          top: 100,
          left: 60,
          right: 60,
          bottom: 240,
          width: 'calc(100% - 120px)',
          height: 'calc(100% - 340px)',
          pointerEvents: 'none',
        }}
      >
        {/* Top-Left Bracket */}
        <path d="M 0 50 L 0 0 L 50 0" stroke={theme.ink} strokeWidth="6" fill="none" />
        {/* Top-Right Bracket */}
        <path d="M calc(100% - 50px) 0 L 100% 0 L 100% 50" stroke={theme.ink} strokeWidth="6" fill="none" />
        {/* Bottom-Left Bracket */}
        <path d="M 0 calc(100% - 50px) L 0 100% L 50 100%" stroke={theme.ink} strokeWidth="6" fill="none" />
        {/* Bottom-Right Bracket */}
        <path d="M calc(100% - 50px) 100% L 100% 100% L 100% calc(100% - 50px)" stroke={theme.ink} strokeWidth="6" fill="none" />
      </svg>

      {/* Badge at top */}
      {badgeText && (
        <div
          style={{
            backgroundColor: isPanic ? '#EF4444' : theme.accent,
            color: '#FFFFFF',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 26,
            fontWeight: 900,
            textTransform: 'uppercase',
            padding: '10px 28px',
            borderRadius: 30,
            border: `5px solid ${theme.ink}`,
            boxShadow: `0 6px 0 ${theme.ink}`,
            marginBottom: 24,
            letterSpacing: '1px',
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Central Matrix Monitor Card */}
      <div
        style={{
          width: 580,
          height: 380,
          backgroundColor: '#0F172A',
          borderRadius: 36,
          border: `8px solid ${theme.ink}`,
          boxShadow: `0 16px 0 ${theme.ink}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '24px 32px',
          transform: `scale(${1 + pulse})`,
        }}
      >
        {/* Hazard Stripes Header */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 18,
            borderRadius: '28px 28px 0 0',
            background: 'repeating-linear-gradient(45deg, #FACC15, #FACC15 14px, #141414 14px, #141414 28px)',
            borderBottom: `4px solid ${theme.ink}`,
          }}
        />

        {/* Digital Countdown Timer */}
        <div
          style={{
            fontFamily: 'monospace, Courier New, sans-serif',
            fontSize: 82,
            fontWeight: 900,
            color: isPanic ? '#EF4444' : '#38BDF8',
            textShadow: `0 0 20px ${isPanic ? '#EF4444' : '#38BDF8'}80`,
            letterSpacing: '4px',
            marginTop: 10,
          }}
        >
          00:0{currentCount}
        </div>

        {/* Panicked Googly Eyes looking at the timer */}
        <div style={{ marginTop: 15 }}>
          <GooglyEyes size={58} spacing={12} glance="up" inkColor={theme.ink} panicked={isPanic} />
        </div>

        {/* System Status Banner */}
        <div
          style={{
            marginTop: 20,
            backgroundColor: isPanic ? '#EF444425' : '#38BDF820',
            border: `3px solid ${isPanic ? '#EF4444' : '#38BDF8'}`,
            borderRadius: 12,
            padding: '6px 18px',
            color: isPanic ? '#F87171' : '#7DD3FC',
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '1px',
          }}
        >
          STATUS: {systemStatus}
        </div>

        {/* Subtext warning */}
        {subText && (
          <div
            style={{
              marginTop: 12,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: 16,
              fontWeight: 800,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {subText}
          </div>
        )}
      </div>

      {/* Title */}
      {title && (
        <div
          style={{
            marginTop: 36,
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 44,
            fontWeight: 900,
            color: theme.text,
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            textAlign: 'center',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};
