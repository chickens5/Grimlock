import { useState } from 'react';

const TYPE_COLORS = {
  Forb: 'badge-forb',
  Shrub: 'badge-shrub',
  Grass: 'badge-grass',
  Tree: 'badge-tree',
};

const SEASON_LABELS = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

export default function PlantCard({ plant, onClick }) {
  const [imgError, setImgError] = useState(false);

  const typeClass = TYPE_COLORS[plant.plant_type] || 'badge-other';

  const sunParts = [];
  if (plant.full_sun) sunParts.push('Full Sun');
  if (plant.part_shade) sunParts.push('Part Shade');
  if (plant.full_shade) sunParts.push('Full Shade');

  return (
    <article className="plant-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      aria-label={`${plant.common_name}, ${plant.botanical_name}`}
    >
      <div className="card-image-wrap">
        {plant.imagePath && !imgError ? (
          <img
            src={plant.imagePath}
            alt={plant.common_name}
            className="card-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="card-image-placeholder">
            <span>{plant.common_name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-names">
          <p className="card-common">{plant.common_name || plant.botanical_name}</p>
          <p className="card-botanical">{plant.botanical_name}</p>
        </div>

        <div className="card-badges">
          {plant.plant_type && (
            <span className={`badge ${typeClass}`}>{plant.plant_type}</span>
          )}
          {plant.bloomSeasons.map(s => (
            <span key={s} className="badge badge-bloom">{SEASON_LABELS[s]}</span>
          ))}
          {plant.wildlife_keystone && (
            <span className="badge badge-keystone">Keystone</span>
          )}
          {plant.butterfly_garden && (
            <span className="badge badge-butterfly">Butterfly</span>
          )}
          {(plant.rain_garden_wet || plant.rain_garden_dry) && (
            <span className="badge badge-rain">Rain Garden</span>
          )}
        </div>

        {(sunParts.length > 0 || plant.soil_type) && (
          <div className="card-meta">
            {sunParts.length > 0 && (
              <span className="meta-item">{sunParts.join(', ')}</span>
            )}
            {plant.soil_type && (
              <span className="meta-item meta-soil">
                {plant.soil_type.charAt(0).toUpperCase() + plant.soil_type.slice(1)} soil
              </span>
            )}
            {plant.height && (
              <span className="meta-item">{plant.height}&thinsp;ft</span>
            )}
          </div>
        )}

        {plant.pollinatorNames.length > 0 && (
          <div className="card-pollinators">
            {plant.pollinatorNames.map(p => (
              <span key={p} className="pollinator-tag">{p}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
