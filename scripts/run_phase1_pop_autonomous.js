import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

import { generateWithCluster } from './gemini_cluster.js';
import { ERA_CATALOG, detectEra, enrichManifestWithChoreography } from './pop_script_generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const SCRATCH_DIR = path.join(PROJECT_ROOT, 'scratch');
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(OUT_DIR, 'artifacts');

// Ensure working directories exist
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SCRATCH_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const SEED_TOPIC_PRESETS = [
  {
    topic: "Krishna's Supreme Strategy: Why the Sudarshan Chakra was the absolute last resort in Kurukshetra",
    era: "ancient",
    genre: "ancient_strategy"
  },
  {
    topic: "Chanakya Niti: Why the friend who agrees with everything you say is your slow poison",
    era: "ancient",
    genre: "ancient_strategy"
  },
  {
    topic: "Shivaji Maharaj's Guerilla Warfare: How 300 Marathas neutralized imperial armies of 10,000",
    era: "ancient",
    genre: "ancient_strategy"
  },
  {
    topic: "Shakuni's Psychological Warfare: How an unarmed strategist manipulated powerful kings to destroy themselves",
    era: "ancient",
    genre: "ancient_strategy"
  },
  {
    topic: "The 9-to-5 Middle Class Trap: Cutting Chai, Pink Slips, and Invisible EMI Chains",
    era: "modern",
    genre: "modern_finance"
  }
];

export async function runPhase1PopAutonomous(topicOverride = null, options = {}) {
  console.log('===============================================================');
  console.log('💥 PHASE 1 (2D POP-VECTOR ENGINE): DECLARATIVE AUTONOMOUS PRODUCTION');
  console.log('===============================================================\n');

  // Step 0: Determine Topic & Era Lock
  const selectedPreset = SEED_TOPIC_PRESETS[Math.floor(Math.random() * SEED_TOPIC_PRESETS.length)];
  const topic = topicOverride || options.topic || selectedPreset.topic;
  const era = detectEra(topic, options.era || (selectedPreset && !topicOverride ? selectedPreset.era : null));
  const isAncient = era === 'ancient';
  const catalog = ERA_CATALOG[era];

  console.log(`🎬 Target Topic: "${topic}"`);
  console.log(`🏛️ Era Lock: ${era.toUpperCase()} (Strictly 100% ${era} assets - Zero Anachronism)\n`);

  // Step 1: Generate Showrunner Script via Gemini Cluster
  console.log('🧠 [STEP 1/5] Synthesizing 8-Beat Conversational Script via Gemini Cluster...');
  const prompt = `You are the Executive Showrunner for "Oddly Told India" — a viral 2D Pop-Vector animation channel.
Topic: "${topic}"
Target Era: ${era.toUpperCase()}

MANDATES:
1. Exactly 8 rapid micro-beats (~32-38 seconds total).
2. Spoken Hindi ("narration_hi"): Conversational, intelligent Hindi (like Nitish Rajput / Think School). Avoid textbook archaic Sanskrit Hindi.
3. Subtitle Tokens ("display_tokens_hi"): 3 to 6 Romanized Hinglish words per beat (e.g. ["SHAKUNI", "NE", "PHEKA", "PASHA...", "ASLI KHATRA!"]).
4. STRICT ERA ASSETS & THEMATIC ALIGNMENT:
   - "environment" MUST be strictly one of: ${JSON.stringify(catalog.environments)}
   - "heroElement" MUST be strictly one of: ${JSON.stringify(catalog.props)}
   - "role" MUST be strictly one of: ${JSON.stringify(catalog.roles)}
   - THEMATIC ACCURACY & HERO RIG ROUTING (CRITICAL):
     • Historical/Mythological Legends automatically route to our high-craft Heroic Legends Library (4.8-head anatomy, authentic crowns & weapons). Choose heroic poses strictly from: "heroic_idle", "guru_updesh", "wielding_chakra", "playing_bansuri", "archer_aiming", "warrior_stance", "holding_scroll", "orator_folded", "chaupar_scheme".
     • If topic is about Krishna/Mahabharata: Use "krishna" ("wielding_chakra", "guru_updesh", "playing_bansuri"), "arjuna" ("archer_aiming"), "karna" ("archer_aiming"), "bhishma" ("warrior_stance"), "shakuni" ("chaupar_scheme"), "duryodhana" ("warrior_stance").
     • If topic is about Ramayana/Shiva: Use "rama" ("archer_aiming", "heroic_idle"), "hanuman" ("warrior_stance"), "shiva" ("warrior_stance", "heroic_idle"), "ravana" ("warrior_stance").
     • If topic is about Shivaji / Pratap / History: Use "shivaji" ("warrior_stance"), "maharana_pratap" ("warrior_stance"), "lakshmibai" ("warrior_stance"), "ashoka" ("guru_updesh"), "chanakya" ("holding_scroll"), "vivekananda" ("orator_folded").
     • If topic is about Modern Work/Finance: Use everyday comedy rig "it_engineer", "middle_class_uncle", "toxic_boss", "modern_creator", props: "chai_glass_cutting", "pink_slip_termination", "broken_credit_chains".
5. MANDATORY 7 DYNAMIC SCENE ARCHETYPES (Crucial to prevent visual monotony!):
   - Beat 1: "MACRO_HOOK_PUNCH" (Extreme thumb-stopping hook shot; MUST include "hookHeadline" max 5 words in ALL CAPS)
   - Beat 2: "DUAL_CONFRONTATION" (Two figures face-to-face, e.g. krishna + arjuna, shivaji + opponent, or shakuni + duryodhana, with secondCharacter: {"role": "arjuna", "pose": "archer_aiming"})
   - Beat 3: "STRATEGY_MAP_ARENA" (Overview of tactical war map or Chaupar board, pose: "puppeteer_strings")
   - Beat 4: "DOCUMENT_EDICT_UNROLL" (Unrolled ancient decree or parchment rule, pose: "chanakya_pointing")
   - Beat 5: "TENSION_HUD_METER" (Dynamic risk/deceit gauge spiking to 99%, pose: "shock_hands_on_head")
   - Beat 6: "METAPHOR_MONOLITH" (Massive symbolic centerpiece: shattered crown, tipping scales, or giant puppet shadow)
   - Beat 7: "CLEAN_SPLIT_DUO" (Tactical advice, character pointing at emblem)
   - Beat 8: "REACTION_CLOSEUP" (Extreme bust close-up with polarizing debate question)
6. Return strictly valid JSON:
{
  "title_hi": "Title in conversational Hindi",
  "title_hinglish": "TITLE IN ALL CAPS HINGLISH",
  "beats": [
    {
      "id": 1,
      "title": "HOOK TITLE",
      "badge": "RULE 1",
      "badgeEmoji": "📜",
      "narration_hi": "Spoken Hindi text in Devanagari",
      "display_tokens_hi": ["ROMANIZED", "HINGLISH", "WORDS"],
      "environment": "${catalog.environments[0]}",
      "heroElement": "${catalog.props[0]}",
      "role": "${catalog.roles[0]}",
      "pose": "rolling_dice",
      "archetype": "MACRO_HOOK_PUNCH"
    }
  ]
}`;

  let scriptData = null;
  try {
    const res = await generateWithCluster('showrunner', {
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    if (res && res.text) {
      let cleanJson = res.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) cleanJson = match[0];
      scriptData = JSON.parse(cleanJson);
    }
  } catch (err) {
    console.warn('⚠️ Showrunner LLM fallback notice:', err.message);
  }

  // Fallback seed with 7 Dynamic Scene Archetypes
  if (!scriptData || !scriptData.beats || scriptData.beats.length < 6) {
    console.log('ℹ️ Using high-quality curated seed fallback for script...');
    scriptData = {
      title_hi: "शकुनि का वो ख़तरनाक दिमाग जिसने बिना लड़े पूरा कुरुवंश ख़त्म किया",
      title_hinglish: "SHAKUNI'S PSYCHOLOGICAL WARFARE: UNARMED DESTRUCTION",
      beats: [
        {
          id: 1,
          title: "FATAL ROLL",
          hookHeadline: "BINA HATHIYAR PURA VAMSH KHATAM!",
          badge: "CRITICAL HOOK",
          badgeEmoji: "🎲",
          narration_hi: "शकुनि ने बिना कोई हथियार उठाए पूरे कुरुक्षेत्र को आग में झोंक दिया.",
          display_tokens_hi: ["BINA", "HATHIYAR", "PURAA", "VAMSH", "KHATAM!"],
          environment: "chaupar_board_arena",
          heroElement: "shakuni_dice",
          role: "shakuni",
          pose: "rolling_dice",
          archetype: "MACRO_HOOK_PUNCH"
        },
        {
          id: 2,
          title: "THE POISON EAR",
          badge: "CONSPIRACY",
          badgeEmoji: "🤫",
          narration_hi: "उसने दुर्योधन की आँखों पर पट्टी नहीं बांधी, बल्कि उसके कान में अहंकार का ज़हर घोला.",
          display_tokens_hi: ["DUYODHANA", "KE", "KAAN", "MEIN", "ZAHAR!"],
          environment: "durbar_throne_room",
          heroElement: "two_faced_mask",
          role: "shakuni",
          pose: "whispering_sly",
          secondCharacter: { role: "duryodhana", pose: "wealth_proud_chest", face: "shock_alarm" },
          archetype: "DUAL_CONFRONTATION"
        },
        {
          id: 3,
          title: "CHAUPAR ARENA",
          badge: "BATTLEFIELD",
          badgeEmoji: "♟️",
          narration_hi: "चौपड़ का खेल कोई जुआ नहीं था, वो एक psychological battlefield था जहाँ हर पाशा फिक्स्ड था.",
          display_tokens_hi: ["KHEL", "NAHI", "PSYCHOLOGICAL", "WARFARE", "THA!"],
          environment: "chaupar_board_arena",
          heroElement: "ancient_war_map_bharat",
          role: "shakuni",
          pose: "puppeteer_strings",
          archetype: "STRATEGY_MAP_ARENA"
        },
        {
          id: 4,
          title: "UNWRITTEN RULE",
          badge: "WISDOM",
          badgeEmoji: "📜",
          narration_hi: "चाणक्य भी यही कहते हैं: जो इंसान तुम्हारे गुस्से का फायदा उठाए, वो तुम्हारा सबसे बड़ा दुश्मन है.",
          display_tokens_hi: ["GUSSE", "KA", "FAYDA", "UTHANE", "WALA", "DUSHMAN!"],
          environment: "ancient_palace",
          heroElement: "chanakya_scroll",
          role: "chanakya",
          pose: "chanakya_pointing",
          archetype: "DOCUMENT_EDICT_UNROLL"
        },
        {
          id: 5,
          title: "EGO METER SPIKE",
          badge: "DANGER",
          badgeEmoji: "⚠️",
          narration_hi: "जब इंसान का अहंकार निन्यानवे प्रतिशत पर पहुँचता है, तो विनाश तय हो जाता है.",
          display_tokens_hi: ["AHANKAAR", "99%", "VINASH", "DEFINITE!"],
          environment: "subterranean_dungeon_vault",
          heroElement: "tension_gauge_hud",
          role: "king",
          pose: "shock_hands_on_head",
          archetype: "TENSION_HUD_METER"
        },
        {
          id: 6,
          title: "SHATTERED CROWN",
          badge: "METAPHOR",
          badgeEmoji: "👑",
          narration_hi: "जिस हस्तिनापुर के मुकुट के लिए यह साज़िश रची गई, वही मुकुट श्मशान की राख बन गया.",
          display_tokens_hi: ["MUKUT", "SHMASHAN", "KI", "RAAKH", "BANA!"],
          environment: "temple_vault",
          heroElement: "shattered_crown",
          role: "king",
          pose: "wealth_proud_chest",
          archetype: "METAPHOR_MONOLITH"
        },
        {
          id: 7,
          title: "PROTECT YOUR CIRCLE",
          badge: "TACTIC",
          badgeEmoji: "🎯",
          narration_hi: "अपनी ज़िंदगी से उन शकुनियों को बाहर निकालो जो तुम्हें तुम्हारी ही ग़लतियों पर उकसाते हैं.",
          display_tokens_hi: ["SHAKUNIYO", "KO", "BAHAR", "NIKALO", "TODAY!"],
          environment: "ancient_palace",
          heroElement: "sword_shield_emblem",
          role: "chanakya",
          pose: "chanakya_pointing",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 8,
          title: "COMMENT BELOW",
          badge: "DEBATE",
          badgeEmoji: "💬",
          narration_hi: "क्या तुम्हारे सर्कल में भी कोई ऐसा मैनिपुलेटर है? कमेंट में यस या नो लिखो!",
          display_tokens_hi: ["KYA", "TERE", "PASS", "MANIPULATOR", "HAI?"],
          environment: "chaupar_board_arena",
          heroElement: "viral_comment_bubbles",
          role: "shakuni",
          pose: "shock_hands_on_head",
          archetype: "REACTION_CLOSEUP"
        }
      ]
    };
  }

  console.log(`✅ Script Locked: "${scriptData.title_hinglish}" (${scriptData.beats.length} micro-beats)`);

  // Step 2: Audio Synthesis via oddly_audio_synthesizer.py
  console.log('\n🎙️ [STEP 2/5] Synthesizing Neural Audio (Piper Rohan) + Multi-Beat Procedural SFX...');
  const scriptPath = path.join(SCRATCH_DIR, 'current_oddly_script.json');
  const payload = {
    topic,
    title_hi: scriptData.title_hi,
    title_hinglish: scriptData.title_hinglish,
    hi: {
      title: scriptData.title_hi,
      title_hinglish: scriptData.title_hinglish,
      beats: scriptData.beats.map((b, idx) => ({
        id: b.id || idx + 1,
        title: b.title,
        badge: b.badge,
        badgeEmoji: b.badgeEmoji,
        audio_text: b.narration_hi,
        display_tokens: b.display_tokens_hi || [],
        environment: b.environment,
        heroElement: b.heroElement,
        role: b.role,
        archetype: b.archetype || 'CLEAN_SPLIT_DUO'
      }))
    }
  };

  fs.writeFileSync(scriptPath, JSON.stringify(payload, null, 2), 'utf-8');

  // Run offline Python audio synthesizer
  execSync(`python scripts/oddly_audio_synthesizer.py --script "${scriptPath.replace(/\\/g, '/')}" --lang hi --hindi-engine piper`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });

  // Step 3: Enrich Manifest with Declarative Staging
  console.log('\n📐 [STEP 3/5] Updating Declarative Manifest (src/data/oddly_manifest_hi.json)...');
  const manifestPath = path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_hi.json');
  const manifestHi = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Merge script beat recipe into manifest beats using shared choreography helper
  enrichManifestWithChoreography(manifestHi, scriptData, era);

  fs.writeFileSync(manifestPath, JSON.stringify(manifestHi, null, 2), 'utf-8');
  console.log(`✅ Manifest saved with ${manifestHi.beats.length} beats, total: ${manifestHi.totalFrames} frames (${(manifestHi.totalFrames / 30).toFixed(1)}s).`);

  // Step 4: Remotion Master Render
  console.log('\n🎬 [STEP 4/5] Rendering Remotion 2D Master (AutonomousPopVectorHi)...');
  const hiOut = path.join(OUT_DIR, 'phase1_pop_master.mp4');
  if (fs.existsSync(hiOut)) fs.unlinkSync(hiOut);

  const t0 = Date.now();
  execSync(`npx remotion render src/index.ts AutonomousPopVectorHi "${hiOut.replace(/\\/g, '/')}" --concurrency=2 --gl=angle`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });
  const renderSec = ((Date.now() - t0) / 1000).toFixed(1);
  const fileSizeMb = (fs.statSync(hiOut).size / 1024 / 1024).toFixed(2);
  console.log(`\n🎉 Remotion Master Rendered in ${renderSec}s! Size: ${fileSizeMb} MB`);

  // Step 5: Visual QA Stills & Artifact Extraction
  console.log('\n📸 [STEP 5/5] Extracting Dynamic Archetype QA Keyframe Stills & Copying Artifacts...');
  // Extract stills near the middle of each distinct archetype beat
  let accumSeconds = 0;
  const keyframes = [
    { name: 'p1_00_frame0_shock_title', time: '00:00:00.350', label: 'Beat 1: Frame-0 Kinetic Shock Title (Center Impact & Warning Pill)' }
  ];
  const archetypeLabels = [
    { name: 'p1_01_macro_hook_punch', label: 'Beat 1: Macro Hook Punch (Crash Zoom & Speed Rays)' },
    { name: 'p1_02_dual_confrontation', label: 'Beat 2: Dual Confrontation (Shakuni vs Duryodhana)' },
    { name: 'p1_03_strategy_arena', label: 'Beat 3: Strategy Map Arena (Tactical War Board)' },
    { name: 'p1_04_document_edict', label: 'Beat 4: Document Edict Unroll (Chanakya Niti Rule)' },
    { name: 'p1_05_tension_meter', label: 'Beat 5: Tension HUD Meter (99% Danger Gauge)' },
    { name: 'p1_06_shattered_crown', label: 'Beat 6: Metaphor Monolith (Shattered Crown Altar)' },
    { name: 'p1_07_reaction_closeup', label: 'Beat 8: Reaction Close-Up (Climax Question)' }
  ];

  for (let i = 0; i < manifestHi.beats.length; i++) {
    const b = manifestHi.beats[i];
    const beatDurSec = (b.durationInFrames || 120) / 30;
    const midSec = accumSeconds + beatDurSec * 0.45;
    accumSeconds += beatDurSec;

    const matchedLabel = archetypeLabels.find(a =>
      (i === 0 && a.name.includes('hook')) ||
      (i === 1 && a.name.includes('confrontation')) ||
      (i === 2 && a.name.includes('strategy')) ||
      (i === 3 && a.name.includes('document')) ||
      (i === 4 && a.name.includes('tension')) ||
      (i === 5 && a.name.includes('crown')) ||
      (i === 7 && a.name.includes('reaction'))
    );

    if (matchedLabel) {
      const mins = Math.floor(midSec / 60).toString().padStart(2, '0');
      const secs = (midSec % 60).toFixed(3).padStart(6, '0');
      keyframes.push({
        name: matchedLabel.name,
        time: `00:${mins}:${secs}`,
        label: matchedLabel.label
      });
    }
  }

  const extractedStills = [];
  for (const k of keyframes) {
    const localStill = path.join(SCRATCH_DIR, `${k.name}.jpg`);
    try {
      execSync(`ffmpeg -y -ss ${k.time} -i "${hiOut}" -frames:v 1 -q:v 2 "${localStill}"`, { stdio: 'ignore' });
      if (fs.existsSync(localStill)) {
        const destStill = path.join(ARTIFACT_DIR, `${k.name}.jpg`);
        fs.copyFileSync(localStill, destStill);
        extractedStills.push({ ...k, path: destStill });
        console.log(`  ✓ Extracted ${k.label}: ${k.name}.jpg`);
      }
    } catch (e) {
      console.warn(`  ⚠️ Could not extract frame at ${k.time}:`, e.message);
    }
  }

  // Copy final video to artifact directory
  const artifactVideoPath = path.join(ARTIFACT_DIR, 'phase1_pop_master.mp4');
  fs.copyFileSync(hiOut, artifactVideoPath);
  console.log(`  ✓ Copied master video: phase1_pop_master.mp4 (${fileSizeMb} MB)`);

  console.log('\n===============================================================');
  console.log('🏆 PHASE 1 AUTONOMOUS PRODUCTION COMPLETE!');
  console.log(`   • Title: "${scriptData.title_hinglish}"`);
  console.log(`   • Era: ${era.toUpperCase()}`);
  console.log(`   • Total Duration: ${(manifestHi.totalFrames / 30).toFixed(1)}s (${manifestHi.totalFrames} frames)`);
  console.log(`   • Render Speed: ${renderSec}s (vs 10 mins legacy TSX generation)`);
  console.log(`   • Video Artifact: ${artifactVideoPath}`);
  console.log('===============================================================\n');

  return {
    success: true,
    topic,
    titleHinglish: scriptData.title_hinglish,
    titleHi: scriptData.title_hi,
    totalFrames: manifestHi.totalFrames,
    videoPath: artifactVideoPath,
    stills: extractedStills
  };
}

if (process.argv[1] && process.argv[1].endsWith('run_phase1_pop_autonomous.js')) {
  const cliTopic = process.argv[2] || null;
  runPhase1PopAutonomous(cliTopic).catch(err => {
    console.error('❌ Phase 1 runner failed:', err);
    process.exit(1);
  });
}
