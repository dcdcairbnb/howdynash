// Weather.gov (US National Weather Service). Free, no API key required.
// Two-step flow: /points/{lat},{lng} returns forecast URL, then fetch that URL.

export default async function handler(req, res) {
  const { lat = 36.1627, lng = -86.7816 } = req.query;

  try {
    const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lng}`, {
      headers: { 'User-Agent': 'MusicCityRetreat/1.0 (contact@musiccityretreat.app)' }
    });
    if (!pointsRes.ok) {
      return res.status(pointsRes.status).json({ error: 'weather points lookup failed' });
    }
    const pointsData = await pointsRes.json();
    const forecastUrl = pointsData.properties?.forecast;
    const hourlyUrl = pointsData.properties?.forecastHourly;
    const location = pointsData.properties?.relativeLocation?.properties;

    if (!forecastUrl) {
      return res.status(404).json({ error: 'forecast unavailable for this location' });
    }

    const forecastRes = await fetch(forecastUrl, {
      headers: { 'User-Agent': 'MusicCityRetreat/1.0 (contact@musiccityretreat.app)' }
    });
    if (!forecastRes.ok) {
      return res.status(forecastRes.status).json({ error: 'forecast fetch failed' });
    }
    const forecastData = await forecastRes.json();
    const periods = (forecastData.properties?.periods || []).slice(0, 7).map(p => ({
      name: p.name,
      startTime: p.startTime,
      isDaytime: p.isDaytime,
      temperature: p.temperature,
      temperatureUnit: p.temperatureUnit,
      windSpeed: p.windSpeed,
      windDirection: p.windDirection,
      shortForecast: p.shortForecast,
      detailedForecast: p.detailedForecast,
      icon: p.icon,
      probabilityOfPrecipitation: p.probabilityOfPrecipitation?.value
    }));

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
    res.status(200).json({
      source: 'weather.gov',
      location: {
        city: location?.city || 'Nashville',
        state: location?.state || 'TN',
        lat: Number(lat),
        lng: Number(lng)
      },
      forecast: periods,
      updated: forecastData.properties?.updated
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
