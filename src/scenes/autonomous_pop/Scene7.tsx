import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge spring (starts immediately)
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // Prop spring (delayed a few frames)
  const propSpring = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 14, stiffness: 190 },
  });

  // Character spring (delayed a bit more)
  const charSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Hand tug for the connector
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // Subtle camera zoom
  const cameraZoom = interpolate(frame, [0, 213], [1.0, 1.05], {
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
        <RoomEnvironment type="ancient_palace">
          {/* Top Status Badge */}
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
            <span>💡</span>
            <span>LESSONS FROM HISTORY</span>
          </div>

          {/* Hero Prop: Chanakya Scroll (centered) */}
          <HeroProp
            type="chanakya_scroll"
            x={540}
            y={820}
            scale={1.4}
            shakeIntensity={propSpring}
          />

          {/* Character: Ancient Scholar (Chanakya) */}
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
            />
          </div>

          {/* Puppet Strings Connector */}
          <StageConnector
            type="puppet_strings"
            fromX={760}
            fromY={640}
            toX={540}
            toY={760}
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