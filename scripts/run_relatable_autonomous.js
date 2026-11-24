/**
 * ==============================================================================
 * Autonomous 3D Comedy Showrunner Engine (Phase 2 Master)
 * ==============================================================================
 * Multi-character 3D episodic animation engine built with Blender & Remotion.
 * 
 * WORKFLOW ARCHITECTURE (30-Second Technical Overview):
 * 1. Narrative Showrunner: Generates high-tension, comedic developer dialogue
 *    between "Human" (awkward coder) and "Gemini" (witty AI companion).
 * 2. Multi-Character Speech: Synthesizes distinct voice personalities with
 *    expressive pauses, hesitation markers, and word-level alignment.
 * 3. Procedural 3D Stage & Lighting: Configures Blender camera crane paths,
 *    subdivision rigs, and cartoon physics micro-SFX foley.
 * 4. Closed-Loop Vision Auditor: Audits render frames for clipping & composition.
 * 5. Multi-Platform Distribution: Publishes directly to YouTube, Instagram Reels,
 *    Facebook Pages, X (Twitter), and Reddit with automated engagement pinning.
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { generateWithCluster } from './gemini_cluster.js';
import { auditRenderedStill } from './vision_scene_auditor.js';
import { sendXPackageToTelegram } from './send_x_package_to_telegram.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..');
const BLENDER_BIN = process.env.BLENDER_BIN || (fs.existsSync('D:\\Programs\\blender\\blender-4.3.0-windows-x64\\blender.exe') ? 'D:\\Programs\\blender\\blender-4.3.0-windows-x64\\blender.exe' : 'blender');
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(PROJECT_ROOT, 'out', 'artifacts');
const HISTORY_FILE = path.join(PROJECT_ROOT, 'scratch', 'phase2_history.json');

function getRecentEnvironments(days = 3) {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    return history.slice(-days).map(h => h.environment).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function getRecentTopics(count = 10) {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    return history.slice(-count).map(h => (h.topic || h.title_en || '').toLowerCase()).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function getRecentHistory(count = 10) {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    return history.slice(-count);
  } catch (e) {
    return [];
  }
}

function recordHistoryEntry(entry) {
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (e) { }
  }
  history.push({
    date: new Date().toISOString().slice(0, 10),
    ...entry
  });
  if (history.length > 50) history = history.slice(-50);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

// =========================================================================
// EXPANDED MULTI-GENRE MATRIX (AUTONOMOUS TOPIC POOL - HIGH-STAKES RELATABLE COMEDY)
// =========================================================================
const EXPANDED_GENRE_MATRIX = [
  // --- LIFESTYLE RELATABILITY, BESTIE DYNAMICS & BRAND-FRIENDLY TROPES ---
  {
    genre: 'cafe_and_urban_life',
    env: 'cafe_corner',
    slot: 'daytime',
    topic: "Human refuses to start any productive work until his 'emotional support iced coffee' is placed at the exact 45-degree angle beside his keyboard"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human justifies spending $45 on an artisanal scented candle to 'cure 5 years of accumulated burnout', while Gemini calculates how many seconds of sanity that actually purchased"
  },
  {
    genre: 'touching_grass_and_awkwardness',
    env: 'daylight_walk',
    slot: 'daytime',
    topic: "Human wears noise-canceling headphones with absolutely zero music playing just to legally avoid making eye contact in public, much to Gemini's amused diagnosis"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human spirals into deep panic over a one-letter text message: 'She replied with just 'K.' Gemini, does that mean okay, or should I pack my bags and change my legal name?'"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human buys a fancy leather-bound life planner hoping it will magically organize his chaotic life, while Gemini asks who will actually remember to open it"
  },
  // --- 1. LATE NIGHT (2 AM) — LIVING COUCH & BALCONY SANCTUARY ---
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'night_balcony_skyline',
    slot: 'evening',
    topic: "Human has a dead-serious existential dilemma at 2:14 AM: 'If I leave for the Himalayas tonight with ₹400 and a backpack, how many days until I become an enlightened monk?'"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human convinces himself at midnight that turning his life around requires buying $500 worth of leather notebooks and fancy stationery first"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'night_balcony_skyline',
    slot: 'evening',
    topic: "Human wonders if every lit apartment window in the city is another soul having an existential crisis or just screaming at CSS padding"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human tries to relax but suffers severe phantom Slack notification panic, hearing the ping in every ambient noise"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human confesses imposter syndrome: 'What if my entire career is just me aggressively Googling while looking stressed?'"
  },
  {
    genre: 'late_night_thoughts_and_self_realisation',
    env: 'night_balcony_skyline',
    slot: 'evening',
    topic: "Human plans at 2 AM to wake up at 5:00 AM, go for a 10km run, and overhaul his entire life, while Gemini places a bet that he won't wake up before noon"
  },

  // --- NEW: AI REQUIREMENTS VS BRUTAL ROAST (THE USER VS AI DYNAMIC) ---
  {
    genre: 'ai_demands_and_roasts',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human asks Gemini to build an AI that answers all his emails, but when Gemini asks for requirements, Human demands it sound polite while telling people to leave him alone forever"
  },
  {
    genre: 'ai_demands_and_roasts',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human asks Gemini to build a fitness app, but insists the app should do the pushups and sync the burned calories to his smartwatch"
  },
  {
    genre: 'ai_demands_and_roasts',
    env: 'corporate_office',
    slot: 'daytime',
    topic: "Human asks Gemini: 'Can we build an AI startup that automates everything?' Gemini asks for specs, Human says 'I don't want to code, I just want the funding and the CEO title'"
  },
  {
    genre: 'ai_demands_and_roasts',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human asks Gemini to build an automated budget tracker, but specifies that all purchases after 11 PM must be categorized as 'spiritual healing'"
  },

  // --- NEW: HEARTWARMING & EMOTIONAL RELATABLE (LATE NIGHT BURNOUT & GROUNDING) ---
  {
    genre: 'heartwarming_and_emotional_relatable',
    env: 'night_balcony_skyline',
    slot: 'evening',
    topic: "Human at 2 AM questions if all his hard work is amounting to anything, and Gemini delivers a deeply grounding, heartwarming reality check on how far he's actually come"
  },
  {
    genre: 'heartwarming_and_emotional_relatable',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human feeling burnt out confesses he feels like a complete fraud, and Gemini reminds him that even the greatest creators felt terrified while building masterpieces"
  },
  {
    genre: 'heartwarming_and_emotional_relatable',
    env: 'night_balcony_skyline',
    slot: 'evening',
    topic: "Human wonders why everyone online seems 10 steps ahead, and Gemini reminds him that social media is an edited highlight reel while real character is built in the quiet moments"
  },

  // --- 2. MORNING OFFICE DESK & CORPORATE SURVIVAL ---
  {
    genre: 'office_jokes_and_corporate_absurdities',
    env: 'corporate_office',
    slot: 'daytime',
    topic: "Human treats a 2-word Slack message from his manager ('Got a minute?') like a bomb-defusal countdown timer while Gemini calculates his survival odds at 0.4%"
  },
  {
    genre: 'office_jokes_and_corporate_absurdities',
    env: 'corporate_office',
    slot: 'daytime',
    topic: "Human aggressively types random gibberish into terminal with an intense furrowed brow to look critically important as the VP walks past his desk"
  },
  {
    genre: 'office_jokes_and_corporate_absurdities',
    env: 'corporate_office',
    slot: 'daytime',
    topic: "Human accidentally hits 'Reply All' on a company-wide email announcement and enters survival mode preparing to fake his death and change identities"
  },
  {
    genre: 'office_jokes_and_corporate_absurdities',
    env: 'corporate_office',
    slot: 'daytime',
    topic: "Human tries to explain in daily standup why changing a button color from blue to slightly darker blue took 4 full business days without sounding guilty"
  },
  {
    genre: 'office_jokes_and_corporate_absurdities',
    env: 'corporate_office',
    slot: 'daytime',
    topic: "Human receives an email starting with 'Per my previous email' and experiences immediate emotional damage, contemplating early retirement on the spot"
  },
  {
    genre: 'office_jokes_and_corporate_absurdities',
    env: 'corporate_office',
    slot: 'daytime',
    topic: "Human joins a 40-person Zoom meeting with camera and mic off, sweating in pure terror praying nobody says 'Let us hear from our developer'"
  },

  // --- 3. EVENING DEBUGGING DESK & HIGH-STAKES CODE CHAOS ---
  {
    genre: 'debugger_humor_and_chaos',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human has spent 4 hours screaming at the compiler and bribing the database with imaginary offerings, only for Gemini to ask: 'Did you press Ctrl+S?'"
  },
  {
    genre: 'debugger_humor_and_chaos',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human conducts an angry 3 AM git blame investigation to hunt down the idiot who broke production, only to discover he wrote the offending line 20 minutes ago"
  },
  {
    genre: 'debugger_humor_and_chaos',
    env: 'neon_datacenter',
    slot: 'evening',
    topic: "Human pushes a 'tiny 1-line harmless fix' to production on Friday at 5:58 PM and watches the server monitoring dashboard instantly light up in red alarms"
  },
  {
    genre: 'debugger_humor_and_chaos',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human adds 92 print('HERE_PLEASE_GOD_WORK') statements until the console log looks like a psychological horror manifesto"
  },
  {
    genre: 'debugger_humor_and_chaos',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human spends 5 hours diagnosing why the API is returning zero response, only to realize his local development server was never running"
  },
  {
    genre: 'debugger_humor_and_chaos',
    env: 'neon_datacenter',
    slot: 'evening',
    topic: "Human fixes a critical bug with a sketchy hack he doesn't understand, and now the company's entire multi-million dollar cloud architecture depends on that hack"
  },

  // --- 4. CODER SARCASM & TECH IRONY ---
  {
    genre: 'coder_sarcasm_and_tech_irony',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human spends 8 hours automating a 5-second task that he only performs once every six months, feeling like a technological god"
  },
  {
    genre: 'coder_sarcasm_and_tech_irony',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human refuses to buy a $3 coffee because 'it is an overpriced scam' but buys a $350 split ergonomic mechanical keyboard with custom switches because 'it boosts WPM'"
  },
  {
    genre: 'coder_sarcasm_and_tech_irony',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human over-engineers a simple two-item grocery shopping list into a distributed microservice with Redis caching and Docker containers"
  },
  {
    genre: 'coder_sarcasm_and_tech_irony',
    env: 'cozy_living_couch',
    slot: 'evening',
    topic: "Human deletes 800 lines of obsolete code, breaks zero tests, and feels like the most unstoppable apex predator on planet Earth"
  },
  {
    genre: 'coder_sarcasm_and_tech_irony',
    env: 'latenight_desk',
    slot: 'evening',
    topic: "Human spends 4 hours customizing his IDE color scheme, font ligatures, and terminal blur effects before writing a single character of actual code"
  },

  // --- 5. MORNING COFFEE SHOP & STREET WALK (OUTDOOR SOCIAL AWKWARDNESS) ---
  {
    genre: 'cafe_and_urban_life',
    env: 'cafe_corner',
    slot: 'daytime',
    topic: "Human turns ordering coffee into an intense hostage negotiation over a pretentious 12-page menu ('I just want hot brown water, not a French poem!')"
  },
  {
    genre: 'cafe_and_urban_life',
    env: 'cafe_corner',
    slot: 'daytime',
    topic: "Barista asks Human 'Oat milk, almond milk, or soy?' and Human freezes in fight-or-flight panic and whispers 'Whatever God wills'"
  },
  {
    genre: 'touching_grass_and_awkwardness',
    env: 'daylight_walk',
    slot: 'daytime',
    topic: "Human makes accidental eye contact with a distant neighbor on the sidewalk and frantically fakes an emergency phone call with Elon Musk to avoid waving"
  },
  {
    genre: 'touching_grass_and_awkwardness',
    env: 'daylight_walk',
    slot: 'daytime',
    topic: "Gemini forces Human outdoors to touch grass on a sunny day, and Human claims the sunlight is burning his monitor-calibrated retinas"
  },
  {
    genre: 'touching_grass_and_awkwardness',
    env: 'daylight_walk',
    slot: 'daytime',
    topic: "Human tries to walk naturally past strangers on the sidewalk and suddenly forgets how arms move, walking like a glitching NPC"
  },

  // --- 6. WEEKEND SCI-FI ADVENTURES & PETTY EVERYDAY SURREALISM ---
  {
    genre: 'weekend_scifi_adventures',
    env: 'martian_surface_expedition',
    slot: 'weekend',
    topic: "Human tries to take a sip of hot coffee on Mars and repeatedly bangs the ceramic mug against his transparent astronaut bubble helmet"
  },
  {
    genre: 'weekend_scifi_adventures',
    env: 'martian_surface_expedition',
    slot: 'weekend',
    topic: "Human and Gemini establish a research outpost on Mars, only to realize the Wi-Fi router password is taped to the fridge back on Earth"
  },
  {
    genre: 'weekend_scifi_adventures',
    env: 'martian_surface_expedition',
    slot: 'weekend',
    topic: "Human panics on the red Martian sand when the Mars rover displays a mandatory Windows Update prompt at 2% battery"
  },
  {
    genre: 'weekend_scifi_adventures',
    env: 'spaceship_bridge',
    slot: 'weekend',
    topic: "Human accidentally triggers warp drive on a starship while groping around in the dark trying to find the cup holder"
  },
  {
    genre: 'weekend_scifi_adventures',
    env: 'spaceship_bridge',
    slot: 'weekend',
    topic: "Gemini roasts Human for taking 20 minutes trying to parallel park a 400-meter titanium starship between two binary pulsars"
  },
  {
    genre: 'weekend_scifi_adventures',
    env: 'spaceship_bridge',
    slot: 'weekend',
    topic: "The starship navigation computer defaults to Apple Maps and plots a course directly through the center of an exploding supernova"
  },
  {
    genre: 'weekend_scifi_adventures',
    env: 'time_travel_1995',
    slot: 'weekend',
    topic: "Human time-travels back to 1995 to buy early tech stocks, but gets trapped for 45 minutes listening to screeching 56k dial-up internet"
  },
  {
    genre: 'weekend_scifi_adventures',
    env: 'time_travel_1995',
    slot: 'weekend',
    topic: "Human travels to 1995 and suffers a nervous breakdown trying to explain cloud computing to someone holding a 1.44 MB floppy disk"
  }
];

const WEEKEND_ENVS = ['martian_surface_expedition', 'spaceship_bridge', 'time_travel_1995', 'park_garden', 'cafe_corner'];
const EVENING_ENVS = ['cozy_living_couch', 'night_balcony_skyline', 'latenight_desk', 'neon_datacenter'];
const DAYTIME_ENVS = ['corporate_office', 'cafe_corner', 'daylight_walk', 'park_garden'];

export const WEEKEND_STAGE_RECIPES = {
  martian_surface_expedition: {
    theme: 'martian_surface_expedition',
    camera_mode: 'standing_walk',
    ground: { type: 'plane', material: 'red_sand_terracotta', roughness: 0.95 },
    backdrop: { type: 'panoramic_dome', hdri_theme: 'desert', sky_tint: [1.0, 0.75, 0.45, 1.0] },
    lighting: { sun_color: [1.0, 0.75, 0.45], sun_energy: 3.5, rim_accent_color: [0.9, 0.4, 0.1], rim_energy: 2.2 },
    props: []
  },
  spaceship_bridge: {
    theme: 'spaceship_bridge',
    camera_mode: 'seated',
    ground: { type: 'plane', material: 'metal_grid', roughness: 0.35 },
    backdrop: { type: 'panoramic_dome', hdri_theme: 'space', sky_tint: [0.1, 0.2, 0.4, 1.0] },
    lighting: { sun_color: [0.1, 0.8, 1.0], sun_energy: 2.5, rim_accent_color: [0.0, 0.6, 1.0], rim_energy: 3.0 },
    props: [
      { name: 'SciFi_Pilot_Console', category: 'furniture', placement: 'center', surface_z: 0.88 }
    ]
  },
  time_travel_1995: {
    theme: 'time_travel_1995',
    camera_mode: 'seated',
    ground: { type: 'plane', material: 'dark_wood_plank', roughness: 0.60 },
    backdrop: { type: 'panoramic_dome', hdri_theme: 'night', sky_tint: [1.0, 0.8, 0.5, 1.0] },
    lighting: { sun_color: [1.0, 0.80, 0.50], sun_energy: 2.8, rim_accent_color: [1.0, 0.6, 0.2], rim_energy: 2.0 },
    props: [
      { name: 'Retro_1995_Melamine_Desk', category: 'furniture', placement: 'center', surface_z: 0.88 },
      { name: 'Retro_CRT_Monitor', category: 'electronic', placement: 'desk_center', surface_z: 0.88, target_height: 0.38 },
      { name: 'Floppy_Drive_Box', category: 'table_prop', placement: 'desk_right', surface_z: 0.88, target_height: 0.32 }
    ]
  }
};

function inferEnvironmentFromTopic(topicText) {
  const t = topicText.toLowerCase();
  if (t.includes('mars') || t.includes('martian') || t.includes('astronaut') || t.includes('helmet') || t.includes('rover')) {
    return 'martian_surface_expedition';
  } else if (t.includes('spaceship') || t.includes('starship') || t.includes('warp') || t.includes('pulsar') || t.includes('supernova') || t.includes('bridge') || t.includes('cockpit')) {
    return 'spaceship_bridge';
  } else if (t.includes('time travel') || t.includes('1995') || t.includes('dial-up') || t.includes('floppy') || t.includes('modem') || t.includes('crt')) {
    return 'time_travel_1995';
  } else if (t.includes('couch') || t.includes('living room') || t.includes('sofa') || t.includes('pillow') || t.includes('unwind')) {
    return 'cozy_living_couch';
  } else if (t.includes('balcony') || t.includes('skyline') || t.includes('city lights') || t.includes('rooftop') || t.includes('himalaya') || t.includes('stars')) {
    return 'night_balcony_skyline';
  } else if (t.includes('coffee') || t.includes('cafe') || t.includes('latte') || t.includes('barista') || t.includes('order')) {
    return 'cafe_corner';
  } else if (t.includes('password') || t.includes('3 am') || t.includes('midnight') || t.includes('insomnia') || t.includes('late night') || t.includes('semicolon') || t.includes('css')) {
    return 'latenight_desk';
  } else if (t.includes('morning') || t.includes('wake') || t.includes('commute') || t.includes('sidewalk') || t.includes('walk') || t.includes('neighbor') || t.includes('grass')) {
    return 'daylight_walk';
  } else if (t.includes('production') || t.includes('server') || t.includes('deploy') || t.includes('database') || t.includes('cloud') || t.includes('datacenter')) {
    return 'neon_datacenter';
  } else if (t.includes('park') || t.includes('garden') || t.includes('tree') || t.includes('flower') || t.includes('nature') || t.includes('squirrel') || t.includes('bee')) {
    return 'park_garden';
  } else if (t.includes('boss') || t.includes('office') || t.includes('standup') || t.includes('meeting') || t.includes('slack') || t.includes('email') || t.includes('quick minute')) {
    return 'corporate_office';
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'martian_surface_expedition';
  const currentHour = now.getHours();
  const isEvening = (currentHour >= 18 || currentHour < 5);
  return isEvening ? 'cozy_living_couch' : 'corporate_office';
}

// =========================================================================
// AGENT 0: AUTONOMOUS TOPIC & GENRE DECIDER
// =========================================================================

async function decideViralTopicAndScene(requestedTopic = null, requestedEnv = null, requestedGenre = null) {
  if (requestedTopic) {
    let env = requestedEnv || inferEnvironmentFromTopic(requestedTopic);
    return { topic: requestedTopic, environment: env, genre: requestedGenre || 'custom', slot: 'custom' };
  }

  const now = new Date();
  const currentHour = now.getHours(); // 0 to 23
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

  // 6:00 PM (18:00) to 4:59 AM (04:59) = Evening / Night Slot; 5:00 AM to 5:59 PM = Daytime Slot
  const isEvening = (currentHour >= 18 || currentHour < 5);
  // Evening slot takes precedence during night hours (18:00 to 04:59) even on weekends for evening unwind / late night relatable vibes
  const slot = isEvening ? 'evening' : (isWeekend ? 'weekend' : 'daytime');
  const recentEnvs = getRecentEnvironments(3);
  const recentTopics = getRecentTopics(10);

  console.log(`\n🧠 [TOPIC DECIDER AGENT] Determining today's episode genre, premise & setting...`);
  console.log(`   • Current Time: ${now.toLocaleTimeString()} | ${slot === 'evening' ? '🌙 Evening/Night' : (slot === 'weekend' ? '🎉 WILD WEEKEND ADVENTURE' : '☀️ Morning/Day')} Slot`);
  console.log(`   • Anti-Repeat Filter - Recent Environments: [${recentEnvs.join(', ')}]`);

  // Candidate genres weighted by weekend vs weekday time-of-day
  const weekendGenres = [
    'weekend_scifi_adventures',
    'touching_grass_and_awkwardness',
    'cafe_and_urban_life'
  ];
  const eveningGenres = [
    'heartwarming_and_emotional_relatable',
    'late_night_thoughts_and_self_realisation',
    'coder_sarcasm_and_tech_irony',
    'debugger_humor_and_chaos'
  ];
  const daytimeGenres = [
    'office_jokes_and_corporate_absurdities',
    'touching_grass_and_awkwardness',
    'cafe_and_urban_life'
  ];

  let chosenGenre = requestedGenre;
  if (!chosenGenre) {
    if (slot === 'evening') {
      const recentHistory = getRecentHistory(10);
      const recentGenres = recentHistory.map(h => h.genre).filter(Boolean);
      const lastEmotionalIdx = recentGenres.lastIndexOf('heartwarming_and_emotional_relatable');
      const episodesSinceEmotional = lastEmotionalIdx === -1 ? recentGenres.length : (recentGenres.length - 1 - lastEmotionalIdx);

      // 25%–33% Cadence Cycle:
      // - Baseline random pick across the 4 evening candidates gives exactly 1 in 4 (25%).
      // - If 2 episodes have passed with NO emotional/heartwarming content, boost probability to 33.3% (1 in 3 cadence).
      // - If 3 or more episodes have passed, guarantee it (100%) so the channel rhythm stays balanced.
      const roll = Math.random();
      if (episodesSinceEmotional >= 3) {
        console.log(`   ✨ [CADENCE GUARANTEE] ${episodesSinceEmotional} episodes without emotional relatable video. Triggering heartwarming cycle.`);
        chosenGenre = 'heartwarming_and_emotional_relatable';
      } else if (episodesSinceEmotional >= 2 && roll < 0.33) {
        console.log(`   ✨ [33% CADENCE BOOST] ${episodesSinceEmotional} episodes without emotional relatable video. Selected heartwarming cycle.`);
        chosenGenre = 'heartwarming_and_emotional_relatable';
      } else {
        chosenGenre = eveningGenres[Math.floor(Math.random() * eveningGenres.length)];
        console.log(`   🎲 [25% EVENING ROLL] Selected: "${chosenGenre}" (${episodesSinceEmotional} episodes since last emotional)`);
      }
    } else {
      const candidateGenres = slot === 'weekend' ? weekendGenres : daytimeGenres;
      chosenGenre = candidateGenres[Math.floor(Math.random() * candidateGenres.length)];
    }
  }
  console.log(`   • Selected Genre Category: "${chosenGenre}"`);

  // Filter pool matching genre & slot
  let pool = EXPANDED_GENRE_MATRIX.filter(item => item.genre === chosenGenre);
  if (pool.length === 0) {
    pool = EXPANDED_GENRE_MATRIX.filter(item => item.slot === slot);
  }

  if (requestedEnv) {
    const envPool = pool.filter(item => item.env === requestedEnv);
    if (envPool.length > 0) pool = envPool;
  } else {
    // Avoid recent environments if candidates exist
    const envEligible = pool.filter(item => !recentEnvs.includes(item.env));
    if (envEligible.length > 0) pool = envEligible;
  }

  // Avoid recently used topics
  const freshPool = pool.filter(item => !recentTopics.some(rt => item.topic.toLowerCase().includes(rt) || rt.includes(item.topic.toLowerCase())));
  const finalCandidates = freshPool.length > 0 ? freshPool : pool;
  const picked = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];

  let finalTopic = picked.topic;
  let finalEnv = requestedEnv || picked.env;
  let finalGenre = picked.genre;

  // Let the creative Topic Decider Agent (Gemini) propose an even fresher spin or brand new premise
  try {
    const agentPrompt = `You are the Lead Creative Director & Topic Decider Agent for a viral 3D animated comedy series starring an awkward creative guy ("Human") and his witty AI companion ("Gemini").
Today's Slot: ${isWeekend ? 'WILD WEEKEND ADVENTURES & SCI-FI ESCAPES (Mars exploration with astronaut spacesuit & bubble helmet, Spaceship bridge with cockpit viewport, or 1995 Time Travel retro lab)' : (isEvening ? 'Evening / Late-Night (Relaxing at home couch, looking at city skyline from balcony, or late night desk)' : 'Morning / Daytime (Office, Cafe, Sunny Walk)')}
Today's Slot: ${slot === 'weekend' ? 'WILD WEEKEND ADVENTURE & SCI-FI ESCAPE (Mars exploration with astronaut spacesuit & bubble helmet, Spaceship bridge with cockpit viewport, or 1995 Time Travel retro lab)' : (slot === 'evening' ? 'Evening / Late-Night (Relaxing at home couch, looking at city skyline from balcony, or late night desk)' : 'Morning / Daytime (Office, Cafe, Sunny Walk)')}
Today's Target Genre: "${chosenGenre}"
Target Setting: "${finalEnv}"

Curated Seed Premise: "${picked.topic}"

Rules:
1. You can either approve this seed premise, OR invent an ultra-relatable topic of the same genre.
2. CORE COMEDY FORMULAS:
   A) "Human Request vs AI Roast": Human brings an ambitious, lazy, or delusional demand to AI ("Can we build an app that does X?"), and Gemini roasts the absurdity of the requirements.
   B) "Everyday Relatable Dilemma": High-stakes over everyday real life (2-word Slack pings, imposter syndrome, rent math, buying $350 mechanical keyboards while crying over $3 coffee, 2 AM life overhauls).
   C) "Heartwarming / Emotional Relatable Moment": Deep, honest late-night talk where Gemini provides genuine, grounding comfort and reassurance to a tired or overwhelmed Human.
   D) "The Bestie Dynamic & Everyday Lifestyle Delusions" (High Shareability & Brand/Affiliate Magnet): Human's relatable micro-anxieties (spiraling over a 1-letter text 'K.', emotional support iced coffee, buying $45 candles to cure 5 years of burnout, wearing noise-canceling headphones with zero music to avoid eye contact). Gemini acts as the affectionate, sharp best-friend / big-sister giving tough love.
3. SCENE IS STRICTLY A VISUAL PROP: The setting (${finalEnv}) is purely visual eye candy so viewers don't get bored of the same room. The topic and dialogue MUST NEVER talk about or personify the furniture, couch, walls, ceiling, or appliances!
4. NO abstract, high-IQ, or surreal fantasy metaphors (no screaming appliances or talking food).
5. Do NOT mention "Dev" or "Coder" in the topic—refer to the character as "Human".
6. Output strictly valid JSON:
{
  "topic": "The exact topic premise in 1 punchy sentence",
  "environment": "${finalEnv}",
  "genre": "${chosenGenre}",
  "creativeHook": "Why this will hook the audience in Frame 0"
}`;

    const res = await generateWithCluster('showrunner', {
      contents: agentPrompt,
      config: { responseMimeType: 'application/json' }
    });

    if (res && res.text) {
      let cleanJson = res.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) cleanJson = match[0];
      const parsed = JSON.parse(cleanJson);
      if (parsed.topic && parsed.topic.length > 10) {
        finalTopic = parsed.topic;
        if (parsed.environment) finalEnv = parsed.environment;
        if (parsed.genre) finalGenre = parsed.genre;
        if (chosenGenre === 'heartwarming_and_emotional_relatable') {
          finalGenre = 'heartwarming_and_emotional_relatable';
        } else if (parsed.genre && EXPANDED_GENRE_MATRIX.some(m => m.genre === parsed.genre)) {
          finalGenre = parsed.genre;
        }
        console.log(`✨ [TOPIC DECIDER AGENT] AI Creative Polish: "${finalTopic}"`);
        if (parsed.creativeHook) console.log(`   • Hook Angle: ${parsed.creativeHook}`);
      }
    }
  } catch (err) {
    console.log(`ℹ️ [TOPIC DECIDER AGENT] Using curated seed topic: "${finalTopic}"`);
  }

  console.log(`🎯 [TOPIC DECIDER AGENT] Final Decision:`);
  console.log(`   • Topic: "${finalTopic}"`);
  console.log(`   • Setting: "${finalEnv}"`);
  console.log(`   • Genre: "${finalGenre}"`);

  return { topic: finalTopic, environment: finalEnv, genre: finalGenre, slot };
}

function parseArgs() {
  const args = process.argv.slice(2);
  let topic = null;
  let environment = null;
  let genre = null;
  let qaOnly = false;
  let reuseManifest = false;
  let voiceHuman = 'human';
  let voiceAI = 'gemini';
  let ttsEngine = process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'kokoro'; // High-emotion ElevenLabs (Will & Jessica) with Kokoro fallback
  let doPublish = false;
  let dryRun = false;
  let scriptOnly = false;
  let lang = 'en'; // 100% Strict Native English-Only (YouTube, Instagram, Facebook)

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = args[++i];
    } else if (args[i] === '--environment' && args[i + 1]) {
      environment = args[++i];
    } else if (args[i] === '--genre' && args[i + 1]) {
      genre = args[++i];
    } else if (args[i] === '--qa-only') {
      qaOnly = true;
    } else if (args[i] === '--script-only') {
      scriptOnly = true;
    } else if (args[i] === '--reuse-manifest') {
      reuseManifest = true;
    } else if (args[i] === '--publish') {
      doPublish = true;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--lang' && args[i + 1]) {
      lang = args[++i].toLowerCase();
    } else if (args[i] === '--voice-human' && args[i + 1]) {
      voiceHuman = args[++i];
    } else if (args[i] === '--voice-ai' && args[i + 1]) {
      voiceAI = args[++i];
    } else if (args[i] === '--engine' && args[i + 1]) {
      ttsEngine = args[++i].toLowerCase();
    }
  }

  return { topic, environment, genre, qaOnly, scriptOnly, reuseManifest, voiceHuman, voiceAI, ttsEngine, doPublish, dryRun, lang };
}

function sanitizeSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40);
}

// =========================================================================
// AGENT 1: NATURAL SHOWRUNNER (VIRAL PACING & DUAL-LAYER COMEDY)
// =========================================================================

async function generateRelatableScript(topicText, environment, genre = 'relatable_comedy') {
  console.log(`\n✍️ [AGENT 1: SHOWRUNNER] Writing viral relatable comedy script (Smart Dual-Channel)...`);
  console.log(`   • Topic: "${topicText}"`);
  console.log(`   • Setting: ${environment}`);
  console.log(`   • Genre: ${genre}`);

  let genreGuidance = "";
  if (genre === 'ai_demands_and_roasts') {
    genreGuidance = `
GENRE FOCUS: AI REQUIREMENTS VS BRUTAL ROAST (THE USER VS AI DYNAMIC)
- Human comes with an ambitious, lazy, or hilariously unhinged request ("Can we build an AI that does X?").
- Gemini asks for the requirements/specs with enthusiastic curiosity.
- Human reveals their absurd, lazy, or completely contradictory requirements.
- Gemini delivers a lethal, deadpan reality check roasting the laziness, audacity, or delusion.`;
  } else if (genre === 'heartwarming_and_emotional_relatable') {
    genreGuidance = `
GENRE FOCUS: HEARTWARMING & EMOTIONAL RELATABLE (LATE NIGHT BURNOUT & GROUNDING)
- Deep, honest, vulnerable human moments: feeling behind in life, imposter syndrome, fatigue from trying so hard.
- Gemini steps out of pure sarcasm and offers authentic, grounding, comforting perspective that makes the viewer feel seen.
- Warm, touching, or gently humorous conclusion that leaves the viewer with a sense of relief and companionship.`;
  } else if (genre === 'late_night_thoughts_and_self_realisation') {
    genreGuidance = `
GENRE FOCUS: LATE NIGHT 2 AM STUPID STAKES & EXISTENTIAL CRISIS
- The Human has dead-serious, life-altering debates at 2:14 AM over completely ridiculous or petty stakes (e.g. running away to the Himalayas with ₹400, buying $500 leather stationery to overhaul his life, imposter syndrome Googling).
- Gemini provides brutally deadpan reality checks, roasts his ridiculous timeline, or gives heartwarming clarity.
- Contrast: Human treats a 2 AM random impulse like a grand philosophical revelation; Gemini treats it like a sleep-deprived delusion.`;
  } else if (genre === 'coder_sarcasm_and_tech_irony') {
    genreGuidance = `
GENRE FOCUS: CODER SARCASM & TECH IRONY (OVER-ENGINEERING & OBSESSIONS)
- Human spends 8 hours automating a 5-second task, or buys a $350 mechanical keyboard while crying over a $3 coffee.
- Punchy, dry banter highlighting the hilarious hypocrisy of modern developer habits.`;
  } else if (genre === 'debugger_humor_and_chaos') {
    genreGuidance = `
GENRE FOCUS: DEBUGGER PANIC & THE CTRL+S SHOCK
- High-stakes code catastrophe: 4 hours of screaming, threatening the compiler, bribing the server with prayers, only to discover he forgot to save the file (Ctrl+S), or git blame proves he wrote the bug himself 20 minutes ago.
- Immediate catastrophic panic in Frame 0.`;
  } else if (genre === 'office_jokes_and_corporate_absurdities') {
    genreGuidance = `
GENRE FOCUS: CORPORATE SURVIVAL & THE SLACK BOMB DEFUSAL
- Treating mundane corporate interactions as apocalyptic threats: Manager's 2-word Slack message ("Got a minute?") treated like an FBI raid countdown with 0.4% survival rate; faking intense phone calls; standup panic.
- Immediate fight-or-flight panic.`;
  } else if (genre === 'touching_grass_and_awkwardness') {
    genreGuidance = `
GENRE FOCUS: TOUCHING GRASS & OUTDOOR SOCIAL AWKWARDNESS
- Walking outdoors like a glitching NPC, faking calls to avoid waving at distant neighbors, treating sunlight like a biological hazard.`;
  } else if (genre === 'cafe_and_urban_life') {
    genreGuidance = `
GENRE FOCUS: CAFE HOSTAGE NEGOTIATION & URBAN INTIMIDATION
- Ordering coffee turns into a hostage negotiation over a 12-page hipster menu ("I just want hot brown water, not a French poem!"). Barista asking milk options causes an existential system crash.`;
  }

  const prompt = `
You are the Head Comedy Writer for viral 3D animated shorts (1M-10M views benchmark).
You are creating a Smart Dual-Channel Episode:
Channel 1 (Global): English for YouTube Shorts and X (Twitter)
Channel 2 (India): Relatable Hinglish with authentic Indian tech/office banter (Bhai, Kaand ho gaya, Boss ne dekh liya toh?, Chill maar) for Instagram Reels and Facebook Reels.

Cast:
1. "Human": The protagonist (an awkward, lovable techie and creative guy who catastrophically overreacts to tiny everyday problems, brings hilarious demands to AI, or occasionally has moments of burnout/doubt).
2. "Gemini": An expressive, witty companion with playful sarcasm, deadpan reality checks, cutting roasts, or warm grounding wisdom when needed.

Topic: "${topicText}"
Setting: "${environment}"
Genre: "${genre}"
${genreGuidance}

CORE CREATIVE DIRECTIVES:
1. RULE 1: THE SCENE & ENVIRONMENT ARE 100% INDEPENDENT BACKGROUND PROPS!
   - The 3D environment ("${environment}") is SOLELY cinematic visual eye candy and surprise so viewers never see repeated rooms.
   - THE SCRIPT, DIALOGUE, AND JOKES MUST HAVE ABSOLUTELY ZERO TO DO WITH THE ENVIRONMENT!
   - NEVER mention the furniture, couch, sofa, cushions, ceiling, walls, desk, or floor in the dialogue.
   - NEVER personify inanimate objects or make weird room metaphors (NO "bank balance screams louder than ceiling", NO "couch called HR", NO "asking the walls", NO "the cushions are judging me").
   - The entire conversation is 100% between Human and Gemini about REAL HUMAN LIFE, REAL HABITS, REAL DILEMMAS, OR THE DYNAMIC BETWEEN USER AND AI!

2. RULE 2: FOUR COMEDIC & RELATABLE ARCHETYPES (ADAPT TO THE TOPIC):
   Archetype A: "The Human Request vs AI Roast" (Classic User vs AI Dynamic):
     - Human asks AI to build/automate something ambitious or lazy.
     - Gemini says yes and asks for the requirements.
     - Human explains their hilariously unhinged, lazy, or contradictory requirements.
     - Gemini delivers a razor-sharp roast exposing the sheer delusion.
   Archetype B: "Everyday Relatable Modern Dilemma / Crisis":
     - Genuine, embarrassing human friction: 2-word Slack pings ("Got a min?"), checking bank balance at 2 AM, rent deadlines, buying a $350 mechanical keyboard while crying over a $3 coffee, imposter syndrome, 2 AM life overhaul delusions.
   Archetype C: "Emotional / Heartwarming Relatable Moment":
     - If the premise touches burnout, exhaustion, or feeling behind in life, do NOT force cheap slapstick! Let Human be honestly vulnerable, and let Gemini provide an authentic, comforting, grounding perspective that makes the viewer feel seen.
   Archetype D: "The Bestie Dynamic & Everyday Lifestyle Delusions" (High Shareability & Brand/Affiliate Magnet):
     - Focus on universally relatable everyday micro-anxieties: over-analyzing a 1-word text ("K."), emotional support coffee/matcha obsessions, buying candles/planners to magically cure burnout, wearing noise-canceling headphones with no music to avoid small talk.
     - Gemini brings that warm, affectionate best-friend / big-sister energy: witty reality checks wrapped in genuine care ("Chief, drink some water and put the phone face down").
     - Naturally features relatable lifestyle anchors (cups, headphones, notebooks, phone screens) that viewers immediately relate to, share with friends, and prime the channel for product tagging.

3. RULE 3: DYNAMIC DIALOGUE PACING & FIRST 1.5-SECOND ANTI-SWIPE PROTOCOL:
   - THE 1.5-SECOND HOOK (VITAL): 71% of viewers swipe within 1.2 seconds! Line 0 MUST arrest the thumb instantly:
     * NEVER start on a slow greeting, polite inquiry, or casual question (NO "Gemini, could you...", NO "What do you think about...").
     * Open IMMEDIATELY with an urgent crisis, shocking confession, high-stakes panic, or visceral modern dilemma (e.g., "My manager sent two words on Slack...", "I just pulled the neighborhood power grid...", "They are charging fourteen dollars for hot WATER?").
     * Line 0 must be short, punchy, and provocative: Max 6-9 words!
     * Line 0 MUST pair with a HIGH-ENERGY kinetic physical action from the catalog (e.g. "double_take", "table_slam_shock", "panic_head_clutch", "reading_menu_squint", "frantic_typing", "skeptical_lean", "shock_pop"). NEVER start on an idle or relaxed pose!
   - Middle Lines: Rapid back-and-forth escalation, hilarious requirement reveal, or witty banter.
   - Penultimate Line: Peak absurdity or realization.
   - Final Line: Killer punchline, roast, or heartwarming grounding closer.
   - SEAMLESS LOOPING HOOK: The final line should naturally lead back or connect conceptually to Line 0's topic so the video seamlessly replays on loop in the Shorts feed.

4. NATIVE DUAL-CHANNEL GENERATION (ZERO LITERAL TRANSLATION):
   - FOR GLOBAL ENGLISH ("text_en"):
     * Fast-paced, cynical, dry, self-deprecating Western comedy (think Silicon Valley, The Office, Ryan Reynolds).
     * NEVER use Hindi words ("yaar", "guru", "bhai", "arre")—they sound awkward with English TTS!
     * NEVER speak the character's name ("Seety", "Dev", "Coder").
     * Use natural English casual nicknames: "Chief", "Buddy", "Man", "Bro", "Genius", "Legend".
   - FOR INDIA HINGLISH ("text_hi_display" & "text_hi_audio"):
     * Write natively in authentic, dramatic desi rhythm and everyday street banter ("Bhai kasam se...", "Zindagi jhand ho chuki hai", "Bhai mera bag pack kar").
     * The comedy comes from dramatic Indian contrast and over-the-top desi panic!
     * NEVER speak the character's name ("Seety", "Dev", "Coder"). Use natural banter ("Bhai", "Yaar", "Guru", "Ustaad").

5. PROSODY, NATURAL SPEECH & WORD-LEVEL STRESS DIRECTIVES (CRITICAL FOR REALISTIC TTS):
   - Real conversational speech is NEVER flat or monotone. Characters pause, breathe, and punch key words!
   - In EVERY line of "text_en" (and "text_hi_display"), apply natural speech mechanics:
     * STRATEGIC WORD STRESS (ALL CAPS): Put EXACTLY ONE operative word (or short 2-word phrase) in ALL CAPS per line to instruct the neural voice engine to elevate pitch, volume, and punch (e.g. "winning BIG", "their TEASER TRAILER", "actually SLEEP", "pitch BLACK").
     * NATURAL CONTEMPLATIVE PAUSES (...): Use ellipses ("...") when a character hesitates, takes a breath, or has an emotional realization (e.g. "I'm just... existing?", "Okay... maybe you're right.").
     * CONVERSATIONAL EM-DASHES (—): Use em-dashes ("—") for parenthetical thoughts or natural mid-sentence pauses (e.g. "Hero stories take years—you just started chapter one.").

6. PROPS REALISM: Human only has a laptop at a desk ("corporate_office", "latenight_desk"). In "cozy_living_couch" and "night_balcony_skyline", there is NO laptop—Human relaxes beside a coffee mug!

GOLDEN STANDUP FEW-SHOT BENCHMARKS:

[GOLDEN EXAMPLE 1: Human Request vs AI Roast (6 lines)]
Human (Line 0): "Gemini, can you build an AI that handles ALL my client calls?"
Gemini (Line 1): "Of course! What personality parameters should I program?"
Human (Line 2): "It needs to agree enthusiastically, but secretly DELETE all the action items."
Gemini (Line 3): "So you want me to turn an artificial intelligence into a corporate POLITICIAN?"
Human (Line 4): "And if they ask for a deadline... it makes a sad DIAL-UP modem sound."
Gemini (Line 5): "I am a multi-modal language model, not your co-conspirator in FEDERAL fraud."

[GOLDEN EXAMPLE 2: Everyday Relatable Dilemma (6 lines)]
Human (Line 0): "Gemini, manager sent two words on Slack: 'Got a minute?'"
Gemini (Line 1): "Translation: Your career has approximately FORTY-FIVE seconds of life support."
Human (Line 2): "Should I reply 'Sure!'... or fake a sudden neighborhood blackout?"
Gemini (Line 3): "Replying 'Sure' takes courage. Faking a blackout requires turning off your WI-FI router."
Human (Line 4): "I just pulled the main circuit breaker... My whole street is pitch BLACK."
Gemini (Line 5): "A masterclass in problem-solving. Now explain the darkness to the FIRE department."

[GOLDEN EXAMPLE 3: Emotional / Relatable Reality Check (5 lines)]
Human (Line 0): "Gemini... looking at everyone succeeding online... did I WASTE my twenties?"
Gemini (Line 1): "You're comparing your raw footage... to their TEASER TRAILER."
Human (Line 2): "Yeah, but they're raising Series A while I'm fixing margin padding at 2 AM."
Gemini (Line 3): "You shipped three complete systems this year with zero funding and pure grit. That isn't wasting time—that's building a FOUNDATION."
Human (Line 4): "Thanks Gemini... but you know tomorrow night at 2 AM I'm still gonna ask..."

8. CIRCULAR SENTENCE LOOP ARCHITECTURE (MANDATORY FOR 120%+ RETENTION):
   - The final line MUST be an open setup or unfinished phrase that grammatically and conceptually connects directly back into Line 0!
   - When the Shorts feed auto-replays, the viewer must experience an unbroken, seamless circle before realizing the video ended.
   - Examples:
     * Final Line: "Because deep down, every developer knows what happens when..." -> loops to Line 0: "Manager sent two words on Slack: 'Got a minute?'"
     * Final Line: "Now go to sleep, because tomorrow at 2 AM you're going to ask me..." -> loops to Line 0: "Gemini, is all this hard work for nothing?"

9. OPINION & DEBATE PINNED COMMENTS (MANDATORY FOR 500+ COMMENTS):
   - Never output weak, passive questions like "Share your thoughts" or "Do you agree?".
   - You MUST output an ego-challenging, polarizing binary question in 'pinnedComment_en' and 'pinnedComment_hi'.
   - Force viewers to defend their lifestyle, pick a side, or confess an embarrassing habit.
     * Examples: "Be honest: Is 14hr daily grind discipline, or are we all just coping? 👇", "Are you loyal to your company, or just 1 missed paycheck away from ghosting everyone? Be real 👇"

10. DUAL-LANGUAGE REQUIREMENT (WITH DUAL HINDI SCRIPT):
   Each line MUST provide:
   - "text_en": Punchy English dialogue for Global Shorts (natural nicknames: "Chief", "Buddy", "Man", "Bro", "Genius"). Max 8-11 words.
   - "text_hi_display": Culturally adapted, punchy conversational Hinglish STRICTLY written in 100% Roman/English letters. NEVER use Devanagari script in this field. Max 8-11 words.
   - "text_hi_audio": The EXACT SAME dialogue written in 100% DEVANAGARI script for the neural TTS audio engine. Transliterate English loan words phonetically into Devanagari.
   - "text_hi": Set to the same value as text_hi_display for backward compatibility.

7. APPROVED EMOTION & ACTION CATALOG (MANDATORY VARIETY - NEVER REPEAT!):
   You MUST select an appropriate physical action for each line from this exact catalog.
   NEVER repeat the same action twice in a single script! Each line must have its own distinct physical acting:
   
   HUMAN APPROVED ACTIONS:
   - Confusion/Awkwardness: "shrug", "head_scratch", "double_take", "skeptical_lean", "reading_menu_squint"
   - Sarcasm/Pride: "mic_drop_nod", "finger_guns_pride", "chest_puff_proud", "arm_cross_stubborn"
   - Desperation/Defense: "pleading_hands", "hands_out_why", "reach_for_coffee"
   - Props/Table Acts: "coffee_sip", "table_slam_shock", "chin_rest_listening", "frantic_typing"
   - Exhaustion/Burnout: "coffee_stare_daze", "yawn_stretch", "excited_point"
   - Overwhelm (MAX 1 PER SCRIPT!): "panic_head_clutch", "facepalm", "head_in_hands_slump", "sad_slump", "slow_panic_recoil"

   GEMINI APPROVED ACTIONS:
   - Sarcasm/Pride: "sassy_tilt", "smug_spin", "suspicious_squint", "agent_wink", "mic_drop_descend"
   - Shock/Reactions: "shock_pop", "dramatic_gasp", "concerned_float", "laughing_bob"
   - Spatial Gestures: "tentacle_point", "clock_point", "judging_orbit", "facepalm_spin", "whisper_lean", "orbs_overload_fizz", "gentle_nudge"

Output strictly valid JSON matching this schema:
{
  "title_en": "Ultra-punchy 3-5 word hook title in ALL CAPS (e.g. POV: 2 AM EXISTENTIAL COPE)",
  "title_hi": "Ultra-punchy 3-5 word Hinglish hook title (e.g. POV: RAAT 2 BAJE KA PANIC)",
  "premise": "One line core comedic premise",
  "pinnedComment_en": "Polarizing debate question forcing viewers to pick a side or defend their ego (e.g. 'Be honest: Is 14hr grind discipline or pure cope? 👇')",
  "pinnedComment_hi": "Polarizing debate question in Hinglish forcing comments (e.g. 'Bhai sach batao: 14 ghante grind discipline hai ya bas cope? 👇')",
  "lines": [
    {
      "lineIndex": 0,
      "speaker": "Human",
      "text_en": "Gemini, can you build an AI that goes to the gym for me?",
      "text_hi_display": "Bhai ek aisa AI bana de jo meri jagah gym chala jaye?",
      "text_hi_audio": "भाई एक ऐसा एआई बना दे जो मेरी जगह जिम चला जाए?",
      "text_hi": "Bhai ek aisa AI bana de jo meri jagah gym chala jaye?",
      "emotion": "reading_menu_squint",
      "camera": "human"
    },
    {
      "lineIndex": 1,
      "speaker": "Gemini",
      "text_en": "Certainly. What fitness goals should the algorithm prioritize?",
      "text_hi_display": "Zaroor! Algorithm ko kaunse fitness goals achieve karne chahiye?",
      "text_hi_audio": "ज़रूर! एल्गोरिदम को कौन से फिटनेस गोल्स अचीव करने चाहिए?",
      "text_hi": "Zaroor! Algorithm ko kaunse fitness goals achieve karne chahiye?",
      "emotion": "sassy_tilt",
      "camera": "gemini"
    },
    {
      "lineIndex": 2,
      "speaker": "Human",
      "text_en": "It does 100 pushups, and syncs the six-pack directly to my stomach.",
      "text_hi_display": "Woh sau pushup maare, aur six pack seedha mere pet pe transfer ho jaye.",
      "text_hi_audio": "वो सौ पुशअप मारे, और सिक्स पैक सीधा मेरे पेट पे ट्रांसफर हो जाए।",
      "text_hi": "Woh sau pushup maare, aur six pack seedha mere pet pe transfer ho jaye.",
      "emotion": "finger_guns_pride",
      "camera": "human"
    },
    {
      "lineIndex": 3,
      "speaker": "Gemini",
      "text_en": "I can also program it to eat pizza while you feel full.",
      "text_hi_display": "Main yeh bhi code kar deti hoon ki pizza woh khaye aur pet tera bhare.",
      "text_hi_audio": "मैं यह भी कोड कर देती हूँ कि पिज़्ज़ा वो खाए और पेट तेरा भरे।",
      "text_hi": "Main yeh bhi code kar deti hoon ki pizza woh khaye aur pet tera bhare.",
      "emotion": "suspicious_squint",
      "camera": "gemini"
    },
    {
      "lineIndex": 4,
      "speaker": "Human",
      "text_en": "Wait, is that technologically feasible right now?!",
      "text_hi_display": "Ruk, kya yeh sach me technologically possible hai abhi?!",
      "text_hi_audio": "रुक, क्या यह सच में टेक्नोलॉजिकली पॉसिबल है अभी?!",
      "text_hi": "Ruk, kya yeh sach me technologically possible hai abhi?!",
      "emotion": "hands_out_why",
      "camera": "human"
    },
    {
      "lineIndex": 5,
      "speaker": "Gemini",
      "text_en": "No, buddy. That's called being clinically delusional.",
      "text_hi_display": "Nahi bhai, isse medical bhasha me sapne dekhna bolte hain.",
      "text_hi_audio": "नहीं भाई, इसे मेडिकल भाषा में सपने देखना बोलते हैं।",
      "text_hi": "Nahi bhai, isse medical bhasha me sapne dekhna bolte hain.",
      "emotion": "agent_wink",
      "camera": "wide"
    }
  ]
}
`;

  let scriptData = null;
  let attempts = 0;
  const maxAttempts = 3;
  let currentPrompt = prompt;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`   • Attempt ${attempts}/${maxAttempts} with Gemini Cluster...`);
    const res = await generateWithCluster('showrunner', {
      contents: currentPrompt,
      config: { responseMimeType: 'application/json' },
    });

    let cleanJson = (res && res.text ? res.text : '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const match = cleanJson.match(/\{[\s\S]*\}/);
    if (match) cleanJson = match[0];

    try {
      scriptData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn(`   ⚠️ JSON parse error on attempt ${attempts}:`, parseErr.message);
      continue;
    }

    if (!scriptData || !Array.isArray(scriptData.lines) || scriptData.lines.length < 4) {
      console.warn(`   ⚠️ Incomplete script lines (${scriptData?.lines?.length || 0}) on attempt ${attempts}. Retrying...`);
      continue;
    }

    if (containsSurrealHallucination(scriptData)) {
      console.warn(`   🚨 Surreal appliance/food hallucination detected on attempt ${attempts}. Requesting grounded rewrite...`);
      currentPrompt = prompt + `\n\nCRITICAL ENFORCEMENT: The previous draft had surreal nonsense (screaming appliances/talking food/morse code). REWRITE with 100% GROUNDED OBSERVATIONAL REALITY (real human habits, real coding/working overthinking, real relatable banter).`;
      continue;
    }

    // Passed basic sanity
    break;
  }

  if (!scriptData || !Array.isArray(scriptData.lines)) {
    throw new Error("Failed to generate a valid comedy script after multiple attempts.");
  }

  // Validate start/end differentiation, hook style, camera rule, and language separation
  sanitizeAndValidateScript(scriptData);

  const titleEn = scriptData.title_en || scriptData.title || "Relatable Comedy Short";
  const titleHi = scriptData.title_hi || scriptData.title || "Relatable Comedy Short";
  console.log(`✅ [AGENT 1: SHOWRUNNER] Script generated & validated:`);
  console.log(`   • EN: "${titleEn}"`);
  console.log(`   • HI: "${titleHi}" (${scriptData.lines.length} lines)`);
  return scriptData;
}

const BANNED_ENDING_PHRASES = [
  "and that's why", "and that is why", "in conclusion", "so basically",
  "and that's how", "and that is how", "to sum up", "moral of the story",
  "and that is reason"
];

function containsSurrealHallucination(scriptData) {
  if (!scriptData || !Array.isArray(scriptData.lines)) return false;
  const surrealPatterns = [
    /\b(couch|sofa|cushion|cushions|chair|bed|mattress|blanket|pillow|desk|table|lamp|fridge|refrigerator|snack|food|toast|toaster|microwave|oven|appliance|furniture|ceiling|walls?|floor|roof)\b.*?\b(called|calling|calls|whispers?|judging|judges?|firing|fires?|screaming|dancing|talking|singing|crying|boss|hr|yelling|shouting)\b/i,
    /\b(called|calling|calls|whispers?|judging|judges?|firing|fires?|screaming|yelling)\b.*?\b(couch|sofa|cushions?|furniture|cushion|ceiling|walls?|floor)\b/i,
    /\b(ceiling|walls?|couch|sofa)\b\s+(is\s+)?(screaming|whispering|talking|judging|yelling)/i,
    /\b(fridge|refrigerator)\s+(is\s+)?(pinging|screaming|dancing|talking)/i,
    /\b(snack|food|toast|toaster|microwave|oven)\s+(is\s+)?(screaming|crying|talking|dancing|singing)/i,
    /\bmorse[- ]?code/i,
    /\bslack\s+dance\b/i,
    /\b(appliances?|furniture)\s+(talking|screaming|dancing)\b/i,
    /\bcat\s+meowed\s+in\s+morse\b/i,
    /\b(ceiling\s+fan|fan)\b.*?\b(spin|spinning|flying)\b.*?\b(stress|panic)\b/i
  ];

  for (const line of scriptData.lines) {
    const combined = `${line.text_en || ''} ${line.text_hi_display || ''} ${line.text || ''}`;
    for (const pat of surrealPatterns) {
      if (pat.test(combined)) {
        return true;
      }
    }
  }
  return false;
}

function sanitizeAndValidateScript(scriptData) {
  if (!scriptData || !Array.isArray(scriptData.lines) || scriptData.lines.length < 2) return scriptData;

  const line0 = scriptData.lines[0];
  const lastLine = scriptData.lines[scriptData.lines.length - 1];
  const totalLines = scriptData.lines.length;

  // 1. Mandatory Cinematography Directing Rules:
  // - Line 0 MUST be super-tight face close-up (never wide!) for viral thumb-stopping retention
  // - Turns 1 to N-2 stay on alternating tight single shots (Human or Gemini) for facial clarity
  // - Wide shot is strictly reserved for towards the end (penultimate or final beat) where Gemini roasts and Human reacts
  for (let idx = 0; idx < totalLines; idx++) {
    const l = scriptData.lines[idx];
    const spk = (l.speaker || '').toLowerCase();
    const isHuman = spk.includes('human') || spk.includes('friend');
    if (idx === 0) {
      l.camera = isHuman ? 'human' : 'gemini';
    } else if (idx < totalLines - 2) {
      // Force tight single shots on all opening and intermediate lines
      l.camera = isHuman ? 'human' : 'gemini';
    } else {
      // Towards the end: allow Wide shot when Gemini is talking and Human is reacting in 2-shot
      if (!isHuman && (l.camera === 'wide' || idx === totalLines - 1 || idx === totalLines - 2)) {
        l.camera = 'wide';
      } else {
        l.camera = l.camera || (isHuman ? 'human' : 'gemini');
      }
    }
  }

  // 2. Validate Opening Line Hook: Must be a punchy question, mid-action reaction, or bold claim
  for (const fld of ['text_en', 'text_hi', 'text_hi_display', 'text_hi_audio', 'text']) {
    if (line0[fld] && !/[?!।]$/.test(line0[fld].trim())) {
      line0[fld] = line0[fld].trim().replace(/\.+$/, '') + '?';
    }
  }

  // Force high-energy kinetic physical hook on Line 0 to arrest thumb swipe (<1.2s)
  const passiveEmotions = ['talking', 'idle', 'chill', 'yawn_stretch', 'coffee_stare_daze'];
  if (!line0.emotion || passiveEmotions.includes(line0.emotion.toLowerCase())) {
    line0.emotion = 'double_take';
  }

  // 3. Programmatic Language Separation & Natural Addressing
  // GLOBAL ENGLISH: Strictly eliminate Hindi words that sound awkward with English TTS.
  // INDIA HINGLISH: Keep natural Hindi tech banter, but NEVER use character names (Seety, Dev, Coder).
  for (const line of scriptData.lines) {
    // A. English Sanitization
    if (line.text_en) {
      let t = line.text_en;
      // Convert Indian slang to natural conversational English equivalents
      t = t.replace(/\b(arre\s+yaar|arrey\s+yaar)\b/gi, 'come on man');
      t = t.replace(/\b(arre|arrey)\b/gi, 'look');
      t = t.replace(/\b(guru)\b/gi, 'genius');
      t = t.replace(/\b(yaar)\b/gi, 'man');
      t = t.replace(/\b(bhai|bhaiya)\b/gi, 'bro');
      t = t.replace(/\b(ustaad)\b/gi, 'chief');
      t = t.replace(/\b(kaand)\b/gi, 'disaster');
      t = t.replace(/\b(chill\s+maar)\b/gi, 'chill out');
      t = t.replace(/\b(suno)\b/gi, 'listen');
      // Strictly ban character names in dialogue
      t = t.replace(/\b(seety|the\s+dev|the\s+coder|dev|coder)\b/gi, 'buddy');
      // Punctuation and spacing cleanup
      t = t.replace(/\s*,\s*,+/g, ',').replace(/\s+/g, ' ').trim();
      line.text_en = t;
      line.text = t;
    }

    // B. Hinglish Display Sanitization (Roman Script)
    if (line.text_hi_display) {
      let th = line.text_hi_display;
      th = th.replace(/\b(seety|the\s+dev|the\s+coder|dev|coder)\b/gi, 'bhai');
      th = th.replace(/\s*,\s*,+/g, ',').replace(/\s+/g, ' ').trim();
      line.text_hi_display = th;
      line.text_hi = th;
    }

    // C. Hinglish Audio Sanitization (Devanagari Script)
    if (line.text_hi_audio) {
      let ta = line.text_hi_audio;
      ta = ta.replace(/\b(सीटी|देव|कोडर|seety|dev|coder)\b/gi, 'भाई');
      ta = ta.replace(/\s+/g, ' ').trim();
      line.text_hi_audio = ta;
    }
  }

  // Sanitize Titles and Pinned Comments
  if (scriptData.title_en) {
    scriptData.title_en = scriptData.title_en.replace(/\b(seety|dev|coder)\b/gi, 'Creator').trim();
  }
  if (scriptData.title_hi) {
    scriptData.title_hi = scriptData.title_hi.replace(/\b(seety|dev|coder)\b/gi, 'Bhai').trim();
  }
  if (scriptData.pinnedComment_en) {
    scriptData.pinnedComment_en = scriptData.pinnedComment_en
      .replace(/\b(arre\s+yaar|arrey\s+yaar)\b/gi, 'come on man')
      .replace(/\b(arre|arrey)\b/gi, 'look')
      .replace(/\b(guru)\b/gi, 'genius')
      .replace(/\b(yaar)\b/gi, 'man')
      .replace(/\b(bhai|bhaiya)\b/gi, 'bro')
      .replace(/\b(seety|dev|coder)\b/gi, 'you')
      .replace(/\s+/g, ' ').trim();
  }
  if (scriptData.pinnedComment_hi) {
    scriptData.pinnedComment_hi = scriptData.pinnedComment_hi
      .replace(/\b(seety|dev|coder)\b/gi, 'bhai')
      .replace(/\s+/g, ' ').trim();
  }

  // 4. Validate Closing Line: Never share phrasing, topic summary, or vocal cadence with Line 0
  const norm0 = (line0.text_en || line0.text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normLast = (lastLine.text_en || lastLine.text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words0 = new Set(norm0.split(/\s+/).filter(w => w.length > 3));
  const wordsLast = normLast.split(/\s+/).filter(w => w.length > 3);
  const sharedWords = wordsLast.filter(w => words0.has(w));

  const hasBannedWrapUp = BANNED_ENDING_PHRASES.some(phrase => normLast.includes(phrase));
  const isDuplicate = norm0 === normLast || (norm0.length > 15 && normLast.includes(norm0.slice(0, 15)));
  const isTopicRepeat = sharedWords.length >= 3 || (wordsLast.length > 0 && (sharedWords.length / wordsLast.length) > 0.4);

  if (hasBannedWrapUp || isDuplicate || isTopicRepeat) {
    console.log(`🚨 [VALIDATOR] Detected start/end repetition or banned wrap-up phrase in ending line.`);
    const humanTwists = [
      { en: "I'm pretty sure my heart rate just exceeded my credit score.", hi_display: "Bhai meri heart rate meri CTC se zyada fast bhaag rahi hai!", hi_audio: "भाई मेरी हार्ट रेट मेरी सीटीसी से ज़्यादा फ़ास्ट भाग रही है!", emo: "panic_head_clutch" },
      { en: "I am officially submitting my resignation to this entire simulation!", hi_display: "Main officially is puri simulation se resign kar raha hoon!", hi_audio: "मैं ऑफ़िशियली इस पूरी सिमुलेशन से रिज़ाइन कर रहा हूँ!", emo: "sad_slump" },
      { en: "I will be staring at a blank terminal for the next seven hours.", hi_display: "Ab main agle saat ghante bas blank screen ko ghoorunga.", hi_audio: "अब मैं अगले सात घंटे बस ब्लैंक स्क्रीन को घूरूँगा।", emo: "sad_slump" }
    ];
    const geminiTwists = [
      { en: "Next time, try turning your brain off and on again, buddy.", hi_display: "Agli baar apna dimaag restart karke dekhna, shayad kaam kar jaye.", hi_audio: "अगली बार अपना दिमाग रीस्टार्ट करके देखना, शायद काम कर जाए।", emo: "agent_wink" },
      { en: "I would offer sympathy, but my humor subroutines are fully loaded.", hi_display: "Sympathy deti, par mera humor subroutine abhi full speed pe hai.", hi_audio: "सिम्पथी देती, पर मेरा ह्यूमर सबरूटीन अभी फुल स्पीड पे है।", emo: "agent_suspicious_squint" },
      { en: "Don't worry, buddy, your panic attack has been logged and archived.", hi_display: "Fikar mat kar, tera panic attack officially log aur archive ho gaya hai.", hi_audio: "फ़िकर मत कर, तेरा पैनिक अटैक ऑफ़िशियली लॉग और आर्काइव हो गया है।", emo: "agent_tentacle_point" }
    ];

    const twistPool = lastLine.speaker === 'Human' ? humanTwists : geminiTwists;
    const chosen = twistPool[Math.floor(Math.random() * twistPool.length)];
    lastLine.text_en = chosen.en;
    lastLine.text_hi_display = chosen.hi_display;
    lastLine.text_hi_audio = chosen.hi_audio;
    lastLine.text_hi = chosen.hi_display;
    lastLine.text = chosen.en;
    lastLine.emotion = chosen.emo;
    console.log(`✨ [VALIDATOR] Replaced with crisp twist punchline: "${lastLine.text_en}" / "${lastLine.text_hi_display}"`);
  }

  // 5. Action & Emotion Diversity Enforcement (Zero Repetitive Panic!)
  const humanFallbacks = [
    'reading_menu_squint', 'shrug', 'head_scratch', 'double_take', 'finger_guns_pride',
    'skeptical_lean', 'chin_rest_listening', 'hands_out_why', 'coffee_sip', 'facepalm',
    'chest_puff_proud', 'arm_cross_stubborn', 'coffee_stare_daze'
  ];
  const geminiFallbacks = [
    'sassy_tilt', 'suspicious_squint', 'agent_wink', 'smug_spin', 'whisper_lean',
    'shock_pop', 'judging_orbit', 'laughing_bob', 'concerned_float', 'tentacle_point'
  ];

  const usedEmotions = new Set();
  for (let idx = 0; idx < totalLines; idx++) {
    const l = scriptData.lines[idx];
    const spk = (l.speaker || '').toLowerCase();
    const isHuman = spk.includes('human') || spk.includes('friend');
    let emo = (l.emotion || '').toLowerCase().trim();

    if (!emo || usedEmotions.has(emo) || (emo.includes('panic') && usedEmotions.has('panic_head_clutch'))) {
      const pool = isHuman ? humanFallbacks : geminiFallbacks;
      const available = pool.filter(e => !usedEmotions.has(e));
      emo = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[idx % pool.length];
      l.emotion = emo;
    }
    usedEmotions.add(emo);
  }

  return scriptData;
}

const validateScriptLoopAndHook = sanitizeAndValidateScript;

// =========================================================================
// AGENT 2: SMART DUAL-CHANNEL AUDIO SYNTHESIZER
// =========================================================================

const HINDI_DIGITS = {
  0: 'शून्य', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पांच',
  6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ', 10: 'दस',
  11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह', 15: 'पंद्रह',
  16: 'सोलह', 17: 'सत्रह', 18: 'अठारह', 19: 'उन्नीस', 20: 'बीस',
  21: 'इक्कीस', 22: 'बाईस', 23: 'तेईस', 24: 'चौबीस', 25: 'पच्चीस',
  26: 'छब्बीस', 27: 'सत्ताईस', 28: 'अट्ठाईस', 29: 'उनतीस', 30: 'तीस',
  35: 'पैंतीस', 40: 'चालीस', 45: 'पैंतालीस', 48: 'अड़तालीस', 50: 'पचास',
  60: 'साठ', 70: 'सत्तर', 80: 'अस्सी', 90: 'नब्बे', 100: 'सौ',
  404: 'चार सौ चार', 500: 'पाँच सौ', 1000: 'एक हज़ार', 100000: 'एक लाख'
};

function numToHindi(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return '';
  if (HINDI_DIGITS[n]) return HINDI_DIGITS[n];
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const rem = n % 10;
    return ((HINDI_DIGITS[tens] || tens) + ' ' + (HINDI_DIGITS[rem] || rem)).trim();
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    return `${HINDI_DIGITS[h] || h} सौ ${rem > 0 ? numToHindi(rem) : ''}`.trim();
  }
  return String(n);
}

const HINGLISH_MAP = [
  // Numbers, currencies, times
  [/(\d+)\s*%/g, (_, n) => `${numToHindi(n)} परसेंट`],
  [/\$(\d+[\d,]*)/g, (_, n) => `${numToHindi(n.replace(/,/g, ''))} डॉलर`],
  [/₹(\d+[\d,]*)/g, (_, n) => `${numToHindi(n.replace(/,/g, ''))} रुपये`],
  [/(\d+):(\d+)\s*(AM|am)/g, (_, h, m) => `${parseInt(h, 10) > 4 ? 'सुबह' : 'रात'} के ${numToHindi(h)} बजकर ${numToHindi(m)} मिनट`],
  [/(\d+)\s*(AM|am)/g, (_, h) => `${parseInt(h, 10) > 4 ? 'सुबह' : 'रात'} के ${numToHindi(h)} बजे`],
  [/(\d+)\s*(PM|pm)/g, (_, h) => `${parseInt(h, 10) < 5 ? 'दोपहर' : 'रात'} के ${numToHindi(h)} बजे`],
  [/\b2024\b/g, 'दो हज़ार चौबीस'],
  [/\b2025\b/g, 'दो हज़ार पच्चीस'],
  [/\b2026\b/g, 'दो हज़ार छब्बीस'],
  [/\b404\b/g, 'चार सौ चार'],
  // Tech loanwords
  [/\bWi-Fi\b|\bwifi\b/gi, 'वाई-फ़ाई'],
  [/\bRouter\b|\brouters\b/gi, 'राउटर'],
  [/\bServer\b|\bservers\b/gi, 'सर्वर'],
  [/\bCrash\b|\bcrashed\b|\bcrashing\b/gi, 'क्रैश'],
  [/\bBug\b|\bbugs\b/gi, 'बग'],
  [/\bCode\b|\bcoding\b/gi, 'कोड'],
  [/\bDatabase\b|\bdatabases\b/gi, 'डेटाबेस'],
  [/\bProduction\b|\bprod\b/gi, 'प्रोडक्शन'],
  [/\bCSS\b/gi, 'सीएसएस'],
  [/\bHTML\b/gi, 'एचटीएमएल'],
  [/\bJavaScript\b|\bJS\b/gi, 'जावास्क्रिप्ट'],
  [/\bPython\b/gi, 'पायथन'],
  [/\bTerminal\b/gi, 'टर्मिनल'],
  [/\bGit\b/gi, 'गिट'],
  [/\bPush\b|\bpushed\b/gi, 'पुश'],
  [/\bPull\b/gi, 'पुल'],
  [/\bCommit\b|\bcommits\b/gi, 'कमिट'],
  [/\bMerge\b/gi, 'मर्ज'],
  [/\bDeploy\b|\bdeployment\b/gi, 'डिप्लॉय'],
  [/\bClient\b|\bclients\b/gi, 'क्लाइंट'],
  [/\bPhone\b/gi, 'फ़ोन'],
  [/\bSlack\b/gi, 'स्लैक'],
  [/\bLaptop\b/gi, 'लैपटॉप'],
  [/\bCoffee\b/gi, 'कॉफ़ी'],
  [/\bChill\b/gi, 'चिल'],
  [/\bResume\b/gi, 'रिज़्यूमे'],
  [/\bLinkedIn\b/gi, 'लिंक्डइन'],
  [/\bButton\b/gi, 'बटन'],
  [/\bCenter\b/gi, 'सेंटर'],
  [/\bLine\b|\blines\b/gi, 'लाइन'],
  [/\bLanding page\b/gi, 'लैंडिंग पेज'],
  [/\bDisplay flex\b/gi, 'डिस्प्ले फ़्लेक्स'],
  [/\bVacuum\b/gi, 'वैक्यूम'],
  [/\bManager\b/gi, 'मैनेजर'],
  [/\bMeeting\b/gi, 'मीटिंग'],
  [/\bBoss\b/gi, 'बॉस'],
  [/\bOffice\b/gi, 'ऑफ़िस'],
  [/\bDeadline\b/gi, 'डेडलाइन'],
  [/\bError\b|\berrors\b/gi, 'एरर'],
  [/\bWarning\b|\bwarnings\b/gi, 'वॉर्निंग'],
  [/\bBackup\b/gi, 'बैकअप'],
  [/\bAI\b/gi, 'एआई'],
  [/\bGemini\b/gi, 'जेमिनी'],
  [/\bClaude\b/gi, 'क्लॉड'],
  [/\bBot\b|\bbots\b/gi, 'बॉट'],
  [/\bScreen\b/gi, 'स्क्रीन'],
  [/\bUpdate\b|\bupdated\b/gi, 'अपडेट'],
  [/\bDelete\b|\bdeleted\b/gi, 'डिलीट'],
  [/\bTime\b/gi, 'टाइम'],
  // Fallback Roman Hinglish vocabulary
  [/\bBhai\b/gi, 'भाई'],
  [/\bPura\b|\bpoora\b/gi, 'पूरा'],
  [/\bPuri\b|\bpoori\b/gi, 'पूरी'],
  [/\bPure\b|\bpoore\b/gi, 'पूरे'],
  [/\bHo gaya\b/gi, 'हो गया'],
  [/\bHo gayi\b/gi, 'हो गई'],
  [/\bHo gaye\b/gi, 'हो गए'],
  [/\bAur\b/gi, 'और'],
  [/\bKa\b/gi, 'का'],
  [/\bKi\b/gi, 'की'],
  [/\bKe\b/gi, 'के'],
  [/\bKo\b/gi, 'को'],
  [/\bSe\b/gi, 'से'],
  [/\bPar\b/gi, 'पर'],
  [/\bPe\b/gi, 'पे'],
  [/\bAa raha hai\b/gi, 'आ रहा है'],
  [/\bAa rahi hai\b/gi, 'आ रही है'],
  [/\bMaar\b/gi, 'मार'],
  [/\bWoh\b|\bwo\b/gi, 'वो'],
  [/\bYeh\b|\bye\b/gi, 'ये'],
  [/\bSirf\b/gi, 'सिर्फ़'],
  [/\bEk\b/gi, 'एक'],
  [/\bChoti\b|\bchhoti\b/gi, 'छोटी'],
  [/\bChota\b|\bchhota\b/gi, 'छोटा'],
  [/\bSi\b|\bsa\b|\bse\b/gi, 'सी'],
  [/\bJo\b/gi, 'जो'],
  [/\bTune\b/gi, 'तूने'],
  [/\bAbhi\b/gi, 'अभी'],
  [/\bDaali thi\b/gi, 'डाली थी'],
  [/\bDaala tha\b/gi, 'डाला था'],
  [/\bMaine\b/gi, 'मैंने'],
  [/\bToh\b|\bto\b/gi, 'तो'],
  [/\bBas\b/gi, 'बस'],
  [/\bKarna tha\b/gi, 'करना था'],
  [/\bKarni thi\b/gi, 'करनी थी'],
  [/\bTera\b/gi, 'तेरा'],
  [/\bTeri\b/gi, 'तेरी'],
  [/\bTere\b/gi, 'तेरे'],
  [/\bMera\b/gi, 'मेरा'],
  [/\bMeri\b/gi, 'मेरी'],
  [/\bMere\b/gi, 'मेरे'],
  [/\bPata nahi\b/gi, 'पता नहीं'],
  [/\bKaise\b/gi, 'कैसे'],
  [/\bKyun\b|\bkyu\b/gi, 'क्यों'],
  [/\bMein\b|\bme\b/gi, 'में'],
  [/\bUda ke\b/gi, 'उड़ा के'],
  [/\bLe gaya\b/gi, 'ले गया'],
  [/\bAb\b/gi, 'अब'],
  [/\bChupchap\b/gi, 'चुपचाप'],
  [/\bKarke\b/gi, 'करके'],
  [/\bKarne ka\b/gi, 'करने का'],
  [/\bKarne\b/gi, 'करने'],
  [/\bKiya tha\b/gi, 'किया था'],
  [/\bKiya\b/gi, 'किया'],
  [/\bAa gaya hai\b|\baa gaya\b/gi, 'आ गया है'],
  [/\bAa gayi hai\b|\baa gayi\b/gi, 'आ गई है'],
  [/\bAa gaye hain\b|\baa gaye\b/gi, 'आ गए हैं'],
  [/\bUda\b/gi, 'उड़ा'],
  [/\bHai\b/gi, 'है'],
  [/\bHain\b/gi, 'हैं'],
  [/\bTha\b/gi, 'था'],
  [/\bThi\b/gi, 'थी'],
  [/\bThe\b/gi, 'थे'],
  [/\bKya\b/gi, 'क्या'],
  [/\bHua\b/gi, 'हुआ']
];

function normalizeHindiPhonetics(text) {
  if (!text) return '';
  let res = text;
  for (const [pattern, repl] of HINGLISH_MAP) {
    if (typeof repl === 'function') {
      res = res.replace(pattern, repl);
    } else {
      res = res.replace(pattern, repl);
    }
  }
  // Convert any remaining isolated numbers
  res = res.replace(/\b(\d+)\b/g, (_, d) => numToHindi(d));

  // Remove full stops, dandas, ellipses that trigger 1.5s Edge-TTS dead silences
  res = res.replace(/\.\.\.|\.\./g, ', ');
  res = res.replace(/[\।\.!?]\s*/g, ', ');
  res = res.replace(/,\s*,+/g, ', ');
  return res.trim().replace(/^,|,$/g, '').trim();
}

async function synthesizeGeminiNeuralTTS(text, voiceName, outPath, maxRetries = 2) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const cleanText = normalizeHindiPhonetics(text);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: cleanText }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName || 'Puck',
          },
        },
      },
    },
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData) {
      const rawBuffer = Buffer.from(data.candidates[0].content.parts[0].inlineData.data, 'base64');
      const rawPcm = outPath + '.pcm';
      fs.writeFileSync(rawPcm, rawBuffer);
      // Convert 24kHz mono PCM to MP3
      execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${rawPcm}" -ar 44100 -ac 2 -c:a libmp3lame -q:a 2 "${outPath}"`, { stdio: 'ignore' });
      try { fs.unlinkSync(rawPcm); } catch (e) { }
      return true;
    } else {
      const errMsg = data.error?.message || 'Unknown Gemini TTS error';
      if (errMsg.includes('retry in') && attempt < maxRetries) {
        const m = errMsg.match(/retry in ([0-9.]+)s/);
        const waitSec = m ? parseFloat(m[1]) + 0.6 : 4.5;
        console.log(`      ⏳ [Gemini Rate Limit] Cooling down ${waitSec.toFixed(1)}s before retry...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw new Error(errMsg);
    }
  }
}

async function synthesizeDialogueAudio(scriptData, runDir, lang = 'en', engine = 'edge') {
  const isHinglish = (lang === 'hi' || lang === 'hinglish');
  const langTag = isHinglish ? 'hinglish' : 'english';
  console.log(`\n🎙️ [AGENT 2: AUDIO] Synthesizing ${langTag.toUpperCase()} audio (${isHinglish ? 'Edge-TTS hi-IN Neural (Normalized & Silence-Stripped)' : 'Kokoro-82M ONNX'})...`);

  const audioDir = path.join(runDir, `audio_${langTag}`);
  fs.mkdirSync(audioDir, { recursive: true });

  const fps = 30;
  let currentFrame = 1;
  const manifestLines = [];
  const audioConcatList = [];
  const pythonBin = 'python';
  const kokoroScript = path.join(PROJECT_ROOT, 'scripts', 'kokoro_tts.py');
  const elevenScript = path.join(PROJECT_ROOT, 'scripts', 'eleven_tts.py');

  const isEmotional = (scriptData.genre === 'heartwarming_and_emotional_relatable') ||
    (scriptData.lines && scriptData.lines.some(l => ['sad_slump', 'gentle_nudge', 'whisper_lean', 'coffee_stare_daze', 'pleading_hands', 'head_in_hands_slump'].includes((l.emotion || '').toLowerCase())));

  // Pacing calibration:
  // - Heartwarming/Emotional: 0.45s breathing pause between turns (room to feel and absorb)
  // - Snappy comedy/banter: 0.28s conversational pause between turns (crisp timing without rushing)
  const padSec = isEmotional ? 0.45 : 0.28;
  const pauseFrames = Math.round(padSec * fps);

  // Create calibrated silence pad
  const silencePad = path.join(audioDir, 'pause_pad.mp3');
  try {
    execSync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t ${padSec.toFixed(2)} -q:a 9 -acodec libmp3lame "${silencePad}"`, { stdio: 'ignore' });
  } catch (e) { }

  // FFmpeg filter: strip lead/tail silence while preserving natural acting pauses up to 0.65s (breaths, contemplative ellipses)
  const silFilter = "silenceremove=stop_periods=-1:stop_duration=0.65:stop_threshold=-40dB,silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse";

  for (let i = 0; i < scriptData.lines.length; i++) {
    const line = scriptData.lines[i];
    const isHuman = line.speaker.toLowerCase() === 'human';
    const padI = String(i).padStart(2, '0');
    const lineAudioPath = path.join(audioDir, `line_${padI}.mp3`);
    const rawLineAudio = path.join(audioDir, `raw_${padI}.mp3`);

    // Pick audio text vs display text
    const audioText = isHinglish ? (line.text_hi_audio || line.text_hi || line.text) : (line.text_en || line.text);
    const displayText = isHinglish ? (line.text_hi_display || line.text_hi || line.text) : (line.text_en || line.text);
    const sanitizedAudio = audioText.replace(/["\\]/g, '').trim();
    const sanitizedDisplay = displayText.replace(/["\\]/g, '').trim();
    console.log(`   • Line ${i} [${line.speaker}]: Audio="${sanitizedAudio.slice(0, 45)}..." | Sub="${sanitizedDisplay.slice(0, 45)}..."`);

    if (isHinglish) {
      if (engine === 'elevenlabs' && process.env.ELEVENLABS_API_KEY && fs.existsSync(elevenScript)) {
        // High-emotion human conversational Hinglish via ElevenLabs
        console.log(`     -> Using ElevenLabs Multilingual v2 for line ${i}...`);
        execSync(`python "${elevenScript}" --text "${sanitizedAudio.replace(/"/g, '\\"')}" --voice "${isHuman ? 'human' : 'gemini'}" --engine elevenlabs --out "${rawLineAudio}"`, { stdio: 'pipe' });
        execSync(`ffmpeg -y -i "${rawLineAudio}" -af "${silFilter}" -c:a libmp3lame -q:a 2 "${lineAudioPath}"`, { stdio: 'pipe' });
      } else {
        // Primary: Gemini 2.5 Flash Neural TTS (Puck for Human, Aoede for Gemini)
        // Automatic Fallback: Edge-TTS Neural
        const geminiVoice = isHuman ? 'Puck' : 'Aoede';
        let geminiSuccess = false;
        try {
          console.log(`     -> Synthesizing via Gemini Neural TTS (${geminiVoice})...`);
          await synthesizeGeminiNeuralTTS(sanitizedAudio, geminiVoice, rawLineAudio);
          geminiSuccess = true;
        } catch (geminiErr) {
          console.warn(`     ⚠️ Gemini Neural TTS failed (${geminiErr.message}). Falling back to Edge-TTS...`);
        }

        if (!geminiSuccess) {
          const voice = isHuman ? 'hi-IN-MadhurNeural' : 'hi-IN-SwaraNeural';
          const rate = isHuman ? '+14%' : '+16%'; // Snappy conversational comedic pacing (130-150 wpm)
          const pitch = '+0Hz'; // Neutral pitch
          const normalizedAudio = normalizeHindiPhonetics(sanitizedAudio);
          const edgeCmd = `edge-tts --text "${normalizedAudio.replace(/"/g, '\\"')}" --voice "${voice}" --rate="${rate}" --pitch="${pitch}" --write-media "${rawLineAudio}"`;
          execSync(edgeCmd, { stdio: 'pipe' });
        }

        // Strip leading/trailing dead air and eliminate internal pauses > 0.35s
        execSync(`ffmpeg -y -i "${rawLineAudio}" -af "${silFilter}" -c:a libmp3lame -q:a 2 "${lineAudioPath}"`, { stdio: 'pipe' });
      }
    } else {
      // High-Emotion English Synthesizer (ElevenLabs Primary for Oscar-grade acting, Kokoro fallback)
      const emotion = (line.emotion || '').toLowerCase();
      let stability = 0.32;
      let style = 0.60;

      // Dynamic emotional modulation for human-relatable acting
      if (['sad_slump', 'head_in_hands_slump', 'coffee_stare_daze', 'pleading_hands'].includes(emotion)) {
        stability = 0.28; // Lower stability = deeper vulnerability, breath, honest fatigue
        style = 0.70;     // Higher style = richer emotional resonance
      } else if (['gentle_nudge', 'whisper_lean', 'chin_rest_listening'].includes(emotion)) {
        stability = 0.38; // Steady, warm, empathetic reassurance
        style = 0.55;
      } else if (['sassy_tilt', 'smug_spin', 'agent_wink'].includes(emotion)) {
        stability = 0.30; // Sharp, playful, dry wit
        style = 0.65;
      } else if (['panic_head_clutch', 'double_take', 'table_slam_shock'].includes(emotion)) {
        stability = 0.22; // Breathless panic and urgent pacing
        style = 0.80;
      }

      let audioGenerated = false;
      if (process.env.ELEVENLABS_API_KEY && fs.existsSync(elevenScript)) {
        try {
          const eVoice = isHuman ? 'human' : 'gemini';
          console.log(`     -> [ElevenLabs Emotion Engine] Voice=${eVoice} | Emotion=${emotion} (stability=${stability}, style=${style})`);
          execSync(`"${pythonBin}" "${elevenScript}" --text "${sanitizedAudio.replace(/"/g, '\\"')}" --voice "${eVoice}" --engine elevenlabs --stability ${stability} --style ${style} --output "${rawLineAudio}"`, { stdio: 'pipe' });
          audioGenerated = true;
        } catch (eErr) {
          console.warn(`     ⚠️ ElevenLabs failed (${eErr.message}). Falling back to Kokoro...`);
        }
      }

      if (!audioGenerated) {
        // Local Kokoro-82M ONNX Fallback with emotion parameter
        const voice = isHuman ? 'am_eric' : 'af_bella';
        // Calibrated pacing: emotional moments need room to breathe
        let speed = isHuman ? 0.98 : 1.00;
        if (['sad_slump', 'coffee_stare_daze', 'gentle_nudge', 'whisper_lean', 'pleading_hands', 'head_in_hands_slump'].includes(emotion)) {
          speed = isHuman ? 0.93 : 0.95;
        }
        const kokCmd = `"${pythonBin}" "${kokoroScript}" --text "${sanitizedAudio.replace(/"/g, '\\"')}" --voice "${voice}" --speed ${speed} --emotion "${emotion}" --out "${rawLineAudio}"`;
        execSync(kokCmd, { stdio: 'pipe' });
      }

      // Strip dead silence while preserving natural acting pauses
      execSync(`ffmpeg -y -i "${rawLineAudio}" -af "${silFilter}" -c:a libmp3lame -q:a 2 "${lineAudioPath}"`, { stdio: 'pipe' });
    }

    // Measure exact audio duration via ffprobe
    const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${lineAudioPath}"`;
    const durSec = parseFloat(execSync(probeCmd, { encoding: 'utf-8' }).trim()) || 2.0;

    const lineFrames = Math.max(20, Math.round(durSec * fps));
    // pauseFrames is dynamically computed at top of synthesizeDialogueAudio based on genre/emotion

    manifestLines.push({
      lineIndex: i,
      speaker: line.speaker,
      text: sanitizedDisplay,
      text_audio: sanitizedAudio,
      text_hi_display: line.text_hi_display || sanitizedDisplay,
      text_hi_audio: line.text_hi_audio || sanitizedAudio,
      emotion: line.emotion || 'talking',
      action: line.emotion || null,
      camera: line.camera || (isHuman ? 'human' : 'gemini'),
      startFrame: currentFrame,
      endFrame: currentFrame + lineFrames,
      durationSec: durSec,
    });

    audioConcatList.push(lineAudioPath);
    if (i < scriptData.lines.length - 1) {
      if (fs.existsSync(silencePad)) {
        audioConcatList.push(silencePad);
      }
      currentFrame += lineFrames + pauseFrames;
    } else {
      currentFrame += lineFrames;
    }
  }

  // Trailing silence trimmed strictly to 0.12s for seamless auto-loop snap
  const outroSilenceSec = 0.12;
  const outroFrames = Math.max(3, Math.round(outroSilenceSec * fps));
  const totalFrames = currentFrame + outroFrames;

  // Concatenate line audios into single master dialogue track
  const concatTxt = path.join(audioDir, 'concat_list.txt');
  fs.writeFileSync(concatTxt, audioConcatList.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const rawDialogue = path.join(audioDir, 'raw_dialogue.wav');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatTxt}" -c:a pcm_s16le "${rawDialogue}"`, { stdio: 'ignore' });

  // Layered Procedural Sound Design: Ambient Music + Dynamic Micro-SFX on Cuts & Punchlines
  console.log(`   • Synthesizing procedural foley & micro-SFX on camera cuts & punchlines (${langTag})...`);
  const bgMusicPath = path.join(PROJECT_ROOT, 'public', 'ambient.mp3').replace(/\\/g, '/');
  const sfxDir = path.join(PROJECT_ROOT, 'public', 'sfx');

  // Discover hook camera profile for contextual hook SFX
  const hookProfile = scriptData.camera_hook_profile || 'crisis_low_angle';
  
  // Dynamic SFX schedule: { file, timeMs, volume, label }
  const sfxEvents = [];

  // 1. Frame 0 Hook Disruption SFX (0.0s)
  sfxEvents.push({
    file: path.join(sfxDir, 'whoosh.mp3').replace(/\\/g, '/'),
    timeMs: 0,
    volume: 0.45,
    label: 'hook_whoosh'
  });

  if (hookProfile === 'mockumentary_snap') {
    sfxEvents.push({
      file: path.join(sfxDir, 'camera_snap.mp3').replace(/\\/g, '/'),
      timeMs: 180,
      volume: 0.40,
      label: 'snap_shutter'
    });
  } else if (hookProfile === 'panic_overhead') {
    sfxEvents.push({
      file: path.join(sfxDir, 'glitch.mp3').replace(/\\/g, '/'),
      timeMs: 120,
      volume: 0.35,
      label: 'panic_glitch'
    });
  }

  // 2. Camera Cuts / Speaker Switch Micro-SFX (Pacing & Subconscious Transition)
  for (let i = 1; i < manifestLines.length; i++) {
    const line = manifestLines[i];
    const cutTimeMs = Math.round((line.startFrame / fps) * 1000);
    sfxEvents.push({
      file: path.join(sfxDir, 'pop.mp3').replace(/\\/g, '/'),
      timeMs: Math.max(0, cutTimeMs - 25),
      volume: 0.22,
      label: `cut_pop_${i}`
    });
  }

  // 3. Comedic Climax / Roast Punchline Accent
  const roastLine = manifestLines.slice(1).find(l => 
    (l.speaker.toLowerCase().includes('gemini') || l.speaker.toLowerCase().includes('popapus') || l.speaker.toLowerCase().includes('ai')) &&
    (l.emotion === 'roast' || l.emotion === 'smug' || l.emotion === 'sarcasm')
  ) || manifestLines[Math.max(1, manifestLines.length - 2)];

  if (roastLine) {
    const punchlineTimeMs = Math.round((roastLine.startFrame / fps) * 1000);
    sfxEvents.push({
      file: path.join(sfxDir, 'sub_boom.mp3').replace(/\\/g, '/'),
      timeMs: Math.max(0, punchlineTimeMs - 40),
      volume: 0.35,
      label: 'roast_boom'
    });
    sfxEvents.push({
      file: path.join(sfxDir, 'thud.mp3').replace(/\\/g, '/'),
      timeMs: punchlineTimeMs + 100,
      volume: 0.25,
      label: 'roast_thud'
    });
  }

  // 4. Seamless Loop Snap Outro Whoosh
  if (totalFrames > 30) {
    const loopTimeMs = Math.round(((totalFrames - 10) / fps) * 1000);
    sfxEvents.push({
      file: path.join(sfxDir, 'whoosh.mp3').replace(/\\/g, '/'),
      timeMs: loopTimeMs,
      volume: 0.30,
      label: 'loop_whoosh'
    });
  }

  const masterAudio = path.join(audioDir, 'master_audio.wav');
  const totalDurationSec = (totalFrames / fps).toFixed(2);

  // Build dynamic FFmpeg multi-track inputs & amix filter graph
  const inputArgs = [`-i "${rawDialogue}"`, `-stream_loop -1 -i "${bgMusicPath}"`];
  sfxEvents.forEach(e => inputArgs.push(`-i "${e.file}"`));

  const filterParts = [
    `[0:a]volume=1.20[v_clean]`,
    `[1:a]volume=0.07[bg_ducked]`
  ];
  const mixLabels = ['[v_clean]', '[bg_ducked]'];

  sfxEvents.forEach((e, idx) => {
    const inputIdx = idx + 2;
    const label = `sfx_${idx}`;
    filterParts.push(`[${inputIdx}:a]adelay=${e.timeMs}|${e.timeMs},volume=${e.volume}[${label}]`);
    mixLabels.push(`[${label}]`);
  });

  filterParts.push(`${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=first:dropout_transition=2[a_out]`);
  const filterComplex = filterParts.join(';');

  try {
    const mixCmd = `ffmpeg -y ${inputArgs.join(' ')} -filter_complex "${filterComplex}" -map "[a_out]" -t ${totalDurationSec} -c:a pcm_s16le "${masterAudio}"`;
    execSync(mixCmd, { stdio: 'ignore' });
  } catch (mixErr) {
    console.warn(`⚠️ Procedural SFX mix fallback to dialogue + ambient... (${mixErr.message})`);
    execSync(`ffmpeg -y -i "${rawDialogue}" -af "volume=1.15" -c:a pcm_s16le "${masterAudio}"`, { stdio: 'ignore' });
  }

  // Generate mobile-safe kinetic ASS Subtitles with Top Curiosity Hook Card
  const assPath = path.join(runDir, `subtitles_${langTag}.ass`);
  const hookTitle = isHinglish ? (scriptData.title_hi || scriptData.title) : (scriptData.title_en || scriptData.title);
  generateAssSubtitles(manifestLines, assPath, fps, hookTitle);

  console.log(`✅ [AGENT 2: AUDIO] Master multi-track audio ready (${langTag}): ${(totalFrames / fps).toFixed(1)}s (${totalFrames} frames)`);

  return {
    lang: langTag,
    masterAudioPath: masterAudio,
    assPath: assPath,
    totalFrames: totalFrames,
    fps: fps,
    manifestLines: manifestLines,
  };
}

// =========================================================================
// KINETIC CENTERED SUBTITLE GENERATOR (1M-10M RETENTION BENCHMARK)
// =========================================================================

function generateAssSubtitles(lines, outputPath, fps, hookTitle = null) {
  let ass = `[Script Info]
Title: Relatable Comedy Reels
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: RelatableHuman,Arial Black,78,&H00FFFFFF,&H000000FF,&H000F172A,&H80000000,-1,0,0,0,100,100,0,0,1,6.0,2.5,2,60,60,540,1
Style: RelatableGemini,Arial Black,78,&H0022C55E,&H000000FF,&H000A0E18,&H80000000,-1,0,0,0,100,100,0,0,1,6.0,2.5,2,60,60,540,1
Style: HookBadge,Arial Black,68,&H0000FFFF,&H000000FF,&H000A0E18,&H00000000,-1,0,0,0,100,100,1,0,3,14.0,0,8,40,40,230,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  function fmtTime(frames) {
    const totalSec = Math.max(0, frames / fps);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    const cs = Math.floor((totalSec % 1) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  // Top Curiosity Hook Sticker (Frame 0 Instant Pop, Zero Fade Lag for <300ms mobile read)
  if (hookTitle) {
    const cleanHook = hookTitle.replace(/[^\w\s\u0900-\u097F💀😭🤦‍♂️🔥⚡️!?-]/g, '').trim();
    const hookText = cleanHook.toUpperCase().startsWith('POV:') ? cleanHook.toUpperCase() : `POV: ${cleanHook.toUpperCase()}`;
    ass += `Dialogue: 1,0:00:00.00,0:00:02.80,HookBadge,,0,0,0,,${hookText}\n`;
  }

  for (const l of lines) {
    const isHuman = l.speaker.toLowerCase() === 'human';
    const style = isHuman ? 'RelatableHuman' : 'RelatableGemini';

    const words = l.text.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) continue;

    // Group into punchy 1-2 word kinetic bursts
    const chunks = [];
    let i = 0;
    while (i < words.length) {
      const w1 = words[i];
      const w2 = words[i + 1];
      if (w2 && (w1.length + w2.length) < 13) {
        chunks.push(`${w1} ${w2}`);
        i += 2;
      } else {
        chunks.push(w1);
        i += 1;
      }
    }

    const totalDurationFrames = Math.max(15, l.endFrame - l.startFrame);
    const framesPerChunk = totalDurationFrames / chunks.length;

    for (let c = 0; c < chunks.length; c++) {
      const chunkStart = Math.round(l.startFrame + c * framesPerChunk);
      const chunkEnd = Math.min(l.endFrame, Math.round(l.startFrame + (c + 1) * framesPerChunk));
      const startStr = fmtTime(chunkStart);
      const endStr = fmtTime(chunkEnd);
      const cleanText = chunks[c].toUpperCase();
      ass += `Dialogue: 0,${startStr},${endStr},${style},${l.speaker},0,0,0,,${cleanText}\n`;
    }
  }

  fs.writeFileSync(outputPath, ass, 'utf-8');
}

// =========================================================================
// MASTER PIPELINE
// =========================================================================

async function main() {
  const parsed = parseArgs();
  const { topic, environment, genre, slot } = await decideViralTopicAndScene(parsed.topic, parsed.environment, parsed.genre);
  const { qaOnly, scriptOnly, reuseManifest, voiceHuman, voiceAI, ttsEngine, doPublish, dryRun, lang } = parsed;

  const slug = sanitizeSlug(topic);
  const runDir = path.join(PROJECT_ROOT, 'scratch', 'relatable_episodes', slug);
  const globalOutDir = path.join(PROJECT_ROOT, 'out', 'relatable_reels', 'global_english');
  const indiaOutDir = path.join(PROJECT_ROOT, 'out', 'relatable_reels', 'india_hinglish');
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(globalOutDir, { recursive: true });
  fs.mkdirSync(indiaOutDir, { recursive: true });
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  console.log('='.repeat(70));
  console.log(`🎬 RELATABLE COMEDY MASTER ENGINE (SMART DUAL-CHANNEL ARCHITECTURE)`);
  console.log(`   • Topic: "${topic}"`);
  console.log(`   • Setting: ${environment}`);
  console.log(`   • Genre: ${genre}`);
  console.log(`   • Strategy: Dual-Channel [Global English (Kokoro) + India Hinglish (Edge-TTS)]`);
  console.log('='.repeat(70));

  let scriptData = null;
  const scriptFile = path.join(runDir, 'script.json');
  const sampleManifest = path.join(runDir, `manifest_${(lang === 'hi' || lang === 'hinglish') ? 'hi' : 'en'}.json`);
  if (reuseManifest && fs.existsSync(sampleManifest)) {
    console.log(`♻️ Reusing existing episode assets from ${runDir}`);
  } else if (fs.existsSync(scriptFile)) {
    console.log(`📄 Found pre-approved script in ${scriptFile}. Loading exact script...`);
    scriptData = JSON.parse(fs.readFileSync(scriptFile, 'utf-8'));
  } else {
    // 1. Generate Dual-Channel Viral Script via Gemini 2.5 Flash
    scriptData = await generateRelatableScript(topic, environment, genre);
    fs.writeFileSync(scriptFile, JSON.stringify(scriptData, null, 2), 'utf-8');
  }

  if (scriptOnly) {
    console.log(`\n📄 [SCRIPT-ONLY MODE] Generation complete. Skipping Blender 3D render & video pipeline.`);
    console.log(`\n=======================================================`);
    console.log(`TITLE EN: ${scriptData.title_en || scriptData.title}`);
    console.log(`TITLE HI: ${scriptData.title_hi || scriptData.title}`);
    console.log(`PREMISE:  ${scriptData.premise || ''}`);
    console.log(`TOTAL LINES: ${scriptData.lines.length}`);
    console.log(`=======================================================`);
    scriptData.lines.forEach((l, idx) => {
      console.log(`[Line ${idx}] (${l.speaker}) [Camera: ${l.camera}] [Emotion: ${l.emotion}]`);
      console.log(`  EN: "${l.text_en}"`);
      console.log(`  HI: "${l.text_hi_display}"`);
      console.log(`  HI_AUDIO: "${l.text_hi_audio}"`);
    });
    return scriptData;
  }
  const directorScript = path.join(PROJECT_ROOT, 'blender_engine', 'scripts', 'relatable_comedy_director.py');

  const channelsToRun = (lang === 'all') ? ['en', 'hi'] : [lang];
  const renderedVideos = {};

  for (const ch of channelsToRun) {
    const isHinglish = (ch === 'hi' || ch === 'hinglish');
    const chTag = isHinglish ? 'hi' : 'en';
    const chName = isHinglish ? 'India Hinglish (Instagram/FB)' : 'Global English (YouTube/X)';
    console.log(`\n----------------------------------------------------------------------`);
    console.log(`🚀 PROCESSING CHANNEL: ${chName}`);
    console.log(`----------------------------------------------------------------------`);

    const manifestPath = path.join(runDir, `manifest_${chTag}.json`);
    let audioData;
    let chManifest;

    if (reuseManifest && fs.existsSync(manifestPath)) {
      console.log(`♻️ Reusing existing channel manifest & audio for ${chTag}...`);
      chManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const langTag = isHinglish ? 'hinglish' : 'english';
      const audioDir = path.join(runDir, `audio_${langTag}`);
      const masterAudioPath = path.join(audioDir, 'master_audio.wav');
      const assPath = path.join(runDir, `subtitles_${langTag}.ass`);
      // Re-generate kinetic subtitles with top curiosity hook badge in case of template updates
      generateAssSubtitles(chManifest.lines, assPath, chManifest.fps || 30, chManifest.title);
      audioData = {
        lang: langTag,
        totalFrames: chManifest.totalFrames,
        fps: chManifest.fps || 30,
        masterAudioPath,
        assPath,
        manifestLines: chManifest.lines
      };
    } else {
      // Synthesize Audio with selected engine and Devanagari phonetic normalizer
      audioData = await synthesizeDialogueAudio(scriptData, runDir, chTag, ttsEngine);

      // Assemble Channel Manifest
      const stageRecipe = WEEKEND_STAGE_RECIPES[environment] || null;
      chManifest = {
        title: isHinglish ? (scriptData.title_hi || scriptData.title) : (scriptData.title_en || scriptData.title),
        premise: scriptData.premise,
        pinnedComment: isHinglish ? (scriptData.pinnedComment_hi || scriptData.pinnedComment) : (scriptData.pinnedComment_en || scriptData.pinnedComment),
        environment: environment,
        stage_recipe: stageRecipe,
        slot: slot,
        fps: audioData.fps,
        totalFrames: audioData.totalFrames,
        lines: audioData.manifestLines,
      };
      fs.writeFileSync(manifestPath, JSON.stringify(chManifest, null, 2), 'utf-8');
      console.log(`📁 Manifest written: ${manifestPath}`);
    }

    // QA Mode
    if (qaOnly) {
      console.log(`\n📸 Generating QA Verification Stills for ${chTag}...`);
      const qaPrefix = path.join(runDir, `qa_${chTag}_`);
      const bCmd = `& "${BLENDER_BIN}" -b -P "${directorScript}" -- --manifest "${manifestPath}" --qa-stills --output "${qaPrefix}"`;
      const bRes = spawnSync('powershell.exe', ['-Command', bCmd], { stdio: 'inherit' });
      if (bRes.status !== 0) throw new Error(`Blender QA stills failed with code ${bRes.status}`);
      continue;
    }

    // Render 3D Frames
    const framesDir = path.join(runDir, `frames_${chTag}`);
    fs.mkdirSync(framesDir, { recursive: true });
    console.log(`\n🎬 Launching Blender EEVEE Next Frame Render (${chManifest.totalFrames} frames)...`);
    const renderOutputPattern = path.join(framesDir, 'frame_');
    const bCmd = `& "${BLENDER_BIN}" -b -P "${directorScript}" -- --manifest "${manifestPath}" --frames --output "${renderOutputPattern}"`;
    const t0 = Date.now();
    const bRes = spawnSync('powershell.exe', ['-Command', bCmd], { stdio: 'inherit' });
    if (bRes.status !== 0) throw new Error(`Blender render failed with code ${bRes.status}`);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✅ Blender 3D Frame Render Complete for ${chTag} in ${elapsed}s!`);

    // Hardware Muxing with NVENC & ASS Subtitles
    console.log(`\n🎞️ Muxing ${chTag} video with mobile-safe centered ASS subtitles...`);
    const targetDir = isHinglish ? indiaOutDir : globalOutDir;
    const finalVideo = path.join(targetDir, `${slug}_${chTag}.mp4`);

    const frameFiles = fs.readdirSync(framesDir).filter(f => f.startsWith('frame_') && f.endsWith('.jpg'));
    if (frameFiles.length === 0) {
      throw new Error(`No rendered frames found in ${framesDir}`);
    }
    const sampleFrame = frameFiles[0];
    const numDigits = sampleFrame.match(/\d+/)?.[0]?.length || 5;
    const framePattern = `frame_%0${numDigits}d.jpg`;

    const relFrames = path.relative(PROJECT_ROOT, path.join(framesDir, framePattern)).replace(/\\/g, '/');
    const relAudio = path.relative(PROJECT_ROOT, audioData.masterAudioPath).replace(/\\/g, '/');
    const relAss = path.relative(PROJECT_ROOT, audioData.assPath).replace(/\\/g, '/').replace(/:/g, '\\:');

    const muxDur = (audioData.totalFrames / 30).toFixed(3);
    const muxCmd = `ffmpeg -y -framerate 30 -i "${relFrames}" -i "${relAudio}" -t ${muxDur} -vf "ass='${relAss}'" -c:v h264_nvenc -preset p5 -b:v 8M -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
    try {
      execSync(muxCmd, { stdio: 'inherit' });
    } catch (err) {
      console.warn(`⚠️ NVENC fallback to CPU...`);
      const cpuMux = `ffmpeg -y -framerate 30 -i "${relFrames}" -i "${relAudio}" -t ${muxDur} -vf "ass='${relAss}'" -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p "${finalVideo}"`;
      execSync(cpuMux, { stdio: 'inherit' });
    }

    // Copy to Artifact Directory for User (safe copy with directory assertion)
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    const artVideo = path.join(ARTIFACT_DIR, `${slug}_${chTag}.mp4`);
    try {
      fs.copyFileSync(finalVideo, artVideo);
    } catch (artErr) {
      console.warn(`⚠️ Warning: Could not copy video to artifact directory:`, artErr.message);
    }
    renderedVideos[chTag] = { finalVideo, artVideo, manifest: chManifest };

    // Extract Proof Stills across dialogue turns
    const proofDir = path.join(runDir, `proofs_${chTag}`);
    fs.mkdirSync(proofDir, { recursive: true });
    for (let i = 0; i < chManifest.lines.length; i++) {
      const padI = String(i).padStart(2, '0');
      const line = chManifest.lines[i];
      const sec = ((line.startFrame + line.endFrame) / 2 / chManifest.fps).toFixed(2);
      const proofFile = path.join(proofDir, `turn_${padI}_${line.speaker}_${chTag}.jpg`);
      try {
        execSync(`ffmpeg -y -ss ${sec} -i "${finalVideo}" -vframes 1 -q:v 2 "${proofFile}"`, { stdio: 'ignore' });
        const artStill = path.join(ARTIFACT_DIR, `${slug}_turn_${padI}_${line.speaker}_${chTag}.jpg`);
        fs.copyFileSync(proofFile, artStill);
      } catch (e) { }
    }

    const stat = fs.statSync(finalVideo);
    console.log(`✅ ${chName} Master MP4 Ready: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  }

  if (qaOnly) return;

  console.log('\n' + '='.repeat(70));
  console.log(`🎉 SMART DUAL-CHANNEL GENERATION COMPLETE!`);
  for (const [ch, info] of Object.entries(renderedVideos)) {
    const isHinglish = (ch === 'hi');
    const label = isHinglish ? '🇮🇳 India Hinglish (Instagram/FB)' : '🌐 Global English (YouTube/X)';
    console.log(`   • ${label}:`);
    console.log(`     - Title: "${info.manifest.title}"`);
    console.log(`     - File: [${path.basename(info.finalVideo)}](file:///${info.finalVideo.replace(/\\/g, '/')})`);
    console.log(`     - Artifact: [${path.basename(info.artVideo)}](file:///${info.artVideo.replace(/\\/g, '/')})`);
  }
  console.log('='.repeat(70));

  // Multi-Platform Autonomous Publication
  if (doPublish) {
    if (renderedVideos['en'] && !renderedVideos['hi']) {
      console.log(`\n🚀 Publishing 100% Native English Master to YouTube, Instagram & Facebook...`);
      const enPubCmd = `node scripts/publish_phase2.js --video "${renderedVideos['en'].finalVideo}" --manifest "${path.join(runDir, 'manifest_en.json')}" --platforms youtube,instagram,facebook${dryRun ? ' --dry-run' : ''}`;
      execSync(enPubCmd, { stdio: 'inherit', cwd: PROJECT_ROOT });
    } else {
      if (renderedVideos['en']) {
        console.log(`\n🚀 Publishing Global English Short to YouTube ("I am AI but I am a good guy")...`);
        const enPubCmd = `node scripts/publish_phase2.js --video "${renderedVideos['en'].finalVideo}" --manifest "${path.join(runDir, 'manifest_en.json')}" --platforms youtube${dryRun ? ' --dry-run' : ''}`;
        execSync(enPubCmd, { stdio: 'inherit', cwd: PROJECT_ROOT });
      }
      if (renderedVideos['hi']) {
        console.log(`\n🚀 Publishing India Hinglish Reel to Instagram & Facebook ("@the.goodguy.ai")...`);
        const hiPubCmd = `node scripts/publish_phase2.js --video "${renderedVideos['hi'].finalVideo}" --manifest "${path.join(runDir, 'manifest_hi.json')}" --platforms instagram,facebook${dryRun ? ' --dry-run' : ''}`;
        execSync(hiPubCmd, { stdio: 'inherit', cwd: PROJECT_ROOT });
      }
    }

    // Automatic Telegram Dispatch for X (Twitter)
    if (renderedVideos['en']) {
      try {
        console.log(`\n📨 Dispatching X (Twitter) video & copy package to Telegram...`);
        await sendXPackageToTelegram(renderedVideos['en'].finalVideo, path.join(runDir, 'manifest_en.json'));
      } catch (tgErr) {
        console.warn(`⚠️ Telegram X dispatch notice:`, tgErr.message);
      }
    }
  }

  // Record to persistent anti-repeat history buffer
  recordHistoryEntry({
    slug,
    topic,
    genre,
    title_en: scriptData?.title_en || scriptData?.title || renderedVideos['en']?.manifest?.title || slug,
    title_hi: scriptData?.title_hi || scriptData?.title || renderedVideos['hi']?.manifest?.title || slug,
    environment,
  });
  console.log(`📜 [HISTORY] Recorded episode to anti-repeat buffer (${environment} | ${genre}).`);
}

if (process.argv[1] && process.argv[1].includes('run_relatable_autonomous.js')) {
  main().catch(err => {
    console.error('\n❌ Relatable comedy runner failed:', err);
    process.exit(1);
  });
}

export {
  generateRelatableScript,
  sanitizeAndValidateScript,
  decideViralTopicAndScene,
  containsSurrealHallucination,
  EXPANDED_GENRE_MATRIX
};
