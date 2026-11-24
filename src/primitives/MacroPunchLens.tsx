import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';

export type MacroTargetType = 'finger_keyboard' | 'sweating_eye' | 'vibrating_coffee' | 'notification_badge';

export interface MacroPunchLensProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  target?: MacroTargetType;
  keyLabel?: string;
  alertSubtitle?: string;
}

export const MacroPunchLens: React.FC<MacroPunchLensProps> = ({
  theme,
  title,
  badgeText,
  target = 'finger_keyboard',
  keyLabel = 'ENTER',
  alertSubtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Violent Snap Zoom (1.0 -> 1.38x scale punch)
  const zoomSpring = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 280, mass: 0.5 },
  });

  const zoomScale = interpolate(zoomSpring, [0, 1], [0.8, 1.35]);

  // Micro Camera Jitter & Tremble (simulating intense human nervous panic)
  const jitterX = Math.sin(frame * 1.4) * 3.5;
  const jitterY = Math.cos(frame * 1.8) * 3.5;

  const renderTarget = () => {
    switch (target) {
      case 'finger_keyboard': {
        // Finger trembling 15px above an illuminated mechanical keycap
        const fingerHoverY = Math.sin(frame * 0.4) * 12 + jitterY;
        return (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* The Trembling Finger */}
            <div
              style={{
                position: 'absolute',
                top: -190 + fingerHoverY,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `rotate(${Math.sin(frame * 0.3) * 4}deg)`,
              }}
            >
              {/* Arm / Finger Segment */}
              <div
                style={{
                  width: 90,
                  height: 220,
                  backgroundColor: '#FBCFE8', // Flesh pink
                  border: '8px solid #000000',
                  borderRadius: 45,
                  boxShadow: '0 12px 0 rgba(0,0,0,0.25)',
                  position: 'relative',
                }}
              >
                {/* Finger Nail */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 52,
                    height: 42,
                    backgroundColor: '#FFFFFF',
                    border: '5px solid #000000',
                    borderRadius: '20px 20px 8px 8px',
                  }}
                />
                {/* Sweat Drop on Finger */}
                <div style={{ position: 'absolute', top: 50, right: -25, fontSize: 32 }}>💦</div>
              </div>
              {/* Hesitation Ripple Lines */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <span style={{ fontSize: 24 }}>⚡</span>
              </div>
            </div>

            {/* Giant Mechanical Keycap */}
            <div
              style={{
                width: 380,
                height: 220,
                backgroundColor: '#38BDF8', // Vivid Sky Blue
                border: '10px solid #000000',
                borderRadius: 36,
                boxShadow: '0 28px 0 #0284C7, 0 36px 0 #000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginTop: 60,
              }}
            >
              {/* Keycap Bevel Shading */}
              <div
                style={{
                  position: 'absolute',
                  inset: 12,
                  borderRadius: 24,
                  border: '4px solid rgba(255,255,255,0.4)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  fontSize: 48,
                  color: '#FFFFFF',
                  textShadow: '0 5px 0 #000000',
                  letterSpacing: '2px',
                  textAlign: 'center',
                }}
              >
                {keyLabel}
              </div>
              <div
                style={{
                  fontFamily: 'Arial Black, sans-serif',
                  fontSize: 18,
                  color: '#000000',
                  backgroundColor: '#FFFFFF',
                  padding: '4px 14px',
                  borderRadius: 12,
                  marginTop: 8,
                  border: '3px solid #000000',
                }}
              >
                ENTER TO SEND
              </div>
            </div>
          </div>
        );
      }

      case 'sweating_eye': {
        const pupilScale = 1 + Math.sin(frame * 0.3) * 0.25;
        return (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Giant Eye Oval */}
            <div
              style={{
                width: 380,
                height: 280,
                backgroundColor: '#FFFFFF',
                border: '12px solid #000000',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 24px 0 rgba(0,0,0,0.25)',
              }}
            >
              {/* Twitching Pupil */}
              <div
                style={{
                  width: 140 * pupilScale,
                  height: 140 * pupilScale,
                  backgroundColor: '#000000',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translate(${jitterX}px, ${jitterY}px)`,
                }}
              >
                <div style={{ width: 36, height: 36, backgroundColor: '#FFFFFF', borderRadius: '50%', alignSelf: 'flex-start', marginTop: 18, marginLeft: 18 }} />
              </div>

              {/* Bloodshot capillary veins */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <path d="M 30 140 Q 70 130 100 145" fill="none" stroke="#EF4444" strokeWidth="4" />
                <path d="M 350 140 Q 310 130 280 145" fill="none" stroke="#EF4444" strokeWidth="4" />
              </svg>

              {/* Giant Rolling Sweat Bead */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -35,
                  right: 40,
                  fontSize: 54,
                  transform: `translateY(${Math.min(40, frame * 1.5)}px)`,
                }}
              >
                💧
              </div>
            </div>
          </div>
        );
      }

      case 'notification_badge':
      default: {
        return (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pulsating Sonar Waves */}
            {[1, 2].map((ring) => (
              <div
                key={ring}
                style={{
                  position: 'absolute',
                  width: 280 + ring * 100,
                  height: 280 + ring * 100,
                  borderRadius: '50%',
                  border: '6px dashed #EF4444',
                  opacity: Math.max(0, 0.7 - (frame % 30) / 30),
                  transform: `scale(${1 + ((frame + ring * 15) % 30) * 0.03})`,
                }}
              />
            ))}

            {/* Red Alert Sphere */}
            <div
              style={{
                width: 260,
                height: 260,
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                border: '10px solid #000000',
                boxShadow: '0 20px 0 #B91C1C, 0 28px 0 #000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 80 }}>💬</div>
              <div
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  fontSize: 52,
                  color: '#FFFFFF',
                  textShadow: '0 4px 0 #000000',
                }}
              >
                1 NEW
              </div>
            </div>
          </div>
        );
      }
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
        overflow: 'hidden',
      }}
    >
      {/* MANGA / COMIC SPEED STREAKS BURSTING FROM CENTER */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 1800,
          height: 1800,
          transform: `translate(-50%, -50%) rotate(${frame * 0.4}deg)`,
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      >
        <svg width="1800" height="1800" viewBox="0 0 1800 1800">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            return (
              <polygon
                key={i}
                points="900,900 860,0 940,0"
                fill={theme.ink}
                transform={`rotate(${angle} 900 900)`}
              />
            );
          })}
        </svg>
      </div>

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
            zIndex: 10,
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
            color: '#FFFFFF',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: 10,
            textAlign: 'center',
            textShadow: '0 4px 0 rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          {title}
        </div>
      )}

      {/* Alert Subtitle Pill */}
      {alertSubtitle && (
        <div
          style={{
            fontFamily: 'Arial Black, sans-serif',
            fontSize: 20,
            color: '#EF4444',
            backgroundColor: '#FFFFFF',
            border: `4px solid ${theme.ink}`,
            borderRadius: 16,
            padding: '4px 18px',
            marginBottom: 40,
            boxShadow: `0 6px 0 ${theme.ink}`,
            zIndex: 10,
          }}
        >
          {alertSubtitle}
        </div>
      )}

      {/* MACRO PUNCH FOCAL CONTAINER (Zoomed + Jittered) */}
      <div
        style={{
          transform: `scale(${zoomScale}) translate(${jitterX}px, ${jitterY}px)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        {renderTarget()}
      </div>
    </div>
  );
};
