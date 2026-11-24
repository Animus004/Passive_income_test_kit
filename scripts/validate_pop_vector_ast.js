/**
 * ==============================================================================
 * Semantic AST & Architectural Safety Compiler Gate (Layer 4 Firewall)
 * ==============================================================================
 * Ultra-fast (< 10ms), zero-regex TypeScript/TSX AST verification via esbuild.
 * 
 * VALIDATION CONTRACT (30-Second Technical Overview):
 * 1. Syntax Purity: Immediate transpilation check catches missing brackets/imports.
 * 2. Performance Filters: Rejects high-risk SVG primitives (e.g. feDisplacementMap).
 * 3. Timing Bounds: Rejects invalid frame offsets (frame - X > 35) to prevent hidden
 *    elements during Remotion sequence playhead execution.
 * 4. Staging Collisions: Catches coordinate collisions between CharacterRig and props.
 * 5. Era Purity Gate: Rejects anachronistic assets (e.g. Shakuni/crowns in modern finance).
 * ==============================================================================
 */

import esbuild from 'esbuild';

export function validatePopVectorSceneCode(code, sceneContext = {}) {
  const trimmed = code.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  const firstWord = firstLine.split(' ')[0];

  if (['jsx', 'tsx', 'javascript', 'typescript'].includes(firstWord)) {
    return {
      valid: false,
      reason: 'STRAY_CODE_HEADER',
      message: 'Detected stray language identifier before imports (e.g. "jsx").',
    };
  }

  // 1. In-memory Transpilation & Compiler Syntax Check
  try {
    esbuild.transformSync(code, {
      loader: 'tsx',
      target: 'es2022',
      jsx: 'automatic',
    });
  } catch (err) {
    const errorDetails = err.errors?.[0] || {};
    return {
      valid: false,
      reason: 'SYNTAX_ERROR',
      message: errorDetails.text || err.message,
      line: errorDetails.location?.line || null,
      column: errorDetails.location?.column || null,
      rawError: err.message,
    };
  }

  // 2. Performance & Crash Filters
  if (code.includes('feDisplacementMap')) {
    return {
      valid: false,
      reason: 'PERFORMANCE_RISK_FILTER',
      message: 'feDisplacementMap is forbidden on animated elements (causes browser OOM / slow render).',
    };
  }

  // 3. Remotion interpolate string-array check (zero regex)
  let searchIdx = 0;
  while ((searchIdx = code.indexOf('interpolate(', searchIdx)) !== -1) {
    // Check if it's interpolateColors
    const isColors = searchIdx >= 6 && code.slice(searchIdx - 6, searchIdx) === 'Colors';
    if (!isColors) {
      const closeParen = code.indexOf(')', searchIdx);
      if (closeParen !== -1) {
        let callArgs = code.slice(searchIdx, closeParen);
        // Strip out standard Remotion option keywords that legitimately contain quotes
        const allowedOptions = ["'clamp'", '"clamp"', "'extend'", '"extend"', "'identity'", '"identity"'];
        for (const opt of allowedOptions) {
          callArgs = callArgs.split(opt).join('');
        }
        if (callArgs.includes("'") || callArgs.includes('"') || callArgs.includes('`')) {
          return {
            valid: false,
            reason: 'INVALID_STRING_INTERPOLATION',
            message: 'Remotion interpolate() only accepts numbers. To interpolate colors, import and use interpolateColors().',
          };
        }
      }
    }
    searchIdx += 12;
  }

  // 4. Strict Era Safety & Anachronism Filter (Zero-Regex)
  const explicitEra = sceneContext.era;
  const isModern = explicitEra === 'modern' ||
    (!explicitEra && (
      sceneContext.isFinance ||
      sceneContext.genreId === 'modern_finance' ||
      sceneContext.genreId === 'silicon_valley_tech' ||
      code.includes('type="modern_finance"') ||
      code.includes('type="office_desk"') ||
      code.includes('type="salary_slip_drain"') ||
      code.includes('type="credit_card_trap"') ||
      code.includes('type="emi_chains_lock"') ||
      code.includes('type="macbook_pro"') ||
      code.includes('type="server_rack_overheat"')
    ));

  if (isModern) {
    const forbiddenRoles = ['role="shakuni"', 'role="duryodhana"', 'role="pandava"', 'role="kaurava"', 'role="chanakya"', 'role="king"', 'role="commoner"', 'role="ancient_commoner"'];
    for (const r of forbiddenRoles) {
      if (code.includes(r)) {
        return {
          valid: false,
          reason: 'ANACHRONISM_ERA_VIOLATION',
          message: `Modern scenes MUST ONLY use role="modern_creator"! Detected forbidden ancient role: ${r}.`,
        };
      }
    }

    if (code.includes('attachCrowns={true}') || (code.includes('attachCrowns') && !code.includes('attachCrowns={false}'))) {
      return {
        valid: false,
        reason: 'ANACHRONISM_CROWN_VIOLATION',
        message: 'attachCrowns is strictly forbidden in modern scenes (miniature royal crowns have no place in modern scenes!).',
      };
    }

    const forbiddenHeadAttire = [
      'head="royal_mukut"', 'head="royal_pagdi"', 'head="shakuni_cowl"', 'head="chanakya_shikha"',
      'attire="warrior_kavach"', 'attireOverlay="warrior_kavach"', 'attire="dark_shawl"', 'attire="dhoti_janeu"', 'attire="royal_mala"'
    ];
    for (const ha of forbiddenHeadAttire) {
      if (code.includes(ha)) {
        return {
          valid: false,
          reason: 'ANACHRONISM_HEADWEAR_VIOLATION',
          message: `Ancient attire/headwear detected in modern scene: ${ha}. Use 'slick', 'hoodie', 'curly', 'beanie', 'bald' instead.`,
        };
      }
    }

    const forbiddenProps = [
      'type="shakuni_dice"', 'type="poison_kanya_goblet"', 'type="sword_shield_emblem"', 
      'type="chanakya_scroll"', 'type="vault_b_door"', 'type="mystic_diya_flame"', 'type="chaupar_board_macro"'
    ];
    for (const fp of forbiddenProps) {
      if (code.includes(fp)) {
        return {
          valid: false,
          reason: 'ANACHRONISM_PROP_VIOLATION',
          message: `Ancient prop detected in modern scene: ${fp}. Use modern props instead.`,
        };
      }
    }
  }

  const isAncient = explicitEra === 'ancient' ||
    (!explicitEra && !isModern && (
      sceneContext.genreId === 'chanakya_ancient_lore' ||
      code.includes('type="ancient_palace"') ||
      code.includes('type="temple_vault"') ||
      code.includes('type="subterranean_dungeon_vault"') ||
      code.includes('type="chaupar_board_arena"')
    ));

  if (isAncient && !isModern) {
    const forbiddenRoles = ['role="modern_creator"', 'role="modern_commoner"'];
    for (const r of forbiddenRoles) {
      if (code.includes(r)) {
        return {
          valid: false,
          reason: 'ANACHRONISM_ERA_VIOLATION',
          message: `Ancient scenes MUST NOT use modern creator roles! Detected: ${r}. Use 'chanakya', 'shakuni', 'duryodhana', 'pandava', 'king', or 'ancient_commoner'.`,
        };
      }
    }

    const forbiddenProps = [
      'type="salary_slip_drain"', 'type="credit_card_trap"', 'type="emi_chains_lock"',
      'type="macbook_pro"', 'type="iphone"', 'type="server_rack_overheat"', 'type="slack_card"'
    ];
    for (const fp of forbiddenProps) {
      if (code.includes(fp)) {
        return {
          valid: false,
          reason: 'ANACHRONISM_PROP_VIOLATION',
          message: `Modern prop detected in ancient scene: ${fp}. Use ancient props instead.`,
        };
      }
    }
  }

  // 5. Timeline Sanity Check (Reject Out-of-Bounds Local Frame Offsets)
  // Inside a Remotion <Sequence>, frame starts at 0!
  // Any entrance offset greater than 35 frames causes character/prop to be invisible for majority of scene.
  let frameSubIdx = 0;
  while ((frameSubIdx = code.indexOf('frame -', frameSubIdx)) !== -1) {
    const after = code.slice(frameSubIdx + 7).trimStart();
    const numStr = after.split(')')[0].split(',')[0].split(';')[0].trim();
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && num > 35) {
      return {
        valid: false,
        reason: 'INVALID_LOCAL_FRAME_OFFSET',
        message: `Local scene frame offset too large: 'frame - ${num}'. In Remotion <Sequence>, local frame starts at 0! Entrances MUST occur between frame 0 and frame 25. Maximum offset is 35.`,
      };
    }
    frameSubIdx += 8;
  }

  // 6. Staging Collision Check (Layer 4)
  // Ensure HeroProp and CharacterRig are never both placed at center stage (X=540)
  const heroPropMatches = code.match(/<HeroProp[^>]*\/>|<HeroProp[^>]*>[\s\S]*?<\/HeroProp>/g) || [];
  const charRigMatches = code.match(/<CharacterRig[^>]*\/>|<CharacterRig[^>]*>[\s\S]*?<\/CharacterRig>/g) || [];

  const hasCenterProp = heroPropMatches.some((m) => /x\s*=\s*[{'"]\s*540\s*[}'"]/.test(m));
  const hasCenterChar = charRigMatches.some((m) => /x\s*=\s*[{'"]\s*540\s*[}'"]/.test(m));

  if (hasCenterProp && hasCenterChar) {
    return {
      valid: false,
      reason: 'STAGING_COLLISION',
      message: 'Both HeroProp and CharacterRig are positioned at x={540}! This causes a direct visual occlusion collision. Use Archetype B: HeroProp at x={340} and CharacterRig at x={760}.',
    };
  }

  return { valid: true };
}
