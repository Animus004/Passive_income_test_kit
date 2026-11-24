/**
 * Centralized Genre Theme Registry (Layer 1 of the 5-Layer Architectural Firewall)
 * 
 * Physically isolates modern vs ancient prompt worlds so the LLM never sees
 * ancient royalty examples when generating modern scenes, and vice-versa.
 */

export const GENRE_REGISTRY = {
  modern_finance: {
    id: 'modern_finance',
    name: 'Modern Finance & Money Traps',
    era: 'modern',
    allowedRoles: ['modern_creator', 'modern_commoner'],
    forbiddenRoles: ['shakuni', 'duryodhana', 'pandava', 'kaurava', 'chanakya', 'king', 'ancient_commoner', 'commoner'],
    allowedHeads: ['slick', 'hoodie', 'curly', 'beanie', 'messy_bedhead', 'bald', 'ponytail', 'bob_cut'],
    forbiddenHeads: ['royal_mukut', 'royal_pagdi', 'shakuni_cowl', 'chanakya_shikha'],
    allowedAttires: ['default'],
    forbiddenAttires: ['warrior_kavach', 'dark_shawl', 'dhoti_janeu', 'royal_mala'],
    allowedEnvironments: ['office_desk', 'modern_finance', 'cozy_bedroom', 'cyber_trading_desk'],
    allowedProps: ['salary_slip_drain', 'credit_card_trap', 'emi_chains_lock', 'macbook_pro', 'iphone', 'coffee_mug', 'piggy_bank_break'],
    forbiddenProps: ['chanakya_scroll', 'vault_b_door', 'mystic_diya_flame', 'sword_shield_emblem', 'shakuni_dice', 'poison_kanya_goblet'],
    allowedConnectors: ['tension_cords', 'emi_chains'],
    allowCrowns: false,
    goldenMasterA: `
// GOLDEN MASTER A: ARCHETYPE B (CLEAN SPLIT DUO - MODERN FINANCE)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const SceneExampleDuo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="office_desk">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#DC2626', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>💳</span>
            <span>CREDIT CARD TRAP • MINIMUM DUE</span>
          </div>

          <HeroProp type="salary_slip_drain" x={340} y={960} scale={1.15} shakeIntensity={propSpring} />

          <div style={{ opacity: charSpring, transform: \`translateY(\${charSlide}px)\` }}>
            <CharacterRig
              era="modern"
              role="modern_creator"
              head="curly"
              pose="shock_hands_on_head"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EF4444"
              breathing={true}
              blinking={true}
            />
          </div>

          <StageConnector
            type="tension_cords"
            fromX={760}
            fromY={640}
            toX={340}
            toY={860}
            tension={1.0}
            tugIntensity={handTug}
            attachCrowns={false}
            opacity={charSpring}
          />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`,
    goldenMasterB: `
// GOLDEN MASTER B: ARCHETYPE A (SOLO HERO MONOLITH - MODERN FINANCE)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, HeroProp } from '../../components/rigs';

export const SceneExampleSolo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } });
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="modern_finance">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#D97706', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>💸</span>
            <span>EMI TRAP • 36 MONTHS PRISON</span>
          </div>

          <HeroProp type="credit_card_trap" x={540} y={820} scale={1.38} shakeIntensity={propSpring} />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`,
    goldenMasterC: `
// GOLDEN MASTER C: ARCHETYPE D (CONFRONTATION - MODERN FINANCE)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp } from '../../components/rigs';

export const SceneExampleConfrontation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const centerPropSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } });
  const leftCharSpring = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 15, stiffness: 160 } });
  const rightCharSpring = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 15, stiffness: 160 } });
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="office_desk">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#B91C1C', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>⚖️</span>
            <span>SALARY VS EXPENSES • THE GAP</span>
          </div>

          <div style={{ opacity: leftCharSpring }}>
            <CharacterRig
              era="modern"
              role="modern_creator"
              head="curly"
              pose="shock_hands_on_head"
              x={280}
              y={940}
              scale={1.1}
              clothColor="#EF4444"
              breathing={true}
              blinking={true}
            />
          </div>

          <HeroProp type="salary_slip_drain" x={540} y={860} scale={1.05} shakeIntensity={centerPropSpring} />

          <div style={{ opacity: rightCharSpring }}>
            <CharacterRig
              era="modern"
              role="modern_creator"
              head="slick"
              pose="wealth_proud_chest"
              x={800}
              y={940}
              scale={1.1}
              clothColor="#10B981"
              breathing={true}
              blinking={true}
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`
  },

  silicon_valley_tech: {
    id: 'silicon_valley_tech',
    name: 'Silicon Valley Tech & Startup Burnout',
    era: 'modern',
    allowedRoles: ['modern_creator', 'modern_commoner'],
    forbiddenRoles: ['shakuni', 'duryodhana', 'pandava', 'kaurava', 'chanakya', 'king', 'ancient_commoner', 'commoner'],
    allowedHeads: ['hoodie', 'slick', 'curly', 'beanie', 'messy_bedhead', 'bald'],
    forbiddenHeads: ['royal_mukut', 'royal_pagdi', 'shakuni_cowl', 'chanakya_shikha'],
    allowedAttires: ['default'],
    forbiddenAttires: ['warrior_kavach', 'dark_shawl', 'dhoti_janeu', 'royal_mala'],
    allowedEnvironments: ['office_desk', 'cozy_bedroom', 'cyber_server_room'],
    allowedProps: ['macbook_pro', 'server_rack_overheat', 'coffee_mug', 'bug_tracker_red', 'slack_ping_bell'],
    forbiddenProps: ['chanakya_scroll', 'vault_b_door', 'sword_shield_emblem', 'shakuni_dice', 'poison_kanya_goblet'],
    allowedConnectors: ['tension_cords', 'network_cables'],
    allowCrowns: false,
    goldenMasterA: `
// GOLDEN MASTER A: ARCHETYPE B (CLEAN SPLIT DUO - TECH BURNOUT)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp } from '../../components/rigs';

export const SceneExampleDuo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="office_desk">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#DC2626', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>💻</span>
            <span>2 AM DEPLOYMENT CRASH • PRODUCTION IS DOWN</span>
          </div>

          <HeroProp type="macbook_pro" x={340} y={960} scale={1.15} shakeIntensity={propSpring} />

          <div style={{ opacity: charSpring, transform: \`translateY(\${charSlide}px)\` }}>
            <CharacterRig
              era="modern"
              role="modern_creator"
              head="hoodie"
              pose="shock_hands_on_head"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#2563EB"
              breathing={true}
              blinking={true}
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`,
    goldenMasterB: `
// GOLDEN MASTER B: ARCHETYPE A (SOLO HERO MONOLITH - TECH BURNOUT)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, HeroProp } from '../../components/rigs';

export const SceneExampleSolo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } });
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="office_desk">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#EA580C', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>🔥</span>
            <span>SERVER MELTDOWN • 99.9% FAILURE</span>
          </div>

          <HeroProp type="server_rack_overheat" x={540} y={820} scale={1.38} shakeIntensity={propSpring} />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`,
    goldenMasterC: `
// GOLDEN MASTER C: ARCHETYPE D (CONFRONTATION - TECH BURNOUT)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp } from '../../components/rigs';

export const SceneExampleConfrontation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const centerPropSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } });
  const leftCharSpring = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 15, stiffness: 160 } });
  const rightCharSpring = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 15, stiffness: 160 } });
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="office_desk">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#4338CA', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>⚡</span>
            <span>JUNIOR DEV VS LEAD ARCHITECT</span>
          </div>

          <div style={{ opacity: leftCharSpring }}>
            <CharacterRig
              era="modern"
              role="modern_creator"
              head="beanie"
              pose="shock_hands_on_head"
              x={280}
              y={940}
              scale={1.1}
              clothColor="#DC2626"
              breathing={true}
              blinking={true}
            />
          </div>

          <HeroProp type="macbook_pro" x={540} y={860} scale={1.05} shakeIntensity={centerPropSpring} />

          <div style={{ opacity: rightCharSpring }}>
            <CharacterRig
              era="modern"
              role="modern_creator"
              head="slick"
              pose="wealth_proud_chest"
              x={800}
              y={940}
              scale={1.1}
              clothColor="#1E293B"
              glasses={true}
              breathing={true}
              blinking={true}
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`
  },

  chanakya_ancient_lore: {
    id: 'chanakya_ancient_lore',
    name: 'Ancient Indian Strategy & Lore',
    era: 'ancient',
    allowedRoles: ['chanakya', 'shakuni', 'duryodhana', 'pandava', 'kaurava', 'king', 'ancient_commoner'],
    forbiddenRoles: ['modern_creator', 'modern_commoner'],
    allowedHeads: ['chanakya_shikha', 'royal_mukut', 'royal_pagdi', 'shakuni_cowl', 'messy_bedhead', 'bald'],
    forbiddenHeads: ['hoodie', 'beanie', 'slick'],
    allowedAttires: ['warrior_kavach', 'dark_shawl', 'dhoti_janeu', 'royal_mala', 'default'],
    forbiddenAttires: [],
    allowedEnvironments: ['ancient_palace', 'temple_vault', 'subterranean_dungeon_vault'],
    allowedProps: ['chanakya_scroll', 'vault_b_door', 'mystic_diya_flame', 'sword_shield_emblem', 'shakuni_dice', 'poison_kanya_goblet'],
    forbiddenProps: ['salary_slip_drain', 'credit_card_trap', 'emi_chains_lock', 'macbook_pro', 'iphone', 'server_rack_overheat'],
    allowedConnectors: ['tension_cords', 'puppet_strings', 'iron_chains'],
    allowCrowns: true,
    goldenMasterA: `
// GOLDEN MASTER A: ARCHETYPE B (CLEAN SPLIT DUO - ANCIENT CHANAKYA)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

export const SceneExampleDuo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });
  const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
  const charSlide = interpolate(charSpring, [0, 1], [35, 0]);
  const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="ancient_palace">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#DC2626', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>📜</span>
            <span>CHANAKYA NITI • RULE 1: SATARKTA</span>
          </div>

          <HeroProp type="chanakya_scroll" x={340} y={960} scale={1.15} shakeIntensity={propSpring} />

          <div style={{ opacity: charSpring, transform: \`translateY(\${charSlide}px)\` }}>
            <CharacterRig
              era="ancient"
              role="chanakya"
              pose="chanakya_pointing"
              x={760}
              y={940}
              scale={1.15}
              clothColor="#EA580C"
              breathing={true}
              blinking={true}
            />
          </div>

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
`,
    goldenMasterB: `
// GOLDEN MASTER B: ARCHETYPE A (SOLO HERO MONOLITH - ANCIENT VAULT)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, HeroProp } from '../../components/rigs';

export const SceneExampleSolo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } });
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="temple_vault">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#D97706', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>🐍</span>
            <span>VAULT B • THE NAGA LOCK</span>
          </div>

          <HeroProp type="vault_b_door" x={540} y={820} scale={1.38} shakeIntensity={propSpring} />
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`,
    goldenMasterC: `
// GOLDEN MASTER C: ARCHETYPE D (CONFRONTATION - ANCIENT EPIC)
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RoomEnvironment, CharacterRig, HeroProp } from '../../components/rigs';

export const SceneExampleConfrontation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  const centerPropSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } });
  const leftCharSpring = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 15, stiffness: 160 } });
  const rightCharSpring = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 15, stiffness: 160 } });
  const cameraZoom = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>
        <RoomEnvironment type="subterranean_dungeon_vault">
          <div style={{
            position: 'absolute', top: 130, left: '50%',
            transform: \`translateX(-50%) scale(\${badgeSpring})\`,
            backgroundColor: '#B91C1C', color: '#FFFFFF',
            border: '8px solid #000000', borderRadius: 36,
            padding: '14px 40px', fontSize: 32, fontWeight: 900,
            boxShadow: '0 10px 0 #000000', zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'
          }}>
            <span>⚔️</span>
            <span>THE DIVIDE • BROTHER AGAINST BROTHER</span>
          </div>

          <div style={{ opacity: leftCharSpring }}>
            <CharacterRig
              era="ancient"
              role="pandava"
              pose="standing_dazed"
              x={280}
              y={940}
              scale={1.1}
              clothColor="#1E3A8A"
              breathing={true}
              blinking={true}
            />
          </div>

          <HeroProp type="sword_shield_emblem" x={540} y={860} scale={1.05} shakeIntensity={centerPropSpring} />

          <div style={{ opacity: rightCharSpring }}>
            <CharacterRig
              era="ancient"
              role="duryodhana"
              pose="wealth_proud_chest"
              x={800}
              y={940}
              scale={1.1}
              clothColor="#991B1B"
              breathing={true}
              blinking={true}
            />
          </div>
        </RoomEnvironment>
      </div>
    </AbsoluteFill>
  );
};
`
  }
};

export function detectGenre(topicText) {
  const t = (topicText || '').toLowerCase();
  if (t.includes('finance') || t.includes('salary') || t.includes('emi') || t.includes('credit card') || t.includes('money') || t.includes('tax') || t.includes('debt') || t.includes('savings') || t.includes('cibil')) {
    return GENRE_REGISTRY.modern_finance;
  }
  if (t.includes('tech') || t.includes('code') || t.includes('developer') || t.includes('burnout') || t.includes('server') || t.includes('startup') || t.includes('slack') || t.includes('silicon')) {
    return GENRE_REGISTRY.silicon_valley_tech;
  }
  // Default to ancient lore
  return GENRE_REGISTRY.chanakya_ancient_lore;
}
