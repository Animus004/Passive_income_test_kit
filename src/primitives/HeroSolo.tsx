import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export type HeroIconType = 'brain' | 'coffee' | 'phone' | 'battery' | 'clock' | 'bulb' | 'alert';

export interface HeroSoloProps {
  theme: ColorTheme;
  title?: string;
  badgeText?: string;
  hasEyes?: boolean;
  glance?: 'center' | 'left' | 'right' | 'up' | 'down' | 'cross';
  iconType?: HeroIconType;
  customSvg?: React.ReactNode;
  isHook?: boolean;
}

export const HeroSolo: React.FC<HeroSoloProps> = ({
  theme,
  title,
  badgeText,
  hasEyes = true,
  glance = 'center',
  iconType = 'brain',
  customSvg,
  isHook = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. High-Velocity Meteor Slam Entrance (Frames 0 to 8)
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 360, mass: 0.45 },
  });

  // Physical drop translation
  const translateY = interpolate(entrance, [0, 1], [-550, 0]);

  // Exaggerated Comic Squash & Stretch on Impact (Frames 5 to 14)
  let impactSquashX = 1;
  let impactSquashY = 1;
  if (frame >= 5 && frame <= 15) {
    if (frame <= 8) {
      const t = (frame - 5) / 3;
      impactSquashX = 1 + 0.38 * Math.sin(t * Math.PI);
      impactSquashY = 1 - 0.35 * Math.sin(t * Math.PI);
    } else {
      const t = (frame - 8) / 7;
      impactSquashX = 1 - 0.14 * Math.sin(t * Math.PI);
      impactSquashY = 1 + 0.16 * Math.sin(t * Math.PI);
    }
  }

  // Natural idle breathing physics once settled
  const breath = frame > 15 ? Math.sin(frame * 0.16) * 0.03 : 0;
  const scaleX = (interpolate(entrance, [0, 1], [0.4, 1]) * impactSquashX) + breath;
  const scaleY = (interpolate(entrance, [0, 1], [1.5, 1]) * impactSquashY) - breath;

  // 2. Screen Impact Jolt (Frames 5 to 10)
  const isJolt = isHook && frame >= 5 && frame <= 10;
  const joltY = isJolt ? Math.sin((frame - 5) * 3.2) * 12 : 0;
  const joltX = isJolt ? Math.cos((frame - 5) * 3.8) * 7 : 0;

  // 3. Fast Comic Badge Slam (Frames 1 to 10)
  const badgeSpring = spring({
    frame: Math.max(0, frame - 1),
    fps,
    config: { damping: 11, stiffness: 320, mass: 0.5 },
  });
  const badgeY = interpolate(badgeSpring, [0, 1], [-80, 0]);
  const badgeRotate = interpolate(badgeSpring, [0, 1], [14, -3.5]);

  // 4. Dynamic Camera Snap Zoom (Punch-in at Frame 32-50 for high retention)
  const punchSpring = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.6 },
  });
  const cameraZoom = isHook ? interpolate(punchSpring, [0, 1], [1.0, 1.15]) : 1.0;
  const cameraPanY = isHook ? interpolate(punchSpring, [0, 1], [0, 40]) : 0;

  // 5. Comic Panic & Shock Reaction (Frame 34 onwards)
  const isPanicked = isHook && frame >= 34;
  const panicGlance = isPanicked && glance === 'center' ? (frame % 20 < 10 ? 'left' : 'right') : glance;
  const currentPupilScale = isPanicked ? 0.54 : 0.42;

  // Comic Notice Alert Pill (Frame 20 to 90)
  const alertPillSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 10, stiffness: 280, mass: 0.5 },
  });

  const renderCharacterBody = () => {
    if (customSvg) return customSvg;

    switch (iconType) {
      case 'coffee':
        return (
          <div
            style={{
              width: 320,
              height: 320,
              backgroundColor: '#D97706',
              borderRadius: '24px 24px 140px 140px',
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Steam spirals */}
            <div
              style={{
                position: 'absolute',
                top: -38,
                display: 'flex',
                gap: 16,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 24,
                    backgroundColor: theme.ink,
                    borderRadius: 3,
                    transform: `translateY(${Math.sin((frame + i * 10) * 0.2) * 6}px)`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>

            {/* Mug Handle */}
            <div
              style={{
                position: 'absolute',
                right: -70,
                top: 60,
                width: 90,
                height: 140,
                borderRadius: '0 70px 70px 0',
                border: `8px solid ${theme.ink}`,
                backgroundColor: 'transparent',
              }}
            />
            {hasEyes && (
              <div style={{ position: 'absolute', top: 90, zIndex: 10 }}>
                <GooglyEyes
                  size={72}
                  spacing={14}
                  glance={panicGlance}
                  inkColor={theme.ink}
                  delay={1}
                  panicked={isPanicked}
                  pupilScale={currentPupilScale}
                />
              </div>
            )}
            {/* Expressive Mouth (panics to nervous open grimace) */}
            <div
              style={{
                position: 'absolute',
                bottom: 55,
                width: isPanicked ? 34 : 38,
                height: isPanicked ? 14 : 18,
                borderRadius: isPanicked ? '6px' : '0 0 20px 20px',
                border: `6px solid ${theme.ink}`,
                borderTop: isPanicked ? `6px solid ${theme.ink}` : 'none',
                transform: isPanicked ? `rotate(${Math.sin(frame * 0.8) * 4}deg)` : undefined,
              }}
            />
          </div>
        );

      case 'phone':
        return (
          <div
            style={{
              width: 260,
              height: 420,
              backgroundColor: '#38BDF8',
              borderRadius: 44,
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Speaker bar */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                width: 60,
                height: 10,
                backgroundColor: theme.ink,
                borderRadius: 5,
              }}
            />
            {hasEyes && (
              <div style={{ position: 'absolute', top: 120, zIndex: 10 }}>
                <GooglyEyes
                  size={68}
                  spacing={12}
                  glance={panicGlance}
                  inkColor={theme.ink}
                  delay={1}
                  panicked={isPanicked}
                  pupilScale={currentPupilScale}
                />
              </div>
            )}
            {/* Expressive Mouth */}
            <div
              style={{
                position: 'absolute',
                bottom: 120,
                width: isPanicked ? 32 : 36,
                height: isPanicked ? 14 : 16,
                borderRadius: isPanicked ? '6px' : '0 0 20px 20px',
                border: `6px solid ${theme.ink}`,
                borderTop: isPanicked ? `6px solid ${theme.ink}` : 'none',
                transform: isPanicked ? `rotate(${Math.sin(frame * 0.8) * 4}deg)` : undefined,
              }}
            />
          </div>
        );

      case 'battery':
        return (
          <div
            style={{
              width: 250,
              height: 380,
              backgroundColor: '#10B981',
              borderRadius: 36,
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Battery Terminal Nub */}
            <div
              style={{
                position: 'absolute',
                top: -28,
                width: 70,
                height: 24,
                backgroundColor: theme.ink,
                borderRadius: '12px 12px 0 0',
              }}
            />
            {hasEyes && (
              <div style={{ position: 'absolute', top: 110, zIndex: 10 }}>
                <GooglyEyes
                  size={68}
                  spacing={14}
                  glance={panicGlance}
                  inkColor={theme.ink}
                  delay={1}
                  panicked={isPanicked}
                  pupilScale={currentPupilScale}
                />
              </div>
            )}
            {/* Expressive Mouth */}
            <div
              style={{
                position: 'absolute',
                bottom: 100,
                width: isPanicked ? 32 : 36,
                height: isPanicked ? 14 : 16,
                borderRadius: isPanicked ? '6px' : '0 0 20px 20px',
                border: `6px solid ${theme.ink}`,
                borderTop: isPanicked ? `6px solid ${theme.ink}` : 'none',
                transform: isPanicked ? `rotate(${Math.sin(frame * 0.8) * 4}deg)` : undefined,
              }}
            />
          </div>
        );

      case 'clock':
        return (
          <div
            style={{
              width: 320,
              height: 320,
              backgroundColor: '#F59E0B',
              borderRadius: 160,
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Alarm Bells */}
            <div
              style={{
                position: 'absolute',
                top: -24,
                left: 20,
                width: 70,
                height: 40,
                borderRadius: '35px 35px 0 0',
                backgroundColor: '#EF4444',
                border: `6px solid ${theme.ink}`,
                transform: `rotate(${isPanicked ? -30 + Math.sin(frame * 0.8) * 8 : -30}deg)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -24,
                right: 20,
                width: 70,
                height: 40,
                borderRadius: '35px 35px 0 0',
                backgroundColor: '#EF4444',
                border: `6px solid ${theme.ink}`,
                transform: `rotate(${isPanicked ? 30 - Math.sin(frame * 0.8) * 8 : 30}deg)`,
              }}
            />
            {hasEyes && (
              <div style={{ position: 'absolute', top: 90, zIndex: 10 }}>
                <GooglyEyes
                  size={70}
                  spacing={14}
                  glance={panicGlance}
                  inkColor={theme.ink}
                  delay={1}
                  panicked={isPanicked}
                  pupilScale={currentPupilScale}
                />
              </div>
            )}
            {/* Expressive Mouth */}
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                width: isPanicked ? 34 : 38,
                height: isPanicked ? 14 : 18,
                borderRadius: isPanicked ? '6px' : '0 0 20px 20px',
                border: `6px solid ${theme.ink}`,
                borderTop: isPanicked ? `6px solid ${theme.ink}` : 'none',
                transform: isPanicked ? `rotate(${Math.sin(frame * 0.8) * 4}deg)` : undefined,
              }}
            />
          </div>
        );

      case 'bulb':
        return (
          <div
            style={{
              width: 300,
              height: 360,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Glass bulb head */}
            <div
              style={{
                width: 280,
                height: 280,
                backgroundColor: '#FDE047',
                borderRadius: '140px 140px 80px 80px',
                border: `8px solid ${theme.ink}`,
                boxShadow: `0 14px 0 ${theme.ink}`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Filament loop */}
              <svg
                style={{ position: 'absolute', top: 30, width: 80, height: 60 }}
                viewBox="0 0 80 60"
              >
                <path
                  d="M 20 60 L 20 30 C 20 10, 35 10, 40 30 C 45 10, 60 10, 60 30 L 60 60"
                  stroke={theme.ink}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              {hasEyes && (
                <div style={{ position: 'absolute', top: 85, zIndex: 10 }}>
                  <GooglyEyes
                    size={70}
                    spacing={14}
                    glance={panicGlance}
                    inkColor={theme.ink}
                    delay={1}
                    panicked={isPanicked}
                    pupilScale={currentPupilScale}
                  />
                </div>
              )}
              {/* Expressive Mouth */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 45,
                  width: isPanicked ? 32 : 36,
                  height: isPanicked ? 14 : 16,
                  borderRadius: isPanicked ? '6px' : '0 0 20px 20px',
                  border: `6px solid ${theme.ink}`,
                  borderTop: isPanicked ? `6px solid ${theme.ink}` : 'none',
                  transform: isPanicked ? `rotate(${Math.sin(frame * 0.8) * 4}deg)` : undefined,
                }}
              />
            </div>

            {/* Screw base threads */}
            <div
              style={{
                width: 120,
                height: 50,
                backgroundColor: '#94A3B8',
                border: `7px solid ${theme.ink}`,
                borderTop: 'none',
                borderRadius: '0 0 20px 20px',
                marginTop: -4,
                boxShadow: `0 8px 0 ${theme.ink}`,
              }}
            />
          </div>
        );

      case 'alert':
        return (
          <div
            style={{
              width: 340,
              height: 320,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Warning Triangle */}
            <svg
              width="340"
              height="320"
              viewBox="0 0 340 320"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <polygon
                points="170,20 325,295 15,295"
                fill="#EF4444"
                stroke={theme.ink}
                strokeWidth="16"
                strokeLinejoin="round"
              />
              <polygon
                points="170,60 295,280 45,280"
                fill="#F87171"
                stroke={theme.ink}
                strokeWidth="6"
              />
            </svg>

            {hasEyes && (
              <div style={{ position: 'absolute', top: 125, zIndex: 10 }}>
                <GooglyEyes
                  size={64}
                  spacing={12}
                  glance={panicGlance}
                  inkColor={theme.ink}
                  delay={1}
                  panicked={isPanicked}
                  pupilScale={currentPupilScale}
                />
              </div>
            )}
            {/* Expressive Mouth */}
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                width: isPanicked ? 30 : 34,
                height: isPanicked ? 14 : 16,
                borderRadius: isPanicked ? '6px' : '0 0 20px 20px',
                border: `6px solid ${theme.ink}`,
                borderTop: isPanicked ? `6px solid ${theme.ink}` : 'none',
                transform: isPanicked ? `rotate(${Math.sin(frame * 0.8) * 4}deg)` : undefined,
              }}
            />
          </div>
        );

      case 'brain':
      default:
        return (
          <div
            style={{
              width: 360,
              height: 300,
              backgroundColor: theme.primary,
              borderRadius: '160px 160px 110px 110px',
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            {/* Brain wrinkle details */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              viewBox="0 0 360 300"
            >
              <path
                d="M 180 30 Q 180 150 180 270 M 90 90 Q 140 130 90 200 M 270 90 Q 220 130 270 200"
                stroke={theme.ink}
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {hasEyes && (
              <div style={{ position: 'absolute', top: 95, zIndex: 10 }}>
                <GooglyEyes
                  size={72}
                  spacing={14}
                  glance={panicGlance}
                  inkColor={theme.ink}
                  delay={1}
                  panicked={isPanicked}
                  pupilScale={currentPupilScale}
                />
              </div>
            )}

            {/* Expressive Mouth */}
            <div
              style={{
                position: 'absolute',
                bottom: 50,
                width: isPanicked ? 34 : 38,
                height: isPanicked ? 14 : 18,
                borderRadius: isPanicked ? '6px' : '0 0 20px 20px',
                border: `6px solid ${theme.ink}`,
                borderTop: isPanicked ? `6px solid ${theme.ink}` : 'none',
                transform: isPanicked ? `rotate(${Math.sin(frame * 0.8) * 4}deg)` : undefined,
              }}
            />
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
        position: 'relative',
        paddingBottom: 220,
        transform: `translate(${joltX}px, ${joltY}px) scale(${cameraZoom}) translateY(${cameraPanY}px)`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Fast Comic Stamp Badge at top */}
      {badgeText && (
        <div
          style={{
            backgroundColor: theme.accent,
            color: '#FFFFFF',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 28,
            fontWeight: 900,
            textTransform: 'uppercase',
            padding: '12px 32px',
            borderRadius: 32,
            border: `6px solid ${theme.ink}`,
            boxShadow: `0 8px 0 ${theme.ink}`,
            marginBottom: 36,
            transform: `translateY(${badgeY}px) rotate(${badgeRotate}deg) scale(${badgeSpring})`,
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 30,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              display: 'inline-block',
              boxShadow: '0 0 8px #EF4444',
            }}
          />
          {badgeText}
        </div>
      )}

      {/* 2. Hero Character Container */}
      <div
        style={{
          transform: `translateY(${translateY}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'bottom center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Floating Comic Action Micro-Props: Sweat Drops (Frame 14 to 48) */}
        {frame >= 14 && frame <= 48 && (
          <>
            {/* Left Sweat Drop */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: -40,
                transform: `translate(${interpolate(frame, [14, 48], [0, -35])}px, ${interpolate(frame, [14, 25, 48], [0, -25, 40])}px) scale(${interpolate(frame, [14, 18, 48], [0, 1.2, 0])}) rotate(-25deg)`,
                zIndex: 25,
                pointerEvents: 'none',
              }}
            >
              <svg width="34" height="46" viewBox="0 0 34 46">
                <path
                  d="M 17 0 C 17 0, 0 22, 0 32 A 17 17 0 0 0 34 32 C 34 22, 17 0, 17 0 Z"
                  fill="#38BDF8"
                  stroke={theme.ink}
                  strokeWidth="5"
                />
              </svg>
            </div>
            {/* Right Sweat Drop */}
            <div
              style={{
                position: 'absolute',
                top: 30,
                right: -40,
                transform: `translate(${interpolate(frame, [16, 48], [0, 35])}px, ${interpolate(frame, [16, 27, 48], [0, -20, 45])}px) scale(${interpolate(frame, [16, 20, 48], [0, 1.1, 0])}) rotate(25deg)`,
                zIndex: 25,
                pointerEvents: 'none',
              }}
            >
              <svg width="28" height="38" viewBox="0 0 34 46">
                <path
                  d="M 17 0 C 17 0, 0 22, 0 32 A 17 17 0 0 0 34 32 C 34 22, 17 0, 17 0 Z"
                  fill="#38BDF8"
                  stroke={theme.ink}
                  strokeWidth="5"
                />
              </svg>
            </div>
          </>
        )}

        {/* Floating Comic Alert Bubble (Frame 20 onwards) - Positioned safely to the right of mug */}
        {isHook && frame >= 20 && (
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: 350,
              backgroundColor: '#FACC15',
              color: theme.ink,
              fontFamily: 'Inter, Arial, sans-serif',
              fontWeight: 900,
              fontSize: 20,
              padding: '8px 18px',
              borderRadius: '20px 20px 20px 4px',
              border: `5px solid ${theme.ink}`,
              boxShadow: `0 6px 0 ${theme.ink}`,
              transform: `scale(${alertPillSpring}) rotate(8deg)`,
              zIndex: 35,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ REALITY CHECK
          </div>
        )}

        {/* Character Core Body */}
        {renderCharacterBody()}

        {/* Title underneath */}
        {title && (
          <div
            style={{
              marginTop: 40,
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

        {/* 3. Ground Ripple Shockwave Ring on Landing (Frames 6 to 22) - Positioned right under the character base */}
        {frame >= 6 && frame <= 22 && (
          <svg
            style={{
              position: 'absolute',
              bottom: 80,
              left: '50%',
              transform: `translateX(-50%) scale(${interpolate(frame, [6, 22], [0.3, 2.4])})`,
              opacity: interpolate(frame, [6, 9, 22], [0, 0.9, 0]),
              pointerEvents: 'none',
              zIndex: 1,
            }}
            width="340"
            height="80"
            viewBox="0 0 340 80"
          >
            <ellipse
              cx="170"
              cy="40"
              rx="150"
              ry="25"
              fill="none"
              stroke={theme.ink}
              strokeWidth="8"
            />
            <ellipse
              cx="170"
              cy="40"
              rx="110"
              ry="18"
              fill="none"
              stroke={theme.accent}
              strokeWidth="5"
              strokeDasharray="12 8"
            />
          </svg>
        )}

        {/* 4. Comic Radial Action Burst Lines (Frames 6 to 18) - Centered directly on character */}
        {frame >= 6 && frame <= 18 && (
          <svg
            style={{
              position: 'absolute',
              top: '35%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${interpolate(frame, [6, 18], [0.5, 1.45])})`,
              opacity: interpolate(frame, [6, 8, 18], [0, 1, 0]),
              pointerEvents: 'none',
              zIndex: 20,
            }}
            width="500"
            height="500"
            viewBox="0 0 500 500"
          >
            <line x1="70" y1="250" x2="15" y2="250" stroke={theme.ink} strokeWidth="8" strokeLinecap="round" />
            <line x1="430" y1="250" x2="485" y2="250" stroke={theme.ink} strokeWidth="8" strokeLinecap="round" />
            <line x1="120" y1="120" x2="75" y2="75" stroke={theme.ink} strokeWidth="8" strokeLinecap="round" />
            <line x1="380" y1="120" x2="425" y2="75" stroke={theme.ink} strokeWidth="8" strokeLinecap="round" />
            <line x1="130" y1="370" x2="85" y2="415" stroke={theme.ink} strokeWidth="8" strokeLinecap="round" />
            <line x1="370" y1="370" x2="415" y2="415" stroke={theme.ink} strokeWidth="8" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
};
