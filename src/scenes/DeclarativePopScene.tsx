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
} from '../components/rigs';

export interface DeclarativeBeatProps {
  beat: any;
  sceneIndex: number;
  totalScenes: number;
  beatWords?: { word: string; start: number; end: number }[];
  isHindi?: boolean;
}

export const DeclarativePopScene: React.FC<DeclarativeBeatProps> = ({
  beat,
  sceneIndex,
  totalScenes,
  beatWords = [],
  isHindi = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 1. Staggered Springs (Zero Frame 0 Congestion)
  // Badge punches in immediately (Frame 0..10)
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  // Hero Prop drops & lands on pedestal (Frame 6..18)
  const propSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 14, stiffness: 190 },
  });

  // Character emerges with slide & fade (Frame 12..26)
  const charSpring = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);

  // Dynamic Arm Gesture sweep (Frame 16..32)
  const armProgress = interpolate(
    spring({
      frame: Math.max(0, frame - 16),
      fps,
      config: { damping: 14, stiffness: 170 },
    }),
    [0, 1],
    [0.2, 1.0]
  );

  // Subtle continuous hand string/gesture tension
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;

  // 2. Dynamic Cinematography (Camera Angles & Profiles)
  const duration = beat.durationInFrames || 120;
  let cameraZoom = 1.0;
  let cameraTilt = 0;

  if (sceneIndex === 1) {
    // BEAT 1 HOOK: Dynamic Crash Punch Zoom (Starts at 1.12 with slight Dutch angle, snaps to 1.0)
    const hookSnap = spring({
      frame,
      fps,
      config: { damping: 13, stiffness: 210 },
    });
    cameraZoom = interpolate(hookSnap, [0, 1], [1.12, 1.0]);
    cameraTilt = interpolate(hookSnap, [0, 1], [2.2, 0]);
  } else if (sceneIndex === totalScenes) {
    // CLIMAX / CALL TO ACTION: Punch Zoom in on punchline
    cameraZoom = interpolate(frame, [0, duration], [1.0, 1.10], {
      extrapolateRight: 'clamp',
    });
  } else {
    // MID BEATS: Steady cinematic push
    cameraZoom = interpolate(frame, [0, duration], [1.0, 1.05], {
      extrapolateRight: 'clamp',
    });
  }

  // Snappy Beat Transition Whip (First 6 frames)
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 240 },
  });
  const transitionSlideX = interpolate(
    enterSpring,
    [0, 1],
    [sceneIndex === 1 ? 0 : (sceneIndex % 2 === 0 ? 40 : -40), 0]
  );
  const transitionOpacity = interpolate(enterSpring, [0, 1], [0.6, 1.0]);

  // 3. Staging & Asset Recipe Normalization
  const rawEnv = (beat.environment || 'ancient_palace').toLowerCase();
  const isAncient =
    rawEnv.includes('ancient') ||
    rawEnv.includes('durbar') ||
    rawEnv.includes('vault') ||
    rawEnv.includes('temple') ||
    rawEnv.includes('chaupar') ||
    rawEnv.includes('puppet');

  // Verified 11 RoomEnvironment types
  const envType = (() => {
    if (rawEnv.includes('throne') || rawEnv.includes('durbar')) return 'durbar_throne_room';
    if (rawEnv.includes('dungeon') || rawEnv.includes('subterranean')) return 'subterranean_dungeon_vault';
    if (rawEnv.includes('puppet') || rawEnv.includes('shadow')) return 'puppet_stage_shadow';
    if (rawEnv.includes('chaupar') || rawEnv.includes('arena')) return 'chaupar_board_arena';
    if (rawEnv.includes('temple') || rawEnv.includes('vault_b')) return 'temple_vault';
    if (rawEnv.includes('ancient') || rawEnv.includes('palace')) return 'ancient_palace';
    if (rawEnv.includes('finance') || rawEnv.includes('bank') || rawEnv.includes('salary')) return 'modern_finance';
    if (rawEnv.includes('office') || rawEnv.includes('desk')) return 'office_desk';
    if (rawEnv.includes('bedroom')) return 'bedroom_dark';
    if (rawEnv.includes('kitchen')) return 'kitchen_morning';
    return isAncient ? 'ancient_palace' : 'modern_finance';
  })();

  const heroPropType = (beat.heroElement || (isAncient ? 'chanakya_scroll' : 'salary_slip_drain')).toLowerCase();

  // Character Normalization
  const characterSpec = beat.character || {};
  const charRole = (() => {
    if (characterSpec.role) return characterSpec.role;
    if (isAncient) {
      if (heroPropType.includes('scroll') || heroPropType.includes('mask') || heroPropType.includes('poison')) return 'chanakya';
      if (heroPropType.includes('dice') || heroPropType.includes('chaupar') || heroPropType.includes('puppet')) return 'shakuni';
      if (heroPropType.includes('throne') || heroPropType.includes('crown') || heroPropType.includes('shield')) return 'king';
      return 'chanakya';
    }
    return 'modern_creator';
  })();

  const charPose = (() => {
    if (characterSpec.pose) return characterSpec.pose;
    if (sceneIndex === 1) return 'shock_hands_on_head';
    if (isAncient) {
      if (charRole === 'chanakya') return 'chanakya_pointing';
      if (charRole === 'shakuni') return 'whispering_sly';
      return 'wealth_proud_chest';
    }
    return sceneIndex % 2 === 0 ? 'holding_phone' : 'shock_hands_on_head';
  })();

  const charFace = (() => {
    if (characterSpec.face) return characterSpec.face;
    if (sceneIndex === 1) return 'shock_alarm';
    if (isAncient) return 'dead_inside';
    return sceneIndex % 2 === 0 ? 'dazed_asymmetric' : 'shock_alarm';
  })();

  const charHead = (() => {
    if (characterSpec.head) return characterSpec.head;
    if (isAncient) {
      if (charRole === 'chanakya') return 'chanakya_shikha';
      if (charRole === 'shakuni') return 'shakuni_cowl';
      return 'royal_pagdi';
    }
    return 'curly';
  })();

  // Staging Archetype
  const archetype = beat.director_staging?.archetype || beat.staging?.archetype || 'CLEAN_SPLIT_DUO';

  // Badge text & color
  const badgeText = beat.badge || beat.title || 'ODDLY TOLD';
  const badgeEmoji = beat.badgeEmoji || (isAncient ? '📜' : '🚨');
  const badgeBg = (() => {
    if (beat.badgeColor) return beat.badgeColor;
    if (isAncient) return '#D97706'; // Royal amber
    return '#EF4444'; // Red alert
  })();

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Dynamic Camera Rig & Whip Transition Wrapper */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translateX(${transitionSlideX}px) scale(${cameraZoom}) rotate(${cameraTilt}deg)`,
          transformOrigin: '50% 60%',
          opacity: transitionOpacity,
        }}
      >
        <RoomEnvironment type={envType as any}>
          {/* TOP STATUS BADGE (Punches in Frame 0) */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: '50%',
              transform: `translateX(-50%) scale(${badgeSpring})`,
              backgroundColor: badgeBg,
              color: '#FFFFFF',
              border: '7px solid #000000',
              borderRadius: 36,
              padding: '12px 36px',
              fontSize: 30,
              fontWeight: 900,
              boxShadow: '0 9px 0 #000000',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ fontSize: 32 }}>{badgeEmoji}</span>
            <span style={{ textTransform: 'uppercase' }}>{badgeText}</span>
          </div>

          {/* STAGING LAYOUT */}
          {archetype === 'SOLO_HERO_MONOLITH' ? (
            /* Archetype A: Solo Hero Centered */
            <>
              <HeroProp
                type={heroPropType}
                x={540}
                y={940}
                scale={1.38}
                shakeIntensity={propSpring}
              />
              {/* Flanking ambient diya lamps */}
              {isAncient && (
                <>
                  <HeroProp
                    type="mystic_diya_flame"
                    x={160}
                    y={1160}
                    scale={0.82}
                    shakeIntensity={0}
                  />
                  <HeroProp
                    type="mystic_diya_flame"
                    x={920}
                    y={1160}
                    scale={0.82}
                    shakeIntensity={0}
                  />
                </>
              )}
            </>
          ) : archetype === 'REACTION_CLOSEUP' ? (
            /* Archetype C: Reaction Face Close-Up */
            <div
              style={{
                opacity: charSpring,
                transform: `translateY(${charSlide}px)`,
              }}
            >
              <CharacterRig
                era={isAncient ? 'ancient' : 'modern'}
                role={charRole}
                head={charHead}
                face="shock_alarm"
                pose="shock_hands_on_head"
                x={540}
                y={820}
                scale={1.48}
                breathing={true}
                blinking={true}
                armProgress={armProgress}
              />
            </div>
          ) : (
            /* Archetype B: Clean Split Duo (Standard Zero-Collision Layout) */
            <>
              {/* Left Stage: Hero Prop */}
              <HeroProp
                type={heroPropType}
                x={340}
                y={960}
                scale={1.15}
                shakeIntensity={propSpring}
              />

              {/* Right Stage: Living Character */}
              <div
                style={{
                  opacity: charSpring,
                  transform: `translateY(${charSlide}px)`,
                }}
              >
                <CharacterRig
                  era={isAncient ? 'ancient' : 'modern'}
                  role={charRole}
                  head={charHead}
                  face={charFace}
                  pose={charPose}
                  x={760}
                  y={940}
                  scale={1.15}
                  flipHorizontal={false}
                  breathing={true}
                  blinking={true}
                  armProgress={armProgress}
                  handTug={handTug}
                />
              </div>

              {/* Dynamic Stage Tethering (Puppet strings / Tension cords) */}
              {(envType === 'puppet_stage_shadow' || heroPropType.includes('puppet') || heroPropType.includes('chain')) && (
                <StageConnector
                  type={isAncient ? 'puppet_strings' : 'tension_cords'}
                  fromX={760}
                  fromY={640}
                  toX={340}
                  toY={860}
                  tension={1.0}
                  tugIntensity={handTug}
                  attachCrowns={isAncient}
                  opacity={charSpring}
                />
              )}
            </>
          )}
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
