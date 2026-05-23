const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS intelligence_reports (
      id           SERIAL PRIMARY KEY,
      run_date     TIMESTAMP DEFAULT NOW(),
      is_active    BOOLEAN DEFAULT true,
      video_count  INTEGER,
      raw_videos   JSONB,
      analysis     JSONB,
      created_at   TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('[DB] Tables ready');
}

async function saveReport(rawVideos, analysis) {
  // Archive all previous reports
  await pool.query('UPDATE intelligence_reports SET is_active = false');

  const result = await pool.query(
    `INSERT INTO intelligence_reports (raw_videos, analysis, video_count, is_active)
     VALUES ($1, $2, $3, true) RETURNING *`,
    [JSON.stringify(rawVideos), JSON.stringify(analysis), rawVideos.length]
  );

  console.log(`[DB] New report saved — ID ${result.rows[0].id}`);
  return result.rows[0];
}

async function getActiveReport() {
  const result = await pool.query(
    'SELECT * FROM intelligence_reports WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
  );
  return result.rows[0] || null;
}

async function getReportHistory() {
  const result = await pool.query(
    'SELECT id, run_date, video_count, is_active FROM intelligence_reports ORDER BY created_at DESC LIMIT 10'
  );
  return result.rows;
}

module.exports = { initDB, saveReport, getActiveReport, getReportHistory };
