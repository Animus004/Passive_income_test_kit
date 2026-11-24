import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animations for badge, prop, and character
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Camera zoom for cinematic effect
  const cameraZoom = interpolate(frame, [0, 157], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="ancient_palace">
          {/* Status Badge */}
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#EF4444', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>📉</span>
            <span>CASH IS DEBT</span>
          </div>

          {/* Hero Prop - Money Drain Sink */}
          <HeroProp
            type="money_drain_sink"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
          />

          {/* Character - Ancient Commoner in Shock */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="ancient_commoner"
              pose="shock_hands_on_head"
              x={760}
              y={940}
              scale={1.15}
              face="shock_alarm"
              breathing={true}
              blinking={true}
            />
          </div>

          {/* Stage Connector for visual tension */}
          <StageConnector
            type="puppet_strings"
            fromX={760}
            fromY={640}
            toX={340}
            toY={760}
            tension={1.0}
            tugIntensity={0}
            opacity={charSpring}
          />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};