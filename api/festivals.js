// Festivals: Ticketmaster (multiple categories) + Nashville Open Data special events.
// Pulls events from now through 90 days out, sorted by date or distance.

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

function isoDate(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('.')[0] + 'Z';
}

async function fetchTicketmasterFestivals(lat, lng, classificationName) {
  if (!process.env.TICKETMASTER_KEY) return [];
  try {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    url.searchParams.set('apikey', process.env.TICKETMASTER_KEY);
    if (classificationName) {
      url.searchParams.set('classificationName', classificationName);
    }
    url.searchParams.set('size', '40');
    url.searchParams.set('startDateTime', isoDate(0));
    url.searchParams.set('endDateTime', isoDate(90));

    if (lat && lng) {
      url.searchParams.set('latlong', `${lat},${lng}`);
      url.searchParams.set('radius', '50');
      url.searchParams.set('unit', 'miles');
      url.searchParams.set('sort', 'date,asc');
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
        genre: e.classifications?.[0]?.genre?.name || classificationName || 'Event',
        priceMin: e.priceRanges?.[0]?.min,
        priceMax: e.priceRanges?.[0]?.max,
        source: 'ticketmaster'
      };
    });
  } catch (e) {
    return [];
  }
}

async function fetchEventbriteFestivals(lat, lng) {
  if (!process.env.EVENTBRITE_PRIVATE_TOKEN) return [];
  try {
    const url = new URL('https://www.eventbriteapi.com/v3/events/search/');
    if (lat && lng) {
      url.searchParams.set('location.latitude', String(lat));
      url.searchParams.set('location.longitude', String(lng));
      url.searchParams.set('location.within', '50mi');
    } else {
      url.searchParams.set('location.address', 'Nashville, TN');
      url.searchParams.set('location.within', '50mi');
    }
    url.searchParams.set('q', 'festival OR fest OR street fair OR market OR celebration');
    url.searchParams.set('expand', 'venue');
    url.searchParams.set('sort_by', 'date');
    url.searchParams.set('start_date.range_start', new Date().toISOString().split('.')[0] + 'Z');
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);
    url.searchParams.set('start_date.range_end', ninetyDays.toISOString().split('.')[0] + 'Z');

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.EVENTBRITE_PRIVATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!r.ok) return [];
    const data = await r.json();
    const userPos = (lat && lng) ? { latitude: Number(lat), longitude: Number(lng) } : null;
    return (data.events || []).map(e => {
      const venue = e.venue;
      const venueCoords = (venue?.latitude && venue?.longitude) ? {
        latitude: Number(venue.latitude),
        longitude: Number(venue.longitude)
      } : null;
      const start = e.start?.local || '';
      return {
        id: 'eb:' + e.id,
        name: e.name?.text || 'Event',
        date: start ? start.split('T')[0] : null,
        time: start ? start.split('T')[1]?.slice(0, 5) : null,
        venue: venue?.name || '',
        address: venue?.address?.localized_address_display || '',
        coords: venueCoords,
        distanceMiles: userPos && venueCoords ? haversineMiles(userPos, venueCoords) : null,
        url: e.url,
        image: e.logo?.url,
        genre: e.category?.name || 'Festival',
        priceMin: null,
        priceMax: null,
        source: 'eventbrite'
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
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);
    const futureLimit = ninetyDays.toISOString().split('T')[0];
    url.searchParams.set('$where', `event_start_date >= '${today}' AND event_start_date <= '${futureLimit}'`);
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

function dedupe(items) {
  const seen = new Map();
  for (const it of items) {
    const key = `${(it.name || '').toLowerCase().slice(0, 30)}|${it.date || ''}`;
    if (!seen.has(key)) seen.set(key, it);
  }
  return Array.from(seen.values());
}

export default async function handler(req, res) {
  const { lat, lng } = req.query;

  try {
    const [festivals, music, family, eventbrite, nash] = await Promise.all([
      fetchTicketmasterFestivals(lat, lng, 'Festival'),
      fetchTicketmasterFestivals(lat, lng, 'Music'),
      fetchTicketmasterFestivals(lat, lng, 'Family'),
      fetchEventbriteFestivals(lat, lng),
      fetchNashvilleSpecialEvents()
    ]);

    let combined = dedupe([...festivals, ...music, ...family, ...eventbrite, ...nash]);

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
      sources: {
        festivals: festivals.length,
        music: music.length,
        family: family.length,
        eventbrite: eventbrite.length,
        nashville: nash.length
      },
      sortedBy: (lat && lng) ? 'distance' : 'date',
      festivals: combined,
      total: combined.length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
