// Google Places API (New). Geolocation-aware.
function haversineMiles(a, b) {
  if (!a || !b) return null;
  const R = 3958.8;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLng = (b.longitude - a.longitude) * Math.PI / 180;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  return Number((R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x))).toFixed(2));
}

export default async function handler(req, res) {
  if (!process.env.GOOGLE_PLACES_KEY) {
    return res.status(503).json({ error: 'GOOGLE_PLACES_KEY not configured' });
  }
  const { q = '', type = 'tourist_attraction', lat, lng } = req.query;

  try {
    const body = {
      textQuery: `${q} in Nashville, TN`,
      includedType: type,
      maxResultCount: 20
    };
    if (lat && lng) {
      body.locationBias = {
        circle: {
          center: { latitude: Number(lat), longitude: Number(lng) },
          radius: 16000
        }
      };
      body.rankPreference = 'DISTANCE';
    }

    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types,places.googleMapsUri,places.websiteUri,places.id'
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const userPos = (lat && lng) ? { latitude: Number(lat), longitude: Number(lng) } : null;
    const results = (data.places || []).map(p => ({
      id: p.id,
      name: p.displayName?.text,
      address: p.formattedAddress,
      rating: p.rating,
      reviewCount: p.userRatingCount,
      coords: p.location,
      distanceMiles: userPos && p.location ? haversineMiles(userPos, p.location) : null,
      types: p.types,
      mapsUrl: p.googleMapsUri,
      website: p.websiteUri
    }));

    if (lat && lng) {
      results.sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999));
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({
      source: 'google',
      sortedBy: (lat && lng) ? 'distance' : 'relevance',
      results
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
