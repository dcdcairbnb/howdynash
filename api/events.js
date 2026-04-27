// Ticketmaster Discovery API. Sign up: https://developer.ticketmaster.com
export default async function handler(req, res) {
  if (!process.env.TICKETMASTER_KEY) {
    return res.status(503).json({ error: 'TICKETMASTER_KEY not configured' });
  }
  const { keyword = '', classificationName = '', startDateTime, endDateTime } = req.query;

  try {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    url.searchParams.set('apikey', process.env.TICKETMASTER_KEY);
    url.searchParams.set('city', 'Nashville');
    url.searchParams.set('stateCode', 'TN');
    url.searchParams.set('size', '20');
    url.searchParams.set('sort', 'date,asc');
    if (keyword) url.searchParams.set('keyword', keyword);
    if (classificationName) url.searchParams.set('classificationName', classificationName);
    if (startDateTime) url.searchParams.set('startDateTime', startDateTime);
    if (endDateTime) url.searchParams.set('endDateTime', endDateTime);

    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const events = (data._embedded?.events || []).map(e => ({
      id: e.id,
      name: e.name,
      date: e.dates?.start?.localDate,
      time: e.dates?.start?.localTime,
      venue: e._embedded?.venues?.[0]?.name,
      address: e._embedded?.venues?.[0]?.address?.line1,
      url: e.url,
      image: e.images?.[0]?.url,
      classification: e.classifications?.[0]?.segment?.name,
      genre: e.classifications?.[0]?.genre?.name,
      priceMin: e.priceRanges?.[0]?.min,
      priceMax: e.priceRanges?.[0]?.max
    }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({ source: 'ticketmaster', events, total: data.page?.totalElements });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
