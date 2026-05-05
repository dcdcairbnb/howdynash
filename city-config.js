// Howdy Nash city configuration. Swap this file (and city-data.js) to launch in a new city.
// Loaded as a regular script tag, so all values live on window.CITY_CONFIG.
//
// To launch in a new city (e.g. Austin):
//   1. Copy this file: city-config.austin.js
//   2. Update every value below for the new city
//   3. Copy city-data.js: city-data.austin.js
//   4. Replace the curated arrays inside with the new city's spots
//   5. In nashville-chatbot.html, change the two <script src="..."> tags to point to the new files
//   6. Rebrand /logo.jpg, /logo.png, /howdynash-splash-2732.png, manifest.json
//   7. Update api/chat.js SYSTEM_PROMPT for the new city
//   8. Deploy to a new domain (e.g. howdyatx.com)
//   9. Submit a new iOS app to the App Store
//
// All city-specific values live here. The HTML and API read from window.CITY_CONFIG.

window.CITY_CONFIG = {
  // Core identity
  cityName: 'Nashville',
  cityShortName: 'Nash',
  state: 'TN',
  stateFull: 'Tennessee',
  brandName: 'Howdy Nash',
  brandTitle: 'Howdy Nash: Nashville Guide',
  tagline: "Nashville's Free Travel Concierge",
  domain: 'howdynash.com',
  url: 'https://howdynash.com',

  // Visual identity (used by graphics generator and CSS)
  primaryColor: '#d62828',
  secondaryColor: '#f4a200',
  accentColor: '#34a853',

  // Geographic center (used as map default and distance fallback)
  centerLat: 36.1627,
  centerLng: -86.7816,

  // Airport
  airportCode: 'BNA',
  airportName: 'Nashville International Airport',
  airportShortName: 'BNA airport',

  // Sports teams (used for the Sports section)
  sportsTeams: ['Titans', 'Predators', 'Sounds'],

  // City nicknames and identifiers (used in copy and SEO)
  nicknames: ['Music City', 'Nash', 'Nashville'],

  // What the city is famous for (used in marketing copy)
  signatureFoods: ['hot chicken', 'biscuits', 'BBQ'],
  signatureExperiences: ['honky tonks', 'live music', 'songwriter rounds'],

  // Major event categories the city is known for
  eventCategories: ['country music', 'bachelorette parties', 'CMA Fest', 'festivals'],

  // SMS / share message template (use {code} placeholder)
  groupShareMessage: 'Join my Nashville group on Howdy Nash!\nCode: {code}\n\nTap to open and auto-join:\nhttps://howdynash.com/?join={code}',

  // Email defaults
  fromEmail: 'Howdy Nash <howdy@howdynash.com>',
  supportEmail: 'howdy@howdynash.com',

  // App Store / iOS
  appStoreId: 'com.howdynash.app',
  appStoreName: 'Howdy Nash',
  iosSchemes: ['https']
};

// Convenience getter for one-liner reads in inline HTML.
// Usage: cityCfg('cityName') returns 'Nashville'
window.cityCfg = function (key, fallback) {
  return (window.CITY_CONFIG && window.CITY_CONFIG[key] != null) ? window.CITY_CONFIG[key] : fallback;
};
