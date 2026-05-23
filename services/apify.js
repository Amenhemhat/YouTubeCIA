const { ApifyClient } = require('apify-client');

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

const KEYWORDS = [
  'Make money with AI',
  'AI automation',
  'Claude AI',
  'Saving time with AI'
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPerformanceScore(v) {
  const views    = parseInt(v.viewCount    || v.views    || 0);
  const likes    = parseInt(v.likeCount   || v.likes    || 0);
  const comments = parseInt(v.commentCount || v.comments || 0);
  // Weighted: comments = highest signal, likes = medium, views = base
  return views + (likes * 5) + (comments * 10);
}

function isWithinTwoWeeks(dateStr) {
  if (!dateStr) return false;
  const videoDate  = new Date(dateStr);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  return videoDate >= twoWeeksAgo;
}

function normalizeVideo(v) {
  return {
    title:            v.title       || v.name        || '',
    channel:          v.channelName || v.channel      || v.author || '',
    views:            parseInt(v.viewCount    || v.views    || 0),
    likes:            parseInt(v.likeCount   || v.likes    || 0),
    comments:         parseInt(v.commentCount || v.comments || 0),
    publishedAt:      v.publishedAt || v.uploadDate   || v.date  || '',
    url:              v.url         || v.videoUrl     || '',
    thumbnail:        v.thumbnailUrl || v.thumbnail   || '',
    description:      (v.description || '').substring(0, 500),
    duration:         v.duration    || '',
    performanceScore: 0   // filled after normalisation
  };
}

// ─── Main scraper ────────────────────────────────────────────────────────────

async function scrapeYouTube() {
  console.log('[Apify] Starting YouTube scrape for all keywords...');

  const allVideos = [];

  for (const keyword of KEYWORDS) {
    try {
      console.log(`[Apify] Scraping: "${keyword}"`);

      const run = await client.actor(process.env.APIFY_ACTOR_ID).call({
        searchKeywords: keyword,   // string, not array — streamers/youtube-scraper requirement
        maxResults: 100,
        sortBy: 'SEARCH_QUERY_SORT_ORDER_DATE'
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      const filtered = items
        .map(v => {
          const norm = normalizeVideo(v);
          norm.performanceScore = getPerformanceScore(v);
          return norm;
        })
        .filter(v => v.title && isWithinTwoWeeks(v.publishedAt));

      console.log(`[Apify] "${keyword}" → ${filtered.length} videos within 2 weeks`);
      allVideos.push(...filtered);

    } catch (err) {
      console.error(`[Apify] Error on keyword "${keyword}": ${err.message}`);
    }
  }

  // Deduplicate by URL
  const seen  = new Set();
  const unique = allVideos.filter(v => {
    if (!v.url || seen.has(v.url)) return false;
    seen.add(v.url);
    return true;
  });

  // Sort by performance score, take top 50
  const top50 = unique
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 50);

  console.log(`[Apify] Unique videos: ${unique.length} → Top 50 selected`);
  return top50;
}

module.exports = { scrapeYouTube };
