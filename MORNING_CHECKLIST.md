# Morning Deployment Checklist

Goal: live URL in 10 minutes. You already have Vercel, GitHub, Ticketmaster, and Foursquare ready.

## Step 1: Push code to GitHub (3 min)

Option A: GitHub Desktop or web upload
1. Go to https://github.com/new
2. Name it: `music-city-retreat` (or anything)
3. Set Private if you want
4. Click Create repository
5. Click "uploading an existing file"
6. Drag every file in this folder EXCEPT `node_modules` and `.env.local` (if present)
7. Commit

Option B: Command line (if comfortable)
```bash
cd /path/to/this/folder
git init
git add .
git commit -m "Initial Music City Retreat"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/music-city-retreat.git
git push -u origin main
```

## Step 2: Deploy to Vercel (3 min)

1. Go to https://vercel.com/new
2. Click Import next to your `music-city-retreat` repo
3. Vercel auto-detects everything. Don't change settings.
4. Click Deploy
5. Wait ~30 seconds. You'll get a URL like `music-city-retreat.vercel.app`

## Step 3: Add your API keys (2 min)

1. In your Vercel project, click Settings (top nav)
2. Click Environment Variables (left sidebar)
3. Add both keys (paste value, check all 3 environments, Save):
   - `TICKETMASTER_KEY` = your existing Ticketmaster key
   - `FOURSQUARE_API_KEY` = your fresh Foursquare key
4. Go to Deployments tab > click "..." on latest deploy > Redeploy

## Step 4: Test it (1 min)

1. Open your live URL: `https://your-project.vercel.app`
2. Header should show "Live: foursquare, ticketmaster" with green dot
3. Type "events tonight" or click "Live music tonight"
4. You should see real upcoming Nashville events with ticket links
5. Click "Show all restaurants" to see live Foursquare data with ratings
6. Visit `https://your-project.vercel.app/api-test.html` and click "Run all tests"
7. Foursquare and Ticketmaster rows should show Pass

## Step 5: Add Google Places later (optional, when ready)

### Foursquare Places (free, instant)
1. Go to https://foursquare.com/developers
2. Sign up (free, no credit card needed)
3. Create a new project or app
4. Generate a Service API key
5. Copy the key
6. In Vercel: Settings > Environment Variables > add `FOURSQUARE_API_KEY` = paste
7. Redeploy

### Google Places (free $200/month credit)
1. Go to https://console.cloud.google.com
2. Create a project named "music-city-retreat"
3. Search "Places API (New)" and click Enable
4. Add a billing account (required even for free tier, won't be charged under $200/month usage)
5. APIs & Services > Credentials > Create Credentials > API Key
6. Copy the key
7. (Recommended) Click "Restrict Key" > Application restrictions: HTTP referrers > add `*.vercel.app/*`
8. In Vercel: add `GOOGLE_PLACES_KEY` = paste
9. Redeploy

### Nashville Open Data (free, optional)
1. Go to https://data.nashville.gov/profile/edit/developer_settings
2. Sign up for a free account
3. Create an app token
4. In Vercel: add `NASHVILLE_APP_TOKEN` = paste
5. Redeploy

## Step 7: Custom domain (optional)

1. Vercel project > Settings > Domains
2. Type your domain like `musiccityretreat.com`
3. Vercel shows DNS records to add
4. Add them at your domain registrar (Namecheap, GoDaddy, Cloudflare)
5. Wait 5-30 minutes for propagation
6. SSL is automatic and free

## Troubleshooting

### "Live" badge doesn't show after deploying
- Check the deploy logs in Vercel for errors
- Visit `/api/health` directly: should return JSON listing which keys are detected
- Make sure you redeployed after adding env vars (env changes need a redeploy)

### Ticketmaster returns 401
- Your API key might be wrong or for the wrong product
- Test it directly: `https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_KEY&city=Nashville`
- Should return a JSON event list

### Bot shows "Curated mode"
- This is the fallback when no API keys are configured
- Means the bot is working correctly, just without live data

## What works in Curated mode (no API keys)

- All 43 hand-curated restaurants
- 10 attractions
- 5 events
- 7 neighborhoods
- All ride-share buttons (Uber, Lyft, Waymo) and delivery (DoorDash, Uber Eats)
- All booking platform deep links (OpenTable, Resy, Tock, Yelp)
- GPS pickup location
- Reservation flow

## What activates with each API

- TICKETMASTER_KEY: Live events with real dates, prices, ticket links
- FOURSQUARE_API_KEY: Live restaurant search with real ratings, photos, hours
- GOOGLE_PLACES_KEY: Live tourist attractions with current ratings
- NASHVILLE_APP_TOKEN: City open data (parks, transit, permits)

## Files to push to GitHub

```
nashville-chatbot.html       (frontend)
api-test.html                (test page)
api/                         (5 serverless functions)
package.json
vercel.json
.env.example
.gitignore
README.md
MORNING_CHECKLIST.md         (this file)
```

Do NOT push:
- `.env` or `.env.local` (your actual keys)
- `node_modules`
- `.vercel` directory
- `server.js` is unused, fine to delete

You got this.
