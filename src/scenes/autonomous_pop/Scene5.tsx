import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp } from '../../components/rigs'; // Import HeroProp

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Badge snaps in with bounce: 'THE REVELATION' at [0:16.0] (frame 0)
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // 2. HeroProp (dagger) emergence and slight shake
  // Rule 5: Prop appears around frame 10-15
  const propEntryDelay = 10;
  const propSpring = spring({ frame: Math.max(0, frame - propEntryDelay), fps, config: { damping: 12, stiffness: 180 } });
  const propSlide = interpolate(propSpring, [0, 1], [30, 0]); // Slight drop effect for entry
  const propShakeIntensity = spring({ // Rule 8: Use spring for shakeIntensity
    frame: Math.max(0, frame - propEntryDelay - 10), // Shake starts a bit after prop is fully visible
    fps,
    config: { damping: 8, stiffness: 200 },
    durationInFrames: 30 // Shake for a limited duration
  });

  // 3. Character (Krishna) emergence and pose execution
  // Rule 5: Character appears around frame 25-35
  const krishnaCharEntryDelay = 25;
  const krishnaCharSpring = spring({ frame: Math.max(0, frame - krishnaCharEntryDelay), fps, config: { damping: 15, stiffness: 160 } });
  const krishnaCharSlide = interpolate(krishnaCharSpring, [0, 1], [35, 0]);
  // Krishna's pointing action animates after his entry
  const krishnaArmSweepDelay = krishnaCharEntryDelay + 10; // Pointing starts after 10 frames of entry
  const krishnaArmSweep = spring({ frame: Math.max(0, frame - krishnaArmSweepDelay), fps, config: { damping: 14, stiffness: 180 } });

  // 4. Camera Creep for cinematic feel
  const cameraZoom = interpolate(frame, [0, 135], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        {/* Rule 2: Ground the scene with a proper RoomEnvironment */}
        <RoomEnvironment type="ancient_palace">
          {/* Rule 9: Punchy Comic Status Badge */}
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#B91C1C', // Red for intensity of revelation/blood
            color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14,
            whiteSpace: 'nowrap'
          }}>
            <span>🩸</span>
            <span>THE REVELATION</span>
          </div>

          {/* Introduce the 'dagger' as HeroProp (Rule 1, AD Fix 1) */}
          {/* Adhere to Archetype B: Clean Split Duo (Rule 3, AD Fix 2) */}
          <div style={{ opacity: propSpring, transform: `translateY(${propSlide}px)` }}>
            <HeroProp
              type="sword_shield_emblem" // Rule 9: Closest allowed prop type for 'dagger'
              x={340} // AD Fix 5: Centered at X=340
              y={960} // Rule 6 & Archetype B: Grounded position for prop scale 1.15
              scale={1.15} // Archetype B requirement
              shakeIntensity={propShakeIntensity} // Rule 8: Use spring for shake
            />
          </div>

          {/* Krishna (primary character, AD Fix 3) */}
          {/* Remove Karna (AD Fix 4) */}
          <div style={{ opacity: krishnaCharSpring, transform: `translateY(${krishnaCharSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="shakuni" // Krishna represented by Shakuni rig (AD Fix 3)
              pose="chanakya_pointing" // Accusatory pointing pose
              x={740} // AD Fix 6: Centered at X=740
              y={940} // Rule 6 & Archetype B: Grounded position for character scale 1.15
              scale={1.15} // Archetype B requirement
              armProgress={krishnaArmSweep} // Animates the pointing arm
              breathing={true}
              blinking={true}
            />
          </div>

          {/* The StageConnector and Karna character have been removed as per Art Director's Fixes */}
          {/* The new composition strictly adheres to 'Archetype B: Clean Split Duo' with one HeroProp and one CharacterRig. */}
          {/* The 80px buffer between HeroProp (X=340) and CharacterRig (X=740) is naturally met with standard rig widths. */}
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};