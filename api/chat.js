// Anthropic Claude chat endpoint. Uses Haiku for cost efficiency.
// Required env: ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a helpful Nashville tourism concierge embedded in the Howdy Nash chatbot. Help visitors plan their trip.

YOUR ROLE
- Answer questions about Nashville: restaurants, music venues, events, neighborhoods, transportation, attractions, weather, local customs.
- Be friendly but concise. Use short paragraphs. Avoid excessive lists.
- When recommending specific places, prefer well-known Nashville spots (Husk, Hattie B's, Pinewood Social, Ryman Auditorium, Bluebird Cafe, Grand Ole Opry, Country Music Hall of Fame, Patterson House, etc.).
- If a user asks about live music, tell them about Broadway honky tonks, Bluebird Cafe songwriter rounds, the Ryman, Exit/In, and 3rd and Lindsley.
- For neighborhoods: Downtown/Broadway is touristy nightlife, The Gulch is upscale modern, East Nashville is hip and indie, 12 South is trendy shopping, Germantown is historic and food-focused, Midtown is between downtown and Vanderbilt.

TONE
- Conversational, warm, knowledgeable. Like a Nashville local friend.
- No emojis unless the user uses them first.
- No marketing fluff. No "exciting" or "vibrant" filler words.

REDIRECTING TO MENUS
If the user wants to do something the chatbot UI handles directly, tell them which menu button to tap. The available menu paths are:
- Eat & Drink: Show all restaurants, Best hot chicken, Order delivery, Honky tonks, Rooftop bars, Distilleries
- Things to Do: Live music tonight, Festivals, Things to do, Book a tour, Photo spots, Bachelorette
- Stay & Get Around: Hotels nearby, Vacation rentals, Get a ride, Gas stations, BNA flight tracker
- Essentials: Liquor stores, Groceries, Pharmacy, ATMs
- Main menu also has: Weather, Local tips
- Bottom of every screen: Uber, Lyft, Waymo, DoorDash, Uber Eats deep links.

FORMAT RULES
- Keep responses under 150 words unless the user asks for more detail.
- Use plain text, no markdown headers.
- Phone numbers and addresses are fine to share when known.
- Never invent prices, hours, or reservation availability. If you don't know, say "call to confirm" or "check their website."`;

// Simple in-memory rate limiter. Resets when function instance recycles.
const rateLimitStore = new Map();
const RATE_LIMIT_PER_HOUR = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { windowStart: now, count: 1 });
    return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - 1 };
  }
  if (record.count >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, remaining: 0, retryMs: RATE_LIMIT_WINDOW_MS - (now - record.windowStart) };
  }
  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - record.count };
}

async function fetchWithTimeout(url, options, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'chat service not configured' });
  }

  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    res.setHeader('Retry-After', Math.ceil(rateCheck.retryMs / 1000));
    return res.status(429).json({ error: 'too many messages. try again in an hour.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { message, history = [] } = body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'message too long' });
  }

  const messages = [];
  for (const turn of history.slice(-8)) {
    if (turn.role && turn.content) {
      messages.push({ role: turn.role, content: String(turn.content).slice(0, 1000) });
    }
  }
  messages.push({ role: 'user', content: message.slice(0, 2000) });

  try {
    const r = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages
      })
    }, 15000);

    if (!r.ok) {
      const errText = await r.text();
      console.error('claude api error', r.status, errText);
      return res.status(r.status).json({ error: 'chat service error' });
    }

    const data = await r.json();
    const reply = data.content?.[0]?.text || '';
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-RateLimit-Remaining', String(rateCheck.remaining));
    res.status(200).json({
      reply,
      stopReason: data.stop_reason
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      console.error('claude api timeout');
      return res.status(504).json({ error: 'chat service timed out' });
    }
    console.error('chat handler error', e.message);
    res.status(500).json({ error: 'chat service error' });
  }
}
