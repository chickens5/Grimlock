/**
 * Normalizes raw plant JSON entries into a consistent shape for filtering and display.
 */

const BLOOM_SEASON_MAP = [
  { pattern: /early spring/i, seasons: ['spring'] },
  { pattern: /late spring/i, seasons: ['spring'] },
  { pattern: /spring/i, seasons: ['spring'] },
  { pattern: /early summer/i, seasons: ['summer'] },
  { pattern: /late summer/i, seasons: ['summer', 'fall'] },
  { pattern: /summer/i, seasons: ['summer'] },
  { pattern: /early fall|early autumn/i, seasons: ['fall'] },
  { pattern: /fall|autumn/i, seasons: ['fall'] },
  { pattern: /winter/i, seasons: ['winter'] },
];

function parseBloomSeasons(bloomTime) {
  if (!bloomTime) return [];
  const text = String(bloomTime);
  const found = new Set();

  // Handle range strings like "May to September", "June to October"
  const monthToSeason = {
    january: 'winter', february: 'winter', march: 'spring',
    april: 'spring', may: 'spring', june: 'summer',
    july: 'summer', august: 'summer', september: 'fall',
    october: 'fall', november: 'fall', december: 'winter',
  };
  const monthMatch = text.toLowerCase().match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/g);
  if (monthMatch) {
    monthMatch.forEach(m => found.add(monthToSeason[m]));
    return [...found];
  }

  for (const { pattern, seasons } of BLOOM_SEASON_MAP) {
    if (pattern.test(text)) {
      seasons.forEach(s => found.add(s));
    }
  }

  return found.size > 0 ? [...found] : [];
}

function coerceBool(val) {
  return val === 'X' || val === true;
}

function deriveImagePath(plant) {
  if (plant.image) return plant.image.replace(/^\//, '');
  if (!plant.botanical_name) return null;
  // "Aruncus dioicus" → "/plantImgs/aruncus-dioicus.jpg"
  const parts = plant.botanical_name.trim().toLowerCase().split(/\s+/);
  if (parts.length >= 2) {
    //this allows us to handle cases where there are extra descriptors in the botanical name, like "Carex vulpinoidea 'Aurea'

    return `plantImgs/${parts[0]}-${parts[1]}.jpg`;
  }
  return `plantImgs/${parts[0]}.jpg`;
} 

function extractPollinatorNames(plant) {
  const names = new Set();

  // From pollinators array (most structured source)
  if (Array.isArray(plant.pollinators)) {
    plant.pollinators.forEach(p => {
      if (p && p.name) names.add(p.name);
    });
  }

  // From favorite_pollinator array
  if (Array.isArray(plant.favorite_pollinator)) {
    plant.favorite_pollinator.forEach(n => { if (n) names.add(n); });
  }

  // From fav_pollinator string
  if (typeof plant.fav_pollinator === 'string' && plant.fav_pollinator) {
    names.add(plant.fav_pollinator);
  }

  // From main_pollinator object
  if (plant.main_pollinator && plant.main_pollinator.name) {
    names.add(plant.main_pollinator.name);
  }

  return [...names];
}

function scoreCompleteness(p) {
  // Higher score = more data; used to pick the best entry when duplicates exist
  return (
    (p.description ? 10 : 0) +
    (p.image ? 3 : 0) +
    (p.url ? 2 : 0) +
    (Array.isArray(p.pollinators) && p.pollinators.length > 0 ? 4 : 0) +
    (Array.isArray(p.favorite_pollinator) && p.favorite_pollinator.length > 0 ? 2 : 0) +
    (p.plant_type ? 1 : 0) +
    (p.bloom_time ? 1 : 0)
  );
}

export function normalizePlants(rawPlants) {
  // Deduplicate raw entries by botanical_name before normalizing,
  // keeping the entry with the highest completeness score.
  const bestByName = new Map();
  for (const p of rawPlants) {
    if (!p || typeof p.botanical_name !== 'string' || !p.botanical_name.trim()) continue;
    const key = p.botanical_name.trim().toLowerCase();
    const existing = bestByName.get(key);
    if (!existing || scoreCompleteness(p) > scoreCompleteness(existing)) {
      bestByName.set(key, p);
    }
  }

  return [...bestByName.values()].map(p => ({
      // Identity
      botanical_name: p.botanical_name.trim(),
      common_name: (p.common_name || '').trim(),
      plant_type: p.plant_type || null,

      // Description / external link
      description: p.description || null,
      url: p.url || null,

      // Image
      imagePath: deriveImagePath(p),

      // Sun conditions (normalized to booleans)
      full_sun: coerceBool(p.full_sun),
      part_shade: coerceBool(p.part_shade),
      full_shade: coerceBool(p.full_shade),

      // Soil
      soil_type: p.soil_type || null,

      // Height (display only)
      height: p.height || null,

      // Bloom
      bloom_time: p.bloom_time || null,
      bloomSeasons: parseBloomSeasons(p.bloom_time),

      // Pollinators
      pollinatorNames: extractPollinatorNames(p),
      pollinators: Array.isArray(p.pollinators) ? p.pollinators : [],
      main_pollinator: p.main_pollinator || null,

      // Habitat flags
      rain_garden_wet: Boolean(p.rain_garden_wet),
      rain_garden_dry: Boolean(p.rain_garden_dry),
      bioswale: Boolean(p.bioswale),
      wildlife_keystone: Boolean(p.wildlife_keystone),
      ground_cover: Boolean(p.ground_cover),

      // Special tags
      butterfly_garden: Boolean(p.butterfly_garden),
      bird_haven: Boolean(p.bird_haven),
      conservation_need: Boolean(p.conservation_need),
    }));
}
