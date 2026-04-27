# Music City Retreat

Nashville tourism chatbot. Frontend HTML chat widget + Vercel serverless API backend pulling Foursquare, Google Places, Ticketmaster, and Nashville open data.

## Project structure

```
.
├── nashville-chatbot.html       Frontend chat widget
├── api/                         Vercel serverless functions
│   ├── health.js                GET /api/health
│   ├── restaurants/
│   │   ├── search.js            GET /api/restaurants/search
│   │   └── [id].js              GET /api/restaurants/:id
│   ├── places/
│   │   └── search.js            GET /api/places/search
│   ├── events.js                GET /api/events
│   └── nashville/
│       └── data.js              GET /api/nashville/data
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

## Get your API keys (free or free tier)

1. Foursquare Places: https://foursquare.com/developers (1,000 calls/day free)
2. Google Places API: https://console.cloud.google.com/apis/library/places.googleapis.com ($200/month free credit)
3. Ticketmaster Discovery: https://developer.ticketmaster.com (5,000 calls/day free)
4. Nashville Open Data: https://data.nashville.gov/profile/edit/developer_settings (free, app token optional)

Copy the keys somewhere safe. You'll paste them into Vercel.

## Deploy to Vercel (5 minutes)

### Option A: Deploy from GitHub (recommended)

1. Create a new GitHub repo and push these files.
2. Go to https://vercel.com/new and import the repo.
3. Vercel auto-detects the project. Click Deploy.
4. After first deploy, go to Project > Settings > Environment Variables and add:
   - FOURSQUARE_API_KEY
   - GOOGLE_PLACES_KEY
   - TICKETMASTER_KEY
   - NASHVILLE_APP_TOKEN (optional)
5. Redeploy to pick up the keys.

### Option B: Deploy from your computer

```bash
npm install
npx vercel login
npx vercel
# Follow prompts. First deploy creates the project.
npx vercel env add FOURSQUARE_API_KEY
npx vercel env add GOOGLE_PLACES_KEY
npx vercel env add TICKETMASTER_KEY
npx vercel env add NASHVILLE_APP_TOKEN
npx vercel --prod
```

Your live URL will be something like `https://music-city-retreat.vercel.app`.

## Local development

```bash
npm install
cp .env.example .env.local
# Paste your keys into .env.local
npx vercel dev
```

Open http://localhost:3000

## Custom domain

In Vercel: Project > Settings > Domains. Add your domain. Update DNS records as instructed. Free.

## API endpoints

- `GET /api/health` - check which services are configured
- `GET /api/restaurants/search?term=hot+chicken&limit=10` - Foursquare restaurant search
- `GET /api/restaurants/:id` - Foursquare place details
- `GET /api/places/search?q=museum&type=museum` - Google Places search
- `GET /api/events?keyword=country&classificationName=Music` - Ticketmaster events
- `GET /api/nashville/data?dataset=ABC123&limit=20` - Nashville open data

## Costs at typical scale

- Vercel Hobby: free (personal/non-commercial only)
- Vercel Pro: $20/month (required for commercial use)
- Foursquare Places: free up to 1,000 calls/day
- Google Places: free up to ~$200 in usage per month
- Ticketmaster: free up to 5,000 calls/day
- Nashville open data: free

Total to launch: $0-20/month.
