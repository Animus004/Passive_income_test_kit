import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Sub-beat choreography springs ---
  // 1. Badge punch (frame 0)
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  // 2. Hero Prop impact (frame 8 -> matches [0:20.6] character/prop window)
  const propSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 190 },
  });

  // 3. Character emergence (frame 15 -> matches [0:21.2] Karna reveal)
  const charSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // 4. Arm kinematics (conflicted warrior gesture)
  const armSweep = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 5. Camera creep (subtle cinematic push for tension)
  const cameraZoom = interpolate(frame, [0, 137], [1.0, 1.05], {
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
        <RoomEnvironment type="subterranean_dungeon_vault">
          {/* Top Status Badge - INTERNAL CONFLICT */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: '50%',
              transform: `translateX(-50%) scale(${badgeSpring})`,
              backgroundColor: '#B91C1C',
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
            <span>💔</span>
            <span>INTERNAL CONFLICT</span>
          </div>

          {/* LEFT STAGE: Hero Prop - Sword & Shield Emblem (inner battle) */}
          <HeroProp
            type="sword_shield_emblem"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
          />

          {/* RIGHT STAGE: Karna (Duryodhana rig) - conflicted warrior */}
          <div
            style={{
              opacity: charSpring,
              transform: `translateY(${charSlide}px)`,
            }}
          >
            <CharacterRig
              era="ancient"
              role="duryodhana"
              head="royal_mukut"
              face="dread_loop"
              pose="warrior_stand"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#991B1B"
              hairColor="#1F2937"
              skinColor="#C68642"
              facialHair="royal_moustache"
              attireOverlay="warrior_kavach"
              glasses={false}
              flipHorizontal={false}
              breathing={true}
              blinking={true}
              armProgress={armSweep}
              handTug={handTug}
            />
          </div>

          {/* StageConnector: Tension tether from Karna to the emblem (duty vs blood) */}
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