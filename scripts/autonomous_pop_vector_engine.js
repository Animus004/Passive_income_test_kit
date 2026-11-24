/**
 * ==============================================================================
 * Autonomous Pop-Vector Animation Engine (Phase 1 2D Generative Pipeline)
 * ==============================================================================
 * High-Speed Vector Animation Synthesis powered by Remotion, React & Google Gemini.
 * 
 * WORKFLOW ARCHITECTURE (30-Second Technical Overview):
 * 1. Prompt Synthesis: Dynamically injects genre-pure Golden Master components
 *    from `genre_theme_registry.js` (eliminates LLM era contamination).
 * 2. Vector Generation: Generates fully typed Remotion TSX scenes with strict
 *    CAD-constrained bounding boxes, spring-damped entrances, and bold vectors.
 * 3. In-Memory AST Gate: Passes code through `validate_pop_vector_ast.js` (< 10ms esbuild)
 *    to verify TypeScript syntax, local frame timing, and collision bounds.
 * 4. Self-Healing Debugger: Auto-corrects any AST or visual anomalies in real time.
 * 5. Closed-Loop Vision QA: Validates rendered video stills via `pop_vector_vision_watchdog.js`.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { generateWithCluster } from './gemini_cluster.js';
import { validatePopVectorSceneCode } from './validate_pop_vector_ast.js';
import { auditPopVectorStill } from './pop_vector_vision_watchdog.js';
import { prefetchScriptVectors } from './online_vector_fetcher.js';
import { GENRE_REGISTRY, detectGenre } from './genre_theme_registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

function cleanGeneratedCode(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    const newlineIdx = cleaned.indexOf('\n');
    if (newlineIdx !== -1) {
      cleaned = cleaned.slice(newlineIdx + 1);
    }
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3).trim();
  }
  const lines = cleaned.split('\n');
  if (lines.length > 0) {
    const firstWord = lines[0].trim().toLowerCase();
    if (['jsx', 'tsx', 'typescript', 'javascript'].includes(firstWord)) {
      cleaned = lines.slice(1).join('\n').trim();
    }
  }
  return cleaned.trim();
}

// Note: Golden Masters are loaded dynamically per-genre from ./genre_theme_registry.js
// to enforce strict architectural era isolation (Layer 1 Firewall).

export async function runAutonomousPopVector(topic, options = {}) {
  console.log('===============================================================');
  console.log(`💥 AUTONOMOUS POP-VECTOR ENGINE: CAD-CONSTRAINED VECTOR ARCHITECTURE`);
  console.log(`   Topic: "${topic}" | Watchdog: CLOSED-LOOP VISION GATE`);
  console.log('===============================================================\n');

  // STEP 1: Showrunner Script & Dynamic Multi-Beat Storyboard (100% Hindi + Hinglish First)
  let story;
  let totalScenes;
  let titleHi;
  let titleHinglish;

  const currentScriptPath = path.join(PROJECT_ROOT, 'scratch', 'current_oddly_script.json');
  if (options.useExistingScript && fs.existsSync(currentScriptPath)) {
    console.log('🎬 STEP 1: Using Existing Approved Episode Script from scratch/current_oddly_script.json...');
    const raw = JSON.parse(fs.readFileSync(currentScriptPath, 'utf-8'));
    titleHi = raw.hi?.title || raw.title_hi || 'ODDLY TOLD HINDI';
    titleHinglish = raw.hi?.title_hinglish || raw.title_hinglish || raw.en?.title || 'ODDLY TOLD SHORTS';
    const beats = raw.hi?.beats || raw.en?.beats || [];
    totalScenes = beats.length;
    story = {
      title_hi: titleHi,
      title_hinglish: titleHinglish,
      tagline: raw.tagline || 'STRATEGIC SILENCE',
      scenes: beats.map((b, idx) => ({
        sceneIndex: b.id || idx + 1,
        narration_hi: b.audio_text || '',
        display_tokens_hi: b.display_tokens || [],
        visualConcept: b.title || `Beat ${idx + 1}`,
        heroElement: b.heroElement,
        environment: b.environment || 'ancient_palace',
        props: b.props || [],
        badgeEmoji: b.badgeEmoji || '📜',
        badgeText: b.badge || 'RULE',
        titleText: b.title || 'SCENE',
        director_staging: b.director_staging || null,
      })),
    };
    console.log(`✅ Loaded Approved Script: "${titleHi}" (${titleHinglish}) (${totalScenes} dynamic micro-beats)`);
  } else {
    console.log('🎬 STEP 1: Showrunner Generating Rapid Multi-Beat Script in Conversational Hindi + Hinglish...');
    const scriptPrompt = `
You are the Executive Showrunner for "Oddly Told India" — a viral, high-retention 2D Pop-Vector channel for Indian youth bridging Ancient Indian Strategy (Chanakya Niti, Mahabharata power dynamics), Wealth History ("Sone Ki Chidiya", Ancient Global Trade), Relatable Middle-Class Money Traps, and High-Curiosity Indian Mysteries (Padmanabhaswamy Vault B, Bhangarh, Kailash Temple).
Write an engaging, intellectual, highly viral 34-40 second short on: "${topic}".

STORYTELLING & AUDIENCE MANDATES (100% TAILORED FOR INDIAN VIEWERS):
1. RAPID MICRO-BEATS:
   - Exactly 8 dynamic micro-beats (approx 7-11 spoken words per beat).
   - Total duration: 33-38 seconds. Each beat lasts ~3.5 to 4.5 seconds. The screen must NEVER sit static!

2. CONVERSATIONAL HINDI VOICEOVER (ZERO TEXTBOOK / SANSKRITIZED ARCHAIC WORDS!):
   - DO NOT use dry, bookish Hindi (forbid: "कालचक्र का प्रभाव", "अभिप्राय", "धन का अपव्यय", "विनाश के गर्त").
   - Spoken Hindi ("narration_hi") must sound like an intelligent, street-smart Indian creator talking to a close friend over chai (think Nitish Rajput, Think School, FinCocktail).
   - Use natural conversational Hindi phrasing with familiar modern words written in Devanagari:
     "दोस्त", "गलती", "पैसा", "सैलरी", "ईएमआई", "अकाउंट", "ट्रैप", "5 तारीख", "सीक्रेट", "रूल", "बैकअप प्लान", "22 बिलियन डॉलर", "वॉल्ट बी", "रेड फ्लैग", "धोखा", "गायब", "कमाल", "एक्सपोज़".

3. KINETIC SUBTITLES IN ROMANIZED HINGLISH:
   - "display_tokens_hi": Array of modern Romanized Hinglish words/tokens matching the spoken beat (e.g. ["Chanakya", "ne", "kaha", "tha...", "MEETHA DOST", "Sabse", "Bada", "Khatra!"]).
   - Indian youth on Instagram Reels and YouTube Shorts read Romanized Hinglish 3x faster than Devanagari!

4. THE 5-STAGE VIRAL RETENTION STRUCTURE:
   - Beats 1-2 (Hook - 0-7s): Attack a comfortable illusion or pose an impossible curiosity gap.
     * Strategy: "चाणक्य ने 2300 साल पहले एक brutal सच कहा था—जो दोस्त तुम्हारी हर बात पर 'हाँ' बोले, वो दोस्त नहीं... तुम्हारा slow poison है।"
     * Wealth: "1 तारीख को सैलरी क्रेडिट का SMS... और 5 तारीख को अकाउंट में जीरो बैलेंस. क्या कभी सोचा है ये पैसा उड़ कहाँ जाता है?"
     * Mystery: "पद्मनाभस्वामी मंदिर के 6 दरवाज़े खुल चुके हैं, जिनमें 1 लाख करोड़ का खज़ाना निकला... लेकिन 7वें दरवाज़े (Vault B) को सुप्रीम कोर्ट ने भी खोलने से क्यों रोक दिया?"
   - Beats 3-4 (The Setup & Pain Point - 8-16s): Ground the viewer in the exact trap or historical tension.
   - Beats 5-6 (The Tactical Rules / Hidden Secret - 17-28s): Reveal the core insight or 3 rules with rapid visual prop punches.
   - Beat 7 (The Tactical Action - 29-34s): What the viewer must immediately stop or start doing.
   - Beat 8 (The Open Loop / Comment Trap - 35-40s): Ask a polarizing question that triggers hundreds of comments!

5. CLOSED VISUAL METAPHOR & ENVIRONMENT DIVERSITY (NEVER SIT IN ONE ROOM!):
   The 2D vector animation engine features rich atmospheric environments and pre-built props:
   - For Ancient History & Strategy (Chanakya Niti, Mahabharata):
     * environments (DIVERSIFY! Switch rooms across beats):
       'chaupar_board_arena' (Ancient Chaupar gaming mat with golden grid and torches)
       'durbar_throne_room' (Grand throne room with golden canopy and royal arches)
       'subterranean_dungeon_vault' (Dark conspiracy vault with cold stone and braziers)
       'puppet_stage_shadow' (Theatrical void with spotlight and hanging puppet strings)
       'ancient_palace' (Warm saffron durbar with carved monolithic pillars)
       'temple_vault' (Sacred subterranean vault with twin snake pillars)
     * heroElement: Choose strictly from (and switch props each scene for maximum visual richness):
       "shakuni_dice" (carved ivory Chaupar dice with gold accents on stone plinth)
       "chaupar_board_macro" (embroidered Chaupar cloth board with ivory pawns and dice)
       "puppet_control_cross" (wooden puppeteer cross with hanging golden puppet crowns)
       "royal_throne" (grand imperial throne of Hastinapur)
       "royal_crown" (golden imperial crown)
       "puppet_strings" (hanging puppeteer strings of manipulation)
       "dagger" (dagger of betrayal and covert strikes)
       "burning_torch" (flaming torch of palace conspiracy)
       "two_faced_mask" (two-faced deception mask on carved stand)
       "poison_kanya_goblet" (golden chalice with purple vapor on table)
       "chanakya_scroll" (ancient parchment with sacred seal)
       "sword_shield_emblem" (warrior crossed swords and shield)
       "ashoka_pillar_emblem" (royal Mauryan 4-lion chakra capital)
       "gold_coins_overflow_chest" (glittering ancient treasure chest)
       "vault_b_door" (Padmanabhaswamy iron door with twin cobras)
       "viral_comment_bubbles" (retro discussion bubbles)
     * ENVIRONMENT ROTATION RULES (NEVER SIT IN ONE ROOM! ROTATE EVERY BEAT BASED ON TOPIC ERA):
       - If CHANAKYA / ANCIENT STRATEGY: Rotate across 'ancient_palace' (saffron durbar), 'durbar_throne_room' (royal throne), 'subterranean_dungeon_vault' (secret spy council), 'temple_vault' (sacred knowledge).
         (STRICT BAN: DO NOT use 'chaupar_board_arena' or 'puppet_stage_shadow' in Chanakya stories! Chanakya is a Mauryan strategist, NOT Shakuni!).
       - If SHAKUNI / MAHABHARATA: Rotate across 'chaupar_board_arena', 'puppet_stage_shadow', 'durbar_throne_room', 'subterranean_dungeon_vault'.
       - If WEALTH HISTORY / SONE KI CHIDIYA: Rotate across 'ancient_palace', 'durbar_throne_room', 'temple_vault', 'subterranean_dungeon_vault'.
       - If MODERN FINANCE: Rotate across 'modern_finance', 'office_desk', 'abstract_pop'.

5.5. CHARACTER CONSISTENCY & ANTI-CLONING MANDATE (CRITICAL):
   - You MUST maintain 100% historical and narrative continuity based on the topic:
     * If topic is about CHANAKYA / MAURYA:
       The central guide/mentor is STRICTLY role="chanakya".
       Secondary characters: role="commoner" (corrupt flatterer / fake friend / disciple) or role="king".
       Hero Props: 'chanakya_scroll', 'two_faced_mask', 'poison_kanya_goblet', 'ashoka_pillar_emblem', 'burning_torch', 'sword_shield_emblem'.
       STRICT BAN: NEVER use role="shakuni", 'shakuni_dice', 'chaupar_board_arena', or 'puppet_control_cross' in a Chanakya story! Chanakya lived in Pataliputra (300 BCE), NOT the Hastinapur dice hall!
     * If topic is about SHAKUNI / MAHABHARATA:
       Protagonist: role="shakuni". Rivals: role="duryodhana", role="pandava", role="king".
       Hero Props: 'shakuni_dice', 'chaupar_board_macro', 'puppet_control_cross', 'puppet_strings', 'royal_throne'.
     * If topic is about MODERN FINANCE / SALARY / EMI:
       Protagonist: role="modern_creator", role="commoner".
       Hero Props: 'salary_slip_drain', 'credit_card_trap', 'emi_chains_lock', 'money_drain_sink', 'smartphone_message'.
       STRICT BAN: NEVER put ancient kings, mukuts, or durbars in modern salary/EMI stories!
   - ANTI-CLONING RULE: Every video must feel fresh and unique! Do NOT lazily recycle Shakuni, the puppet strings, or the Chaupar dice into stories that have nothing to do with Shakuni!
     * STRICTLY BANNED: 'corporate desk', 'office cubicle', 'slack', 'whiteboard', 'laptop', 'magnifying glass', 'phone', 'modern office politics', 'network chart'. STAY 100% IMMERSED IN ANCIENT STATECRAFT!
   - For Modern Finance & Wealth Traps:
     * environment: STRICTLY 'modern_finance' or 'office_desk'.
     * heroElement: Choose strictly from:
       "salary_slip_drain" (paycheck sucked into whirlpool)
       "credit_card_trap" (credit card with bear trap teeth)
       "emi_chains_lock" (chains wrapping wallet/card)
       "money_drain_sink" (cash swirling down drain)
       "gold_coins_overflow_chest" (treasure chest)
       "weighing_scale_gold" (paper vs gold scale)
       "smartphone_message" (bank SMS 0.00 notification)
       "viral_comment_bubbles" (comment debate bubbles)

6. THE UNIVERSAL INTENT-TO-VISUAL METAPHOR CATALOG (MANDATORY DIRECTION CONVERSION):
   Do NOT output vague, lazy, or flat staging! For EACH scene, classify the spoken beat's narrative intent and match it directly to the appropriate visual metaphor and staging archetype:

   • INTENT 1: MANIPULATION / PROXY WAR / INVISIBLE CORDS (Shadow influence, controlling minds)
     - Archetype: 'CLEAN_SPLIT_DUO' or 'SOLO_HERO_MONOLITH'
     - Metaphor:
       * If Mahabharata topic: Puppet Master with outstretched wingspan; glowing strings tether to miniature crowns on plinth ('puppet_stage_shadow', 'puppet_control_cross', role="shakuni").
       * If Chanakya topic: Chanakya points accusing finger at a two-faced deceit mask or unrolls spy decree ('ancient_palace' or 'subterranean_dungeon_vault', 'chanakya_scroll' or 'two_faced_mask', role="chanakya").
       * If Modern Finance topic: Credit card bear trap clamping wallet ('modern_finance', 'credit_card_trap', role="modern_creator").

   • INTENT 2: FAKE ALLY / SWEET POISON / DISGUISED BETRAYAL (e.g. Meetha dost, sycophants, toxic controller)
     - Archetype: 'CLEAN_SPLIT_DUO'
     - Metaphor: Two-faced carved mask on plinth (warm smiling face in front, sharp dagger slit eye with poison mist in back) while mentor warns viewer.
     - Props: 'two_faced_mask', 'poison_kanya_goblet' | Pose: 'chanakya_pointing' (if Chanakya) or 'whispering_sly' (if sycophant)
     - Setting: 'ancient_palace' or 'durbar_throne_room'

   • INTENT 3: SOWING DIVISION / BROTHER VS BROTHER / INTERNAL RIFT (e.g. Kaurava vs Pandava, rival factions)
     - Archetype: 'DYNAMIC_CONFRONTATION'
     - Metaphor: Two characters facing away from each other; central dividing line of crossed blades or blazing torch splits the screen.
     - Props: 'sword_shield_emblem', 'burning_torch' | Poses: 'warrior_stand' vs 'shock_hands_on_head'
     - Setting: 'durbar_throne_room' or 'subterranean_dungeon_vault'

   • INTENT 4: BAITING GREED / THE INESCAPABLE ARENA / RIGGED GAME (e.g. Chaupar match, speculative traps)
     - Archetype: 'CLEAN_SPLIT_DUO'
     - Metaphor: Macro Chaupar board on stone floor; carved ivory dice landing in slow-motion impact with gold shockwave rings.
     - Props: 'shakuni_dice', 'chaupar_board_macro' | Pose: 'rolling_dice'
     - Setting: 'chaupar_board_arena'

   • INTENT 5: STRATEGIC SILENCE / SECRET CONCEALMENT (e.g. Chanakya concealing cards, stoic mastermind)
     - Archetype: 'SOLO_HERO_MONOLITH'
     - Metaphor: Mastermind standing dead still with arms folded; around him, panic whisper bubbles swirl while he remains unshakeable.
     - Props: 'chanakya_scroll', flanking 'burning_torch' | Pose: 'chanakya_pointing' or calm stance
     - Setting: 'ancient_palace' or 'subterranean_dungeon_vault'

   • INTENT 6: WEALTH DRAIN / SYSTEMIC SIPHON (e.g. Salary disappearing on 5th, colonial bleed, money vortex)
     - Archetype: 'CLEAN_SPLIT_DUO' or 'SOLO_HERO_MONOLITH'
     - Metaphor: Cash stack or salary slip swirling down an inescapable whirlpool drain; character staring in disbelief.
     - Props: 'salary_slip_drain', 'money_drain_sink', 'gold_coins_overflow_chest' | Pose: 'shock_hands_on_head'
     - Setting: 'modern_finance' or 'office_desk'

   • INTENT 7: DEBT TRAP / GOLDEN HANDCUFFS (e.g. Credit cards, lifestyle inflation, EMIs)
     - Archetype: 'SOLO_HERO_MONOLITH'
     - Metaphor: Sleek credit card or wallet clamped shut inside spring-loaded steel bear-trap jaws with heavy iron chains.
     - Props: 'credit_card_trap', 'emi_chains_lock' | Setting: 'modern_finance'

   • INTENT 8: SACRED UNOPENED SECRETS / THE IMPOSSIBLE MYSTERY (e.g. Vault B, ancient marvels)
     - Archetype: 'SOLO_HERO_MONOLITH'
     - Metaphor: Colossal subterranean iron door embossed with twin cobras; mystical golden light leaking from keyhole.
     - Props: 'vault_b_door', 'ashoka_pillar_emblem' | Setting: 'temple_vault'

   • INTENT 9: ILLUSION SHATTER / BRUTAL UNCOMFORTABLE TRUTH (Hook beats 1-2)
     - Archetype: 'REACTION_CLOSEUP'
     - Metaphor: Shock realization; character holding head in disbelief as a comforting myth shatters.
     - Pose: 'shock_hands_on_head' (scale: 1.45)

   • INTENT 10: POLARIZING DEBATE / COMMENT TRAP (Climax beat 8)
     - Archetype: 'SOLO_HERO_MONOLITH'
     - Metaphor: 3 retro discussion comment bubbles popping onto screen with pulsing notification counters.
     - Props: 'viral_comment_bubbles' | Setting: 'durbar_throne_room' or 'modern_finance'

7. MANDATORY DIRECTOR'S SECOND-BY-SECOND STAGING & STORYBOARD FOR EVERY BEAT:
   For EACH scene, you MUST act as the Animation Director & Spatial Choreographer and provide a detailed "director_staging" plan:
   - "archetype": Exactly one of 'CLEAN_SPLIT_DUO' | 'SOLO_HERO_MONOLITH' | 'DYNAMIC_CONFRONTATION' | 'REACTION_CLOSEUP'.
   - "visual_metaphor": Concrete physical visual metaphor explaining the concept.
   - "left_stage": Object with type ('HeroProp' or 'CharacterRig'), prop/role name, and coordinates (e.g. { "type": "HeroProp", "prop": "puppet_control_cross", "x": 340, "y": 960 }).
   - "right_stage": Object with type, role/prop, pose, and coordinates (e.g. { "type": "CharacterRig", "role": "chanakya" (if Chanakya topic) | "shakuni" (if Mahabharata topic) | "modern_creator" (if Modern finance), "pose": "chanakya_pointing" | "puppeteer_strings" | "shock_hands_on_head", "x": 760, "y": 940 }).
   - "connector": (Optional) When tethering across stage: { "type": "puppet_strings" | "emi_chains" | "tension_cords", "attachCrowns": true }.
   - "timeline": Array of exact milestone timestamps (e.g. "0:00.0", "0:00.7", "0:01.4", "0:02.1") detailing the physical visual action for each sub-beat.

Respond strictly in valid JSON matching this schema:
{
  "title_hi": "चाणक्य नीति: 3 Fake दोस्त जो तुम्हें बर्बाद कर देंगे",
  "title_hinglish": "CHANAKYA NITI: 3 FAKE DOST",
  "tagline": "STRATEGIC SILENCE",
  "scenes": [
    {
      "sceneIndex": 1,
      "narration_hi": "स्वाभाविक बोलचाल की हिंदी में लिखा वाक्य (7-11 शब्द).",
      "display_tokens_hi": ["Salary", "aate", "hi", "5 tareekh", "ko", "Gayab!"],
      "visualConcept": "Physical cartoon comedic action",
      "heroElement": "chanakya_scroll",
      "environment": "ancient_palace",
      "badgeEmoji": "📜",
      "badgeText": "RULE 01 • FAKE DOST",
      "titleText": "KABHI MAT BATAO",
      "director_staging": {
        "archetype": "CLEAN_SPLIT_DUO",
        "visual_metaphor": "Chanakya unrolls the sacred ancient decree of deception while warning the viewer",
        "left_stage": { "type": "HeroProp", "prop": "chanakya_scroll", "x": 340, "y": 960 },
        "right_stage": { "type": "CharacterRig", "role": "chanakya", "pose": "chanakya_pointing", "x": 760, "y": 940 },
        "timeline": [
          { "time_sec": "0:00.0", "focus": "badge", "action": "Badge snaps in with bounce: 'RULE 01 • FAKE DOST'" },
          { "time_sec": "0:00.6", "focus": "prop", "action": "Left stage: Sacred scroll unrolls with impact spring" },
          { "time_sec": "0:01.2", "focus": "character", "action": "Right stage: Chanakya points finger with severe warning expression" }
        ]
      }
    }
  ]
}
`;

    const scriptRes = await generateWithCluster('showrunner', {
      contents: [{ role: 'user', parts: [{ text: scriptPrompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    story = JSON.parse(scriptRes.text);
    totalScenes = story.scenes.length;
    titleHi = story.title_hi || story.title || 'ODDLY TOLD HINDI';
    titleHinglish = story.title_hinglish || story.title_en || 'ODDLY TOLD SHORTS';
    console.log(`✅ Showrunner Script Generated: "${titleHi}" (${titleHinglish}) (${totalScenes} dynamic micro-beats)`);
  }

  // STEP 1.5: Online Open-Source Vector Pre-Fetcher (Unlimited Vector Illustrations)
  const fullTopicLowerPre = (titleHinglish + ' ' + (titleHi || '') + ' ' + topic).toLowerCase();
  const isAncientPre = fullTopicLowerPre.includes('chanakya') ||
    fullTopicLowerPre.includes('mahabharata') ||
    fullTopicLowerPre.includes('temple') ||
    fullTopicLowerPre.includes('vault') ||
    fullTopicLowerPre.includes('kuldhara') ||
    fullTopicLowerPre.includes('bhangarh') ||
    fullTopicLowerPre.includes('sone ki chidiya') ||
    fullTopicLowerPre.includes('ancient') ||
    fullTopicLowerPre.includes('history') ||
    fullTopicLowerPre.includes('shakuni') ||
    fullTopicLowerPre.includes('karna') ||
    fullTopicLowerPre.includes('niti');

  try {
    console.log('\n🌐 STEP 1.5: [ONLINE OPEN-SOURCE VECTOR FETCHER] Pre-fetching bespoke vector art for episode...');
    await prefetchScriptVectors(story.scenes, isAncientPre);
  } catch (vecErr) {
    console.warn('⚠️ Vector prefetch error:', vecErr.message);
  }

  // STEP 2: Synthesize Hindi Audio & Exact Word Timestamps across all beats (Zero English Audio Waste)
  console.log('\n🎙️ STEP 2: Synthesizing Spoken Hindi Audio (Piper Rohan Neural) & Timestamps...');
  const tempScriptPath = path.join(PROJECT_ROOT, 'scratch', 'temp_pop_script.json');
  fs.mkdirSync(path.join(PROJECT_ROOT, 'scratch'), { recursive: true });

  const scriptPayload = {
    topic,
    title_hi: titleHi,
    title_hinglish: titleHinglish,
    hi: {
      title: titleHi,
      title_hinglish: titleHinglish,
      beats: story.scenes.map((s) => ({
        id: s.sceneIndex,
        title: s.titleText || `Beat ${s.sceneIndex}`,
        badge: s.badgeText || 'RULE',
        badgeEmoji: s.badgeEmoji || '📜',
        audio_text: s.narration_hi || s.narration || (s.titleText ? `${s.titleText}.` : `दृश्य ${s.sceneIndex}.`),
        display_tokens: s.display_tokens_hi || [],
        heroElement: s.heroElement,
        environment: s.environment,
        director_staging: s.director_staging || null,
      })),
    },
    // Backwards-compatible en wrapper for tools expecting standard schema
    en: {
      title: titleHinglish,
      beats: story.scenes.map((s) => ({
        id: s.sceneIndex,
        title: s.titleText || `Beat ${s.sceneIndex}`,
        badge: s.badgeText || 'RULE',
        audio_text: (s.display_tokens_hi || []).join(' '),
        display_tokens: s.display_tokens_hi || [],
        heroElement: s.heroElement,
        environment: s.environment,
        director_staging: s.director_staging || null,
      })),
    },
  };

  fs.writeFileSync(tempScriptPath, JSON.stringify(scriptPayload, null, 2), 'utf-8');
  fs.writeFileSync(path.join(PROJECT_ROOT, 'scratch', 'current_oddly_script.json'), JSON.stringify(scriptPayload, null, 2), 'utf-8');

  // Synthesize ONLY Hindi with Local Offline Piper Rohan Neural Model
  const cleanTempScriptPath = tempScriptPath.split('\\').join('/');
  execSync(`python scripts/oddly_audio_synthesizer.py --script "${cleanTempScriptPath}" --lang hi --hindi-engine piper`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });

  const manifestHiPath = path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_hi.json');
  const manifestHi = JSON.parse(fs.readFileSync(manifestHiPath, 'utf-8'));

  // Drive all scene frame counts and choreography directly from manifestHi!
  const beatDurations = manifestHi.beats.map((b) => b.durationInFrames);
  console.log(`✅ Hindi Manifest verified. Beat durations (HI): [${beatDurations.join(', ')}] (Total: ${manifestHi.totalFrames} frames)`);

  // STEP 3: Synthesize Bespoke High-Density Pop-Vector Scenes with CAD Constraints & Closed-Loop Vision Watchdog
  console.log(`\n💻 STEP 3: Synthesizing ${totalScenes} CAD-Constrained Pop-Vector Scenes with Vision Gate...`);
  const autonomousDir = path.join(PROJECT_ROOT, 'src', 'scenes', 'autonomous_pop');
  fs.mkdirSync(autonomousDir, { recursive: true });

  // Ensure placeholders 1..12 exist to satisfy React imports
  for (let s = 1; s <= 12; s++) {
    const sPath = path.join(autonomousDir, `Scene${s}.tsx`);
    if (!fs.existsSync(sPath)) {
      fs.writeFileSync(
        sPath,
        `import React from 'react';\nimport { AbsoluteFill } from 'remotion';\nexport const Scene${s}: React.FC = () => <AbsoluteFill />;\n`,
        'utf-8'
      );
    }
  }

  const proofDir = path.join(PROJECT_ROOT, 'scratch', 'pop_proofs');
  fs.mkdirSync(proofDir, { recursive: true });

  const startIndex = options.startScene ? Math.max(0, options.startScene - 1) : 0;
  const endIndex = options.endScene ? Math.min(totalScenes, options.endScene) : totalScenes;
  for (let i = startIndex; i < endIndex; i++) {
    const sceneIndex = i + 1;
    const sceneMeta = story.scenes[i];
    const sceneFrames = beatDurations[i];
    const beatInfo = manifestHi.beats[i];

    // Subtitle tokens for word timing pulses (driven by Hindi manifest)
    const beatWords = (manifestHi.words || []).filter(
      (w) => w.start >= beatInfo.startSec && w.end <= beatInfo.startSec + beatInfo.durationSec
    );

    const relativeWordTimings = beatWords.map((w) => ({
      word: w.word,
      relativeFrame: Math.max(0, Math.round((w.start - beatInfo.startSec) * 30)),
    }));

    console.log(`\n🎨 [BEAT ${sceneIndex}/${totalScenes}] Coding Visual Scene: "${sceneMeta.titleText}" (${sceneFrames} frames)...`);
    console.log(`   🎨 Hero Element: "${sceneMeta.heroElement}" | Setting: "${sceneMeta.environment}"`);

    // Dynamic Genre & Era Catalog Filtering (Layer 1 Firewall via Centralized Genre Registry)
    const activeGenre = detectGenre(titleHinglish + ' ' + (titleHi || '') + ' ' + topic);
    const isAncientOrLore = activeGenre.era === 'ancient';
    const isFinance = activeGenre.id === 'modern_finance';

    console.log(`   🎭 Active Genre: "${activeGenre.name}" (Era: ${activeGenre.era.toUpperCase()})`);

    const allowedEnvironments = activeGenre.allowedEnvironments.map((e) => `'${e}'`).join(' | ');
    const allowedPropsDesc = activeGenre.allowedProps.map((p) => `'${p}'`).join(' | ');
    const bannedPropsDesc = activeGenre.forbiddenProps.length > 0
      ? `STRICTLY BANNED: ${activeGenre.forbiddenProps.map((p) => `'${p}'`).join(', ')}. ZERO ANACHRONISMS!`
      : 'None';
    const allowedRolesDesc = activeGenre.allowedRoles.map((r) => `'${r}'`).join(' | ');
    const allowedHeadsDesc = activeGenre.allowedHeads.map((h) => `'${h}'`).join(' | ');
    const allowedFacialHairDesc = activeGenre.era === 'modern' ? "'stubble' | 'clean_shaven'" : "'royal_moustache' | 'elder_beard' | 'stubble' | 'clean_shaven'";
    const allowedAttiresDesc = activeGenre.allowedAttires.map((a) => `'${a}'`).join(' | ');
    const allowedPosesDesc = activeGenre.era === 'modern'
      ? "'shock_hands_on_head' | 'wealth_proud_chest' | 'keyboard_panic' | 'desk_sit_relaxed' | 'slouched_flat' | 'holding_phone' | 'standing_dazed'"
      : "'rolling_dice' | 'puppeteer_strings' | 'whispering_sly' | 'chanakya_pointing' | 'warrior_stand' | 'wealth_proud_chest' | 'shock_hands_on_head' | 'standing_dazed'";
    const bannedPosesDesc = activeGenre.era === 'modern'
      ? "STRICTLY BANNED: 'chanakya_pointing', 'puppeteer_strings', 'rolling_dice', 'warrior_stand' in modern scenes."
      : "STRICTLY BANNED: 'desk_sit_relaxed', 'keyboard_collapse', 'keyboard_panic', 'desk_typing', 'holding_phone'. NO MODERN DESKS IN ANCIENT SCENES!";

    const rolesHelpText = activeGenre.era === 'modern' ? `
     * role="modern_creator" -> Modern Indian creator/worker in casual modern attire. (ONLY ALLOWED ROLE IN ${activeGenre.name.toUpperCase()}!)
       - Allowed Heads: ${allowedHeadsDesc}
       - Allowed Attires: ${allowedAttiresDesc}
       - Allowed Faces: 'shock_alarm' | 'dead_inside' | 'dazed_asymmetric' | 'keyboard_slump' | 'bliss_dreaming' | 'dread_loop'
       - Allowed Poses: ${allowedPosesDesc}
       - STRICT BAN: ZERO ANCIENT CHARACTERS! NEVER use 'shakuni', 'duryodhana', 'pandava', 'kaurava', 'chanakya', 'king', or 'commoner'! NEVER use 'royal_mukut', 'royal_pagdi', 'shakuni_cowl', 'chanakya_shikha', 'warrior_kavach', 'dark_shawl'!
       - STRICT PROP: era="modern" MUST be passed to <CharacterRig era="modern" ... />!` : `
     * role="chanakya" -> Shaven head with shikha, dhoti & janeu
     * role="shakuni" -> Dark silk cowl, pointed grey beard, dark shawl
     * role="duryodhana" -> Golden 3-tier mukut, royal moustache, warrior kavach
     * role="pandava" -> Golden mukut, clean-shaven warrior kavach
     * role="ancient_commoner" -> Rajasthani safa, simple kurta
     * STRICT BAN: NEVER use 'modern_creator' or modern hoodies in ancient scenes!
     * STRICT PROP: era="ancient" MUST be passed to <CharacterRig era="ancient" ... />!`;

    const confrontationExample = activeGenre.id === 'modern_finance' ? `
ARCHETYPE D: DYNAMIC CONFRONTATION (Spender vs Disciplined Saver / Financial Conflict)
- Use for internal financial divide (Impulse Spender vs Wealth Builder):
  Left (Impulse Spender): <CharacterRig era="modern" role="modern_creator" head="curly" clothColor="#EF4444" x={280} y={940} scale={1.1} flipHorizontal={false} breathing={true} blinking={true} />
  Center Dividing Metric: <HeroProp type="salary_slip_drain" x={540} y={940} scale={1.05} shakeIntensity={propSpring} />
  Right (Disciplined Saver): <CharacterRig era="modern" role="modern_creator" head="slick" clothColor="#10B981" x={800} y={940} scale={1.1} flipHorizontal={true} breathing={true} blinking={true} />` : activeGenre.id === 'silicon_valley_tech' ? `
ARCHETYPE D: DYNAMIC CONFRONTATION (Junior Dev vs Lead Architect / Tech Conflict)
  Left: <CharacterRig era="modern" role="modern_creator" head="beanie" clothColor="#DC2626" x={280} y={940} scale={1.1} flipHorizontal={false} breathing={true} blinking={true} />
  Center Dividing Metric: <HeroProp type="macbook_pro" x={540} y={940} scale={1.05} shakeIntensity={propSpring} />
  Right: <CharacterRig era="modern" role="modern_creator" head="slick" clothColor="#1E293B" glasses={true} x={800} y={940} scale={1.1} flipHorizontal={true} breathing={true} blinking={true} />` : `
ARCHETYPE D: DYNAMIC CONFRONTATION (Character vs Character / Brother Divide)
- Use for internal rifts, rivalries, or brotherly divide (e.g. Kaurava vs Pandava, Shakuni vs King):
  Left: <CharacterRig era="ancient" role="pandava" x={280} y={940} scale={1.1} flipHorizontal={false} breathing={true} blinking={true} />
  Center Dividing Emblem: <HeroProp type="sword_shield_emblem" x={540} y={940} scale={1.05} shakeIntensity={propSpring} />
  Right: <CharacterRig era="ancient" role="duryodhana" x={800} y={940} scale={1.1} flipHorizontal={true} breathing={true} blinking={true} />`;

    const connectorRules = activeGenre.allowCrowns ? `
CONNECTOR RULE:
- For puppet manipulation, use type="puppet_strings". attachCrowns={true} is allowed ONLY for royal puppet master scenes.` : `
STRICT CONNECTOR RULE IN MODERN SCENES:
- NEVER use type="puppet_strings" or attachCrowns={true}! Miniature golden royal crowns have ZERO place in modern scenes!
- If connecting stage elements, use type="${activeGenre.allowedConnectors[0] || 'tension_cords'}" with attachCrowns={false}.`;

    const directorStagingBlock = sceneMeta.director_staging ? `
=============================================================================
DIRECTOR'S SECOND-BY-SECOND STORYBOARD & CHOREOGRAPHY (MANDATORY EXECUTION)
=============================================================================
ARCHETYPE: ${sceneMeta.director_staging.archetype || 'CLEAN_SPLIT_DUO'}
VISUAL METAPHOR: ${sceneMeta.director_staging.visual_metaphor || sceneMeta.visualConcept}
LEFT STAGE: ${JSON.stringify(sceneMeta.director_staging.left_stage || {})}
RIGHT STAGE: ${JSON.stringify(sceneMeta.director_staging.right_stage || {})}
${sceneMeta.director_staging.connector ? `CONNECTOR: ${JSON.stringify(sceneMeta.director_staging.connector)}\n` : ''}TIMELINE MILESTONES (YOU MUST CHOREOGRAPH YOUR REMOTION TIMINGS TO MATCH THESE EXACT MILESTONES):
${(sceneMeta.director_staging.timeline || []).map((t) => `  • [${t.time_sec}] ${t.focus.toUpperCase()}: ${t.action}`).join('\n')}
` : '';

    const coderPrompt = `
You are the Motion Director and Choreographer for a top-tier viral 2D animated Shorts studio ("Oddly Told" / "Kurzgesagt" style).
Assemble and choreograph the animated 2D scene component for Beat ${sceneIndex} of ${totalScenes}.

Topic: "${titleHi}" (${titleHinglish})
Scene Title: "${sceneMeta.titleText}"
Scene Badge: "${sceneMeta.badgeText}"
Narration (Spoken Hindi): "${sceneMeta.narration_hi || sceneMeta.narration}"
Subtitles (Hinglish): "${(sceneMeta.display_tokens_hi || []).join(' ')}"
Visual Action: ${sceneMeta.visualConcept}
Hero Element to Feature: ${sceneMeta.heroElement}
Environment Setting: ${sceneMeta.environment || 'ancient_palace'}
Required Props: ${JSON.stringify(sceneMeta.props || ['Prop 1', 'Prop 2'])}
Scene Duration: Exactly ${sceneFrames} frames at 30 fps (frame ranges 0 to ${sceneFrames}).

Word Timings (for scale/spring punch on word hits):
${JSON.stringify(relativeWordTimings.slice(0, 8), null, 2)}
${directorStagingBlock}

=============================================================================
RULE 1: YOU ARE A DIRECTOR, NOT AN ILLUSTRATOR (DO NOT DRAW RAW SVG PATHS!)
=============================================================================
All visual artwork (characters, heads, expressions, poses, props, environments) is pre-built, perfectly proportioned, and modular.
You assemble and choreograph them using:
  import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';

=============================================================================
RULE 2: STRICT ERA & ASSET CATALOG (ZERO ANACHRONISMS!)
=============================================================================
1. <RoomEnvironment type={...}>
   - Allowed in this genre: ${allowedEnvironments}
2. <HeroProp type={...} x={...} y={...} scale={...} shakeIntensity={...} rotation={...} customText={...} />
   - Allowed in this genre: ${allowedPropsDesc}
   - ${bannedPropsDesc}
3. <CharacterRig role={...} head={...} face={...} pose={...} x={...} y={...} scale={...} clothColor={...} hairColor={...} skinColor={...} facialHair={...} attireOverlay={...} glasses={...} flipHorizontal={...} breathing={true} blinking={true} />
   - Role (PREFER THIS! Automatically sets authentic headwear, facial grooming & attire): ${allowedRolesDesc}
${rolesHelpText}
   - Heads: ${allowedHeadsDesc}
   - Facial Hair: ${allowedFacialHairDesc}
   - Attire Overlay: ${allowedAttiresDesc}
   - Faces: 'shock_alarm' | 'dead_inside' | 'dazed_asymmetric' | 'floating_ghost' | 'keyboard_slump' | 'bliss_dreaming' | 'dread_loop'
   - Poses: ${allowedPosesDesc}
   - ${bannedPosesDesc}

4. <StageConnector ... />${connectorRules}

=============================================================================
RULE 2.5: LOCAL SCENE TIMINGS ONLY (FRAME 0 IS SCENE START!)
=============================================================================
- Every Remotion scene runs inside a <Sequence>. The 'frame' variable starts from 0 for EVERY scene!
- Visual entrances MUST occur at the beginning of the scene:
  * Top Badge punch: frame 0 -> const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
  * Hero Prop impact: frame 6 to 10 -> const propSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 190 } });
  * Character emergence: frame 12 to 18 -> const charSpring = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 15, stiffness: 160 } });
- STRICT BAN ON ABSOLUTE TIMESTAMPS: NEVER use 'frame - 120' or 'frame - 162'! Any number greater than 35 will keep the character or prop completely invisible and fail the AST Gate!

=============================================================================
RULE 3: THE 4 STRICT STAGING ARCHETYPES (NO CLUTTER, ZERO OVERLAPS!)
=============================================================================
You MUST stage the scene in one of these 4 clean architectural layouts:

ARCHETYPE A: SOLO HERO MONOLITH (Center Stage)
- Use when featuring a single legendary object (Grounded on Y=1220 floor horizon):
  <HeroProp type="..." x={540} y={960} scale={1.35} shakeIntensity={propSpring} />
  Optional secondary flanking props: x={160} and x={920} at y={1160}, scale={0.85}.

ARCHETYPE B: CLEAN SPLIT DUO (Character vs Prop - ZERO OVERLAP & GROUNDED!)
- Use when character interacts with or reacts to a prop:
  <HeroProp type="..." x={340} y={960} scale={1.15} shakeIntensity={propSpring} />
  <CharacterRig role="..." x={760} y={940} scale={1.15} breathing={true} blinking={true} />
  (Center distance is 420px - leaves a clean breathing zone with ZERO collision! Pedestal and Padukas firmly planted on Y=1220 floor plane.)

ARCHETYPE C: REACTION FACE CLOSE-UP
- Use for intense emotional realization or comedic panic:
  <CharacterRig role="..." x={540} y={800} scale={1.5} pose="shock_hands_on_head" breathing={true} blinking={true} />

${confrontationExample.trim()}

=============================================================================
RULE 3.1: ABSOLUTE ZERO-COLLISION MANDATE (NEVER PUT CHARACTER & PROP AT SAME X!)
=============================================================================
- When BOTH a HeroProp and a CharacterRig are present in a scene:
  * The HeroProp MUST BE PLACED ON LEFT STAGE: x={340}, y={960}, scale={1.15}
  * The CharacterRig MUST BE PLACED ON RIGHT STAGE: x={760}, y={940}, scale={1.15}
- NEVER EVER place both at X=540! Placing both at X=540 creates an unreadable collision where the prop occludes the character's face and body, causing immediate rejection by the Vision Watchdog!

=============================================================================
RULE 4: MAXIMUM 1 HERO PROP PER SCENE (STRICT BAN ON ASSET DUMPING!)
=============================================================================
- DO NOT cram multiple different props into a single scene!
- Every scene gets EXACTLY ONE main HeroProp (or 1 HeroProp + identical small flanking lamps).

=============================================================================
RULE 5: STRICT GROUNDING & SUBTITLE SAFE ZONE
=============================================================================
- Grounding Horizon: In all environments, the floor horizon or desk plane is at Y=1220. Props must have y=960 (scale 1.15) and characters must have y=940 (scale 1.15) so their feet/pedestal rest firmly on the ground at Y=1236-1262. NO FLOATING IN MID-AIR!
- Subtitle Safe Zone: Y=1320 to Y=1750 must remain 100% clear of hero character faces and large props so kinetic Hinglish captions render cleanly.

=============================================================================
RULE 6: STRICT BAN ON SUBTITLE RENDERING IN SCENE COMPONENTS
=============================================================================
- DO NOT render any subtitles, word text, or bottom text cards in this component!
- Subtitles are rendered globally with kinetic animation by <OddlyCaptions />.

=============================================================================
RULE 7: STRICT BAN ON RAW BACKGROUND COLOR BLOCKS
=============================================================================
- DO NOT write raw rectangular floor or background divs like <div style={{ backgroundColor: '#f0f0f0', height: 700 }} />!
- <RoomEnvironment> already renders the entire architectural room, floor perspective, and mood lighting.

=============================================================================
RULE 8: CLEAN PHYSICS & NO INFINITE SHAKING
=============================================================================
- DO NOT write custom infinite sine shaking like Math.sin(frame * 1.8) * 12!
- Simply pass shakeIntensity={propSpring} to <HeroProp>. HeroProp automatically applies exponential impact decay.

=============================================================================
RULE 9: PUNCHY COMIC STATUS BADGE (HINGLISH / ENGLISH)
=============================================================================
Top status badge centered at X=540, top: 130px.
Match the badge text and emoji directly to this scene beat: "${sceneMeta.titleText}" / "${sceneMeta.badgeText}"!
Example:
  <div style={{
    position: 'absolute', top: 130, left: '50%',
    transform: \`translateX(-50%) scale(\${badgeSpring})\`,
    backgroundColor: '#EF4444', color: '#FFFFFF',
    border: '8px solid #000000', borderRadius: 36,
    padding: '14px 40px', fontSize: 32, fontWeight: 900,
    boxShadow: '0 10px 0 #000000', zIndex: 40,
    display: 'flex', alignItems: 'center', gap: 14,
    whiteSpace: 'nowrap'
  }}>
    <span>${sceneMeta.badgeEmoji || '🚨'}</span>
    <span>\${sceneMeta.badgeText || 'ALERT'}</span>
  </div>

=============================================================================
RULE 10: TEMPORAL CHOREOGRAPHY MANDATE (SUB-BEAT STAGGERING)
=============================================================================
Do NOT trigger every spring at frame 0 like an amateur! Professional animation staggers sub-beats:
1. Frame 0: Scene establishes. Top Status Badge punches in with snappy spring overshoot:
   const badgeSpring = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });
2. Frame 10-15: Primary HeroProp lands on pedestal or drops with impact decay:
   const propSpring = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 190 } });
   Pass shakeIntensity={propSpring} to <HeroProp>.
3. Frame 25-35: Hero character steps into light or emerges from shadow:
   const charSpring = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 15, stiffness: 160 } });
   const charSlide = interpolate(charSpring, [0, 1], [35, 0]);
   Wrap CharacterRig in <div style={{ opacity: charSpring, transform: \`translateY(\${charSlide}px)\` }}>.
4. Dynamic Arm Kinematics & Tugging (Puppeteer / Pointing / Shock):
   - Pass armProgress={armSweep} to <CharacterRig> (0 = arms relaxed at side, 1 = full pose extension) where:
     const armSweep = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 14, stiffness: 180 } });
   - Pass handTug={handTug} for continuous string/gesture tension where:
     const handTug = Math.sin((frame / fps) * Math.PI * 4) * 6;
5. StageConnector (Tethering across 420px Stage Gap):
   - When character manipulates, tethers, or puppets an object across stage, import and use <StageConnector>:
${activeGenre.allowCrowns ? `     <StageConnector
       type="puppet_strings"
       fromX={760}
       fromY={640}
       toX={340}
       toY={760}
       tension={1.0}
       tugIntensity={handTug}
       attachCrowns={true}
       crownBob={handTug * 1.5}
       opacity={charSpring}
     />` : `     <StageConnector
       type="${activeGenre.allowedConnectors[0] || 'tension_cords'}"
       fromX={760}
       fromY={640}
       toX={340}
       toY={860}
       tension={1.0}
       tugIntensity={handTug}
       attachCrowns={false}
       opacity={charSpring}
     />`}
6. Camera Creep: Add subtle cinematic camera push to keep visual tension:
   const cameraZoom = interpolate(frame, [0, ${sceneFrames}], [1.0, 1.05], { extrapolateRight: 'clamp' });
   Wrap scene content in <div style={{ width: '100%', height: '100%', transform: \`scale(\${cameraZoom})\`, transformOrigin: '50% 60%' }}>.
7. Living Characters: ALWAYS enable breathing={true} and blinking={true} on <CharacterRig>!

=============================================================================
PILLAR 3: GOLDEN MASTER IN-CONTEXT EXAMPLES (STUDY THESE CAREFULLY - ${activeGenre.name.toUpperCase()})
=============================================================================
${activeGenre.goldenMasterA}

${activeGenre.goldenMasterB}

${activeGenre.goldenMasterC}

=============================================================================
OUTPUT REQUIREMENTS:
- Return ONLY valid TypeScript/React code.
- Export a React component named Scene${sceneIndex}.
- Imports needed:
  import React from 'react';
  import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
  import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';
- Return raw code without markdown backticks.
`;

    let generatedCode = '';
    let astValid = false;
    let attempts = 0;

    while (!astValid && attempts < 3) {
      attempts++;
      const codeRes = await generateWithCluster('coder', {
        contents: [{ role: 'user', parts: [{ text: coderPrompt }] }],
      });

      generatedCode = cleanGeneratedCode(codeRes.text);

      const astCheck = validatePopVectorSceneCode(generatedCode, { 
        isFinance, 
        era: activeGenre.era, 
        genreId: activeGenre.id 
      });
      if (astCheck.valid) {
        astValid = true;
        console.log(`   ✅ AST Gate Passed: Scene ${sceneIndex} syntax is 100% clean.`);
      } else {
        console.warn(`   ⚠️ AST Issue in Scene ${sceneIndex} (Attempt ${attempts}): ${astCheck.message}. Self-healing...`);
        const debugRes = await generateWithCluster('debugger', {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Fix the following React/Remotion Scene code syntax error: ${astCheck.message}\nCode:\n${generatedCode}\nReturn ONLY the repaired raw code without markdown backticks.`,
                },
              ],
            },
          ],
        });
        generatedCode = cleanGeneratedCode(debugRes.text);
      }
    }

    const sceneFilePath = path.join(autonomousDir, `Scene${sceneIndex}.tsx`);
    fs.writeFileSync(sceneFilePath, generatedCode, 'utf-8');

    // =============================================================================
    // PILLAR 4: CLOSED-LOOP VISION WATCHDOG INTEGRATION
    // =============================================================================
    if (!options.skipVision) {
      console.log(`   👁️ [PILLAR 4: VISION GATE] Auditing Scene ${sceneIndex} rendered frame...`);
      const testFrame = Math.max(0, beatInfo.startFrame + Math.min(30, Math.floor(beatInfo.durationInFrames / 2)));
      const proofPath = path.join(proofDir, `scene_${sceneIndex}_proof.png`);

      let visionPassed = false;
      let visionAttempts = 0;

      while (!visionPassed && visionAttempts < 2) {
        visionAttempts++;
        try {
          // Render still frame of AutonomousPopVectorHi at testFrame
          const cleanProofPath = proofPath.split('\\').join('/');
          execSync(
            `npx remotion still src/index.ts AutonomousPopVectorHi "${cleanProofPath}" --frame=${testFrame} --gl=angle`,
            { cwd: PROJECT_ROOT, stdio: 'pipe' }
          );

          const audit = await auditPopVectorStill({
            imagePath: proofPath,
            topic: titleHinglish || titleHi,
            sceneIndex,
            narration: sceneMeta.narration_en || sceneMeta.narration,
            expectedHero: sceneMeta.heroElement,
          });

          if (audit.passed && audit.score >= 8.0) {
            visionPassed = true;
            console.log(`   🎉 [VISION WATCHDOG APPROVED] Scene ${sceneIndex}: Score ${audit.score}/10! Bold, grounded Kurzgesagt quality.`);
          } else {
            console.warn(`   ⚠️ [VISION WATCHDOG REJECTED] Scene ${sceneIndex} (Attempt ${visionAttempts}, Score ${audit.score}/10): ${audit.critique}`);
            console.warn(`      Fixes: ${audit.recommendations?.slice(0, 2).join(' | ')}`);

            if (visionAttempts < 2) {
              console.log(`   🔧 Vision-guided healing: requesting code repair from Debugger...`);
              const repairPrompt = `
You are the Lead Vector Animator. The Senior Art Director / Vision Watchdog REJECTED Scene ${sceneIndex} with Score ${audit.score}/10.
Critique: "${audit.critique}"
Critical Defects Detected:
- Character / Prop Collision: ${audit.collision_detected}
- Floating / Ungrounded in Air: ${audit.floating_detected}
- Staging / Layout Defect: ${audit.staging_defect_detected}
- Mutant / Duplicate Eyes: ${audit.mutant_eyes_detected}
- Empty Sterile Void (>35% void): ${audit.empty_void_detected}
- Primitive Doodle: ${audit.primitive_doodle_detected}
- Text / Badge Overlap: ${audit.text_overlap_detected}
- Fallback Placeholder Card ("ACTIVE PROP"): ${audit.fallback_card_detected}
- Era Anachronism (Modern item in Ancient scene): ${audit.anachronism_detected}
- Screen-Blocking Monolith (>20% flat color block): ${audit.screen_block_detected}
- Duplicate / Competing Subtitles: ${audit.duplicate_subtitles_detected}
- Asset Dumping (>1 hero prop clumped together): ${audit.asset_dump_detected}

Required Art Director Fixes:
${(audit.recommendations || []).map((r) => `- ${r}`).join('\n')}

MANDATORY RULES FOR MODULAR REPAIR:
1. USE MODULAR RIGS: Do NOT draw manual SVG bodies or raw path doodles! Use:
   import { RoomEnvironment, CharacterRig, HeroProp, StageConnector } from '../../components/rigs';
2. Ground the scene with a proper <RoomEnvironment type=${allowedEnvironments}>.
3. FIX STAGING TO MATCH ONE OF 4 STRICT ARCHETYPES:
   - If Duo (Character + Prop): <HeroProp x={340} y={960} scale={1.15} /> and <CharacterRig role="..." x={760} y={940} scale={1.15} breathing={true} blinking={true} />. ZERO OVERLAP & GROUNDED!
   - If Solo Object: <HeroProp x={540} y={960} scale={1.35} /> with flanking props at x={160} and x={920}. Grounded on Y=1220 horizon!
   - If Reaction Face: <CharacterRig role="..." x={540} y={800} scale={1.5} breathing={true} blinking={true} />.
   - If Confrontation: Left <CharacterRig role="pandava" x={280} y={940} scale={1.1} />, Center <HeroProp type="sword_shield_emblem" x={540} y={940} scale={1.05} />, Right <CharacterRig role="duryodhana" x={800} y={940} scale={1.1} flipHorizontal={true} />.
4. ROLE & ATTIRE: Use role="shakuni" | "duryodhana" | "pandava" | "chanakya" | "commoner" on <CharacterRig> for authentic Indian look.
5. TEMPORAL STAGGER: Stagger badge (frame 0), prop (frame 10-15), character (frame 25-35), and subtle camera push.
6. GROUNDING: The floor horizon is at Y=1220. HeroProp must have y=960 (scale 1.15) and CharacterRig must have y=940 (scale 1.15) so pedestal and Padukas sit firmly on the floor at Y=1236-1262. NO FLOATING IN MID-AIR!
7. Subtitle Safe Zone: keep Y=1320 to Y=1750 free of character faces and large props.
8. NO ENDLESS SINE VIBRATING: Use shakeIntensity={propSpring} on HeroProp, do not write continuous sine oscillations.
9. ZERO FALLBACK CARDS: Only use allowed props: ${allowedPropsDesc}.
10. ZERO SUBTITLE DIVS: Remove all inline subtitle spans and text divs! The global captions engine renders all subtitles.
11. ZERO SCREEN-BLOCKING DIVS: Remove raw rectangular divs like <div style={{ backgroundColor: '#f0f0f0', height: 700 }} />!
12. ERA PURITY: ${bannedPropsDesc}
13. MAX 1 HERO PROP: Never dump multiple unrelated objects together! Exactly 1 HeroProp per scene.

Current Code:
${generatedCode}

Return ONLY the repaired raw TypeScript/React code without markdown backticks.
`;
              const debugRes = await generateWithCluster('debugger', {
                contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
              });

              const repairedCode = cleanGeneratedCode(debugRes.text);
              const astCheck = validatePopVectorSceneCode(repairedCode, { 
                isFinance, 
                era: activeGenre.era, 
                genreId: activeGenre.id 
              });
              if (astCheck.valid) {
                generatedCode = repairedCode;
                fs.writeFileSync(sceneFilePath, generatedCode, 'utf-8');
                console.log(`   ✅ Visual repair written to disk. Re-auditing frame...`);
              } else {
                console.warn(`   ⚠️ Repaired code had AST issue (${astCheck.message}), keeping previous valid version.`);
                break;
              }
            }
          }
        } catch (visionErr) {
          const errOutput = visionErr.stderr?.toString() || visionErr.stdout?.toString() || visionErr.message || '';
          console.warn(`   ⚠️ Scene ${sceneIndex} render test encountered runtime error: ${errOutput.slice(0, 150)}`);
          if (visionAttempts < 2) {
            console.log(`   🔧 Runtime render crash detected! Sending stack trace to Debugger...`);
            const crashRepairPrompt = `
You are the Lead Remotion Debugger. Scene ${sceneIndex} crashed at runtime during rendering.
Runtime Error Details:
${errOutput.slice(0, 1000)}

Code that crashed:
${generatedCode}

RULES FOR FIXING:
1. Fix any undefined property accesses (e.g., use direct hex strings '#EF4444' instead of colors.red[500]).
2. For Remotion interpolate(): ensure inputRange is strictly monotonically increasing (e.g. [-20, 0] instead of [0, -20]).
3. For Remotion interpolateColors(): pass 3 positional arguments: interpolateColors(value, inputRange, outputRange).
4. Return ONLY the repaired raw TypeScript/React code without markdown backticks.
`;
            try {
              const debugRes = await generateWithCluster('debugger', {
                contents: [{ role: 'user', parts: [{ text: crashRepairPrompt }] }],
              });
              const repairedCode = cleanGeneratedCode(debugRes.text);
              const astCheck = validatePopVectorSceneCode(repairedCode, { 
                isFinance, 
                era: activeGenre.era, 
                genreId: activeGenre.id 
              });
              if (astCheck.valid) {
                generatedCode = repairedCode;
                fs.writeFileSync(sceneFilePath, generatedCode, 'utf-8');
                console.log(`   ✅ Crash repair written to disk. Re-testing render...`);
                continue;
              }
            } catch (healErr) {
              console.warn(`   ⚠️ Debugger failover error during crash repair: ${healErr.message?.slice(0, 80)}`);
            }
          }
          break;
        }
      }
    }
  }

  console.log('\n===============================================================');
  console.log(`🎉 [BESPOKE POP-VECTOR CODE SYNTHESIS COMPLETE]`);
  console.log(`   All ${totalScenes} scenes synthesized with CAD precision & Vision Watchdog approval!`);
  console.log('===============================================================\n');

  return {
    success: true,
    topic,
    titleEn: titleHinglish,
    titleHinglish,
    titleHi,
    totalScenes,
    scriptData: scriptPayload,
    manifestHi,
  };
}

// CLI direct run support
if (process.argv[1] && process.argv[1].endsWith('autonomous_pop_vector_engine.js')) {
  const useExisting = process.argv.includes('--use-existing-script') || process.argv.includes('--existing');
  const startArg = process.argv.find((a) => a.startsWith('--start-scene='));
  const startScene = startArg ? parseInt(startArg.split('=')[1], 10) : 1;
  const endArg = process.argv.find((a) => a.startsWith('--end-scene='));
  const endScene = endArg ? parseInt(endArg.split('=')[1], 10) : null;
  const skipVision = process.argv.includes('--skip-vision');
  const argsWithoutFlags = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const testTopic = argsWithoutFlags[0] ||
    "Shakuni's Psychological Warfare: How an unarmed strategist dismantled an empire from within";
  runAutonomousPopVector(testTopic, { useExistingScript: useExisting, startScene, endScene, skipVision }).catch(console.error);
}
