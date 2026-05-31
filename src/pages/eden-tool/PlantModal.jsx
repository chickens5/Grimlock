import { useEffect, useState } from 'react';

const TYPE_COLORS = {
  Forb: 'badge-forb',
  Shrub: 'badge-shrub',
  Grass: 'badge-grass',
  Tree: 'badge-tree',
};

const HABITAT_LABELS = [
  { key: 'rain_garden_wet', label: 'Rain Garden (Wet)' },
  { key: 'rain_garden_dry', label: 'Rain Garden (Dry)' },
  { key: 'bioswale', label: 'Bioswale' },
  { key: 'wildlife_keystone', label: 'Wildlife Keystone' },
  { key: 'ground_cover', label: 'Ground Cover' },
  { key: 'butterfly_garden', label: 'Butterfly Garden' },
  { key: 'bird_haven', label: 'Bird Haven' },
  { key: 'conservation_need', label: 'Conservation Need' },
];

export default function PlantModal({ plant, onClose }) {
  const [imgError, setImgError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!plant) return null;

  const typeClass = TYPE_COLORS[plant.plant_type] || 'badge-other';
  const habitats = HABITAT_LABELS.filter(h => plant[h.key]);

  const sunParts = [];
  if (plant.full_sun) sunParts.push('Full Sun');
  if (plant.part_shade) sunParts.push('Part Shade');
  if (plant.full_shade) sunParts.push('Full Shade');

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={plant.common_name}
    >
      <div
        className="modal-panel"
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="modal-layout">
          <div className="modal-image-col">
            {plant.imagePath && !imgError ? (
              <img
                src={plant.imagePath}
                alt={plant.common_name}
                className="modal-image"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="modal-image-placeholder">
                <span>{(plant.common_name || plant.botanical_name).charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="modal-info-col">
            <h2 className="modal-common">{plant.common_name || plant.botanical_name}</h2>
            <p className="modal-botanical">{plant.botanical_name}</p>

            <div className="modal-badges">
              {plant.plant_type && (
                <span className={`badge ${typeClass}`}>{plant.plant_type}</span>
              )}
              {plant.bloomSeasons.map(s => (
                <span key={s} className="badge badge-bloom">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              ))}
            </div>

            <dl className="modal-dl">
              {sunParts.length > 0 && (
                <>
                  <dt>Light</dt>
                  <dd>{sunParts.join(', ')}</dd>
                </>
              )}
              {plant.soil_type && (
                <>
                  <dt>Soil</dt>
                  <dd>{plant.soil_type.charAt(0).toUpperCase() + plant.soil_type.slice(1)}</dd>
                </>
              )}
              {plant.height && (
                <>
                  <dt>Height</dt>
                  <dd>{plant.height}&thinsp;ft</dd>
                </>
              )}
              {plant.bloom_time && (
                <>
                  <dt>Bloom</dt>
                  <dd>{plant.bloom_time}</dd>
                </>
              )}
            </dl>

            {habitats.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">Habitat Uses</h3>
                <div className="modal-habitat-tags">
                  {habitats.map(h => (
                    <span key={h.key} className="badge badge-habitat">{h.label}</span>
                  ))}
                </div>
              </div>
            )}

            {plant.pollinatorNames.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">Pollinators</h3>
                <div className="modal-pollinator-list">
                  {plant.pollinators.length > 0
                    ? plant.pollinators.map(p => (
                        <div key={p.name} className="pollinator-entry">
                          <span className="pollinator-name">{p.name}</span>
                          {p.taxonomy && (
                            <span className="pollinator-taxonomy">
                              {[p.taxonomy.class, p.taxonomy.order, p.taxonomy.family]
                                .filter(Boolean)
                                .join(' / ')}
                            </span>
                          )}
                        </div>
                      ))
                    : plant.pollinatorNames.map(n => (
                        <span key={n} className="pollinator-tag">{n}</span>
                      ))
                  }
                </div>
              </div>
            )}

            {plant.description && (
              <div className="modal-section">
                <h3 className="modal-section-title">About</h3>
             <dd>{plant.description.length > 100 ? `${plant.description.slice(0, 500)}...` : plant.description}</dd>
              </div>
            )}

            {plant.url && (
              <a
                href={plant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-ext-link"
              >
                View on Missouri Botanical Garden &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
