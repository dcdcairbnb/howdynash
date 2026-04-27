// Restaurant search combining Foursquare Places + Google Places (New)
// Foursquare gives wide coverage (50/req). Google adds rich data (20/req).
// We dedupe by normalized name + address.

const PRICE_MAP_FSQ = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
const PRICE_MAP_GOOGLE = {
  PRICE_LEVEL_FREE: '',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$'
};

async function searchFoursquare(term, category, limit) {
  if (!process.env.FOURSQUARE_API_KEY) return [];
  try {
    const url = new URL('https://places-api.foursquare.com/places/search');
    url.searchParams.set('near', 'Nashville, TN');
    if (term) url.searchParams.set('query', term);
    if (category) url.searchParams.set('fsq_category_ids', category);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('sort', 'RATING');

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
        'X-Places-Api-Version': '2025-06-17',
        Accept: 'application/json'
      }
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.results || []).map(b => ({
      id: 'fsq:' + (b.fsq_place_id || b.fsq_id),
      name: b.name,
      cuisine: (b.categories || []).map(c => c.name).join(', '),
      neighborhood: b.location?.neighborhood?.[0] || b.location?.locality || 'Nashville',
      address: b.location?.formatted_address || '',
      price: PRICE_MAP_FSQ[b.price] || '',
      rating: b.rating ? Number((b.rating / 2).toFixed(1)) : null,
      reviewCount: null,
      phone: b.tel || '',
      website: b.website || '',
      coords: (b.latitude && b.longitude) ? { latitude: b.latitude, longitude: b.longitude } : (b.geocodes?.main || null),
      description: b.description || '',
      sources: ['foursquare'],
      booking: {}
    }));
  } catch (e) {
    return [];
  }
}

async function searchGoogle(term) {
  if (!process.env.GOOGLE_PLACES_KEY) return [];
  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.location,places.types,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.primaryTypeDisplayName'
      },
      body: JSON.stringify({
        textQuery: `${term || 'restaurants'} in Nashville, TN`,
        includedType: 'restaurant',
        maxResultCount: 20
      })
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.places || []).map(p => ({
      id: 'google:' + p.id,
      name: p.displayName?.text || '',
      cuisine: p.primaryTypeDisplayName?.text || (p.types || []).filter(t => t !== 'point_of_interest' && t !== 'establishment').slice(0, 2).join(', '),
      neighborhood: 'Nashville',
      address: p.formattedAddress || '',
      price: PRICE_MAP_GOOGLE[p.priceLevel] || '',
      rating: p.rating ? Number(p.rating).toFixed(1) : null,
      reviewCount: p.userRatingCount || null,
      phone: p.nationalPhoneNumber || '',
      website: p.websiteUri || '',
      mapsUrl: p.googleMapsUri || '',
      coords: p.location || null,
      description: '',
      sources: ['google'],
      booking: {}
    }));
  } catch (e) {
    return [];
  }
}

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
}

function dedupe(combined) {
  const seen = new Map();
  for (const r of combined) {
    const key = normalize(r.name) + '|' + normalize(r.address.split(',')[0] || '');
    if (seen.has(key)) {
      const existing = seen.get(key);
      existing.sources = Array.from(new Set([...(existing.sources || []), ...(r.sources || [])]));
      if (!existing.rating && r.rating) existing.rating = r.rating;
      if (!existing.reviewCount && r.reviewCount) existing.reviewCount = r.reviewCount;
      if (!existing.phone && r.phone) existing.phone = r.phone;
      if (!existing.website && r.website) existing.website = r.website;
      if (!existing.mapsUrl && r.mapsUrl) existing.mapsUrl = r.mapsUrl;
      if (!existing.price && r.price) existing.price = r.price;
      if (!existing.description && r.description) existing.description = r.description;
    } else {
      seen.set(key, r);
    }
  }
  return Array.from(seen.values());
}

export default async function handler(req, res) {
  const { term = 'restaurant', category = '', limit = 50 } = req.query;

  try {
    const [fsq, google] = await Promise.all([
      searchFoursquare(term, category, limit),
      searchGoogle(term)
    ]);

    const combined = dedupe([...fsq, ...google]);

    combined.sort((a, b) => {
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      if (rb !== ra) return rb - ra;
      const ca = a.reviewCount || 0;
      const cb = b.reviewCount || 0;
      return cb - ca;
    });

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({
      source: 'combined',
      sources: { foursquare: fsq.length, google: google.length, deduped: combined.length },
      results: combined,
      total: combined.length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
