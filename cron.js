const cron = require('node-cron');
const { scrapeYouTube } = require('./services/apify');
const { analyzeVideos } = require('./services/claude');
const { saveReport }    = require('./services/db');

async function runIntelligenceGather() {
  console.log('[CRON] ██ BEASTMODE INTEL — Bi-weekly run starting...');
  try {
    const videos   = await scrapeYouTube();
    const analysis = await analyzeVideos(videos);
    await saveReport(videos, analysis);
    console.log('[CRON] ██ Intelligence report saved successfully');
  } catch (err) {
    console.error('[CRON] ██ Run FAILED:', err.message);
  }
}

function scheduleJob() {
  // Every 14 days at 5:00 AM
  // node-cron doesn't support "every N days" natively,
  // so we schedule every Sunday at 5 AM and use a counter to skip alternate weeks.
  let runCount = 0;

  cron.schedule('0 5 * * 0', () => {
    runCount++;
    if (runCount % 2 === 1) {   // run on weeks 1, 3, 5... (every other Sunday)
      console.log('[CRON] Bi-weekly trigger fired');
      runIntelligenceGather();
    } else {
      console.log('[CRON] Skipping this Sunday (bi-weekly cadence)');
    }
  });

  console.log('[CRON] Scheduled: every 2nd Sunday at 5:00 AM');
}

module.exports = { scheduleJob, runIntelligenceGather };
