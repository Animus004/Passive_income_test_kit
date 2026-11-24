/**
 * Automated Gemini Script Generator for YouTube Shorts
 * Powered by Gemini 2.5 Flash via @google/genai
 * 
 * Generates structured 5-scene scripts for "Data Detective" Shorts:
 * - Scene 1: The Dramatic Hook
 * - Scene 2: The Space/Speed Myth
 * - Scene 3: The Mind-Blowing Physical Reality
 * - Scene 4: Critical Bottlenecks & Hazards (3 synchronized chips)
 * - Scene 5: Resolution & Infinite Retention Loop Bridge
 * 
 * Usage:
 *   node scripts/generate_script.js --topic "High-Frequency Trading Fiber Cables"
 *   node scripts/generate_script.js (picks next topic from data/topics.json)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TOPICS_PATH = path.join(PROJECT_ROOT, 'data', 'topics.json');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_short.json');

function parseArgs() {
  const args = process.argv.slice(2);
  let topicArg = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topicArg = args[i + 1];
      i++;
    }
  }
  return { topicArg };
}

function selectTopic(topicArg) {
  if (topicArg) {
    return {
      topic: topicArg,
      hookAngle: `The hidden physical reality and data bottlenecks behind ${topicArg}.`,
      isCustom: true,
    };
  }

  if (!fs.existsSync(TOPICS_PATH)) {
    throw new Error(`Topics file not found at ${TOPICS_PATH}`);
  }

  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  let chosen = topics.find((t) => !t.used);

  // If all are used, reset all and pick the first
  if (!chosen && topics.length > 0) {
    console.log('🔄 All topics previously used. Resetting queue...');
    topics.forEach((t) => (t.used = false));
    chosen = topics[0];
  }

  if (!chosen) {
    return {
      topic: 'High-Frequency Trading Fiber Cables',
      hookAngle: 'How Wall Street drilled straight through the Allegheny Mountains to shave 3 milliseconds off trading time.',
      isCustom: true,
    };
  }

  return { ...chosen, isCustom: false };
}

function markTopicUsed(topicObj) {
  if (topicObj.isCustom || !fs.existsSync(TOPICS_PATH)) return;

  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf-8'));
  const found = topics.find((t) => t.id === topicObj.id || t.topic === topicObj.topic);
  if (found) {
    found.used = true;
    found.lastUsedAt = new Date().toISOString();
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(topics, null, 2), 'utf-8');
    console.log(`📌 Marked topic [${found.topic}] as used in data/topics.json`);
  }
}

const THEME_CONFIGS = {
  space: { primary: '#38bdf8', accent: '#f59e0b', bgGradient: 'radial-gradient(ellipse at 50% 25%, #1e1b4b 0%, #030712 75%)' },
  cyber: { primary: '#10b981', accent: '#eab308', bgGradient: 'radial-gradient(ellipse at 50% 25%, #064e3b 0%, #020a06 75%)' },
  ocean: { primary: '#06b6d4', accent: '#38bdf8', bgGradient: 'radial-gradient(ellipse at 50% 25%, #082f49 0%, #020617 75%)' },
  finance: { primary: '#f59e0b', accent: '#ef4444', bgGradient: 'radial-gradient(ellipse at 50% 25%, #451a03 0%, #0a0601 75%)' },
  quantum: { primary: '#c084fc', accent: '#38bdf8', bgGradient: 'radial-gradient(ellipse at 50% 25%, #3b0764 0%, #07010d 75%)' },
  infrastructure: { primary: '#f97316', accent: '#eab308', bgGradient: 'radial-gradient(ellipse at 50% 25%, #431407 0%, #050507 75%)' },
};

function detectVisualTheme(topic, angle = '') {
  const text = `${topic} ${angle}`.toLowerCase();
  if (/gps|satellite|orbit|space|relativity|einstein|planet|cosmos|gravity/i.test(text)) return 'space';
  if (/chip|silicon|transistor|lithography|microprocessor|computer|code|software|hack|ai|gpu|photolithography/i.test(text)) return 'cyber';
  if (/ocean|sea|cable|submarine|underwater|depth|trench|shark|abyssal|water/i.test(text)) return 'ocean';
  if (/trade|trading|wall street|hft|finance|market|money|stock|bitcoin|crypto/i.test(text)) return 'finance';
  if (/quantum|atom|qubit|superposition|particle|laser|collider|physics|energy/i.test(text)) return 'quantum';
  return 'infrastructure';
}

function formatMonetizedDescription(rawDescription, tags = []) {
  const affiliateUrl = process.env.MONETIZATION_AFFILIATE_URL || 'https://bit.ly/data-detective-tools';
  const newsletterUrl = process.env.MONETIZATION_NEWSLETTER_URL || 'https://datadetective.substack.com';

  // Extract hashtags from the raw description
  const hashtagRegex = /#\w+/g;
  const existingHashtags = rawDescription.match(hashtagRegex) || [];
  const cleanBody = rawDescription.replace(hashtagRegex, '').trim();

  // Deduplicate tags and create clean hashtags
  const defaultTags = ['Shorts', 'Tech', 'DataDetective', 'Facts'];
  const allTagNames = Array.from(
    new Set([
      ...existingHashtags.map((h) => h.replace(/^#/, '')),
      ...(Array.isArray(tags) ? tags : []),
      ...defaultTags,
    ])
  ).slice(0, 8);

  const hashtagLine = allTagNames.map((t) => `#${t.replace(/[\s-]/g, '')}`).join(' ');

  const formattedDescription = [
    cleanBody,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `🔍 FREE Tech & Data Newsletter: ${newsletterUrl}`,
    `⚡ Top Recommended Tech & Security Toolkit: ${affiliateUrl}`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    hashtagLine,
  ].join('\n');

  return formattedDescription;
}

function inferAnimationArchetype(text, idx) {
  const t = text.toLowerCase();
  if (/chart|stock|market|trade|price|growth|percent|index|nasdaq|dow|gain|candlestick/i.test(t)) return 'stat_chart';
  if (/terminal|code|algorithm|software|hack|cyber|kernel|linux|script|server|data/i.test(t)) return 'terminal_bloom';
  if (/speed|latency|microsecond|nanosecond|millisecond|fast|velocity|tachometer|gauge|mph|kmh|clock/i.test(t)) return 'speedometer_gauge';
  if (/warning|threat|danger|crisis|breach|alarm|hazard|risk|fail|collapse/i.test(t)) return 'alert_threat';
  if (/versus|vs|compare|difference|alternative|compete|faster than/i.test(t)) return 'comparison_split';
  if (/notification|ping|alert|message|feed|app|push/i.test(t)) return 'notifications_stack';
  if (/cost|dollar|bill|expense|receipt|price tag|expensive|budget/i.test(t)) return 'thermal_receipt';
  if (/route|street|city|map|building|path|transit|track|gps/i.test(t)) return 'map_route';
  if (/underground|buried|feet|deep|depth|trench|iceberg|hidden|abyss|submerged/i.test(t)) return 'the_iceberg';
  if (/chip|hardware|fpga|transceiver|circuit|component|inside|layer|core|teardown|explode/i.test(t)) return 'teardown';
  if (/flip|departure|split flap|counter|board/i.test(t)) return 'split_flap';
  if (/global|earth|world|planet|orbit|across the ocean|transatlantic|intercontinental|relay|network/i.test(t)) return 'globe_arcs';
  if (/phone|desk|blueprint|hand|craft|doodle|schematic|workspace/i.test(t)) return 'pov_doodle';
  
  // Topic-adaptive natural rotation: prioritize authentic B-roll and high-retention motion graphics
  const defaultRotation = ['broll', 'stat_chart', 'teardown', 'speedometer_gauge', 'globe_arcs'];
  return defaultRotation[idx % defaultRotation.length];
}

async function generateScript() {
  const { topicArg } = parseArgs();
  const selected = selectTopic(topicArg);

  console.log('====================================================');
  console.log('🤖 GEMINI 2.5 FLASH SCRIPT GENERATOR');
  console.log('====================================================');
  console.log(`🎯 Topic: "${selected.topic}"`);
  console.log(`💡 Angle: "${selected.hookAngle}"`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env');
  }

  // Load Live Content Intelligence & Winning Formulas
  let audienceFormulaPrompt = '';
  const intelligencePath = path.join(PROJECT_ROOT, 'data', 'content_intelligence.json');
  if (fs.existsSync(intelligencePath)) {
    try {
      const intel = JSON.parse(fs.readFileSync(intelligencePath, 'utf-8'));
      audienceFormulaPrompt = `
AUDIENCE INTELLIGENCE & PROVEN VIRAL PATTERNS ON THIS CHANNEL:
- Top performing Short: "${intel.topPerformerTitle}" (${intel.topPerformerViews} views vs ${intel.channelAverageViews} avg).
- WINNING FORMULA: Pair a universally familiar everyday object (iPhone, WiFi, headphones, coffee, battery) with an extreme physical scale or secret hidden system.
- TITLE STYLE: Use irresistible curiosity gaps with high-contrast verbs and a punchy emoji (e.g. "Why Bullet Trains Don't Break Your iPhone 🤯").
`;
    } catch (e) {}
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
  const prompt = `You are the Executive Showrunner and Lead Visual Director for "Data Detective", a viral YouTube Shorts investigative documentary channel in the visual tier of Vox, Kurzgesagt, and Polymatter.

Create a 30-35 second high-retention vertical video script (strictly 5 cuts total, 75 to 90 words total) about: "${selected.topic}".
Key investigative angle: "${selected.hookAngle}".
${audienceFormulaPrompt}

================================================================================
CRITICAL DIRECTORIAL RULES: CINEMATIC MULTI-LAYER CAUSE-AND-EFFECT STORYTELLING
================================================================================
Never output a static graphic, a generic bullet-point slide, or icons floating in an empty void.
Every cut MUST be treated as a fully staged film set with THREE DISTINCT VISUAL LAYERS:
1. BACKGROUND STAGE (Environment, depth planes, horizons, lighting, atmospheric haze, god rays)
2. FOREGROUND PROPS (Physical tactile objects, mechanical instruments, moving meters, ambient particles)
3. CAUSE-AND-EFFECT TRANSFORMATION (The voiceover triggers an active physical change: items vanish, crates explode, arrows plunge down, thermometers drop, or crops sprout around the world).

THE ANIMATION ARCHETYPES CATALOG (Assign the best-matching archetype to each cut based on the topic):
1. "broll": Authentic documentary video/photo of the real-world facility, hardware, city, or environment with kinetic HUD overlay and Popapus mascot.
2. "stat_chart": Real-time glowing neon vector line graph, stock chart, or exponential curve with animated tracer and live numeric counter. Perfect for stats, finances, or metrics.
3. "speedometer_gauge": High-tech circular neon tachometer or latency dial sweeping up to an extreme limit. Perfect for speed, microseconds, pressure, or bandwidth.
4. "split_flap": Mechanical split-flap departure board clattering numbers/letters into place.
5. "the_iceberg": 3D iceberg showing the tiny visible surface (10%) versus the massive submerged infrastructure or secret reality (90%). Perfect for hidden systems, subsea cables, dark data, or underground structures.
6. "teardown": 3D exploded view of physical hardware, circuit boards, microchips, mechanical engines, or secure modules separated into floating suspended tiers with callout leader lines.
7. "pov_doodle": Top-down craftsman desk with a physical device or document (e.g. smartphone with active trading app, technical schematic blueprint, or classified dossier) triggering an active event.
8. "globe_arcs": 3D vector Earth globe with luminous parabolic network arcs connecting continents, orbital satellites, or telecommunication relay nodes. Perfect for global scale, intercontinental transit, or planetary systems.
9. "terminal_bloom": Hacker dark console / CLI typing real-time shell commands, kernel overrides, or live data stream. Perfect for software, algorithms, or cyber security.
10. "alert_threat": High-urgency flashing emergency matrix with seismic camera vibration. Perfect for hazards, crisis, or system collapse.
11. "comparison_split": High-contrast side-by-side vertical split comparing two competing technologies, scales, or methods.
12. "notifications_stack": Rapid cascading mobile notifications stacking with spring physics.
13. "type_slam": Bold kinetic text impact for high-energy declarations.
14. "thermal_receipt": Itemized printed paper tape feeding downward with running cost tally.
15. "map_route": Isometric 3D city blocks tracing an ultra-fast route between coordinates.

ABSOLUTE TOPIC FIDELITY RULE:
Under NO circumstances should you use agricultural seeds, crops, Svalbard vaults, or refrigerators unless the topic explicitly is about seeds, crops, Svalbard, or groceries!
Every single cut's foregroundProps, visualMetaphor, causeAndEffect, and visualQuery MUST be directly derived from the specified topic: "${selected.topic}".

===============================================================================
SCRIPT & PACING RULES:
===============================================================================
- Strictly 5 cuts total.
- Total spoken voiceover length: strictly 75 to 90 words (12 to 16 words per cut).
- Cut 1 MUST be a gripping paradox or relatable crisis.
- Middle Cuts MUST contrast myths with jaw-dropping physical realities and engineering extremes.
- Final Cut MUST deliver an authoritative, complete, mic-drop conclusion (NEVER end on a cliffhanger).

Return ONLY valid JSON matching this exact structure:
{
  "topic": "${selected.topic}",
  "visualTheme": "One of: space | cyber | finance | quantum | ocean | infrastructure",
  "videoTitle": "Ultra-catchy curiosity gap title with emoji (< 60 chars)",
  "youtubeDescription": "2-3 engaging sentences explaining the short with 4-5 relevant #hashtags.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "cuts": [
    {
      "cutId": 1,
      "voiceoverText": "Cut 1 sentence (12-16 words).",
      "animationArchetype": "One of the archetypes above (e.g. 'broll', 'pov_doodle', 'stat_chart')",
      "visualMetaphor": "Direct visual metaphor specific to this topic.",
      "backgroundStage": "Stage environment describing depth, lighting, and mood specific to this topic.",
      "foregroundProps": ["prop_1", "prop_2", "prop_3"],
      "causeAndEffect": {
        "initialState": "Starting state of the props/environment before transformation.",
        "transformation": "Active physical action triggered as words are spoken.",
        "finalState": "Resulting state with dynamic HUD badge or metric."
      },
      "cameraChoreography": {
        "startFraming": "Initial camera position",
        "motionTrajectory": "Dynamic camera movement (zoom_in, pan_right, orbit, etc.)",
        "endFraming": "Final framing on focal object or HUD"
      },
      "tangibleItems": ["item1", "item2", "item3"],
      "visualQuery": "Search query for authentic stock footage or image matching this exact cut",
      "cameraMotion": "zoom_in",
      "statHighlight": {
        "number": "Key stat or null if none",
        "label": "Short label for stat"
      }
    }
  ]
}
  ]
}
`;

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const modelsToTry = [
    primaryModel,
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
  ].filter((v, i, a) => a.indexOf(v) === i);

  let response = null;
  let lastErr = null;

  for (const model of modelsToTry) {
    try {
      console.log(`📡 Sending request to Gemini (${model})...`);
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
      if (response && response.text) {
        break;
      }
    } catch (err) {
      console.warn(`⚠️ Model ${model} returned error (${err.status || err.message}). Trying fallback...`);
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!response || !response.text) {
    throw lastErr || new Error('All Gemini models failed to generate content');
  }

  const rawJson = response.text;
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('Failed to parse Gemini output:', rawJson);
    throw err;
  }

  // Assign dynamic visual theme & palette
  const detected = detectVisualTheme(selected.topic, selected.hookAngle);
  parsed.visualTheme = (parsed.visualTheme && THEME_CONFIGS[parsed.visualTheme.toLowerCase()])
    ? parsed.visualTheme.toLowerCase()
    : detected;
  parsed.themeConfig = THEME_CONFIGS[parsed.visualTheme] || THEME_CONFIGS.space;
  console.log(`🎨 Visual Theme Assigned: "${parsed.visualTheme.toUpperCase()}"`);

  // Process dynamic cuts
  if (!parsed.cuts && parsed.scenes) {
    parsed.cuts = parsed.scenes.map((s, idx) => ({
      cutId: s.sceneId || idx + 1,
      voiceoverText: s.voiceoverText,
      visualQuery: (parsed.mediaQueries && parsed.mediaQueries[idx]) || `${selected.topic} technology`,
      cameraMotion: idx % 2 === 0 ? 'zoom_in' : 'zoom_out',
      statHighlight: s.statHighlight || null,
    }));
  }

  // Ensure every cut has clean, sanitized properties with full Cause-and-Effect Storytelling directives
  parsed.cuts = (parsed.cuts || []).map((c, idx) => {
    const archetype = c.animationArchetype || inferAnimationArchetype(c.voiceoverText, idx);
    const bgStage = c.backgroundStage || c.environmentalStage || '';
    const fgProps = Array.isArray(c.foregroundProps) ? c.foregroundProps : (Array.isArray(c.tangibleItems) ? c.tangibleItems : []);
    const cameraChoreo = {
      startFraming: (c.cameraChoreography && c.cameraChoreography.startFraming) || '',
      motionTrajectory: (c.cameraChoreography && c.cameraChoreography.motionTrajectory) || c.cameraTrajectory || (idx % 2 === 0 ? 'zoom_in' : 'zoom_out'),
      endFraming: (c.cameraChoreography && c.cameraChoreography.endFraming) || '',
    };
    return {
      cutId: c.cutId || idx + 1,
      voiceoverText: (c.voiceoverText || '').trim(),
      animationArchetype: archetype,
      visualMetaphor: c.visualMetaphor || '',
      backgroundStage: bgStage,
      environmentalStage: bgStage,
      foregroundProps: fgProps,
      tangibleItems: fgProps,
      causeAndEffect: {
        initialState: (c.causeAndEffect && c.causeAndEffect.initialState) || '',
        transformation: (c.causeAndEffect && (c.causeAndEffect.transformation || c.causeAndEffect.transformationAction)) || '',
        finalState: (c.causeAndEffect && c.causeAndEffect.finalState) || '',
      },
      cameraChoreography: cameraChoreo,
      cameraTrajectory: cameraChoreo.motionTrajectory,
      visualQuery: (c.visualQuery || `${selected.topic} technology`).trim(),
      cameraMotion: c.cameraMotion || (idx % 2 === 0 ? 'zoom_in' : 'zoom_out'),
      statHighlight: c.statHighlight && c.statHighlight.number ? c.statHighlight : null,
    };
  });

  // Clean full voiceover concatenated from cuts
  parsed.fullVoiceover = parsed.cuts.map((c) => c.voiceoverText).join(' ');

  // Media queries array for B-roll fetcher
  parsed.mediaQueries = parsed.cuts.map((c) => c.visualQuery);

  // Backward-compatible alias for any legacy inspector
  parsed.scenes = parsed.cuts.map((c) => ({
    sceneId: c.cutId,
    voiceoverText: c.voiceoverText,
    statHighlight: c.statHighlight,
  }));

  // Inject monetization footer & structured hashtags into youtubeDescription
  parsed.youtubeDescription = formatMonetizedDescription(
    parsed.youtubeDescription || '',
    parsed.tags || []
  );

  const totalWords = parsed.fullVoiceover.split(/\s+/).length;
  console.log(`✅ Script generated successfully! (${totalWords} words total)`);
  console.log(`🎬 Title: "${parsed.videoTitle}"`);
  console.log(`💰 Monetized Description:\n${parsed.youtubeDescription}\n`);

  // Save to src/data/current_short.json
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
  console.log(`💾 Saved to ${OUTPUT_PATH}`);

  // Mark topic used
  markTopicUsed(selected);

  return parsed;
}

if (require.main === module) {
  generateScript().catch((err) => {
    console.error('❌ Script generation failed:', err);
    process.exit(1);
  });
}

module.exports = { generateScript, selectTopic };

