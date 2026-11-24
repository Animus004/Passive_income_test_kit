import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Badge snaps in with bounce: 'MASTERMIND'S MOVE' - starts at frame 0
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // 6. Camera Creep: Subtle cinematic camera push
  const cameraZoom = interpolate(frame, [0, 133], [1.0, 1.05], { extrapolateRight: 'clamp' });

  // Timings for visual elements based on milestones and rules:
  // • [0:12.6] PROP: Puppet cross rotates, strings subtly swaying. (Prop appears/starts moving around frame 11-12)
  const propSpringStartFrame = 11; // Spring starts at frame 11 for visible motion by ~frame 12.6
  const propSpring = spring({ frame: Math.max(0, frame - propSpringStartFrame), fps, config: { damping: 14, stiffness: 190 } });

  // • [0:13.2] CHARACTER: Krishna (Shakuni rig) looks slyly at the viewer, hand gesturing control. (Character appears/starts moving around frame 12-13)
  const charSpringStartFrame = 12; // Spring starts at frame 12 for visible motion by ~frame 13.2
  const charSpring = spring({ frame: Math.max(0, frame - charSpringStartFrame), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]); // Character slides in from top

  // 4. Dynamic Arm Kinematics & Tugging (Puppeteer gesture starts after character emergence)
  const armSweepStartFrame = 15;
  const armSweep = spring({ frame: Math.max(0, frame - armSweepStartFrame), fps, config: { damping: 14, stiffness: 180 } });

  // 4. Continuous string/gesture tension (base handTug as per Rule 10.4)
  const baseHandTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // Word Timings for "scale/spring punch on word hits" - these are subtle pulses
  const krishnaWordFrame = 49;
  const karnaWordFrame = 73;
  const secretPlanWordFrame = 91;

  const wordPulseSpringConfig = { damping: 10, stiffness: 120 }; // Quick, subtle pulse configuration

  const krishnaPulse = spring({ frame: Math.max(0, frame - krishnaWordFrame), fps, config: wordPulseSpringConfig });
  const karnaPulse = spring({ frame: Math.max(0, frame - karnaWordFrame), fps, config: wordPulseSpringConfig });
  const secretPlanPulse = spring({ frame: Math.max(0, frame - secretPlanWordFrame), fps, config: wordPulseSpringConfig });

  // Combine base handTug with word hit pulses for dynamic tugging
  const handTugPulseStrength = 8;
  const handTugWithPulses = baseHandTug +
    interpolate(krishnaPulse, [0, 1], [0, handTugPulseStrength], { extrapolateRight: 'clamp' }) +
    interpolate(karnaPulse, [0, 1], [0, handTugPulseStrength], { extrapolateRight: 'clamp' }) +
    interpolate(secretPlanPulse, [0, 1], [0, handTugPulseStrength], { extrapolateRight: 'clamp' });

  // Subtle continuous prop rotation (sway) + word hit pulses for emphasis
  // Using Math.sin for subtle rotation/sway is allowed for rotation (not shakeIntensity)
  const basePropRotation = Math.sin(frame / 20) * 5;
  const propRotationPulseStrength = 10;
  const propRotationWithPulses = basePropRotation +
    interpolate(krishnaPulse, [0, 1], [0, propRotationPulseStrength], { extrapolateRight: 'clamp' }) +
    interpolate(karnaPulse, [0, 1], [0, propRotationPulseStrength], { extrapolateRight: 'clamp' }) +
    interpolate(secretPlanPulse, [0, 1], [0, propRotationPulseStrength], { extrapolateRight: 'clamp' });


  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="puppet_stage_shadow">
          {/* Rule 9: Punchy Comic Status Badge */}
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#059669', // Strategic green for "Mastermind"
            color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14,
            whiteSpace: 'nowrap'
          }}>
            <span>🤫</span> {/* Emoji for "SECRET" */}
            <span>MASTERMIND'S MOVE</span>
          </div>

          {/* LEFT STAGE: Hero Element (puppet_control_cross) */}
          {/* Rule 3.1: HeroProp on Left Stage */}
          <HeroProp
            type="puppet_control_cross"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring} // Initial impact animation
            rotation={propRotationWithPulses} // Continuous subtle rotation + word timing pulses
            opacity={propSpring} // Fade in with the spring
          />

          {/* RIGHT STAGE: Character Rig (Krishna as Shakuni rig) */}
          {/* Rule 3.1: CharacterRig on Right Stage */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="shakuni" // Visual metaphor: Krishna (Shakuni rig) as the puppet master
              pose="puppeteer_strings"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#4F46E5" // Royal blue for Krishna's persona
              breathing={true}
              blinking={true}
              armProgress={armSweep} // Drives the puppeteer pose
              handTug={handTugWithPulses} // Continuous tugging motion + word timing pulses
            />
          </div>

          {/* 5. StageConnector: Puppet strings from character to prop */}
          <StageConnector
            type="puppet_strings"
            fromX={760}
            fromY={640} // Origin from character's hand level
            toX={340}
            toY={760} // Destination to the puppet cross
            tension={1.0}
            tugIntensity={handTugWithPulses} // Connects to the character's hand tugging motion
            attachCrowns={true} // Emphasize the mastermind's royal control
            crownBob={handTugWithPulses * 1.5} // Crown bobs with the tugging
            opacity={charSpring} // Fade in with character emergence
          />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};