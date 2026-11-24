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

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Top status badge punches in at frame 0 (snappy overshoot)
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  // 2. Hero prop (mystic diya flame) lands early with impact decay
  const propSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 190 },
  });

  // 3. Character emerges from shadow
  const charSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // 4. Dynamic arm kinematics: the "reaching out for comments" gesture
  const armSweep = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  // Continuous gesture tension (comment bubbles "tugging" the invitation)
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 6. Subtle cinematic camera creep for sustained tension
  const cameraZoom = interpolate(frame, [0, 137], [1.0, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Comment-bubble pop stagger (visual metaphor: inviting the audience to share views)
  const bubbles = [
    { x: 250, y: 560, delay: 22, emoji: '💬', size: 34, color: '#F59E0B' },
    { x: 430, y: 470, delay: 34, emoji: '🤔', size: 30, color: '#EF4444' },
    { x: 180, y: 700, delay: 48, emoji: '📈', size: 32, color: '#10B981' },
    { x: 520, y: 660, delay: 60, emoji: '🔥', size: 30, color: '#8B5CF6' },
    { x: 320, y: 820, delay: 74, emoji: '🇮🇳', size: 36, color: '#F97316' },
  ];

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
        <RoomEnvironment type="ancient_palace">
          {/* Punchy comic status badge */}
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
            <span>💬</span>
            <span>CAN INDIA RISE? • YOUR THOUGHTS?</span>
          </div>

          {/* Hero prop: mystical diya flame as the "golden bird" beacon (left stage) */}
          <HeroProp
            type="mystic_diya_flame"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
          />

          {/* Comment-bubble cluster: the audience's voices rising toward the question */}
          {bubbles.map((b, i) => {
            const bSpring = spring({
              frame: Math.max(0, frame - b.delay),
              fps,
              config: { damping: 12, stiffness: 210 },
            });
            const bob = Math.sin((frame / fps) * Math.PI * 2 + i) * 6;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y + bob,
                  transform: `translate(-50%, -50%) scale(${bSpring})`,
                  opacity: bSpring,
                  width: 72,
                  height: 72,
                  borderRadius: '50% 50% 50% 12%',
                  backgroundColor: b.color,
                  border: '5px solid #000000',
                  boxShadow: '0 6px 0 rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: b.size,
                  zIndex: 30,
                }}
              >
                {b.emoji}
              </div>
            );
          })}

          {/* Tethering the creator's outstretched hand to the flame / audience */}
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

          {/* Hero character: the common voice reaching out for comments (right stage) */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="ancient_commoner"
              pose="chanakya_pointing"
              armProgress={armSweep}
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EA580C"
              breathing={true}
              blinking={true}
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};