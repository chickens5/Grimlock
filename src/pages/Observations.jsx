import React, { useEffect, useMemo, useState } from 'react';
import './Observations.css';
import { apiUrl } from '../lib/api';

const STAGE_LABELS = {
  seedling: 'Seedling',
  vegetative: 'Vegetative',
  'pre-flower': 'Pre-Flower',
  flower: 'Flower',
  'late-flower': 'Late Flower',
  harvest: 'Harvest'
};

function formatDate(value) {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleString();
}

function formatStage(stage) {
  return STAGE_LABELS[stage] || stage || 'Unknown stage';
}

function isImageMedia(item) {
  const type = (item?.type || '').toLowerCase();
  const url = item?.url || '';
  if (!url) return false;

  if (['rgb', 'infrared', 'uv', 'microscope', 'image', 'img', 'photo'].includes(type)) {
    return true;
  }

  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

export default function Observations({ onNavigateTo }) {
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [observations, setObservations] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [observationsLoading, setObservationsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch(apiUrl('/api/plants'));
        if (!response.ok) throw new Error('Failed to fetch plants');

        const data = await response.json();
        setPlants(data);
        if (data.length > 0) {
          setSelectedPlantId(data[0]._id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setPlantsLoading(false);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    if (!selectedPlantId) {
      setObservations([]);
      return;
    }

    const fetchObservations = async () => {
      setObservationsLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl(`/api/observations/plant/${selectedPlantId}`));
        if (!response.ok) throw new Error('Failed to fetch observations');

        const data = await response.json();
        setObservations(data);
      } catch (err) {
        setError(err.message);
        setObservations([]);
      } finally {
        setObservationsLoading(false);
      }
    };

    fetchObservations();
  }, [selectedPlantId]);

  const selectedPlant = useMemo(
    () => plants.find(plant => plant._id === selectedPlantId) || null,
    [plants, selectedPlantId]
  );

  const latestObservation = observations.length > 0 ? observations[0] : null;

  if (plantsLoading) {
    return <div className="observations-empty-state">Loading observation dashboard...</div>;
  }

  if (error && plants.length === 0) {
    return <div className="observations-empty-state error">Error: {error}</div>;
  }

  return (
    <div className="observations-layout">
      <div className="observations-nav-bar">
        <button className="nav-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>
        <div className="nav-title">Observations</div>
        <button className="nav-btn" onClick={() => onNavigateTo('plants')}>
          Plants →
        </button>
      </div>

      <aside className="observations-sidebar">
        <h2>Plants</h2>
        <div className="observations-plant-list">
          {plants.length === 0 ? (
            <div className="observations-empty-state compact">No plants found.</div>
          ) : (
            plants.map(plant => (
              <button
                key={plant._id}
                type="button"
                className={`observations-plant-item ${selectedPlantId === plant._id ? 'active' : ''}`}
                onClick={() => setSelectedPlantId(plant._id)}
              >
                {plant.strain_image && (
                  <img
                    className="observations-plant-image"
                    src={plant.strain_image}
                    alt={plant.product_name || plant.uid}
                  />
                )}
                <span className="observations-plant-name">{plant.product_name || plant.uid}</span>
                <span className="observations-plant-uid">{plant.uid}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="observations-main">
        {selectedPlant ? (
          <>
            <div className="observations-header-card">
              <div>
                <h1>{selectedPlant.product_name || selectedPlant.uid}</h1>
                <p className="selected-plant-uid">{selectedPlant.uid}</p>
              </div>
              <div className="selected-plant-meta">
                {selectedPlant.breeder && <p><strong>Breeder:</strong> {selectedPlant.breeder}</p>}
                {selectedPlant.lineage?.length > 0 && (
                  <p><strong>Lineage:</strong> {selectedPlant.lineage.join(' × ')}</p>
                )}
                {selectedPlant.vibe_cluster && selectedPlant.vibe_cluster !== 'unclassified' && (
                  <p><strong>Cluster:</strong> {selectedPlant.vibe_cluster}</p>
                )}
              </div>
            </div>

            {error && <div className="error">Error: {error}</div>}

            {observationsLoading ? (
              <div className="observations-empty-state compact">Loading observations...</div>
            ) : observations.length === 0 ? (
              <div className="observations-empty-state compact">
                No observations recorded for this plant yet.
              </div>
            ) : (
              <div className="observations-timeline">
                {observations.map(observation => (
                  <article key={observation._id} className="observation-card">
                    <div className="observation-card-header">
                      <div>
                        <h3>{formatStage(observation.growth_stage)}</h3>
                        <p className="observation-date">{formatDate(observation.recorded_at)}</p>
                      </div>
                      {typeof observation.data_quality === 'number' && (
                        <span className="quality-badge">Quality {observation.data_quality}/10</span>
                      )}
                    </div>

                    {(observation.morphology?.height_cm || observation.morphology?.canopy_width_cm || observation.morphology?.leaf_count || observation.morphology?.cola_count) && (
                      <section className="observation-section">
                        <h4>Morphology</h4>
                        <div className="observation-grid">
                          {typeof observation.morphology?.height_cm === 'number' && <p><strong>Height:</strong> {observation.morphology.height_cm} cm</p>}
                          {typeof observation.morphology?.canopy_width_cm === 'number' && <p><strong>Canopy Width:</strong> {observation.morphology.canopy_width_cm} cm</p>}
                          {typeof observation.morphology?.leaf_count === 'number' && <p><strong>Leaf Count:</strong> {observation.morphology.leaf_count}</p>}
                          {typeof observation.morphology?.cola_count === 'number' && <p><strong>Cola Count:</strong> {observation.morphology.cola_count}</p>}
                        </div>
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

                    <p className="observation-footer">
                      Recorded by {observation.recorded_by || 'unknown'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="observations-empty-state">Select a plant to view observations.</div>
        )}
      </main>

      <aside className="observations-right">
        {selectedPlant ? (
          <div className="observations-summary-card">
            <h3>Observation Summary</h3>
            <p><strong>Plant:</strong> {selectedPlant.product_name || selectedPlant.uid}</p>
            <p><strong>Total Records:</strong> {observations.length}</p>
            <p><strong>Latest Stage:</strong> {latestObservation ? formatStage(latestObservation.growth_stage) : 'No data'}</p>
            <p><strong>Latest Record:</strong> {latestObservation ? formatDate(latestObservation.recorded_at) : 'No data'}</p>

            
          </div>
        ) : (
          <div className="observations-empty-state compact">Select a plant to see summary.</div>
        )}
      </aside>
    </div>
  );
}