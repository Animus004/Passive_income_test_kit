import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LEGEND_PROFILES } from './catalog';
import { LegendCharacterRigProps, resolveLegendId } from './types';
import {
  ArticulatedFKArm,
  getPoseKinematics,
  LegendAuraHalo,
  LegendBackCape,
  LegendBodyAndDhoti,
  LegendSculptedHead,
} from './LegendAnatomy';
import { LegendHeadgearBack, LegendHeadgearFront } from './LegendHeadgear';

/**
 * Heroic Indian Legends Character Rig (4.8-Head Anatomical Stylized Puppet).
 * Dedicated strictly to legendary mythological & historical icons, isolated from
 * everyday comedy characters in CharacterRig.tsx.
 */
export const LegendCharacterRig: React.FC<LegendCharacterRigProps> = ({
  legendId,
  pose: explicitPose,
  expression: explicitExpression,
  lookAt = 'center',
  weapon: explicitWeapon,
  x = 540,
  y = 920,
  scale = 1.0,
  rotation = 0,
  opacity = 1.0,
  flipHorizontal = false,
  beatWords = [],
  beatStartSec = 0,
  auraIntensity = 1.0,
  breathing = true,
  blinking = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const resolvedId = resolveLegendId(legendId) || 'krishna';
  const profile = LEGEND_PROFILES[resolvedId];
  const { palette } = profile;

  const pose = explicitPose ?? profile.defaultPose;
  const expression = explicitExpression ?? profile.defaultExpression;
  const weapon =
    explicitWeapon ??
    (pose === 'playing_bansuri'
      ? 'bansuri'
      : pose === 'holding_scroll'
      ? 'arthashastra_scroll'
      : profile.defaultWeapon);

  // Breathing cadence & natural organic head bob
  const breathY = breathing ? Math.sin((frame / fps) * Math.PI * 1.6) * 4 : 0;
  const headBobY = breathing ? Math.sin((frame / fps) * Math.PI * 2.2) * 2.2 : 0;
  const headTilt = breathing ? Math.sin((frame / fps) * Math.PI * 1.1) * 1.8 : 0;

  // Natural blinking (3-frame organic blink every ~105 frames)
  const blinkCycle = frame % 105;
  const isBlinking = blinking && blinkCycle >= 101 && blinkCycle <= 103;

  // Audio-Driven Lip-Sync from Real Manifest BeatWords Timestamps
  const globalTimeSec = beatStartSec + frame / fps;
  let speechOpen = 0;
  if (beatWords && beatWords.length > 0) {
    const activeToken = beatWords.find(
      (w) => globalTimeSec >= w.start && globalTimeSec <= w.end
    );
    if (activeToken) {
      // Smooth syllable articulation cadence inside spoken word
      speechOpen = 0.35 + Math.abs(Math.sin(frame * 0.72)) * 0.65;
    }
  } else if (expression === 'calm_updesh' || expression === 'orator_fire') {
    // Gentle cadence only when explicitly delivering speech without word tokens
    speechOpen = frame % 12 > 3 ? 0.3 + Math.abs(Math.sin(frame * 0.6)) * 0.5 : 0;
  }

  const kinematics = getPoseKinematics(pose, frame, fps, weapon, profile.id);

  const leftArmWeapon =
    kinematics.weaponMount === 'left'
      ? weapon
      : profile.id === 'maharana_pratap' && pose === 'warrior_stance'
      ? 'dhal_shield'
      : profile.id === 'lakshmibai' && weapon === 'twin_talwars'
      ? 'bhavani_talwar'
      : 'none';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + breathY,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg) ${
          flipHorizontal ? 'scaleX(-1)' : ''
        }`,
        transformOrigin: 'center center',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="700"
        height="920"
        viewBox="0 0 700 920"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Heroic Skin 2.5D Cel Gradient */}
          <linearGradient id={`skinGrad_${profile.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.skinLight} />
            <stop offset="55%" stopColor={palette.skinBase} />
            <stop offset="100%" stopColor={palette.skinShadow} />
          </linearGradient>

          {/* Silk Garment Shading Gradient */}
          <linearGradient id={`clothGrad_${profile.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.clothHighlight} />
            <stop offset="50%" stopColor={palette.clothPrimary} />
            <stop offset="100%" stopColor={palette.clothShadow} />
          </linearGradient>

          {/* Brushed Imperial Gold Gradient */}
          <linearGradient id={`goldMetal_${profile.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor={palette.trimGold} />
            <stop offset="100%" stopColor={palette.trimGoldDark} />
          </linearGradient>

          {/* Armor Plate Gradient */}
          <linearGradient id={`armorGrad_${profile.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor={palette.armorBase || palette.trimGold} />
            <stop offset="100%" stopColor={palette.armorShadow || palette.trimGoldDark} />
          </linearGradient>

          {/* Luminous Eye Iris Gradient */}
          <radialGradient id={`irisGrad_${profile.id}`}>
            <stop offset="0%" stopColor={palette.eyeIris} />
            <stop offset="100%" stopColor="#090D16" />
          </radialGradient>

          {/* Ambient Aura Halo Radial Gradient */}
          <radialGradient id={`auraGrad_${profile.id}`}>
            <stop offset="0%" stopColor={palette.auraSecondary} stopOpacity="0.85" />
            <stop offset="45%" stopColor={palette.auraPrimary} stopOpacity="0.35" />
            <stop offset="100%" stopColor={palette.auraPrimary} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* LAYER 1: Cosmic Prabhavali / Martial Sunburst Halo */}
        <LegendAuraHalo
          profile={profile}
          frame={frame}
          fps={fps}
          intensity={auraIntensity}
        />

        {/* LAYER 2: Upper Body Articulated Rig Root */}
        <g transform={`rotate(${kinematics.torsoTiltDeg} 350 530)`}>
          {/* Back Hair / Shikha / Cowl + Flowing Cape & Hanuman Tail */}
          <LegendHeadgearBack profile={profile} frame={frame} fps={fps} />
          <LegendBackCape profile={profile} frame={frame} fps={fps} />

          {/* Heroic Draped Body, Armor, Dhoti & Grounded Feet */}
          <LegendBodyAndDhoti profile={profile} frame={frame} fps={fps} />

          {/* Left Arm rendered cleanly in front of Cape/Body for Shields, Scrolls & Twin Swords */}
          <ArticulatedFKArm
            side="left"
            shoulderX={248}
            shoulderY={380}
            spec={kinematics.leftArm}
            profile={profile}
            weapon={leftArmWeapon}
            frame={frame}
            fps={fps}
          />

          {/* Sculpted Articulated Head Group (Neck Pivot (350, 325)) */}
          <g transform={`translate(0, ${headBobY}) rotate(${headTilt} 350 325)`}>
            <LegendSculptedHead
              profile={profile}
              expression={expression}
              lookAt={lookAt}
              speechOpen={speechOpen}
              isBlinking={isBlinking}
            />
            <LegendHeadgearFront profile={profile} frame={frame} fps={fps} />
          </g>

          {/* Foreground Action Arm & Primary Weapon */}
          <ArticulatedFKArm
            side="right"
            shoulderX={452}
            shoulderY={380}
            spec={kinematics.rightArm}
            profile={profile}
            weapon={
              kinematics.weaponMount === 'right'
                ? weapon
                : pose === 'warrior_stance' && weapon === 'twin_talwars'
                ? 'bhavani_talwar'
                : 'none'
            }
            frame={frame}
            fps={fps}
          />
        </g>
      </svg>
    </div>
  );
};
