import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge entrance (Frame 0)
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // Hero Prop entrance (Frame 8)
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });

  // Character entrance (Frame 15)
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Arm kinematics (Frame 35)
  const armSweep = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 14, stiffness: 180 } });

  // Continuous hand tug
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // Camera creep
  const cameraZoom = interpolate(frame, [0, 197], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraZoom})`,
          transformOrigin: '50% 60%'
        }}
      >
        <RoomEnvironment type="ancient_palace">

          {/* Top Badge */}
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
              whiteSpace: 'nowrap'
            }}
          >
            <span>⚖️</span>
            <span>POLICY MASTERY</span>
          </div>

          {/* Left Stage: Hero Prop - Fixed to ground level */}
          <HeroProp
            type="weighing_scale_gold"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
          />

          {/* Right Stage: Character - Properly grounded */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="chanakya"
              pose="chanakya_pointing"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EA580C"
              breathing={true}
              blinking={true}
              armProgress={armSweep}
              handTug={handTug}
            />
          </div>

          {/* Stage Connector: Tethering the gesture */}
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