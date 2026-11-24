/**
 * Autonomous Comedy Schedule & Trend Orchestrator
 * 
 * Determines current schedule slot based on day-of-week and time-of-day:
 * 1. Mon-Fri Morning (05:00 - 13:59): "The Commute & The Grind"
 *    - Themes: Walking to work, coffee shop social awkwardness, office politics, agile panic.
 * 2. Mon-Fri Evening (14:00 - 04:59): "Late Night Sanctuary (2:00 AM)"
 *    - Themes: Cozy dark desk, existential coding bugs, 2 AM philosophical AI banter, insomnia synergy.
 * 3. Saturday & Sunday: "Wild Escapes & Sci-Fi Adventures"
 *    - Themes: Mars outpost, retro spaceship cockpit, time travel gate, alien beach resort, cyberpunk lab.
 * 
 * Autonomously pulls live trends from Hacker News & Google News without human prompting,
 * ensures anti-repeat uniqueness against episode history, and generates:
 * a) Comedic Script JSON
 * b) Declarative 3D Stage Recipe JSON
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { generateWithCluster } from './gemini_cluster.js';
import { scrapeTrendingTopics } from './trend_scraper.js';

const PROJECT_ROOT = 'd:\\New folder (2)';
const HISTORY_FILE = path.join(PROJECT_ROOT, 'scratch', 'episode_history.json');

export function getScheduleSlot(forcedSlot = null) {
  if (forcedSlot) return forcedSlot;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();

  if (day === 0 || day === 6) {
    return 'wild_weekend_adventure';
  } else if (hour >= 5 && hour < 14) {
    return 'commute_and_grind';
  } else {
    return 'late_night_sanctuary';
  }
}

export function getSlotMetadata(slot) {
  switch (slot) {
    case 'commute_and_grind':
      return {
        slotName: "The Commute & The Grind (Morning Post)",
        typicalSettings: ["corporate_office", "cafe_corner", "daylight_walk"],
        cameraMode: "seated_or_walk",
        vibe: "High-stress social awkwardness, caffeine urgency, office bureaucracy, Slack dread."
      };
    case 'late_night_sanctuary':
      return {
        slotName: "Late Night Sanctuary (2:00 AM Post)",
        typicalSettings: ["cozy_home_bedroom", "late_night_sanctuary"],
        cameraMode: "seated",
        vibe: "Warm ambient glow, existential coder thoughts, fixing a bug at 3 AM with AI companion."
      };
    case 'wild_weekend_adventure':
    default:
      return {
        slotName: "Wild Escapes & Sci-Fi Adventures (Weekend Special)",
        typicalSettings: ["martian_surface_expedition", "spaceship_bridge", "time_travel_1995"],
        cameraMode: "seated_or_standing",
        vibe: "Surreal, cinematic, unexpected sci-fi / adventure where Human and Gemini encounter bizarre cosmic or vacation situations."
      };
  }
}

// ---------------------------------------------------------------------------
// Universal Multi-Scene Catalog & Shuffler
// Guarantees high visual variety across every autonomous video
// ---------------------------------------------------------------------------
export const SLOT_ENVIRONMENTS = {
  commute_and_grind: [
    {
      theme: 'corporate_office',
      name: 'Modern Tech Office',
      camera_mode: 'seated',
      hdri_theme: 'office',
      ground: { type: 'plane', material: 'light_wood_plank', roughness: 0.35 },
      lighting: { sun_color: [1.0, 0.98, 0.94], sun_energy: 3.8 },
      props: [
        { name: 'Office_Desk', category: 'furniture', placement: 'center', surface_z: 0.88 },
        { name: 'Developer_Workstation_Laptop', category: 'table_prop', placement: 'desk_center', surface_z: 0.88 },
        { name: 'Coffee_Mug', category: 'table_prop', placement: 'desk_right', surface_z: 0.88 }
      ],
      vibe: 'Modern tech office, Scrum whiteboard, acoustic wood slats, corner cactus, Jira standup panic, Slack roasts.',
      curated_prompts: [
        'The human aggressively types random characters into terminal to look busy as the boss walks past',
        'The human gets asked "Do you have a quick minute?" and experiences instant fight-or-flight panic',
        'The human receives an email that says "Per my previous email" and contemplates quitting',
        'The human tries to explain why a 1-line CSS change took 4 days in the daily standup',
        'The human stares blankly at a Jira ticket description that just says "Fix the bug" with no steps'
      ]
    },
    {
      theme: 'cafe_corner',
      name: 'Artisan Coffee Shop Bistro',
      camera_mode: 'seated',
      hdri_theme: 'cafe',
      ground: { type: 'plane', material: 'dark_wood_plank', roughness: 0.45 },
      lighting: { sun_color: [1.0, 0.92, 0.82], sun_energy: 3.5 },
      props: [
        { name: 'Cafe_Bistro_Table', category: 'furniture', placement: 'center', surface_z: 0.88 },
        { name: 'Croissant_Plate', category: 'table_prop', placement: 'desk_center', surface_z: 0.88 },
        { name: 'Hot_Latte_Mug', category: 'table_prop', placement: 'desk_right', surface_z: 0.88 }
      ],
      vibe: 'Artisan coffee shop, brick wainscot, chalkboard menu, hanging Edison pendants, espresso machine, cappuccino & croissant.',
      curated_prompts: [
        'The human gets intimidated by ordering iced coffee and Gemini provides tactical coaching',
        'The human buys an $8 oat milk latte just to use the coffee shop electrical outlet for 12 minutes',
        'The human overhears two tech founders at the next table pitching an AI toaster and tries not to laugh',
        'The coffee shop Wi-Fi requires a 16-character captcha and the human considers working offline forever',
        'The barista spells the human\'s 4-letter name with 11 consonants and Gemini investigates'
      ]
    },
    {
      theme: 'daylight_walk',
      name: 'Sunny Sidewalk Commute',
      camera_mode: 'standing_walk',
      hdri_theme: 'street',
      ground: { type: 'plane', material: 'concrete_pavement', roughness: 0.70 },
      lighting: { sun_color: [1.0, 0.96, 0.90], sun_energy: 4.0 },
      props: [],
      vibe: 'Sunny morning sidewalk, scored concrete slabs, street lamp post, fire hydrant, green planter box with flowers.',
      curated_prompts: [
        'The human tries to walk naturally past strangers on the sidewalk and forgets how arms and legs move',
        'The human makes accidental eye contact with a jogging neighbor and pretends to inspect a pebble',
        'The human attempts outdoor mindfulness on the morning commute and gets judged by a sidewalk pigeon',
        'The human steps outside after a 72-hour coding marathon and is attacked by natural sunlight',
        'The human takes 10,000 steps to reach the office only to realize their laptop is still at home'
      ]
    }
  ],
  late_night_sanctuary: [
    {
      theme: 'cozy_home_bedroom',
      name: 'Late-Night Home Bedroom Sanctuary',
      camera_mode: 'seated',
      hdri_theme: 'night',
      ground: { type: 'plane', material: 'dark_wood_plank', roughness: 0.55 },
      lighting: { sun_color: [0.1, 0.15, 0.25], sun_energy: 0.5 },
      props: [
        { name: 'Cozy_Walnut_Desk', category: 'furniture', placement: 'center', surface_z: 0.88 },
        { name: 'Developer_Workstation_Laptop', category: 'table_prop', placement: 'desk_center', surface_z: 0.88 },
        { name: 'Hot_Tea_Mug', category: 'table_prop', placement: 'desk_right', surface_z: 0.88 }
      ],
      vibe: '3 AM developer bedroom, dark walnut desk, floating oak shelves, warm corner floor lamp, soft laptop screen glow.',
      curated_prompts: [
        'The human and Gemini ponder why code works when they don\'t understand why, at 2:47 AM',
        'The human tries to fix a single CSS padding bug at 3 AM and breaks the entire website layout',
        'The human realizes their entire career is just copying StackOverflow and Gemini gives a sarcastic pep talk',
        'The human accidentally pushes experimental debug code with "console.log(\'why god why\')" to production at 2 AM',
        'The human stares at a blinking cursor at 3:15 AM wondering if computers were a mistake'
      ]
    }
  ],
  wild_weekend_adventure: [
    {
      theme: 'martian_surface_expedition',
      name: 'Martian Surface Expedition',
      camera_mode: 'standing_walk',
      hdri_theme: 'desert',
      ground: { type: 'plane', material: 'red_sand_terracotta', roughness: 0.95 },
      lighting: { sun_color: [1.0, 0.75, 0.45], sun_energy: 3.5 },
      props: [],
      vibe: 'Red Martian sand, sunset quarry sky, orbital telemetry dish, specimen pod, distant habitat dome, spacesuit & bubble helmet.',
      curated_prompts: [
        'The human and Gemini establish a Martian research outpost but the Wi-Fi router password was left on Earth',
        'The human tries to take a sip of coffee on Mars and bangs the mug against their astronaut bubble helmet',
        'The human panics when the Mars rover displays a Windows Update prompt at 2% battery',
        'The human complains that Martian gravity makes typing on their mechanical keyboard feel too light'
      ]
    },
    {
      theme: 'spaceship_bridge',
      name: 'Sci-Fi Starship Bridge Cockpit',
      camera_mode: 'seated',
      hdri_theme: 'space',
      ground: { type: 'plane', material: 'metal_grid', roughness: 0.35 },
      lighting: { sun_color: [0.1, 0.8, 1.0], sun_energy: 2.5 },
      props: [
        { name: 'SciFi_Pilot_Console', category: 'furniture', placement: 'center', surface_z: 0.88 }
      ],
      vibe: 'Starship bridge, curved titanium bulkhead, deep space viewport with ringed planet, pilot helm with dual HUDs and joysticks.',
      curated_prompts: [
        'The human accidentally triggers warp drive on a starship while trying to find the cup holder',
        'Gemini roasts the human for trying to parallel park a 400-meter starship between two binary pulsars',
        'The spaceship navigation computer defaults to Apple Maps and plots a course directly through a supernova',
        'The human refuses to ask alien traffic control for directions and Gemini intervenes before they hit an asteroid'
      ]
    },
    {
      theme: 'time_travel_1995',
      name: '1995 Retro Dial-up Tech Lab',
      camera_mode: 'seated',
      hdri_theme: 'night',
      ground: { type: 'plane', material: 'dark_wood_plank', roughness: 0.60 },
      lighting: { sun_color: [1.0, 0.80, 0.50], sun_energy: 2.8 },
      props: [
        { name: 'Retro_1995_Melamine_Desk', category: 'furniture', placement: 'center', surface_z: 0.88 },
        { name: 'Retro_CRT_Monitor', category: 'electronic', placement: 'desk_center', surface_z: 0.88, target_height: 0.38 },
        { name: 'Floppy_Drive_Box', category: 'table_prop', placement: 'desk_right', surface_z: 0.88, target_height: 0.32 }
      ],
      vibe: 'Vintage dark wood paneling, glowing amber temporal chrono-portal ring, 90s posters, melamine desk, CRT monitor, floppy unit.',
      curated_prompts: [
        'The human and Gemini travel back to 1995 and try to explain modern cloud computing to dial-up users',
        'The human tries to download a 2MB image on a 14.4k modem and someone picks up the landline phone',
        'The human tries to explain npm node_modules to a 1995 engineer whose entire hard drive is 500 megabytes',
        'Gemini warns the human that trying to download React in 1995 will cause the world wide web to collapse'
      ]
    }
  ]
};

export function getRotatedEnvironment(slot, forcedTheme = null) {
  const envPool = SLOT_ENVIRONMENTS[slot] || SLOT_ENVIRONMENTS.commute_and_grind;
  if (forcedTheme) {
    const found = envPool.find(e => e.theme.toLowerCase() === forcedTheme.toLowerCase());
    if (found) return found;
  }

  // Load history to determine least recently used environment
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (e) { }
  }

  // Filter history for this slot
  const slotHistory = history.filter(h => h.slot === slot);
  const lastThemes = slotHistory.slice(-4).map(h => (h.theme || '').toLowerCase());
  const lastTheme = lastThemes[lastThemes.length - 1];

  // Candidates that are NOT the immediate last theme (prevent consecutive duplicates)
  let candidates = envPool.filter(e => e.theme.toLowerCase() !== lastTheme);
  if (candidates.length === 0) candidates = envPool;

  // Pick the candidate that appeared least recently
  candidates.sort((a, b) => {
    const idxA = lastThemes.lastIndexOf(a.theme.toLowerCase());
    const idxB = lastThemes.lastIndexOf(b.theme.toLowerCase());
    return idxA - idxB;
  });

  const chosen = candidates[0];
  console.log(`🎲 [SCENE SHUFFLER] Slot "${slot}" rotated to: "${chosen.theme}" (${chosen.name}) [Last was: "${lastTheme || 'none'}"]`);
  return chosen;
}

export async function fetchTrendingPremise(slot) {
  let trendingHeadlines = [];
  try {
    const scraped = await scrapeTrendingTopics();
    const hn = (scraped.hackerNews || []).map(h => h.title);
    const bn = (scraped.breakingNews || []).map(b => b.title);
    trendingHeadlines = [...hn.slice(0, 5), ...bn.slice(0, 5)];
  } catch (e) {
    console.warn("Trending scraper warning:", e.message);
  }

  // Load history to prevent repeats
  let historyTitles = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const hist = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
      historyTitles = hist.map(h => h.title.toLowerCase());
    } catch (e) { }
  }

  return {
    slot,
    metadata: getSlotMetadata(slot),
    trendingHeadlines,
    fallbackPool: (SLOT_ENVIRONMENTS[slot] || SLOT_ENVIRONMENTS.commute_and_grind).flatMap(e => e.curated_prompts),
    historyTitles
  };
}

/**
 * Autonomously creates complete Script and Stage Recipe for the slot
 */
export async function generateScheduledShow({ forcedSlot = null, forcedTopic = null, forcedTheme = null } = {}) {
  const slot = getScheduleSlot(forcedSlot);
  const metadata = getSlotMetadata(slot);
  const targetEnv = getRotatedEnvironment(slot, forcedTheme);
  const premiseData = await fetchTrendingPremise(slot);

  console.log(`\n📅 [SCHEDULE MANAGER] Active Slot: "${metadata.slotName}"`);
  console.log(`   • Slot Vibe: ${metadata.vibe}`);
  console.log(`   • Trending Headlines Scraped: ${premiseData.trendingHeadlines.length}`);

  const slotSpecificInstructions = `
MANDATORY PRE-SELECTED ENVIRONMENT FOR THIS EPISODE:
- Environment Theme: "${targetEnv.theme}" (${targetEnv.name})
- Required Camera Mode: "${targetEnv.camera_mode}" (MANDATORY: MUST match exactly!)
- Environment Setting & Comedic Vibe:
  ${targetEnv.vibe}

INSPIRATION TOPICS TAILORED TO THIS SPECIFIC SCENE:
${targetEnv.curated_prompts.map((p, idx) => '  ' + (idx + 1) + '. ' + p).join('\n')}
`;

  const prompt = `
You are the Executive Showrunner & Technical Director for an autonomous 3D comedy animation series featuring:
1. "Human": Awkward, introverted, overthinking tech worker.
2. "Gemini": Soft-spoken, clever, affectionate, witty floating AI companion with glowing spheres in her dome.

CURRENT PROGRAMMING SLOT:
- Slot Name: ${metadata.slotName}
- Target Vibe: ${metadata.vibe}
${forcedTopic ? `- FORCED TOPIC: "${forcedTopic}"` : ''}

${slotSpecificInstructions}

LIVE TRENDING HEADLINES FROM TODAY (Use as inspiration if relevant to the slot, or create a topical twist):
${premiseData.trendingHeadlines.map((h, i) => `  ${i + 1}. ${h}`).join('\n')}

RECENT EPISODE TITLES TO AVOID REPEATING:
${premiseData.historyTitles.slice(-10).map(t => `  - ${t}`).join('\n')}

FALLBACK TOPICS FOR THIS SLOT:
${premiseData.fallbackPool.map(t => `  • ${t}`).join('\n')}

REQUIREMENTS:
1. Write a rapid-fire comedic dialogue (EXACTLY 5 to 6 lines total, alternating Human and Gemini).
   - Line 0 MUST start in media res with instant high-stakes panic, confusion, or bold claim (Frame 0 Hook: punchy question, reaction, or bold claim).
   - Last Line must be a sharp comedic punchline or unexpected twist that concludes the scene.
   - CRITICAL: The Last Line MUST NEVER SHARE phrasing, topic summary, or vocal cadence with Line 0!
   - STRICTLY BANNED: Closing lines must NEVER start with or use wrap-up filler phrases like "And that's why...", "In conclusion...", "And that is why...", "So basically...", or summarizing the topic.
   - NO robot speak for Gemini (no numbers, statistics, or "protocol 42"). Gemini speaks with playful human wit and dry humor.
   - NATURAL DIALOGUE & PET-NAME MODERATION: Gemini may use a sarcastic term like "honey", "darling", or "baby" AT MOST ONCE in the entire video (or none at all) as a dry, patronizing older-sister roast (e.g. "Oh honey, you pushed to main"). NEVER repeat or stack pet names across multiple lines; it must NEVER sound romantic or weird. The banter must feel 100% natural, grounded, and witty between a tired dev and his sarcastic AI companion.
   - Punchy lines: 8 to 14 words per line. Spoken in ~2 seconds.
   - Cinematography: MANDATORY SHOT 1 RULE: Line 0 (0.0s - 2.5s) MUST ALWAYS use a tight chest-up close-up ("human" if Human speaks first, "gemini" if Gemini speaks first) framing face and hands clearly. NO wide establishing shots on Frame 1 / Line 0! Include wide two-shots ("wide") only in Shot 2+ (e.g. Line 2 or final punchline).
2. Generate a declarative "stage_recipe" JSON for our Universal 3D Procedural Stage Builder.
   - "theme": descriptive slug (e.g. "martian_surface_expedition", "spaceship_bridge", "corporate_office", "cozy_latenight_desk", "alien_beach")
   - "camera_mode": "standing_walk" (MANDATORY for outdoor exploration, space surfaces, parks, walks) or "seated" (ONLY for indoor desks/consoles/cafes)
   - CRITICAL OUTDOOR RULE: If the setting is outdoors (Mars surface, Moon, beach, park, desert), DO NOT spawn an office table or desk on the dirt! Instead, Human and Gemini are walking/exploring ("standing_walk"), and props are surface items (e.g. Interstellar Router, Rover Beacon, Specimen Jar, Science Scanner) placed on the ground or floating.
   - "ground": { "type": "plane", "material": "red_sand_terracotta" | "dark_wood_plank" | "concrete_pavement" | "metal_grid" | "grass_lawn" | "lunar_regolith", "roughness": 0.85 }
   - "backdrop": { "type": "panoramic_dome", "hdri_theme": "desert" | "night" | "office" | "cafe" | "street" | "sunset" | "studio" | "space", "sky_tint": [R, G, B, 1.0] }
   - "lighting": {
       "sun_color": [R, G, B], "sun_energy": number,
       "rim_accent_color": [R, G, B], "rim_energy": number
     }
   - "props": array of 2-3 props that fit the narrative.
       * If seated indoor: specify "category": "furniture" (Office_Desk or Cozy_Desk with surface_z: 0.88), ALWAYS include "Laptop" (placement: "desk_center", target_height: 0.20, surface_z: 0.88) so the human has an open computer screen to type on, plus 1 personal item (e.g. "Coffee_Mug", "Desk_Lamp", "Succulent_Plant").
       * If outdoor exploration: DO NOT include desks. Use "category": "table_prop" with ground placement (surface_z: 0.0) or handheld items.
       * Keep props within horizontal safe frustum X: -0.75m to +0.45m!
   - "background_motion": { "enabled": boolean, "type": "rover_or_creature" | "boss_walking" | "passing_cars" | "pulsing_hologram", "speed": 0.5 }

OUTPUT JSON STRICTLY:
{
  "title": "Viral Short Title (max 35 chars)",
  "slot": "${slot}",
  "premise": "1-sentence summary",
  "pinnedComment": "Debate-sparking question for viewers",
  "lines": [
    {
      "lineIndex": 0,
      "speaker": "Human",
      "text": "...",
      "emotion": "panic_sweat",
      "camera": "wide"
    }
  ],
  "stage_recipe": {
    "theme": "martian_surface_expedition",
    "camera_mode": "standing_walk",
    "ground": { "type": "plane", "material": "red_sand_terracotta", "roughness": 0.95 },
    "backdrop": { "type": "panoramic_dome", "hdri_theme": "desert", "sky_tint": [1.0, 0.7, 0.5, 1.0] },
    "lighting": {
      "sun_color": [1.0, 0.85, 0.6],
      "sun_energy": 4.2,
      "rim_accent_color": [0.2, 0.7, 1.0],
      "rim_energy": 50.0
    },
    "props": [
      {
        "name": "Interstellar_Router",
        "category": "table_prop",
        "placement": "desk_right",
        "target_height": 0.25,
        "surface_z": 0.0
      },
      {
        "name": "Sample_Container",
        "category": "table_prop",
        "placement": "desk_left",
        "target_height": 0.15,
        "surface_z": 0.0
      }
    ],
    "background_motion": {
      "enabled": true,
      "type": "rover_or_creature",
      "speed": 0.35
    }
  }
}
`;

  console.log(`🤖 [SHOWRUNNER] Requesting Gemini 2.5 Flash to synthesize show & stage recipe...`);
  const res = await generateWithCluster('showrunner', {
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  let cleanJson = res.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const match = cleanJson.match(/\{[\s\S]*\}/);
  if (match) cleanJson = match[0];

  // Robust JSON Sanitization
  cleanJson = cleanJson
    .replace(/\/\/.*$/gm, '')                 // Strip single-line comments
    .replace(/,\s*([\]}])/g, '$1')            // Strip trailing commas before ] or }
    .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // Quote unquoted object keys

  let plan;
  try {
    plan = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.warn("⚠️ JSON parse warning, attempting fallback extraction:", parseErr.message);
    const lastBrace = cleanJson.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleanJson = cleanJson.slice(0, lastBrace + 1);
    }
    plan = JSON.parse(cleanJson);
  }

  plan = enforceViralScriptConstraints(plan, targetEnv);
  console.log(`✅ [SCHEDULE MANAGER] Show plan synthesized & validated: "${plan.title}" (${plan.lines.length} lines, theme: ${plan.stage_recipe?.theme})`);

  return plan;
}

export function enforceViralScriptConstraints(plan, targetEnv = null) {
  if (!plan || !Array.isArray(plan.lines)) return plan;

  // 1. Enforce line count (5 to 6 lines max)
  if (plan.lines.length > 6) {
    plan.lines = plan.lines.slice(0, 6);
  }

  // 2. Enforce max 14 words per line for rapid-fire 1.5s-2.5s pacing
  for (let i = 0; i < plan.lines.length; i++) {
    const l = plan.lines[i];
    let words = l.text.trim().split(/\s+/);
    if (words.length > 14) {
      let trimmed = words.slice(0, 13).join(' ');
      if (!/[.!?]$/.test(trimmed)) trimmed += '!';
      console.log(`✂️ [PACING ENFORCER] Line ${i} trimmed from ${words.length} to 13 words: "${trimmed}"`);
      l.text = trimmed;
    }
  }

  // 3. Ensure distinct ending: Last line must NEVER repeat or duplicate Line 0!
  if (plan.lines.length >= 2) {
    const line0 = plan.lines[0];
    const lastLine = plan.lines[plan.lines.length - 1];

    // Mandatory Shot 1 Camera Rule: Line 0 MUST be tight close-up
    const speaker0 = (line0.speaker || '').toLowerCase();
    line0.camera = (speaker0 === 'human') ? 'human' : 'gemini';

    // Validate Opening Line Hook: punchy question, reaction, or bold claim
    if (!/[?!]$/.test(line0.text.trim())) {
      line0.text = line0.text.trim().replace(/\.+$/, '') + '?';
    }

    const norm0 = line0.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const normLast = lastLine.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const words0 = new Set(norm0.split(/\s+/).filter(w => w.length > 3));
    const wordsLast = normLast.split(/\s+/).filter(w => w.length > 3);
    const sharedWords = wordsLast.filter(w => words0.has(w));

    const BANNED_WRAP_UPS = [
      "and that's why", "and that is why", "in conclusion", "so basically",
      "and that's how", "and that is how", "to sum up", "moral of the story"
    ];
    const hasBannedWrapUp = BANNED_WRAP_UPS.some(phrase => normLast.includes(phrase));
    const isDuplicate = norm0 === normLast || (norm0.length > 15 && normLast.includes(norm0.slice(0, 15)));
    const isTopicRepeat = sharedWords.length >= 3 || (wordsLast.length > 0 && (sharedWords.length / wordsLast.length) > 0.4);

    if (hasBannedWrapUp || isDuplicate || isTopicRepeat) {
      console.log(`🚨 [DEDUP ENFORCER] Detected duplicate/wrap-up loop line: "${lastLine.text}". Replacing with crisp twist punchline.`);
      const humanTwists = [
        "I'm officially submitting my resignation to this entire simulation!",
        "I will be staring blankly at a terminal for the next seven hours.",
        "Just tell my family I died doing what I hated.",
        "I am deleting my email, my phone, and my physical presence.",
        "I'm pretty sure my heart rate just exceeded my credit score."
      ];
      const geminiTwists = [
        "I'm scheduling you for mandatory deep breathing and a nap.",
        "Next time, try turning your brain off and on again.",
        "I would offer sympathy, but my humor subroutines are fully loaded.",
        "I'm ordering you a chamomile tea and an adult coloring book.",
        "Don't worry, your panic attack has been logged and archived."
      ];

      const twistPool = lastLine.speaker === 'Human' ? humanTwists : geminiTwists;
      lastLine.text = twistPool[Math.floor(Math.random() * twistPool.length)];
      lastLine.emotion = lastLine.speaker === 'Human' ? "panic_sweat" : "playful_sarcasm";
    }
  }

  const lastLine = plan.lines[plan.lines.length - 1];
  if (lastLine && !/[.!?]$/.test(lastLine.text)) {
    lastLine.text += '!';
  }

  // 4. Strict Environment & Stage Recipe Alignment
  if (targetEnv && plan.stage_recipe) {
    if (plan.stage_recipe.theme !== targetEnv.theme) {
      console.log(`🛡️ [SLOT ENFORCER] Aligning recipe theme: "${plan.stage_recipe.theme}" -> "${targetEnv.theme}" (${targetEnv.name})`);
      plan.stage_recipe.theme = targetEnv.theme;
    }
    plan.stage_recipe.camera_mode = targetEnv.camera_mode;
    if (!plan.stage_recipe.backdrop) plan.stage_recipe.backdrop = { type: 'panoramic_dome' };
    plan.stage_recipe.backdrop.hdri_theme = targetEnv.hdri_theme;
    if (targetEnv.ground) plan.stage_recipe.ground = targetEnv.ground;
    if (targetEnv.lighting) plan.stage_recipe.lighting = targetEnv.lighting;
    if (targetEnv.props && (!plan.stage_recipe.props || plan.stage_recipe.props.length === 0)) {
      plan.stage_recipe.props = targetEnv.props;
    }
  }

  return plan;
}

if (process.argv[1]?.endsWith('schedule_manager.js')) {
  const forcedSlot = process.argv.includes('--slot') ? process.argv[process.argv.indexOf('--slot') + 1] : null;
  const forcedTopic = process.argv.includes('--topic') ? process.argv[process.argv.indexOf('--topic') + 1] : null;

  generateScheduledShow({ forcedSlot, forcedTopic }).then(plan => {
    console.log("\n📦 Generated Show Plan:");
    console.log(JSON.stringify(plan, null, 2));
  }).catch(err => {
    console.error("❌ Schedule Manager error:", err);
  });
}
