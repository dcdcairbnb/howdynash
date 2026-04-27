// Foursquare Places API. Sign up: https://foursquare.com/developers
// Free tier: 1,000 calls/day
export default async function handler(req, res) {
  if (!process.env.FOURSQUARE_API_KEY) {
    return res.status(503).json({ error: 'FOURSQUARE_API_KEY not configured' });
  }

  const { term = 'restaurant', category = '13065', limit = 20, sort = 'RATING' } = req.query;

  try {
    const url = new URL('https://api.foursquare.com/v3/places/search');
    url.searchParams.set('near', 'Nashville, TN');
    if (term) url.searchParams.set('query', term);
    if (category) url.searchParams.set('categories', category);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('sort', sort);
    url.searchParams.set('fields', 'fsq_id,name,categories,location,geocodes,rating,price,tel,website,hours,photos,description,distance');

    const r = await fetch(url, {
      headers: {
        Authorization: process.env.FOURSQUARE_API_KEY,
        Accept: 'application/json'
      }
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const priceMap = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
    const results = (data.results || []).map(b => ({
      id: b.fsq_id,
      name: b.name,
      cuisine: (b.categories || []).map(c => c.name).join(', '),
      neighborhood: b.location?.neighborhood?.[0] || b.location?.locality || 'Nashville',
      address: b.location?.formatted_address || '',
      price: priceMap[b.price] || '',
      rating: b.rating ? (b.rating / 2).toFixed(1) : null,
      phone: b.tel,
      website: b.website,
      image: b.photos?.[0] ? `${b.photos[0].prefix}original${b.photos[0].suffix}` : null,
      coords: b.geocodes?.main,
      description: b.description,
      booking: {}
    }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({ source: 'foursquare', results, total: data.results?.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
