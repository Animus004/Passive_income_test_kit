import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface DialGaugeProps {
  theme: ColorTheme;
  title?: string;
  timeLabel?: string;
  dangerText?: string;
  needleTargetAngle?: number; // 0 to 180 deg
}

export const DialGauge: React.FC<DialGaugeProps> = ({
  theme,
  title,
  timeLabel,
  dangerText = 'CRITICAL ALERT',
  needleTargetAngle = 145,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.8 },
  });

  // Needle slam spring (enters at frame 10 with violent overshoot and jitter)
  const needleSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 6, stiffness: 220, mass: 0.7 },
  });

  const baseAngle = interpolate(needleSpring, [0, 1], [-90, needleTargetAngle - 90]);
  const needleJitter = needleSpring > 0.85 ? Math.sin(frame * 0.8) * 3.5 : 0;
  const finalNeedleAngle = baseAngle + needleJitter;

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
        transform: `scale(${entrance})`,
      }}
    >
      {/* Semi-circle Gauge */}
      <div
        style={{
          width: 380,
          height: 220,
          backgroundColor: theme.name === 'MIDNIGHT_INDIGO' ? '#0F0E17' : '#FFFFFF',
          borderRadius: '200px 200px 20px 20px',
          border: `8px solid ${theme.ink}`,
          boxShadow: `0 12px 0 ${theme.ink}`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 24,
          overflow: 'hidden',
        }}
      >
        {/* Color arc slices (SVG) */}
        <svg
          style={{ position: 'absolute', top: 15, width: 340, height: 180 }}
          viewBox="0 0 340 180"
        >
          {/* Safe Green Zone */}
          <path
            d="M 30 170 A 140 140 0 0 1 120 40"
            fill="none"
            stroke="#10B981"
            strokeWidth="28"
            strokeLinecap="round"
          />
          {/* Warning Yellow Zone */}
          <path
            d="M 125 36 A 140 140 0 0 1 215 36"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="28"
          />
          {/* Red Danger Zone */}
          <path
            d="M 220 40 A 140 140 0 0 1 310 170"
            fill="none"
            stroke="#EF4444"
            strokeWidth="28"
            strokeLinecap="round"
          />
        </svg>

        {/* Needle */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            width: 8,
            height: 120,
            backgroundColor: theme.accent,
            borderRadius: 6,
            border: `3px solid ${theme.ink}`,
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${finalNeedleAngle}deg)`,
            zIndex: 10,
          }}
        >
          {/* Arrow tip */}
          <div
            style={{
              position: 'absolute',
              top: -12,
              left: -8,
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: `16px solid ${theme.accent}`,
            }}
          />
        </div>

        {/* Center Pivot with Googly Eye */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            zIndex: 20,
          }}
        >
          <GooglyEyes size={48} spacing={4} glance="up" inkColor={theme.ink} />
        </div>
      </div>

      {/* Time Callout Badge */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: theme.accent,
          color: '#FFFFFF',
          padding: '12px 28px',
          borderRadius: 24,
          border: `5px solid ${theme.ink}`,
          boxShadow: `0 6px 0 ${theme.ink}`,
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 32,
          fontWeight: 900,
          textAlign: 'center',
        }}
      >
        {timeLabel ? `${timeLabel}: ${dangerText}` : dangerText}
      </div>
    </div>
  );
};
