import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Badge: Snaps in at frame 0
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // 2. Hero Prop: Three large comment bubbles pop up at ~frame 15 (0:01.8)
  const propSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 14, stiffness: 190 } });
  
  // Bubbles gently float upwards as the video ends (starts moving from frame 93 / 0:03.1)
  const floatProgress = interpolate(frame, [93, 167], [0, 1], { extrapolateRight: 'clamp' });
  const floatY = floatProgress * -40;

  // 3. Character Emergence: Steps into light at ~frame 15 (0:00.5)
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // 4. Dynamic Arm Kinematics: Gestures outwards with open hand (questioning pose)
  const armSweep = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 14, stiffness: 180 } });
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 5. Camera Creep: Subtle cinematic push
  const cameraZoom = interpolate(frame, [0, 167], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ 
        width: '100%', 
        height: '100%', 
        transform: `scale(${cameraZoom})`, 
        transformOrigin: '50% 60%' 
      }}>
        <RoomEnvironment type="subterranean_dungeon_vault">
          
          {/* Top Status Badge */}
          <div style={{
            position: 'absolute', 
            top: 130, 
            left: '50%',
            transform: `translateX(-50%) scale(${badgeSpring})`,
            backgroundColor: '#EF4444', 
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
            whiteSpace: 'nowrap'
          }}>
            <span>💬</span>
            <span>YOUR CHOICE?</span>
          </div>

          {/* LEFT STAGE: Hero Prop (Comment Bubbles) */}
          <div style={{ opacity: propSpring, transform: `translateY(${floatY}px)` }}>
            <HeroProp 
              type="mystic_diya_flame" 
              x={340} 
              y={960} 
              scale={1.15} 
              shakeIntensity={propSpring} 
              customText="3 BUBBLES" 
            />
          </div>

          {/* RIGHT STAGE: Character (Creator) */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              role="ancient_commoner"
              head="messy_bedhead"
              face="dazed_asymmetric"
              pose="whispering_sly"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#4B5563"
              hairColor="#111827"
              skinColor="#FCA5A5"
              facialHair="stubble"
              attireOverlay="default"
              glasses={true}
              armProgress={armSweep}
              handTug={handTug}
              breathing={true}
              blinking={true}
            />
          </div>

          {/* Stage Connector: Tethering the character's question to the comment bubbles */}
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