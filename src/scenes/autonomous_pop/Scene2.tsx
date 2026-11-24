import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Top status badge: snaps in at frame 0 (0:04.0 milestone)
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // 2. Hero prop (golden treasure chest) impact landing: frame 8 (0:04.8 milestone)
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });

  // 3. Character emergence (Chanakya): frame 15 (0:05.6 milestone)
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // 4. Arm kinematics / proud chest extension
  const armSweep = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 14, stiffness: 180 } });
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 5. Subtle cinematic camera creep
  const cameraZoom = interpolate(frame, [0, 227], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="ancient_palace">
          {/* BADGE: GLOBAL DOMINANCE */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: '50%',
              transform: `translateX(-50%) scale(${badgeSpring})`,
              backgroundColor: '#D97706',
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
            <span>🌍</span>
            <span>GLOBAL DOMINANCE</span>
          </div>

          {/* LEFT STAGE: Golden treasure chest overflows with coins (Archetype B) */}
          <HeroProp
            type="gold_coins_overflow_chest"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
            customText="32% GDP"
          />

          {/* RIGHT STAGE: Chanakya stands confidently, observing the wealth */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="chanakya"
              pose="wealth_proud_chest"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EA580C"
              armProgress={armSweep}
              handTug={handTug}
              breathing={true}
              blinking={true}
            />
          </div>

          {/* Tethering across the 420px stage gap */}
          <StageConnector
            type="tension_cords"
            fromX={760}
            fromY={640}
            toX={340}
            toY={860}
            tension={1.0}
            tugIntensity={handTug}
            opacity={charSpring}
          />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};