const express = require('express');
const router  = express.Router();
const { scrapeYouTube }                          = require('../services/apify');
const { analyzeVideos }                          = require('../services/claude');
const { saveReport, getActiveReport, getReportHistory } = require('../services/db');

let isRunning = false;  // prevent concurrent runs

// GET /api/current — active intelligence report
router.get('/current', async (req, res) => {
  try {
    const report = await getActiveReport();
    if (!report) {
      return res.json({ status: 'no_data', message: 'No report yet. Trigger a run via POST /api/run' });
    }
    res.json({ status: 'success', report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/run — trigger intelligence gathering manually
router.post('/run', async (req, res) => {
  if (isRunning) {
    return res.json({ status: 'already_running', message: 'Intelligence gathering already in progress.' });
  }

  // Respond immediately so the dashboard doesn't hang
  res.json({ status: 'started', message: 'Intelligence gathering initiated. Data will be ready in ~2–3 minutes.' });

  isRunning = true;
  try {
    console.log('[INTEL] Manual run triggered');
    const videos   = await scrapeYouTube();
    const analysis = await analyzeVideos(videos);
    await saveReport(videos, analysis);
    console.log('[INTEL] Report saved successfully');
  } catch (err) {
    console.error('[INTEL] Run failed:', err.message);
  } finally {
    isRunning = false;
  }
});

// GET /api/status — is a run in progress?
router.get('/status', (req, res) => {
  res.json({ running: isRunning, timestamp: new Date().toISOString() });
});

// GET /api/history — past reports metadata
router.get('/history', async (req, res) => {
  try {
    const history = await getReportHistory();
    res.json({ status: 'success', history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ status: 'OPERATIONAL', service: 'YouTube Intel Office', timestamp: new Date().toISOString() });
});

module.exports = router;
