# Howdy [City] Replication Guide

Complete blueprint for cloning the Howdy Nash setup to a new city.
Updated April 2026 after the full feature buildout (group share, newsletter, family, line dancing, signature, cron).

This guide replaces NEXT_CITY_PLAYBOOK.md. Read this first.


## What you're cloning

A free city tourism site with:
- AI chatbot (Claude Haiku via Anthropic API)
- Live data: Google Places, Foursquare, Ticketmaster, SeatGeek, Eventbrite, Weather.gov
- Curated lists: restaurants, honky tonks (or local equivalent), photo spots, festivals, family attractions, line dancing (or local nightlife)
- Group location sharing with live map (Vercel KV + Leaflet)
- Email signup with welcome PDF
- Weekly auto-newsletter with this-weekend events (Vercel Cron)
- Mobile-first PWA (installable to home screen)
- Affiliate revenue: Viator, GetYourGuide, Expedia, Awin (Airbnb/Booking), CJ
- Custom branded email signature
- Featured host's Airbnb listing


## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Single HTML file, vanilla JS, no framework |
| Hosting | Vercel (Hobby tier) |
| Backend | Vercel Functions (12 max on Hobby) |
| Database | Vercel Postgres (Neon) for subscribers |
| KV store | Upstash Redis (free tier) for group sharing |
| Email | Resend (free tier 3K/month) |
| Email forwarding | ImprovMX (free) for inbound |
| Maps | Leaflet + OpenStreetMap (no API key) |
| LLM | Anthropic Claude Haiku |
| Domain | Namecheap |
| Cron | Vercel Cron Jobs (Hobby allows 2/day) |


## Required accounts

Free tier on all unless noted:

1. Vercel (hosting + cron + KV)
2. GitHub (source control)
3. Namecheap (domain $12/year)
4. Cloudflare or Vercel DNS
5. Resend (email sending)
6. ImprovMX (email forwarding)
7. Anthropic Console (Claude API)
8. Google Cloud (Maps/Places API, ~$10-30/month after free tier)
9. Foursquare Developer (Places API)
10. Ticketmaster Developer (Discovery API)
11. SeatGeek Platform
12. Eventbrite (private token)
13. Awin (affiliate network for Airbnb, Booking.com)
14. CJ Affiliate (US hotel chains - Marriott, Hilton, Hertz)
15. Viator Partner (tours)
16. GetYourGuide Partner (tours)
17. Expedia Partner Solutions (hotels and activities)
18. Pinterest Business (organic traffic)
19. Instagram Business
20. TikTok Business


## All env vars

Set these in Vercel project Settings → Environment Variables. All Sensitive ON, all Production at minimum.

| Variable | Used by | Source |
|---|---|---|
| ANTHROPIC_API_KEY | api/chat.js | console.anthropic.com |
| GOOGLE_PLACES_KEY | api/places/search.js | console.cloud.google.com |
| FOURSQUARE_KEY | api/restaurants/search.js | foursquare.com/developers |
| TICKETMASTER_KEY | api/events.js, api/festivals.js | developer.ticketmaster.com |
| SEATGEEK_CLIENT_ID | api/events.js | seatgeek.com/account/develop |
| EVENTBRITE_PRIVATE_TOKEN | api/events.js | eventbrite.com/platform/api |
| RESEND_API_KEY | api/subscribe.js | resend.com/api-keys |
| POSTGRES_URL | api/subscribe.js | Vercel Marketplace, Neon |
| KV_REST_API_URL | api/group.js | Vercel Marketplace, Upstash |
| KV_REST_API_TOKEN | api/group.js | Vercel Marketplace, Upstash |
| ADMIN_TOKEN | api/subscribe.js | `openssl rand -hex 32` |
| CRON_SECRET | api/subscribe.js (cron) | `openssl rand -hex 32` |
| AWIN_PUBLISHER_ID | nashville-chatbot.html | awin.com |
| EXPEDIA_CAMREF | nashville-chatbot.html | expediagroup.com |
| EXPEDIA_TPID | nashville-chatbot.html | expediagroup.com |
| VIATOR_PID | nashville-chatbot.html | partner.viator.com |
| GETYOURGUIDE_PID | nashville-chatbot.html | partner.getyourguide.com |


## Third-party setup outside Vercel

1. **Domain DNS** (Namecheap):
   - Apex (@) and www CNAME pointing to Vercel
   - MX records for ImprovMX (forwarding)
   - TXT records: SPF, DKIM (for Resend), Pinterest verification, Google Search Console verification
   - Resend "send" subdomain CNAME
   - DMARC TXT

2. **Resend** (transactional + newsletter):
   - Add domain howdy[city].com
   - Verify SPF, DKIM, MX
   - Generate API key
   - Welcome email goes from howdy@howdy[city].com

3. **ImprovMX** (inbound):
   - Free plan
   - Add domain howdy[city].com
   - Alias `*` → forward to your Gmail
   - Plus alias `howdy` specifically → your Gmail (free tier needs both for some reason)

4. **Gmail Send As** (so replies look professional):
   - Settings → Accounts and Import → Send mail as → Add another email
   - Email: howdy@howdy[city].com
   - SMTP: smtp.resend.com, port 587, username `resend`, password = Resend API key
   - Verify with link sent to howdy@ which forwards to Gmail
   - Set as default + reply from same address

5. **Pinterest Business**:
   - Verify domain via meta tag in nashville-chatbot.html `<meta name="p:domain_verify" ...>`
   - Or upload pinterest-XXXXX.html to project root


## File structure

```
howdy-[city]/
├── api/
│   ├── chat.js              # Claude LLM
│   ├── events.js            # Ticketmaster + SeatGeek + Eventbrite
│   ├── festivals.js         # Curated + Visit [City] scraper
│   ├── flights.js           # Local airport (BNA for Nashville)
│   ├── group.js             # Vercel KV group sharing
│   ├── health.js            # API status check
│   ├── places/search.js     # Google Places
│   ├── restaurants/search.js # Foursquare
│   ├── subscribe.js         # Email signup + newsletter (manual + cron)
│   ├── unsubscribe.js       # GDPR/CAN-SPAM compliance
│   └── weather.js           # Weather.gov forecast + alerts
├── public/                  # NOT used as output, but holds extras
│   └── cheatsheet.pdf       # Welcome email attachment
├── nashville-chatbot.html   # The entire frontend (rename to howdy[city]-chatbot.html or generic chatbot.html)
├── manifest.json            # PWA config
├── sw.js                    # Service worker
├── sitemap.xml
├── robots.txt
├── deploy.sh                # git push wrapper, points at the new repo
├── package.json             # @upstash/redis, pg, resend
├── vercel.json              # rewrites, headers, crons
├── logo.jpg                 # Email signature logo (served at /logo.jpg)
├── cheatsheet.pdf           # Also at root for /cheatsheet.pdf URL
├── pinterest-XXXXX.html     # Pinterest verification file (after claim)
├── .env.example             # Template, never commit real secrets
└── .gitignore
```

Vercel function count: 11. Maximum on Hobby is 12. Don't add more without combining existing ones.


## Step by step: clone for a new city

### Day 1: Domain and repo

1. Buy howdy[city].com on Namecheap. $12.
2. Clone Nashville repo:
   ```bash
   cd ~/Documents
   git clone https://github.com/dcdcairbnb/howdynash.git howdy[city]
   cd howdy[city]
   rm -rf .git
   git init
   ```
3. Create new GitHub repo: dcdcairbnb/howdy[city]
4. Update deploy.sh PROJECT_DIR and REPO_URL
5. Initial deploy via `./deploy.sh "initial commit"`
6. Connect Vercel to the new GitHub repo, attach domain

### Day 2: Curated data

This is the bulk of the work. Replace the Nashville-specific arrays in chatbot.html:

- `NASHVILLE_DATA.restaurants` → 40 city restaurants
- `NASHVILLE_DATA.attractions` → 20 attractions
- `CURATED_HONKY_TONKS` → city's signature nightlife (rename if needed: e.g. CURATED_DIVE_BARS for Austin)
- `CURATED_BROADWAY_BARS` → city's main bar strip
- `CURATED_ROOFTOPS`
- `CURATED_DISTILLERIES`
- `CURATED_PHOTO_SPOTS`
- `CURATED_FREE_THINGS` → 25 free city activities
- `CURATED_EAST_NASHVILLE_GEMS` → rename to local hipster neighborhood (e.g. East Austin)
- `CURATED_FAMILY_FRIENDLY` → 15 city family spots with lat/lng coords
- `CURATED_LINE_DANCING` → city's dance/nightlife venues
- `CURATED_NASHVILLE_FESTIVALS` → 30 city festivals
- `CURATED_COCKTAIL_BARS`
- `CURATED_SHOPPING`
- `CURATED_SPAS`
- `CURATED_NAIL_SALONS`

Source: TripAdvisor top 100, Eater city guides, local food blogs, r/[city], Yelp top-rated.

Don't trim the lists. The pin counts should match: hot chicken pin says "10 best", site has 12; honky tonks pin says "38", site has 40.

### Day 3: Backend setup

1. Create Vercel project from GitHub repo
2. Add Vercel Postgres (Neon) integration → adds POSTGRES_URL automatically
3. Add Upstash Redis → adds KV_REST_API_URL, KV_REST_API_TOKEN automatically
4. Set all env vars from the table above
5. Deploy

### Day 4: Email system

1. Sign up for Resend, add domain howdy[city].com
2. Add DNS records (Resend gives you exact ones for Namecheap)
3. Wait for verification (1-30 minutes)
4. Sign up for ImprovMX, add domain
5. Set MX records
6. Add `howdy` alias → your Gmail
7. Test: send email to howdy@howdy[city].com, confirm arrival in Gmail
8. Set up Gmail Send As (see "Third-party setup")
9. Generate API key in Resend, add to Vercel as RESEND_API_KEY

### Day 5: Cheat sheet PDF

1. Edit CHEATSHEET-COPY.md for the new city
2. Edit build_cheatsheet.py with city-specific text
3. Run: `python3 build_cheatsheet.py`
4. PDF lands in `public/cheatsheet.pdf` and root `cheatsheet.pdf`
5. Deploy

### Day 6: Pinterest, Instagram, TikTok, profile pics

1. Create @howdy[city] handles on each platform
2. Pinterest: claim domain via meta tag (already in chatbot.html template, just update content hash)
3. Generate logo.jpg for the new city (red circle with cowboy hat or local equivalent + city name)
4. Run pin generator with new city assets
5. Post first 3 pins, schedule the rest

### Day 7: Affiliate setup

1. Apply to Viator (instant approval)
2. Apply to GetYourGuide (instant)
3. Apply to Expedia Partner Solutions (1-3 days)
4. Apply to Awin (3-7 days, then Airbnb/Booking are inside)
5. Apply to CJ Affiliate (3-7 days, then Marriott/Hilton/Hertz)
6. Set partner IDs as Vercel env vars

### Day 8: Newsletter cron

1. Set CRON_SECRET env var: `openssl rand -hex 32`
2. Set ADMIN_TOKEN env var: `openssl rand -hex 32`
3. Confirm vercel.json has the cron block:
   ```json
   "crons": [{ "path": "/api/subscribe?cron=newsletter", "schedule": "0 14 * * 5" }]
   ```
4. Deploy
5. Verify in Vercel dashboard → Settings → Cron Jobs → newsletter scheduled

### Day 9: Test everything

- Hit /api/health → should return ok
- Open the chat, test each menu item
- Sign up with test email, confirm welcome email
- Start a group share, get code, join from another browser
- Manually trigger newsletter preview via curl
- Check Pinterest, Instagram, TikTok handles work
- Verify all affiliate links open in new tab to the correct platform

### Day 10: Launch

- Post first Pinterest pin (most consistent traffic source for travel)
- Post Instagram reel
- Post TikTok
- Send a personal email to 10 friends asking them to share
- Pitch first 5 local hotels for sponsored placement


## Newsletter content sources

The weekly newsletter (sent every Friday at 9am Central via Vercel Cron) pulls from three live data sources, merged and deduped:

1. **Curated festivals** (your hardcoded list) - top priority
2. **Visit [City] scraper** (the city tourism board's events) - secondary
3. **Ticketmaster + SeatGeek + Eventbrite** (live concert and event data) - fills gaps

Plus a separate "Restaurant Openings" section that scrapes:

4. **Eater [City] ATOM feed** (https://[city].eater.com/rss/index.xml) - filters titles for opening/debut/coming-soon language combined with food keywords

Note: Eater is an ATOM feed (uses `<entry>` tags), not RSS (`<item>`). Parser handles both formats.

If Eater [City] doesn't exist in your target city, swap to:
- The local alt-weekly's food section RSS (Nashville Scene, Austin Chronicle, etc.) - watch for rate-limit responses (429)
- Local newspaper food RSS (Tennessean, Statesman)
- Manual weekly curation (most reliable long-term)


## Vercel Cron schedule

In `vercel.json`:
```json
"crons": [
  { "path": "/api/subscribe?cron=newsletter", "schedule": "0 14 * * 5" }
]
```

This fires Friday 14:00 UTC = 9:00 AM Central Time (during standard time, 8am during daylight saving).

Authenticated by `CRON_SECRET` env var. Vercel passes `Authorization: Bearer CRON_SECRET` header automatically.

Hobby plan limit: 2 cron jobs/day max. We use 1.


## Manual newsletter trigger

Preview without sending:
```bash
curl -X POST https://www.howdy[city].com/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"action":"newsletter-preview"}' > preview.html
open preview.html
```

Send to all subscribers (requires ADMIN_TOKEN):
```bash
curl -X POST https://www.howdy[city].com/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"action":"newsletter-send","token":"YOUR_ADMIN_TOKEN"}'
```


## Group share architecture

User flow:
1. User taps `👯 Group share` on main menu
2. Picks duration (6, 12, or 24 hours)
3. Backend creates group code (4 letters), stores in Vercel KV with TTL
4. User shares code via SMS/email/clipboard/native share
5. Friends visit howdy[city].com/group/CODE, share location
6. Browser polls /api/group every 10 seconds for updates
7. Live Leaflet map renders all member pins with names
8. Each member can tap "walk to them" for Google Maps directions
9. Auto-expires when TTL hits

Storage: Each group is `~1KB` in Vercel KV. Free tier holds 200K simultaneous groups.

Time-based affiliate prompts fire during the session:
- Hour 1: Uber XL / Lyft for the group
- Hour 3: Rooftop suggestion + Viator tour link
- Hour 5: Late-night hot chicken card
- Hour 8: Pre-book brunch for tomorrow
- Post-session: Pedal tavern booking on Viator/GetYourGuide


## Email signature setup

After deploying logo.jpg to project root:

1. Open `email-signature.html` in browser
2. Select all inside the signature box
3. Copy
4. Gmail Settings → General → Signature
5. Paste, save

The signature pulls logo from `https://howdy[city].com/logo.jpg` so it loads in every email automatically.

Gmail Send As setup (so replies look professional from howdy@):
1. Settings → Accounts and Import → Send mail as → Add another email
2. Email: howdy@howdy[city].com
3. SMTP: smtp.resend.com, port 587, username `resend`, password = Resend API key
4. Verify via link sent to howdy@ (forwards via ImprovMX to your Gmail)
5. Set as default + reply from same address


## Common gotchas

1. **12 function limit on Vercel Hobby**: We're at 11. Adding any new endpoint requires combining with an existing one.

2. **Service worker caching**: Bump `CACHE_VERSION` in sw.js when shipping major changes. Otherwise users see stale code. We use semantic versions: howdynash-v3, etc.

3. **POST requests blocked by SW**: The service worker only handles GET. Don't try to cache POST responses (Cache API doesn't support it).

4. **Vercel function output dir**: If `/public` ever conflicts with Vercel auto-detection, set Output Directory to `./` in Settings → Build → Output Directory.

5. **Service worker on iOS**: Hard refresh doesn't always update SW. Use `navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))` in DevTools console to force.

6. **iOS Safari onclick issues**: Use `<button type="button" onclick="...">` not `<a href="#" onclick="...">`. The href="#" causes scroll-to-top before onclick fires.

7. **localStorage and PWA caching**: Saved state persists across SW updates. If you ever change a localStorage key, users lose data. Migrate gradually instead of renaming.

8. **Email from address**: Must be a verified domain in Resend or it bounces. Use howdy@howdy[city].com after Resend domain verification.

9. **Newsletter cron auth**: Vercel Cron passes Authorization: Bearer CRON_SECRET. Endpoint must check this exact header format.

10. **iStock placeholder photos**: Don't use 612px iStock photos. They're watermarked. Use Unsplash full-resolution instead, or licensed Shutterstock.


## Revenue paths (in priority order)

1. **Affiliate clicks** (every visitor) — Viator, GetYourGuide, Expedia, Awin, CJ
2. **Featured Airbnb host** (you or a paid partner) — already wired
3. **Sponsored hotel placement** — pitch local boutique hotels $200-500/month
4. **Email list monetization** — weekly newsletter with affiliate plugs
5. **Premium group sharing** — $4.99/group for 24h sessions, 20+ members
6. **Group recap photo book** — $9.99 post-session digital recap
7. **Trademark licensing** — once Howdy Nash is registered, license to other operators


## Tasks before launching a new city

- [ ] Buy domain
- [ ] Clone repo, rename, deploy
- [ ] Curated data (40 restaurants minimum)
- [ ] All env vars set
- [ ] Email verified (Resend + ImprovMX)
- [ ] Cheat sheet PDF
- [ ] Logo file
- [ ] Profile pics for socials
- [ ] First 10 Pinterest pins generated
- [ ] All social handles claimed
- [ ] Affiliate accounts approved
- [ ] Newsletter cron scheduled
- [ ] Test from incognito and 1 mobile device
- [ ] Trademark filed (optional but recommended)


## Where to update Howdy Nash branding to local city

Search and replace these strings (in this order):

1. `Nashville` → `[CityName]` (proper noun)
2. `nashville` → `[cityname]` (lowercase, in keys/IDs)
3. `Howdy Nash` → `Howdy [CityShort]` (e.g. Howdy Aus, Howdy Char)
4. `howdy nash` → `howdy [cityshort]` (lowercase brand)
5. `howdynash` → `howdy[cityshort]` (handles, URLs)
6. `howdynash.com` → `howdy[cityshort].com`
7. `howdy@howdynash.com` → `howdy@howdy[cityshort].com`

Be careful: don't rename localStorage keys or you'll log everyone out (not relevant for a fresh city, but matters if you migrate Nashville).


## Time and money budget

- Domain: $12
- Vercel: Free (Hobby)
- Resend: Free up to 3K emails/month
- Upstash KV: Free up to 10K commands/day
- Postgres (Neon via Vercel): Free up to 0.5GB
- Anthropic Claude Haiku: ~$2-10/month at low volume
- Google Places: Free up to $200/month credit, then ~$5/1000 calls
- Foursquare: Free
- Ticketmaster: Free
- SeatGeek: Free
- Eventbrite: Free
- Trademark: $250-350 per class (USPTO)

Total monthly cost at low traffic (under 1000 visits/day): about $20-50.

Total time to launch a new city: 30-50 hours over 1-2 weeks.
