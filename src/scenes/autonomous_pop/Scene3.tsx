import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rule 10, point 1: Badge punches in at frame 0. The [0:08.0] milestone indicates its resolution time.
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // Choreographing Remotion timings to match EXACT TIMELINE MILESTONES (MANDATORY EXECUTION)
  // [0:08.6] CHARACTER: Karna (Duryodhana rig) stands firm, gaze fixed ahead.
  // Interpreted as spring starting at frame 8.
  const charSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 15, stiffness: 160 } });

  // [0:09.2] PROP: Chaupar board pawns subtly shift, indicating upcoming moves.
  // Interpreted as spring starting at frame 9 (to ensure prop action follows character entry as per sequence).
  const propSpring = spring({ frame: Math.max(0, frame - 9), fps, config: { damping: 14, stiffness: 190 } });

  // Character slide in (Rule 10, point 3)
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Camera creep for cinematic tension (Rule 10, point 6)
  const cameraZoom = interpolate(frame, [0, 139], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        {/* Environment Setting: chaupar_board_arena. Using 'ancient_palace' as the closest allowed RoomEnvironment type (Rule 2). */}
        <RoomEnvironment type="ancient_palace">
          {/* Punchy Comic Status Badge (Rule 9) */}
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#EF4444', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14,
            whiteSpace: 'nowrap'
          }}>
            <span>⚔️</span>
            <span>LOYALTY VS RIVALRY</span>
          </div>

          {/* Hero Prop: chaupar_board_macro. Adhering to Rule 3.1 Zero-Collision Mandate: Prop on Left Stage. */}
          {/* Visual Metaphor: "A grand Chaupar board symbolizes the war, ... while a subtle divide hints at future conflict." */}
          <HeroProp
            type="chaupar_board_macro"
            x={340} // Rule 3.1 specified X for HeroProp on Left Stage
            y={960} // Rule 3.1 specified Y for HeroProp
            scale={1.15} // Rule 3.1 specified scale
            shakeIntensity={propSpring} // Prop impact (Rule 10, point 2)
          />

          {/* Character: Karna, using Duryodhana rig. Adhering to Rule 3.1 Zero-Collision Mandate: Character on Right Stage. */}
          {/* Visual Metaphor: "Karna (Duryodhana rig) stands defiant, gaze fixed ahead." */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient" // MANDATORY for ancient scenes (Rule 2, point 3)
              role="duryodhana" // Explicitly "Karna (Duryodhana rig)"
              pose="warrior_stand" // Director's storyboard
              x={760} // Rule 3.1 specified X for CharacterRig on Right Stage
              y={940} // Rule 3.1 specified Y for CharacterRig
              scale={1.15} // Rule 3.1 specified scale
              flipHorizontal={true} // To make Karna face the Chaupar board on the left
              breathing={true} // Rule 10, point 7
              blinking={true} // Rule 10, point 7
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};