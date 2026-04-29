// Scrapes visitmusiccity.com upcoming events page.
// Extracts event cards, returns normalized JSON.

const SOURCE_URL = 'https://www.visitmusiccity.com/nashville-events/upcoming-events';
const BASE_URL = 'https://www.visitmusiccity.com';

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

// Parse a single event card HTML chunk into a normalized event object.
function parseCard(cardHtml) {
  // Title is typically in <h2> or <h3> with class containing 'title'
  const titleMatch = cardHtml.match(/<(?:h2|h3)[^>]*class="[^"]*(?:title|card__title)[^"]*"[^>]*>([\s\S]*?)<\/(?:h2|h3)>/i);
  const title = stripTags(titleMatch ? titleMatch[1] : '');

  // Date: class includes 'event-dates' or 'event-date'
  const dateMatch = cardHtml.match(/<[^>]*class="[^"]*event-dates?[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i);
  const date = stripTags(dateMatch ? dateMatch[1] : '');

  // Venue: class includes 'venue' or 'location'
  const venueMatch = cardHtml.match(/<[^>]*class="[^"]*(?:venue|location|address)[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i);
  const venue = stripTags(venueMatch ? venueMatch[1] : '');

  // Link: first <a href=>
  const linkMatch = cardHtml.match(/<a[^>]*href="([^"]+)"/i);
  let link = linkMatch ? linkMatch[1] : '';
  if (link && link.startsWith('/')) link = BASE_URL + link;

  // Image: first <img src=> or data-src
  const imgMatch = cardHtml.match(/<img[^>]*(?:data-src|src)="([^"]+)"/i);
  let image = imgMatch ? imgMatch[1] : '';
  if (image && image.startsWith('/')) image = BASE_URL + image;

  if (!title || !link) return null;
  return { name: title, date, venue, url: link, image, source: 'visitmusiccity' };
}

// Split full HTML into card chunks then parse each.
function extractEvents(html) {
  if (!html) return [];
  // The grid cards use class generic-card--grid. Each starts with an article or div.
  // Split on the start of each card by anchoring on the class.
  const cardRegex = /<article[^>]*class="[^"]*node-event[^"]*"[\s\S]*?<\/article>/gi;
  const matches = html.match(cardRegex) || [];
  const events = [];
  const seen = new Set();
  for (const card of matches) {
    const ev = parseCard(card);
    if (!ev) continue;
    const key = ev.name.toLowerCase().slice(0, 40) + '|' + ev.date.slice(0, 20);
    if (seen.has(key)) continue;
    seen.add(key);
    events.push(ev);
    if (events.length >= 40) break;
  }
  return events;
}

export default async function handler(req, res) {
  try {
    const r = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent': 'HowdyNash/1.0 (+https://howdynash.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: 'visitmusiccity fetch failed', events: [] });
    }
    const html = await r.text();
    const events = extractEvents(html);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    res.status(200).json({
      source: 'visitmusiccity',
      url: SOURCE_URL,
      total: events.length,
      events
    });
  } catch (e) {
    console.error('visitmusiccity scrape error', e.message);
    res.status(500).json({ error: e.message, events: [] });
  }
}
