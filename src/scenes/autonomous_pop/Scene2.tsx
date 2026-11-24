import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Frame 0: Status Badge punches in with snappy overshoot
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  // 2. Frame 8: Hero Prop (Chanakya Scroll) lands with impact decay
  //    Also handles the golden glow pulse (peaks around frame 93 = 0:03.1)
  const propSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 190 },
  });
  const scrollGlow = interpolate(
    frame,
    [8, 93, 142],
    [0, 1, 0.65],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 3. Frame 15: Hero Character (Chanakya) emerges from the vault shadows
  //    Also handles the knowing smile pulse (peaks around frame 54 = 0:01.8)
  const charSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);
  const faceSmile = interpolate(
    frame,
    [15, 54, 142],
    [0, 1, 0.75],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 4. Sub-beat: Tension cords tugging (manifests as character arm kinematics)
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 5. Cinematic camera creep to maintain visual tension across the 142 frames
  const cameraZoom = interpolate(frame, [0, 142], [1.0, 1.05], {
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
          {/* Top Status Badge */}
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
            <span>🤫</span>
            <span>THE SECRET</span>
          </div>

          {/* LEFT STAGE: Hero Prop (Chanakya Scroll) */}
          <HeroProp
            type="chanakya_scroll"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
            customText="SEC. 2300 YRS"
          />

          {/* Cinematic Golden Glow behind the scroll (peaks at 0:03.1) */}
          <div
            style={{
              position: 'absolute',
              left: 340,
              top: 960,
              width: 640,
              height: 640,
              marginLeft: -320,
              marginTop: -320,
              background:
                'radial-gradient(circle, rgba(255, 215, 0, 0.45) 0%, rgba(255, 215, 0, 0) 65%)',
              opacity: scrollGlow,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* RIGHT STAGE: Character Rig (Chanakya) */}
          <div
            style={{
              opacity: charSpring,
              transform: `translateY(${charSlide}px)`,
              position: 'relative',
              zIndex: 20,
            }}
          >
            <CharacterRig
              era="ancient"
              role="chanakya"
              face="bliss_dreaming"
              pose="chanakya_pointing"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EA580C"
              facialHair="clean_shaven"
              attireOverlay="dhoti_janeu"
              breathing={true}
              blinking={true}
            />
          </div>

          {/* Cinematic Smile Pulse overlay (peaks at 0:01.8) */}
          <div
            style={{
              position: 'absolute',
              left: 760,
              top: 620,
              width: 200,
              height: 200,
              marginLeft: -100,
              marginTop: -100,
              background:
                'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
              opacity: faceSmile * 0.85,
              pointerEvents: 'none',
              zIndex: 30,
            }}
          />

          {/* StageConnector: Tethering the character to the scroll across the 420px gap */}
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