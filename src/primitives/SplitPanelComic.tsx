import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export interface SplitPanelComicProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  leftTitle?: string;
  leftSub?: string;
  leftColor?: string;
  rightTitle?: string;
  rightSub?: string;
  rightColor?: string;
}

export const SplitPanelComic: React.FC<SplitPanelComicProps> = ({
  theme,
  title = 'THE ASYMMETRICAL STANDOFF',
  badgeText = 'PERSPECTIVE GAP',
  leftTitle = 'MANAGER (CHILL)',
  leftSub = 'JUST ASKING ABOUT LUNCH',
  leftColor = '#10B981', // Calm emerald
  rightTitle = 'YOU (CATASTROPHIC)',
  rightSub = 'UPDATING RESUME & PANICKING',
  rightColor = '#EF4444', // High alert red
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const leftSlide = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 200, mass: 0.7 },
  });

  const rightSlide = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 11, stiffness: 200, mass: 0.7 },
  });

  const starburstPop = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 9, stiffness: 260, mass: 0.5 },
  });

  const leftX = interpolate(leftSlide, [0, 1], [-100, 0]);
  const rightX = interpolate(rightSlide, [0, 1], [100, 0]);

  // Jitter for the panicked side
  const panicJitterX = Math.sin(frame * 1.2) * 3;
  const panicJitterY = Math.cos(frame * 1.5) * 3;

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
        overflow: 'hidden',
      }}
    >
      {/* Top Hook Pill Badge */}
      {badgeText && (
        <div
          style={{
            position: 'absolute',
            top: 210,
            zIndex: 10,
            backgroundColor: theme.ink,
            color: '#FFFFFF',
            padding: '8px 24px',
            borderRadius: 999,
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: 22,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Main Split Comic Arena */}
      <div
        style={{
          position: 'relative',
          width: 960,
          height: 980,
          borderRadius: 36,
          overflow: 'hidden',
          border: `10px solid ${theme.ink}`,
          boxShadow: `0 24px 0 ${theme.ink}`,
          backgroundColor: '#0F172A',
        }}
      >
        {/* LEFT PANEL (Calm / Casual) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: leftColor,
            clipPath: 'polygon(0 0, 68% 0, 32% 100%, 0 100%)',
            transform: `translateX(${leftX}%)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 40px',
            boxSizing: 'border-box',
          }}
        >
          {/* Label */}
          <div>
            <div
              style={{
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: 36,
                color: '#FFFFFF',
                textShadow: '0 4px 0 #000000',
                letterSpacing: '1px',
              }}
            >
              {leftTitle}
            </div>
            <div
              style={{
                fontFamily: 'Arial Black, sans-serif',
                fontSize: 20,
                color: '#FFFFFF',
                opacity: 0.9,
                marginTop: 6,
              }}
            >
              {leftSub}
            </div>
          </div>

          {/* Calm Avatar Illustration */}
          <div style={{ position: 'relative', width: 220, height: 220, alignSelf: 'flex-start', marginLeft: 20, marginBottom: 40 }}>
            {/* Zen Circle */}
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '8px solid #000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 12px 0 rgba(0,0,0,0.2)',
              }}
            >
              {/* Calm Smiling Eyes */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                <svg width="36" height="20" viewBox="0 0 36 20">
                  <path d="M 4 16 Q 18 2 32 16" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                </svg>
                <svg width="36" height="20" viewBox="0 0 36 20">
                  <path d="M 4 16 Q 18 2 32 16" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
              {/* Gentle Smile */}
              <svg width="48" height="24" viewBox="0 0 48 24">
                <path d="M 6 4 Q 24 22 42 4" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
              </svg>
              {/* Coffee Cup Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -15,
                  right: -15,
                  backgroundColor: '#F59E0B',
                  border: '5px solid #000000',
                  borderRadius: 16,
                  padding: '6px 12px',
                  fontSize: 24,
                }}
              >
                ☕
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Panic / Crisis) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            backgroundColor: rightColor,
            clipPath: 'polygon(68% 0, 100% 0, 100% 100%, 32% 100%)',
            transform: `translateX(${rightX}%)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '60px 50px',
            boxSizing: 'border-box',
          }}
        >
          {/* Label */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: 36,
                color: '#FFFFFF',
                textShadow: '0 4px 0 #000000',
                letterSpacing: '1px',
              }}
            >
              {rightTitle}
            </div>
            <div
              style={{
                fontFamily: 'Arial Black, sans-serif',
                fontSize: 20,
                color: '#FFFFFF',
                opacity: 0.95,
                marginTop: 6,
              }}
            >
              {rightSub}
            </div>
          </div>

          {/* Panicked Avatar Illustration */}
          <div
            style={{
              position: 'relative',
              width: 240,
              height: 240,
              marginRight: 20,
              marginBottom: 40,
              transform: `translate(${panicJitterX}px, ${panicJitterY}px)`,
            }}
          >
            {/* Shaking Panicked Box */}
            <div
              style={{
                width: 210,
                height: 210,
                borderRadius: 40,
                backgroundColor: '#FFFFFF',
                border: '8px solid #000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 12px 0 rgba(0,0,0,0.3)',
              }}
            >
              {/* Googly Eyes Staring in Panic */}
              <div style={{ marginBottom: 10 }}>
                <GooglyEyes size={56} glance="up" panicked={true} />
              </div>

              {/* Screaming Wavy Mouth */}
              <svg width="60" height="30" viewBox="0 0 60 30">
                <path d="M 6 15 Q 18 2 30 15 Q 42 28 54 15" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
              </svg>

              {/* Sweat Drops */}
              <div style={{ position: 'absolute', top: -15, right: -10, fontSize: 32 }}>💦</div>
              <div style={{ position: 'absolute', top: 20, left: -20, fontSize: 28 }}>⚡</div>
            </div>
          </div>
        </div>

        {/* DIAGONAL COMIC INK DIVIDER LINE */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <line
            x1="68%"
            y1="0"
            x2="32%"
            y2="100%"
            stroke="#000000"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </svg>

        {/* CENTER COMIC "VS" EXPLOSION STARBURST */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${starburstPop}) rotate(${interpolate(starburstPop, [0, 1], [-30, 0])}deg)`,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Starburst Shape */}
          <svg width="180" height="180" viewBox="0 0 180 180">
            <polygon
              points="90,10 115,60 170,65 130,105 145,160 90,130 35,160 50,105 10,65 65,60"
              fill="#FBBF24"
              stroke="#000000"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 48,
              color: '#000000',
              letterSpacing: '2px',
            }}
          >
            VS
          </div>
        </div>
      </div>

      {/* Bottom Main Headline */}
      {title && (
        <div
          style={{
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: 42,
            color: theme.ink,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginTop: 32,
            textAlign: 'center',
            textShadow: '0 4px 0 #FFFFFF',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};
