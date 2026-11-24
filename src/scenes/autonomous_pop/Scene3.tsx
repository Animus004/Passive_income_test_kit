import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp } from '../../components/rigs';

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge spring (frame 0)
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // Hero prop spring (frame 12-18)
  const propSpring = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 190 } });

  // Character spring (frame 30-35)
  const charSpring = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 15, stiffness: 160 } });

  // Character slide offset
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Prop rotation for a swirling effect
  const propRotation = interpolate(propSpring, [0, 1], [0, 360]);

  // Camera zoom
  const cameraZoom = interpolate(frame, [0, 152], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="ancient_palace">
          {/* Badge */}
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#EF4444', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>💸</span>
            <span>INFLATION TRAP</span>
          </div>

          {/* Hero Prop - Drain representation */}
          <HeroProp
            type="vault_b_door"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
            rotation={propRotation}
          />

          {/* Character */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="ancient_commoner"
              pose="shock_hands_on_head"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#D2691E"
              hairColor="#000000"
              skinColor="#f1c27d"
              facialHair="clean_shaven"
              attireOverlay="dhoti_janeu"
              breathing={true}
              blinking={true}
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};