import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

// Beat 3 of 8 — "MONOPOLY POWER" / "TRADE SECRETS"
// Archetype B: Clean Split Duo (Chanakya Scroll on left, Chanakya on right)
// 196 frames @ 30fps

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- TEMPORAL CHOREOGRAPHY (sub-beat staggering) ----
  // 1. Frame 0: Status badge punches in
  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  // 2. Frame ~8-12: Chanakya scroll unrolls onto pedestal (impact decay)
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });

  // 3. Frame ~15: Chanakya emerges from shadow into light
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // 4. Dynamic arm kinematics: Chanakya's pointing arm sweeps out
  const armSweep = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 14, stiffness: 180 } });

  // Continuous hand tension for the pointing gesture
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 6. Cinematic camera creep for sustained visual tension
  const cameraZoom = interpolate(frame, [0, 196], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `scale(${cameraZoom})`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="subterranean_dungeon_vault">
          {/* TOP STATUS BADGE — "TRADE SECRETS" */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: '50%',
              transform: `translateX(-50%) scale(${badgeSpring})`,
              backgroundColor: '#D97706',
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
            <span>📜</span>
            <span>TRADE SECRETS</span>
          </div>

          {/* LEFT STAGE — Hero Prop: Chanakya Scroll (trade routes map) */}
          <HeroProp
            type="chanakya_scroll"
            x={340}
            y={960}
            scale={1.15}
            shakeIntensity={propSpring}
          />

          {/* RIGHT STAGE — Character: Chanakya pointing knowingly at the scroll */}
          <div style={{ opacity: charSpring, transform: `translateY(${charSlide}px)` }}>
            <CharacterRig
              era="ancient"
              role="chanakya"
              pose="chanakya_pointing"
              armProgress={armSweep}
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EA580C"
              breathing={true}
              blinking={true}
            />
          </div>

          {/* STAGE CONNECTOR — tension tether from Chanakya's hand to the scroll */}
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