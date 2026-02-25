# VC Intelligence Interface

A precision AI scouting interface for venture capital firms.

This project was built as a time-boxed take-home assignment to demonstrate:
- Workflow-driven product thinking
- Live AI enrichment integration
- Secure server-side architecture
- Clean, production-quality UI

---

## Product Vision

Venture capital sourcing is repetitive, noisy, and thesis-dependent.

This interface models a simplified “precision AI scout” workflow:

Discover → Open Profile → Enrich → Analyze → Save → Export

The goal is to reduce noise, surface high-signal companies, and make enrichment transparent and explainable.

---

## Features

### Companies Discovery
- Search
- Faceted filters (industry, stage, location)
- Sortable table
- Pagination

### Company Profile
- Overview
- Signals timeline (MVP mock)
- Notes (persisted locally)
- Save to list
-  Live AI enrichment
- Source transparency with timestamps

### Lists
- Create custom lists
- Add/remove companies
- Export as JSON
- Persisted in localStorage

### Saved Searches
- Save search queries
- Re-run instantly
- Persisted locally

---

## Live Enrichment

On the company profile page, users can click **Enrich** to:

1. Send the company website to a server endpoint
2. Fetch public web content
3. Extract structured intelligence via AI
4. Display:

- 1–2 sentence summary
- 3–6 bullet points describing what they do
- 5–10 keywords
- 2–4 derived signals (e.g., careers page exists, blog present, changelog detected)
- Exact URLs scraped
- Enrichment timestamp

---

## Security & Architecture

Enrichment is handled **server-side** via: /api/enrich


- API keys are stored in environment variables
- Keys are never exposed to the browser
- Only public pages are accessed
- No access control bypassing is attempted

Data Flow:

Client  
↓  
POST /api/enrich  
↓  
Server fetch + AI extraction  
↓  
Structured JSON returned  
↓  
Cached + rendered in UI  

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- OpenAI API (server-side)
- LocalStorage for persistence
- Vercel deployment

---

## Local Persistence

The following are stored in `localStorage`:

- Notes
- Lists
- Saved searches
- Enrichment cache

No external database required for MVP.
---
