/**
 * Multi-Source Live Tech Trend & Meme Scraper
 * Pulls real-time viral headlines from:
 * 1. HackerNews API (top stories & tech outages/news)
 * 2. Google News Tech RSS (breaking tech headlines)
 */

export async function scrapeTrendingTopics() {
  const trends = {
    hackerNews: [],
    breakingNews: [],
    timestamp: new Date().toISOString()
  };

  // 1. HackerNews Top Stories
  try {
    const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (hnRes.ok) {
      const ids = await hnRes.json();
      const topIds = ids.slice(0, 10);
      const stories = await Promise.all(
        topIds.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
      );
      trends.hackerNews = stories.filter(Boolean).map(s => ({
        source: "HackerNews",
        title: s.title,
        score: s.score || 0,
        url: s.url || ""
      }));
    }
  } catch (e) {
    console.warn("HackerNews scrape error:", e.message);
  }

  // 2. Google News Tech RSS
  try {
    const gnRes = await fetch('https://news.google.com/rss/search?q=technology+AI+software+programming&hl=en-US&gl=US&ceid=US:en');
    if (gnRes.ok) {
      const xml = await gnRes.text();
      const matches = [...xml.matchAll(/<title>(.*?)<\/title>/g)].slice(1, 10);
      trends.breakingNews = matches.map(m => {
        let t = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        // Remove trailing source "- The Verge" etc.
        const clean = t.split(' - ')[0];
        return {
          source: "GoogleNews",
          title: clean.trim()
        };
      });
    }
  } catch (e) {
    console.warn("Google News RSS error:", e.message);
  }

  return trends;
}

if (process.argv[1]?.endsWith('trend_scraper.js')) {
  console.log("🔍 Scraping live tech trends...");
  scrapeTrendingTopics().then(data => {
    console.log("\n🔥 HackerNews Top Trending:");
    data.hackerNews.slice(0, 5).forEach((h, i) => console.log(`  ${i+1}. [${h.score} pts] ${h.title}`));

    console.log("\n📰 Breaking Tech Headlines:");
    data.breakingNews.slice(0, 5).forEach((b, i) => console.log(`  ${i+1}. ${b.title}`));
  });
}
