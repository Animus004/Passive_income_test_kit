import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- TEMPORAL CHOREOGRAPHY (STAGGERED SUB-BEATS) ---

  // 1. Frame 0: Badge punch-in
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // 2. Frame ~8: HeroProp (Weighing Scale) impact & shake
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });

  // 3. Frame ~15: Character emergence (slide up)
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // 4. Arm Kinematics for "shock_hands_on_head"
  const armSweep = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 14, stiffness: 180 } });
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 5. Camera Creep
  const cameraZoom = interpolate(frame, [0, 170], [1.0, 1.05], { extrapolateRight: 'clamp' });

  // 6. Word Hit Punches (Scale/Spring on specific frames)
  const wordPunches = [
    { word: 'Money', relativeFrame: 0 },
    { word: 'Not', relativeFrame: 29 },
    { word: 'Working?', relativeFrame: 46 },
    { word: 'Makes', relativeFrame: 92 },
    { word: 'You', relativeFrame: 120 }
  ];

  const getWordPunch = (word: string) => {
    const timing = wordPunches.find(w => w.word === word);
    if (!timing) return 1;
    return spring({ frame: Math.max(0, frame - timing.relativeFrame), fps, config: { damping: 10, stiffness: 250 } });
  };

  // Subtle global shake on word hits to emphasize "Money Not Working"
  const globalPunch = Math.max(
    getWordPunch('Money'),
    getWordPunch('Not'),
    getWordPunch('Working?')
  );

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          transform: `scale(${cameraZoom})`, 
          transformOrigin: '50% 60%',
          // Subtle red tint flash on word hits
          filter: `brightness(${1 + (globalPunch - 1) * 0.2})` 
        }}
      >
        <RoomEnvironment type="subterranean_dungeon_vault">
          
          {/* BADGE: STATIC CASH */}
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
            <span>⚖️</span>
            <span>STATIC CASH</span>
          </div>

          {/* LEFT STAGE: HERO PROP (Weighing Scale) */}
          {/* Placed at x=340, y=960 to ground on floor and avoid collision */}
          <HeroProp 
            type="weighing_scale_gold" 
            x={340} 
            y={960} 
            scale={1.15} 
            shakeIntensity={propSpring} 
          />

          {/* RIGHT STAGE: CHARACTER (Ancient Commoner reacting) */}
          {/* Placed at x=760, y=940 for clean split duo */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="ancient_commoner"
              pose="shock_hands_on_head"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#78350F"
              hairColor="#1C1917"
              skinColor="#D97706"
              facialHair="stubble"
              face="shock_alarm"
              armProgress={armSweep}
              handTug={handTug}
              breathing={true}
              blinking={true}
            />
          </div>

          {/* STAGE CONNECTOR: Tension/Tethering visual link between character and scale */}
          <StageConnector
            type="tension_cords"
            fromX={760}
            fromY={640}
            toX={340}
            toY={860}
            tension={1.0}
            tugIntensity={handTug}
            opacity={charSpring}
          />

        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};