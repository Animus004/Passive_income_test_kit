import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface SplitCompareProps {
  theme: ColorTheme;
  title?: string;
  leftLabel?: string;
  rightLabel?: string;
  leftSub?: string;
  rightSub?: string;
  leftColor?: string;
  rightColor?: string;
}

export const SplitCompare: React.FC<SplitCompareProps> = ({
  theme,
  title,
  leftLabel = 'EXPECTATION',
  rightLabel = 'REALITY',
  leftSub = '',
  rightSub = '',
  leftColor = '#60A5FA',
  rightColor = '#F43F5E',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.8 },
  });

  // Card slam springs
  const leftSlam = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.7 },
  });

  const rightSlam = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 7, stiffness: 220, mass: 0.8 },
  });

  const leftY = interpolate(leftSlam, [0, 1], [-250, 0]);
  const rightY = interpolate(rightSlam, [0, 1], [250, 0]);

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
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: 44,
            color: theme.ink,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: 40,
            textAlign: 'center',
            textShadow: `0 4px 0 #FFFFFF`,
          }}
        >
          {title}
        </div>
      )}

      {/* Two Compare Cards Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 28,
          alignItems: 'center',
          justifyContent: 'center',
          width: '90%',
          maxWidth: 960,
        }}
      >
        {/* Left Card */}
        <div
          style={{
            flex: 1,
            height: 480,
            backgroundColor: leftColor,
            borderRadius: 36,
            border: `7px solid ${theme.ink}`,
            boxShadow: `0 14px 0 ${theme.ink}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 20px',
            transform: `translateY(${leftY}px)`,
            position: 'relative',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: theme.ink,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: 22,
              fontWeight: 900,
              textTransform: 'uppercase',
              padding: '6px 18px',
              borderRadius: 20,
              border: `4px solid ${theme.ink}`,
            }}
          >
            {leftLabel}
          </div>

          {/* Googly Eyes glancing right toward opponent */}
          <div style={{ marginTop: 20 }}>
            <GooglyEyes size={80} pupilSize={34} glance="right" blinkInterval={90} />
          </div>

          <div
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 32,
              color: '#FFFFFF',
              textAlign: 'center',
              textTransform: 'uppercase',
              textShadow: `0 3px 0 ${theme.ink}`,
              lineHeight: 1.15,
            }}
          >
            {leftSub}
          </div>
        </div>

        {/* VS Badge in Middle */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.accent,
            border: `5px solid ${theme.ink}`,
            boxShadow: `0 6px 0 ${theme.ink}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: 26,
            zIndex: 10,
            transform: `scale(${entrance})`,
          }}
        >
          VS
        </div>

        {/* Right Card */}
        <div
          style={{
            flex: 1,
            height: 480,
            backgroundColor: rightColor,
            borderRadius: 36,
            border: `7px solid ${theme.ink}`,
            boxShadow: `0 14px 0 ${theme.ink}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 20px',
            transform: `translateY(${rightY}px)`,
            position: 'relative',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: theme.ink,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: 22,
              fontWeight: 900,
              textTransform: 'uppercase',
              padding: '6px 18px',
              borderRadius: 20,
              border: `4px solid ${theme.ink}`,
            }}
          >
            {rightLabel}
          </div>

          {/* Googly Eyes glancing left toward opponent */}
          <div style={{ marginTop: 20 }}>
            <GooglyEyes size={80} pupilSize={34} glance="left" blinkInterval={85} />
          </div>

          <div
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 32,
              color: '#FFFFFF',
              textAlign: 'center',
              textTransform: 'uppercase',
              textShadow: `0 3px 0 ${theme.ink}`,
              lineHeight: 1.15,
            }}
          >
            {rightSub}
          </div>
        </div>
      </div>
    </div>
  );
};
