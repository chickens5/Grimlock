import { useMemo, useState, useCallback } from 'react';
import rawPlants from '../../plant_data_with_pollinators.json';
import { normalizePlants } from '../utils/normalizePlants';
import { filterPlants } from '../utils/filterPlants';
import FilterPanel from './eden-tool/FilterPanel';
import PlantCard from './eden-tool/PlantCard';
import PlantModal from './eden-tool/PlantModal';

import './Plants.css';
import './PlantsBG.css';

const ALL_PLANTS = normalizePlants(rawPlants);

const DEFAULT_FILTERS = {
  search: '',
  plantTypes: [],
  sunExposure: [],
  soilTypes: [],
  bloomSeasons: [],
  pollinators: [],
  habitats: [],
};

function Plants() {
 
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filtered = useMemo(
    () => filterPlants(ALL_PLANTS, filters),
    [filters]
  );


  return (
    <div className="plants-page app-layout">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
        
             <button className="nav-btn" onClick={() => {window.location.href = '/observations';}}>
          Eden Plant Tool
        </button>
            <span className="header-zone">Zone 7a &mdash; St. Louis, MO</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label={sidebarOpen ? 'Close filters' : 'Open filters'}
            aria-expanded={sidebarOpen}
          >
            Filters
          </button>
        </div>
      </header>

      <div className="app-body">
        <div className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        <div className={`sidebar-wrap${sidebarOpen ? ' open' : ''}`}>
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            resultCount={filtered.length}
            totalCount={ALL_PLANTS.length}
          />
        </div>

        <main className="plant-grid-area">
          {filtered.length === 0 ? (
            <div className="no-results">
              <p>No plants match the current filters.</p>
              <button
                className="clear-btn"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="plant-grid">
              {filtered.map(plant => (
                <PlantCard
                  key={plant.botanical_name}
                  plant={plant}
                  onClick={() => setSelectedPlant(plant)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedPlant && (
        <PlantModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}
    </div>
  );
}

export default Plants;
