// Foursquare place details (new FSQ OS Places)
export default async function handler(req, res) {
  if (!process.env.FOURSQUARE_API_KEY) {
    return res.status(503).json({ error: 'FOURSQUARE_API_KEY not configured' });
  }
  const { id } = req.query;

  try {
    const url = new URL(`https://places-api.foursquare.com/places/${id}`);

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
        'X-Places-Api-Version': '2025-06-17',
        Accept: 'application/json'
      }
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.status(200).json({ source: 'foursquare', ...data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
