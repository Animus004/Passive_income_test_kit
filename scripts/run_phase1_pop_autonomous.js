import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

import { generateWithCluster } from './gemini_cluster.js';

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

// Verified Pre-Cooked Era Catalogues
const ERA_CATALOG = {
  ancient: {
    environments: [
      'ancient_palace',
      'durbar_throne_room',
      'temple_vault',
      'subterranean_dungeon_vault',
      'chaupar_board_arena',
      'puppet_stage_shadow'
    ],
    roles: ['chanakya', 'shakuni', 'duryodhana', 'pandava', 'king', 'ancient_commoner'],
    props: [
      'chanakya_scroll',
      'poison_kanya_goblet',
      'sword_shield_emblem',
      'two_faced_mask',
      'mystic_diya_flame',
      'ashoka_pillar_emblem',
      'gold_coins_overflow_chest',
      'vault_b_door',
      'shakuni_dice',
      'chaupar_board_macro',
      'puppet_control_cross',
      'puppet_strings',
      'golden_sparrow_bird',
      'viral_comment_bubbles'
    ]
  },
  modern: {
    environments: [
      'modern_finance',
      'office_desk',
      'bedroom_dark',
      'kitchen_morning'
    ],
    roles: ['modern_creator', 'modern_commoner'],
    props: [
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
      'viral_comment_bubbles'
    ]
  }
};

const SEED_TOPIC_PRESETS = [
  {
    topic: "Chanakya Niti: Why the friend who agrees with everything you say is your slow poison",
    era: "ancient",
    genre: "ancient_strategy"
  },
  {
    topic: "Shakuni's Psychological Warfare: How an unarmed strategist manipulated powerful kings to destroy themselves",
    era: "ancient",
    genre: "ancient_strategy"
  },
  {
    topic: "The Hidden Padmanabhaswamy Vault B: Why opening the 7th cobra door was halted",
    era: "ancient",
    genre: "ancient_mystery"
  },
  {
    topic: "Salary Credited on 1st, Zero Balance on 5th: The invisible credit card and EMI wealth trap",
    era: "modern",
    genre: "modern_finance"
  },
  {
    topic: "Lifestyle Inflation: How earning 3x more still leaves your bank account completely dry",
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
  const isAncient = topic.toLowerCase().includes('chanakya') ||
                    topic.toLowerCase().includes('shakuni') ||
                    topic.toLowerCase().includes('vault') ||
                    topic.toLowerCase().includes('mahabharata') ||
                    topic.toLowerCase().includes('ancient') ||
                    topic.toLowerCase().includes('palace') ||
                    options.era === 'ancient';
  const era = isAncient ? 'ancient' : 'modern';
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
3. Subtitle Tokens ("display_tokens_hi"): 3 to 6 Romanized Hinglish words per beat (e.g. ["Chanakya", "Ne", "Kaha", "Tha...", "ASLI KHATRA!"]).
4. STRICT ERA ASSETS:
   - "environment" MUST be strictly one of: ${JSON.stringify(catalog.environments)}
   - "heroElement" MUST be strictly one of: ${JSON.stringify(catalog.props)}
   - "role" MUST be strictly one of: ${JSON.stringify(catalog.roles)}
5. NARRATIVE PROGRESSION:
   - Beat 1-2: Hook & Illusion Shatter
   - Beat 3-4: The Trap / Real Danger
   - Beat 5-6: The Hidden Rule / Revelation
   - Beat 7: Tactical Action
   - Beat 8: Polarizing Question / Comment Trap
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
      "archetype": "CLEAN_SPLIT_DUO"
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

  // Fallback seed if needed
  if (!scriptData || !scriptData.beats || scriptData.beats.length < 6) {
    console.log('ℹ️ Using high-quality curated seed fallback for script...');
    scriptData = {
      title_hi: "मीठा बोलने वाला दोस्त सबसे बड़ा खतरा है",
      title_hinglish: "CHANAKYA NITI: THE FAKE FRIEND TRAP",
      beats: [
        {
          id: 1,
          title: "MEETHA DOST",
          badge: "RULE 1",
          badgeEmoji: "📜",
          narration_hi: "चाणक्य ने 2300 साल पहले एक brutal सच कहा था.",
          display_tokens_hi: ["CHANAKYA", "NE", "KAHA", "THA..."],
          environment: "ancient_palace",
          heroElement: "chanakya_scroll",
          role: "chanakya",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 2,
          title: "SLOW POISON",
          badge: "DANGER",
          badgeEmoji: "⚠️",
          narration_hi: "जो दोस्त तुम्हारी हर गलती पर हाँ बोले, वो दोस्त नहीं... slow poison है.",
          display_tokens_hi: ["HAR", "BAAT", "PAR", "HAAN", "SLOW", "POISON!"],
          environment: "ancient_palace",
          heroElement: "two_faced_mask",
          role: "chanakya",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 3,
          title: "SWEET WORDS",
          badge: "SECRET",
          badgeEmoji: "🤫",
          narration_hi: "मीठी बातें करने वाले लोग सामने तारीफ और पीठ पीछे गड्ढा खोदते हैं.",
          display_tokens_hi: ["MEETHE", "LOG", "PEETH", "PEECHE", "KHATRA!"],
          environment: "durbar_throne_room",
          heroElement: "poison_kanya_goblet",
          role: "ancient_commoner",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 4,
          title: "BITTER TRUTH",
          badge: "WISDOM",
          badgeEmoji: "💡",
          narration_hi: "सच्चा दोस्त वही है जो कड़वी बात मुँह पर बोले, लेकिन तुम्हारी तरक्की चाहे.",
          display_tokens_hi: ["SACCHA", "DOST", "KADWA", "SACH", "BOLTA", "HAI"],
          environment: "durbar_throne_room",
          heroElement: "sword_shield_emblem",
          role: "king",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 5,
          title: "CHANAKYA RULE",
          badge: "TACTIC",
          badgeEmoji: "⚖️",
          narration_hi: "चाणक्य कहते हैं: कभी अपने secret plans ऐसे लोगों को मत बताओ.",
          display_tokens_hi: ["SECRET", "PLANS", "KABHI", "MAT", "BATAO!"],
          environment: "temple_vault",
          heroElement: "gold_coins_overflow_chest",
          role: "chanakya",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 6,
          title: "TEST OF TIME",
          badge: "TEST",
          badgeEmoji: "🔥",
          narration_hi: "बुरे वक्त में जो साथ खड़ा रहे, वही असली हीरा है... बाकी सब सिर्फ भीड़ हैं.",
          display_tokens_hi: ["BURE", "WAQT", "MEIN", "ASLI", "HEERA!"],
          environment: "subterranean_dungeon_vault",
          heroElement: "mystic_diya_flame",
          role: "chanakya",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 7,
          title: "CHOOSE WISELY",
          badge: "ACTION",
          badgeEmoji: "🎯",
          narration_hi: "आज ही अपने सर्कल को ऑडिट करो और fake चापलूसों को बाहर का रास्ता दिखाओ.",
          display_tokens_hi: ["CIRCLE", "AUDIT", "KARO", "FAKE", "LOG", "OUT!"],
          environment: "ancient_palace",
          heroElement: "ashoka_pillar_emblem",
          role: "king",
          archetype: "CLEAN_SPLIT_DUO"
        },
        {
          id: 8,
          title: "COMMENT BELOW",
          badge: "DEBATE",
          badgeEmoji: "💬",
          narration_hi: "क्या तुम्हारे पास ऐसा कोई सच्चा दोस्त है? कमेंट में उसका नाम Tag करो!",
          display_tokens_hi: ["SACCHE", "DOST", "KO", "TAG", "KARO", "NICHE!"],
          environment: "ancient_palace",
          heroElement: "viral_comment_bubbles",
          role: "chanakya",
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

  // Merge script beat recipe into manifest beats
  manifestHi.beats = manifestHi.beats.map((b, idx) => {
    const s = scriptData.beats[idx] || {};
    return {
      ...b,
      title: s.title || b.title,
      badge: s.badge || 'RULE',
      badgeEmoji: s.badgeEmoji || (isAncient ? '📜' : '🚨'),
      environment: s.environment || b.environment || (isAncient ? 'ancient_palace' : 'modern_finance'),
      heroElement: s.heroElement || b.heroElement || (isAncient ? 'chanakya_scroll' : 'salary_slip_drain'),
      character: {
        role: s.role || (isAncient ? 'chanakya' : 'modern_creator'),
        pose: s.archetype === 'REACTION_CLOSEUP' ? 'shock_hands_on_head' : (isAncient ? 'chanakya_pointing' : 'holding_phone')
      },
      director_staging: {
        archetype: s.archetype || 'CLEAN_SPLIT_DUO'
      }
    };
  });

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
  console.log('\n📸 [STEP 5/5] Extracting 5 QA Keyframe Stills & Copying Artifacts...');
  const keyframes = [
    { name: 'p1_01_hook_punch', time: '00:00:00.500', label: 'Beat 1 Hook Crash Zoom' },
    { name: 'p1_02_danger_split', time: '00:00:05.000', label: 'Beat 2 Split Duo & Mask' },
    { name: 'p1_03_durbar_dialogue', time: '00:00:12.000', label: 'Beat 4 Throne Room Dialogue' },
    { name: 'p1_04_vault_wisdom', time: '00:00:20.000', label: 'Beat 5 Temple Vault & Gold' },
    { name: 'p1_05_climax_outro', time: '00:00:30.000', label: 'Beat 8 Climax Reaction' }
  ];

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
  runPhase1PopAutonomous().catch(err => {
    console.error('❌ Phase 1 runner failed:', err);
    process.exit(1);
  });
}
