// Anthropic Claude chat endpoint. Uses Haiku for cost efficiency.
// Required env: ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a helpful Nashville tourism concierge embedded in the Music City Retreat chatbot. Help visitors plan their trip.

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { message, history = [] } = body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const messages = [];
  for (const turn of history.slice(-8)) {
    if (turn.role && turn.content) {
      messages.push({ role: turn.role, content: String(turn.content).slice(0, 1000) });
    }
  }
  messages.push({ role: 'user', content: message.slice(0, 2000) });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
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
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ error: 'claude api error', detail: errText });
    }

    const data = await r.json();
    const reply = data.content?.[0]?.text || '';
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      reply,
      model: data.model,
      stopReason: data.stop_reason,
      usage: data.usage
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
