import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export type FloorPropType = 'laptop' | 'coffee' | 'phone' | 'bomb' | 'brain';

export interface PerspectiveFloorProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  propType?: FloorPropType;
  alertText?: string;
}

export const PerspectiveFloor: React.FC<PerspectiveFloorProps> = ({
  theme,
  title,
  badgeText,
  propType = 'laptop',
  alertText = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entrance drop spring
  const dropSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 260, mass: 0.6 },
  });

  const propY = interpolate(dropSpring, [0, 1], [-450, 0]);
  const shadowScale = interpolate(dropSpring, [0, 1], [0.2, 1.0]);

  // Floating Alert Stamp
  const alertSpring = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: { damping: 9, stiffness: 280, mass: 0.5 },
  });

  const renderProp = () => {
    switch (propType) {
      case 'laptop':
        return (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Screen */}
            <div
              style={{
                width: 380,
                height: 250,
                backgroundColor: '#1E293B',
                borderRadius: '20px 20px 0 0',
                border: `8px solid ${theme.ink}`,
                boxShadow: `0 12px 0 ${theme.ink}`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Camera Notch */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#38BDF8',
                  boxShadow: '0 0 8px #38BDF8',
                }}
              />

              {/* Glowing Screen Content: 2-Word Slack Message */}
              <div
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: 28,
                  fontWeight: 900,
                  padding: '12px 24px',
                  borderRadius: 16,
                  border: `4px solid ${theme.ink}`,
                  boxShadow: `0 6px 0 ${theme.ink}`,
                  transform: `scale(${1 + Math.sin(frame * 0.4) * 0.05})`,
                  textAlign: 'center',
                }}
              >
                💬 "GOT A MINUTE?"
              </div>

              {/* Scared eyes on the laptop screen */}
              <div style={{ marginTop: 20 }}>
                <GooglyEyes size={54} spacing={12} glance="center" inkColor={theme.ink} panicked={frame > 25} />
              </div>
            </div>

            {/* Laptop Keyboard Base (Isometric Trapeze) */}
            <div
              style={{
                width: 440,
                height: 35,
                backgroundColor: '#94A3B8',
                borderRadius: '0 0 16px 16px',
                border: `8px solid ${theme.ink}`,
                borderTop: 'none',
                boxShadow: `0 12px 0 ${theme.ink}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              {/* Trackpad notch */}
              <div
                style={{
                  width: 90,
                  height: 8,
                  backgroundColor: theme.ink,
                  borderRadius: 4,
                  marginTop: 6,
                }}
              />
            </div>
          </div>
        );

      case 'bomb':
        return (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Spark fuse */}
            <svg width="40" height="50" style={{ marginBottom: -8 }}>
              <path d="M 20 50 Q 10 25 30 10" stroke={theme.ink} strokeWidth="6" fill="none" />
              <circle cx="30" cy="10" r="8" fill="#FACC15" />
            </svg>

            {/* Bomb Sphere */}
            <div
              style={{
                width: 280,
                height: 280,
                backgroundColor: theme.ink,
                borderRadius: '50%',
                border: `8px solid ${theme.ink}`,
                boxShadow: `0 14px 0 #00000040`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: 75 }}>
                <GooglyEyes size={68} spacing={14} glance="center" inkColor="#FFFFFF" panicked={true} />
              </div>

              {/* Countdown badge on bomb */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 45,
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: 26,
                  fontWeight: 900,
                  padding: '4px 14px',
                  borderRadius: 8,
                }}
              >
                00:03
              </div>
            </div>
          </div>
        );

      case 'coffee':
        return (
          <div
            style={{
              position: 'relative',
              width: 260,
              height: 290,
              backgroundColor: '#D97706',
              borderRadius: '24px 24px 44px 44px',
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Mug Handle */}
            <div
              style={{
                position: 'absolute',
                right: -65,
                top: 50,
                width: 80,
                height: 130,
                borderRadius: '0 65px 65px 0',
                border: `8px solid ${theme.ink}`,
                backgroundColor: 'transparent',
              }}
            />
            <GooglyEyes size={68} spacing={14} glance="center" inkColor={theme.ink} />
          </div>
        );

      default:
        return (
          <div
            style={{
              width: 280,
              height: 280,
              backgroundColor: theme.primary,
              borderRadius: 36,
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GooglyEyes size={70} spacing={14} glance="center" inkColor={theme.ink} />
          </div>
        );
    }
  };

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

      {/* Main Assembly with Drop Shadow on Surface */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Floating Alert Pill */}
        {alertText && (
          <div
            style={{
              position: 'absolute',
              top: -45,
              right: -100,
              backgroundColor: '#FACC15',
              color: theme.ink,
              fontFamily: 'Inter, Arial, sans-serif',
              fontWeight: 900,
              fontSize: 22,
              padding: '8px 20px',
              borderRadius: '24px 24px 24px 4px',
              border: `5px solid ${theme.ink}`,
              boxShadow: `0 6px 0 ${theme.ink}`,
              transform: `scale(${alertSpring}) rotate(12deg)`,
              zIndex: 30,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {alertText}
          </div>
        )}

        {/* Moving Prop */}
        <div
          style={{
            transform: `translateY(${propY}px)`,
            zIndex: 5,
          }}
        >
          {renderProp()}
        </div>

        {/* Drop Shadow on Desk / Floor Surface */}
        <div
          style={{
            width: 380,
            height: 36,
            borderRadius: '50%',
            backgroundColor: `${theme.ink}30`,
            transform: `scale(${shadowScale})`,
            marginTop: 15,
            zIndex: 1,
          }}
        />

        {/* Title underneath */}
        {title && (
          <div
            style={{
              marginTop: 35,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: 42,
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
    </div>
  );
};
