import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { ColorTheme } from '../theme/tokens';

export interface ConveyorItem {
  id: string;
  label: string;
  sub?: string;
  badge?: string;
  color?: string;
}

export interface InfiniteConveyorProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  queueCount?: string;
  speedMultiplier?: number;
  items?: ConveyorItem[];
}

export const InfiniteConveyor: React.FC<InfiniteConveyorProps> = ({
  theme,
  title = 'THE NEVER-ENDING SLACK QUEUE',
  badgeText = 'INCOMING TRAFFIC',
  queueCount = '84 UNREAD PINGS',
  speedMultiplier = 1.0,
  items = [
    { id: '1', label: 'GOT A MINUTE?', sub: 'Manager • 10:24 AM', badge: '🔴 URGENT', color: '#EF4444' },
    { id: '2', label: 'QUICK QUESTION', sub: 'Tech Lead • 10:25 AM', badge: '⚡ FYI', color: '#F59E0B' },
    { id: '3', label: 'CHECK PR #404', sub: 'DevOps • 10:26 AM', badge: '⚠️ BLOCKER', color: '#8B5CF6' },
    { id: '4', label: 'STANDUP IN 2 MINS', sub: 'Calendar Bot • 10:27 AM', badge: '⏰ NOW', color: '#3B82F6' },
    { id: '5', label: 'DID YOU SEE THIS?', sub: 'Product • 10:28 AM', badge: '❓ THREAD', color: '#EC4899' },
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.6 },
  });

  // Calculate infinite scrolling offset
  // Item card width (320px) + gap (32px) = 352px per cycle
  const itemWidthWithGap = 352;
  const flowSpeed = 7 * speedMultiplier;
  const scrollOffset = (frame * flowSpeed) % itemWidthWithGap;

  // Belt roller rotation
  const rollerRotation = (frame * flowSpeed * 3) % 360;

  // Duplicate items array 3 times to ensure seamless infinite coverage across 1080px width
  const renderItems = [...items, ...items, ...items];

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
      {/* Top Hook Badge */}
      {badgeText && (
        <div
          style={{
            backgroundColor: theme.ink,
            color: '#FFFFFF',
            padding: '8px 24px',
            borderRadius: 999,
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: 22,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
            marginBottom: 20,
          }}
        >
          {badgeText}
        </div>
      )}

      {/* Main Headline */}
      {title && (
        <div
          style={{
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: 44,
            color: theme.ink,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: 16,
            textAlign: 'center',
            textShadow: '0 4px 0 #FFFFFF',
          }}
        >
          {title}
        </div>
      )}

      {/* Queue Counter Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: '#FFFFFF',
          border: `5px solid ${theme.ink}`,
          padding: '6px 20px',
          borderRadius: 20,
          marginBottom: 50,
          boxShadow: `0 8px 0 ${theme.ink}`,
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 1s infinite' }} />
        <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: 20, color: theme.ink }}>
          {queueCount}
        </span>
      </div>

      {/* CONVEYOR STAGE CONTAINER */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1040,
          height: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '20px 0',
        }}
      >
        {/* Flowing Items Layer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 32,
            position: 'absolute',
            top: 20,
            left: 0,
            transform: `translateX(-${scrollOffset}px)`,
            willChange: 'transform',
          }}
        >
          {renderItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              style={{
                width: 320,
                height: 220,
                backgroundColor: item.color || '#3B82F6',
                border: `6px solid ${theme.ink}`,
                borderRadius: 28,
                boxShadow: `0 14px 0 ${theme.ink}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '22px 20px',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {/* Card Header Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontFamily: 'Arial Black, sans-serif',
                    fontSize: 14,
                    padding: '4px 10px',
                    borderRadius: 12,
                    border: '3px solid #000000',
                  }}
                >
                  {item.badge || 'PING'}
                </span>
                <span style={{ fontSize: 24 }}>💬</span>
              </div>

              {/* Card Main Text */}
              <div
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  fontSize: 28,
                  color: '#FFFFFF',
                  textShadow: '0 3px 0 #000000',
                  letterSpacing: '1px',
                  lineHeight: 1.15,
                }}
              >
                {item.label}
              </div>

              {/* Card Footer Sub */}
              <div
                style={{
                  fontFamily: 'Arial Black, sans-serif',
                  fontSize: 14,
                  color: '#FFFFFF',
                  opacity: 0.9,
                }}
              >
                {item.sub || ''}
              </div>
            </div>
          ))}
        </div>

        {/* INDUSTRIAL CONVEYOR BELT TRACK */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            width: '100%',
            height: 50,
            backgroundColor: '#1E293B',
            borderTop: `6px solid ${theme.ink}`,
            borderBottom: `8px solid ${theme.ink}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {/* Animated Rollers / Gears */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#94A3B8',
                border: '4px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${rollerRotation}deg)`,
              }}
            >
              <div style={{ width: 6, height: 20, backgroundColor: '#000000' }} />
              <div style={{ position: 'absolute', width: 20, height: 6, backgroundColor: '#000000' }} />
            </div>
          ))}
        </div>

        {/* Left/Right Edge Gradient Fade Masks */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 120,
            height: '100%',
            background: `linear-gradient(to right, ${theme.bg}, transparent)`,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: '100%',
            background: `linear-gradient(to left, ${theme.bg}, transparent)`,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      </div>
    </div>
  );
};
