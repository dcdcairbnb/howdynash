# Launching Howdy Nash in a new city

The codebase is structured so a new city = a new repo deployment to a new domain. Each city has its own iOS app, brand, and content. This guide walks through what to swap.

## Mental model

City-specific content lives in three places:
1. `city-config.js` — all city constants (name, brand, colors, airport, sports teams)
2. `city-data.js` — all curated spots (restaurants, neighborhoods, attractions, etc.)
3. `api/chat.js` — the AI concierge system prompt that mentions city landmarks
4. Brand assets — logo, splash screen, social graphics, app icon

Everything else (chatbot UI, group sharing, restaurant pagination, neighborhood explorer, API integrations, Capacitor wrapper, PWA setup, group sharing API) is reusable as-is.

## Steps

### 1. Fork the repo
```
git clone https://github.com/dcdcairbnb/howdynash.git howdyatx
cd howdyatx
git remote set-url origin https://github.com/YOUR_USER/howdyatx.git
```

### 2. Update city-config.js
Edit every value in `city-config.js`. For Austin:
- cityName: 'Austin'
- cityShortName: 'ATX'
- state: 'TX'
- brandName: 'Howdy ATX'
- domain: 'howdyatx.com'
- airportCode: 'AUS'
- centerLat / centerLng: Austin coordinates
- sportsTeams: ['Longhorns', 'F.C.']
- signatureFoods: ['BBQ', 'breakfast tacos', 'queso']
- signatureExperiences: ['live music on Sixth Street', 'Lady Bird Lake']

### 3. Replace city-data.js
This is the bulk of the work. Curate ~200 local spots:
- Restaurants (50-100)
- Bars and live music venues (30-50)
- Neighborhoods (8-12)
- Attractions (20-30)
- Festivals (10-20)
- Photo spots (10-15)
- Shopping (15-25)

### 4. Update api/chat.js
Find the SYSTEM_PROMPT constant. Replace Nashville-specific landmark names (Husk, Hattie B's, Ryman, etc.) with the new city's landmarks. Replace all instances of "Nashville", "Music City" with the new city.

### 5. Generate new brand assets
Use the same Python scripts in /tmp/ that we used for Nashville:
- App icon (1024x1024)
- Splash screen (2732x2732)
- Open Graph image (1200x630)
- Social media graphics (square, vertical, FB cover, Twitter, LinkedIn)

Save to /Users/USER/Documents/howdyatx-ios/brand-assets/

### 6. Update PWA files
- manifest.json: change name, short_name, description, theme_color
- /logo.jpg: replace with new app icon
- /logo.png: replace with new app icon
- /sw.js: bump CACHE_VERSION to start fresh

### 7. Update SEO files
- guide.html: rewrite for new city
- sitemap.xml: update URLs
- robots.txt: update if needed
- Add new domain to Google Search Console and Bing Webmaster Tools

### 8. Buy the domain
- Namecheap: howdyatx.com
- Connect to Vercel via DNS

### 9. Deploy to Vercel
Create a new Vercel project pointed at the new repo. Set environment variables:
- ANTHROPIC_API_KEY (can reuse the same key)
- KV_REST_API_URL and KV_REST_API_TOKEN (separate Redis instance per city is cleaner)
- RESEND_API_KEY (can reuse, but use a new from-email like howdy@howdyatx.com)
- DAILY_BUDGET_USD
- Other API keys (Google Places, Foursquare, Ticketmaster, SeatGeek)

### 10. iOS app
- Clone howdynash-ios to howdyatx-ios
- Update capacitor.config.json (server URL, appId, appName)
- Update Info.plist (CFBundleDisplayName, permission strings)
- Drop new app icon into Assets.xcassets
- Drop new splash into Splash.imageset
- Run `npx cap sync ios`
- Archive and upload to App Store Connect as a new app

### 11. App Store listing
- New app name: "Howdy ATX: Austin Guide"
- New keywords (austin, atx, sxsw, etc.)
- New screenshots from the simulator
- Same privacy policy URL pattern (howdyatx.com/privacy.html)

## Effort estimate per city

- Code/config refactor: 30 minutes (mostly find/replace)
- Brand assets: 1 hour (re-run generators)
- Content curation: 8-20 hours (the actual work, depends on how many spots you research)
- Deployment + iOS submission: 2 hours
- App Store review wait: 1-7 days (per Apple)

Total active work per new city: ~12-25 hours. Most of that is content curation.

## What gets shared between cities

Reuse the same:
- Anthropic API key (they bill per city via the daily budget tracker)
- Backend code (all of /api)
- UI/UX patterns
- App Store developer account
- Apple Developer Program membership ($99/year covers all your apps)
- Vercel account (one Hobby account can host multiple projects)

What needs to be separate per city:
- Domain
- Vercel project
- iOS app submission
- Redis instance (recommended)
- Google Search Console property
