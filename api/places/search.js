// Google Places API (New). Sign up: https://console.cloud.google.com/apis/library/places.googleapis.com
export default async function handler(req, res) {
  if (!process.env.GOOGLE_PLACES_KEY) {
    return res.status(503).json({ error: 'GOOGLE_PLACES_KEY not configured' });
  }
  const { q = '', type = 'tourist_attraction' } = req.query;

  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types,places.googleMapsUri,places.websiteUri,places.id'
      },
      body: JSON.stringify({
        textQuery: `${q} in Nashville, TN`,
        includedType: type,
        maxResultCount: 20
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const results = (data.places || []).map(p => ({
      id: p.id,
      name: p.displayName?.text,
      address: p.formattedAddress,
      rating: p.rating,
      reviewCount: p.userRatingCount,
      coords: p.location,
      types: p.types,
      mapsUrl: p.googleMapsUri,
      website: p.websiteUri
    }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({ source: 'google', results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
