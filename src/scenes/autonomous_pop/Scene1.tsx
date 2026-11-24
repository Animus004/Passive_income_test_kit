import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, HeroProp } from '../../components/rigs'; // Removed CharacterRig as it's no longer used

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // RULE 10.1: Top Status Badge punches in at frame 0
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // RULE 10.2: Primary HeroProp lands / shifts, starting at 0.6 seconds (18 frames)
  const propEntranceStartFrame = 18;
  const propSpring = spring({ frame: Math.max(0, frame - propEntranceStartFrame), fps, config: { damping: 14, stiffness: 190 } });

  // Removed character-related springs as the CharacterRig is no longer in the scene
  // const charEntranceStartFrame = 36;
  // const charSpring = spring({ frame: Math.max(0, frame - charEntranceStartFrame), fps, config: { damping: 15, stiffness: 160 } });
  // const charSlide = interpolate(charSpring, [0, 1], [35, 0]);
  // const armSweep = spring({ frame: Math.max(0, frame - charEntranceStartFrame), fps, config: { damping: 14, stiffness: 180 } });

  // RULE 10.6: Camera Creep for cinematic tension
  const cameraZoom = interpolate(frame, [0, 135], [1.0, 1.05], { extrapolateRight: 'clamp' });

  // Word Timing Punches for specific narration emphasis
  const wordPunchFrameZindagi = 65;
  const wordPunchSpring = spring({
    frame: Math.max(0, frame - wordPunchFrameZindagi),
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.8 }, // Snappy, short-lived punch
  });
  const throneWordShake = interpolate(wordPunchSpring, [0, 1], [0, 8]); // Add a subtle shake to the throne

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        {/* RULE 2.1 & Fix: Replaced flat backdrop with 'ancient_palace' environment */}
        {/* Addresses: "vast, sterile void", "looks like a child's flat crayon drawing, completely lacking depth or atmosphere" */}
        <RoomEnvironment type="ancient_palace">

          {/* RULE 9: Punchy Comic Status Badge */}
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
            <span>👑</span>
            <span>KRISHNA'S CHAL</span>
          </div>

          {/* Floor-Anchored Grounding Horizon: Y=960 anchors plinth base firmly to floor horizon (Y=1220) */}
          <HeroProp
            type="royal_throne"
            x={540}
            y={960}
            scale={1.35}
            shakeIntensity={propSpring + throneWordShake}
          />

          {/* CharacterRig (Duryodhana) has been removed to strictly comply with "Solo Object" archetype (Rule 3) */}
          {/* The Art Director's instruction to center the HeroProp 'royal_throne' makes it a Solo Object scene,
              which does not include a main CharacterRig. */}
          {/* No StageConnector needed for this scene (Rule 2.4) */}

        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};