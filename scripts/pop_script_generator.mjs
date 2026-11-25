/**
 * ==============================================================================
 * Shared Phase 1 Pop-Vector Showrunner & Retention Linter
 * ==============================================================================
 * Single source of truth for ERA_CATALOG, 16-Hero Legend Routing, Multi-LLM
 * script synthesis, Devanagari/Hinglish validation, and declarative manifest enrichment.
 */

import { generateWithCluster } from './gemini_cluster.js';

export const ERA_CATALOG = {
  ancient: {
    environments: [
      'ancient_palace',
      'durbar_throne_room',
      'temple_vault',
      'subterranean_dungeon_vault',
      'chaupar_board_arena',
      'puppet_stage_shadow',
    ],
    roles: [
      'krishna',
      'arjuna',
      'karna',
      'bhishma',
      'shakuni',
      'duryodhana',
      'rama',
      'hanuman',
      'shiva',
      'ravana',
      'chanakya',
      'shivaji',
      'maharana_pratap',
      'ashoka',
      'lakshmibai',
      'vivekananda',
      'ancient_commoner',
    ],
    props: [
      'sudarshan_chakra_divine',
      'gandiva_bow_arrow',
      'maratha_bhavani_talwar',
      'shivaji_rajmudra_seal',
      'holy_bhagavad_gita_scroll',
      'rudraksha_rosary_mala',
      'ashoka_lion_capital_statue',
      'karna_kavach_kundal',
      'mace_gada_battle',
      'bansuri_divine_flute',
      'mor_pankh_quill',
      'chanakya_scroll',
      'poison_kanya_goblet',
      'sword_shield_emblem',
      'two_faced_mask',
      'mystic_diya_flame',
      'ashoka_pillar_emblem',
      'gold_coins_overflow_chest',
      'vault_b_door',
      'shakuni_dice',
      'shattered_crown',
      'weighing_scales_deceit',
      'ancient_war_map_bharat',
      'tension_gauge_hud',
      'chaupar_board_macro',
      'puppet_control_cross',
      'puppet_strings',
      'golden_sparrow_bird',
      'viral_comment_bubbles',
    ],
  },
  modern: {
    environments: [
      'modern_finance',
      'office_desk',
      'bedroom_dark',
      'kitchen_morning',
    ],
    roles: [
      'modern_creator',
      'modern_commoner',
      'middle_class_uncle',
      'toxic_boss',
      'it_engineer',
      'genz_student',
    ],
    props: [
      'chai_glass_cutting',
      'pink_slip_termination',
      'corporate_id_badge',
      'broken_credit_chains',
      'salary_slip_drain',
      'bank_balance_zero',
      'emi_chains_lock',
      'credit_card_trap',
      'desk_laptop_open',
      'glowing_laptop',
      'smartphone_message',
      'bank_sms_alert',
      'coffee_mug_spill',
      'alarm_clock_retro',
      'siren_red_beacon',
      'slack_card',
      'typing_dots_bubble',
      'bomb_wires_defusal',
      'viral_comment_bubbles',
    ],
  },
};

const ANCIENT_KEYWORDS = [
  'chanakya', 'shakuni', 'krishna', 'shivaji', 'arjuna', 'karna', 'bhishma',
  'rama', 'hanuman', 'shiva', 'ravana', 'pratap', 'lakshmibai', 'vivekananda',
  'ashoka', 'kurukshetra', 'ramayana', 'vault', 'mahabharata', 'ancient',
  'palace', 'duryodhana', 'mauryan', 'maratha', 'haldighati', 'lanka', 'arthashastra',
];

export const DYNAMIC_ARCHETYPES = [
  'MACRO_HOOK_PUNCH',
  'DUAL_CONFRONTATION',
  'STRATEGY_MAP_ARENA',
  'DOCUMENT_EDICT_UNROLL',
  'TENSION_HUD_METER',
  'METAPHOR_MONOLITH',
  'CLEAN_SPLIT_DUO',
  'REACTION_CLOSEUP',
];

export function detectEra(topic, forcedEra = null) {
  if (forcedEra === 'ancient' || forcedEra === 'modern') return forcedEra;
  const lower = String(topic || '').toLowerCase();
  return ANCIENT_KEYWORDS.some((kw) => lower.includes(kw)) ? 'ancient' : 'modern';
}

function validateGeneratedScript(scriptData, era) {
  const catalog = ERA_CATALOG[era];
  if (!scriptData || !Array.isArray(scriptData.beats) || scriptData.beats.length < 7) {
    return { valid: false, reason: 'Need 7-8 beats in script.' };
  }

  // Enforce high-retention Shorts pacing (max ~45s total across all 8 beats)
  let totalHindiWords = 0;
  const archetypes = [];
  for (let i = 0; i < scriptData.beats.length; i++) {
    const b = scriptData.beats[i];
    const nar = String(b.narration_hi || '');
    const beatWords = nar.split(/\s+/).filter(Boolean).length;
    totalHindiWords += beatWords;
    if (beatWords > 20) {
      return { valid: false, reason: `Beat ${i + 1} narration too wordy (${beatWords} words, max 16 ideal). Tighten pacing for Shorts retention.` };
    }
    let devCount = 0;
    let latCount = 0;
    for (let c = 0; c < nar.length; c++) {
      const code = nar.charCodeAt(c);
      if (code >= 0x0900 && code <= 0x097f) devCount++;
      else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) latCount++;
    }
    if (devCount < 6 || latCount > devCount * 1.3) {
      return { valid: false, reason: `Beat ${i + 1} narration_hi lacks natural Devanagari (${nar.slice(0, 40)}).` };
    }

    // Clamp environment/prop/role inside era catalog so zero anachronisms slip through
    if (!catalog.environments.includes(b.environment)) {
      b.environment = catalog.environments[i % catalog.environments.length];
    }
    if (!catalog.props.includes(b.heroElement)) {
      b.heroElement = catalog.props[i % catalog.props.length];
    }
    if (!catalog.roles.includes(b.role)) {
      b.role = catalog.roles[0];
    }

    const arch = b.archetype || DYNAMIC_ARCHETYPES[i % DYNAMIC_ARCHETYPES.length];
    b.archetype = arch;
    archetypes.push(arch);
  }

  if (totalHindiWords > 138) {
    return { valid: false, reason: `Total narration too long (${totalHindiWords} words). Keep crisp under 130 words (~36-45s total).` };
  }

  // Prevent consecutive identical archetypes
  for (let i = 1; i < archetypes.length; i++) {
    if (archetypes[i] === archetypes[i - 1]) {
      scriptData.beats[i].archetype = DYNAMIC_ARCHETYPES[(DYNAMIC_ARCHETYPES.indexOf(archetypes[i]) + 1) % DYNAMIC_ARCHETYPES.length];
      archetypes[i] = scriptData.beats[i].archetype;
    }
  }

  if (new Set(archetypes).size < 5) {
    return { valid: false, reason: 'Insufficient archetype variety across beats.' };
  }

  return { valid: true };
}

/**
 * Generates and validates an 8-beat Hinglish/Hindi script with cluster failover & retry gate.
 */
export async function generateValidatedPopScript({
  topic,
  era: forcedEra = null,
  primaryRole = null,
  secondaryRole = null,
  maxAttempts = 3,
} = {}) {
  const era = detectEra(topic, forcedEra);
  const catalog = ERA_CATALOG[era];
  let lastErrorReason = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const roleHint = primaryRole
      ? `Primary character role preference: "${primaryRole}"${secondaryRole ? `, paired in Beat 2 DUAL_CONFRONTATION with "${secondaryRole}"` : ''}.`
      : '';

    const prompt = `You are the Executive Showrunner for "Oddly Told India" — a viral 2D Pop-Vector animation channel.
Topic: "${topic}"
Target Era: ${era.toUpperCase()}
${roleHint}
${lastErrorReason ? `PREVIOUS DRAFT REJECTED: ${lastErrorReason}. FIX IMMEDIATELY.` : ''}

MANDATES:
1. Exactly 8 rapid micro-beats (STRICTLY 32-42 seconds total!). Beat 1 MUST open mid-action with curiosity tension (NEVER say "Namaskar dosto" or "Aaj hum baat karenge").
2. Spoken Hindi ("narration_hi"): STRICTLY 8 to 15 words per beat (~3.5-4.8s spoken). Conversational, punchy Hindi written strictly in Devanagari (like Nitish Rajput / Think School). Avoid stiff textbook Sanskrit or long paragraphs.
3. Subtitle Tokens ("display_tokens_hi"): 3 to 6 Romanized Hinglish ALL-CAPS words per beat (e.g. ["KRISHNA", "NE", "SUDARSHAN", "KYUN", "ROKA?"]).
4. STRICT ERA ASSETS & HERO RIG ROUTING:
   - "environment" MUST be strictly one of: ${JSON.stringify(catalog.environments)}
   - "heroElement" MUST be strictly one of: ${JSON.stringify(catalog.props)}
   - "role" MUST be strictly one of: ${JSON.stringify(catalog.roles)}
   - Historical/Mythological Legends automatically route to our Heroic Legends Library (4.8-head anatomy, authentic crowns & weapons). Choose heroic poses strictly from: "heroic_idle", "guru_updesh", "wielding_chakra", "playing_bansuri", "archer_aiming", "warrior_stance", "holding_scroll", "orator_folded", "chaupar_scheme".
5. DYNAMIC ARCHETYPE PROGRESSION (Vary visual pacing across every beat):
   - Beat 1: "MACRO_HOOK_PUNCH" (MUST include "hookHeadline" <= 5 words ALL CAPS)
   - Beat 2: "DUAL_CONFRONTATION" (with "secondCharacter": {"role": "...", "pose": "..."})
   - Beat 3: "STRATEGY_MAP_ARENA"
   - Beat 4: "DOCUMENT_EDICT_UNROLL"
   - Beat 5: "TENSION_HUD_METER"
   - Beat 6: "METAPHOR_MONOLITH"
   - Beat 7: "CLEAN_SPLIT_DUO"
   - Beat 8: "REACTION_CLOSEUP" (Polarizing comment question!)
6. Return strictly valid JSON:
{
  "title_hi": "Title in conversational Hindi",
  "title_hinglish": "TITLE IN ALL CAPS HINGLISH",
  "description_hi": "2-line Hindi/Hinglish engaging description with relevant hashtags #Shorts",
  "beats": [
    {
      "id": 1,
      "title": "SHORT TITLE",
      "hookHeadline": "MAX 5 WORDS HOOK",
      "badge": "RULE 1",
      "badgeEmoji": "📜",
      "narration_hi": "Spoken Devanagari Hindi text",
      "display_tokens_hi": ["ROMANIZED", "HINGLISH", "TOKENS"],
      "environment": "${catalog.environments[0]}",
      "heroElement": "${catalog.props[0]}",
      "role": "${primaryRole || catalog.roles[0]}",
      "pose": "${era === 'ancient' ? 'guru_updesh' : 'shock_hands_on_head'}",
      "archetype": "MACRO_HOOK_PUNCH"
    }
  ]
}`;

    try {
      const res = await generateWithCluster('showrunner', {
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.72 + (attempt - 1) * 0.1 },
      });
      if (res?.text) {
        let cleanJson = res.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        const match = cleanJson.match(/\{[\s\S]*\}/);
        if (match) cleanJson = match[0];
        const parsed = JSON.parse(cleanJson);
        const check = validateGeneratedScript(parsed, era);
        if (check.valid) {
          return { era, scriptData: parsed };
        }
        lastErrorReason = check.reason;
        console.warn(`⚠️ [SHOWRUNNER GATE ${attempt}/${maxAttempts}] ${lastErrorReason}`);
      }
    } catch (err) {
      lastErrorReason = err.message;
      console.warn(`⚠️ [SHOWRUNNER ATTEMPT ${attempt}/${maxAttempts}] ${lastErrorReason}`);
    }
  }

  throw new Error(`Showrunner failed after ${maxAttempts} attempts: ${lastErrorReason}`);
}

/**
 * Merges LLM beat choreography metadata into synthesized audio manifest beats.
 */
export function enrichManifestWithChoreography(manifest, scriptData, era, { primaryRole = null, secondaryRole = null } = {}) {
  const isAncient = era === 'ancient';
  const catalog = ERA_CATALOG[era];

  manifest.beats = (manifest.beats || []).map((b, idx) => {
    const s = scriptData.beats[idx] || {};
    const chosenArchetype = s.archetype || DYNAMIC_ARCHETYPES[idx % DYNAMIC_ARCHETYPES.length];
    const resolvedRole = s.role && catalog.roles.includes(s.role)
      ? s.role
      : (primaryRole && catalog.roles.includes(primaryRole)
        ? primaryRole
        : (isAncient ? (chosenArchetype === 'STRATEGY_MAP_ARENA' || chosenArchetype === 'DOCUMENT_EDICT_UNROLL' ? 'chanakya' : 'krishna') : 'modern_creator'));

    return {
      ...b,
      title: s.title || b.title,
      hookHeadline: s.hookHeadline || b.hookHeadline,
      badge: s.badge || 'RULE',
      badgeEmoji: s.badgeEmoji || (isAncient ? '📜' : '🚨'),
      environment: s.environment || b.environment || catalog.environments[0],
      heroElement: s.heroElement || b.heroElement || catalog.props[0],
      character: {
        role: resolvedRole,
        pose: s.pose,
        face: s.face || s.expression,
        head: s.head,
        weapon: s.weapon,
      },
      secondCharacter: s.secondCharacter || (chosenArchetype === 'DUAL_CONFRONTATION' ? {
        role: secondaryRole && catalog.roles.includes(secondaryRole)
          ? secondaryRole
          : (isAncient ? (resolvedRole === 'krishna' ? 'arjuna' : 'duryodhana') : 'modern_commoner'),
        pose: isAncient ? 'archer_aiming' : 'standing_dazed',
      } : undefined),
      director_staging: {
        archetype: chosenArchetype,
      },
    };
  });

  return manifest;
}
