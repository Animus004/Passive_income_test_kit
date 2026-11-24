import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // RULE 10: TEMPORAL CHOREOGRAPHY MANDATE (SUB-BEAT STAGGERING)

  // 1. Frame 0: Top Status Badge punches in
  // BADGE: Badge 'ANCIENT TRUTH' crashes onto screen with dust particles.
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // Character: Chanakya emerges from shadows, pointing.
  // CHARACTER: Chanakya steps out of shadow, pointing finger directly at camera. (0:00.5 -> frame 15)
  const charEntranceDelay = 15; // 0.5 seconds * 30 fps
  const charSpring = spring({ frame: Math.max(0, frame - charEntranceDelay), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]); // Slide up as he emerges from below

  // Hero Prop: chanakya_scroll
  // The scroll needs to be present early, then pulse later.
  const initialPropPresenceDelay = 8; // Small delay for the scroll to be present in the scene
  const propPresenceSpring = spring({ frame: Math.max(0, frame - initialPropPresenceDelay), fps, config: { damping: 14, stiffness: 190 } });

  // PROP: Scroll on left pulses with red alert light, emphasizing urgency. (0:01.5 -> frame 45)
  const scrollPulseDelay = 45; // 1.5 seconds * 30 fps
  const scrollPulseSpring = spring({ frame: Math.max(0, frame - scrollPulseDelay), fps, config: { damping: 10, stiffness: 250, mass: 0.8 } });

  // Combine springs for the scroll's shakeIntensity: initial presence then the distinct pulse.
  // The `Math.max` ensures the later pulse impact takes precedence if it's stronger.
  const combinedShakeIntensity = Math.max(propPresenceSpring, scrollPulseSpring);

  // 6. Camera Creep: Subtle cinematic camera push
  const cameraZoom = interpolate(frame, [0, 128], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        {/* Environment Setting: subterranean_dungeon_vault (Rule 2) */}
        <RoomEnvironment type="subterranean_dungeon_vault">
          {/* RULE 9: PUNCHY COMIC STATUS BADGE */}
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#B91C1C', // Deep red for "BRUTAL SACH"
            color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14,
            whiteSpace: 'nowrap'
          }}>
            <span>📜</span> {/* Emoji reflecting ancient wisdom/truth */}
            <span>ANCIENT TRUTH</span>
          </div>

          {/* ARCHETYPE B: CLEAN SPLIT DUO (HeroProp on Left, CharacterRig on Right) */}
          {/* RULE 3.1: ABSOLUTE ZERO-COLLISION MANDATE */}

          {/* Hero Element: chanakya_scroll (LEFT STAGE) */}
          <HeroProp
            type="chanakya_scroll"
            x={340} // Left Stage as per ARCHETYPE B
            y={960} // Grounding Horizon (Rule 5)
            scale={1.15}
            shakeIntensity={combinedShakeIntensity} // Incorporates both initial presence and the later pulse
          />

          {/* Character: Chanakya (RIGHT STAGE) */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient" // STRICT PROP: era="ancient" MUST be passed (Rule 2)
              role="chanakya" // Role automatically sets authentic headwear, facial grooming & attire (Rule 2)
              pose="chanakya_pointing" // Chanakya points directly at the viewer (Visual Action)
              x={760} // Right Stage as per ARCHETYPE B
              y={940} // Grounding Horizon (Rule 5)
              scale={1.15}
              clothColor="#EA580C" // Distinctive Chanakya saffron
              breathing={true} // RULE 10: Living Characters
              blinking={true}  // RULE 10: Living Characters
            />
          </div>

          {/* No StageConnector is used as Chanakya is pointing directly at the camera/viewer,
              breaking the fourth wall, rather than interacting with the scroll via connection. */}

        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};