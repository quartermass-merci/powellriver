// Powell River + travel corridor locations.
// lat/lng approximated from public map data; drive times are conservative estimates.
// Drive time formula: 1.3 * straight_line_km / 50 km/h, with manual overrides for known legs.

// Coordinates verified via OpenStreetMap's Nominatim geocoder where possible.
// A few (meridian, hulks, brent_b) are Townsite/south estimates.
window.LOCATIONS = [
  // --- Powell River core ---
  { id: "airbnb",        name: "Blissful Sunsets Airbnb", addr: "4312 Fernwood Ave, Powell River", lat: 49.8442, lng: -124.5122, cat: "lodging" },
  { id: "meridian",      name: "Meridian 125W Facility",  addr: "Old Catalyst Paper Mill, Townsite", lat: 49.8810, lng: -124.5565, cat: "facility" },
  { id: "museum",        name: "qathet Museum & Archives", addr: "4798 Marine Ave, Powell River",   lat: 49.8478, lng: -124.5375, cat: "archival" },
  { id: "hulks",         name: "The Hulks (breakwater)",  addr: "Powell Lake, Townsite side",       lat: 49.8790, lng: -124.5540, cat: "archival" },
  { id: "rivercity",     name: "River City Coffee",        addr: "4552 Marine Ave, Powell River",    lat: 49.8410, lng: -124.5310, cat: "food" },
  { id: "shinglemill",   name: "The Shingle Mill Pub",     addr: "6233 Powell Pl, Powell River",     lat: 49.8852, lng: -124.5446, cat: "food" },
  { id: "monks",         name: "Monks Pub & Eatery",       addr: "4463 Marine Ave, Powell River",    lat: 49.8388, lng: -124.5290, cat: "food" },
  { id: "forrest",       name: "Forrest (old mill bar)",   addr: "Townsite area",                    lat: 49.8805, lng: -124.5500, cat: "food" },
  { id: "prpeak",        name: "Powell River Peak",        addr: "7030 Glacier St, Powell River",    lat: 49.8312, lng: -124.5195, cat: "media" },
  { id: "marine_ave",    name: "Marine Avenue (downtown)", addr: "Marine Ave, Powell River",         lat: 49.8378, lng: -124.5262, cat: "mots" },
  { id: "cranberry",     name: "Cranberry Village",        addr: "Cranberry St, Powell River",       lat: 49.8475, lng: -124.5068, cat: "mots" },
  { id: "wildwood",      name: "Wildwood",                 addr: "Wildwood, Powell River",           lat: 49.8720, lng: -124.5040, cat: "mots" },
  { id: "marina",        name: "Westview Marina",          addr: "Westview Harbour, Powell River",   lat: 49.8330, lng: -124.5295, cat: "mots" },
  { id: "dispensary_1",  name: "Dispensary (Marine Ave)",  addr: "Marine Ave, Powell River",         lat: 49.8370, lng: -124.5260, cat: "interview" },
  { id: "dispensary_2",  name: "Dispensary (Westview)",    addr: "Westview, Powell River",           lat: 49.8335, lng: -124.5300, cat: "interview" },

  // --- Outside the city ---
  { id: "brent_b",       name: "Brent B — Wheelchair Weed", addr: "South of Powell River (Hwy 101)", lat: 49.7890, lng: -124.4620, cat: "interview" },
  { id: "lund",          name: "Lund (northern coast)",     addr: "Lund, BC",                        lat: 49.9817, lng: -124.7591, cat: "broll" },
  { id: "tlaamin",       name: "Tla'amin coast (public)",   addr: "Sliammon, BC",                    lat: 49.9280, lng: -124.6300, cat: "broll" },

  // --- Ferry + travel corridor ---
  { id: "saltery_bay",   name: "Saltery Bay Terminal",      addr: "Saltery Bay, BC",                 lat: 49.7814, lng: -124.1771, cat: "ferry" },
  { id: "earls_cove",    name: "Earls Cove Terminal",       addr: "Earls Cove, BC",                  lat: 49.7532, lng: -124.0088, cat: "ferry" },
  { id: "langdale",      name: "Langdale Terminal",         addr: "Langdale, BC",                    lat: 49.4340, lng: -123.4765, cat: "ferry" },
  { id: "horseshoe_bay", name: "Horseshoe Bay Terminal",    addr: "West Vancouver, BC",              lat: 49.3686, lng: -123.2759, cat: "ferry" },
  { id: "gibsons",       name: "Gibsons",                    addr: "Gibsons, BC",                     lat: 49.4006, lng: -123.5089, cat: "food" },
  { id: "sechelt",       name: "Sechelt",                    addr: "Sechelt, BC",                     lat: 49.4744, lng: -123.7560, cat: "food" },
  { id: "yvr",           name: "YVR Airport (Main)",         addr: "Richmond, BC",                    lat: 49.1947, lng: -123.1792, cat: "airport" },
];

// Manual overrides for known legs (minutes). Use when straight-line estimate
// would mislead (ferry crossings, dogleg drives). Symmetric by default.
window.LOCATION_OVERRIDES = {
  // Ferry legs (in-terminal drive-on time, not counting sailing duration handled separately)
  "horseshoe_bay|langdale":   { minutes: 40,  note: "Route 3 sailing (reserved)" },
  "earls_cove|saltery_bay":   { minutes: 50,  note: "Route 7 sailing (walk-on)" },
  // Sunshine Coast highway legs
  "langdale|earls_cove":      { minutes: 95,  note: "Hwy 101, ~80 km via Sechelt" },
  "langdale|gibsons":         { minutes: 10,  note: "Hwy 101" },
  "gibsons|earls_cove":       { minutes: 85,  note: "Hwy 101 via Sechelt" },
  "sechelt|earls_cove":       { minutes: 55,  note: "Hwy 101 north" },
  "langdale|sechelt":         { minutes: 35,  note: "Hwy 101" },
  // Powell River side
  "saltery_bay|airbnb":       { minutes: 30,  note: "Hwy 101 north to Townsite" },
  "saltery_bay|meridian":     { minutes: 35,  note: "Hwy 101 north to Townsite" },
  // Known tricky drives
  "airbnb|brent_b":           { minutes: 30,  note: "Hwy 101 south" },
  "meridian|brent_b":         { minutes: 35,  note: "Hwy 101 south" },
  "airbnb|lund":              { minutes: 30,  note: "Hwy 101 north" },
  "meridian|lund":            { minutes: 25,  note: "Hwy 101 north" },
  // YVR drives
  "yvr|horseshoe_bay":        { minutes: 45,  note: "Hwy 1 / Upper Levels" },
};

// Great-circle distance in km
function haversineKm(a, b) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Drive time in minutes between two location ids, using overrides when present.
window.driveMinutes = function (fromId, toId) {
  if (!fromId || !toId || fromId === toId) return 0;
  const key1 = `${fromId}|${toId}`;
  const key2 = `${toId}|${fromId}`;
  if (window.LOCATION_OVERRIDES[key1]) return window.LOCATION_OVERRIDES[key1].minutes;
  if (window.LOCATION_OVERRIDES[key2]) return window.LOCATION_OVERRIDES[key2].minutes;
  const a = window.LOCATIONS.find(l => l.id === fromId);
  const b = window.LOCATIONS.find(l => l.id === toId);
  if (!a || !b) return 0;
  const km = haversineKm(a, b) * 1.3;
  return Math.max(3, Math.round((km / 50) * 60));
};

window.locationById = function (id) {
  return window.LOCATIONS.find(l => l.id === id) || null;
};
