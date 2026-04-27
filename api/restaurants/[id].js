// Foursquare place details
export default async function handler(req, res) {
  if (!process.env.FOURSQUARE_API_KEY) {
    return res.status(503).json({ error: 'FOURSQUARE_API_KEY not configured' });
  }
  const { id } = req.query;

  try {
    const url = new URL(`https://api.foursquare.com/v3/places/${id}`);
    url.searchParams.set('fields', 'fsq_id,name,categories,location,geocodes,rating,price,tel,website,hours,photos,description,tips,menu');

    const r = await fetch(url, {
      headers: {
        Authorization: process.env.FOURSQUARE_API_KEY,
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
