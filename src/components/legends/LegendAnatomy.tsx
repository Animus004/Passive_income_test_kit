import React from 'react';
import {
  LegendExpression,
  LegendLookAt,
  LegendPose,
  LegendProfile,
  LegendWeaponType,
} from './types';
import { LegendWeapon } from './LegendWeapons';

/**
 * Shared Anatomical Geometry, Cel-Shading & 2-Bone Forward Kinematics Solver
 * for the Indian Legends Asset Library (700x920 unified hero coordinate grid).
 */

export interface FKArmSpec {
  upperDeg: number; // 0 = straight down, -90 = straight left, +90 = straight right, 180 = straight up
  foreDeg: number;
  handMode: 'open' | 'fist' | 'mudra' | 'pointing' | 'chakra_finger';
}

export interface PoseKinematics {
  leftArm: FKArmSpec;
  rightArm: FKArmSpec;
  weaponMount: 'none' | 'left' | 'right';
  torsoTiltDeg: number;
}

export function getPoseKinematics(
  pose: LegendPose,
  frame: number,
  fps: number,
  weapon: LegendWeaponType,
  legendId?: string
): PoseKinematics {
  const sway = Math.sin((frame / fps) * Math.PI * 1.4) * 2.5;

  switch (pose) {
    case 'wielding_chakra':
      return {
        leftArm: { upperDeg: -16 - sway * 0.5, foreDeg: 18, handMode: 'open' },
        rightArm: { upperDeg: 112 + sway * 0.6, foreDeg: 168, handMode: 'chakra_finger' },
        weaponMount: weapon === 'none' ? 'none' : 'right',
        torsoTiltDeg: -1.5,
      };

    case 'playing_bansuri':
      return {
        leftArm: { upperDeg: -80 + sway * 0.3, foreDeg: 135, handMode: 'mudra' },
        rightArm: { upperDeg: 80 - sway * 0.3, foreDeg: -135, handMode: 'mudra' },
        weaponMount: 'right',
        torsoTiltDeg: -2.0 + sway * 0.3,
      };

    case 'archer_aiming':
      return {
        leftArm: { upperDeg: -50, foreDeg: -120, handMode: 'fist' },
        rightArm: { upperDeg: -42, foreDeg: -128 + sway * 0.3, handMode: 'mudra' },
        weaponMount: weapon === 'none' ? 'none' : 'left',
        torsoTiltDeg: -1.5,
      };

    case 'warrior_stance':
      if (weapon === 'twin_talwars') {
        return {
          leftArm: { upperDeg: -56 - sway * 0.5, foreDeg: -136, handMode: 'fist' },
          rightArm: { upperDeg: 58 + sway * 0.5, foreDeg: 138, handMode: 'fist' },
          weaponMount: 'right',
          torsoTiltDeg: 0,
        };
      }
      return {
        leftArm: { upperDeg: -22 - sway * 0.4, foreDeg: 28, handMode: 'fist' },
        rightArm: { upperDeg: 58 + sway * 0.5, foreDeg: 138, handMode: 'fist' },
        weaponMount: weapon === 'none' ? 'none' : 'right',
        torsoTiltDeg: 1.5,
      };

    case 'guru_updesh':
      return {
        leftArm: { upperDeg: -18, foreDeg: 24, handMode: 'open' },
        rightArm: { upperDeg: 38 + sway * 0.6, foreDeg: 148, handMode: 'mudra' },
        weaponMount: legendId === 'ashoka' ? 'left' : 'none',
        torsoTiltDeg: 0,
      };

    case 'holding_scroll':
      return {
        leftArm: { upperDeg: -24, foreDeg: 38, handMode: 'fist' },
        rightArm: { upperDeg: 52 + sway * 0.7, foreDeg: 158, handMode: 'pointing' },
        weaponMount: weapon === 'none' ? 'none' : 'left',
        torsoTiltDeg: 1.0,
      };

    case 'orator_folded':
      return {
        leftArm: { upperDeg: -28, foreDeg: 84, handMode: 'open' },
        rightArm: { upperDeg: 28, foreDeg: -84, handMode: 'open' },
        weaponMount: 'none',
        torsoTiltDeg: 0,
      };

    case 'chaupar_scheme':
      return {
        leftArm: { upperDeg: -20, foreDeg: 95, handMode: 'mudra' },
        rightArm: { upperDeg: 44 + sway, foreDeg: 128, handMode: 'open' },
        weaponMount: weapon === 'none' ? 'none' : 'right',
        torsoTiltDeg: 3.0,
      };

    case 'heroic_idle':
    default:
      return {
        leftArm: { upperDeg: -16 - sway * 0.4, foreDeg: 12, handMode: 'open' },
        rightArm: { upperDeg: 18 + sway * 0.4, foreDeg: -10, handMode: 'open' },
        weaponMount: weapon === 'none' ? 'none' : 'right',
        torsoTiltDeg: 0,
      };
  }
}

export const LegendAuraHalo: React.FC<{
  profile: LegendProfile;
  frame: number;
  fps: number;
  intensity?: number;
}> = ({ profile, frame, fps, intensity = 1.0 }) => {
  const { palette, isDivineHalo, id } = profile;
  const spinSlow = (frame / fps) * 8;
  const pulse = 1 + Math.sin((frame / fps) * Math.PI * 1.5) * 0.035;

  return (
    <g id={`aura_halo_${id}`} opacity={Math.min(1, 0.9 * intensity)}>
      {/* Ambient Soft Radiant Halo behind Crown & Shoulders */}
      <circle cx="350" cy="245" r={210 * pulse} fill={`url(#auraGrad_${id})`} opacity={isDivineHalo ? 0.52 : 0.34} />

      {isDivineHalo ? (
        <g transform={`translate(350, 240) rotate(${spinSlow})`}>
          {/* Sacred Lotus Prabhavali Mandala Ring */}
          <circle cx="0" cy="0" r="168" fill="none" stroke={palette.auraSecondary} strokeWidth="3.5" opacity="0.55" />
          <circle cx="0" cy="0" r="154" fill="none" stroke={palette.auraPrimary} strokeWidth="2" strokeDasharray="8 10" opacity="0.7" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <polygon
              key={deg}
              points="0,-182 -9,-164 9,-164"
              fill={palette.auraSecondary}
              opacity="0.65"
              transform={`rotate(${deg})`}
            />
          ))}
        </g>
      ) : (
        <g transform={`translate(350, 245) rotate(${spinSlow * 0.4})`} opacity="0.32">
          {/* Subtle Martial / Emperor Crest Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="0"
              y1="-140"
              x2="0"
              y2="-192"
              stroke={palette.auraPrimary}
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${deg})`}
            />
          ))}
        </g>
      )}
    </g>
  );
};

export const LegendSculptedHead: React.FC<{
  profile: LegendProfile;
  expression: LegendExpression;
  lookAt: LegendLookAt;
  speechOpen: number; // 0 (closed) .. 1 (open speaking)
  isBlinking: boolean;
}> = ({ profile, expression, lookAt, speechOpen, isBlinking }) => {
  const { id, palette, jawType, tilak, facialHair, earOrnament } = profile;
  const ink = palette.outlineInk;
  const skinGrad = `url(#skinGrad_${id})`;
  const irisGrad = `url(#irisGrad_${id})`;
  const goldGrad = `url(#goldMetal_${id})`;
  const faceClipId = `face_clip_${id}`;

  // Look tracking pupil horizontal offset
  const pupilShiftX = lookAt === 'left' ? -5.5 : lookAt === 'right' ? 5.5 : 0;

  // Sculpted Skull/Jaw contours calibrated strictly by hero type
  const headPath = (() => {
    if (jawType === 'feminine_grace') {
      return 'M 284 225 C 280 182 310 162 350 162 C 390 162 420 182 416 225 C 414 265 402 296 382 315 C 368 328 360 332 350 332 C 340 332 332 328 318 315 C 298 296 286 265 284 225 Z';
    }
    if (jawType === 'elder_gaunt') {
      return 'M 282 222 C 278 176 310 158 350 158 C 390 158 422 176 418 222 C 416 258 402 288 386 310 L 366 332 L 334 332 L 314 310 C 298 288 284 258 282 222 Z';
    }
    if (jawType === 'warrior_square') {
      return 'M 280 222 C 276 176 308 158 350 158 C 392 158 424 176 420 222 C 420 264 410 294 394 312 L 368 332 L 332 332 L 306 312 C 290 294 280 264 280 222 Z';
    }
    // noble_oval & vanara_crest
    return 'M 282 224 C 278 178 308 158 350 158 C 392 158 422 178 418 224 C 416 266 400 298 378 318 C 364 330 358 333 350 333 C 342 333 336 330 322 318 C 300 298 284 266 282 224 Z';
  })();

  // Eyebrow tilt offsets per expression
  const browConfig = (() => {
    switch (expression) {
      case 'fierce_resolve':
        return { lInnerY: 238, lOuterY: 224, rInnerY: 238, rOuterY: 224 };
      case 'focused_aim':
      case 'commanding':
      case 'orator_fire':
        return { lInnerY: 235, lOuterY: 227, rInnerY: 235, rOuterY: 227 };
      case 'strategic_smirk':
        return { lInnerY: 234, lOuterY: 226, rInnerY: 230, rOuterY: 220 }; // Intelligent subtle raise
      case 'meditative':
      case 'compassionate':
      case 'calm_updesh':
      default:
        return { lInnerY: 229, lOuterY: 228, rInnerY: 229, rOuterY: 228 };
    }
  })();

  const isHalfClosed = expression === 'meditative';
  const eyeRy = isBlinking ? 1.5 : isHalfClosed ? 4.5 : 8.5;

  const renderEarOrnament = (cx: number, side: 'L' | 'R') => {
    const dir = side === 'L' ? -1 : 1;
    if (earOrnament === 'none') return null;
    if (earOrnament === 'surya_kundal') {
      return (
        <g>
          <circle cx={cx + dir * 2} cy="290" r="14" fill={goldGrad} stroke={ink} strokeWidth="2.5" />
          <circle cx={cx + dir * 2} cy="290" r="6" fill="#FEF08A" />
        </g>
      );
    }
    if (earOrnament === 'rudraksha_ear') {
      return (
        <g>
          <circle cx={cx + dir * 1} cy="288" r="8" fill="#78350F" stroke={ink} strokeWidth="2.2" />
          <circle cx={cx + dir * 1} cy="300" r="5" fill="#D97706" stroke={ink} strokeWidth="1.8" />
        </g>
      );
    }
    if (earOrnament === 'royal_bali') {
      return (
        <circle cx={cx + dir * 1} cy="285" r="8" fill="none" stroke={palette.trimGold} strokeWidth="4" />
      );
    }
    // makara_kundal (ornate golden teardrop pendant)
    return (
      <g>
        <circle cx={cx + dir * 1} cy="283" r="6.5" fill={goldGrad} stroke={ink} strokeWidth="2" />
        <path
          d={`M ${cx + dir * 1} 289 Q ${cx + dir * 9} 302 ${cx + dir * 1} 312 Q ${cx - dir * 7} 302 ${cx + dir * 1} 289 Z`}
          fill={goldGrad}
          stroke={ink}
          strokeWidth="2.2"
        />
        <circle cx={cx + dir * 1} cy="302" r="2.5" fill="#DC2626" />
      </g>
    );
  };

  return (
    <g id={`sculpted_head_${id}`}>
      <defs>
        <clipPath id={faceClipId}>
          <path d={headPath} />
        </clipPath>
      </defs>

      {/* Left & Right Sculpted Ears */}
      <ellipse cx="278" cy="260" rx="11" ry="20" fill={palette.skinShadow} stroke={ink} strokeWidth="3.2" />
      <ellipse cx="422" cy="260" rx="11" ry="20" fill={palette.skinBase} stroke={ink} strokeWidth="3.2" />
      {renderEarOrnament(277, 'L')}
      {renderEarOrnament(423, 'R')}

      {/* Base Sculpted Face Cranium */}
      <path d={headPath} fill={skinGrad} stroke={ink} strokeWidth="3.8" strokeLinejoin="round" />

      {/* Hanuman Vanara Noble Cheek Crest Accent (Gentle golden sideburns, zero nose band) */}
      {jawType === 'vanara_crest' && (
        <g clipPath={`url(#${faceClipId})`} opacity="0.65">
          <path d="M 278 240 Q 294 282 316 322 L 274 330 Z" fill="#FDE68A" />
          <path d="M 422 240 Q 406 282 384 322 L 426 330 Z" fill="#FDE68A" />
        </g>
      )}

      {/* Hard Cel-Shading Shadows (Clipped Cleanly Inside Face Contour) */}
      <g clipPath={`url(#${faceClipId})`} opacity="0.45">
        {/* Left jaw & temple core shadow */}
        <path
          d="M 276 160 L 315 160 C 304 210 306 285 338 336 L 276 336 Z"
          fill={palette.skinShadow}
        />
        {/* Forehead crown/hair cast shadow */}
        <path d="M 275 180 Q 350 202 425 180 L 425 215 Q 350 226 275 215 Z" fill={palette.skinShadow} />
      </g>

      {/* Subtle Nose Bridge & Sculpted Shadow */}
      <path d="M 350 242 L 346 270 L 354 274" fill="none" stroke={ink} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="350,244 343,270 350,273" fill={palette.skinShadow} opacity="0.4" />
      <path d="M 342 273 Q 350 278 358 273" fill="none" stroke={ink} strokeWidth="2.2" opacity="0.65" />

      {/* Forehead Tilaks & Divine Third Eye */}
      {tilak === 'urdhva_pundra' && (
        <g id="tilak_urdhva_pundra">
          <path d="M 343 196 L 348 223 L 352 223 L 357 196" fill="none" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="350" y1="202" x2="350" y2="220" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {tilak === 'kshatriya_tilak' && (
        <path d="M 350 198 L 354 220 L 350 224 L 346 220 Z" fill="#DC2626" stroke="#FEF08A" strokeWidth="1.2" />
      )}
      {tilak === 'chanakya_chandan' && (
        <g>
          <line x1="330" y1="204" x2="370" y2="204" stroke="#FEF08A" strokeWidth="4" strokeLinecap="round" />
          <line x1="333" y1="212" x2="367" y2="212" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="350" cy="218" r="3.5" fill="#DC2626" />
        </g>
      )}
      {tilak === 'chandrakor_maratha' && (
        <path d="M 340 207 A 11 11 0 0 0 360 207 A 12 8 0 0 1 340 207 Z" fill="#DC2626" />
      )}
      {tilak === 'sindoor_hanuman' && (
        <ellipse cx="350" cy="212" rx="7" ry="11" fill="#F97316" stroke="#DC2626" strokeWidth="1.5" />
      )}
      {tilak === 'bindi_crimson' && (
        <g>
          <circle cx="350" cy="216" r="5" fill="#DC2626" stroke="#FACC15" strokeWidth="1.2" />
          {/* Delicate Maharashtrian Gold Nose Ring (Nath) */}
          <circle cx="337" cy="272" r="5.5" fill="none" stroke="#FDE047" strokeWidth="2.5" />
          <circle cx="332" cy="273" r="2" fill="#FFFFFF" />
        </g>
      )}
      {(tilak === 'tripundra_ash' || tilak === 'tripundra_third_eye') && (
        <g id="tilak_tripundra">
          <line x1="322" y1="204" x2="378" y2="204" stroke="#F8FAFC" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="324" y1="211" x2="376" y2="211" stroke="#F8FAFC" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="327" y1="218" x2="373" y2="218" stroke="#F8FAFC" strokeWidth="3.2" strokeLinecap="round" />
          {tilak === 'tripundra_third_eye' ? (
            <g>
              <ellipse cx="350" cy="212" rx="4.5" ry="9.5" fill="#F97316" stroke={ink} strokeWidth="2" />
              <circle cx="350" cy="211" r="2.2" fill="#FEF08A" />
            </g>
          ) : (
            <circle cx="350" cy="211" r="4" fill="#DC2626" />
          )}
        </g>
      )}

      {/* Noble Kamal-Nayana Almond Eyes */}
      {[
        { cx: 318, side: 'L' },
        { cx: 382, side: 'R' },
      ].map(({ cx, side }) => (
        <g key={side}>
          {/* Subtle upper eyelid crease */}
          <path
            d={`M ${cx - 19} 241 Q ${cx} ${233} ${cx + 19} 241`}
            fill="none"
            stroke={palette.skinShadow}
            strokeWidth="2.2"
            opacity="0.7"
          />
          {isBlinking ? (
            <path
              d={`M ${cx - 19} 248 Q ${cx} 252 ${cx + 19} 248`}
              fill="none"
              stroke={ink}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <g>
              {/* Lotus Almond Sclera */}
              <path
                d={`M ${cx - 19} 248 Q ${cx} ${248 - eyeRy * 1.45} ${cx + 19} 248 Q ${cx} ${248 + eyeRy * 1.15} ${cx - 19} 248 Z`}
                fill="#FFFFFF"
                stroke={ink}
                strokeWidth="2.6"
              />
              {/* Clipped Iris & Pupil */}
              <clipPath id={`eye_clip_${id}_${side}`}>
                <path
                  d={`M ${cx - 18} 248 Q ${cx} ${248 - eyeRy * 1.35} ${cx + 18} 248 Q ${cx} ${248 + eyeRy * 1.05} ${cx - 18} 248 Z`}
                />
              </clipPath>
              <g clipPath={`url(#eye_clip_${id}_${side})`}>
                <circle cx={cx + pupilShiftX} cy="248" r="8.2" fill={irisGrad} stroke={ink} strokeWidth="1.5" />
                <circle cx={cx + pupilShiftX} cy="248" r="4.2" fill="#090D16" />
                {/* Sharp Catchlight Dots */}
                <circle cx={cx + pupilShiftX - 2.6} cy="244.5" r="2.1" fill="#FFFFFF" />
                <circle cx={cx + pupilShiftX + 2.4} cy="249.5" r="1.1" fill="#FFFFFF" opacity="0.85" />
              </g>
              {/* Upper Heavy Eyeliner / Lashes giving noble intensity */}
              <path
                d={`M ${cx - 21} 248 Q ${cx} ${248 - eyeRy * 1.5} ${cx + 21} 247`}
                fill="none"
                stroke={ink}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
      ))}

      {/* Sculpted Expressive Eyebrows */}
      <path
        d={`M 294 ${browConfig.lOuterY} Q 318 ${browConfig.lOuterY - 7} 339 ${browConfig.lInnerY}`}
        fill="none"
        stroke={jawType === 'elder_gaunt' && id === 'bhishma' ? palette.hairBase : ink}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={`M 361 ${browConfig.rInnerY} Q 382 ${browConfig.rOuterY - 7} 406 ${browConfig.rOuterY}`}
        fill="none"
        stroke={jawType === 'elder_gaunt' && id === 'bhishma' ? palette.hairBase : ink}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Sculpted Mouth with Audio Word Lip-Sync */}
      {speechOpen > 0.12 ? (
        <g id="hero_speaking_mouth">
          {/* Natural Sculpted Open Mouth with Teeth Edge */}
          <path
            d={`M 332 296 Q 350 ${292} 368 296 Q 350 ${298 + speechOpen * 14} 332 296 Z`}
            fill="#450A0A"
            stroke={ink}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {speechOpen > 0.35 && (
            <path d="M 338 296 Q 350 299 362 296" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
          )}
          <path d="M 342 308 Q 350 310 358 308" fill="none" stroke={palette.skinShadow} strokeWidth="2" opacity="0.6" />
        </g>
      ) : (
        <g id="hero_calm_mouth">
          {expression === 'strategic_smirk' ? (
            <path d="M 333 298 Q 352 301 370 292" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
          ) : expression === 'fierce_resolve' || expression === 'commanding' ? (
            <path d="M 332 298 Q 350 295 368 298" fill="none" stroke={ink} strokeWidth="3.4" strokeLinecap="round" />
          ) : (
            <path d="M 333 295 Q 350 304 367 295" fill="none" stroke={ink} strokeWidth="3.2" strokeLinecap="round" />
          )}
          {/* Subtle lower lip shadow */}
          <path d="M 343 305 Q 350 307 357 305" fill="none" stroke={palette.skinShadow} strokeWidth="2" opacity="0.7" />
        </g>
      )}

      {/* Historical / Patriarch Sculpted Facial Hair */}
      {facialHair === 'bhishma_flowing_beard' && (
        <g id="beard_bhishma">
          <path
            d="M 294 282 C 288 332 308 386 350 426 C 392 386 412 332 406 282 Q 380 312 350 312 Q 320 312 294 282 Z"
            fill="#F8FAFC"
            stroke={ink}
            strokeWidth="3.5"
          />
          <path d="M 326 330 Q 338 378 350 412" fill="none" stroke="#CBD5E1" strokeWidth="3" />
          <path d="M 374 330 Q 362 378 350 412" fill="none" stroke="#CBD5E1" strokeWidth="3" />
          <path d="M 314 286 Q 350 296 386 286" fill="none" stroke="#E2E8F0" strokeWidth="5.5" strokeLinecap="round" />
        </g>
      )}
      {facialHair === 'shivaji_pointed_beard' && (
        <g id="beard_shivaji">
          {/* Dignified Sharp Upturned Maratha Mustache & Royal Pointed Beard */}
          <path
            d="M 350 286 Q 332 281 312 291 Q 302 294 297 284 Q 315 274 350 282 Q 385 274 403 284 Q 398 294 388 291 Q 368 281 350 286 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="2.2"
          />
          <path
            d="M 310 304 Q 318 330 350 350 Q 382 330 390 304 Q 368 320 350 322 Q 332 320 310 304 Z"
            fill={palette.hairBase}
            stroke={ink}
            strokeWidth="2.6"
          />
        </g>
      )}
      {facialHair === 'pratap_rajput_moustache' && (
        <path
          d="M 350 285 Q 324 278 296 293 Q 278 296 274 280 Q 302 266 350 280 Q 398 266 426 280 Q 422 296 404 293 Q 376 278 350 285 Z"
          fill={palette.hairBase}
          stroke={ink}
          strokeWidth="2.5"
        />
      )}
      {(facialHair === 'royal_handlebar' || facialHair === 'ravana_royal_stache') && (
        <path
          d="M 350 286 Q 328 279 306 292 Q 293 295 290 282 Q 315 270 350 281 Q 385 270 410 282 Q 407 295 394 292 Q 372 279 350 286 Z"
          fill={palette.hairBase}
          stroke={ink}
          strokeWidth="2.2"
        />
      )}
      {facialHair === 'shakuni_goatee' && (
        <g>
          <path d="M 320 286 Q 350 280 380 286" fill="none" stroke={palette.hairBase} strokeWidth="4" strokeLinecap="round" />
          <polygon points="338,314 350,356 362,314" fill={palette.hairBase} stroke={ink} strokeWidth="2.5" />
        </g>
      )}
    </g>
  );
};

export const LegendBackCape: React.FC<{
  profile: LegendProfile;
  frame: number;
  fps: number;
}> = ({ profile, frame, fps }) => {
  const { id, palette, bodySilhouette, hasCapeOrUttariya } = profile;
  const ink = palette.outlineInk;
  const scarfWave = Math.sin((frame / fps) * Math.PI * 1.8) * 14;
  const isArmored = bodySilhouette === 'armored_kshatriya' || bodySilhouette === 'patriarch_elder';
  const isRegalCoat = bodySilhouette === 'maratha_rajput_regal';
  const isQueen = bodySilhouette === 'warrior_queen';
  const isVanara = bodySilhouette === 'vanara_heroic';

  return (
    <g id={`back_cape_tail_${id}`}>
      {/* Soft Ground Contact Shadow */}
      <ellipse cx="350" cy="866" rx="135" ry="20" fill="#000000" opacity="0.45" />

      {/* Back Flowing Angavastram Scarf or War Cloak (Animated Wave) */}
      {hasCapeOrUttariya && (
        <path
          d={`M 252 372 C 206 470 190 580 ${182 + scarfWave} 735 L 258 725 L 442 725 L ${518 - scarfWave * 0.7} 735 C 510 580 494 470 448 372 Z`}
          fill={isArmored || isRegalCoat || isQueen ? palette.clothShadow : palette.clothHighlight}
          stroke={ink}
          strokeWidth="3.5"
          opacity={isArmored || isRegalCoat ? 0.94 : 0.85}
          strokeLinejoin="round"
        />
      )}

      {/* Hanuman Iconic Heroic Curved Tail */}
      {isVanara && (
        <g id="hanuman_tail">
          <path
            d={`M 392 580 Q 515 560 ${530 + scarfWave * 0.6} 415 Q ${538 + scarfWave} 325 492 318`}
            fill="none"
            stroke={ink}
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d={`M 392 580 Q 515 560 ${530 + scarfWave * 0.6} 415 Q ${538 + scarfWave} 325 492 318`}
            fill="none"
            stroke={palette.skinBase}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle cx="492" cy="318" r="10" fill="#FACC15" stroke={ink} strokeWidth="2.5" />
        </g>
      )}
    </g>
  );
};

export const LegendBodyAndDhoti: React.FC<{
  profile: LegendProfile;
  frame: number;
  fps: number;
}> = ({ profile }) => {
  const { id, palette, bodySilhouette, neckOrnament } = profile;
  const ink = palette.outlineInk;
  const skinGrad = `url(#skinGrad_${id})`;
  const clothGrad = `url(#clothGrad_${id})`;
  const goldGrad = `url(#goldMetal_${id})`;
  const armorGrad = `url(#armorGrad_${id})`;

  const isArmored = bodySilhouette === 'armored_kshatriya' || bodySilhouette === 'patriarch_elder';
  const isRegalCoat = bodySilhouette === 'maratha_rajput_regal';
  const isQueen = bodySilhouette === 'warrior_queen';
  const isSage = bodySilhouette === 'sannyasi_sage';
  const isVivekananda = id === 'vivekananda';

  return (
    <g id={`hero_body_${id}`}>

      {/* Draped Lower Garment / Dhoti / Churidar / Kashta Saree */}
      {isRegalCoat ? (
        <g id="lower_maratha_rajput">
          {/* Pleated Churidar Legs ending in Royal Mojari Shoes */}
          <path d="M 294 585 L 282 825 L 326 825 L 340 645 L 360 645 L 374 825 L 418 825 L 406 585 Z" fill="#F8FAFC" stroke={ink} strokeWidth="3.5" />
          {/* Flared Pleated Angarkha Tunic Skirt */}
          <path
            d="M 288 518 Q 252 615 242 695 Q 350 715 458 695 Q 448 615 412 518 Z"
            fill={clothGrad}
            stroke={ink}
            strokeWidth="3.8"
          />
          <path d="M 250 680 Q 350 700 450 680" fill="none" stroke={palette.trimGold} strokeWidth="5" />
          <line x1="350" y1="530" x2="350" y2="695" stroke={palette.trimGold} strokeWidth="3" opacity="0.7" />
          {/* Curled-toe Royal Mojaris */}
          <path d="M 272 825 L 326 825 L 330 854 Q 285 860 256 842 Q 250 832 272 825 Z" fill="#991B1B" stroke={ink} strokeWidth="3.2" />
          <path d="M 374 825 L 428 825 Q 450 832 444 842 Q 415 860 370 854 Z" fill="#991B1B" stroke={ink} strokeWidth="3.2" />
        </g>
      ) : (
        <g id="lower_hero_dhoti">
          {/* Grounded Muscular Lower Ankles & Heroic Feet / Padukas */}
          <path d="M 288 785 L 284 834 L 318 834 L 322 785 Z" fill={skinGrad} stroke={ink} strokeWidth="3" />
          <path d="M 378 785 L 382 834 L 416 834 L 412 785 Z" fill={skinGrad} stroke={ink} strokeWidth="3" />
          {/* Sculpted Sandaled / Bare Feet with Gold Nupura Anklets */}
          <rect x="283" y="818" width="36" height="8" rx="3" fill={goldGrad} stroke={ink} strokeWidth="2" />
          <rect x="381" y="818" width="36" height="8" rx="3" fill={goldGrad} stroke={ink} strokeWidth="2" />
          <path d="M 268 844 Q 300 830 322 840 L 322 858 Q 292 864 268 854 Z" fill={isSage ? '#78350F' : skinGrad} stroke={ink} strokeWidth="3" />
          <path d="M 378 840 Q 400 830 432 844 L 432 854 Q 408 864 378 858 Z" fill={isSage ? '#78350F' : skinGrad} stroke={ink} strokeWidth="3" />

          {/* Main Pleated Silk Dhoti / Saree Wrap */}
          <path
            d="M 284 522 C 266 618 258 725 270 806 Q 315 818 350 795 Q 385 818 430 806 C 442 725 434 618 416 522 Z"
            fill={clothGrad}
            stroke={ink}
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          {/* Shiva Tiger-Skin Stripes if Mahadev */}
          {id === 'shiva' && (
            <g opacity="0.72" stroke="#451A03" strokeWidth="5" strokeLinecap="round">
              <path d="M 282 575 Q 306 588 320 572" fill="none" />
              <path d="M 375 610 Q 404 624 422 606" fill="none" />
              <path d="M 274 660 Q 308 672 325 654" fill="none" />
              <path d="M 380 710 Q 406 725 426 708" fill="none" />
            </g>
          )}
          {/* Diagonal Cloth Shadow Folds & Golden Zari Trim */}
          <path d="M 288 552 Q 350 612 422 678" fill="none" stroke={palette.clothShadow} strokeWidth="5" opacity="0.6" />
          <path d="M 412 560 Q 345 628 274 715" fill="none" stroke={palette.clothShadow} strokeWidth="4.5" opacity="0.5" />
          <path d="M 272 792 Q 315 804 348 784" fill="none" stroke={palette.trimGold} strokeWidth="6" />
          <path d="M 352 784 Q 385 804 428 792" fill="none" stroke={palette.trimGold} strokeWidth="6" />
          {/* Central Cascading Kachcha Pleat Fold */}
          <path
            d="M 332 536 L 368 536 L 376 798 Q 350 816 324 798 Z"
            fill={palette.clothHighlight}
            stroke={ink}
            strokeWidth="3"
          />
          <line x1="350" y1="544" x2="350" y2="795" stroke={palette.clothShadow} strokeWidth="2.5" opacity="0.55" />
        </g>
      )}

      {/* Sculpted Anatomical Neck & Trapezius */}
      <path
        d="M 322 315 L 320 356 Q 285 370 248 378 L 452 378 Q 415 370 380 356 L 378 315 Z"
        fill={skinGrad}
        stroke={ink}
        strokeWidth="3.6"
        strokeLinejoin="round"
      />
      {/* Chin Cast Neck Shadow */}
      <path d="M 322 318 Q 350 350 378 318 L 378 342 Q 350 362 322 342 Z" fill={palette.skinShadow} opacity="0.55" />

      {/* Heroic Torso & Chest Silhouette */}
      {isArmored ? (
        <g id="torso_armored_kshatriya">
          <path
            d="M 248 376 C 236 420 264 495 288 534 L 412 534 C 436 495 464 420 452 376 C 415 366 385 366 350 370 C 315 366 285 366 248 376 Z"
            fill={armorGrad}
            stroke={ink}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Engraved Kavach Armor Ribs & Central Emblem */}
          <path d="M 268 415 Q 350 442 432 415" fill="none" stroke={palette.armorShadow || '#78350F'} strokeWidth="4" />
          <path d="M 280 468 Q 350 486 420 468" fill="none" stroke={palette.armorShadow || '#78350F'} strokeWidth="4" />
          <circle cx="350" cy="436" r="24" fill={goldGrad} stroke={ink} strokeWidth="3.2" />
          <circle cx="350" cy="436" r="10" fill={id === 'karna' ? '#EA580C' : id === 'ashoka' ? '#1D4ED8' : '#DC2626'} />
          {/* Layered Shoulder Pauldrons */}
          <ellipse cx="250" cy="382" rx="34" ry="20" fill={goldGrad} stroke={ink} strokeWidth="3.5" transform="rotate(-18 250 382)" />
          <ellipse cx="450" cy="382" rx="34" ry="20" fill={goldGrad} stroke={ink} strokeWidth="3.5" transform="rotate(18 450 382)" />
        </g>
      ) : isRegalCoat ? (
        <g id="torso_regal_angarkha">
          <path
            d="M 248 374 L 288 534 L 412 534 L 452 374 C 415 362 385 362 350 368 C 315 362 285 362 248 374 Z"
            fill={clothGrad}
            stroke={ink}
            strokeWidth="3.8"
          />
          {/* Overlapping Royal Angarkha Lapel Seam */}
          <path d="M 326 368 L 368 424 L 368 534" fill="none" stroke={palette.trimGold} strokeWidth="4" />
          <circle cx="378" cy="434" r="4" fill={palette.trimGold} />
          <circle cx="378" cy="462" r="4" fill={palette.trimGold} />
          <circle cx="378" cy="490" r="4" fill={palette.trimGold} />
        </g>
      ) : isQueen ? (
        <g id="torso_warrior_queen">
          <path
            d="M 262 376 C 258 430 284 480 296 534 L 404 534 C 416 480 442 430 438 376 C 405 365 375 365 350 370 C 325 365 295 365 262 376 Z"
            fill={clothGrad}
            stroke={ink}
            strokeWidth="3.8"
          />
          {/* Gold Bordered Saree Pallu draped diagonally across shoulder */}
          <path
            d="M 268 374 L 416 534 L 392 534 L 252 388 Z"
            fill={palette.clothHighlight}
            stroke={palette.trimGold}
            strokeWidth="3"
          />
        </g>
      ) : (
        /* Divine Athletic / Sage Bare Chest + Angavastram Drape */
        <g id="torso_divine_sculpted">
          <path
            d="M 248 376 C 242 426 266 490 288 534 L 412 534 C 434 490 458 426 452 376 C 412 364 382 364 350 370 C 318 364 288 364 248 376 Z"
            fill={isSage ? clothGrad : skinGrad}
            stroke={ink}
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          {!isSage && (
            <>
              {/* Pectoral Muscle Contours & Cel-Shadow */}
              <path d="M 276 426 Q 312 444 346 426" fill="none" stroke={palette.skinShadow} strokeWidth="3.5" opacity="0.7" strokeLinecap="round" />
              <path d="M 354 426 Q 388 444 424 426" fill="none" stroke={palette.skinShadow} strokeWidth="3.5" opacity="0.7" strokeLinecap="round" />
              <line x1="350" y1="395" x2="350" y2="430" stroke={palette.skinShadow} strokeWidth="2.5" opacity="0.45" />
              {/* Sacred Thread (Janeu) */}
              <path d="M 294 368 Q 348 455 410 526" fill="none" stroke="#FEF9C3" strokeWidth="4.5" opacity="0.9" />
            </>
          )}
          {/* Upright Monk Robe Sash & Collar for Swami Vivekananda, vs Diagonal Uttariya for Ancient Acharya */}
          {isVivekananda ? (
            <g>
              <path d="M 322 356 Q 350 374 378 356 L 372 378 Q 350 390 328 378 Z" fill={palette.clothShadow} stroke={ink} strokeWidth="3" />
              <rect x="284" y="512" width="132" height="28" rx="6" fill={palette.clothHighlight} stroke={ink} strokeWidth="3.2" />
              <line x1="288" y1="526" x2="412" y2="526" stroke={palette.clothShadow} strokeWidth="3" />
            </g>
          ) : (
            isSage && (
              <path
                d="M 258 372 L 412 534 L 382 534 L 248 394 Z"
                fill={palette.clothHighlight}
                stroke={ink}
                strokeWidth="2.8"
              />
            )
          )}
        </g>
      )}

      {/* Chest Necklaces, Malas & Vasuki Cobra */}
      {neckOrnament === 'vaijayanti_mala' && (
        <g id="ornament_vaijayanti">
          <path d="M 296 368 Q 350 518 404 368" fill="none" stroke="#FACC15" strokeWidth="10" strokeDasharray="10 5" strokeLinecap="round" />
          <path d="M 304 368 Q 350 495 396 368" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="6 6" />
          <polygon points="350,418 360,432 350,446 340,432" fill="#EF4444" stroke={ink} strokeWidth="2.2" />
        </g>
      )}
      {neckOrnament === 'pearl_kantha' && (
        <g id="ornament_pearl_kantha">
          <path d="M 308 366 Q 350 415 392 366" fill="none" stroke="#FEF9C3" strokeWidth="7" strokeDasharray="5 4" strokeLinecap="round" />
          <path d="M 298 370 Q 350 442 402 370" fill="none" stroke="#FACC15" strokeWidth="6" strokeDasharray="6 4" strokeLinecap="round" />
        </g>
      )}
      {neckOrnament === 'gold_haar' && (
        <path d="M 305 368 Q 350 426 395 368" fill="none" stroke={goldGrad} strokeWidth="11" strokeLinecap="round" />
      )}
      {neckOrnament === 'rudraksha_vasuki' && (
        <g id="ornament_shiva_vasuki">
          {/* Sacred Rudraksha Mala */}
          <path d="M 304 368 Q 350 434 396 368" fill="none" stroke="#78350F" strokeWidth="9" strokeDasharray="7 5" strokeLinecap="round" />
          {/* Coiled Blue Cobra Vasuki around Neck */}
          <path d="M 310 362 Q 350 385 394 358 Q 422 346 436 332" fill="none" stroke="#1E40AF" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="438" cy="328" rx="12" ry="8" fill="#2563EB" stroke={ink} strokeWidth="2.4" transform="rotate(-25 438 328)" />
        </g>
      )}

      {/* Ornate Golden Kamarbandh Waist Belt */}
      {!isSage && (
        <g id="waist_kamarbandh">
          <rect x="284" y="516" width="132" height="22" rx="8" fill={goldGrad} stroke={ink} strokeWidth="3.2" />
          <circle cx="350" cy="527" r="9" fill="#DC2626" stroke={ink} strokeWidth="2.2" />
        </g>
      )}
    </g>
  );
};

export const ArticulatedFKArm: React.FC<{
  side: 'left' | 'right';
  shoulderX: number;
  shoulderY: number;
  spec: FKArmSpec;
  profile: LegendProfile;
  weapon?: LegendWeaponType;
  frame: number;
  fps: number;
}> = ({ side, shoulderX, shoulderY, spec, profile, weapon = 'none', frame, fps }) => {
  const { id, palette, bodySilhouette } = profile;
  const ink = palette.outlineInk;
  const skinGrad = `url(#skinGrad_${id})`;
  const clothGrad = `url(#clothGrad_${id})`;
  const goldGrad = `url(#goldMetal_${id})`;

  const isSleeved =
    bodySilhouette === 'maratha_rajput_regal' ||
    bodySilhouette === 'warrior_queen' ||
    id === 'vivekananda';
  const upperLen = 88;
  const foreLen = 82;

  const uRad = (spec.upperDeg * Math.PI) / 180;
  const fRad = (spec.foreDeg * Math.PI) / 180;

  const elbowX = shoulderX + Math.sin(uRad) * upperLen;
  const elbowY = shoulderY + Math.cos(uRad) * upperLen;
  const wristX = elbowX + Math.sin(fRad) * foreLen;
  const wristY = elbowY + Math.cos(fRad) * foreLen;

  // Unit perpendicular vectors for anatomical muscular tapering
  const unx = Math.cos(uRad);
  const uny = -Math.sin(uRad);
  const fnx = Math.cos(fRad);
  const fny = -Math.sin(fRad);

  const fillTone = isSleeved ? clothGrad : skinGrad;

  // Upper arm path: Deltoid (17) -> Bicep Swell (18) -> Elbow (13)
  const midUX = (shoulderX + elbowX) / 2;
  const midUY = (shoulderY + elbowY) / 2;
  const upperPath = `
    M ${shoulderX + unx * 16} ${shoulderY + uny * 16}
    Q ${midUX + unx * 18} ${midUY + uny * 18} ${elbowX + unx * 12.5} ${elbowY + uny * 12.5}
    Q ${elbowX} ${elbowY + 5} ${elbowX - unx * 12.5} ${elbowY - uny * 12.5}
    Q ${midUX - unx * 16} ${midUY - uny * 16} ${shoulderX - unx * 16} ${shoulderY - uny * 16}
    A 16 16 0 1 1 ${shoulderX + unx * 16} ${shoulderY + uny * 16}
    Z
  `;

  // Forearm path: Elbow Fore Swell (13.5) -> Slim Wrist (8.5)
  const midFX = elbowX + Math.sin(fRad) * (foreLen * 0.35);
  const midFY = elbowY + Math.cos(fRad) * (foreLen * 0.35);
  const forePath = `
    M ${elbowX + fnx * 13} ${elbowY + fny * 13}
    Q ${midFX + fnx * 14} ${midFY + fny * 14} ${wristX + fnx * 8.5} ${wristY + fny * 8.5}
    L ${wristX - fnx * 8.5} ${wristY - fny * 8.5}
    Q ${midFX - fnx * 13} ${midFY - fny * 13} ${elbowX - fnx * 13} ${elbowY - fny * 13}
    A 13 13 0 1 1 ${elbowX + fnx * 13} ${elbowY + fny * 13}
    Z
  `;

  // Hand rotation aligned with forearm direction (0 deg = pointing straight down)
  const handRot = -spec.foreDeg;

  return (
    <g id={`fk_arm_${side}`}>
      {/* Sculpted Muscular Upper Arm */}
      <path d={upperPath} fill={fillTone} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />

      {/* Contoured Golden Bajubandh Armlet Band (perpendicular to upper arm) */}
      {!isSleeved && (
        <g transform={`translate(${midUX}, ${midUY}) rotate(${-spec.upperDeg})`}>
          <rect x="-17.5" y="-4.5" width="35" height="9" rx="4" fill={goldGrad} stroke={ink} strokeWidth="2.2" />
          <circle cx="0" cy="0" r="3" fill="#DC2626" />
        </g>
      )}

      {/* Sculpted Forearm */}
      <path d={forePath} fill={fillTone} stroke={ink} strokeWidth="3.3" strokeLinejoin="round" />

      {/* Contoured Golden Wrist Kankana / Royal Cuff */}
      {id !== 'vivekananda' && (
        <g transform={`translate(${wristX - Math.sin(fRad) * 6}, ${wristY - Math.cos(fRad) * 6}) rotate(${handRot})`}>
          <rect x="-10" y="-4" width="20" height="8" rx="3" fill={goldGrad} stroke={ink} strokeWidth="2.2" />
        </g>
      )}

      {/* HandSocket + Weapon Grip */}
      <g transform={`translate(${wristX}, ${wristY})`}>
        {weapon !== 'none' && (
          <g transform={side === 'left' && weapon === 'bhavani_talwar' ? 'scale(-1, 1)' : undefined}>
            <LegendWeapon weapon={weapon} frame={frame} fps={fps} ink={ink} />
          </g>
        )}

        {/* Sculpted Anatomical Palm & Thumb (never a circle lollipop) */}
        <g transform={`rotate(${handRot})`}>
          {spec.handMode === 'fist' ? (
            <g>
              <rect x="-9" y="-2" width="18" height="17" rx="6" fill={skinGrad} stroke={ink} strokeWidth="2.8" />
              <line x1="-3" y1="6" x2="7" y2="6" stroke={palette.skinShadow} strokeWidth="2" />
            </g>
          ) : (
            <g>
              <path
                d="M -8 -2 C -10 8 -8 18 0 19 C 8 18 10 8 8 -2 Z"
                fill={skinGrad}
                stroke={ink}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              {/* Thumb silhouette */}
              <path d="M 7 1 Q 14 5 11 11" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 7 1 Q 14 5 11 11" fill="none" stroke={palette.skinBase} strokeWidth="2" strokeLinecap="round" />
              {(spec.handMode === 'pointing' || spec.handMode === 'chakra_finger') && (
                <path d="M -2 -1 L -3 -26 L 3 -26 L 3 -1 Z" fill={skinGrad} stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
              )}
              {spec.handMode === 'mudra' && (
                <circle cx="5" cy="14" r="3.8" fill="none" stroke={ink} strokeWidth="2.2" />
              )}
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
