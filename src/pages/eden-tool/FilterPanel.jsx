import { useState } from 'react';

const PLANT_TYPES = ['Forb', 'Shrub', 'Grass', 'Tree'];

const SUN_OPTIONS = [
  { value: 'full_sun', label: 'Full Sun' },
  { value: 'part_shade', label: 'Part Shade' },
  { value: 'full_shade', label: 'Full Shade' },
];

const SOIL_OPTIONS = [
  { value: 'moist', label: 'Moist' },
  { value: 'dry', label: 'Dry' },
];

const BLOOM_OPTIONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
];

const POLLINATOR_OPTIONS = [
  'Bee', 'Bumblebee', 'Butterfly', 'Hummingbird',
  'Moth', 'Sphinx Moth', 'Hoverfly', 'Fly',
  'Wasp', 'Beetle', 'Sweat Bee', 'Mining Bee',
  'Bat', 'Ant', 'Other',
];

const HABITAT_OPTIONS = [
  { value: 'rain_garden_wet', label: 'Rain Garden (Wet)' },
  { value: 'rain_garden_dry', label: 'Rain Garden (Dry)' },
  { value: 'bioswale', label: 'Bioswale' },
  { value: 'wildlife_keystone', label: 'Wildlife Keystone' },
  { value: 'ground_cover', label: 'Ground Cover' },
  { value: 'butterfly_garden', label: 'Butterfly Garden' },
  { value: 'bird_haven', label: 'Bird Haven' },
];

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="filter-section">
      <button
        className="filter-section-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="toggle-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

function CheckGroup({ options, selected, onChange }) {
  function toggle(value) {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }
  return (
    <ul className="check-group">
      {options.map(opt => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const checked = selected.includes(value);
        return (
          <li key={value}>
            <label className={`check-label${checked ? ' checked' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(value)}
              />
              {label}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export default function FilterPanel({ filters, onChange, resultCount, totalCount }) {
  const hasActiveFilters =
    filters.search ||
    filters.plantTypes.length > 0 ||
    filters.sunExposure.length > 0 ||
    filters.soilTypes.length > 0 ||
    filters.bloomSeasons.length > 0 ||
    filters.pollinators.length > 0 ||
    filters.habitats.length > 0;

  function clearAll() {
    onChange('search', '');
    onChange('plantTypes', []);
    onChange('sunExposure', []);
    onChange('soilTypes', []);
    onChange('bloomSeasons', []);
    onChange('pollinators', []);
    onChange('habitats', []);
  }

  return (
    <aside className="filter-panel">
      <div className="filter-panel-header">
        <span className="result-count">
          {resultCount} <span className="result-count-of">of {totalCount} plants</span>
        </span>
        {hasActiveFilters && (
          <button className="clear-btn" onClick={clearAll}>
            Clear filters
          </button>
        )}
      </div>

      <div className="filter-search-wrap">
        <input
          type="search"
          className="filter-search"
          placeholder="Search by name..."
          value={filters.search}
          onChange={e => onChange('search', e.target.value)}
          aria-label="Search plants by name"
        />
      </div>

      <Section title="Plant Type">
        <CheckGroup
          options={PLANT_TYPES}
          selected={filters.plantTypes}
          onChange={v => onChange('plantTypes', v)}
        />
      </Section>

      <Section title="Sun Exposure">
        <CheckGroup
          options={SUN_OPTIONS}
          selected={filters.sunExposure}
          onChange={v => onChange('sunExposure', v)}
        />
      </Section>

      <Section title="Soil Type">
        <CheckGroup
          options={SOIL_OPTIONS}
          selected={filters.soilTypes}
          onChange={v => onChange('soilTypes', v)}
        />
      </Section>

      <Section title="Bloom Time">
        <CheckGroup
          options={BLOOM_OPTIONS}
          selected={filters.bloomSeasons}
          onChange={v => onChange('bloomSeasons', v)}
        />
      </Section>

      <Section title="Pollinators">
        <CheckGroup
          options={POLLINATOR_OPTIONS}
          selected={filters.pollinators}
          onChange={v => onChange('pollinators', v)}
        />
      </Section>

      <Section title="Habitat Features">
        <CheckGroup
          options={HABITAT_OPTIONS}
          selected={filters.habitats}
          onChange={v => onChange('habitats', v)}
        />
      </Section>
    </aside>
  );
}
