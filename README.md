# Channel Pulse

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Styled-38BDF8)
![Demo Mode](https://img.shields.io/badge/Demo-Fallback%20Ready-success)

> Paste a YouTube channel URL. Get instant 30-day performance insights.

Demo-ready MVP built with Next.js 14, Tailwind CSS, TypeScript, and the YouTube Data API v3.

---

## Quick Start (local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your YouTube API key (see below)

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

> **No API key?** The app works without one — it falls back to realistic mock data automatically. Perfect for demos.

---

## Why Channel Pulse

Channel Pulse was designed as a lightweight competitor intelligence MVP for YouTube-focused teams.

The goal is simple: help a user quickly understand what content is working for a competitor right now — without digging through YouTube manually.

Instead of showing raw data alone, the product emphasizes:
- fast interpretation
- trend visibility
- demo-ready clarity
- actionable insights for creators, agencies, and media teams

---

## YouTube API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Library**
4. Search for **YouTube Data API v3** → Enable it
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. (Recommended) Click **Restrict Key**:
   - API restrictions → YouTube Data API v3
   - HTTP referrers → your domain or `localhost:3000/*`
8. Copy the key into `.env.local`:

```
NEXT_PUBLIC_YOUTUBE_API_KEY=AIza...your_key_here
```

**API quota:** The free tier gives you 10,000 units/day. One channel analysis costs ~103 units (well within limits).

---

## Deploy to Vercel (5 minutes)

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel

# When prompted:
# - Framework: Next.js (auto-detected)
# - Root directory: ./
# - Build command: next build (default)
```

### Option B — GitHub + Vercel UI

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add environment variable:
   - Key: `NEXT_PUBLIC_YOUTUBE_API_KEY`
   - Value: your key
5. Click **Deploy**

Done. Vercel handles everything else.

---

## Project Structure

```
channel-pulse/
├── app/
│   ├── page.tsx          # Main page — all state lives here
│   ├── layout.tsx        # Root layout, fonts, metadata
│   └── globals.css       # Design tokens, animations
├── components/
│   ├── ChannelInput.tsx  # URL input + saved channels dropdown
│   ├── ChannelCard.tsx   # Channel stats overview
│   ├── VideoCard.tsx     # Single video row with score + trend
│   ├── SortFilter.tsx    # Sort/filter chip controls
│   ├── InsightPanel.tsx  # Derived insights (the differentiator)
│   ├── TopChart.tsx      # Bar chart — top 5 by views
│   ├── HighlightReelModal.tsx  # Executive summary / shareable insight output
│   └── SkeletonLoader.tsx      # Loading state
├── lib/
│   ├── youtube.ts        # API calls + URL parsing + fallback
│   ├── helpers.ts        # All calculations (engagement, score, insights)
│   └── mockData.ts       # Fallback dataset + benchmarks
└── types/
    └── index.ts          # All TypeScript types
```

---

## Calculations

### Engagement Rate
```
(likes + comments) / views
```

### Performance Score (0–100)
```
score = (normalizedViews × 0.4) + (normalizedEngagement × 0.4) + (recencyBonus × 0.2)

normalizedViews     = min(views / channelAvgViews, 3) / 3
normalizedEngagement = min(engagementRate / 0.10, 1)
recencyBonus        = max(0, 1 - daysSincePublish / 30)
```

### Trend Classification
```
Rising  → views > 1.3× channel average
Cooling → views < 0.6× channel average
Stable  → everything else
```

---

## Features

- **Channel overview** — subscribers, avg views, total videos, upload frequency
- **Video grid** — thumbnail, title, views, engagement rate bar, performance score, trend indicator
- **Sort** — by views, engagement rate, performance score, publish date
- **Filter** — all formats, Shorts only, Long-form only
- **Insights panel** — format analysis, best posting day, engagement rank, top video share, cadence alert
- **Top 5 chart** — inline bar chart, no external libraries
- **Highlight Reel** — copy-ready paragraph for pitch decks / briefs
- **Export CSV** — full video data as CSV download
- **Saved channels** — last 5 analyzed channels stored in localStorage
- **Skeleton loading** — smooth shimmer while fetching
- **Fallback mock data** — always works, even without an API key

---

## Tradeoffs

| Decision | Reason |
|---|---|
| Client-side fetching (not server actions) | Simpler, no CORS issues with YouTube API + `NEXT_PUBLIC_` key |
| Mock data always-on fallback | Demo reliability over API completeness |
| No chart library (custom bars) | Zero bundle weight, full design control |
| localStorage for saved channels | No auth/DB needed, zero backend |
| DM Sans + DM Mono fonts | Professional but distinctive — not the usual Inter |
| CSS custom properties for design tokens | Easy theming, no Tailwind config sprawl |

---

## What I Optimized For

This MVP was intentionally scoped around a few priorities:

- **Demo reliability** — the app remains usable even if live API access is unavailable
- **Fast comprehension** — a founder or client should understand the value within seconds
- **Interpretation over raw analytics** — insights and recommendations matter more than dashboards alone
- **Low-friction UX** — simple input, fast feedback, clean results
- **Client-presentable polish** — the experience should feel ready to show, not just test

---

## Version 2 Ideas

If expanded beyond the MVP, the next logical product improvements would be:

- Multi-channel comparison
- Historical trend tracking
- AI-generated content strategy recommendations
- Saved workspaces and recurring monitoring
- Breakout video alerts
- Team collaboration and reporting workflows

## Supported URL formats

```
https://www.youtube.com/@mkbhd
https://www.youtube.com/channel/UCBcRF18a7Qf58cCRy5xuWwQ
https://www.youtube.com/c/mkbhd
@mkbhd
```
