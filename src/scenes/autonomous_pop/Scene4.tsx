import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import {
  RoomEnvironment,
  CharacterRig,
  HeroProp,
  StageConnector,
} from '../../components/rigs';

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge punch (starts at frame 0)
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  // Prop impact (starts ~frame 12)
  const propSpring = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 14, stiffness: 190 },
  });

  // Character emergence (starts ~frame 30)
  const charSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Hand tug for connector string
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // Subtle camera zoom
  const cameraZoom = interpolate(frame, [0, 180], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraZoom})`,
          transformOrigin: '50% 60%',
        }}
      >
        <RoomEnvironment type="temple_vault">
          {/* Badge */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: '50%',
              transform: `translateX(-50%) scale(${badgeSpring})`,
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: '8px solid #000000',
              borderRadius: 36,
              padding: '14px 40px',
              fontSize: 32,
              fontWeight: 900,
              boxShadow: '0 10px 0 #000000',
              zIndex: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              whiteSpace: 'nowrap',
            }}
          >
            <span>🏛️</span>
            <span>ANCIENT WISDOM</span>
          </div>

          {/* Hero Prop – gold coins overflow chest */}
          <HeroProp
            type="gold_coins_overflow_chest"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
          />

          {/* Character – Shakuni with dice */}
          <div
            style={{
              opacity: charSpring,
              transform: `translateY(${charSlide}px)`,
            }}
          >
            <CharacterRig
              era="ancient"
              role="shakuni"
              pose="shakuni_holding_dice"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EA580C"
              breathing={true}
              blinking={true}
            />
          </div>

          {/* Flanking environmental props */}
          <HeroProp
            type="mystic_diya_flame"
            x={160}
            y={1220}
            scale={0.8}
          />
          <HeroProp
            type="mystic_diya_flame"
            x={920}
            y={1220}
            scale={0.8}
          />

          {/* Puppet strings connecting character hand to prop */}
          <StageConnector
            type="puppet_strings"
            fromX={760}
            fromY={640}
            toX={340}
            toY={860}
            tension={1.0}
            tugIntensity={handTug}
            attachCrowns={true}
            crownBob={handTug * 1.5}
            opacity={charSpring}
          />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};