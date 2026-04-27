export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    services: {
      foursquare: !!process.env.FOURSQUARE_API_KEY,
      google: !!process.env.GOOGLE_PLACES_KEY,
      ticketmaster: !!process.env.TICKETMASTER_KEY,
      nashville: true
    }
  });
}
