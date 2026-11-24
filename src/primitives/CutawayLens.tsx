import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ColorTheme } from '../theme/tokens';
import { GooglyEyes } from '../components/GooglyEyes';

export type CutawayTargetType = 'brain' | 'coffee' | 'phone' | 'battery' | 'laptop' | 'clock' | 'bulb';

export interface CutawayLensProps {
  theme: ColorTheme;
  title?: string;
  statPercent?: string;
  subLabel?: string;
  targetProp?: CutawayTargetType;
}

export const CutawayLens: React.FC<CutawayLensProps> = ({
  theme,
  title,
  statPercent,
  subLabel,
  targetProp = 'brain',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Detect battery/energy mode from targetProp, subLabel, or title
  const isBatteryMode =
    targetProp === 'battery' ||
    Boolean(subLabel && /battery|energy|power|charge|drain|dip|crash/i.test(subLabel)) ||
    Boolean(title && /battery|energy|power|charge|drain|dip|crash/i.test(title));

  // Parse target percentage (e.g. "15%" -> 15, default 15 for battery dip)
  const parsedPercent = statPercent ? parseFloat(statPercent.replace(/[^0-9.]/g, '')) : 15;
  const targetPercent = isNaN(parsedPercent) ? 15 : Math.max(5, Math.min(100, parsedPercent));

  // Battery liquid drain animation from 100 down to targetPercent over frames 12..40
  const batteryLevel = interpolate(frame, [12, 42], [100, targetPercent], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const isLowBattery = batteryLevel <= 25;
  const batteryColor = batteryLevel > 50 ? '#10B981' : batteryLevel > 25 ? '#F59E0B' : '#EF4444';
  const lowBatteryPulse = isLowBattery ? Math.sin(frame * 0.45) * 0.08 : 0;

  // 1. Base Pop
  const basePop = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 180, mass: 0.8 },
  });

  // 2. Sliding Lens Spring (enters at frame 10)
  const lensSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 10, stiffness: 140, mass: 1.0 },
  });

  const lensTranslateX = interpolate(lensSpring, [0, 1], [-450, 0]);
  const lensRotate = interpolate(lensSpring, [0, 1], [-35, -12]);

  // Floating gear spin inside the lens for mechanical/brain mode
  const gearSpin = frame * 2.2;

  const renderBaseShape = () => {
    switch (targetProp) {
      case 'battery':
        return (
          <div
            style={{
              width: 280,
              height: 380,
              backgroundColor: theme.primary,
              borderRadius: 36,
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.45,
            }}
          >
            {/* Battery Positive Terminal Stub */}
            <div
              style={{
                position: 'absolute',
                top: -24,
                width: 76,
                height: 24,
                backgroundColor: theme.ink,
                borderRadius: '12px 12px 0 0',
              }}
            />
            <div style={{ position: 'absolute', top: 120 }}>
              <GooglyEyes size={58} spacing={12} glance="down" inkColor={theme.ink} />
            </div>
          </div>
        );

      case 'coffee':
        return (
          <div
            style={{
              width: 340,
              height: 320,
              backgroundColor: theme.primary,
              borderRadius: '24px 24px 140px 140px',
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.45,
            }}
          >
            {/* Handle */}
            <div
              style={{
                position: 'absolute',
                right: -65,
                top: 60,
                width: 80,
                height: 130,
                borderRadius: '0 65px 65px 0',
                border: `8px solid ${theme.ink}`,
              }}
            />
            <div style={{ position: 'absolute', top: 90 }}>
              <GooglyEyes size={58} spacing={12} glance="center" inkColor={theme.ink} />
            </div>
          </div>
        );

      case 'laptop':
      case 'phone':
        return (
          <div
            style={{
              width: 300,
              height: 380,
              backgroundColor: theme.primary,
              borderRadius: 36,
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.45,
            }}
          >
            <div style={{ position: 'absolute', top: 100 }}>
              <GooglyEyes size={58} spacing={12} glance="center" inkColor={theme.ink} />
            </div>
          </div>
        );

      case 'brain':
      default:
        return (
          <div
            style={{
              width: 380,
              height: 320,
              backgroundColor: theme.primary,
              borderRadius: '170px 170px 120px 120px',
              border: `8px solid ${theme.ink}`,
              boxShadow: `0 14px 0 ${theme.ink}`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.45,
            }}
          >
            <div style={{ position: 'absolute', top: 100 }}>
              <GooglyEyes size={60} spacing={12} glance="center" inkColor={theme.ink} />
            </div>
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
            zIndex: 30,
          }}
        >
          {title}
        </div>
      )}

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${basePop})`,
        }}
      >
        {/* Dynamic Base Shape */}
        {renderBaseShape()}

        {/* The X-Ray / Magnifying Cutaway Lens */}
        <div
          style={{
            position: 'absolute',
            transform: `translateX(${lensTranslateX}px) rotate(${lensRotate}deg)`,
            transformOrigin: 'center center',
            zIndex: 20,
          }}
        >
          {/* Glass Lens Circle */}
          <div
            style={{
              width: 330,
              height: 330,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: `10px solid ${theme.ink}`,
              boxShadow: `0 16px 0 ${theme.ink}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {isBatteryMode ? (
              /* DEDICATED BATTERY DRAIN MODE: Real cartoon battery draining down */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: -10,
                  transform: `scale(${1 + lowBatteryPulse})`,
                }}
              >
                {/* Battery Container Shell */}
                <div
                  style={{
                    position: 'relative',
                    width: 170,
                    height: 84,
                    border: `6px solid ${theme.ink}`,
                    borderRadius: 16,
                    backgroundColor: '#F1F5F9',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: `0 6px 0 ${theme.ink}`,
                  }}
                >
                  {/* Right Terminal Nub [+] */}
                  <div
                    style={{
                      position: 'absolute',
                      right: -14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 10,
                      height: 34,
                      backgroundColor: theme.ink,
                      borderRadius: '0 6px 6px 0',
                    }}
                  />

                  {/* Draining Liquid Fill Bar */}
                  <div
                    style={{
                      width: `${batteryLevel}%`,
                      height: '100%',
                      backgroundColor: batteryColor,
                      borderRadius: 10,
                      transition: 'width 0.1s linear',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Liquid Glint / Highlight */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: 4,
                        right: 4,
                        height: 8,
                        backgroundColor: 'rgba(255,255,255,0.4)',
                        borderRadius: 4,
                      }}
                    />
                  </div>

                  {/* Blinking Warning Symbol in Battery */}
                  {isLowBattery && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: 32,
                        zIndex: 5,
                      }}
                    >
                      ⚡
                    </div>
                  )}
                </div>

                {/* Googly Eyes drooping/exhausted above battery */}
                <div style={{ marginTop: 12 }}>
                  <GooglyEyes size={46} spacing={8} glance={isLowBattery ? 'down' : 'center'} inkColor={theme.ink} />
                </div>
              </div>
            ) : (
              /* MECHANICAL / BRAIN / GEAR MODE */
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: 25,
                    transform: `rotate(${gearSpin}deg)`,
                  }}
                >
                  <svg width="110" height="110" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="34" fill={theme.primary} stroke={theme.ink} strokeWidth="7" />
                    <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke={theme.ink} strokeWidth="6" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                      <rect
                        key={ang}
                        x="45"
                        y="6"
                        width="10"
                        height="16"
                        rx="3"
                        fill={theme.ink}
                        transform={`rotate(${ang} 50 50)`}
                      />
                    ))}
                  </svg>
                </div>

                {/* Googly Eyes inside the machine */}
                <div style={{ marginTop: 55, zIndex: 10 }}>
                  <GooglyEyes size={58} spacing={10} glance="down" inkColor={theme.ink} delay={14} />
                </div>
              </>
            )}

            {/* Stat callout in center */}
            <div
              style={{
                marginTop: isBatteryMode ? 8 : 18,
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: isBatteryMode ? 44 : 48,
                fontWeight: 900,
                color: isBatteryMode ? batteryColor : theme.accent,
                letterSpacing: '-1px',
              }}
            >
              {statPercent || (isBatteryMode ? `${Math.round(batteryLevel)}%` : '')}
            </div>

            {subLabel && (
              <div
                style={{
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: 16,
                  fontWeight: 900,
                  color: theme.ink,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  padding: '0 12px',
                }}
              >
                {subLabel}
              </div>
            )}
          </div>

          {/* Wooden Magnifying Glass Handle */}
          <div
            style={{
              position: 'absolute',
              bottom: -110,
              right: -60,
              width: 34,
              height: 140,
              backgroundColor: '#B45309',
              borderRadius: 18,
              border: `7px solid ${theme.ink}`,
              boxShadow: `0 8px 0 ${theme.ink}`,
              transform: 'rotate(-42deg)',
              zIndex: -1,
            }}
          />
        </div>
      </div>
    </div>
  );
};
