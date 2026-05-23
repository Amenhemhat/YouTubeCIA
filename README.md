# YouTube Intelligence Office

CIA-level YouTube intelligence dashboard for the AI automation niche.
Scrapes YouTube via Apify, analyzes with Claude, serves an interactive dashboard.

---

## Setup (5 steps)

### 1. Install dependencies
```bash
cd youtube-intel
npm install
```

### 2. Create your .env file
```bash
cp .env.example .env
```
Fill in:
- `ANTHROPIC_API_KEY` — your Anthropic key
- `APIFY_TOKEN` — your Apify API token
- `APIFY_ACTOR_ID` — your YouTube scraper actor ID
- `DATABASE_URL` — Railway fills this automatically when you add PostgreSQL

### 3. Test locally (optional)
```bash
npm run dev
# Visit http://localhost:3000
# Click RUN INTEL to test the full pipeline
```

### 4. Deploy to Railway
1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL addon (Railway dashboard → + Add → Database → PostgreSQL)
4. Add all env vars from .env to Railway's Variables tab
5. Deploy — Railway auto-detects Node.js

### 5. Trigger first run
Visit your Railway URL → click **RUN INTEL** → wait ~3 minutes → dashboard populates.

---

## Architecture

```
Cron (every 2 weeks, Sunday 5 AM)
  → POST /api/run
    → Apify: scrape 4 keywords × 100 videos
    → Filter: last 14 days only
    → Rank: views + (likes×5) + (comments×10)
    → Top 50 → Claude claude-opus-4-5
    → Save to PostgreSQL
  ← Dashboard reads GET /api/current
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/current` | Active intelligence report |
| POST | `/api/run` | Trigger manual run |
| GET | `/api/status` | Is a run in progress? |
| GET | `/api/history` | Past report metadata |
| GET | `/api/health` | Health check |

## Keywords monitored
- Make money with AI
- AI automation
- Claude AI
- Saving time with AI
