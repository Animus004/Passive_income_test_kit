import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp } from '../../components/rigs';

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <RoomEnvironment type="office_desk">
        {/* Top Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: 130,
            left: '50%',
            transform: `translateX(-50%) scale(${popSpring})`,
            backgroundColor: '#64748B',
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
          <span>💤</span>
          <span>TOTAL EXHAUSTION • 10 AM और ऊर्जा खत्म</span>
        </div>

        {/* Melted Deflated Puddle with 10:02 AM Clock */}
        <HeroProp
          type="deflated_melt_puddle"
          x={540}
          y={880}
          scale={1.4}
        />

        {/* Flat Melted Cartoon Employee on Desk */}
        <CharacterRig
          head="messy_bedhead"
          face="keyboard_slump"
          pose="slouched_flat"
          x={540}
          y={930}
          scale={1.3}
          clothColor="#3B82F6"
          hairColor="#1E293B"
          breathing={true}
          blinking={false}
        />

        {/* Empty Dripping Coffee Mug */}
        <HeroProp
          type="coffee_mug_spill"
          x={840}
          y={1180}
          scale={1.1}
          shakeIntensity={0.1}
        />
      </RoomEnvironment>
    </AbsoluteFill>
  );
};
