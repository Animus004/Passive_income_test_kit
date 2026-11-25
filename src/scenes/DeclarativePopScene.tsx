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
import {
  isLegendRole,
  LegendCharacterRig,
  LegendExpression,
  LegendLookAt,
  LegendPose,
} from '../components/legends';

function mapToLegendPose(rawPose?: string): LegendPose | undefined {
  if (!rawPose) return undefined;
  const p = rawPose.toLowerCase().trim();
  const valid: LegendPose[] = [
    'heroic_idle',
    'guru_updesh',
    'wielding_chakra',
    'playing_bansuri',
    'archer_aiming',
    'warrior_stance',
    'holding_scroll',
    'orator_folded',
    'chaupar_scheme',
  ];
  if (valid.includes(p as LegendPose)) return p as LegendPose;
  if (p === 'spinning_chakra') return 'wielding_chakra';
  if (p === 'drawing_bow') return 'archer_aiming';
  if (p === 'unsheathing_talwar' || p === 'wealth_proud_chest') return 'warrior_stance';
  if (p === 'chanakya_pointing') return 'holding_scroll';
  if (p === 'whispering_sly' || p === 'rolling_dice') return 'chaupar_scheme';
  if (p === 'puppeteer_strings') return 'guru_updesh';
  return undefined;
}

function mapToLegendExpression(rawExpr?: string): LegendExpression | undefined {
  if (!rawExpr) return undefined;
  const e = rawExpr.toLowerCase().trim();
  const valid: LegendExpression[] = [
    'calm_updesh',
    'focused_aim',
    'fierce_resolve',
    'compassionate',
    'strategic_smirk',
    'commanding',
    'orator_fire',
    'meditative',
  ];
  if (valid.includes(e as LegendExpression)) return e as LegendExpression;
  if (e === 'divine_calm' || e === 'bliss_dreaming') return 'calm_updesh';
  if (e === 'warrior_focus') return 'focused_aim';
  if (e === 'cunning_smirk') return 'strategic_smirk';
  return undefined;
}

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

  // Frame 0 Seismic Shock Shake (Impacts on Frame 0..12)
  const hookImpactShake = sceneIndex === 1 && frame < 12
    ? Math.sin(frame * 3.8) * Math.max(0, 1 - frame / 12) * 16
    : 0;

  // Frame 0 Kinetic Center Shock Hook Card (Scene 1 only, frames 0..28)
  const isHookFrame = sceneIndex === 1 && frame < 30;
  const shockCardSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 260 },
  });
  const shockCardScale = interpolate(shockCardSpring, [0, 1], [2.2, 1.0]);
  const shockCardFade = interpolate(frame, [22, 28], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shockCardSlideUp = interpolate(frame, [22, 28], [0, -60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
    if (isLegendRole(charRole)) return '';
    if (sceneIndex === 1) return 'shock_hands_on_head';
    if (isAncient) return 'standing_dazed';
    return sceneIndex % 2 === 0 ? 'holding_phone' : 'shock_hands_on_head';
  })();

  const charFace = (() => {
    if (characterSpec.face) return characterSpec.face;
    if (isLegendRole(charRole)) return '';
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
  const archetype = beat.director_staging?.archetype || beat.staging?.archetype || (sceneIndex === 1 ? 'MACRO_HOOK_PUNCH' : 'CLEAN_SPLIT_DUO');

  // Secondary Character for Confrontation Archetypes
  const secondCharSpec = beat.secondCharacter || {};
  const secondCharRole =
    secondCharSpec.role ||
    (isAncient
      ? charRole === 'shakuni'
        ? 'duryodhana'
        : charRole === 'krishna'
        ? 'arjuna'
        : 'karna'
      : 'modern_commoner');
  const secondCharPose = secondCharSpec.pose || (isLegendRole(secondCharRole) ? '' : isAncient ? 'wealth_proud_chest' : 'standing_dazed');
  const secondCharFace = secondCharSpec.face || (isLegendRole(secondCharRole) ? '' : 'shock_alarm');
  const secondCharHead = secondCharSpec.head || (isAncient ? 'royal_mukut' : 'slick');

  // Badge text & color
  const badgeText = beat.badge || beat.title || 'ODDLY TOLD';
  const badgeEmoji = beat.badgeEmoji || (isAncient ? '📜' : '🚨');
  const badgeBg = (() => {
    if (beat.badgeColor) return beat.badgeColor;
    if (isAncient) return '#D97706'; // Royal amber
    return '#EF4444'; // Red alert
  })();

  const beatStartSec = beat.startSec || 0;

  // Dual-Cast Actor Router: Routes Mythological/Historical Heroes to LegendCharacterRig,
  // while preserving CharacterRig strictly for Everyday Modern / Generic characters.
  const renderActor = ({
    role,
    head,
    face,
    pose,
    weapon,
    x,
    y,
    scale = 1.0,
    flipHorizontal = false,
    lookAt = 'center' as LegendLookAt,
    defaultLegendPose,
    defaultLegendExpression,
  }: {
    role: string;
    head: string;
    face: string;
    pose: string;
    weapon?: any;
    x: number;
    y: number;
    scale?: number;
    flipHorizontal?: boolean;
    lookAt?: LegendLookAt;
    defaultLegendPose?: LegendPose;
    defaultLegendExpression?: LegendExpression;
  }) => {
    if (isLegendRole(role)) {
      const effectiveLookAt: LegendLookAt =
        flipHorizontal && lookAt !== 'center'
          ? lookAt === 'left'
            ? 'right'
            : 'left'
          : lookAt;
      const mappedPose = mapToLegendPose(pose) ?? defaultLegendPose;
      const mappedExpr = mapToLegendExpression(face) ?? defaultLegendExpression;

      return (
        <LegendCharacterRig
          legendId={role}
          pose={mappedPose}
          expression={mappedExpr}
          lookAt={effectiveLookAt}
          weapon={weapon}
          x={x}
          y={y - 25}
          scale={scale * 0.88}
          flipHorizontal={flipHorizontal}
          beatWords={beatWords}
          beatStartSec={beatStartSec}
          breathing={true}
          blinking={true}
        />
      );
    }

    return (
      <CharacterRig
        era={isAncient ? 'ancient' : 'modern'}
        role={role}
        head={head}
        face={face}
        pose={pose}
        x={x}
        y={y}
        scale={scale}
        flipHorizontal={flipHorizontal}
        breathing={true}
        blinking={true}
        armProgress={armProgress}
        handTug={handTug}
      />
    );
  };

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Dynamic Camera Rig & Whip Transition Wrapper */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translateX(${transitionSlideX + hookImpactShake}px) translateY(${hookImpactShake * 0.7}px) scale(${cameraZoom}) rotate(${cameraTilt}deg)`,
          transformOrigin: '50% 60%',
          opacity: transitionOpacity,
        }}
      >
        <RoomEnvironment type={envType as any}>
          {/* FRAME-0 KINETIC CENTER SHOCK IMPACT CARD (Scene 1 Viral 9.5 Thumb-Stop) */}
          {isHookFrame && (
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: `translate(-50%, -50%) translateY(${shockCardSlideUp}px) scale(${shockCardScale})`,
                opacity: shockCardFade,
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                pointerEvents: 'none',
                width: 940,
              }}
            >
              {/* High Stakes Danger Warning Pill */}
              <div
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: '6px solid #000000',
                  borderRadius: 24,
                  padding: '10px 32px',
                  fontSize: 26,
                  fontWeight: 900,
                  boxShadow: '0 6px 0 #000000',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                ⚠️ 100% UNTOLD TRUTH
              </div>

              {/* Massive Center Shock Typography Card */}
              <div
                style={{
                  backgroundColor: '#FDE047',
                  border: '10px solid #000000',
                  borderRadius: 36,
                  padding: '24px 36px',
                  boxShadow: '0 16px 0 #000000',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    color: '#000000',
                    fontSize: 56,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    fontFamily: 'Impact, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {beat.hookHeadline || beat.title || 'STOP SCROLLING!'}
                </div>
              </div>
            </div>
          )}

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

          {/* ========================================================================= */}
          {/* ARCHETYPE 1: MACRO HOOK PUNCH (Extreme Thumb-Stopping Impact)            */}
          {/* ========================================================================= */}
          {archetype === 'MACRO_HOOK_PUNCH' ? (
            <>
              {/* Dynamic Comic Speed Lines Burst */}
              <svg
                width="1080"
                height="1920"
                viewBox="0 0 1080 1920"
                fill="none"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
              >
                {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
                  <line
                    key={deg}
                    x1="540"
                    y1="850"
                    x2={540 + 1200 * Math.cos((deg * Math.PI) / 180)}
                    y2={850 + 1200 * Math.sin((deg * Math.PI) / 180)}
                    stroke={isAncient ? '#F59E0B' : '#EF4444'}
                    strokeWidth="8"
                    strokeDasharray="40 120"
                    opacity="0.35"
                  />
                ))}
              </svg>

              {/* Character Rig (Heroic Legend or Comedy Bean) */}
              <div
                style={{
                  opacity: charSpring,
                  transform: `translateY(${charSlide}px)`,
                }}
              >
                {renderActor({
                  role: charRole,
                  head: charHead,
                  face: isLegendRole(charRole) ? (characterSpec.face || '') : 'shock_alarm',
                  pose: isLegendRole(charRole)
                    ? (characterSpec.pose || '')
                    : isAncient && charRole === 'shakuni'
                    ? 'rolling_dice'
                    : 'shock_hands_on_head',
                  weapon: characterSpec.weapon,
                  x: 685,
                  y: 880,
                  scale: 1.32,
                  lookAt: 'left',
                  defaultLegendExpression: 'commanding',
                })}
              </div>

              {/* Massive Foreground Hero Element Slamming into Camera */}
              <HeroProp
                type={heroPropType === 'chanakya_scroll' && !isAncient ? 'credit_card_trap' : heroPropType}
                x={330}
                y={920}
                scale={1.55}
                shakeIntensity={propSpring * 2.2}
              />
            </>
          ) : archetype === 'DUAL_CONFRONTATION' ? (
            <>
              {/* Left Actor (Hero / Guru / Strategist) */}
              <div
                style={{
                  opacity: charSpring,
                  transform: `translateX(${interpolate(charSpring, [0, 1], [-40, 0])}px)`,
                }}
              >
                {renderActor({
                  role: charRole,
                  head: charHead,
                  face: isLegendRole(charRole) ? (characterSpec.face || '') : 'dazed_asymmetric',
                  pose: isLegendRole(charRole) ? (characterSpec.pose || '') : 'whispering_sly',
                  weapon: characterSpec.weapon,
                  x: 265,
                  y: 950,
                  scale: 1.05,
                  flipHorizontal: false,
                  lookAt: 'right',
                  defaultLegendPose: charRole === 'krishna' ? 'guru_updesh' : undefined,
                  defaultLegendExpression: 'calm_updesh',
                })}
              </div>

              {/* Central Confrontation Energy Spark */}
              <svg
                width="1080"
                height="1920"
                viewBox="0 0 1080 1920"
                fill="none"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25 }}
              >
                <path
                  d="M 350 640 Q 540 580 730 640"
                  stroke="#F59E0B"
                  strokeWidth="8"
                  strokeDasharray="16 10"
                  fill="none"
                  opacity={charSpring}
                />
                <circle cx="540" cy="610" r="30" fill="#DC2626" stroke="#000000" strokeWidth="6" />
                <text x="540" y="621" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="sans-serif">
                  ⚡
                </text>
              </svg>

              {/* Right Actor (Warrior / Counterpart facing Left Actor) */}
              <div
                style={{
                  opacity: charSpring,
                  transform: `translateX(${interpolate(charSpring, [0, 1], [40, 0])}px)`,
                }}
              >
                {renderActor({
                  role: secondCharRole,
                  head: secondCharHead,
                  face: isLegendRole(secondCharRole) ? (secondCharSpec.face || '') : secondCharFace,
                  pose: isLegendRole(secondCharRole) ? (secondCharSpec.pose || '') : secondCharPose,
                  weapon: secondCharSpec.weapon,
                  x: 815,
                  y: 950,
                  scale: 1.05,
                  flipHorizontal:
                    isLegendRole(secondCharRole) &&
                    (mapToLegendPose(secondCharSpec.pose) === 'archer_aiming' ||
                      secondCharRole === 'arjuna' ||
                      secondCharRole === 'karna' ||
                      secondCharRole === 'rama')
                      ? false
                      : true,
                  lookAt: 'left',
                  defaultLegendExpression: 'focused_aim',
                })}
              </div>
            </>
          ) : archetype === 'STRATEGY_MAP_ARENA' ? (
            <>
              {/* Strategist / Commander Centered Above Map */}
              <div
                style={{
                  opacity: charSpring,
                  transform: `translateY(${charSlide}px)`,
                }}
              >
                {renderActor({
                  role: charRole,
                  head: charHead,
                  face: isLegendRole(charRole) ? (characterSpec.face || '') : 'dead_inside',
                  pose: isLegendRole(charRole) ? (characterSpec.pose || '') : 'puppeteer_strings',
                  weapon: characterSpec.weapon,
                  x: 540,
                  y: 660,
                  scale: 1.0,
                  lookAt: 'center',
                  defaultLegendPose: 'guru_updesh',
                  defaultLegendExpression: 'commanding',
                })}
              </div>

              {/* Big Isometric Tactical Strategy Board / War Map */}
              <HeroProp
                type={isAncient ? 'ancient_war_map_bharat' : 'desk_laptop_open'}
                x={540}
                y={1070}
                scale={1.5}
                shakeIntensity={propSpring}
              />
            </>
          ) : archetype === 'METAPHOR_MONOLITH' ? (
            <>
              {/* Overhead Spotlight Beam */}
              <svg
                width="1080"
                height="1920"
                viewBox="0 0 1080 1920"
                fill="none"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <polygon points="540,0 420,0 200,1500 880,1500" fill="#FDE047" opacity="0.08" />
              </svg>

              {/* Massive Centerpiece Symbolic Prop */}
              <HeroProp
                type={heroPropType}
                x={540}
                y={930}
                scale={1.52}
                shakeIntensity={propSpring}
              />

              {/* Flanking Ambient Diya Torches */}
              {isAncient && (
                <>
                  <HeroProp
                    type="mystic_diya_flame"
                    x={140}
                    y={1180}
                    scale={0.88}
                    shakeIntensity={0}
                  />
                  <HeroProp
                    type="mystic_diya_flame"
                    x={940}
                    y={1180}
                    scale={0.88}
                    shakeIntensity={0}
                  />
                </>
              )}
            </>
          ) : archetype === 'DOCUMENT_EDICT_UNROLL' ? (
            <>
              {/* Unrolled Grand Edict / Gita Grantha / Scroll on Left */}
              <HeroProp
                type={isAncient ? heroPropType || 'chanakya_scroll' : 'incident_report_stack'}
                x={390}
                y={940}
                scale={1.36}
                shakeIntensity={propSpring}
              />

              {/* Actor on Right Presenting & Explaining Edict (Flipped inward so arms/weapons never clip right pillar) */}
              <div
                style={{
                  opacity: charSpring,
                  transform: `translateY(${charSlide}px)`,
                }}
              >
                {renderActor({
                  role: charRole,
                  head: charHead,
                  face: isLegendRole(charRole) ? (characterSpec.face || '') : 'dead_inside',
                  pose: isLegendRole(charRole) ? 'guru_updesh' : 'chanakya_pointing',
                  weapon: characterSpec.weapon,
                  x: 755,
                  y: 940,
                  scale: 1.08,
                  flipHorizontal: isLegendRole(charRole) && !['archer_aiming', 'orator_folded'].includes(mapToLegendPose(characterSpec.pose) || ''),
                  lookAt: 'left',
                  defaultLegendPose: 'guru_updesh',
                  defaultLegendExpression: 'calm_updesh',
                })}
              </div>
            </>
          ) : archetype === 'TENSION_HUD_METER' ? (
            <>
              {/* Tactical Gauge Center-Left */}
              <HeroProp
                type="tension_gauge_hud"
                x={355}
                y={890}
                scale={1.42}
                shakeIntensity={propSpring * 1.5}
              />

              {/* Hero / Reactor on Right facing Left */}
              <div
                style={{
                  opacity: charSpring,
                  transform: `translateY(${charSlide}px)`,
                }}
              >
                {renderActor({
                  role: charRole,
                  head: charHead,
                  face: isLegendRole(charRole) ? (characterSpec.face || '') : 'shock_alarm',
                  pose: isLegendRole(charRole) ? (characterSpec.pose || '') : 'shock_hands_on_head',
                  weapon: characterSpec.weapon,
                  x: 755,
                  y: 930,
                  scale: 1.1,
                  flipHorizontal: isLegendRole(charRole) && !['archer_aiming', 'orator_folded'].includes(mapToLegendPose(characterSpec.pose) || ''),
                  lookAt: 'left',
                  defaultLegendExpression: 'fierce_resolve',
                })}
              </div>
            </>
          ) : archetype === 'REACTION_CLOSEUP' ? (
            <>
              {/* Comic Focus Speed Rays */}
              <svg
                width="1080"
                height="1920"
                viewBox="0 0 1080 1920"
                fill="none"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
              >
                {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
                  <line
                    key={deg}
                    x1="540"
                    y1="860"
                    x2={540 + 800 * Math.cos((deg * Math.PI) / 180)}
                    y2={860 + 800 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#F59E0B"
                    strokeWidth="10"
                    strokeDasharray="60 140"
                    opacity="0.4"
                  />
                ))}
              </svg>

              <div
                style={{
                  opacity: charSpring,
                  transform: `translateY(${charSlide}px)`,
                }}
              >
                {renderActor({
                  role: charRole,
                  head: charHead,
                  face: isLegendRole(charRole) ? (characterSpec.face || '') : 'shock_alarm',
                  pose: isLegendRole(charRole) ? (characterSpec.pose || '') : 'shock_hands_on_head',
                  weapon: characterSpec.weapon,
                  x: 540,
                  y: 920,
                  scale: 1.28,
                  lookAt: 'center',
                  defaultLegendExpression: 'orator_fire',
                })}
              </div>

              {/* Floating Viral Comment Bubbles */}
              <HeroProp
                type="viral_comment_bubbles"
                x={540}
                y={1245}
                scale={1.12}
                shakeIntensity={propSpring}
              />
            </>
          ) : (
            <>
              {/* Left Stage: Hero Prop */}
              <HeroProp
                type={heroPropType}
                x={335}
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
                {renderActor({
                  role: charRole,
                  head: charHead,
                  face: charFace,
                  pose: charPose,
                  weapon: characterSpec.weapon,
                  x: 755,
                  y: 940,
                  scale: 1.1,
                  flipHorizontal: isLegendRole(charRole) && !['archer_aiming', 'orator_folded'].includes(mapToLegendPose(charPose) || ''),
                  lookAt: 'left',
                  defaultLegendExpression: 'calm_updesh',
                })}
              </div>

              {/* Dynamic Stage Tethering (Puppet strings / Tension cords) */}
              {(envType === 'puppet_stage_shadow' || heroPropType.includes('puppet') || heroPropType.includes('chain')) && (
                <StageConnector
                  type={isAncient ? 'puppet_strings' : 'tension_cords'}
                  fromX={770}
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
