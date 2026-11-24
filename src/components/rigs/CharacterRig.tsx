import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export type CharacterRole =
  | 'shakuni'
  | 'duryodhana'
  | 'chanakya'
  | 'krishna'
  | 'arjuna'
  | 'karna'
  | 'shivaji'
  | 'ashoka'
  | 'guru_sage'
  | 'pandava'
  | 'kaurava'
  | 'king'
  | 'commoner'
  | 'ancient_commoner'
  | 'middle_class_uncle'
  | 'toxic_boss'
  | 'it_engineer'
  | 'genz_student'
  | 'modern_commoner'
  | 'modern_creator'
  | string;

export type CharacterHeadType =
  | 'messy_bedhead'
  | 'curly'
  | 'beanie'
  | 'slick'
  | 'hoodie'
  | 'bald'
  | 'ponytail'
  | 'bob_cut'
  | 'chanakya_shikha'
  | 'royal_pagdi'
  | 'royal_mukut'
  | 'shakuni_cowl'
  | 'mor_pankh_mukut'
  | 'maratha_jiratop'
  | 'ashoka_stone_crest'
  | 'sage_rishi_bun'
  | 'uncle_comb_over'
  | 'boss_bald_fringe'
  | string;
export type CharacterFaceType =
  | 'shock_alarm'
  | 'dead_inside'
  | 'dazed_asymmetric'
  | 'divine_calm'
  | 'warrior_focus'
  | 'cunning_smirk'
  | 'floating_ghost'
  | 'keyboard_slump'
  | 'bliss_dreaming'
  | 'dread_loop'
  | string;
export type CharacterFacialHair =
  | 'none'
  | 'royal_moustache'
  | 'elder_beard'
  | 'shivaji_beard'
  | 'white_rishi_beard'
  | 'thick_uncle_mustache'
  | 'stubble'
  | string;
export type CharacterAttire =
  | 'default'
  | 'warrior_kavach'
  | 'dark_shawl'
  | 'dhoti_janeu'
  | 'royal_mala'
  | 'pitambar_silk'
  | 'maratha_angarkha'
  | 'ashoka_armor'
  | 'sage_saffron'
  | 'uncle_sweater_vest'
  | 'boss_suit_tie'
  | string;
export type CharacterPoseType =
  | 'recoil_bed'
  | 'duvet_cocoon'
  | 'floating_ghost'
  | 'standing_dazed'
  | 'slouched_chair'
  | 'desk_typing'
  | 'keyboard_collapse'
  | 'fetal_reach'
  | 'holding_phone'
  | 'keyboard_panic'
  | 'desk_sit_relaxed'
  | 'slouched_flat'
  | 'chanakya_pointing'
  | 'shock_hands_on_head'
  | 'wealth_proud_chest'
  | 'whispering_sly'
  | 'rolling_dice'
  | 'puppeteer_strings'
  | 'drawing_bow'
  | 'spinning_chakra'
  | 'unsheathing_talwar'
  | 'sipping_chai'
  | 'holding_termination_slip'
  | 'holding_laptop'
  | string;

export interface CharacterRigProps {
  era?: 'modern' | 'ancient';
  role?: CharacterRole;
  head?: CharacterHeadType;
  face?: CharacterFaceType;
  pose?: CharacterPoseType;
  facialHair?: CharacterFacialHair;
  attire?: CharacterAttire;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  skinColor?: string;
  clothColor?: string;
  hairColor?: string;
  accentColor?: string;
  breathing?: boolean;
  blinking?: boolean;
  flipHorizontal?: boolean;
  glasses?: boolean;
  armProgress?: number; // 0 = relaxed at side, 1 = full pose extension (dynamic arm sweep)
  handTug?: number;     // subtle pixel oscillation for finger/hand string tension
  [key: string]: any;
}

export const CharacterRig: React.FC<CharacterRigProps> = ({
  era,
  role: rawRole,
  head: rawHead,
  face: explicitFace,
  pose: explicitPose,
  facialHair: explicitFacialHair,
  attire: rawAttire,
  x = 0,
  y = 0,
  scale = 1,
  rotation = 0,
  opacity = 1,
  skinColor: explicitSkin,
  clothColor: explicitCloth,
  hairColor: explicitHair,
  accentColor: explicitAccent,
  breathing = true,
  blinking = true,
  flipHorizontal = false,
  glasses = false,
  armProgress = 1.0,
  handTug = 0,
}) => {
  // -------------------------------------------------------------
  // Layer 2: Era Guardrails & Normalization (Physically refuse anachronisms)
  // -------------------------------------------------------------
  const ancientRoles = [
    'shakuni',
    'duryodhana',
    'chanakya',
    'krishna',
    'arjuna',
    'karna',
    'shivaji',
    'ashoka',
    'guru_sage',
    'pandava',
    'kaurava',
    'king',
    'ancient_commoner'
  ];
  const ancientHeads = [
    'royal_mukut',
    'royal_pagdi',
    'shakuni_cowl',
    'chanakya_shikha',
    'mor_pankh_mukut',
    'maratha_jiratop',
    'ashoka_stone_crest',
    'sage_rishi_bun'
  ];
  const ancientAttires = [
    'warrior_kavach',
    'dark_shawl',
    'dhoti_janeu',
    'royal_mala',
    'pitambar_silk',
    'maratha_angarkha',
    'ashoka_armor',
    'sage_saffron'
  ];

  let role = rawRole;
  let explicitHead = rawHead;
  let explicitAttire = rawAttire;

  if (era === 'modern' || role === 'modern_creator' || role === 'modern_commoner') {
    // If era is explicitly modern or modern role is selected, strictly block ancient assets
    if (role && (ancientRoles.includes(role) || role === 'commoner')) {
      role = 'modern_creator';
    }
    if (explicitHead && ancientHeads.includes(explicitHead)) {
      explicitHead = 'slick';
    }
    if (explicitAttire && ancientAttires.includes(explicitAttire)) {
      explicitAttire = 'default';
    }
  } else if (era === 'ancient') {
    if (role === 'modern_creator' || role === 'modern_commoner') {
      role = 'ancient_commoner';
    }
    if (explicitHead === 'beanie' || explicitHead === 'hoodie') {
      explicitHead = 'royal_pagdi';
    }
  }

  // Deterministic, CAD-level role defaults
  let defaultHead: CharacterHeadType = 'messy_bedhead';
  let defaultFace: CharacterFaceType = 'dead_inside';
  let defaultPose: CharacterPoseType = 'standing_dazed';
  let defaultFacialHair: CharacterFacialHair = 'none';
  let defaultAttire: CharacterAttire = 'default';
  let defaultSkin = '#FED7AA'; // Warm peach skin
  let defaultCloth = '#3B82F6'; // Cobalt blue
  let defaultHair = '#1E293B'; // Dark slate
  let defaultAccent = '#EF4444';

  if (role === 'krishna') {
    defaultHead = 'mor_pankh_mukut';
    defaultFacialHair = 'none';
    defaultAttire = 'pitambar_silk';
    defaultPose = 'spinning_chakra';
    defaultCloth = '#FACC15'; // Pitambar radiant gold
    defaultHair = '#0F172A';
    defaultAccent = '#F59E0B';
    defaultSkin = '#38BDF8'; // Shyam sundar divine azure blue
  } else if (role === 'arjuna') {
    defaultHead = 'royal_mukut';
    defaultFacialHair = 'none';
    defaultAttire = 'warrior_kavach';
    defaultPose = 'drawing_bow';
    defaultCloth = '#1E3A8A'; // Deep royal warrior blue
    defaultHair = '#0F172A';
    defaultAccent = '#F59E0B';
    defaultSkin = '#FBBF24';
  } else if (role === 'karna') {
    defaultHead = 'royal_mukut';
    defaultFacialHair = 'none';
    defaultAttire = 'warrior_kavach';
    defaultPose = 'wealth_proud_chest';
    defaultCloth = '#B45309'; // Solar bronze gold
    defaultHair = '#0F172A';
    defaultAccent = '#FDE047';
    defaultSkin = '#FDE68A';
  } else if (role === 'shivaji') {
    defaultHead = 'maratha_jiratop';
    defaultFacialHair = 'shivaji_beard';
    defaultAttire = 'maratha_angarkha';
    defaultPose = 'unsheathing_talwar';
    defaultCloth = '#EA580C'; // Saffron Maratha angarkha
    defaultHair = '#0F172A';
    defaultAccent = '#FACC15';
    defaultSkin = '#FED7AA';
  } else if (role === 'ashoka') {
    defaultHead = 'ashoka_stone_crest';
    defaultFacialHair = 'royal_moustache';
    defaultAttire = 'ashoka_armor';
    defaultPose = 'chanakya_pointing';
    defaultCloth = '#831843'; // Imperial Mauryan crimson
    defaultHair = '#0F172A';
    defaultAccent = '#FACC15';
    defaultSkin = '#FED7AA';
  } else if (role === 'guru_sage') {
    defaultHead = 'sage_rishi_bun';
    defaultFacialHair = 'white_rishi_beard';
    defaultAttire = 'sage_saffron';
    defaultPose = 'chanakya_pointing';
    defaultCloth = '#EA580C'; // Ascetic saffron
    defaultHair = '#F8FAFC'; // Silver-white rishi hair
    defaultAccent = '#92400E';
    defaultSkin = '#FED7AA';
  } else if (role === 'middle_class_uncle') {
    defaultHead = 'uncle_comb_over';
    defaultFacialHair = 'thick_uncle_mustache';
    defaultAttire = 'uncle_sweater_vest';
    defaultPose = 'sipping_chai';
    defaultCloth = '#65A30D'; // Olive sweater vest
    defaultHair = '#475569';
    defaultAccent = '#F59E0B';
    defaultSkin = '#FED7AA';
  } else if (role === 'toxic_boss') {
    defaultHead = 'boss_bald_fringe';
    defaultFacialHair = 'royal_moustache';
    defaultAttire = 'boss_suit_tie';
    defaultPose = 'holding_termination_slip';
    defaultCloth = '#0F172A'; // Obsidian corporate suit
    defaultHair = '#334155';
    defaultAccent = '#DC2626';
    defaultSkin = '#FED7AA';
  } else if (role === 'it_engineer') {
    defaultHead = 'slick';
    defaultFacialHair = 'stubble';
    defaultAttire = 'default';
    defaultPose = 'holding_laptop';
    defaultCloth = '#2563EB'; // Casual tech blue
    defaultHair = '#0F172A';
    defaultAccent = '#38BDF8';
    defaultSkin = '#FED7AA';
  } else if (role === 'duryodhana') {
    defaultHead = 'royal_mukut';
    defaultFacialHair = 'royal_moustache';
    defaultAttire = 'warrior_kavach';
    defaultPose = 'wealth_proud_chest';
    defaultCloth = '#991B1B'; // Royal crimson
    defaultHair = '#0F172A';
    defaultAccent = '#F59E0B'; // Gold
    defaultSkin = '#FBBF24';
  } else if (role === 'shakuni') {
    defaultHead = 'shakuni_cowl';
    defaultFacialHair = 'elder_beard';
    defaultAttire = 'dark_shawl';
    defaultPose = 'whispering_sly';
    defaultCloth = '#451A03'; // Conspiratorial dark earth brown
    defaultHair = '#64748B'; // Silver-grey strategist
    defaultAccent = '#D97706';
    defaultSkin = '#FED7AA';
  } else if (role === 'chanakya') {
    defaultHead = 'chanakya_shikha';
    defaultFacialHair = 'none';
    defaultAttire = 'dhoti_janeu';
    defaultPose = 'chanakya_pointing';
    defaultCloth = '#EA580C'; // Saffron
    defaultHair = '#0F172A';
    defaultAccent = '#FACC15';
    defaultSkin = '#FDE68A';
  } else if (role === 'pandava') {
    defaultHead = 'royal_mukut';
    defaultFacialHair = 'none';
    defaultAttire = 'warrior_kavach';
    defaultPose = 'wealth_proud_chest';
    defaultCloth = '#1E3A8A'; // Royal blue
    defaultHair = '#0F172A';
    defaultAccent = '#38BDF8';
    defaultSkin = '#FBBF24';
  } else if (role === 'kaurava') {
    defaultHead = 'royal_mukut';
    defaultFacialHair = 'royal_moustache';
    defaultAttire = 'warrior_kavach';
    defaultPose = 'wealth_proud_chest';
    defaultCloth = '#7F1D1D'; // Blood crimson
    defaultHair = '#0F172A';
    defaultAccent = '#F59E0B';
    defaultSkin = '#FBBF24';
  } else if (role === 'king') {
    defaultHead = 'royal_pagdi';
    defaultFacialHair = 'royal_moustache';
    defaultAttire = 'royal_mala';
    defaultPose = 'wealth_proud_chest';
    defaultCloth = '#D97706';
    defaultHair = '#1E293B';
    defaultAccent = '#DC2626';
    defaultSkin = '#FED7AA';
  } else if (role === 'commoner' || role === 'ancient_commoner') {
    defaultHead = 'royal_pagdi';
    defaultFacialHair = 'none';
    defaultAttire = 'default';
    defaultPose = 'standing_dazed';
    defaultCloth = '#CA8A04';
    defaultHair = '#1E293B';
    defaultAccent = '#EAB308';
    defaultSkin = '#FED7AA';
  } else if (role === 'modern_creator' || role === 'modern_commoner') {
    defaultHead = 'messy_bedhead';
    defaultFacialHair = 'stubble';
    defaultAttire = 'default';
    defaultPose = 'standing_dazed';
    defaultCloth = '#3B82F6';
    defaultHair = '#1E293B';
    defaultAccent = '#EF4444';
    defaultSkin = '#FED7AA';
  }

  const head = explicitHead ?? defaultHead;
  const face = explicitFace ?? defaultFace;
  const pose = explicitPose ?? defaultPose;
  const facialHair = explicitFacialHair ?? defaultFacialHair;
  const attire = explicitAttire ?? defaultAttire;
  const skinColor = explicitSkin ?? defaultSkin;
  const clothColor = explicitCloth ?? defaultCloth;
  const hairColor = explicitHair ?? defaultHair;
  const accentColor = explicitAccent ?? defaultAccent;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Natural organic micro-animations
  const breathOffset = breathing ? Math.sin((frame / fps) * Math.PI * 2) * 5 : 0;
  const isBlinkFrame = blinking && frame % 78 < 3 && face !== 'keyboard_slump' && face !== 'bliss_dreaming';
  const isSpeakingFrame = frame % 9 > 2;
  const headBob = breathing ? Math.sin((frame / fps) * Math.PI * 3.5) * 3 : 0;
  const headTilt = breathing ? Math.sin((frame / fps) * Math.PI * 1.8) * 3.2 : 0;
  const floatBob = pose === 'floating_ghost' ? Math.sin((frame / fps) * Math.PI * 1.5) * 16 : 0;

  const STROKE = '#000000';
  const STROKE_WIDTH = 10;

  // Render Head & Hair Geometry
  const renderHead = () => {
    switch (head) {
      case 'messy_bedhead':
        return (
          <g id="head_messy_bedhead">
            {/* Hair back volume */}
            <path
              d="M 180 230 C 140 170 160 90 240 70 C 290 60 340 70 380 100 C 430 140 440 220 400 250 Z"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Wild Bedhead Spikes */}
            <path
              d="M 210 90 L 190 30 L 250 70 L 290 20 L 320 65 L 370 25 L 380 85 L 430 65 L 410 130"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Base Face Cranium */}
            <ellipse
              cx="290"
              cy="230"
              rx="95"
              ry="110"
              fill={skinColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Front messy bangs */}
            <path
              d="M 205 170 Q 240 190 255 160 Q 285 195 320 155 Q 350 185 375 160"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
          </g>
        );

      case 'beanie':
        return (
          <g id="head_beanie">
            {/* Face */}
            <ellipse
              cx="290"
              cy="235"
              rx="95"
              ry="105"
              fill={skinColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Beanie Main Dome */}
            <path
              d="M 195 190 C 185 90 250 50 290 50 C 340 50 400 90 385 190 Z"
              fill={accentColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Beanie Fold Rim */}
            <rect
              x="180"
              y="165"
              width="220"
              height="45"
              rx="12"
              fill={accentColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Little Top Puff Ball */}
            <circle cx="290" cy="40" r="18" fill="#FFFFFF" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );

      case 'curly':
        return (
          <g id="head_curly">
            {/* Curly hair clusters */}
            <circle cx="210" cy="150" r="45" fill={hairColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="260" cy="100" r="50" fill={hairColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="325" cy="100" r="50" fill={hairColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="375" cy="150" r="45" fill={hairColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="190" cy="205" r="40" fill={hairColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="390" cy="205" r="40" fill={hairColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Face */}
            <ellipse
              cx="290"
              cy="230"
              rx="95"
              ry="110"
              fill={skinColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
          </g>
        );

      case 'ponytail':
        return (
          <g id="head_ponytail">
            {/* High Ponytail Tail arching behind */}
            <path
              d="M 370 120 C 460 70 480 200 450 320 C 430 330 420 310 430 260 C 440 190 410 130 360 140 Z"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Ponytail Elastic Hairband */}
            <rect x="355" y="115" width="25" height="30" rx="6" fill={accentColor} stroke={STROKE} strokeWidth="6" />

            {/* Base Face Cranium */}
            <ellipse cx="290" cy="230" rx="95" ry="110" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Hair Front Cap & Swept Bangs */}
            <path
              d="M 190 200 C 190 100 240 60 300 60 C 370 60 390 120 390 180 C 360 170 320 180 290 160 C 250 180 210 170 190 200 Z"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
          </g>
        );

      case 'bob_cut':
        return (
          <g id="head_bob_cut">
            {/* Hair Back Volume framing jaw */}
            <path
              d="M 175 220 C 160 100 220 50 290 50 C 360 50 420 100 405 220 C 415 320 370 330 370 310 C 390 220 390 140 370 110 C 340 70 240 70 210 110 C 190 140 190 220 210 310 C 210 330 165 320 175 220 Z"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Base Face */}
            <ellipse cx="290" cy="230" rx="95" ry="110" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Straight Front Bangs */}
            <path
              d="M 195 180 Q 290 195 385 180 L 385 140 Q 290 120 195 140 Z"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
          </g>
        );

      case 'slick':
      case 'expression_shock':
        return (
          <g id="head_slick">
            {/* Base Face Cranium */}
            <ellipse cx="290" cy="230" rx="95" ry="110" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Slick Parted Corporate Hair Cap */}
            <path
              d="M 185 220 C 180 110 230 65 300 65 C 380 65 400 120 395 220 C 375 190 320 180 290 190 C 240 180 200 200 185 220 Z"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Crisp Clean Side Part Line */}
            <path d="M 235 75 Q 245 130 220 170" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity="0.4" strokeLinecap="round" />
          </g>
        );

      case 'hoodie':
        return (
          <g id="head_hoodie">
            {/* Deep Hoodie Outer Shell */}
            <path
              d="M 160 270 C 140 120 200 40 290 40 C 380 40 440 120 420 270 C 400 310 380 320 290 320 C 200 320 180 310 160 270 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Inner Dark Shadow Opening */}
            <ellipse cx="290" cy="225" rx="85" ry="95" fill="#0F172A" />
            {/* Face peeking out from shadow */}
            <ellipse cx="290" cy="235" rx="72" ry="80" fill={skinColor} stroke={STROKE} strokeWidth="6" />
          </g>
        );

      case 'chanakya_shikha':
        return (
          <g id="head_chanakya_shikha">
            {/* Shikha (Sacred Braided Topknot at Crown of Head pointing back) */}
            <path
              d="M 330 140 C 370 90 410 80 420 120 C 420 150 380 160 350 160 Z"
              fill={hairColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Sacred Red Cord Tie on Knot */}
            <rect x="338" y="130" width="16" height="22" rx="5" fill="#DC2626" stroke={STROKE} strokeWidth="4" />
            {/* Shaven Monk / Acharya Cranium */}
            <ellipse
              cx="290"
              cy="225"
              rx="98"
              ry="112"
              fill={skinColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Sandalwood Chandan Tilak on Forehead */}
            <path d="M 255 170 L 325 170" stroke="#FEF08A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 255 180 L 325 180" stroke="#FEF08A" strokeWidth="6" strokeLinecap="round" />
            <circle cx="290" cy="188" r="6" fill="#DC2626" />
          </g>
        );

      case 'royal_pagdi':
        return (
          <g id="head_royal_pagdi">
            {/* Grand Saffron/Red Royal Turban Base */}
            <path
              d="M 170 210 C 140 100 200 40 290 40 C 380 40 440 100 410 210 C 380 230 200 230 170 210 Z"
              fill="#F97316"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Turban Fabric Folds (Pleats) */}
            <path d="M 180 160 Q 290 190 400 160" fill="none" stroke="#EA580C" strokeWidth="12" />
            <path d="M 195 120 Q 290 150 385 120" fill="none" stroke="#EA580C" strokeWidth="12" />
            <path d="M 220 80 Q 290 110 360 80" fill="none" stroke="#EA580C" strokeWidth="12" />
            {/* Royal Jewel Sarpech & Emerald Brooch */}
            <polygon points="280,70 290,30 300,70 290,85" fill="#FACC15" stroke={STROKE} strokeWidth="5" />
            <circle cx="290" cy="70" r="10" fill="#10B981" stroke={STROKE} strokeWidth="3" />
            {/* Plume Feather */}
            <path d="M 290 30 Q 320 -10 300 -30" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
            {/* Base Face */}
            <ellipse cx="290" cy="235" rx="92" ry="105" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );

      case 'royal_mukut':
        return (
          <g id="head_royal_mukut">
            {/* Base Face Cranium */}
            <ellipse cx="290" cy="235" rx="95" ry="105" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Grand Golden 3-Tier Mukut / Crown */}
            {/* Tier 1: Heavy Golden Brow Band with Inset Gemstones */}
            <rect x="180" y="140" width="220" height="42" rx="8" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Inset Rubies & Emeralds */}
            <circle cx="210" cy="161" r="8" fill="#DC2626" stroke={STROKE} strokeWidth="3" />
            <circle cx="250" cy="161" r="8" fill="#10B981" stroke={STROKE} strokeWidth="3" />
            <circle cx="290" cy="161" r="10" fill="#DC2626" stroke={STROKE} strokeWidth="3" />
            <circle cx="330" cy="161" r="8" fill="#10B981" stroke={STROKE} strokeWidth="3" />
            <circle cx="370" cy="161" r="8" fill="#DC2626" stroke={STROKE} strokeWidth="3" />

            {/* Tier 2: Arched Royal Finial Body */}
            <polygon points="195,140 290,50 385,140" fill="#FACC15" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Tier 3: Sharp Golden Kalash Finial Peak */}
            <polygon points="275,50 290,10 305,50" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Giant Central Royal Ruby Shield Emblem */}
            <polygon points="290,65 310,95 290,125 270,95" fill="#EF4444" stroke={STROKE} strokeWidth="6" />
            <circle cx="290" cy="95" r="7" fill="#FEF08A" />

            {/* Dazzling Side Kundals (Earrings) Hanging beside jaw */}
            <circle cx="180" cy="245" r="14" fill="#F59E0B" stroke={STROKE} strokeWidth="6" />
            <polygon points="180,259 170,285 190,285" fill="#DC2626" stroke={STROKE} strokeWidth="4" />
            <circle cx="400" cy="245" r="14" fill="#F59E0B" stroke={STROKE} strokeWidth="6" />
            <polygon points="400,259 390,285 410,285" fill="#DC2626" stroke={STROKE} strokeWidth="4" />
          </g>
        );

      case 'shakuni_cowl':
        return (
          <g id="head_shakuni_cowl">
            {/* Dark Hooded Silk Cowl outer shell draping over shoulders */}
            <path
              d="M 160 290 C 140 120 190 30 290 30 C 390 30 440 120 420 290 C 400 340 370 350 290 350 C 210 350 180 340 160 290 Z"
              fill="#292524"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Deep Shadowed Hood Cavity */}
            <ellipse cx="290" cy="225" rx="88" ry="102" fill="#1C1917" />
            {/* Base Face peeking from within darkness */}
            <ellipse cx="290" cy="235" rx="80" ry="92" fill={skinColor} stroke={STROKE} strokeWidth="6" />
            {/* Cowl Silk Crease Lines */}
            <path d="M 185 170 Q 290 135 395 170" fill="none" stroke="#44403C" strokeWidth="10" strokeLinecap="round" />
            <path d="M 175 230 Q 215 270 230 320" fill="none" stroke="#44403C" strokeWidth="8" strokeLinecap="round" />
            <path d="M 405 230 Q 365 270 350 320" fill="none" stroke="#44403C" strokeWidth="8" strokeLinecap="round" />
          </g>
        );

      case 'mor_pankh_mukut':
        return (
          <g id="head_mor_pankh_mukut">
            {/* Base Face Cranium */}
            <ellipse cx="290" cy="235" rx="95" ry="105" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Radiant Golden Crown Band with Gems */}
            <rect x="180" y="145" width="220" height="38" rx="8" fill="#FACC15" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="210" cy="164" r="7" fill="#DC2626" />
            <circle cx="250" cy="164" r="7" fill="#10B981" />
            <circle cx="290" cy="164" r="9" fill="#DC2626" />
            <circle cx="330" cy="164" r="7" fill="#10B981" />
            <circle cx="370" cy="164" r="7" fill="#DC2626" />

            {/* Sacred Peacock Feather (Mor-Pankh) standing proudly on left crown */}
            <path d="M 230 145 Q 210 70 190 20" stroke="#047857" strokeWidth="8" fill="none" strokeLinecap="round" />
            {/* Outer Emerald Eye */}
            <ellipse cx="190" cy="20" rx="36" ry="48" fill="#047857" stroke={STROKE} strokeWidth="5" transform="rotate(-20 190 20)" />
            {/* Royal Azure Ring */}
            <ellipse cx="190" cy="20" rx="24" ry="32" fill="#2563EB" stroke="#000000" strokeWidth="3" transform="rotate(-20 190 20)" />
            {/* Radiant Golden Ring */}
            <ellipse cx="190" cy="20" rx="14" ry="18" fill="#FACC15" transform="rotate(-20 190 20)" />
            {/* Deep Core Pupil */}
            <ellipse cx="190" cy="20" rx="7" ry="9" fill="#0F172A" transform="rotate(-20 190 20)" />

            {/* Chandan & Kumkum Urdhva Pundra Tilak on Forehead */}
            <path d="M 278 160 L 290 195 L 302 160" stroke="#FEF08A" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="290" cy="180" r="5" fill="#DC2626" />
          </g>
        );

      case 'maratha_jiratop':
        return (
          <g id="head_maratha_jiratop">
            {/* Base Face Cranium */}
            <ellipse cx="290" cy="235" rx="95" ry="105" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Grand Maratha Royal Crimson Pagadi (Jiratop Base) */}
            <path
              d="M 160 220 C 130 130 190 55 290 55 C 370 55 430 110 410 210 C 380 230 200 230 160 220 Z"
              fill="#DC2626"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Forward-leaning Angled Peak of Jiratop */}
            <polygon points="260,58 290,10 320,58" fill="#B91C1C" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Royal Pearl Strand Brooch */}
            <path d="M 180 145 Q 290 185 400 145" fill="none" stroke="#FDE047" strokeWidth="8" strokeDasharray="12 6" />
            <circle cx="290" cy="65" r="14" fill="#FACC15" stroke={STROKE} strokeWidth="4" />
            <circle cx="290" cy="65" r="7" fill="#10B981" />

            {/* Saffron Plume (Kalgi) */}
            <path d="M 290 50 Q 315 0 300 -25" stroke="#F97316" strokeWidth="10" fill="none" strokeLinecap="round" />

            {/* Maratha Crescent Moon (Chandrakor) Tilak */}
            <path d="M 276 172 A 14 14 0 0 0 304 172" fill="none" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
          </g>
        );

      case 'sage_rishi_bun':
        return (
          <g id="head_sage_rishi_bun">
            {/* Base Face Cranium */}
            <ellipse cx="290" cy="235" rx="95" ry="105" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Topknot Hair Bun (Jata) */}
            <circle cx="290" cy="95" r="48" fill={hairColor || '#F8FAFC'} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Rudraksha Mala Ring binding the hair bun */}
            <circle cx="290" cy="95" r="28" fill="#78350F" stroke={STROKE} strokeWidth="4" strokeDasharray="8 6" />

            {/* Sacred Tripundra Tilak on Forehead (3 White Ash Lines + Red Bindi) */}
            <line x1="250" y1="166" x2="330" y2="166" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <line x1="250" y1="174" x2="330" y2="174" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <line x1="250" y1="182" x2="330" y2="182" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <circle cx="290" cy="174" r="5" fill="#DC2626" />
          </g>
        );

      case 'uncle_comb_over':
        return (
          <g id="head_uncle_comb_over">
            {/* Base Face Cranium */}
            <ellipse cx="290" cy="230" rx="96" ry="110" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Salt-and-Pepper Comb-Over Hair Cap */}
            <path
              d="M 185 220 C 180 90 260 70 340 85 C 385 95 395 140 390 220"
              fill="none"
              stroke={hairColor || '#475569'}
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Grey Comb-Over Strands */}
            <path d="M 205 125 Q 290 100 375 135" fill="none" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <path d="M 215 150 Q 290 120 375 160" fill="none" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
          </g>
        );

      case 'boss_bald_fringe':
        return (
          <g id="head_boss_bald_fringe">
            {/* Bald Cranium with shiny highlight */}
            <ellipse cx="290" cy="225" rx="98" ry="112" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <path d="M 255 145 Q 290 130 325 145" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity="0.6" strokeLinecap="round" />
            {/* Fringe hair only on sides */}
            <path d="M 185 200 Q 180 260 200 280" fill="none" stroke={hairColor || '#334155'} strokeWidth="18" strokeLinecap="round" />
            <path d="M 395 200 Q 400 260 380 280" fill="none" stroke={hairColor || '#334155'} strokeWidth="18" strokeLinecap="round" />
          </g>
        );

      case 'bald':
      default:
        return (
          <g id="head_bald">
            <ellipse
              cx="290"
              cy="220"
              rx="100"
              ry="115"
              fill={skinColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Subtle Comic Cranium Highlight */}
            <path
              d="M 230 140 Q 270 125 310 135"
              stroke="#FFFFFF"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
    }
  };

  // Render Face Expressions
  const renderFace = () => {
    switch (face) {
      case 'shock_alarm':
      case 'panic':
      case 'scream':
        return (
          <g id="face_shock_alarm">
            {/* Trembling Zig-zag Eyebrows */}
            <path d="M 220 180 L 245 165 L 265 175" stroke={STROKE} strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M 315 175 L 335 165 L 360 180" stroke={STROKE} strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Bulging Wide Eyes */}
            {isBlinkFrame ? (
              <>
                <line x1="225" y1="215" x2="265" y2="215" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
                <line x1="315" y1="215" x2="355" y2="215" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="245" cy="215" r="32" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
                <circle cx="245" cy="215" r="7" fill="#000000" />
                <circle cx="335" cy="215" r="32" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
                <circle cx="335" cy="215" r="7" fill="#000000" />
              </>
            )}

            {/* Screaming Dropped Jaw Mouth */}
            <ellipse cx="290" cy="295" rx="30" ry="40" fill="#000000" stroke={STROKE} strokeWidth="8" />
            <path d="M 270 280 Q 290 288 310 280" fill="#FFFFFF" />
            <ellipse cx="290" cy="320" rx="18" ry="12" fill="#F43F5E" />
          </g>
        );

      case 'dead_inside':
      case 'bored':
        return (
          <g id="face_dead_inside">
            {/* Massive Dark Under-Eye Bags */}
            <path d="M 220 235 Q 245 255 268 238" stroke="#94A3B8" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M 312 238 Q 335 255 360 235" stroke="#94A3B8" strokeWidth="9" strokeLinecap="round" fill="none" />

            {/* Half-Lidded Eyes */}
            {isBlinkFrame ? (
              <>
                <line x1="225" y1="215" x2="265" y2="215" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
                <line x1="315" y1="215" x2="355" y2="215" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Sclera */}
                <circle cx="245" cy="215" r="24" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
                <circle cx="245" cy="222" r="10" fill="#0F172A" />
                {/* Heavy Drooping Eyelid */}
                <path d="M 221 210 Q 245 220 269 210 L 269 190 L 221 190 Z" fill={skinColor} stroke={STROKE} strokeWidth="7" />

                <circle cx="335" cy="215" r="24" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
                <circle cx="335" cy="222" r="10" fill="#0F172A" />
                <path d="M 311 210 Q 335 220 359 210 L 359 190 L 311 190 Z" fill={skinColor} stroke={STROKE} strokeWidth="7" />
              </>
            )}

            {/* Dynamic Viseme Speaking Mouth Flap */}
            {isSpeakingFrame ? (
              <g id="viseme_speaking_mouth">
                <ellipse cx="290" cy="292" rx="16" ry="13" fill="#0F172A" stroke={STROKE} strokeWidth="6" />
                <path d="M 276 287 Q 290 293 304 287" fill="#FFFFFF" />
                <ellipse cx="290" cy="298" rx="10" ry="6" fill="#F43F5E" />
              </g>
            ) : (
              <line x1="260" y1="290" x2="320" y2="290" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
            )}
          </g>
        );

      case 'divine_calm':
        return (
          <g id="face_divine_calm">
            {/* Gentle Benevolent Eye Arcs */}
            <path d="M 225 215 Q 245 228 265 215" stroke={STROKE} strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="245" cy="217" r="6" fill="#0F172A" />
            <path d="M 315 215 Q 335 228 355 215" stroke={STROKE} strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="335" cy="217" r="6" fill="#0F172A" />

            {/* Rosy Cheeks */}
            <ellipse cx="225" cy="235" rx="14" ry="8" fill="#F472B6" opacity="0.4" />
            <ellipse cx="355" cy="235" rx="14" ry="8" fill="#F472B6" opacity="0.4" />

            {/* Soft Divine Smile */}
            <path d="M 270 285 Q 290 305 310 285" stroke={STROKE} strokeWidth="7" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'warrior_focus':
        return (
          <g id="face_warrior_focus">
            {/* Sharp Piercing Eyebrows */}
            <line x1="220" y1="185" x2="270" y2="195" stroke={STROKE} strokeWidth="9" strokeLinecap="round" />
            <line x1="360" y1="185" x2="310" y2="195" stroke={STROKE} strokeWidth="9" strokeLinecap="round" />
            {/* Focused Archer Eyes */}
            <circle cx="245" cy="215" r="22" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
            <circle cx="248" cy="215" r="9" fill="#0F172A" />
            <circle cx="335" cy="215" r="22" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
            <circle cx="332" cy="215" r="9" fill="#0F172A" />
            {/* Determined Firm Mouth */}
            <line x1="265" y1="290" x2="315" y2="290" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
          </g>
        );

      case 'dazed_asymmetric':
        return (
          <g id="face_dazed_asymmetric">
            {/* Asymmetrical Pupils & Stare */}
            <circle cx="240" cy="210" r="30" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
            <circle cx="240" cy="212" r="12" fill="#000000" />

            <circle cx="335" cy="220" r="18" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
            <circle cx="335" cy="220" r="6" fill="#000000" />

            {/* Crooked Wavy Mouth with Tongue */}
            <path d="M 260 290 Q 285 280 300 295 Q 315 310 325 295" stroke={STROKE} strokeWidth="8" strokeLinecap="round" fill="none" />
            <ellipse cx="295" cy="298" rx="8" ry="10" fill="#F43F5E" stroke={STROKE} strokeWidth="5" />
          </g>
        );

      case 'floating_ghost':
        return (
          <g id="face_floating_ghost">
            {/* Glowing Ethereal Teal Hollow Eyes */}
            <ellipse cx="245" cy="215" rx="22" ry="28" fill="#14B8A6" stroke={STROKE} strokeWidth="7" />
            <circle cx="245" cy="215" r="7" fill="#CCFBF1" />

            <ellipse cx="335" cy="215" rx="22" ry="28" fill="#14B8A6" stroke={STROKE} strokeWidth="7" />
            <circle cx="335" cy="215" r="7" fill="#CCFBF1" />

            {/* Bewildered O-shaped Mouth */}
            <ellipse cx="290" cy="290" rx="16" ry="24" fill="#0F766E" stroke={STROKE} strokeWidth="7" />
          </g>
        );

      case 'keyboard_slump':
        return (
          <g id="face_keyboard_slump">
            {/* X_X Defeated Eyes */}
            <path d="M 230 205 L 255 230 M 255 205 L 230 230" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
            <path d="M 325 205 L 350 230 M 350 205 L 325 230" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />

            {/* Flattened Squashed Mouth */}
            <ellipse cx="290" cy="290" rx="40" ry="10" fill="#991B1B" stroke={STROKE} strokeWidth="7" />
          </g>
        );

      case 'bliss_dreaming':
      case 'happy':
      case 'calm':
      case 'smile':
        return (
          <g id="face_bliss_dreaming">
            {/* Happy Curved Closed Eye Arcs */}
            <path d="M 225 215 Q 245 200 265 215" stroke={STROKE} strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M 315 215 Q 335 200 355 215" stroke={STROKE} strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Rosy Cheeks */}
            <ellipse cx="220" cy="235" rx="16" ry="10" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="360" cy="235" rx="16" ry="10" fill="#FDA4AF" opacity="0.8" />

            {/* Gentle Smile */}
            <path d="M 265 285 Q 290 310 315 285" stroke={STROKE} strokeWidth="8" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'dread_loop':
      case 'anxious':
      case 'sweat':
      default:
        return (
          <g id="face_dread_loop">
            {/* Downward Looking Stare */}
            <circle cx="245" cy="215" r="22" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
            <circle cx="245" cy="225" r="8" fill="#000000" />

            <circle cx="335" cy="215" r="22" fill="#FFFFFF" stroke={STROKE} strokeWidth="7" />
            <circle cx="335" cy="225" r="8" fill="#000000" />

            {/* Nervous Sweat Droplet on Temple */}
            <path
              d="M 375 185 Q 385 170 380 200 Q 370 200 375 185 Z"
              fill="#38BDF8"
              stroke={STROKE}
              strokeWidth="5"
            />

            {/* Trembling Wavy Mouth */}
            <path d="M 265 290 Q 278 285 290 295 Q 302 285 315 290" stroke={STROKE} strokeWidth="8" strokeLinecap="round" fill="none" />
          </g>
        );
    }
  };

  // Render Body & Pose Geometry
  const renderPose = () => {
    switch (pose) {
      case 'duvet_cocoon':
        return (
          <g id="pose_duvet_cocoon">
            {/* Massive Quilted Duvet Cocoon wrapped around torso */}
            <path
              d="M 160 300 C 120 420 120 620 160 720 C 220 760 360 760 420 720 C 460 620 460 420 420 300 Z"
              fill="#E2E8F0"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Stitched Quilt Grid Lines */}
            <path d="M 160 400 L 420 400" stroke="#CBD5E1" strokeWidth="6" strokeDasharray="16 10" />
            <path d="M 140 510 L 440 510" stroke="#CBD5E1" strokeWidth="6" strokeDasharray="16 10" />
            <path d="M 150 620 L 430 620" stroke="#CBD5E1" strokeWidth="6" strokeDasharray="16 10" />
            <path d="M 290 320 L 290 730" stroke="#CBD5E1" strokeWidth="6" strokeDasharray="16 10" />

            {/* Comic Heavy Padlock Badge on Chest */}
            <rect x="260" y="460" width="60" height="50" rx="8" fill="#F59E0B" stroke={STROKE} strokeWidth="7" />
            <path d="M 275 460 C 275 435 305 435 305 460" fill="none" stroke={STROKE} strokeWidth="7" />
          </g>
        );

      case 'recoil_bed':
        return (
          <g id="pose_recoil_bed">
            {/* Recoiled Torso */}
            <path
              d="M 200 330 L 170 580 L 390 590 L 375 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Left Arm Thrown Up in Defense */}
            <path
              d="M 200 350 L 120 280 L 100 200"
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 200 350 L 120 280 L 100 200"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            {/* Right Arm Thrown Up */}
            <path
              d="M 375 350 L 450 280 L 470 200"
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 375 350 L 450 280 L 470 200"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
          </g>
        );

      case 'floating_ghost':
        return (
          <g id="pose_floating_ghost" opacity="0.85">
            {/* Ghostly Flowing Gown with Wispy Hem */}
            <path
              d="M 200 320 C 160 450 140 600 170 700 Q 210 670 250 710 Q 290 670 330 710 Q 370 670 410 700 C 440 600 420 450 380 320 Z"
              fill="#5EEAD4"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Spectral Arm Stems */}
            <path
              d="M 200 350 Q 130 400 120 480"
              fill="none"
              stroke="#5EEAD4"
              strokeWidth="35"
              strokeLinecap="round"
            />
            <path
              d="M 200 350 Q 130 400 120 480"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />

            <path
              d="M 380 350 Q 450 400 460 480"
              fill="none"
              stroke="#5EEAD4"
              strokeWidth="35"
              strokeLinecap="round"
            />
            <path
              d="M 380 350 Q 450 400 460 480"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
          </g>
        );

      case 'slouched_chair':
        return (
          <g id="pose_slouched_chair">
            {/* Wooden Chair backrest */}
            <rect x="140" y="380" width="30" height="320" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="150" y="580" width="220" height="30" rx="6" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Deep C-Curve Slumped Torso */}
            <path
              d="M 250 340 C 180 430 180 560 250 590 L 370 590 C 340 480 320 400 290 340 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Limp Hanging Arms like Noodles */}
            <path
              d="M 280 400 Q 300 520 310 650"
              fill="none"
              stroke={clothColor}
              strokeWidth="35"
              strokeLinecap="round"
            />
            <path
              d="M 280 400 Q 300 520 310 650"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
          </g>
        );

      case 'desk_typing':
        return (
          <g id="pose_desk_typing">
            {/* Torso Seated */}
            <path
              d="M 200 330 L 180 570 L 390 570 L 375 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Arms Resting on Desk typing */}
            <path
              d="M 200 380 L 160 480 L 260 520"
              fill="none"
              stroke={clothColor}
              strokeWidth="40"
              strokeLinecap="round"
            />
            <path
              d="M 200 380 L 160 480 L 260 520"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            {/* Desk Surface Horizon */}
            <rect x="50" y="520" width="500" height="30" rx="6" fill="#334155" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );

      case 'keyboard_panic':
        return (
          <g id="pose_keyboard_panic">
            {/* Torso Seated */}
            <path
              d="M 200 330 L 180 570 L 390 570 L 375 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Left Arm raised to head in panic */}
            <path d="M 200 380 L 140 290 L 210 230" fill="none" stroke={clothColor} strokeWidth="42" strokeLinecap="round" />
            <path d="M 200 380 L 140 290 L 210 230" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            {/* Right Arm raised to head in panic */}
            <path d="M 375 380 L 435 290 L 365 230" fill="none" stroke={clothColor} strokeWidth="42" strokeLinecap="round" />
            <path d="M 375 380 L 435 290 L 365 230" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            {/* Desk Surface Horizon */}
            <rect x="50" y="520" width="500" height="30" rx="6" fill="#334155" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );

      case 'desk_sit_relaxed':
        return (
          <g id="pose_desk_sit_relaxed">
            {/* Office Chair Backrest */}
            <rect x="150" y="260" width="280" height="300" rx="40" fill="#1E293B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Torso Relaxed back */}
            <path
              d="M 200 330 L 190 560 L 380 560 L 370 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Left Arm resting casually */}
            <path d="M 200 370 L 160 480 L 220 510" fill="none" stroke={clothColor} strokeWidth="40" strokeLinecap="round" />
            <path d="M 200 370 L 160 480 L 220 510" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            {/* Right Arm giving thumbs up or resting */}
            <path d="M 370 370 L 410 460 L 360 490" fill="none" stroke={clothColor} strokeWidth="40" strokeLinecap="round" />
            <path d="M 370 370 L 410 460 L 360 490" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            {/* Desk Surface Horizon */}
            <rect x="50" y="520" width="500" height="30" rx="6" fill="#334155" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );

      case 'slouched_flat':
        return (
          <g id="pose_slouched_flat">
            {/* Deflated Torso flattened against desk */}
            <ellipse cx="290" cy="510" rx="160" ry="45" fill={clothColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Limp Arms spread out flat */}
            <path d="M 130 515 L 70 515" stroke={clothColor} strokeWidth="36" strokeLinecap="round" />
            <path d="M 130 515 L 70 515" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <path d="M 450 515 L 510 515" stroke={clothColor} strokeWidth="36" strokeLinecap="round" />
            <path d="M 450 515 L 510 515" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            {/* Desk Surface */}
            <rect x="50" y="520" width="500" height="30" rx="6" fill="#334155" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );

      case 'chanakya_pointing':
        return (
          <g id="pose_chanakya_pointing">
            {/* Acharya Angavastra & Dhoti Robe */}
            <path
              d="M 195 330 Q 180 460 185 600 L 395 600 Q 400 460 385 330 Z"
              fill="#EA580C"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Golden Saffron Sash (Uttariya) Drape */}
            <path
              d="M 195 330 Q 290 440 395 560 L 375 600 Q 275 480 185 350 Z"
              fill="#FDE047"
              stroke={STROKE}
              strokeWidth="6"
            />
            {/* Left Arm holding rolled manuscript */}
            <path
              d="M 200 350 L 140 430 L 190 470"
              fill="none"
              stroke="#EA580C"
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 200 350 L 140 430 L 190 470"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            {/* Rolled Manuscript in Left Hand */}
            <rect x="160" y="440" width="80" height="30" rx="12" fill="#FEF08A" stroke={STROKE} strokeWidth="6" transform="rotate(-15 200 455)" />
            {/* Right Arm Raised - Index Finger Pointing with Authority */}
            <path
              d="M 380 350 L 450 340 L 460 230"
              fill="none"
              stroke="#EA580C"
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 380 350 L 450 340 L 460 230"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            {/* Raised Hand & Pointing Finger */}
            <circle cx="460" cy="225" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <line x1="460" y1="225" x2="460" y2="160" stroke={skinColor} strokeWidth="18" strokeLinecap="round" />
            <line x1="460" y1="225" x2="460" y2="160" stroke={STROKE} strokeWidth="8" strokeLinecap="round" />
            {/* Acharya Legs connecting Dhoti Hem to Padukas */}
            <line x1="242" y1="595" x2="242" y2="665" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="242" y1="595" x2="242" y2="665" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="337" y1="595" x2="337" y2="665" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="337" y1="595" x2="337" y2="665" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            {/* Traditional Wooden Paduka Sandals */}
            <rect x="210" y="660" width="65" height="35" rx="14" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="305" y="660" width="65" height="35" rx="14" fill="#92400E" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );

      case 'shock_hands_on_head':
        return (
          <g id="pose_shock_hands_on_head">
            {/* Torso */}
            <path
              d={`M 200 330 Q 185 450 190 ${580 + breathOffset} L 390 ${580 + breathOffset} Q 390 450 375 330 Z`}
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Left Arm reaching up to head */}
            <path
              d="M 200 350 L 125 260 L 195 200"
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 200 350 L 125 260 L 195 200"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            <circle cx="195" cy="200" r="24" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Right Arm reaching up to head */}
            <path
              d="M 375 350 L 450 260 L 380 200"
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 375 350 L 450 260 L 380 200"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            <circle cx="380" cy="200" r="24" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Panic Sweat Drops flying off */}
            <circle cx="120" cy="180" r="12" fill="#38BDF8" stroke={STROKE} strokeWidth="4" />
            <circle cx="455" cy="180" r="12" fill="#38BDF8" stroke={STROKE} strokeWidth="4" />
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Legs with Padukas - Two-pass rendering ensures visibility against dark floors */}
            <line x1="240" y1="580" x2="235" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="240" y1="580" x2="235" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="340" y1="580" x2="345" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="340" y1="580" x2="345" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="200" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="220" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <rect x="310" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="330" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
          </g>
        );

      case 'wealth_proud_chest':
        return (
          <g id="pose_wealth_proud">
            {/* Puffed Upright Torso */}
            <path
              d="M 185 330 Q 165 440 185 580 L 395 580 Q 415 440 395 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Golden Pearl Necklace / Royal Mala */}
            <path d="M 220 330 Q 290 420 360 330" fill="none" stroke="#FACC15" strokeWidth="12" strokeLinecap="round" strokeDasharray="14 8" />
            {/* Left Arm Flared on Hip */}
            <path
              d="M 190 350 L 110 430 L 195 460"
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 190 350 L 110 430 L 195 460"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            <circle cx="195" cy="460" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Right Arm Flared on Hip */}
            <path
              d="M 390 350 L 470 430 L 385 460"
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d="M 390 350 L 470 430 L 385 460"
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            <circle cx="385" cy="460" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Solid Grounded Legs with Padukas - Two-pass visible contrast */}
            <line x1="235" y1="580" x2="235" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="235" y1="580" x2="235" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="345" y1="580" x2="345" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="345" y1="580" x2="345" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="200" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="220" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <rect x="310" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="330" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
          </g>
        );

      // =========================================================================
      // 14. WHISPERING SLY (SHAKUNI CONSPIRATOR LEAN)
      // =========================================================================
      case 'whispering_sly':
        return (
          <g id="pose_whispering_sly">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Leaning Torso */}
            <path
              d="M 190 330 Q 160 450 170 590 L 380 590 Q 380 450 360 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Left Arm shielding mouth (Conspiratorial whisper) */}
            <path d="M 210 360 L 260 430 L 320 280" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 210 360 L 260 430 L 320 280" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="320" cy="275" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Right Arm behind back */}
            <path d="M 360 360 L 410 460 L 370 520" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 360 360 L 410 460 L 370 520" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />

            {/* Grounded Legs with Padukas - Two-pass visible contrast */}
            <line x1="220" y1="590" x2="220" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="220" y1="590" x2="220" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="330" y1="590" x2="330" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="330" y1="590" x2="330" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="185" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="205" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <rect x="295" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="315" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
          </g>
        );

      // =========================================================================
      // 15. ROLLING DICE (THROWING CHAUPAR PASHAS)
      // =========================================================================
      case 'rolling_dice':
        return (
          <g id="pose_rolling_dice">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="150" ry="20" fill="#000000" opacity="0.4" />
            {/* Dynamic Angled Torso */}
            <path
              d="M 180 340 L 150 590 L 360 590 L 370 340 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Royal Gold Stole / Angavastram */}
            <path d="M 200 340 L 170 590" stroke="#FACC15" strokeWidth="16" strokeLinecap="round" />

            {/* Outstretched Throwing Arm */}
            <path d="M 370 370 L 480 430 L 530 480" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 370 370 L 480 430 L 530 480" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="530" cy="480" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Left Arm balanced back */}
            <path d="M 180 370 L 110 440" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 180 370 L 110 440" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="110" cy="440" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Grounded Legs with Padukas - Two-pass visible contrast */}
            <line x1="200" y1="590" x2="190" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="200" y1="590" x2="190" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="320" y1="590" x2="330" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="320" y1="590" x2="330" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="155" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="175" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <rect x="295" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="315" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
          </g>
        );

      // =========================================================================
      // 16. PUPPETEER STRINGS (MANIPULATOR HOLDING CONTROLS - KINEMATIC SWEEP)
      // =========================================================================
      case 'puppeteer_strings': {
        const p = armProgress !== undefined ? Math.max(0, Math.min(1, armProgress)) : 1.0;
        const tug = handTug || 0;

        // Dynamic Left Arm Lift (Relaxed at side (150,440)->(160,520) up to overhead (130,260)->(180,200))
        const elbowLX = Math.round(150 + (130 - 150) * p);
        const elbowLY = Math.round(440 + (260 - 440) * p);
        const handLX = Math.round(160 + (180 - 160) * p + tug * 0.4);
        const handLY = Math.round(520 + (200 - 520) * p - Math.abs(tug) * 0.5);

        // Dynamic Right Arm Lift (Relaxed at side (430,440)->(420,520) up to overhead (450,260)->(400,200))
        const elbowRX = Math.round(430 + (450 - 430) * p);
        const elbowRY = Math.round(440 + (260 - 440) * p);
        const handRX = Math.round(420 + (400 - 420) * p - tug * 0.4);
        const handRY = Math.round(520 + (200 - 520) * p - Math.abs(tug) * 0.5);

        return (
          <g id="pose_puppeteer_strings">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Upright Imposing Torso */}
            <path
              d="M 185 330 Q 165 440 185 590 L 395 590 Q 415 440 395 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Both Arms Raised High with Strings Hanging Down */}
            {/* Left Arm */}
            <path d={`M 190 350 L ${elbowLX} ${elbowLY} L ${handLX} ${handLY}`} fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d={`M 190 350 L ${elbowLX} ${elbowLY} L ${handLX} ${handLY}`} fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx={handLX} cy={handLY} r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Left Strings dropping from hand */}
            <line x1={handLX} y1={handLY} x2={handLX - 20} y2={handLY + 280 * p} stroke="#EF4444" strokeWidth="4" strokeDasharray="8 4" opacity={p} />
            <line x1={handLX} y1={handLY} x2={handLX + 40} y2={handLY + 280 * p} stroke="#F59E0B" strokeWidth="4" strokeDasharray="8 4" opacity={p} />

            {/* Right Arm */}
            <path d={`M 390 350 L ${elbowRX} ${elbowRY} L ${handRX} ${handRY}`} fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d={`M 390 350 L ${elbowRX} ${elbowRY} L ${handRX} ${handRY}`} fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx={handRX} cy={handRY} r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Right Strings dropping from hand */}
            <line x1={handRX} y1={handRY} x2={handRX - 40} y2={handRY + 280 * p} stroke="#F59E0B" strokeWidth="4" strokeDasharray="8 4" opacity={p} />
            <line x1={handRX} y1={handRY} x2={handRX + 20} y2={handRY + 280 * p} stroke="#EF4444" strokeWidth="4" strokeDasharray="8 4" opacity={p} />

            {/* Grounded Legs with Padukas - Two-pass visible contrast */}
            <line x1="230" y1="590" x2="230" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="230" y1="590" x2="230" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="195" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="215" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
            <rect x="315" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <circle cx="335" cy="672" r="7" fill="#FDE047" stroke={STROKE} strokeWidth="4" />
          </g>
        );
      }

      // =========================================================================
      // 17. SPINNIG CHAKRA (KRISHNA CELESTIAL POSE)
      // =========================================================================
      case 'spinning_chakra': {
        const chakraRot = frame * 18;
        return (
          <g id="pose_spinning_chakra">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Elegant Tribhanga/Upright Royal Torso */}
            <path
              d="M 190 330 Q 170 450 185 590 L 395 590 Q 410 450 390 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Royal Gold Angavastram Stole */}
            <path d="M 200 330 Q 290 480 380 330" fill="none" stroke="#F59E0B" strokeWidth="16" strokeLinecap="round" />

            {/* Left Arm relaxed or blessing */}
            <path d="M 190 350 L 130 440 L 180 470" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 190 350 L 130 440 L 180 470" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="180" cy="470" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Right Arm Raised - Index Finger Pointing Upwards Holding Chakra */}
            <path d="M 390 350 L 460 320 L 470 210" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 390 350 L 460 320 L 470 210" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="470" cy="205" r="20" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <line x1="470" y1="205" x2="470" y2="140" stroke={skinColor} strokeWidth="16" strokeLinecap="round" />
            <line x1="470" y1="205" x2="470" y2="140" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />

            {/* Spinning Sudarshan Chakra on Fingertip (X=470, Y=135) */}
            <g transform={`translate(470, 135) rotate(${chakraRot})`}>
              {/* Outer Golden Aura Glow */}
              <circle cx="0" cy="0" r="65" fill="#FACC15" opacity="0.3" />
              {/* 108 Fiery Serrated Razor Blades */}
              <circle cx="0" cy="0" r="45" fill="#F59E0B" stroke={STROKE} strokeWidth="5" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <polygon
                  key={deg}
                  points="0,-52 -8,-40 8,-40"
                  fill="#FEF08A"
                  stroke={STROKE}
                  strokeWidth="3"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="22" fill="#DC2626" stroke={STROKE} strokeWidth="4" />
              <circle cx="0" cy="0" r="10" fill="#FEF08A" />
            </g>

            {/* Padukas */}
            <line x1="230" y1="590" x2="230" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="230" y1="590" x2="230" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="195" y="680" width="70" height="24" rx="8" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="315" y="680" width="70" height="24" rx="8" fill="#F59E0B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
      }

      // =========================================================================
      // 18. DRAWING BOW (ARJUNA GANDIVA ARCHER POSE)
      // =========================================================================
      case 'drawing_bow': {
        return (
          <g id="pose_drawing_bow">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="150" ry="20" fill="#000000" opacity="0.4" />
            {/* Dynamic Angled Warrior Torso */}
            <path
              d="M 180 330 L 160 590 L 380 590 L 390 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Golden Warrior Kavach Plate */}
            <polygon points="230,350 350,350 330,500 250,500" fill="#F59E0B" stroke={STROKE} strokeWidth="6" />

            {/* Left Arm extended forward gripping Gandiva Bow */}
            <path d="M 190 360 L 110 370 L 60 380" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 190 360 L 110 370 L 60 380" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="60" cy="380" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Gandiva Divine Golden Bow held in Left Hand */}
            <path d="M 60 170 Q 20 380 60 590" fill="none" stroke="#F59E0B" strokeWidth="18" strokeLinecap="round" />
            <path d="M 60 170 Q 20 380 60 590" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            {/* Glowing Taut Bowstring drawn back to cheek */}
            <line x1="60" y1="170" x2="310" y2="350" stroke="#FEF08A" strokeWidth="5" />
            <line x1="60" y1="590" x2="310" y2="350" stroke="#FEF08A" strokeWidth="5" />

            {/* Right Arm pulled back to cheek drawing arrow */}
            <path d="M 390 360 L 450 320 L 310 350" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 390 360 L 450 320 L 310 350" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="310" cy="350" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Glowing Golden Arrow */}
            <line x1="50" y1="365" x2="320" y2="365" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" />
            <polygon points="40,365 60,355 60,375" fill="#EF4444" stroke={STROKE} strokeWidth="4" />

            {/* Warrior Stance Legs */}
            <line x1="200" y1="590" x2="170" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="200" y1="590" x2="170" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="340" y1="590" x2="370" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="340" y1="590" x2="370" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="135" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="335" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
      }

      // =========================================================================
      // 19. UNSHEATHING TALWAR (SHIVAJI MAHARAJ ROYAL WARRIOR POSE)
      // =========================================================================
      case 'unsheathing_talwar': {
        return (
          <g id="pose_unsheathing_talwar">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Proud Royal Maratha Angarkha Torso */}
            <path
              d="M 185 330 Q 165 440 185 590 L 395 590 Q 415 440 395 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Golden Pearl Mala across chest */}
            <path d="M 210 340 Q 290 450 370 340" fill="none" stroke="#FEF08A" strokeWidth="12" strokeDasharray="14 6" />

            {/* Left Arm holding Royal Scabbard on Hip */}
            <path d="M 190 360 L 140 440 L 210 460" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 190 360 L 140 440 L 210 460" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="210" cy="460" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Crimson Velvet Sword Scabbard on Waist */}
            <rect x="180" y="440" width="40" height="180" rx="10" fill="#991B1B" stroke={STROKE} strokeWidth="7" transform="rotate(25 200 450)" />

            {/* Right Arm gripping the Bhavani Talwar Hilt drawing it forth */}
            <path d="M 390 360 L 460 410 L 350 440" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 390 360 L 460 410 L 350 440" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="350" cy="440" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Golden Curved Bhavani Talwar Blade Gleaming */}
            <path d="M 350 435 Q 460 380 520 280" fill="none" stroke="#E2E8F0" strokeWidth="16" strokeLinecap="round" />
            <path d="M 350 435 Q 460 380 520 280" fill="none" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            {/* Golden Hilt Disc */}
            <circle cx="350" cy="435" r="16" fill="#FACC15" stroke={STROKE} strokeWidth="5" />

            {/* Royal Padukas */}
            <line x1="230" y1="590" x2="230" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="230" y1="590" x2="230" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={skinColor} strokeWidth="24" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="195" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="315" y="680" width="70" height="24" rx="8" fill="#78350F" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
      }

      // =========================================================================
      // 20. SIPPING CHAI (MIDDLE CLASS UNCLE POSE)
      // =========================================================================
      case 'sipping_chai': {
        return (
          <g id="pose_sipping_chai">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Torso in Sweater Vest over Collared Shirt */}
            <path
              d="M 190 330 Q 170 440 185 590 L 395 590 Q 415 440 395 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* White Shirt Collar Peeking Out */}
            <polygon points="260,330 290,370 320,330" fill="#FFFFFF" stroke={STROKE} strokeWidth="5" />

            {/* Left Arm holding rolled Hindi Newspaper under arm */}
            <path d="M 190 360 L 130 450 L 180 480" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 190 360 L 130 450 L 180 480" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="180" cy="480" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            {/* Rolled Newspaper */}
            <rect x="130" y="440" width="90" height="30" rx="12" fill="#F1F5F9" stroke={STROKE} strokeWidth="5" transform="rotate(-20 175 455)" />

            {/* Right Arm raised holding Cutting Chai Glass */}
            <path d="M 390 360 L 460 380 L 400 310" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 390 360 L 460 380 L 400 310" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="400" cy="310" r="20" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Cutting Chai Glass with Steam */}
            <g transform="translate(390, 275)">
              <polygon points="5,15 25,15 22,48 8,48" fill="#FDE68A" opacity="0.8" stroke={STROKE} strokeWidth="4" />
              <rect x="7" y="24" width="16" height="20" fill="#B45309" />
              {/* Hot Steam wisps */}
              <path d="M 10 10 Q 15 0 10 -10" fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
              <path d="M 20 12 Q 25 2 20 -8" fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            </g>

            {/* Formal Trousers & Leather Shoes */}
            <line x1="230" y1="590" x2="230" y2="685" stroke="#334155" strokeWidth="26" strokeLinecap="round" />
            <line x1="230" y1="590" x2="230" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke="#334155" strokeWidth="26" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="195" y="680" width="70" height="24" rx="8" fill="#1E293B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="315" y="680" width="70" height="24" rx="8" fill="#1E293B" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
      }

      // =========================================================================
      // 21. HOLDING TERMINATION SLIP (CORPORATE BOSS POSE)
      // =========================================================================
      case 'holding_termination_slip': {
        return (
          <g id="pose_holding_termination_slip">
            {/* Ground Contact Shadow */}
            <ellipse cx="290" cy="710" rx="140" ry="20" fill="#000000" opacity="0.4" />
            {/* Dark Corporate Suit Torso */}
            <path
              d="M 185 330 Q 165 440 185 590 L 395 590 Q 415 440 395 330 Z"
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Red Corporate Necktie */}
            <polygon points="280,340 300,340 305,480 290,505 275,480" fill="#DC2626" stroke={STROKE} strokeWidth="5" />

            {/* Left Arm on hip asserting power */}
            <path d="M 190 360 L 120 440 L 190 460" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 190 360 L 120 440 L 190 460" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="190" cy="460" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Right Arm thrusting forth the Pink Slip / PIP Notice */}
            <path d="M 390 360 L 480 410 L 440 450" fill="none" stroke={clothColor} strokeWidth="44" strokeLinecap="round" />
            <path d="M 390 360 L 480 410 L 440 450" fill="none" stroke={STROKE} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
            <circle cx="440" cy="450" r="22" fill={skinColor} stroke={STROKE} strokeWidth={STROKE_WIDTH} />

            {/* Pink Termination Notice with Red Stamp */}
            <g transform="translate(420, 420) rotate(-15 50 40)">
              <rect x="0" y="0" width="90" height="110" rx="6" fill="#FFE4E6" stroke={STROKE} strokeWidth="5" />
              <line x1="12" y1="20" x2="78" y2="20" stroke="#E11D48" strokeWidth="4" />
              <line x1="12" y1="36" x2="60" y2="36" stroke="#94A3B8" strokeWidth="4" />
              <line x1="12" y1="50" x2="70" y2="50" stroke="#94A3B8" strokeWidth="4" />
              {/* Red Stamp "FIRED / PIP" */}
              <rect x="15" y="65" width="60" height="24" rx="4" fill="#DC2626" stroke="#000000" strokeWidth="3" />
              <text x="45" y="81" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">
                TERMINATED
              </text>
            </g>

            {/* Dark Suit Trousers & Polished Shoes */}
            <line x1="230" y1="590" x2="230" y2="685" stroke="#1E293B" strokeWidth="26" strokeLinecap="round" />
            <line x1="230" y1="590" x2="230" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke="#1E293B" strokeWidth="26" strokeLinecap="round" />
            <line x1="350" y1="590" x2="350" y2="685" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <rect x="195" y="680" width="70" height="24" rx="8" fill="#000000" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="315" y="680" width="70" height="24" rx="8" fill="#000000" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
      }

      case 'standing_dazed':
      default:
        return (
          <g id="pose_standing_dazed">
            {/* Slouching Torso with subtle breathing */}
            <path
              d={`M 200 330 Q 185 450 190 ${580 + breathOffset} L 390 ${580 + breathOffset} Q 390 450 375 330 Z`}
              fill={clothColor}
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Long Droopy Sleeves Swallowing Hands */}
            <path
              d={`M 200 360 L 170 530 L 175 ${630 + breathOffset}`}
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d={`M 200 360 L 170 530 L 175 ${630 + breathOffset}`}
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />

            <path
              d={`M 375 360 L 405 530 L 400 ${630 + breathOffset}`}
              fill="none"
              stroke={clothColor}
              strokeWidth="45"
              strokeLinecap="round"
            />
            <path
              d={`M 375 360 L 405 530 L 400 ${630 + breathOffset}`}
              fill="none"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            {/* Grounded Legs connecting Torso to Slippers */}
            <line x1="240" y1="580" x2="240" y2="670" stroke={skinColor} strokeWidth="22" strokeLinecap="round" />
            <line x1="240" y1="580" x2="240" y2="670" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            <line x1="340" y1="580" x2="340" y2="670" stroke={skinColor} strokeWidth="22" strokeLinecap="round" />
            <line x1="340" y1="580" x2="340" y2="670" stroke={STROKE} strokeWidth="6" strokeLinecap="round" />
            {/* Slippers */}
            <rect x="210" y="670" width="60" height="30" rx="15" fill="#F1F5F9" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
            <rect x="310" y="670" width="60" height="30" rx="15" fill="#F1F5F9" stroke={STROKE} strokeWidth={STROKE_WIDTH} />
          </g>
        );
    }
  };

  // Render Attire & Armor Overlay (Kavach, Shawl, Janeu, Mala)
  const renderAttireOverlay = () => {
    switch (attire) {
      case 'warrior_kavach':
        return (
          <g id="attire_warrior_kavach">
            {/* Golden Breastplate (Kavach) fitted onto torso */}
            <path
              d="M 205 345 L 185 530 L 395 530 L 375 345 Z"
              fill="#F59E0B"
              stroke={STROKE}
              strokeWidth={STROKE_WIDTH}
              strokeLinejoin="round"
            />
            {/* Central Sun Crest / Emblem */}
            <circle cx="290" cy="430" r="32" fill="#FACC15" stroke={STROKE} strokeWidth="6" />
            <circle cx="290" cy="430" r="14" fill="#DC2626" />
            {/* Solar rays */}
            <line x1="290" y1="388" x2="290" y2="396" stroke={STROKE} strokeWidth="5" />
            <line x1="290" y1="464" x2="290" y2="472" stroke={STROKE} strokeWidth="5" />
            <line x1="248" y1="430" x2="256" y2="430" stroke={STROKE} strokeWidth="5" />
            <line x1="324" y1="430" x2="332" y2="430" stroke={STROKE} strokeWidth="5" />
            {/* Armor Segment Ribbing */}
            <line x1="200" y1="480" x2="380" y2="480" stroke="#B45309" strokeWidth="8" />
            {/* Pauldrons (Shoulder Guards) */}
            <ellipse cx="190" cy="355" rx="36" ry="24" fill="#F59E0B" stroke={STROKE} strokeWidth="7" transform="rotate(-20 190 355)" />
            <ellipse cx="390" cy="355" rx="36" ry="24" fill="#F59E0B" stroke={STROKE} strokeWidth="7" transform="rotate(20 390 355)" />
          </g>
        );

      case 'dark_shawl':
        return (
          <g id="attire_dark_shawl">
            {/* Conspirator's Dark Silk Shawl Draped Across Chest */}
            <path
              d="M 185 340 Q 280 430 395 540 L 375 580 Q 265 470 175 360 Z"
              fill="#1C1917"
              stroke={STROKE}
              strokeWidth="6"
            />
            <path d="M 210 370 Q 290 445 375 520" stroke="#44403C" strokeWidth="6" fill="none" />
          </g>
        );

      case 'royal_mala':
        return (
          <g id="attire_royal_mala">
            {/* Multi-strand Pearl and Ruby Royal Mala */}
            <path d="M 215 335 Q 290 430 365 335" fill="none" stroke="#FACC15" strokeWidth="12" strokeLinecap="round" strokeDasharray="14 8" />
            <circle cx="290" cy="390" r="16" fill="#DC2626" stroke={STROKE} strokeWidth="4" />
            <circle cx="290" cy="390" r="8" fill="#FEF08A" />
          </g>
        );

      case 'dhoti_janeu':
        return (
          <g id="attire_dhoti_janeu">
            {/* Sacred Janeu Thread Across Torso */}
            <path d="M 220 340 Q 270 450 350 560" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeDasharray="12 6" />
          </g>
        );

      case 'default':
      default:
        return null;
    }
  };

  // Render Facial Grooming (Handlebar Moustache, Sage Beard, Stubble)
  const renderFacialHair = () => {
    switch (facialHair) {
      case 'royal_moustache':
        return (
          <g id="facial_royal_moustache">
            {/* Thick Royal Curved Handlebar Moustache */}
            <path
              d="M 290 272 Q 250 262 215 278 Q 195 288 190 272 Q 212 250 250 255 Q 280 262 290 272 Z"
              fill="#0F172A"
              stroke={STROKE}
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M 290 272 Q 330 262 365 278 Q 385 288 390 272 Q 368 250 330 255 Q 300 262 290 272 Z"
              fill="#0F172A"
              stroke={STROKE}
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </g>
        );

      case 'shivaji_beard':
        return (
          <g id="facial_shivaji_beard">
            {/* Trimmed Royal Maratha Goatee Beard */}
            <polygon points="275,290 290,345 305,290" fill="#0F172A" stroke={STROKE} strokeWidth="6" strokeLinejoin="round" />
            <circle cx="290" cy="315" r="4" fill="#334155" />
            {/* Elegant Sharp Upturned Maratha Mustache */}
            <path
              d="M 225 272 Q 260 258 290 270 Q 320 258 355 272 Q 375 280 380 262 Q 355 248 320 254 Q 290 260 260 254 Q 225 248 200 262 Q 205 280 225 272 Z"
              fill="#0F172A"
              stroke={STROKE}
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </g>
        );

      case 'white_rishi_beard':
        return (
          <g id="facial_white_rishi_beard">
            {/* Flowing White Sage Beard */}
            <path
              d="M 225 270 Q 210 360 250 430 L 290 480 L 330 430 Q 370 360 355 270 Q 320 290 290 285 Q 260 290 225 270 Z"
              fill="#F8FAFC"
              stroke={STROKE}
              strokeWidth="7"
              strokeLinejoin="round"
            />
            {/* Flowing Beard Hair Strands */}
            <path d="M 260 320 Q 275 400 290 460" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 320 320 Q 305 400 290 460" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Dignified White Mustache */}
            <path d="M 240 270 Q 290 285 340 270" stroke="#E2E8F0" strokeWidth="8" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'thick_uncle_mustache':
        return (
          <g id="facial_thick_uncle_mustache">
            {/* Classic Bushy Indian Uncle Mustache */}
            <path
              d="M 230 280 Q 290 265 350 280 Q 330 305 290 300 Q 250 305 230 280 Z"
              fill="#1E293B"
              stroke={STROKE}
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </g>
        );

      case 'elder_beard':
        return (
          <g id="facial_elder_beard">
            {/* Pointed Silver/Grey Strategist Beard */}
            <path
              d="M 235 275 Q 220 310 250 360 L 290 415 L 330 360 Q 360 310 345 275 Q 310 292 290 286 Q 270 292 235 275 Z"
              fill={hairColor || '#64748B'}
              stroke={STROKE}
              strokeWidth="7"
              strokeLinejoin="round"
            />
            {/* Silver Strands Highlighting */}
            <path d="M 270 310 L 290 400 L 310 310" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Shakuni's sly thin grey moustache */}
            <path d="M 250 270 Q 290 285 330 270" stroke="#0F172A" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'stubble':
        return (
          <g id="facial_stubble" opacity="0.6">
            <ellipse cx="290" cy="285" rx="55" ry="30" fill="#64748B" opacity="0.25" />
            <circle cx="260" cy="285" r="2" fill="#334155" />
            <circle cx="275" cy="290" r="2" fill="#334155" />
            <circle cx="290" cy="295" r="2" fill="#334155" />
            <circle cx="305" cy="290" r="2" fill="#334155" />
            <circle cx="320" cy="285" r="2" fill="#334155" />
          </g>
        );

      case 'none':
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + floatBob,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg) ${flipHorizontal ? 'scaleX(-1)' : ''}`,
        transformOrigin: 'center center',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="600"
        height="800"
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Render Pose Body & Limbs */}
        {renderPose()}

        {/* Render Attire & Armor Overlay */}
        {renderAttireOverlay()}

        {/* Render Articulated Head with Natural Speaking Bob & Tilt */}
        <g id="articulated_head_group" transform={`translate(0, ${headBob}) rotate(${headTilt} 290 280)`}>
          {/* Render Head & Hair */}
          {renderHead()}

          {/* Render Facial Expression */}
          {renderFace()}

          {/* Render Facial Grooming (Moustache/Beard) */}
          {renderFacialHair()}

          {/* Optional Comic Glasses */}
          {glasses && (
            <g id="accessory_glasses">
              <rect x="210" y="190" width="70" height="50" rx="14" fill="none" stroke="#000000" strokeWidth="8" />
              <rect x="300" y="190" width="70" height="50" rx="14" fill="none" stroke="#000000" strokeWidth="8" />
              <line x1="280" y1="210" x2="300" y2="210" stroke="#000000" strokeWidth="8" />
              {/* Glasses reflection glint */}
              <line x1="220" y1="200" x2="235" y2="200" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              <line x1="310" y1="200" x2="325" y2="200" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
