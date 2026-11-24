import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface TimeFlipCalendarProps {
  theme: ColorTheme;
  title?: string;
  startTime?: string;
  endTime?: string;
  stampText?: string;
}

export const TimeFlipCalendar: React.FC<TimeFlipCalendarProps> = ({
  theme,
  title,
  startTime = '12:00 AM',
  endTime = '08:00 AM',
  stampText = 'EXPIRED',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.8 },
  });

  // Flip trigger at frame 18
  const flipProgress = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });

  const isFlipped = flipProgress > 0.5;
  const currentTimeDisplay = isFlipped ? endTime : startTime;

  // Stamp slam at frame 34
  const stampSpring = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 7, stiffness: 260, mass: 0.5 },
  });

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

      {/* Mechanical Flip Clock Container */}
      <div
        style={{
          width: 440,
          height: 280,
          backgroundColor: '#0F0E17',
          borderRadius: 32,
          border: `9px solid ${theme.ink}`,
          boxShadow: `0 16px 0 ${theme.ink}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Horizontal center divider slit */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: '#1E293B',
            zIndex: 15,
            boxShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        />

        {/* Display Digits */}
        <div
          style={{
            fontFamily: 'Inter, Arial Black, sans-serif',
            fontSize: 92,
            fontWeight: 900,
            color: isFlipped ? '#EF4444' : '#F8FAFC',
            letterSpacing: '2px',
            zIndex: 10,
          }}
        >
          {currentTimeDisplay}
        </div>

        {/* Googly Eyes on Top of the Clock */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 32,
            zIndex: 20,
          }}
        >
          <GooglyEyes
            size={48}
            spacing={6}
            glance={isFlipped ? 'cross' : 'down'}
            inkColor="#0F0E17"
          />
        </div>

        {/* The Big Red Slam Stamp */}
        {frame >= 32 && (
          <div
            style={{
              position: 'absolute',
              transform: `scale(${stampSpring}) rotate(-12deg)`,
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontFamily: 'Inter, Arial Black, sans-serif',
              fontSize: 36,
              fontWeight: 900,
              textTransform: 'uppercase',
              padding: '12px 30px',
              borderRadius: 20,
              border: `7px solid ${theme.ink}`,
              boxShadow: `0 10px 0 ${theme.ink}`,
              letterSpacing: '1px',
              zIndex: 30,
            }}
          >
            ❌ {stampText}
          </div>
        )}
      </div>

      {/* Footer Pill */}
      <div
        style={{
          marginTop: 40,
          backgroundColor: theme.name === 'MIDNIGHT_INDIGO' ? '#0F0E17' : '#FFFFFF',
          color: theme.text,
          padding: '16px 36px',
          borderRadius: 28,
          border: `6px solid ${theme.ink}`,
          boxShadow: `0 8px 0 ${theme.ink}`,
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 30,
          fontWeight: 900,
          textAlign: 'center',
        }}
      >
        {stampText ? `${stampText}` : 'TIME OVERFLOW ☕'}
      </div>
    </div>
  );
};
