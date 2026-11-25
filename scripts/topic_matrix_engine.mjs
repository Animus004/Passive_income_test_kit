/**
 * ==============================================================================
 * 1,100+ Combinatorial Topic Genome & Anti-Duplicate Engine
 * ==============================================================================
 * Generates historically & thematically coherent topic seeds across all 16
 * Indian Legends and 6 Modern Bharat Everyday Characters, enforces 3-gram
 * Jaccard anti-duplication against SQLite `factory.db`, and supports dynamic
 * analytics-weighted topic selection + live news remixing.
 */

import {
  getFactoryDb,
  normalizeTopicKey,
  computeWordNGrams,
  jaccardSimilarity,
} from './factory_db.mjs';
import { generateWithCluster } from './gemini_cluster.js';
import { scrapeTrendingTopics } from './trend_scraper.js';

const DOMAIN_PACKS = [
  {
    pillar: 'mahabharata_strategy',
    era: 'ancient',
    mood: 'epic',
    actors: [
      { p: 'krishna', s: 'arjuna', label: 'Krishna & Arjuna' },
      { p: 'krishna', s: 'karna', label: 'Krishna & Karna' },
      { p: 'krishna', s: 'duryodhana', label: 'Krishna & Duryodhana' },
      { p: 'krishna', s: 'bhishma', label: 'Krishna & Bhishma' },
      { p: 'shakuni', s: 'duryodhana', label: 'Shakuni & Duryodhana' },
      { p: 'karna', s: 'arjuna', label: 'Karna vs Arjuna' },
      { p: 'bhishma', s: 'duryodhana', label: 'Bhishma & Duryodhana' },
      { p: 'bhishma', s: 'karna', label: 'Bhishma & Karna' },
    ],
    subjects: [
      'Indraprastha Maya Sabha psychological shock',
      'Shanti Doot peace envoy gambit in Hastinapur',
      'Chakravyuh asymmetric war formation trap',
      '14th night Jayadratha sunset illusion',
      'Bhishma Pratigya rigid vow vs adaptable Dharma',
      'Karna Kavach-Kundal irreversible charity sacrifice',
      'Chaupar rigged dice game economics and debt leverage',
      'Narayani Sena army vs unarmed charioteer choice',
      'Duryodhana zero-sum ego refusal of 5 villages',
      'Ashwatthama half-truth communication turning point',
      'Ghatotkacha midnight sacrifice preserving Arjuna against Shakti',
      'Bhagavad Gita decision clarity under extreme anxiety',
      'Parashurama curse and forgotten mantra under stress',
      'Susharma distraction ambush away from core mission',
      'Ekachakra vs Indraprastha alliance building',
      'Karna wheel sunken karma audit in final duel',
      'Vidura intelligence network inside enemy court',
      'Sudarshan Chakra deterrent as supreme last resort',
      'Barbarika three-arrow power scaling paradox',
      'Gandhari blindfold unintended power vacuum',
      'Drona guru-dakshina monopoly vs Ekalavya skill disruption',
      'Yudhishthira truth credibility weighted like asymmetric leverage',
      'Kurukshetra psychological morale collapse before Day 1',
      'Sanjaya real-time battlefield telemetry mindset',
    ],
  },
  {
    pillar: 'ramayana_puranas',
    era: 'ancient',
    mood: 'mystery',
    actors: [
      { p: 'rama', s: 'hanuman', label: 'Shri Rama & Hanuman' },
      { p: 'rama', s: 'ravana', label: 'Shri Rama vs Ravana' },
      { p: 'hanuman', s: 'ravana', label: 'Hanuman in Lanka Court' },
      { p: 'shiva', s: 'ravana', label: 'Mahadev Shiva & Ravana' },
      { p: 'shiva', s: null, label: 'Mahadev Shiva' },
      { p: 'hanuman', s: null, label: 'Veer Hanuman' },
      { p: 'rama', s: null, label: 'Shri Rama' },
    ],
    subjects: [
      'Lanka burning reconnaissance before formal war',
      'Ravana mastery of 64 arts ruined by selective arrogance',
      'Vibhishana inside intelligence tipping balance of Lanka',
      'Hanuman forgetting then rediscovering latent power at Kishkindha',
      'Rama Setu ocean negotiation before engineering miracle',
      'Shiva Tandava precision destruction of stagnation',
      'Neelkanth consuming poison instead of reacting rashly',
      'Lakshman Rekha boundary enforcement principle',
      'Sanjeevani mountain execution without hesitation',
      'Kumbhakarna brutal truth to Ravana before dying loyally',
      'Shiva Chandrashekhara calm third-eye focus under chaos',
      'Pinaka bow test measuring effortless mastery',
      'Vanvas 14-year strategic coalition across forests',
      'Nala-Nila floating bridge structural patience',
      'Ravana golden city illusion vs fragile morale',
      'Indrajit invisibility asymmetric tactics countered',
      'Hanuman ring verification zero-trust protocol',
      'Agastya Aditya Hridayam peak mental reset on battlefield',
    ],
  },
  {
    pillar: 'chanakya_statecraft',
    era: 'ancient',
    mood: 'strategy',
    actors: [
      { p: 'chanakya', s: 'ashoka', label: 'Chanakya & Mauryan Crown' },
      { p: 'chanakya', s: 'shakuni', label: 'Chanakya vs Shakuni Doctrine' },
      { p: 'chanakya', s: null, label: 'Acharya Chanakya' },
      { p: 'ashoka', s: null, label: 'Samrat Ashoka' },
    ],
    subjects: [
      'Machiavelli vs Arthashastra intelligence and tax architecture',
      'Never reveal your financial base or future pivot to allies',
      'Vyayam-Visha-Kanya covert neutralization without open battle',
      'Chanakya two-lamp austerity rule separating personal vs state budget',
      'How to audit sycophants who praise every flawed idea',
      'Seven limbs of Saptanga state stability',
      'Mudrarakshasa turning enemy minister into loyal asset',
      'Four-tier Sama-Dana-Bheda-Danda negotiation escalation',
      'Why sudden wealth destroys undisciplined rulers in 3 years',
      'Kalinga shock transformation from conquest to soft-power Dhamma',
      'Ashoka rock edicts ancient mass communication broadcast system',
      'Single-rupee state treasury leak zero-tolerance rule',
      'Silent ally mapping inside hostile coalitions',
      'Testing subordinate loyalty under manufactured crisis',
      'Never strike back without calculating exit cost',
      'Pataliputra guild banking and trade route taxation',
      'Enemy friend paradox in corporate boardrooms',
      'Time-horizon patience beating loud aggressive rivals',
    ],
  },
  {
    pillar: 'maratha_rajputana_freedom',
    era: 'ancient',
    mood: 'epic',
    actors: [
      { p: 'shivaji', s: null, label: 'Chhatrapati Shivaji Maharaj' },
      { p: 'maharana_pratap', s: null, label: 'Maharana Pratap' },
      { p: 'lakshmibai', s: null, label: 'Rani Lakshmibai' },
      { p: 'vivekananda', s: null, label: 'Swami Vivekananda' },
      { p: 'shivaji', s: 'chanakya', label: 'Shivaji Strategy & Chanakya Niti' },
    ],
    subjects: [
      'Agra escape fruit basket deception outsmarting imperial surveillance',
      'Ganimi Kava mountain guerilla geometry 300 vs 10000 forces',
      'First Indian naval doctrine Konkan sea forts Sindhudurg',
      'Ashta Pradhan structured cabinet and zero hereditary jagirdari',
      'Haldighati 81 kg Bhala spear and strategic withdrawal logistics',
      'Bhamashah wealth mobilization rescuing Mewar war treasury',
      'Rani Lakshmibai midnight leap from Jhansi Fort parapet',
      'Kalpi Gwalior twin-talwar rear-guard cavalry command',
      'Swami Vivekananda Chicago 1893 opening words rewriting world perception',
      'Focused brahmacharya memory retention anecdote in Europe libraries',
      'Rajmudra Sanskrit seal declaring sovereign welfare vision',
      'Panhala to Vishalgad sacrifice at Pavankhind pass',
      'Bahirji Naik master spy disguise network ahead of armies',
      'Shaista Khan Lal Mahal midnight surgical strike',
      'Rajputana scorched-earth supply denial wearing down invaders',
      'Arise Awake discipline turning self-doubt into iron focus',
    ],
  },
  {
    pillar: 'modern_bharat_wealth_work',
    era: 'modern',
    mood: 'modern',
    actors: [
      { p: 'it_engineer', s: 'toxic_boss', label: 'IT Engineer & Toxic Boss' },
      { p: 'middle_class_uncle', s: 'modern_commoner', label: 'Middle Class Uncle & Youth' },
      { p: 'modern_creator', s: 'genz_student', label: 'Creator & GenZ Student' },
      { p: 'it_engineer', s: null, label: 'IT Engineer' },
      { p: 'middle_class_uncle', s: null, label: 'Middle Class Uncle' },
      { p: 'genz_student', s: null, label: 'GenZ Student' },
      { p: 'modern_creator', s: null, label: 'Modern Creator' },
    ],
    subjects: [
      'Salary hitting bank on 1st and disappearing by 5th via silent EMIs',
      'No-Cost EMI hidden processing fee & GST compounding illusion',
      'Quick 2-minute Friday 5:45 PM manager call hijack',
      'Upgrading phone every 12 months costing 1.4 crore retirement gap',
      'Cutting chai vs lifestyle inflation silent middle class leak',
      'Credit card minimum due 42 percent annual compounding trap',
      'Open offer counter-offer retention trap ending in silent layoff',
      '2 AM doomscrolling dopamine hangover ruining morning deep work',
      'Peer pressure wedding and car loan status game in Tier-1 cities',
      'Revenge bedtime procrastination stealing 2 hours of health',
      'Endless meetings disguising zero real output in tech teams',
      'Buying depreciating liabilities to impress coworkers you dislike',
      'Fake startup hustle culture burning health before equity vests',
      'Instant delivery convenience fee costing 45000 rupees a year',
      'Emergency fund zero mistake forcing personal loan panic',
      'Comparing CTC in hand vs inflated stock options math',
      'AI replacing copy-paste skill vs leveraging AI 10x faster',
      'Subscription creep invisible auto-debits every month',
    ],
  },
];

const NARRATIVE_ANGLES = [
  { key: 'untold_strategy', promptFrame: 'Untold psychological & strategic mechanics behind' },
  { key: 'fatal_flaw', promptFrame: 'One fatal mistake or blind spot inside' },
  { key: 'three_rules', promptFrame: '3 brutal survival rules hidden inside' },
  { key: 'what_if_flip', promptFrame: 'What if one single decision flipped during' },
  { key: 'modern_2026_lesson', promptFrame: 'How modern Indians unknowingly fall into the trap of' },
  { key: 'secret_tactic', promptFrame: 'Masterclass covert game-theory breakdown of' },
  { key: 'myth_vs_reality', promptFrame: 'Common myth vs hard strategic truth about' },
];

/**
 * Generates & inserts 1,100+ structured unique topic rows into SQLite `topics` (idempotent).
 */
export function ensureTopicMatrixSeeded() {
  const db = getFactoryDb();
  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM topics WHERE source = 'matrix'").get();
  if ((countRow?.cnt || 0) >= 950) {
    return countRow.cnt;
  }

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO topics
      (topic_key, topic_text, pillar, era, primary_role, secondary_role, angle, preferred_mood, priority_score, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'matrix')
  `);

  db.exec('BEGIN;');
  try {
    for (const pack of DOMAIN_PACKS) {
      for (const actorPair of pack.actors) {
        for (const subject of pack.subjects) {
          for (const angle of NARRATIVE_ANGLES) {
            const topicText =
              actorPair.s
                ? `${actorPair.label} — ${angle.promptFrame}: ${subject}`
                : `${actorPair.label}: ${angle.promptFrame} ${subject}`;
            const topicKey = normalizeTopicKey(`${pack.pillar}|${actorPair.p}|${actorPair.s || ''}|${angle.key}|${subject}`);
            insertStmt.run(
              topicKey,
              topicText,
              pack.pillar,
              pack.era,
              actorPair.p,
              actorPair.s || null,
              angle.key,
              pack.mood,
              1.0
            );
          }
        }
      }
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  const afterRow = db.prepare('SELECT COUNT(*) as cnt FROM topics').get();
  return afterRow?.cnt || 0;
}

/**
 * Selects the highest-priority unused (or least-recently-used) topic that passes
 * the 3-gram Jaccard anti-repetition filter against the last 120 rendered/queued jobs.
 */
export function pickNextUniqueTopic({ slot = 'morning', forceEra = null } = {}) {
  const db = getFactoryDb();
  ensureTopicMatrixSeeded();

  // Slot rhythm affinity (morning -> modern money/strategy, afternoon -> history/chanakya, evening/night -> epics/mystery)
  const slotEraAffinity =
    forceEra ||
    (slot === 'morning' ? null : slot === 'afternoon' ? 'ancient' : 'ancient');

  const recentJobs = db
    .prepare('SELECT topic_text FROM jobs ORDER BY created_at DESC LIMIT 120')
    .all()
    .map((r) => computeWordNGrams(r.topic_text, 3));

  const query = slotEraAffinity
    ? `SELECT * FROM topics WHERE era = ? ORDER BY used_count ASC, priority_score DESC, RANDOM() LIMIT 60`
    : `SELECT * FROM topics ORDER BY used_count ASC, priority_score DESC, RANDOM() LIMIT 60`;

  const candidates = slotEraAffinity ? db.prepare(query).all(slotEraAffinity) : db.prepare(query).all();

  for (const cand of candidates) {
    const candGrams = computeWordNGrams(cand.topic_text, 3);
    const tooClose = recentJobs.some((histGrams) => jaccardSimilarity(candGrams, histGrams) >= 0.42);
    if (!tooClose) {
      return cand;
    }
  }

  // Fallback to unused candidate if similarity filter was strict
  if (candidates.length > 0) return candidates[0];
  throw new Error('Topic matrix empty.');
}

/**
 * Dynamically expands the topic DB with fresh live news remixes via trend_scraper + LLM.
 */
export async function synthesizeTrendRemixedTopic() {
  const db = getFactoryDb();
  const trends = await scrapeTrendingTopics();
  const headlines = [
    ...(trends.hackerNews || []).slice(0, 4).map((t) => t.title),
    ...(trends.breakingNews || []).slice(0, 4).map((t) => t.title),
  ];
  if (headlines.length === 0) return null;

  const recent = db
    .prepare('SELECT topic_text FROM topics WHERE used_count > 0 ORDER BY last_used_at DESC LIMIT 25')
    .all()
    .map((r) => r.topic_text);

  const prompt = `Convert one of these trending headlines into a viral Hindi explainer topic combining either Chanakya/Krishna strategic wisdom OR Modern Bharat IT/Money reality.
Headlines: ${JSON.stringify(headlines)}
Avoid resembling: ${JSON.stringify(recent)}
Return strictly JSON: {"topic_text": "...", "era": "ancient"|"modern", "primary_role": "chanakya"|"krishna"|"it_engineer"|"modern_creator", "pillar": "trend_remix"}`;

  try {
    const res = await generateWithCluster('showrunner', {
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(res.text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    if (parsed.topic_text && parsed.topic_text.length > 15) {
      const key = normalizeTopicKey(parsed.topic_text);
      const info = db
        .prepare(
          `INSERT OR IGNORE INTO topics
           (topic_key, topic_text, pillar, era, primary_role, angle, preferred_mood, priority_score, source)
           VALUES (?, ?, ?, ?, ?, 'trend_remix', ?, 1.4, 'live_trend')`
        )
        .run(
          key,
          parsed.topic_text,
          parsed.pillar || 'trend_remix',
          parsed.era === 'modern' ? 'modern' : 'ancient',
          parsed.primary_role || 'chanakya',
          parsed.era === 'modern' ? 'modern' : 'strategy'
        );
      if (info.changes > 0) {
        return db.prepare('SELECT * FROM topics WHERE topic_key = ?').get(key);
      }
    }
  } catch (_) {}
  return null;
}

if (process.argv[1] && process.argv[1].endsWith('topic_matrix_engine.mjs')) {
  const total = ensureTopicMatrixSeeded();
  const sample = pickNextUniqueTopic({ slot: 'afternoon' });
  console.log(`✅ Topic Matrix seeded: ${total} unique structured topics in SQLite.`);
  console.log(`🎯 Next picked sample:`, {
    id: sample.id,
    pillar: sample.pillar,
    era: sample.era,
    roles: `${sample.primary_role}${sample.secondary_role ? ' + ' + sample.secondary_role : ''}`,
    topic: sample.topic_text,
  });
}
