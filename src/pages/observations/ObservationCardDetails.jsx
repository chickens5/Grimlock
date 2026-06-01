import { isImageMedia } from './observationUtils.js';

export default function ObservationCardDetails({ observation, resolveImageUrl }) {
  return (
    <div className="observation-details-grid">
      {(observation.morphology?.height_cm || observation.morphology?.canopy_width_cm || observation.morphology?.leaf_count || observation.morphology?.node_count || observation.morphology?.cola_count) && (
        <section className="observation-section">
          <h4>Morphology</h4>
          <div className="observation-grid">
            {typeof observation.morphology?.height_cm === 'number' && <p><strong>Height:</strong> {observation.morphology.height_cm} cm</p>}
            {typeof observation.morphology?.canopy_width_cm === 'number' && <p><strong>Canopy Width:</strong> {observation.morphology.canopy_width_cm} cm</p>}
            {typeof observation.morphology?.leaf_count === 'number' && <p><strong>Leaf Count:</strong> {observation.morphology.leaf_count}</p>}
            {typeof (observation.morphology?.node_count ?? observation.morphology?.cola_count) === 'number' && (
              <p><strong>Node Count:</strong> {observation.morphology.node_count ?? observation.morphology.cola_count}</p>
            )}
          </div>
        </section>
      )}

      {observation.observ_img && (
        <section className="observation-section">
          <h4>Observation Image</h4>
          <a href={resolveImageUrl(observation.observ_img)} target="_blank" rel="noopener noreferrer">
            <img
              className="observation-media-image"
              src={resolveImageUrl(observation.observ_img)}
              alt={`${observation.plant_name || 'Plant'} observation`}
              loading="lazy"
            />
          </a>
        </section>
      )}

      {(typeof observation.health?.overall_score === 'number' || observation.health?.stress_type?.length > 0 || observation.health?.symptoms?.length > 0) && (
        <section className="observation-section">
          <h4>Health</h4>
          {typeof observation.health?.overall_score === 'number' && (
            <p><strong>Overall Score:</strong> {observation.health.overall_score}/10</p>
          )}
          {observation.health?.stress_type?.length > 0 && (
            <p><strong>Stress Types:</strong> {observation.health.stress_type.join(', ')}</p>
          )}
          {observation.health?.symptoms?.length > 0 && (
            <div className="list-block">
              <strong>Symptoms:</strong>
              {observation.health.symptoms.map((symptom, index) => (
                <p key={`${observation._id}-symptom-${index}`}>
                  {symptom.type} at {symptom.location || 'unknown location'}
                  {typeof symptom.severity === 'number' ? `, severity ${symptom.severity}/10` : ''}
                  {symptom.confirmed_by ? `, confirmed by ${symptom.confirmed_by}` : ''}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {(typeof observation.environment_snapshot?.temp_c === 'number' || typeof observation.environment_snapshot?.humidity_pct === 'number' || typeof observation.environment_snapshot?.vpd_kpa === 'number' || typeof observation.environment_snapshot?.ppfd_umol === 'number') && (
        <section className="observation-section">
          <h4>Environment Snapshot</h4>
          <div className="observation-grid">
            {typeof observation.environment_snapshot?.temp_c === 'number' && <p><strong>Temp:</strong> {observation.environment_snapshot.temp_c} C</p>}
            {typeof observation.environment_snapshot?.humidity_pct === 'number' && <p><strong>Humidity:</strong> {observation.environment_snapshot.humidity_pct}%</p>}
            {typeof observation.environment_snapshot?.vpd_kpa === 'number' && <p><strong>VPD:</strong> {observation.environment_snapshot.vpd_kpa} kPa</p>}
            {typeof observation.environment_snapshot?.ppfd_umol === 'number' && <p><strong>PPFD:</strong> {observation.environment_snapshot.ppfd_umol} umol</p>}
            {typeof observation.environment_snapshot?.co2_ppm === 'number' && <p><strong>CO2:</strong> {observation.environment_snapshot.co2_ppm} ppm</p>}
            {typeof observation.environment_snapshot?.photoperiod_hrs === 'number' && <p><strong>Photoperiod:</strong> {observation.environment_snapshot.photoperiod_hrs} hrs</p>}
          </div>
        </section>
      )}

      {observation.media?.length > 0 && (
        <section className="observation-section">
          <h4>Media</h4>
          <div className="observation-media-grid">
            {observation.media.map((item, index) => (
              <div key={`${observation._id}-media-${index}`} className="observation-media-item">
                <p className="observation-media-label">
                  <strong>{item.type || 'Media'}</strong>
                  {item.angle ? ` (${item.angle})` : ''}
                </p>
                {isImageMedia(item) ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <img
                      className="observation-media-image"
                      src={item.url}
                      alt={`${item.type || 'Media'} ${item.angle || ''}`.trim()}
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <a
                    className="observation-media-link"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
