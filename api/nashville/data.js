// Nashville Open Data via Socrata SODA API. Free, app token optional.
// Datasets browser: https://data.nashville.gov/browse
export default async function handler(req, res) {
  const { dataset, limit = 20, where } = req.query;
  if (!dataset) return res.status(400).json({ error: 'dataset param required' });

  try {
    const url = new URL(`https://data.nashville.gov/resource/${dataset}.json`);
    url.searchParams.set('$limit', String(limit));
    if (where) url.searchParams.set('$where', where);
    const headers = {};
    if (process.env.NASHVILLE_APP_TOKEN) {
      headers['X-App-Token'] = process.env.NASHVILLE_APP_TOKEN;
    }
    const r = await fetch(url, { headers });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.status(200).json({ source: 'nashville-open-data', results: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
