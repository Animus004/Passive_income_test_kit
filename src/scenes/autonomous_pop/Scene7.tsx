import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animations for temporal choreography
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 10, stiffness: 150 } });
  const charSpring = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);
  const armSweep = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 14, stiffness: 180 } });
  const cameraZoom = interpolate(frame, [0, 148], [1.0, 1.05], { extrapolateRight: 'clamp' });

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
            <span>🧠</span>
            <span>PSYCHOLOGICAL WARFARE</span>
          </div>

          {/* Puppet Strings HeroProp */}
          <HeroProp
            type="puppet_strings"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
          />

          {/* Krishna (Shakuni rig) - Puppeteer */}
          <CharacterRig
            era="ancient"
            role="shakuni"
            pose="puppeteer_strings"
            x={200}
            y={940}
            scale={1.15}
            face="shock_alarm"
            armProgress={armSweep}
            breathing={true}
            blinking={true}
            opacity={charSpring}
            style={{ transform: `translateY(${charSlide}px)` }}
          />

          {/* Karna (Pandava rig) - Puppet */}
          <CharacterRig
            era="ancient"
            role="pandava"
            pose="shock_hands_on_head"
            x={740}
            y={940}
            scale={1.15}
            face="dazed_asymmetric"
            armProgress={0.3}
            breathing={true}
            blinking={true}
            opacity={charSpring}
            style={{ transform: `translateY(${charSlide}px)` }}
          />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};