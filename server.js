require('dotenv').config();
const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const { scheduleJob }  = require('./cron');
const apiRoutes         = require('./routes/api');
const { initDB }        = require('./services/db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve dashboard static files
app.use(express.static(path.join(__dirname, 'dashboard')));

// API routes
app.use('/api', apiRoutes);

// All other routes → dashboard
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

async function start() {
  try {
    await initDB();
    scheduleJob();
    app.listen(PORT, () => {
      console.log(`\n██████████████████████████████████████████`);
      console.log(`██  YOUTUBE INTELLIGENCE OFFICE — LIVE  ██`);
      console.log(`██  http://localhost:${PORT}                ██`);
      console.log(`██████████████████████████████████████████\n`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
