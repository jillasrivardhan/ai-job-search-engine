# 10x Job Hunter

> A focused AI job-hunting dashboard that turns a student resume into a ranked, actionable job shortlist.

10x Job Hunter lets a student upload a PDF or DOCX resume, extracts a structured profile, collects permitted listings through Apify, removes duplicates, scores each job against the student’s background, and links them to the original posting to apply themselves.

## Why it exists

Searching across job boards is noisy and repetitive. This project provides one simple workspace to answer a better question: **which fresh roles are most relevant to my resume?**

It is intentionally built as a personal dashboard. It never submits applications automatically, accesses private profiles, handles login credentials, or bypasses a job source’s technical restrictions.

## Features

- PDF and DOCX resume upload
- Two-layer PDF text extraction for better compatibility
- Structured profile extraction: skills, technologies, roles, education, experience, location, and work preferences
- Optional LLM profile extraction with a local heuristic fallback
- Apify-only collection with support for multiple configured actors
- Job normalization, URL-first deduplication, and transparent 0-100 matching
- Ranked job cards with matching skills and original Apply links
- SQLite persistence for a lightweight MVP
- Daily refresh at **10:00 AM Asia/Kolkata** on Vercel Cron
- Responsive Next.js interface

## Product flow

```text
Resume upload
  -> Resume text extraction
  -> Student profile
  -> Apify job actors
  -> Normalize and deduplicate
  -> Match and score
  -> Ranked dashboard
  -> Apply on the original job site
```

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend and backend | Next.js 15, React 19, TypeScript |
| Database | SQLite via `better-sqlite3` |
| Resume parsing | `pdf-parse`, `pdfjs-dist`, `mammoth` |
| Job collection | Apify API |
| Optional AI parsing | OpenAI-compatible Chat Completions API |
| Scheduling | Vercel Cron |

## Getting started

### Prerequisites

- Node.js 20 or later
- An Apify account, API token, and at least one permitted job actor
- Optional: an LLM API key for richer resume profile extraction

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create the local secrets file:

```bash
copy .env.example .env.local
```

On macOS/Linux, use `cp .env.example .env.local`.

Fill in `.env.local`. **Never commit this file.**

```env
DATABASE_URL=./data/job-hunter.db

APIFY_API_TOKEN=your_apify_token
APIFY_ACTOR_IDS=owner~actor-name

# Optional JSON applied to each actor.
# APIFY_ACTOR_INPUT={"keywords":"Python Developer Intern"}

# Optional - the app uses a local fallback parser when omitted.
LLM_API_KEY=your_llm_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini

CRON_SECRET=use-a-long-random-value
```

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), upload a resume, and select **Find My Jobs**.

## Apify setup

Apify is the project’s only external job-data collection layer. Configure only actors and sources whose terms allow the intended automated collection and use.

The selected actor must return records containing at least a job title and original job URL. The collector automatically supplies a `keywords` value based on the extracted preferred role. If an actor needs a different query or extra fields, set `APIFY_ACTOR_INPUT` according to that actor’s documented input contract.

```env
APIFY_ACTOR_IDS=owner~permitted-job-actor,owner~another-permitted-actor
APIFY_ACTOR_INPUT={"keywords":"Machine Learning Intern","location":"India"}
```

## Data model and scoring

Every collected listing is normalized into:

```text
id, title, company, location, job_url, source, posted_date,
description, required_skills, employment_type, remote_type, salary
```

The app preserves the original source URL and deduplicates by URL first; if unavailable, it uses company, title, location, and source. Scores use only available evidence: matching skills, preferred roles, location/work preferences, and student or intern experience level. Missing qualifications are never invented.

## Daily refresh

[`vercel.json`](./vercel.json) runs the refresh route at `04:30 UTC`, which is **10:00 AM Asia/Kolkata**.

```text
Trigger -> Apify actors -> Normalize -> Deduplicate -> Score -> Store -> Dashboard
```

The `GET /api/cron/refresh` endpoint expects `Authorization: Bearer <CRON_SECRET>`. Set the same value in your deployment environment. On another host, schedule the endpoint daily through that host’s scheduler.

## Project structure

```text
app/
  api/
    resume/          Resume upload and parsing endpoint
    jobs/refresh/    On-demand collection endpoint
    cron/refresh/    Scheduled refresh endpoint
  page.tsx           Dashboard page
components/
  dashboard.tsx      Dashboard UI
lib/
  db.ts              SQLite persistence
  profile.ts         Profile extraction and fallback parser
  jobs.ts            Apify collection, normalization, dedupe, scoring
  types.ts           Shared data types
```

## Security and responsible use

- Keep API keys only in `.env.local` or your deployment secret manager.
- `.env.local`, local SQLite data, dependencies, and build output are excluded from Git.
- Rotate any key that was committed, pasted publicly, or shared unintentionally.
- Do not configure actors that bypass CAPTCHAs, authentication, paywalls, rate limits, or anti-bot controls.
- Do not collect private data, session cookies, or credentials.
- Apply links always open the original posting in a new tab; the app never applies automatically.

## Useful commands

```bash
npm run dev      # Start local development
npm run build    # Create a production build and type-check
npm run start    # Run the production build
```

## Troubleshooting

| Message | What to do |
| --- | --- |
| `Apify is not configured` | Add `APIFY_API_TOKEN` and `APIFY_ACTOR_IDS` to `.env.local`, then restart the server. |
| Actor says `keywords is required` | Re-upload the resume so a preferred role is extracted, or set `APIFY_ACTOR_INPUT={"keywords":"..."}`. |
| `Updated 0 ranked jobs` | The actor returned no matching listings, or its output lacks a title/original job URL. Check the actor input and output contract. |
| Resume cannot be read | Use a text-based, unlocked PDF or a DOCX file. Image-only PDFs need OCR before upload. |

## Future improvements

- Per-user authentication and profiles
- PostgreSQL for multi-user deployments
- Actor-specific input adapters
- Saved jobs and application tracking
- Job alerts and notifications
- Explainable per-factor scoring
- Automated tests and CI

---

Built to make a student’s job search more focused, transparent, and actionable.
