# Howdy Nashville Evaluation

Honest assessment of the Nashville build. Use this to decide whether the model is worth replicating.

Last updated: April 2026

---

## What We Built

A conversational tourism chatbot for Nashville visitors with these features.

Chat interface with Claude Haiku 4.5 LLM for natural language Q&A.

Menu-driven navigation for fast common queries.

Real-time data from nine integrated services: Foursquare, Google Places, Ticketmaster, SeatGeek, Eventbrite, AviationStack, Anthropic, Weather.gov, Nashville Open Data.

Native deep links for Uber, Lyft, Waymo, DoorDash, Uber Eats.

Affiliate booking flows for Viator (8% commission), GetYourGuide (8%), Airbnb via Awin (5%), VRBO (4-5%), Booking.com via Awin (4%).

GPS-aware results that center on the user's location.

Mobile-first responsive design.

Free with no signup.

Production deployed at https://howdy-nashville.vercel.app

---

## Time Investment

Total active build time: roughly 2 days of focused work.

Phase 1 (UI and curated data): 4 hours.

Phase 2 (Vercel deployment and API integrations): 8 hours.

Phase 3 (LLM integration and bug fixes): 3 hours.

Phase 4 (Affiliate program signups and integration): 2 hours.

Phase 5 (Brand rename and infrastructure cleanup): 1 hour.

Documentation: 2 hours.

For a non-developer using AI assistance, this is fast. A traditional dev shop quote for the same scope would be $20,000 to $50,000 and 2 to 3 months.

---

## What Worked Well

### Architecture decisions

Single HTML file frontend. Faster to iterate than a multi-file React app. Zero build step. Deploy is just file upload.

Vercel serverless functions for API proxying. Keeps API keys server-side. Free tier handles the load.

Vercel auto-deploy from GitHub. Push to main, deploy in 60 seconds.

Multi-source API integration with deduplication. Foursquare plus Google Places gives broader coverage than either alone. Same for Ticketmaster plus SeatGeek plus Eventbrite for events.

Hybrid menu plus LLM routing. Menu buttons handle common queries instantly. Natural language falls through to Claude. Best of both worlds.

### Tooling decisions

GitHub CLI plus deploy.sh script. One command pushes everything. No clicking through the GitHub web UI.

Affiliate links over API integrations. Simpler to set up. No partnership approval needed for many programs. Same revenue.

Free APIs first, paid APIs only where necessary. Weather.gov, Nashville Open Data, Foursquare free tier covered most needs.

### Product decisions

Mobile-first. Tourists use phones. Designing for desktop first would have been a mistake.

No signup required. Lower friction. Higher conversion to first action.

Geolocation as enhancement, not requirement. App works without GPS. Better with it.

Disclaimer modal for legal coverage. Done once, applies forever.

---

## What Did Not Work

### Bugs that took multiple iterations

Back navigation. The original snapshot-based approach was fragile. Replaced with a menuStack pattern that worked first try after redesign. Lesson: when you see three failed fixes, redesign the approach.

Mobile header overlap. Two failed CSS fixes before identifying the real cause: the API status text was listing every connected service in the header subtitle, making it gigantic. The fix was a single-string status text, not CSS changes.

Keyword routing collisions. The matches function used substring matching. The word "weather" contained "eat" so the weather button triggered the restaurant menu. Same issue with "germantown" containing the substring used for the neighborhood handler. Fix was order-of-operations and natural language detection.

LLM model name. Initial code used a model name not available on the Anthropic account tier. Took three iterations: claude-haiku-4-5-20251001 (401 due to bad API key), claude-3-5-haiku-latest (404 model not available), claude-3-5-haiku-20241022 (404 deprecated for this account), final fix back to claude-haiku-4-5-20251001 once API key was correct. Lesson: 401 versus 404 errors mean different things. Read carefully.

### Pain points

Vercel project rename did not auto-update the production domain alias. Had to manually add howdy-nashville.vercel.app as a domain after renaming the project. Not documented well by Vercel.

GitHub web UI markdown auto-linking. Pasting code from chat into GitHub web editor inserted markdown auto-links into the code (e.g. `[e.id](http://e.id)`), breaking the JavaScript. Fix: always upload files via drag-drop, never paste code.

First-time git setup with existing GitHub repo. The "untracked working tree files" error is confusing. Updated deploy.sh handles this now.

### Limitations

LLM hallucinates facts. Pinewood Social was claimed to be in Midtown when it is actually in SoBro. Phase 2 (tool use) would fix this by having Claude call the real restaurant database instead of relying on training knowledge.

Booking.com on Awin requires manual approval. Application takes 1 to 5 business days. Cannot move fast on this revenue path.

Free affiliate tier limits. Awin requires per-merchant applications. Some merchants reject applications without traffic history.

---

## Key Lessons Learned

Lesson 1. AI hallucinations are a real product risk. The LLM giving wrong neighborhoods is a trust killer for users. Phase 2 tool use is not optional, it is required before serious traffic.

Lesson 2. Substring matching breaks at scale. When you have 50 keyword routes, words start colliding. Migrate to exact match plus natural language detection earlier.

Lesson 3. Mobile bugs are infrastructure bugs, not CSS bugs. Most "mobile looks broken" reports trace to viewport handling, scroll containers, or content sizing. The CSS is usually fine.

Lesson 4. Vercel pricing scales gracefully. Free tier carried us through the entire build. Even 10,000 monthly users would stay free.

Lesson 5. Affiliate revenue is a long game. Cookie windows are 30 days. Approval takes weeks. Payouts are 30 to 60 days after travel. First dollar takes months.

Lesson 6. Hotel partnerships are the real money path. White-label deals at $200 to $500 per month per hotel are higher leverage than affiliate clicks.

Lesson 7. Documentation matters. Six docs (this one plus five others) ensure the next city build takes 1 to 2 weeks instead of starting from scratch.

---

## What I Would Do Differently Next Time

Start with the LLM tool use architecture. Skip the keyword router collision phase entirely. Have Claude call APIs from day one.

Build the deploy script before writing any code. The web UI uploads cost hours of friction we never recovered.

Buy the domain before launch. Awin and other affiliate networks scrutinize your site. A vercel.app subdomain looks unserious.

Set up analytics on day one. We have no idea how many people have actually used the app. Without data, we cannot optimize.

Pitch hotels before launch. The B2B revenue path is the real opportunity. Should have been parallel with the build, not after.

---

## Production Readiness Score

Code quality: 7/10. Working but rough. Needs error handling improvements and tool use migration.

UX: 8/10. Mobile works. Conversation flows well. Visuals are clean.

Performance: 9/10. Fast. Mostly cached. Vercel CDN is solid.

Reliability: 7/10. Several APIs have free-tier rate limits. Needs monitoring.

Revenue infrastructure: 6/10. Affiliate tracking wired but Booking.com pending. No analytics yet.

Brand: 7/10. Howdy Nashville is a strong name. Logo and assets need professional design work.

Overall: ready for soft launch. Not ready for paid traffic acquisition until analytics and tool use are added.

---

## Recommended Next Steps Before Scaling

Step 1. Add Plausible analytics. $9/month. One day of work.

Step 2. Migrate to LLM tool use. Two days of work. Eliminates hallucinations.

Step 3. Buy howdynashville.com domain. $12/year. One hour.

Step 4. Pitch 10 Nashville hotels for white-label deals. Two weeks of outreach.

Step 5. Write three SEO blog posts. One week of writing. Drives organic traffic.

Step 6. Get to 100 daily active users before considering city expansion.

Step 7. Once Nashville generates $500/month in any combination of affiliate plus partnerships, replicate the model elsewhere.
