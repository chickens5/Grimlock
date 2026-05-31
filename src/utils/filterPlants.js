/**
 * Filters a normalized plant array given the current filter state.
 * For multi-value filters, an empty array means "no filter applied" (pass all).
 */

const HABITAT_FLAG_MAP = {
  rain_garden_wet: 'rain_garden_wet',
  rain_garden_dry: 'rain_garden_dry',
  bioswale: 'bioswale',
  wildlife_keystone: 'wildlife_keystone',
  ground_cover: 'ground_cover',
  butterfly_garden: 'butterfly_garden',
  bird_haven: 'bird_haven',
};

/**
 * @param {object[]} plants - Array of normalized plant objects
 * @param {object} filters
 * @param {string}   filters.search
 * @param {string[]} filters.plantTypes
 * @param {string[]} filters.sunExposure   - "full_sun" | "part_shade" | "full_shade"
 * @param {string[]} filters.soilTypes     - "moist" | "dry"
 * @param {string[]} filters.bloomSeasons  - "spring" | "summer" | "fall" | "winter"
 * @param {string[]} filters.pollinators   - pollinator name strings
 * @param {string[]} filters.habitats      - keys from HABITAT_FLAG_MAP
 * @returns {object[]}
 */
export function filterPlants(plants, filters) {
  const {
    search = '',
    plantTypes = [],
    sunExposure = [],
    soilTypes = [],
    bloomSeasons = [],
    pollinators = [],
    habitats = [],
  } = filters;

  const searchLower = search.trim().toLowerCase();

  return plants.filter(plant => {
    // Text search
    if (searchLower) {
      const haystack = `${plant.common_name} ${plant.botanical_name}`.toLowerCase();
      if (!haystack.includes(searchLower)) return false;
    }

    // Plant type
    if (plantTypes.length > 0) {
      if (!plant.plant_type || !plantTypes.includes(plant.plant_type)) return false;
    }

    // Sun exposure — plant must support at least one of the selected exposures
    if (sunExposure.length > 0) {
      const matches = sunExposure.some(s => plant[s] === true);
      if (!matches) return false;
    }

    // Soil type
    if (soilTypes.length > 0) {
      if (!plant.soil_type || !soilTypes.includes(plant.soil_type)) return false;
    }

    // Bloom seasons — plant must have at least one matching season
    if (bloomSeasons.length > 0) {
      const matches = bloomSeasons.some(s => plant.bloomSeasons.includes(s));
      if (!matches) return false;
    }

    // Pollinators — plant must have at least one matching pollinator
    if (pollinators.length > 0) {
      const matches = pollinators.some(p => plant.pollinatorNames.includes(p));
      if (!matches) return false;
    }

    // Habitat flags — plant must satisfy ALL selected habitat requirements
    if (habitats.length > 0) {
      const allMatch = habitats.every(h => {
        const key = HABITAT_FLAG_MAP[h];
        return key ? plant[key] === true : false;
      });
      if (!allMatch) return false;
    }

    return true;
  });
}
