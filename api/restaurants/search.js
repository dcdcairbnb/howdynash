// Foursquare Places API (new FSQ OS Places). Sign up: https://foursquare.com/developers
// Free tier: 1,000 calls/day
export default async function handler(req, res) {
  if (!process.env.FOURSQUARE_API_KEY) {
    return res.status(503).json({ error: 'FOURSQUARE_API_KEY not configured' });
  }

  const { term = 'restaurant', category = '', limit = 20, sort = 'RATING' } = req.query;

  try {
    const url = new URL('https://places-api.foursquare.com/places/search');
    url.searchParams.set('near', 'Nashville, TN');
    if (term) url.searchParams.set('query', term);
    if (category) url.searchParams.set('fsq_category_ids', category);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('sort', sort);

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
        'X-Places-Api-Version': '2025-06-17',
        Accept: 'application/json'
      }
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const priceMap = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
    const results = (data.results || []).map(b => ({
      id: b.fsq_place_id || b.fsq_id,
      name: b.name,
      cuisine: (b.categories || []).map(c => c.name).join(', '),
      neighborhood: b.location?.neighborhood?.[0] || b.location?.locality || 'Nashville',
      address: b.location?.formatted_address || '',
      price: priceMap[b.price] || '',
      rating: b.rating ? (b.rating / 2).toFixed(1) : null,
      phone: b.tel,
      website: b.website,
      coords: b.latitude && b.longitude ? { latitude: b.latitude, longitude: b.longitude } : (b.geocodes?.main || null),
      description: b.description,
      booking: {}
    }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({ source: 'foursquare', results, total: data.results?.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
