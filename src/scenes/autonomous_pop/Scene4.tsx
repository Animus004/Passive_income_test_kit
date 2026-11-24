import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import {
  RoomEnvironment,
  CharacterRig,
  HeroProp,
  StageConnector,
} from '../../components/rigs';

// Beat 4 of 8 — "INDIA: THE HUB" / GLOBAL DEMAND
// Archetype B: Clean Split Duo (Chanakya + Ashoka Pillar)

interface Scene4Props {
  sceneMeta?: { badgeText?: string };
}

const Scene4: React.FC<Scene4Props> = ({ sceneMeta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Core cinematic springs (local scene timings, frame 0 = scene start) ---
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  const propSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 190 },
  });

  const charSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Arm extension for the "chanakya_pointing" pose
  const armSweep = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  // --- Word-hit scale punch (from word timings) ---
  const wordHits = [0, 17, 39, 65, 96, 135];
  const wordPunch = wordHits.reduce((acc, wf) => {
    const local = Math.max(0, frame - wf);
    const s = spring({
      frame: local,
      fps,
      config: { damping: 10, stiffness: 260 },
    });
    return Math.max(acc, s);
  }, 0);
  const wordScale = 1 + Math.min(wordPunch * 0.18, 0.22);

  // Subtle hub "pulse" for the emblem (bounded, decays)
  const pulse = Math.sin((frame / fps) * Math.PI * 1.5) * 0.03 * propSpring;

  // --- Cinematic camera creep ---
  const cameraZoom = interpolate(frame, [0, 183], [1.0, 1.05], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraZoom})`,
          transformOrigin: '50% 60%',
        }}
      >
        <RoomEnvironment type="ancient_palace">
          {/* STATUS BADGE — top center, punches in at frame 0 */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: '50%',
              transform: `translateX(-50%) scale(${badgeSpring * wordScale})`,
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              border: '8px solid #000000',
              borderRadius: 36,
              padding: '14px 40px',
              fontSize: 34,
              fontWeight: 900,
              boxShadow: '0 10px 0 #000000',
              zIndex: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              whiteSpace: 'nowrap',
              letterSpacing: 1,
            }}
          >
            <span>🌐</span>
            <span>{sceneMeta?.badgeText || 'GLOBAL DEMAND'}</span>
            <span>👑</span>
          </div>

          {/* HERO PROP — Ashoka Pillar emblem, LEFT stage, the "HUB" */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              transform: `scale(${1 + pulse})`,
              // REQUIRED FIX: Prop Y changed to 860
              transformOrigin: '340px 860px', // Adjusted transformOrigin for new prop Y
              opacity: propSpring,
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {/* REQUIRED FIX: Changed type to 'ashoka_pillar_emblem', adjusted y and scale */}
            <HeroProp
              type="ashoka_pillar_emblem" // AD Fix: Add HeroProp 'ashoka_pillar_emblem'
              x={340} // AD Fix: x=340
              y={860} // AD Fix: y=860
              scale={1.3} // AD Fix: scale=1.3
              shakeIntensity={propSpring}
            />
            {/* Hub glow halo behind the emblem */}
            <div
              style={{
                position: 'absolute',
                left: 340, // Consistent with prop x
                // REQUIRED FIX: Prop Y changed to 860, so halo top adjusted relative to new prop Y
                top: 720, // (860 - 140, assuming original 960 - 140 = 820 offset)
                width: 360,
                height: 360,
                marginLeft: -180,
                marginTop: -180,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(251,191,36,0.0) 70%)',
                opacity: propSpring,
                zIndex: 10,
              }}
            />
          </div>

          {/* STAGE CONNECTOR — trade-route tether across the hub gap */}
          <StageConnector
            type="tension_cords"
            // REQUIRED FIX: CharacterRig x changed to 740
            fromX={740} // Adjusted to new character x
            // REQUIRED FIX: CharacterRig y changed to 900, so fromY adjusted to maintain visual connection height
            fromY={600} // Adjusted (original 640 - (old charY 940 - new charY 900) = 600)
            // Prop x, y are now 340, 860 as per AD Fixes, so toX/toY matches
            toX={340} // Matches new prop x
            toY={860} // Matches new prop y
            tension={1.0}
            tugIntensity={Math.sin((frame / fps) * Math.PI * 1.5) * 5}
            opacity={charSpring}
          />

          {/* CHARACTER — Chanakya, RIGHT stage, calm conviction pointing the hub */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              opacity: charSpring,
              transform: `translateY(${charSlide}px)`,
              zIndex: 30,
            }}
          >
            {/* REQUIRED FIX: CharacterRig x changed to 740, y changed to 900 to establish Clean Split Duo Archetype B */}
            <CharacterRig
              era="ancient"
              role="chanakya"
              head="chanakya_shikha"
              face="bliss_dreaming"
              pose="chanakya_pointing"
              x={740} // AD Fix: x=740
              y={900} // AD Fix: y=900
              scale={1.15} // Scale maintained as no specific change was requested for character scale
              clothColor="#EA580C"
              attireOverlay="dhoti_janeu"
              facialHair="clean_shaven"
              breathing={true}
              blinking={true}
              armProgress={armSweep}
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};

export default Scene4;