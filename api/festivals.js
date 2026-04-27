// Festivals: Ticketmaster + Nashville Open Data special events.
// Uses geolocation when provided.

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

async function fetchTicketmasterFestivals(lat, lng) {
  if (!process.env.TICKETMASTER_KEY) return [];
  try {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    url.searchParams.set('apikey', process.env.TICKETMASTER_KEY);
    url.searchParams.set('classificationName', 'Festival');
    url.searchParams.set('size', '20');
    if (lat && lng) {
      url.searchParams.set('latlong', `${lat},${lng}`);
      url.searchParams.set('radius', '50');
      url.searchParams.set('unit', 'miles');
      url.searchParams.set('sort', 'distance,asc');
    } else {
      url.searchParams.set('city', 'Nashville');
      url.searchParams.set('stateCode', 'TN');
      url.searchParams.set('sort', 'date,asc');
    }

    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    const userPos = (lat && lng) ? { latitude: Number(lat), longitude: Number(lng) } : null;
    return (data._embedded?.events || []).map(e => {
      const venue = e._embedded?.venues?.[0];
      const venueCoords = venue?.location ? {
        latitude: Number(venue.location.latitude),
        longitude: Number(venue.location.longitude)
      } : null;
      return {
        id: 'tm:' + e.id,
        name: e.name,
        date: e.dates?.start?.localDate,
        time: e.dates?.start?.localTime,
        venue: venue?.name,
        address: venue?.address?.line1,
        coords: venueCoords,
        distanceMiles: userPos && venueCoords ? haversineMiles(userPos, venueCoords) : null,
        url: e.url,
        image: e.images?.[0]?.url,
        genre: e.classifications?.[0]?.genre?.name,
        priceMin: e.priceRanges?.[0]?.min,
        priceMax: e.priceRanges?.[0]?.max,
        source: 'ticketmaster'
      };
    });
  } catch (e) {
    return [];
  }
}

async function fetchNashvilleSpecialEvents() {
  try {
    const url = new URL('https://data.nashville.gov/resource/cdmh-mfwx.json');
    url.searchParams.set('$limit', '50');
    const today = new Date().toISOString().split('T')[0];
    url.searchParams.set('$where', `event_start_date >= '${today}'`);
    url.searchParams.set('$order', 'event_start_date ASC');

    const headers = {};
    if (process.env.NASHVILLE_APP_TOKEN) {
      headers['X-App-Token'] = process.env.NASHVILLE_APP_TOKEN;
    }

    const r = await fetch(url, { headers });
    if (!r.ok) return [];
    const data = await r.json();
    return (data || []).map(e => ({
      id: 'nash:' + (e.permit_number || e.event_name),
      name: e.event_name || e.name_of_event || 'Special Event',
      date: e.event_start_date ? e.event_start_date.split('T')[0] : null,
      time: e.event_start_time,
      venue: e.event_location || e.venue,
      address: e.event_location_address || e.address,
      coords: null,
      distanceMiles: null,
      url: null,
      image: null,
      genre: e.event_type || 'Special Event',
      source: 'nashville-open-data'
    }));
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  const { lat, lng } = req.query;

  try {
    const [tm, nash] = await Promise.all([
      fetchTicketmasterFestivals(lat, lng),
      fetchNashvilleSpecialEvents()
    ]);

    let combined = [...tm, ...nash];

    if (lat && lng) {
      combined.sort((a, b) => {
        const da = a.distanceMiles ?? 9999;
        const db = b.distanceMiles ?? 9999;
        return da - db;
      });
    } else {
      combined.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      });
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.status(200).json({
      source: 'combined',
      sources: { ticketmaster: tm.length, nashville: nash.length },
      sortedBy: (lat && lng) ? 'distance' : 'date',
      festivals: combined,
      total: combined.length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
