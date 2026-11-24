/**
 * Autonomous Multi-Source Viral Hypothetical Scraper & Mining Engine
 * 
 * Sources:
 * 1. Reddit r/hypotheticalsituation (Top & Hot)
 * 2. Reddit r/AskReddit (Curated "What if" & "Every human" searches)
 * 3. YouTube Suggest API (Live trending search autocompletes)
 * 4. Google Suggest API
 * 
 * Scoring & Filtering:
 * Evaluates candidate scenarios across Curiosity, Visual Potential, Escalation Velocity, and Relatability.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCRAPED_CACHE_PATH = path.join(PROJECT_ROOT, 'data', 'scraped_hypotheticals.json');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * 1. Scrapes Reddit r/hypotheticalsituation
 */
async function scrapeRedditHypotheticals() {
  const results = [];
  try {
    const urls = [
      'https://www.reddit.com/r/hypotheticalsituation/top.json?t=month&limit=25',
      'https://www.reddit.com/r/hypotheticalsituation/hot.json?limit=25',
    ];

    for (const url of urls) {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;
      const data = await res.json();
      const posts = data?.data?.children || [];

      for (const p of posts) {
        const d = p.data;
        if (!d || d.over_18 || d.score < 150) continue;

        // Clean title
        const cleanTitle = d.title.trim().replace(/^\[.*?\]\s*/, '');
        if (cleanTitle.length < 15 || cleanTitle.length > 250) continue;

        results.push({
          source: 'r/hypotheticalsituation',
          title: cleanTitle,
          score: d.score,
          numComments: d.num_comments,
          url: `https://reddit.com${d.permalink}`,
          selftext: d.selftext ? d.selftext.slice(0, 300) : '',
        });
      }
    }
  } catch (e) {
    console.warn(`Reddit hypothetical scrape notice: ${e.message}`);
  }
  return results;
}

/**
 * 2. Scrapes YouTube Search Suggest Autocomplete API
 */
async function scrapeYouTubeSuggestions() {
  const results = [];
  const seedQueries = [
    'what if everyone',
    'what if the world',
    'what if all humans',
    'what if the internet',
    'what if oxygen',
    'what if gravity',
    'what if nobody',
  ];

  for (const q of seedQueries) {
    try {
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;
      const data = await res.json();
      const suggestions = data[1] || [];

      for (const s of suggestions) {
        if (s.toLowerCase().startsWith('what if') && s.length > 15) {
          results.push({
            source: 'YouTubeSuggest',
            title: s.charAt(0).toUpperCase() + s.slice(1) + '?',
            score: 500, // Normalized high search-intent baseline
            numComments: 0,
            url: `https://youtube.com/results?search_query=${encodeURIComponent(s)}`,
          });
        }
      }
    } catch (e) {
      console.warn(`YouTube suggest notice for "${q}": ${e.message}`);
    }
  }
  return results;
}

/**
 * Heuristic Viral Potential Evaluator
 */
function scoreHypothetical(item) {
  let score = 50;
  const title = item.title.toLowerCase();

  // 1. Curiosity & High-Stakes Triggers
  if (/everyone|every single|all humans|world|earth|global|humanity/.test(title)) score += 18;
  if (/midnight|72 hours|24 hours|suddenly|instantly|forever|7 days|5 minutes/.test(title)) score += 16;
  if (/money|dollar|rich|poor|bank|deposit|gold|worthless|quit/.test(title)) score += 14;
  if (/internet|wifi|phone|electricity|power|screens|gps/.test(title)) score += 15;
  if (/sleep|die|stop|freeze|disappear|vanish|deleted/.test(title)) score += 12;

  // 2. Reddit Community Engagement Factor
  if (item.score > 500) score += 10;
  if (item.score > 1500) score += 15;
  if (item.numComments > 100) score += 8;

  // Deductions for overcomplicated or low-visual premises
  if (title.length > 180) score -= 15;
  if (/dating|ex-|girlfriend|boyfriend|lottery ticket|taxes/.test(title)) score -= 20;

  return Math.min(100, Math.max(10, score));
}

/**
 * Main Scraper & Scorer Orchestrator
 */
export async function scrapeAndRankHypotheticals() {
  console.log('\n===============================================================');
  console.log('🔍 VIRAL HYPOTHETICAL MINING ENGINE (Reddit + YouTube Suggest)');
  console.log('===============================================================\n');

  console.log('📡 Ingesting from Reddit r/hypotheticalsituation...');
  const redditItems = await scrapeRedditHypotheticals();
  console.log(`   ✓ Found ${redditItems.length} Reddit discussions`);

  console.log('📡 Ingesting from YouTube Search Suggest Autocomplete...');
  const ytItems = await scrapeYouTubeSuggestions();
  console.log(`   ✓ Found ${ytItems.length} live search queries`);

  const combined = [...redditItems, ...ytItems];

  // Deduplicate by clean title
  const seen = new Set();
  const uniqueItems = [];
  for (const item of combined) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push({
        ...item,
        viralScore: scoreHypothetical(item),
      });
    }
  }

  // Sort by Viral Score descending
  uniqueItems.sort((a, b) => b.viralScore - a.viralScore);

  // Persist to cache
  fs.mkdirSync(path.dirname(SCRAPED_CACHE_PATH), { recursive: true });
  fs.writeFileSync(SCRAPED_CACHE_PATH, JSON.stringify(uniqueItems, null, 2), 'utf-8');
  console.log(`\n💾 Saved ${uniqueItems.length} ranked hypotheticals to: data/scraped_hypotheticals.json\n`);

  return uniqueItems;
}

// CLI Direct Test Runner
if (process.argv[1]?.endsWith('scrape_hypotheticals.js')) {
  scrapeAndRankHypotheticals().then(items => {
    console.log('🔥 TOP 5 VIRAL HYPOTHETICAL SHORT CONCEPTS:');
    items.slice(0, 5).forEach((item, idx) => {
      console.log(`  ${idx + 1}. [Score: ${item.viralScore}/100] (${item.source})`);
      console.log(`     "${item.title}"`);
      if (item.score) console.log(`     Upvotes: ${item.score} | Comments: ${item.numComments}`);
    });
  });
}
