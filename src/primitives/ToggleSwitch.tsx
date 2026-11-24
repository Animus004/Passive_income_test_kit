import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { DialGauge } from './DialGauge';

export interface ToggleSwitchProps {
  theme: ColorTheme;
  title?: string;
  offLabel?: string;
  onLabel?: string;
  flipFrame?: number; // Frame where the switch violently flips ON
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  theme,
  title = '2:00 AM SYSTEM OVERRIDE',
  offLabel = 'NORMAL SLEEP',
  onLabel = 'AWKWARD 2016 MEMORY',
  flipFrame = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.8 },
  });

  // Switch Flip Spring with heavy mechanical thud and overshoot
  const isFlipped = frame >= flipFrame;
  const flipSpring = spring({
    frame: Math.max(0, frame - flipFrame),
    fps,
    config: { damping: 7, stiffness: 220, mass: 0.7 },
  });

  // Knob slides from left (0) to right (180px)
  const knobX = interpolate(flipSpring, [0, 1], [0, 170]);
  const pillColor = isFlipped ? theme.accent : '#94A3B8';

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
      {/* Title */}
      {title && (
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
          }}
        >
          {title}
        </div>
      )}

      {/* Giant Pill Switch */}
      <div
        style={{
          width: 380,
          height: 140,
          backgroundColor: pillColor,
          borderRadius: 80,
          border: `9px solid ${theme.ink}`,
          boxShadow: `0 14px 0 ${theme.ink}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          marginBottom: 40,
          transition: 'background-color 0.15s ease',
        }}
      >
        {/* Sliding Knob */}
        <div
          style={{
            width: 108,
            height: 108,
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            border: `8px solid ${theme.ink}`,
            boxShadow: `0 6px 0 ${theme.ink}`,
            transform: `translateX(${knobX}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Knob indent detail */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: isFlipped ? theme.accent : '#CBD5E1',
              border: `4px solid ${theme.ink}`,
            }}
          />
        </div>

        {/* State Label inside pill */}
        <div
          style={{
            position: 'absolute',
            right: isFlipped ? 'auto' : 32,
            left: isFlipped ? 32 : 'auto',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 28,
            fontWeight: 900,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {isFlipped ? 'ACTIVE' : 'OFF'}
        </div>
      </div>

      {/* Dynamic State Callout Card */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: isFlipped ? theme.accent : '#F59E0B',
          color: '#FFFFFF',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 26,
          fontWeight: 900,
          textTransform: 'uppercase',
          padding: '16px 36px',
          borderRadius: 24,
          border: `5px solid ${theme.ink}`,
          boxShadow: `0 8px 0 ${theme.ink}`,
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span>{isFlipped ? '⚡' : '💤'}</span>
        <span>{isFlipped ? onLabel : offLabel}</span>
      </div>
    </div>
  );
};
