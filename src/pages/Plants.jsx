import React, { useState, useEffect } from 'react';
import './Plants.css';
import { apiUrl } from '../lib/api';

const STRAIN_STATUS_FILTERS = ['all', 'R&D', 'House', 'Premier', 'Retired'];

export default function Plants({ onNavigateTo }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPlantId, setExpandedPlantId] = useState(null);
  const [concentrates, setConcentrates] = useState([]);
  const [vibeClusterData, setVibeClusterData] = useState({});
  const [selectedStrainStatus, setSelectedStrainStatus] = useState('all');

  useEffect(() => {
    fetchPlants();
    fetchConcentrates();
    fetchVibeClusterData();
  }, [selectedStrainStatus]);

  const fetchPlants = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStrainStatus !== 'all') {
        params.set('strain_status', selectedStrainStatus);
      }

      const query = params.toString();
      const response = await fetch(apiUrl(`/api/plants${query ? `?${query}` : ''}`));
      if (!response.ok) throw new Error('Failed to fetch plants');
      const data = await response.json();
      setPlants(data);
      setExpandedPlantId(current => (data.some(plant => plant._id === current) ? current : null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConcentrates = async () => {
    try {
      const response = await fetch(apiUrl('/api/concentrates'));
      if (response.ok) {
        const data = await response.json();
        setConcentrates(data);
      }
    } catch (err) {
      console.error('Failed to fetch concentrates:', err);
    }
  };

  const fetchVibeClusterData = async () => {
    try {
      const response = await fetch(apiUrl('/api/concentrates/vibe-clusters'));
      if (response.ok) {
        const data = await response.json();
        setVibeClusterData(data);
      }
    } catch (err) {
      console.error('Failed to fetch VIBE cluster data:', err);
    }
  };

  const expandedPlant = expandedPlantId 
    ? plants.find(p => p._id === expandedPlantId) 
    : null;

  const plantConcentrates = expandedPlant
    ? concentrates.filter(c => expandedPlant.concentrates?.includes(c._id))
    : [];

  const getClusterInfo = (cluster) => {
    return vibeClusterData[cluster] || null;
  };

  if (loading) return <div className="plants-container"><p>Loading plants...</p></div>;
  if (error) return <div className="plants-container"><p className="error">Error: {error}</p></div>;

  return (
    <div className="plants-layout">
      {/* Navigation Bar */}
      <div className="plants-nav-bar">
        <button className="nav-btn home-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>
        <div className="nav-title">Cannabaceae Research Database</div>
        <button className="nav-btn concentrates-btn" onClick={() => onNavigateTo('concentrates')}>
          Vapes → 
        </button>
      </div>

      {/* Left Sidebar - Plant List */}
      <div className="plants-sidebar">
        <h2>Plants</h2>
        <div className="plants-filter-row">
          {STRAIN_STATUS_FILTERS.map(status => (
            <button
              key={status}
              type="button"
              className={`strain-filter-btn ${selectedStrainStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStrainStatus(status)}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
        <div className="plants-list">
          {plants.length === 0 ? (
            <div className="no-plants">
              <p>No plants in database yet.</p>
            </div>
          ) : (
            plants.map(plant => (
              <div 
                key={plant._id} 
                className={`plant-list-item ${expandedPlantId === plant._id ? 'active' : ''}`}
                onClick={() => setExpandedPlantId(expandedPlantId === plant._id ? null : plant._id)}
              >
                {plant.strain_image && (
                  <img className="list-strain-image" src={plant.strain_image} alt={plant.product_name || plant.uid} />
                )}
                <div className="list-item-header">
                  <h4>{plant.product_name || plant.genotype?.strain_name || 'Unknown Strain'}</h4>
                  <span className="list-item-id">{plant.uid}</span>
                </div>
                {plant.strain_status && (
                  <span className="strain-status-badge">{plant.strain_status}</span>
                )}
                {plant.vibe_cluster && plant.vibe_cluster !== 'unclassified' && (
                  <span className="vibe-badge">{plant.vibe_cluster}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Middle - Expanded Details */}
      {expandedPlant && (
        <div className="plants-middle">
          <button 
            className="close-btn"
            onClick={() => setExpandedPlantId(null)}
          >
            ✕
          </button>

          <div className="expanded-content">
            {expandedPlant.strain_image && (
              <img className="expanded-strain-image" src={expandedPlant.strain_image} alt={expandedPlant.product_name || expandedPlant.uid} />
            )}
            <h2>{expandedPlant.product_name || expandedPlant.genotype?.strain_name || 'Unknown Strain'}</h2>
            <p className="plant-id">{expandedPlant.uid}</p>

            {/* Genotype Section */}
            <div className="section">
              <h3>Genotype</h3>
              <div className="section-content">
                {expandedPlant.strain_status && (
                  <p><strong>Status:</strong> {expandedPlant.strain_status}</p>
                )}
                {expandedPlant.genotype?.breeder && (
                  <p><strong>Breeder:</strong> {expandedPlant.genotype.breeder}</p>
                )}
                {expandedPlant.genotype?.lineage && expandedPlant.genotype.lineage.length > 0 && (
                  <p><strong>Lineage:</strong> {expandedPlant.genotype.lineage.join(' × ')}</p>
                )}
                {expandedPlant.genotype?.ploidy && (
                  <p><strong>Ploidy:</strong> {expandedPlant.genotype.ploidy}</p>
                )}
              </div>
            </div>

            {/* VIBE Cluster Section */}
            {expandedPlant.vibe_cluster && expandedPlant.vibe_cluster !== 'unclassified' && (
              <div className="section">
                <h3>VIBE Cluster: {expandedPlant.vibe_cluster}</h3>
                <div className="section-content">
                  {getClusterInfo(expandedPlant.vibe_cluster) && (
                    <>
                      <p><strong>Primary Terpene Drivers:</strong></p>
                      <p className="terpenes">
                        {getClusterInfo(expandedPlant.vibe_cluster).primary_terpene_drivers.join(', ')}
                      </p>
                      <p><strong>Tasting Notes:</strong></p>
                      <p className="tasting-notes">
                        {getClusterInfo(expandedPlant.vibe_cluster).tasting_notes.join(', ')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Concentrates Section */}
            {plantConcentrates.length > 0 && (
              <div className="section">
                <h3>Concentrates ({plantConcentrates.length})</h3>
                <div className="concentrates-list">
                  {plantConcentrates.map(conc => (
                    <div key={conc._id} className="concentrate-item">
                      <div className="concentrate-header">
                        <div>
                          <h4>{conc.product_name || conc.uid}</h4>
                          <p className="concentrate-uid">{conc.uid}</p>
                        </div>
                        <span className="status-badge" data-status={conc.status}>
                          {conc.status}
                        </span>
                      </div>
                      {conc.type && (
                        <p><strong>Type:</strong> {conc.type}</p>
                      )}
                      {conc.lineage && conc.lineage.length > 0 && (
                        <p><strong>Lineage:</strong> {conc.lineage.join(' × ')}</p>
                      )}
                      {conc.vibe_cluster && (
                        <p><strong>Cluster:</strong> {conc.vibe_cluster}</p>
                      )}
                      {conc.terpenes?.primary_drivers && conc.terpenes.primary_drivers.length > 0 && (
                        <p><strong>Terpenes:</strong> {conc.terpenes.primary_drivers.join(', ')}</p>
                      )}
                      {conc.potency && (
                        <>
                          {conc.potency.thc_percentage && (
                            <p><strong>THC:</strong> {conc.potency.thc_percentage}%</p>
                          )}
                          {conc.potency.cbd_percentage && (
                            <p><strong>CBD:</strong> {conc.potency.cbd_percentage}%</p>
                          )}
                        </>
                      )}
                      {conc.yield && (
                        <p><strong>Yield:</strong> {conc.yield.yield_percentage?.toFixed(2)}%</p>
                      )}
                      {conc.batch_number && (
                        <p><strong>Batch:</strong> {conc.batch_number}</p>
                      )}
                      {conc.lab_url && (
                        <p>
                          <a 
                            href={conc.lab_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="lab-link"
                          >
                            Lab Analysis →
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags & Notes */}
            {expandedPlant.tags && expandedPlant.tags.length > 0 && (
              <div className="section">
                <h3>Tags</h3>
                <div className="plant-tags">
                  {expandedPlant.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {expandedPlant.notes && (
              <div className="section">
                <h3>Notes</h3>
                <p className="plant-notes">{expandedPlant.notes}</p>
              </div>
            )}

            <p className="plant-date">
              Added: {new Date(expandedPlant.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Right Sidebar - Empty or additional info */}
      <div className="plants-right">
        {expandedPlant ? (
          <div className="right-content">
            <h3>Summary</h3>
            <p><strong>UID:</strong> {expandedPlant.uid}</p>
            <p><strong>Status:</strong> {expandedPlant.strain_status || 'Unknown'}</p>
            <p><strong>Sex:</strong> {expandedPlant.genotype?.sex || 'Unknown'}</p>
            {expandedPlant.vibe_cluster !== 'unclassified' && (
              <p><strong>Cluster:</strong> {expandedPlant.vibe_cluster}</p>
            )}
            <p><strong>Concentrates:</strong> {plantConcentrates.length}</p>
          </div>
        ) : (
          <div className="right-placeholder">
            <p>Select a plant to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
