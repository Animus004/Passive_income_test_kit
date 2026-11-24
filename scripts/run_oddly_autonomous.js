/**
 * ==============================================================================
 * Autonomous 2D Vector Explainer Master Runner (Phase 1 Showrunner)
 * ==============================================================================
 * Master orchestrator for end-to-end autonomous 2D short-form content creation.
 * 
 * WORKFLOW ARCHITECTURE (30-Second Technical Overview):
 * 1. Slot & Topic Intelligence: Selects psychological, relatable, or financial topics
 *    matched to time-of-day slots (Morning, Afternoon, Evening, Late-Night).
 * 2. Vector Generation: Invokes `runAutonomousPopVector()` with the 5-layer firewall.
 * 3. Dual-Language Audio: Synthesizes high-fidelity voiceover (Kokoro-82M English &
 *    Piper/Edge-TTS Hindi) and extracts millisecond-accurate word boundaries.
 * 4. Remotion Video Rendering: Builds 1080x1920 vertical video with kinetic captions.
 * 5. Pre-Flight Watchdog & Publishing: Runs 6 automated safety gates, then dispatches
 *    to YouTube Shorts ("Focus Fuel Shorts"), Instagram Reels, and Facebook Pages.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateWithCluster } from './gemini_cluster.js';
import { auditOddlyVideo } from './oddly_watchdog.js';
import { publishPhase1 } from './publish_phase1.js';
import { runAutonomousPopVector } from './autonomous_pop_vector_engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCRATCH_DIR = path.join(PROJECT_ROOT, 'scratch');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');
const HISTORY_FILE = path.join(SCRATCH_DIR, 'oddly_history.json');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
fs.mkdirSync(SCRATCH_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// -------------------------------------------------------------
// 1. Topic Matrix & Slot Detection (Hindi Strategy, Wealth & Lore)
// -------------------------------------------------------------
const TOPIC_PRESETS = {
  morning: [
    {
      topic: "Salary aate hi 5 tareekh ko zero kyun ho jaati hai? The Middle-Class Wealth Trap",
      iconType: "wallet",
      theme: "SUNSET_CORAL",
    },
    {
      topic: "0% EMI ka asali sach: How no-cost EMIs trick middle class brains into lifelong debt",
      iconType: "credit_card",
      theme: "ELECTRIC_CYAN",
    },
    {
      topic: "iPhone on 24-month EMI vs ₹1,00,000 Index Fund: The silent wealth killer",
      iconType: "phone",
      theme: "SUNNY_GOLD",
    },
    {
      topic: "Middle class ki 3 sabse badi financial galtiyan jo aapko hamesha gareeb rakhti hain",
      iconType: "wallet",
      theme: "MINT_EMERALD",
    },
  ],
  afternoon: [
    {
      topic: "Chanakya ke 3 niyam jo dushman ko dost bana de: The Art of Strategic Silence",
      iconType: "scroll",
      theme: "SUNNY_GOLD",
    },
    {
      topic: "Mahabharata Power Dynamics: Krishna's psychological masterstroke against Karna",
      iconType: "sword",
      theme: "ELECTRIC_CYAN",
    },
    {
      topic: "Shakuni's Psychological Warfare: How an unarmed strategist dismantled an empire from within",
      iconType: "dice",
      theme: "MIDNIGHT_INDIGO",
    },
    {
      topic: "Chanakya Niti: In 3 logon ko kabhi apni kamzori mat batana, chahe wo kitne bhi kareebi hon",
      iconType: "scroll",
      theme: "SUNSET_CORAL",
    },
  ],
  evening: [
    {
      topic: "India ko Sone Ki Chidiya kyun kaha jaata tha? How ancient India controlled 32% of world GDP",
      iconType: "gold",
      theme: "SUNNY_GOLD",
    },
    {
      topic: "The Roman Gold Drain: Why the Roman Emperor banned Indian spice and textile imports",
      iconType: "coins",
      theme: "ELECTRIC_CYAN",
    },
    {
      topic: "Ancient Indian Banking: How temple treasuries funded India's global maritime trade empires",
      iconType: "temple",
      theme: "MINT_EMERALD",
    },
    {
      topic: "Ameer log cash kyun nahi rakhte: The wealth compounding secret ancient merchants knew",
      iconType: "vault",
      theme: "SUNNY_GOLD",
    },
  ],
  latenight: [
    {
      topic: "Padmanabhaswamy Mandir ke 7ve darwaze ke peeche kya hai? The 22 Billion Dollar Vault B Mystery",
      iconType: "vault",
      theme: "MIDNIGHT_INDIGO",
    },
    {
      topic: "Bhangarh Fort ka asli sach: The curse, acoustic echoes, and forbidden nights of India's ghost fort",
      iconType: "skull",
      theme: "MIDNIGHT_INDIGO",
    },
    {
      topic: "Kuldhara: Ek hi raat mein 84 gaon ke hazaron log kahan gayab ho gaye?",
      iconType: "ghost",
      theme: "MIDNIGHT_INDIGO",
    },
    {
      topic: "Kailash Temple: 400 saal aage ki engineering jo pahad ko upar se neeche kaat kar banayi gayi",
      iconType: "temple",
      theme: "ELECTRIC_CYAN",
    },
  ],
};

function getCurrentSlot() {
  const now = new Date();
  // IST is UTC + 5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  const hour = ist.getHours();

  if (hour >= 4 && hour < 10) return 'morning'; // 06:00 IST
  if (hour >= 10 && hour < 16) return 'afternoon'; // 12:00 IST
  if (hour >= 16 && hour < 22) return 'evening'; // 18:00 IST
  return 'latenight'; // 00:00 IST
}

function getRecentTopics() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    return (data || []).map((h) => (h.topic || '').toLowerCase());
  } catch (e) {
    return [];
  }
}

function recordHistory(entry) {
  let hist = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try { hist = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); } catch (e) {}
  }
  hist.push({
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (hist.length > 50) hist = hist.slice(-50);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(hist, null, 2));
}

// -------------------------------------------------------------
// 2. Gemini Showrunner Script Generator & Diversity Gate
// -------------------------------------------------------------
function validateScriptDiversity(scriptData, history, chosenTopic) {
  const beats = scriptData?.en?.beats || [];
  if (beats.length < 6) {
    return { valid: false, reason: `Too few beats: ${beats.length} (minimum 7 required)` };
  }

  // 1. Primitive Diversity: Count distinct primitives
  const primitives = beats.map((b) => b.primitive || 'HeroSolo');
  const uniquePrimitives = new Set(primitives);
  if (beats.length >= 8 && uniquePrimitives.size < 6) {
    return {
      valid: false,
      reason: `Insufficient visual diversity: only ${uniquePrimitives.size} unique primitives used across ${beats.length} beats (minimum 6 required). Primitives: ${Array.from(uniquePrimitives).join(', ')}`,
    };
  }

  // 2. No consecutive duplicate primitives
  for (let i = 1; i < primitives.length; i++) {
    if (primitives[i] === primitives[i - 1]) {
      return {
        valid: false,
        reason: `Consecutive duplicate primitive detected at beat ${i + 1} (${primitives[i]}). Each beat must transition to a fresh visual space!`,
      };
    }
  }

  // 3. Anchor & Slop String Scan: Reject lazy copy-pasted placeholders (ZERO REGEX)
  const BANNED_ANCHOR_PHRASES = [
    'SLACK BOMB',
    'CRINGE MEMORY',
    'BOMB DEFUSAL',
    'CALCULUS & ALGORITHMS',
    '8 HOURS SLEEP',
    'STARING AT CEILING',
    '$1,000,000 STARTUP',
    'DROPPED AT 2:48',
  ];

  for (const beat of beats) {
    const textBlob = `${beat.title || ''} ${beat.badge || ''} ${beat.subLabel || ''} ${beat.leftSub || ''} ${beat.rightSub || ''}`.toUpperCase();
    const topicUpper = chosenTopic.toUpperCase();
    for (const phrase of BANNED_ANCHOR_PHRASES) {
      if (textBlob.includes(phrase) && !topicUpper.includes(phrase)) {
        return {
          valid: false,
          reason: `Detected lazy anchor/slop placeholder "${phrase}" in beat ${beat.id}. Content must be 100% customized to "${chosenTopic}".`,
        };
      }
    }
  }

  // 4. Hindi Devanagari Voiceover Verification (Zero-Regex Character Code Scan)
  const hiBeats = scriptData?.hi?.beats || [];
  for (const beat of hiBeats) {
    const audioText = beat.audio_text || '';
    let devanagariCount = 0;
    let latinCount = 0;
    for (let c = 0; c < audioText.length; c++) {
      const code = audioText.charCodeAt(c);
      if (code >= 0x0900 && code <= 0x097F) {
        devanagariCount++;
      } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        latinCount++;
      }
    }
    // audio_text must be predominantly Devanagari for Edge-TTS neural model to pronounce natural Hindi
    if (latinCount > devanagariCount) {
      return {
        valid: false,
        reason: `Hindi audio_text in beat ${beat.id} was written in Roman script ("${audioText.slice(0, 30)}..."). It MUST be written in pure Devanagari script for natural Edge-TTS audio.`,
      };
    }
  }

  // 5. Anti-Repeat Check against Recent History Primitives
  if (history && history.length > 0) {
    const lastRun = history[history.length - 1];
    if (lastRun && lastRun.primitives) {
      const matchCount = primitives.filter((p, idx) => p === lastRun.primitives[idx]).length;
      if (matchCount > primitives.length * 0.75) {
        return {
          valid: false,
          reason: `Primitive sequence is >75% identical to previous run (${lastRun.slot}). Re-shuffling for fresh choreography.`,
        };
      }
    }
  }

  return { valid: true };
}

async function generateOddlyScript(chosenTopic, slotName) {
  console.log(`\n🧠 [GEMINI SHOWRUNNER] Generating Dual Script for Slot: ${slotName.toUpperCase()}`);
  console.log(`📌 Topic: "${chosenTopic}"`);

  let maxAttempts = 3;
  let lastErrorReason = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      console.warn(`🔄 [RETRY ${attempt}/${maxAttempts}] Diversity Gate rejected previous draft: ${lastErrorReason}. Re-generating with higher temperature...`);
    }

    const prompt = `
You are the Master Showrunner for a viral 2D cartoon explainer series in the style of Oddly Told (@WatchOddlyTold).
Topic: "${chosenTopic}"
Slot: ${slotName}
${lastErrorReason ? `PREVIOUS ATTEMPT FAILED QUALITY GATE BECAUSE: ${lastErrorReason}. FIX THIS IMMEDIATELY!` : ''}

CRITICAL COMEDY & PACING RULES:
1. "Catchy Humor" comes from immediate escalation and physical/visual exaggeration (e.g., treating a 2-word Slack message like a bomb defusal countdown, or arguing with a coffee menu like a toxic ex).
2. NO clever wordplay, no academic puns, no high-brow references. Everyday human relatable situations blown up to ridiculous proportions.
3. RAPID SENTENCE-LEVEL MICRO-BEATS (NO 5-BEAT CAP!):
   - Break the script into 8 to 12 dynamic micro-beats (approx 2.5 to 4 seconds each, 7 to 12 spoken words per beat).
   - Total video duration: 35-45 seconds.
   - Every single beat represents an immediate visual punch, prop escalation, or physical comedy shift! The screen must never sit static!

4. VISUAL DIVERSITY MANDATE & 14 PRIMITIVES (ZERO AI SLOP):
   You MUST use at least 6 to 8 DIFFERENT primitives across the beats.
   NEVER repeat the same primitive in two consecutive beats.
   Tailor ALL props, titles, badges, and labels SPECIFICALLY to this topic. ZERO generic placeholders!
   
   PRIMITIVES DICTIONARY & VISUAL RULES:
   - "CutawayLens": Dynamic X-ray magnifying lens revealing internal anatomy or stats.
     * IF THE SCENE IS ABOUT ENERGY LOSS, SUGAR CRASH, EXHAUSTION, OR BATTERY DRAIN:
       Set targetProp: "battery", statPercent: "15%", subLabel: "ENERGY LEVEL". This triggers the animated liquid battery drain with low-battery warning pulse!
     * IF ABOUT OVERTHINKING/AUTOPILOT: Set targetProp: "brain", statPercent: "85%", subLabel: "BACKGROUND OVERTHINKING".
     * Other targetProps: "coffee" | "phone" | "laptop" | "clock" | "bulb".
   - "PerspectiveFloor": Real world desk/floor environment surface with ground shadow (propType: "laptop" | "coffee" | "phone" | "bomb" | "brain" | "battery", alertText: topic-specific alert pill).
   - "SplitPanelComic": Dynamic asymmetrical diagonal comic split screen with two opposing worlds (leftTitle, leftSub, leftColor, rightTitle, rightSub, rightColor).
   - "FullBleedBlueprintGrid": High-tech technical matrix HUD covering the screen with digital countdown timer (countdownSeconds: 4, systemStatus: topic-specific status, subText: warning).
   - "InfiniteConveyor": Endless moving industrial conveyor belt with flowing item cards (queueCount, conveyorItems: [{ id, label, sub, badge, color }]).
   - "ExplodingCluster": Panicked central character surrounded by 4-8 exploding satellite reaction nodes (nodes: [{ label, badge, angleDeg, distance, color }]).
   - "MacroPunchLens": Extreme 1.35x zoom camera punch on a trembling macro detail (target: "finger_keyboard" | "sweating_eye" | "vibrating_coffee" | "notification_badge", keyLabel, alertSubtitle).
   - "HeroSolo": High-velocity punchy character with comic stamp badge (iconType: "brain" | "coffee" | "phone" | "battery" | "clock" | "bulb" | "alert").
   - "SplitCompare": Side-by-side standoff comparison (leftLabel, rightLabel, leftSub, rightSub, leftColor, rightColor).
   - "StackTower": 3-4 physical blocks slamming down with wobbling tower physics (items: [{ label, color, hasEyes, dropFrame }]).
   - "ToggleSwitch": Heavy mechanical override switch violently flipping ON/OFF (offLabel, onLabel, flipFrame).
   - "DialGauge": Jittering stress meter needle slamming into red danger zone (dangerText, needleTargetAngle).
   - "TimeFlipCalendar": Fast-forward calendar flip showing reality vs expectation (startTime, endTime, stampText).

5. DUAL LANGUAGE & HINDI PRONUNCIATION MANDATE:
   - "en": Energetic, crisp, conversational American English explainer voiceover.
   - "hi" audio_text: **MUST BE WRITTEN IN PURE DEVANAGARI SCRIPT** (e.g. "दोपहर 3 बजे तुम्हारा दिमाग पूरी तरह शटडाउन मोड में चला जाता है।", "ऊर्जा का लेवल 100 से सीधे 15 परसेंट पर आ गिरता है।").
     * CRITICAL: Edge-TTS Neural Voice ("hi-IN-MadhurNeural") requires Devanagari characters to speak natural, authentic Hindi. DO NOT use English letters in hi.beats[].audio_text!
   - "hi" display_tokens: Provide clean, fast-reading Roman Hinglish subtitle tokens (e.g. ["Dopahar", "3 PM", "pe", "dimag", "shutdown", "mode", "me", "chala", "jata", "hai."]) so youth on Reels can read comfortably.

OUTPUT ONLY RAW VALID JSON MATCHING THIS EXACT SCHEMA (no markdown fences, no extra text):
{
  "topic": "${chosenTopic}",
  "en": {
    "title": "UPPERCASE PUNCHY TITLE",
    "description": "Engaging 2-line description with #Shorts",
    "beats": [
      {
        "id": 1,
        "primitive": "HeroSolo",
        "iconType": "brain",
        "title": "SCENE TITLE",
        "badge": "BADGE TEXT",
        "audio_text": "Narration text for beat 1.",
        "display_tokens": ["Narration", "text", "for", "beat", "1."]
      }
    ]
  },
  "hi": {
    "title": "HINDI TITLE",
    "description": "Engaging Hindi description with #Reels",
    "beats": [
      {
        "id": 1,
        "primitive": "HeroSolo",
        "iconType": "brain",
        "title": "हिंदी सीन टाइटल",
        "badge": "बैज टेक्स्ट",
        "audio_text": "प्राकृतिक देवनागरी लिपि में नरेशन।",
        "display_tokens": ["Praakritik", "Devanagari", "lipii", "me", "narration."]
      }
    ]
  }
}
`;

    const resp = await generateWithCluster('showrunner', {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.75 + (attempt - 1) * 0.1 },
    });

    const rawText = resp.text || '';
    let cleanText = rawText.trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      lastErrorReason = `Invalid JSON from Gemini: ${cleanText.slice(0, 100)}`;
      continue;
    }

    let jsonStr = cleanText.slice(firstBrace, lastBrace + 1);

    let scriptData;
    try {
      scriptData = JSON.parse(jsonStr);
    } catch (err1) {
      lastErrorReason = `JSON parse failed: ${err1.message}`;
      continue;
    }

    if (!scriptData.en || !scriptData.hi || !scriptData.en.beats || !scriptData.hi.beats) {
      lastErrorReason = 'Incomplete script structure (missing en/hi beats)';
      continue;
    }

    // Run Pre-Render Programmatic Diversity Gate
    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
      try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); } catch (e) {}
    }
    const gateResult = validateScriptDiversity(scriptData, history, chosenTopic);
    if (!gateResult.valid) {
      lastErrorReason = gateResult.reason;
      continue;
    }

    console.log(`✅ [DIVERSITY GATE PASSED] Script validated with ${new Set(scriptData.en.beats.map(b => b.primitive)).size} unique primitives and 0 consecutive duplicates!`);
    return scriptData;
  }

  throw new Error(`Failed to generate a quality-compliant script after ${maxAttempts} attempts: ${lastErrorReason}`);
}

async function synthesizeNovelTopic(slotName, recentTopics) {
  console.log(`✨ [INFINITE IDEATOR] Generating 100% brand-new novel concept for slot: ${slotName}...`);
  const prompt = `
You are an infinite creative showrunner for a viral 2D cartoon short series in the Oddly Told style.
Current Slot: ${slotName} (Options: morning | afternoon | evening | latenight).

Slot Themes (4-Slot Predictable Rhythm):
- morning (06:00 IST): Money & Middle-Class Wealth Traps (e.g. Salary drains on 5th of month, 0% EMI illusion, credit card traps, lifestyle inflation).
- afternoon (12:00 IST): Indian History / Strategy / Mindset (Chanakya Niti power rules, Mahabharata power dynamics, Krishna/Karna/Shakuni psychological warfare).
- evening (19:30 IST): Ancient Indian Wealth & Trade Secrets ("Sone Ki Chidiya" trade balance, Roman gold drain, temple banking system, wealth compounding secrets).
- latenight (00:00 IST): Unsolved Mysteries / High-Curiosity Lore (Padmanabhaswamy Temple Vault B 7th door, Bhangarh curse physics, Kuldhara vanished village, Kailash Temple monolithic carving).

RECENT TOPICS ALREADY COVERED (DO NOT DUPLICATE OR RESEMBLE ANY OF THESE):
${recentTopics.slice(-30).map(t => `- ${t}`).join('\n')}

Generate ONE brand new, hilarious, viral, everyday human relatable conflict or bizarre brain fact.
Respond with ONLY the topic sentence (1-2 sentences), nothing else. No quotation marks.
`;

  try {
    const res = await generateWithCluster('showrunner', {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.9 },
    });
    let rawTopic = res.text.trim();
    while (rawTopic.startsWith('"') || rawTopic.startsWith("'")) {
      rawTopic = rawTopic.slice(1);
    }
    while (rawTopic.endsWith('"') || rawTopic.endsWith("'")) {
      rawTopic = rawTopic.slice(0, -1);
    }
    const topic = rawTopic.trim();
    if (topic.length > 10) return topic;
  } catch (e) {
    console.warn('⚠️ Fallback to preset generator:', e.message);
  }

  const pool = TOPIC_PRESETS[slotName] || TOPIC_PRESETS.morning;
  return pool[Math.floor(Math.random() * pool.length)].topic;
}

// -------------------------------------------------------------
// 3. Main Autonomous Orchestrator
// -------------------------------------------------------------
export async function runOddlyAutonomous({
  slotOverride = null,
  topicOverride = null,
  isDryRun = false,
  noPublish = false,
  engine = 'pop_vector',
} = {}) {
  const slot = slotOverride || getCurrentSlot();
  const recentTopics = getRecentTopics();

  console.log('\n===============================================================');
  console.log(`🤖 [ODDLY AUTONOMOUS ENGINE] STARTING CYCLE: [SLOT: ${slot.toUpperCase()}]`);
  console.log(`📅 Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log('===============================================================');

  // Select Topic: Topic Override -> Fresh Preset -> Infinite Novel Synthesis
  let chosenTopic = topicOverride;
  if (!chosenTopic) {
    const candidates = TOPIC_PRESETS[slot] || TOPIC_PRESETS.morning;
    const freshPresets = candidates.filter((c) => !recentTopics.includes(c.topic.toLowerCase()));
    if (freshPresets.length > 0) {
      chosenTopic = freshPresets[Math.floor(Math.random() * freshPresets.length)].topic;
    } else {
      // All presets covered or past 14 days -> Synthesize brand new novel concept!
      chosenTopic = await synthesizeNovelTopic(slot, recentTopics);
    }
  }

  // 1. Generate Bespoke Code Scenes via Pop-Vector Engine (100% Hindi + Hinglish First)
  console.log(`\n🎨 [STEP 1] Generating 100% Bespoke Code-Generated Scenes via Pop-Vector Engine...`);
  const popResult = await runAutonomousPopVector(chosenTopic, { slot });
  const scriptData = popResult.scriptData;
  const scriptPath = path.join(SCRATCH_DIR, 'current_oddly_script.json');
  console.log(`💾 Bespoke script verified: "${popResult.titleHi}" (${popResult.titleHinglish})`);

  // 3. Render Remotion Hindi Composition (Zero English Waste)
  console.log('\n🎬 [STEP 3] Rendering Hindi Master Composition (AutonomousPopVectorHi)...');
  const hiOut = path.join(OUT_DIR, 'oddly_auto_hi.mp4');

  // Delete previous output file to ensure zero possibility of stale video reuse
  if (fs.existsSync(hiOut)) fs.unlinkSync(hiOut);

  console.log('   • Rendering Hindi Master (AutonomousPopVectorHi)...');
  const cleanHiOut = hiOut.split('\\').join('/');
  execSync(`npx remotion render src/index.ts AutonomousPopVectorHi "${cleanHiOut}" --concurrency=2 --gl=angle`, {
    stdio: 'inherit',
  });

  // 4. Pre-Flight Watchdog Audit (Hindi Master)
  console.log('\n🛡️ [STEP 4] Running Watchdog QA Verification on Hindi Master...');
  const hiManifestPath = path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_hi.json');

  let hiAudit = await auditOddlyVideo({
    videoPath: hiOut,
    manifestPath: hiManifestPath,
    language: 'hi',
    topicTitle: scriptData.hi.title,
  });

  // Self-Healing Auto-Repair (Automatically re-synthesizes and re-renders if any gate catches a gap)
  if (!hiAudit.passed) {
    console.warn('\n🛠️ [AUTO-HEAL TRIGGERED] Quality Gate issue detected on Hindi Master. Re-synthesizing and repairing audio/video...');
    const cleanScriptPath = scriptPath.split('\\').join('/');
    execSync(`python scripts/oddly_audio_synthesizer.py --script "${cleanScriptPath}" --lang hi --hindi-engine piper`, {
      stdio: 'inherit',
    });

    console.log('   • Re-rendering repaired Hindi Master...');
    if (fs.existsSync(hiOut)) fs.unlinkSync(hiOut);
    execSync(`npx remotion render src/index.ts AutonomousPopVectorHi "${cleanHiOut}" --concurrency=2 --gl=angle`, {
      stdio: 'inherit',
    });
    hiAudit = await auditOddlyVideo({
      videoPath: hiOut,
      manifestPath: hiManifestPath,
      language: 'hi',
      topicTitle: scriptData.hi.title,
    });
  }

  if (!hiAudit.passed) {
    console.error('❌ [WATCHDOG REJECTED] Video failed QA gates after repair. Upload aborted.');
    return { success: false, hiAudit };
  }

  // 5. Publish to Platforms (YouTube Shorts, Instagram Reels, Facebook Reels)
  let publishResults = null;
  const titleHinglish = scriptData.title_hinglish || scriptData.hi?.title_hinglish || popResult.titleHinglish;
  const titleHi = scriptData.hi?.title || popResult.titleHi;
  const descriptionHi = scriptData.hi?.description || `${titleHi}\n\n#Shorts #OddlyTold #Chanakya #Strategy #HindiShorts`;

  if (!noPublish) {
    console.log('\n🚀 [STEP 5] Publishing Hindi Master to Phase 1 Channels...');
    publishResults = await publishPhase1({
      videoHiPath: hiOut,
      videoEnPath: hiOut, // Both point to the single Hindi master
      titleEn: titleHinglish,
      titleHi: titleHi,
      descriptionEn: descriptionHi,
      descriptionHi: descriptionHi,
      isDryRun,
    });
  } else {
    console.log('ℹ️ --no-publish flag passed. Skipping distribution.');
  }

  // Record History with Video Stream MD5 Fingerprints & Spatial Primitives Sequence
  recordHistory({
    slot,
    topic: chosenTopic,
    titleHi,
    titleHinglish,
    hiStreamMD5: hiAudit.streamMD5,
    primitives: (scriptData.hi.beats || []).map((b) => b.heroElement || b.primitive || b.title || `Scene${b.id}`),
    published: !noPublish && !isDryRun,
  });

  console.log('\n🎉 [CYCLE COMPLETE] Autonomous Oddly Told Hindi Short produced successfully!\n');
  return {
    success: true,
    slot,
    topic: chosenTopic,
    script: scriptData,
    publishResults,
  };
}

if (process.argv[1] && process.argv[1].endsWith('run_oddly_autonomous.js')) {
  const isDryRun = process.argv.includes('--dry-run');
  const noPublish = process.argv.includes('--no-publish');
  let slotOverride = null;
  const slotIdx = process.argv.indexOf('--slot');
  if (slotIdx >= 0 && process.argv[slotIdx + 1]) slotOverride = process.argv[slotIdx + 1];

  let topicOverride = null;
  const topicIdx = process.argv.indexOf('--topic');
  if (topicIdx >= 0 && process.argv[topicIdx + 1]) topicOverride = process.argv[topicIdx + 1];

  let engine = 'pop_vector';
  const engineIdx = process.argv.indexOf('--engine');
  if (engineIdx >= 0 && process.argv[engineIdx + 1]) engine = process.argv[engineIdx + 1];

  runOddlyAutonomous({
    slotOverride,
    topicOverride,
    isDryRun,
    noPublish,
    engine,
  }).catch((err) => {
    console.error('💥 Autonomous Engine Uncaught Error:', err);
    process.exit(1);
  });
}
