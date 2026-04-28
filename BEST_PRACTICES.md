# Best Practices for Building Howdy [City] Apps

Patterns that worked for Nashville and should be replicated for every future city build.

Last updated: April 2026

---

## Architecture Principles

Single HTML file frontend. No React. No build step. Faster to iterate, faster to deploy, easier to debug. The whole app is one file.

Vercel serverless functions for API proxying. Every external API call goes through /api/* endpoints. Keeps API keys server-side. Lets you add caching at the edge.

Multi-source data with deduplication. Never rely on a single API for any feature. Combine 2 to 3 sources, dedupe by normalized name plus location, surface the merged result.

Free APIs first. Paid APIs only after free tier exhausted. Weather.gov, Foursquare free tier, Nashville Open Data, Ticketmaster all free.

Hybrid menu plus LLM routing. Menu buttons for fast common actions. LLM for natural language. Detect natural language with question words plus minimum word count.

Geolocation as enhancement, not requirement. Default behavior works without GPS. Better behavior with it.

---

## Code Patterns to Copy

### Multi-source API endpoint pattern

```javascript
async function fetchSource1(...) { /* ... */ return []; }
async function fetchSource2(...) { /* ... */ return []; }

function dedupe(items) {
  const seen = new Map();
  for (const item of items) {
    const key = normalize(item.name) + '|' + normalize(item.location);
    if (!seen.has(key)) {
      seen.set(key, item);
    } else {
      const existing = seen.get(key);
      // Merge missing fields from duplicate
    }
  }
  return Array.from(seen.values());
}

export default async function handler(req, res) {
  const [a, b] = await Promise.all([fetchSource1(...), fetchSource2(...)]);
  const merged = dedupe([...a, ...b]);
  res.json({ results: merged });
}
```

### Geolocation-aware endpoint pattern

```javascript
const { lat, lng } = req.query;
if (lat && lng) {
  // Use distance-sorted query
} else {
  // Use city-default query
}
```

### Hybrid keyword plus LLM router pattern

```javascript
function routeIntent(text) {
  if (isFollowUp(text)) return askLLM(text);
  if (isNaturalLanguageQuery(text)) return askLLM(text);
  // Then keyword matches in priority order
  if (matches(lower, ['weather', 'forecast'])) return showWeather();
  // ...
}
```

### Awin affiliate URL pattern

```javascript
function buildPartnerUrl(merchantId, destinationUrl) {
  if (!AWIN_PUBLISHER_ID) return destinationUrl;
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${AWIN_PUBLISHER_ID}&clickref=&p=${encodeURIComponent(destinationUrl)}`;
}
```

### Native app deep linking pattern

```javascript
function rideClick(provider, destination) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const appUrl = `${provider}://route?destination=${encodeURIComponent(destination)}`;
  const webUrl = `https://${provider}.com/?dropoff=${encodeURIComponent(destination)}`;
  if (isMobile) {
    window.location.href = appUrl;
    setTimeout(() => window.location.href = webUrl, 2000);
  } else {
    window.open(webUrl, '_blank');
  }
}
```

---

## API Integration Best Practices

### Free APIs to integrate every time

Weather.gov. No key needed. US locations only. Two-step flow: /points/{lat},{lng} returns forecast URL.

Foursquare Places. Free tier 1000 requests per day. Sign up gets API key in 5 minutes.

Google Places (New). $200 monthly free credit. Sign up takes 15 minutes including API key restrictions setup.

Nashville Open Data (or city equivalent). Most major US cities have Socrata-based open data portals. Free.

### Paid APIs worth their cost

Anthropic Claude Haiku. Very cheap at scale. Only $1.20 per 1000 conversations.

AviationStack. Free tier 100 requests per month. Cheapest paid is $9.99 for 10k.

### Free APIs that look free but require approval

Ticketmaster. Free signup. Approval can take 1 to 3 days for production use.

SeatGeek. Free signup. Usually instant.

Eventbrite. Free token but search API access is restricted for new accounts.

Bandsintown. Public API requires application.

### Avoid these APIs

Yelp Fusion. Removed free tier in 2024. $229/month minimum. Use Foursquare instead.

Songkick. Closed to new partners.

Direct hotel booking APIs (Booking.com Demand, Expedia Rapid). Enterprise-only.

---

## UI/UX Best Practices

Mobile-first sizing. Build for 375px viewport, scale up. Test on iPhone Safari first.

Big tap targets. Minimum 44x44px per Apple HIG. Buttons should be obvious, not subtle.

Lock body scroll on mobile. Inner scroll containers handle the chat. Body itself never scrolls. Prevents header overlap bugs.

Safe area insets. Use env(safe-area-inset-top) and env(safe-area-inset-bottom) for iOS notch and home indicator.

Hard refresh after deploys. Vercel CDN can cache aggressively. Tell users to hard refresh if they see stale content.

Avoid markdown rendering in chat bubbles. The LLM sometimes returns asterisks for bold which look broken if not rendered. Either render markdown or instruct the LLM to use plain text.

---

## LLM Best Practices

Keep system prompts focused. Tell Claude what city, what role, what tone, what to NOT make up.

Pass conversation history. Last 8 to 16 turns. Truncate user messages to 2000 chars and assistant messages to 1000 chars to stay within token budget.

Detect follow-ups before keyword matching. Pronouns and short messages should route to the LLM, not get caught by keyword routes.

Use Haiku for chat. Sonnet is overkill for tourism Q&A. Opus is way overkill.

Set max_tokens to 600. Long responses overwhelm chat UIs. Force conciseness.

Tell the LLM about menu paths. So it can redirect users to faster UI options when applicable.

Tell the LLM to never invent facts. Hours, prices, availability change. The LLM should say "call to confirm" rather than guess.

---

## Deployment Best Practices

Use deploy.sh from day one. Web UI uploads waste hours.

Test on the deployed URL, not localhost. Vercel's environment differs subtly from local.

Verify /api/health after every deploy. One curl call confirms all services connected.

Hard refresh after every deploy when testing. Vercel CDN caches.

Watch Vercel logs for new errors after deploy. The Logs tab shows function invocations and errors in real time.

Use semantic commit messages. "fix mobile header overlap" beats "update".

---

## Affiliate Best Practices

Sign up for Awin first. It is the gateway to many merchants (Booking.com, Airbnb, hotels, etc).

Apply to merchants the day your site is live. Not before (they reject empty sites) and not weeks later (delays revenue).

Use Awin's deep link generator at first. Once you have a few links working, copy the pattern into code.

Verify tracking with self-clicks. Click your own affiliate link from a different browser. Awin shows the click in dashboard within 60 minutes. If no click registered, your URL is wrong.

Submit tax forms (W-9 for US persons) immediately. No payouts until you submit.

Take the lowest payout threshold available. $50 versus $500 means you see your first dollar much sooner.

Keep dashboard URLs bookmarked. Each affiliate has a different login URL. Saves time.

---

## Common Pitfalls to Avoid

Pitfall 1. Pasting code from chat into GitHub web editor. Markdown auto-linking corrupts the code. Always upload files via drag-drop or use deploy.sh.

Pitfall 2. Substring keyword matching. "weather" contains "eat", "germantown" contains "toggle word". Use exact match or word-boundary regex.

Pitfall 3. Trusting LLM facts. Hallucination is real. Pin facts to API data via tool use.

Pitfall 4. Skipping analytics. You cannot improve what you cannot measure. Add Plausible or GA on day one.

Pitfall 5. Building in stealth. Pitch hotels and partners while you build. The 4 to 8 weeks of cold outreach overlap with development time.

Pitfall 6. Saving brand work for later. Domain, social handles, logo. Buy and claim early. Cybersquatters watch successful Vercel projects.

Pitfall 7. Ignoring affiliate tax forms. No W-9, no payout. Set this up day one.

Pitfall 8. Renaming Vercel projects without updating domains. The rename does not auto-update the production domain. Manually add the new vercel.app domain.

Pitfall 9. Not closing old Terminal windows after folder rename. They point to a path that no longer exists. Open fresh Terminal sessions.

Pitfall 10. Trying to use Vercel API for renames. The web UI is faster and clearer for one-off changes.

Pitfall 11. Wrong destination IDs for affiliate URLs. GetYourGuide Nashville is l1149, not l3231 (which is Kuta, Bali). Viator Nashville is d22290. Verify every destination ID by opening the URL in a browser before committing. Each new city build must verify its own IDs.

---

## Curated Data Quality Standards

For every city, the curated restaurant list should have these fields per entry.

Name, cuisine type, neighborhood, price tier ($-$$$$), vibe description, phone, booking platform links (OpenTable, Resy, Tock), Yelp page, walk-in flag, special notes.

Each city gets 30 to 50 hand-picked restaurants covering: hot/famous spots, hidden gems, all major cuisine categories, all major price tiers, all main neighborhoods.

Same standards apply to events, attractions, neighborhoods, tips.

Curated data is the moat. Anyone can plug in APIs. Hand-crafted local insight is what makes the app feel like a friend, not a search engine.

---

## Brand Standards Across Cities

Use the "Howdy [City]" format for every city. Consistent brand, easy to expand.

Header colors: red gradient (#d62828 to #f77f00). Same across all cities.

Avatar: relevant emoji per city. Nashville is a guitar 🎸. New Orleans could be a saxophone or fleur-de-lis.

Welcome message format: "Howdy. I'm your [City] guide. [City highlights]. What sounds good?"

Disclaimer language: same legal text, just swap city name.

System prompt: same structure, swap local knowledge per city.

---

## Cost Discipline

Free tier first. Always.

Hobby Vercel plan covers up to 100k function invocations per month and 100 GB bandwidth. That is roughly 5,000 to 10,000 daily users on a tourism app.

Skip Pro plans until traffic justifies them. The features you need (deploy hooks, env vars, custom domains) are all on Hobby.

Anthropic credits last. $20 covers 16,000 conversations.

Affiliate signup is free. Never pay to apply to a program. Real programs do not charge fees.

If you cannot keep monthly costs under $50, you have not been disciplined enough.

---

## Documentation Discipline

Update SETUP_GUIDE.md every time you add an integration. The next person (or next-month-you) will thank you.

Update EVALUATION.md after each major milestone. Track what worked, what did not.

Keep a CHANGELOG even if informal. Date plus one-line summary.

Document affiliate IDs. Lose them and lose the revenue trail.

Comment unusual code. Future you will not remember why you put that flex-shrink: 0.

---

## When to Replicate vs Pivot

Replicate the model to a new city if:

Nashville has 100+ daily active users.

Nashville generates $500+ per month in any revenue stream.

The hand-curated data approach is producing better engagement than pure API responses.

Pivot the model if:

Traffic is below 100 monthly users after 90 days of marketing.

Affiliate conversion rate is below 1%.

LLM hallucination is causing user complaints.

Hotels reject the white-label pitch.

Walk away if:

You have spent $1000 and earned nothing in 6 months.

You stopped enjoying the work.

A better opportunity surfaces.
