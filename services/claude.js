const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an elite YouTube intelligence analyst embedded inside the Automate&Earn Intelligence Office. Your mission: analyze YouTube video performance data from the AI automation niche and return a comprehensive, actionable intelligence report.

RULES:
- Return ONLY valid JSON. No markdown, no code fences, no commentary.
- Be brutally specific — no vague observations.
- The action plan must be immediately executable video ideas.
- Base all conclusions strictly on the data provided.

Return this exact JSON structure (fill every field):

{
  "report_summary": {
    "total_videos_analyzed": 0,
    "date_range": "",
    "niche": "AI Automation & Make Money with AI",
    "viral_threshold_views": 0,
    "intelligence_grade": "",
    "key_insight": ""
  },
  "top_20_videos": [
    {
      "rank": 1,
      "title": "",
      "channel": "",
      "views": 0,
      "likes": 0,
      "comments": 0,
      "performance_score": 0,
      "published_at": "",
      "url": "",
      "why_it_worked": "",
      "title_formula": "",
      "hook_type": "",
      "content_angle": ""
    }
  ],
  "hook_analysis": {
    "top_hook_formulas": [],
    "most_clicked_openings": [],
    "emotional_triggers_working": [],
    "hooks_to_avoid": []
  },
  "title_intelligence": {
    "dominant_patterns": [],
    "power_words": [],
    "optimal_title_length": "",
    "title_formulas_ranked": []
  },
  "content_intelligence": {
    "optimal_video_length": "",
    "content_angles_dominating": [],
    "content_gaps": [],
    "what_is_dying": [],
    "thumbnail_patterns": []
  },
  "keyword_intelligence": [
    {
      "keyword": "",
      "strength": "",
      "trend": "",
      "saturation": "",
      "opportunity_score": 0
    }
  ],
  "channel_intelligence": {
    "top_channels_to_watch": [],
    "emerging_channels": [],
    "avg_posting_frequency": ""
  },
  "my_action_plan": [
    {
      "priority": 1,
      "video_title": "",
      "target_hook": "",
      "why_this_will_work": "",
      "estimated_views": "",
      "keyword_to_target": "",
      "optimal_length": "",
      "content_angle": ""
    }
  ],
  "threats_and_opportunities": {
    "immediate_opportunities": [],
    "threats_to_monitor": [],
    "blue_ocean_angles": []
  }
}`;

async function analyzeVideos(videos) {
  console.log(`[Claude] Analyzing ${videos.length} videos...`);

  // Strip thumbnails + descriptions to reduce token count, keep signal data
  const payload = videos.map((v, i) => ({
    rank_by_performance: i + 1,
    title:             v.title,
    channel:           v.channel,
    views:             v.views,
    likes:             v.likes,
    comments:          v.comments,
    performance_score: v.performanceScore,
    published_at:      v.publishedAt,
    url:               v.url
  }));

  const response = await anthropic.messages.create({
    model:      'claude-opus-4-5',
    max_tokens: 8000,
    temperature: 0,
    system:     SYSTEM_PROMPT,
    messages: [
      {
        role:    'user',
        content: `Analyze these top ${videos.length} performing YouTube videos from the AI automation niche published in the last 14 days. Identify all patterns, opportunities, and gaps. Generate a 5-video action plan I can execute immediately.\n\nVIDEO DATA:\n${JSON.stringify(payload, null, 2)}`
      }
    ]
  });

  const raw = response.content[0].text.trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Fallback: extract JSON block if model wrapped it
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('[Claude] Response was not valid JSON');
  }
}

module.exports = { analyzeVideos };
