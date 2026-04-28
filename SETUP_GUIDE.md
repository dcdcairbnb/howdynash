# Howdy Nashville Setup Guide

Complete setup documentation for the Nashville tourist chatbot. Reference this whenever you need to remember how something is wired or onboard a partner.

Last updated: April 2026

---

## What This Is

Howdy Nashville is a conversational tourism chatbot for Nashville visitors. Users get restaurant picks, live music listings, festivals, ride-share deep links, food delivery, vacation rentals, hotels, weather, BNA flight tracking, and AI-powered Q&A about the city.

The site is mobile-first, free to use, no signup required.

Live URL: https://howdy-nashville.vercel.app

---

## Architecture

Static HTML chatbot served from Vercel.

Vercel serverless functions handle API proxying and the LLM call.

Real-time data pulled from nine integrated services.

GitHub triggers Vercel auto-deploy on every push to main.

Local deploy.sh script automates the push workflow.

Stack summary:

- Frontend: single HTML file with vanilla JavaScript and CSS
- Backend: Vercel serverless functions in /api directory
- LLM: Anthropic Claude Haiku 4.5 via /api/chat endpoint
- Hosting: Vercel hobby plan (free)
- CI/CD: GitHub auto-deploy to Vercel on push
- Domain: howdy-nashville.vercel.app (custom domain pending)

---

## Accounts You Need

Required accounts (cannot run without these).

GitHub. Free. Stores the codebase.

Vercel. Free hobby plan. Hosts the live site.

Anthropic. Pay-as-you-go. Powers the AI chat. Min credit $5 to start.

Free API accounts (essential for full functionality).

Foursquare Places. Free tier 1000 requests per day.

Google Cloud Platform. Free tier $200 monthly credit. Used for Places API.

Ticketmaster Developer. Free.

SeatGeek Platform. Free.

Eventbrite Developer. Free.

AviationStack. Free tier 100 requests per month.

Affiliate programs (revenue path).

Viator Partner. Free, instant approval. Pays 8% on tour bookings.

GetYourGuide Partner. Free. Pays 8% on tour bookings.

Awin. Free. Handles Airbnb and Booking.com partnerships.

CJ Affiliate. Free. Handles VRBO partnership.

Expedia Partner Network (EPN). Free, 24-48 hour approval. Pays 4-6% on hotel bookings.

---

## One-Time Setup Steps

### Step 1. Create GitHub repo

Login at github.com.

Create a new repo named "howdy-nashville". Set to public.

Note the repo URL: https://github.com/YOUR_USERNAME/howdy-nashville.git

### Step 2. Create Vercel project

Login at vercel.com using GitHub OAuth.

Click "Add New, Project".

Import your GitHub repo "howdy-nashville".

Use default build settings (no build command needed).

Click Deploy.

Vercel gives you a URL like https://howdy-nashville.vercel.app

### Step 3. Get API keys

Foursquare. Sign up at https://foursquare.com/developers. Create a new project. Get the API key. Add new endpoint domain (places-api.foursquare.com).

Google Cloud Console. Sign up at console.cloud.google.com. Create project. Enable Places API (New). Create credentials, API key. Set restrictions to None or specific HTTP referrer.

Ticketmaster. Sign up at developer.ticketmaster.com. Create new app. Get Consumer Key.

SeatGeek. Sign up at https://platform.seatgeek.com. Create app. Get Client ID.

Eventbrite. Sign up at eventbrite.com. Account Settings, Developer Links, API Keys. Generate Private Token.

AviationStack. Sign up at aviationstack.com. Pick Free plan. Get API key from dashboard.

Anthropic. Sign up at console.anthropic.com. Add $5 credit minimum. Settings, API Keys, Create Key. Copy the sk-ant- key immediately.

### Step 4. Add API keys to Vercel

Go to your Vercel project, Settings, Environment Variables.

Add each key with these exact names. Mark all as Sensitive. Apply to Production and Preview.

```
FOURSQUARE_API_KEY=your_foursquare_key
GOOGLE_PLACES_KEY=your_google_key
TICKETMASTER_KEY=your_ticketmaster_consumer_key
SEATGEEK_CLIENT_ID=your_seatgeek_client_id
EVENTBRITE_PRIVATE_TOKEN=your_eventbrite_token
AVIATIONSTACK_KEY=your_aviationstack_key
ANTHROPIC_API_KEY=your_anthropic_key
```

After saving, redeploy the project so the variables take effect.

Verify everything connected by visiting: https://howdy-nashville.vercel.app/api/health

You should see all services true.

### Step 5. Sign up for affiliate programs

Viator. Apply at https://www.viator.com/partner. Approval often instant. Get Partner ID format U + 8 digits.

GetYourGuide. Apply at https://partner.getyourguide.com. Approval typically same day. Get Partner ID format alphanumeric.

Awin. Apply at https://www.awin.com. After account approved, search for Booking.com and Airbnb advertisers and apply to each. Get Publisher ID.

CJ Affiliate. Apply at https://signup.cj.com. After approval, search VRBO and apply. Get publisher ID and SID.

Expedia Partner Network. Apply at https://partner.expediagroup.com/affiliate. Approval 24-48 hours. Get CID and TPID from dashboard.

### Step 6. Wire affiliate IDs into the code

Open nashville-chatbot.html and locate these constants near the top of the script tags:

```javascript
const VIATOR_PID = 'YOUR_VIATOR_ID';
const GETYOURGUIDE_PID = 'YOUR_GYG_ID';
const AIRBNB_AFFILIATE_TAG = '';
const VRBO_AFFILIATE_TAG = '';
const BOOKING_AFFILIATE_ID = '';
const EXPEDIA_CAMREF = '';
const EXPEDIA_TPID = '8000';
```

Replace empty strings with your actual IDs. Save and deploy.

### Step 7. Set up payment for affiliates

Viator. Login at https://partners.viator.com/login. Settings, Payments. Add ACH (PPD) for personal account. Submit W-9 tax form.

GetYourGuide. Login at https://partner.getyourguide.com. Account, Payment Settings. Add bank or PayPal.

Awin. Settings, Payment Details. Add bank account.

CJ Affiliate. Account, Settings, Payment. Configure direct deposit.

Expedia. Partner Central, Settings, Payment Information. Add ACH.

Submit tax forms (W-9 for US persons) on each platform. None will pay you without it.

---

## Environment Variables Reference

Add these to Vercel project Settings, Environment Variables.

Mark all Sensitive. Apply to Production and Preview environments.

| Key | Source | Required |
|---|---|---|
| FOURSQUARE_API_KEY | foursquare.com/developers | Yes |
| GOOGLE_PLACES_KEY | console.cloud.google.com | Yes |
| TICKETMASTER_KEY | developer.ticketmaster.com | Yes |
| SEATGEEK_CLIENT_ID | platform.seatgeek.com | Recommended |
| EVENTBRITE_PRIVATE_TOKEN | eventbrite.com developer | Recommended |
| AVIATIONSTACK_KEY | aviationstack.com | Recommended |
| ANTHROPIC_API_KEY | console.anthropic.com | Yes for AI chat |

Weather and Nashville Open Data require no keys.

---

## Local Development Setup

You only edit files locally. Vercel runs production. There is no local server.

Required tools.

Mac with Terminal access.

Homebrew. Install at https://brew.sh

Git. Comes with macOS.

GitHub CLI. Install with `brew install gh`.

A code editor like VS Code or TextEdit.

One-time setup commands.

```bash
brew install gh
gh auth login
```

Pick GitHub.com, HTTPS, Login with web browser. Copy the code, authorize in browser.

Clone the repo locally if not already there.

```bash
cd ~/Documents
git clone https://github.com/YOUR_USERNAME/howdy-nashville.git
cd howdy-nashville
chmod +x deploy.sh
```

The deploy.sh script handles everything from this point.

---

## Deployment Workflow

Daily workflow for pushing changes.

```bash
cd /Users/dan/Documents/howdy-nashville
./deploy.sh
```

Or with a custom commit message:

```bash
./deploy.sh "added weather button"
```

What the script does.

Pulls latest from GitHub to avoid conflicts.

Stages your local changes.

Commits with timestamp or your custom message.

Pushes to GitHub main branch.

Vercel auto-deploys within 30-90 seconds.

Verify deployment.

Open Vercel dashboard at https://vercel.com/dashboard. Click your project. Check Deployments tab for green Ready status.

Hit https://howdy-nashville.vercel.app to confirm changes are live.

Hard refresh browser if you see old content (Cmd+Shift+R on Mac).

---

## File Structure

```
howdy-nashville/
├── nashville-chatbot.html       Main app file (everything in one)
├── deploy.sh                     Deploy script
├── package.json                  Vercel detects Node project
├── vercel.json                   Vercel routing config
├── README.md                     Public-facing readme
├── SETUP_DEPLOY.md               Quick deploy reference
├── SETUP_GUIDE.md                This file
├── MORNING_CHECKLIST.md          Daily checklist
├── api-test.html                 API testing page
├── .env.example                  Documents env vars
├── .gitignore                    Git ignore rules
└── api/                          Vercel serverless functions
    ├── health.js                 Reports which services connected
    ├── chat.js                   Claude LLM endpoint
    ├── events.js                 Ticketmaster + SeatGeek + Eventbrite
    ├── festivals.js              Festival listings
    ├── flights.js                BNA flight tracker
    ├── weather.js                Weather.gov forecast
    ├── nashville/data.js         Nashville Open Data fallback
    ├── places/search.js          Google Places search
    └── restaurants/
        ├── search.js             Foursquare + Google restaurants
        └── [id].js               Restaurant detail
```

---

## Common Commands

Deploy local changes.

```bash
cd /Users/dan/Documents/howdy-nashville && ./deploy.sh
```

Check git status.

```bash
git status
```

See recent commits.

```bash
git log --oneline -5
```

Pull latest from GitHub.

```bash
git pull origin main
```

Verify health endpoint.

```bash
curl https://howdy-nashville.vercel.app/api/health
```

Test specific endpoint.

```bash
curl https://howdy-nashville.vercel.app/api/weather
curl https://howdy-nashville.vercel.app/api/events?keyword=country
```

---

## Troubleshooting

Site shows old content after deploy.

Hard refresh browser. Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows. Mobile: close tab, reopen URL.

API endpoint returns 503.

Means a required env var is missing. Check Vercel Settings, Environment Variables. Confirm key name exactly matches what code expects.

API returns 401.

API key is wrong, expired, or has restrictions. Generate a new key, update Vercel env var, redeploy.

API returns 404.

Model name or endpoint URL is wrong. Check the service's docs for current model names.

Vercel shows DEPLOYMENT_NOT_FOUND.

Project may have been renamed. Trigger a fresh deploy by pushing any commit. Check Vercel dashboard, Domains section, and add new domain alias if needed.

deploy.sh fails with merge conflicts.

You have local changes that diverge from GitHub. Run:

```bash
git pull origin main --no-rebase --strategy-option=ours
```

Then deploy again.

deploy.sh fails on first run with "untracked working tree files".

Run these manual commands once:

```bash
git add -A
git commit -m "initial state" --allow-empty
git pull origin main --no-rebase --allow-unrelated-histories --strategy-option=ours
git push origin main
```

Future runs will work normally.

LLM returns "I had trouble reaching the answer service".

Check Vercel logs for the actual error. Common causes: expired API key, wrong model name, or rate limit.

---

## Cost Tracking

Hosting. Vercel hobby plan. Free.

Domain. None yet. When ready, ~$10-40/year.

API costs.

Anthropic Claude Haiku. ~$1.20 per 1000 conversations.

Google Places (New). $200 free monthly credit, then ~$32 per 1000 requests.

Foursquare. Free tier 1000 requests per day. Plenty for low traffic.

Ticketmaster, SeatGeek, Eventbrite, Weather.gov. Free.

AviationStack. Free 100 requests per month, then $9.99/month for 10k.

Realistic monthly cost at low traffic (under 1000 daily users): $5 to $15.

---

## Revenue Tracking

Affiliate dashboards (check weekly).

Viator: https://partners.viator.com/login

GetYourGuide: https://partner.getyourguide.com

Awin: https://ui.awin.com

CJ Affiliate: https://members.cj.com

Expedia: https://partner.expediagroup.com

Each shows clicks, conversions, and pending commissions.

Payments arrive monthly via direct deposit, typically 30-60 days after the customer takes the trip.

---

## Brand Reference

App name: Howdy Nashville

Tagline: Your Nashville guide

Welcome message: Howdy. I'm your Nashville guide. Restaurants, live music, events, and tourist info. What sounds good?

Brand colors: red gradient (#d62828 to #f77f00) for header, white background for chat.

Font: system default (San Francisco on Mac, Segoe UI on Windows, Roboto on Android).

Domain (when purchased): howdynashville.com or howdynashville.app

Social handles to claim: @howdynashville on Instagram, TikTok, X.

---

## Future Roadmap (TODO)

Buy custom domain (howdynashville.com or .app).

Add Plausible analytics.

Add PWA features (manifest.json, service worker, install prompt).

Add Phase 2 LLM tool use (Claude calls real APIs instead of using training knowledge).

Build hotel partnership pitch deck.

Pitch 10 Nashville hotels for white-label deals at $200-500/month.

Write SEO blog posts (Best Hot Chicken, First Time in Nashville, Bachelorette Guide).

Add user accounts and saved trips.

Expand to other cities under same brand or franchise model.

---

## Support and Help

If something breaks, check this guide first.

Vercel logs: vercel.com/dashboard, your project, Logs tab.

GitHub commits: github.com/YOUR_USERNAME/howdy-nashville/commits

API status pages: each service has a status page (status.anthropic.com, status.openai.com style).

For code questions, the SETUP_DEPLOY.md and this SETUP_GUIDE.md should cover everything.
