import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface GooglyEyesProps {
  size?: number;          // Diameter of each eyeball in px
  spacing?: number;       // Gap between eyes
  glance?: 'center' | 'left' | 'right' | 'up' | 'down' | 'cross';
  inkColor?: string;      // Border / pupil color (default #141414)
  delay?: number;         // Frame delay before eyes appear / bounce
  pupilScale?: number;    // Pupil radius ratio (0.35 to 0.5)
  pupilSize?: number;     // Absolute diameter of pupil in px
  blinkInterval?: number; // Frames between blinks
  panicked?: boolean;     // Rapid nervous micro-twitch & anxious brows
}

export const GooglyEyes: React.FC<GooglyEyesProps> = ({
  size = 54,
  spacing = 8,
  glance = 'center',
  inkColor = '#141414',
  delay = 0,
  pupilScale = 0.42,
  pupilSize: explicitPupilSize,
  blinkInterval = 95,
  panicked = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relFrame = Math.max(0, frame - delay);

  // Derive pupil scale if explicit pupilSize provided
  const basePupilScale = explicitPupilSize ? explicitPupilSize / size : pupilScale;

  // 1. Entrance Pop Physics: Squash and stretch on eye appearance
  const eyePop = spring({
    frame: relFrame,
    fps,
    config: { damping: 9, stiffness: 240, mass: 0.5 },
  });

  // 2. Physical Pupil Lag & Jiggle: Reacts with elastic inertia
  const pupilLagX = spring({
    frame: relFrame,
    fps,
    config: { damping: 11, stiffness: 140, mass: 1.1 },
  });

  const pupilLagY = spring({
    frame: relFrame + 2, // Slight offset for natural organic wobble
    fps,
    config: { damping: 8, stiffness: 160, mass: 0.9 },
  });

  // 3. Panic micro-jitter or subtle periodic micro-jiggle (toy physics wobble)
  const panicWobbleX = panicked ? Math.sin(frame * 0.95) * 3.8 : 0;
  const panicWobbleY = panicked ? Math.cos(frame * 1.15) * 2.8 : 0;
  const wobbleX = (Math.sin(frame * 0.22) * 2.2) + panicWobbleX;
  const wobbleY = (Math.cos(frame * 0.18) * 1.8) + panicWobbleY;

  const effectivePupilScale = panicked ? Math.min(0.62, basePupilScale * 1.25) : basePupilScale;

  // Base glance directional offsets (max range within eyeball)
  const maxTravel = (size / 2) * (1 - effectivePupilScale) * 0.78;

  let targetX = 0;
  let targetY = 0;

  switch (glance) {
    case 'left':
      targetX = -maxTravel;
      break;
    case 'right':
      targetX = maxTravel;
      break;
    case 'up':
      targetY = -maxTravel;
      break;
    case 'down':
      targetY = maxTravel;
      break;
    case 'cross':
      // Handled per eye below
      break;
    case 'center':
    default:
      targetX = 0;
      targetY = 0;
      break;
  }

  // Smooth interpolated pupil position
  const pupilOffsetX = interpolate(pupilLagX, [0, 1], [-maxTravel * 0.8, targetX]) + wobbleX;
  const pupilOffsetY = interpolate(pupilLagY, [0, 1], [-maxTravel * 0.5, targetY]) + wobbleY;

  // Periodic Blink: Quick eyelid snap
  const blinkCycle = frame % blinkInterval;
  const isBlinking = blinkCycle >= (blinkInterval - 4) && blinkCycle <= blinkInterval;
  const eyeScaleY = isBlinking ? 0.08 : eyePop;
  const eyeScaleX = isBlinking ? 1.15 : eyePop;

  const pupilSize = size * effectivePupilScale;
  const glintSize = pupilSize * 0.35;

  const renderSingleEye = (isLeft: boolean) => {
    let finalX = pupilOffsetX;
    if (glance === 'cross') {
      finalX = isLeft ? maxTravel * 0.85 : -maxTravel * 0.85;
    }

    // Clamp inside eye boundary
    const clampedX = Math.max(-maxTravel, Math.min(maxTravel, finalX));
    const clampedY = Math.max(-maxTravel, Math.min(maxTravel, pupilOffsetY));

    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Worried / Panicked Eyebrow */}
        {panicked && (
          <div
            style={{
              position: 'absolute',
              top: -14,
              width: size * 0.75,
              height: 6,
              backgroundColor: inkColor,
              borderRadius: 3,
              transform: `rotate(${isLeft ? '20deg' : '-20deg'}) translateY(${Math.sin(frame * 0.6) * 2}px)`,
              transformOrigin: isLeft ? 'right center' : 'left center',
              zIndex: 2,
            }}
          />
        )}
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            border: `5px solid ${inkColor}`,
            boxShadow: `0 4px 0 ${inkColor}20`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transform: `scale(${eyeScaleX}, ${eyeScaleY})`,
            transformOrigin: 'center center',
          }}
        >
        {/* Pupil */}
        <div
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: inkColor,
            borderRadius: '50%',
            position: 'absolute',
            transform: `translate(${clampedX}px, ${clampedY}px)`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: pupilSize * 0.15,
          }}
        >
          {/* White glint highlight */}
          <div
            style={{
              width: glintSize,
              height: glintSize,
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
    </div>
    );
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing,
        userSelect: 'none',
      }}
    >
      {renderSingleEye(true)}
      {renderSingleEye(false)}
    </div>
  );
};

export default GooglyEyes;
