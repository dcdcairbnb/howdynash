# Next City Launch Playbook

Step-by-step guide for launching Howdy [City] in 1 to 2 weeks. Use this after the Nashville model is validated.

Last updated: April 2026

---

## Pre-Launch Checklist

Before you start building, verify these.

City selection criteria are met (see CITY_RECOMMENDATIONS.md).

Nashville is generating revenue or steady traffic.

You have $200 budget for: domain ($12), 1 month analytics ($9), Anthropic credits ($20), misc API upgrades if needed.

You have 20 to 40 hours of time over 1 to 2 weeks.

---

## Week 1: Build

### Day 1: Setup and curated data

Morning. Buy domain howdy[city].com or .app. $12.

Morning. Clone the howdy-nashville repo.

```bash
cd /Users/dan/Documents
git clone https://github.com/dcdcairbnb/howdy-nashville.git howdy-[city]
cd howdy-[city]
rm -rf .git
git init
```

Afternoon. Curate 40 restaurants for the new city.

Hand-pick from these categories: 5 iconic local must-tries, 5 hidden gems, 4 BBQ/regional, 4 fine dining, 4 brunch/breakfast, 4 ethnic cuisine, 4 bars/cocktails, 4 cheap eats, 3 vegetarian/vegan, 3 coffee/cafe.

Source: TripAdvisor top 100, Eater city guides, local food blogs, r/[city] threads.

Format each entry like the Nashville curated list (name, cuisine, neighborhood, price, vibe, phone, booking links).

End of day. Replace NASHVILLE_DATA.restaurants in the JS file with the new city's data.

### Day 2: Local data and content

Morning. Curate 8 to 12 attractions.

Curate 6 to 10 honky-tonk-equivalents (whatever the city's signature nightlife is).

Curate 4 to 6 photo spots and Instagram stops.

Curate 4 to 8 neighborhoods with brief descriptions.

Afternoon. Update tips array (10 to 15 local insider tips).

Update welcome message in the HTML and system prompt for Claude.

Update disclaimer text to swap city name.

Update title tag and meta tags.

### Day 3: API configuration

Morning. Sign up for city-specific data sources if available.

Most US cities have a Socrata-based open data portal. Replace NASHVILLE Open Data calls with the new city's portal API.

Update the geographic centroid (default lat/lng for the city).

Update Foursquare and Google Places search "near" parameter.

Update Ticketmaster and SeatGeek default city filter.

Afternoon. Update affiliate links to point to city-specific landing pages.

Viator: each major city has its own destination ID. Look up at viator.com.

GetYourGuide: same.

Booking.com: search URL format works with any city, just change "ss" parameter.

### Day 4: Vercel and GitHub setup

Morning. Create new GitHub repo "howdy-[city]". Push the new code.

Create new Vercel project. Import from GitHub. Use default settings.

Add all environment variables. Reuse the same API keys from Nashville (one Anthropic key, Foursquare key, Google key all work for any city).

Verify /api/health returns all true.

Afternoon. Test the live site end-to-end.

Click every menu button. Verify city-specific content loads.

Test on mobile.

Test the LLM with city-specific questions.

Test affiliate links open correct city pages.

### Day 5: Polish and bug fixes

Test every menu path on iPhone, Android, desktop.

Test geolocation flows.

Verify back button works from every menu.

Check for any leftover Nashville references in code or copy.

Validate SEO: title, meta description, social sharing tags.

Take screenshots for marketing.

---

## Week 2: Launch

### Day 6: Affiliate program updates

Update Awin Publisher ID to point to new city domain (or keep existing if same brand).

Update Viator and GetYourGuide partner ID context if you have city-specific tracking codes.

Apply to local affiliate programs unique to the new city (e.g., regional hotel chains).

### Day 7: Analytics and monitoring

Add Plausible or Google Analytics. Track: page views, button clicks, LLM messages sent, affiliate link clicks, geolocation grants.

Set up Vercel email alerts for deployment failures.

Bookmark all dashboard URLs (Vercel, GitHub, Awin, Viator, GetYourGuide, Anthropic, Plausible).

### Day 8: Soft launch

Share with 10 friends or family who travel.

Ask for honest feedback on three things: was it useful, was anything broken, would you tell a friend.

Fix anything they report.

### Day 9: Reddit and forums

Post in r/[city]: "Built a free chatbot for [city] visitors. Would love feedback."

Post in r/travel: "Free [city] tourist chatbot, no signup, no ads."

Engage with comments authentically. Do not spam.

### Day 10: Hotel partnership outreach

Cold email 10 boutique hotels in the new city. Use the template from MARKETING_PLAN.md.

Goal: 1 to 3 demo calls scheduled within 2 weeks.

### Day 11 to 14: SEO content

Write 3 blog posts targeting tourist search terms.

"First Time in [City]: What to Do"

"Best [Local Cuisine] in [City]"

"[City] for Bachelorettes/Bachelors"

Drop them as static pages on the site at /first-time-[city], /best-[cuisine], /[city]-bachelor.

---

## Cost Per City

Domain. $12 to $40 first year, $12 to $20 renewal.

API costs. $0 if reusing existing Anthropic, Foursquare, Google keys (recommended). $50 to $100 first month if you hit any tier limits.

Vercel. Free.

Curation time. 8 to 12 hours of your time.

Analytics. $9 per month for Plausible (or free for GA).

Total cash outlay per new city: under $100.

---

## Time Per City

After the first replication, expect:

Build time: 10 to 15 hours.

Marketing setup: 5 to 10 hours.

Total elapsed time: 1 to 2 weeks calendar.

---

## What Stays the Same Across Cities

Code architecture. Single HTML, Vercel functions, deploy.sh.

Free APIs. Foursquare, Google, Ticketmaster, SeatGeek, Eventbrite, Weather.gov, Anthropic, AviationStack.

Affiliate programs. Same Viator, GetYourGuide, Awin accounts work everywhere. Just different city pages.

Brand. Howdy [City] format, red header gradient.

Disclaimer. Just swap city name.

Tone. Friendly, Southern hospitality vibe (works for southeast US, less so for Northeast or West Coast).

---

## What Changes Per City

Curated restaurant list. 30 to 50 entries per city.

Curated event list. 8 to 12 attractions.

Neighborhood descriptions.

Tips and local insights.

Default lat/lng centroid.

City open data API endpoint.

Welcome message and system prompt.

Local cuisine emphasis (BBQ in Nashville, Tex-Mex in Austin, Cajun in NOLA, Lowcountry in Charleston).

Local nightlife (honky tonks in Nashville, dive bars in Austin, jazz clubs in NOLA, etc.).

---

## City-by-City Launch Schedule (Hypothetical)

Year 1, Month 1 to 2: Nashville (current).

Year 1, Month 3 to 4: City 2.

Year 1, Month 6: City 3 if first two are paying.

Year 1, Month 9: Cities 4 and 5 if traction confirmed.

Year 2: Scale to 10 cities if model works. Add team if needed.

Discipline: do not start city 2 until city 1 is generating $500/month minimum.

---

## Quality Gates Before Launching Each New City

Gate 1. Curated data approved.

Gate 2. Live site loads without errors.

Gate 3. /api/health returns all true.

Gate 4. Mobile and desktop tested.

Gate 5. LLM gives coherent city-specific answers.

Gate 6. Affiliate links tested and verified.

Gate 7. Analytics installed and tracking.

Gate 8. Domain pointed at Vercel.

Gate 9. Disclaimer reviewed for city-specific compliance.

Gate 10. At least 5 friends have tested and given thumbs up.

Do not promote until all 10 gates pass.

---

## After-Launch Maintenance

Weekly. Check Vercel logs for errors. Refresh curated data if anything has changed (closed restaurants, etc.).

Monthly. Review analytics. Identify top queries. Update content based on what users actually want.

Quarterly. Pitch new local hotels for partnerships. Review affiliate dashboards for top-converting links and double down.

Yearly. Renew domain. Refresh seasonal content (festivals, events, holidays).
