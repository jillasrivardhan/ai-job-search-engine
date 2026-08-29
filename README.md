# 10x Job Hunter

A personal job-matching dashboard. Upload a PDF/DOCX resume, review the extracted profile, and fetch/rank jobs collected only through configured Apify actors.

## Run locally

1. Copy `.env.example` to `.env.local` and add the tokens/actor IDs you are permitted to use.
2. `npm install`
3. `npm run dev`

Without Apify configuration, **Find My Jobs** is safely disabled at collection time and explains what is missing. The app never attempts to access sources directly.

## Daily refresh

`vercel.json` schedules `/api/cron/refresh` for **10:00 AM Asia/Kolkata** (04:30 UTC). Set `CRON_SECRET`; the route accepts `Authorization: Bearer <CRON_SECRET>`. On non-Vercel hosting, schedule the same endpoint with the host's scheduler.

## Apify actor contract

Each actor may return any sensible job-field naming. The normalizer recognizes common variants (`url`, `applyUrl`, `position`, `employer`, `datePosted`, etc.) and preserves the original posting URL/source. The collector automatically supplies `keywords` from the extracted preferred role, which is required by the configured actor. Set `APIFY_ACTOR_INPUT` to a JSON object when an actor needs a specific query or additional permitted input. Configure only actors and sources whose collection/use you are authorized to perform; inaccessible or non-compliant sources must be omitted.
