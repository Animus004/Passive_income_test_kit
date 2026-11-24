import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rule 10: Temporal Choreography Mandate
  // 1. Frame 0: Scene establishes. Top Status Badge punches in.
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // 2. Prop entrance and spin. Milestone: [0:04.6] (frame 13.8). Start prop actions at frame 13.
  const propSpring = spring({ frame: Math.max(0, frame - 13), fps, config: { damping: 14, stiffness: 190 } });
  // Custom rotation for the two-faced mask to reveal its sinister side.
  // The spin should align with the prop's overall entrance timing.
  const maskRotationProgress = spring({ frame: Math.max(0, frame - 13), fps, config: { damping: 10, stiffness: 100 } });
  const maskRotation = interpolate(maskRotationProgress, [0, 1], [0, -180]); // Spin 180 degrees to reveal the "other face"

  // 3. Character emergence. Milestone: [0:05.2] (frame 15.6). Start character actions at frame 16.
  const charSpring = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // 4. Dynamic Arm Kinematics & Tugging (for StageConnector)
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 6. Camera Creep
  const cameraZoom = interpolate(frame, [0, 130], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        {/* Rule 7: RoomEnvironment for background */}
        <RoomEnvironment type="subterranean_dungeon_vault">
          {/* Rule 9: Punchy Comic Status Badge */}
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#6D28D9', // Deep purple for mystery/secrets, matching "HIDDEN TRUTH"
            color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14,
            whiteSpace: 'nowrap'
          }}>
            <span>🎭</span> {/* Mask emoji for "two_faced_mask" and "HIDDEN TRUTH" */}
            <span>HIDDEN TRUTH</span>
          </div>

          {/* ARCHETYPE B: CLEAN SPLIT DUO - HeroProp on Left, CharacterRig on Right */}
          {/* Rule 3.1: Absolute Zero-Collision Mandate (Prop at x=380, Character at x=760 ensures no overlap) */}
          <HeroProp
            type="two_faced_mask" // Hero Element to Feature
            x={380} // LEFT STAGE position as per prompt
            y={960} // Rule 5: Grounding Horizon
            scale={1.15}
            shakeIntensity={propSpring} // Rule 8: Clean physics with impact decay
            rotation={maskRotation} // Custom rotation to reveal the other side of the mask
          />

          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient" // Rule 2: era="ancient" MUST be passed
              role="shakuni" // RIGHT STAGE role as per prompt (Krishna acting as Shakuni)
              pose="whispering_sly" // RIGHT STAGE pose as per prompt ("knowing smirk" and "gestures")
              x={760} // RIGHT STAGE position as per prompt
              y={940} // Rule 5: Grounding Horizon
              scale={1.15}
              breathing={true} // Rule 10: Living Characters
              blinking={true} // Rule 10: Living Characters
            />
          </div>

          {/* StageConnector for visual metaphor: Krishna (Shakuni) manipulating the truth/mask with a psychological game */}
          <StageConnector
            type="puppet_strings" // Thematic for "psychological game" and "mastermind unveils"
            fromX={760} // Shakuni's X position
            fromY={640} // Approximate hand height for Shakuni's gesturing pose
            toX={380} // Mask's X position
            toY={760} // Approximate top of mask height, where puppet strings would attach
            tension={1.0}
            tugIntensity={handTug} // Subtle continuous tension
            opacity={charSpring} // Connector appears as the character emerges
          />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};