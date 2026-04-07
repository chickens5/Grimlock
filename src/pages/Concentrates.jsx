import React, { useState, useEffect } from 'react';
import './Concentrates.css';

export default function Concentrates({ onNavigateTo }) {
  const [concentrates, setConcetrates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterCluster, setFilterCluster] = useState('all');
  const [vibeClusterData, setVibeClusterData] = useState({});

  useEffect(() => {
    fetchConcentrates();
    fetchVibeClusterData();
  }, []);

  const fetchConcentrates = async () => {
    try {
      const response = await fetch('/api/concentrates');
      if (!response.ok) throw new Error('Failed to fetch concentrates');
      const data = await response.json();
      setConcetrates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVibeClusterData = async () => {
    try {
      const response = await fetch('/api/concentrates/vibe-clusters');
      if (response.ok) {
        const data = await response.json();
        setVibeClusterData(data);
      }
    } catch (err) {
      console.error('Failed to fetch VIBE cluster data:', err);
    }
  };

  const filteredConcentrates = filterCluster === 'all'
    ? concentrates
    : concentrates.filter(c => c.vibe_cluster === filterCluster);

  const clusters = ['all', ...Object.keys(vibeClusterData)];

  if (loading) return <div className="concentrates-container"><p>Loading concentrates...</p></div>;
  if (error) return <div className="concentrates-container"><p className="error">Error: {error}</p></div>;

  return (
    <div className="concentrates-layout">
      {/* Navigation Bar */}
      <div className="concentrates-nav-bar">
        <button className="nav-btn home-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>
        <div className="nav-title">Vape & Concentrates</div>
        <button className="nav-btn plants-btn" onClick={() => onNavigateTo('plants')}>
          Plants →
        </button>
      </div>

      {/* Header */}
      <div className="concentrates-header">
        <h1>Vape & Concentrates</h1>
        <p className="subtitle">Premium Extract Database</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <h3>Filter by VIBE Cluster:</h3>
        <div className="filter-buttons">
          {clusters.map(cluster => (
            <button
              key={cluster}
              className={`filter-btn ${filterCluster === cluster ? 'active' : ''}`}
              onClick={() => setFilterCluster(cluster)}
            >
              {cluster === 'all' ? 'All' : cluster}
            </button>
          ))}
        </div>
      </div>

      {/* Concentrates Grid */}
      <div className="concentrates-container">
        {filteredConcentrates.length === 0 ? (
          <div className="no-concentrates">
            <p>No concentrates found</p>
          </div>
        ) : (
          <div className="concentrates-grid">
            {filteredConcentrates.map(conc => (
              <div
                key={conc._id}
                className={`concentrate-card ${expandedId === conc._id ? 'expanded' : ''}`}
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="header-top">
                    <h3>{conc.product_name || conc.uid}</h3>
                    <span className="status-badge" data-status={conc.status}>
                      {conc.status}
                    </span>
                  </div>
                  {conc.strain_image && (
                    <img className="strain-image" src={conc.strain_image} alt={conc.product_name || conc.uid} />
                  )}
                  <p className="uid-text">{conc.uid}</p>
                </div>

                {/* Quick Info */}
                <div className="quick-info">
                  <div className="info-item">
                    <span className="label">Type:</span>
                    <span className="value">{conc.type}</span>
                  </div>
                  {conc.vibe_cluster && (
                    <div className="info-item">
                      <span className="label">Cluster:</span>
                      <span className="value vibe-tag">{conc.vibe_cluster}</span>
                    </div>
                  )}
                </div>

                {/* Collapsed View - Potency */}
                <div className="potency-summary">
                  {conc.potency?.thc_percentage && (
                    <div className="potency-item">
                      <span className="potency-label">THC</span>
                      <span className="potency-value">{conc.potency.thc_percentage}%</span>
                    </div>
                  )}
                  {conc.potency?.cbd_percentage && (
                    <div className="potency-item">
                      <span className="potency-label">CBD</span>
                      <span className="potency-value">{conc.potency.cbd_percentage}%</span>
                    </div>
                  )}
                </div>

                {/* Expand Button */}
                <button
                  className="expand-btn"
                  onClick={() => setExpandedId(expandedId === conc._id ? null : conc._id)}
                >
                  {expandedId === conc._id ? '▲ Collapse' : '▼ Details'}
                </button>

                {/* Expanded Content */}
                {expandedId === conc._id && (
                  <div className="expanded-section">
                    {/* Lineage */}
                    {conc.lineage && conc.lineage.length > 0 && (
                      <div className="detail-section">
                        <h4>Lineage</h4>
                        <p className="lineage">{conc.lineage.join(' × ')}</p>
                      </div>
                    )}

                    {/* VIBE Cluster Details */}
                    {conc.vibe_cluster && vibeClusterData[conc.vibe_cluster] && (
                      <div className="detail-section">
                        <h4>VIBE Cluster Details</h4>
                        <div className="cluster-info">
                          <p>
                            <strong>Primary Terpenes:</strong>{' '}
                            {vibeClusterData[conc.vibe_cluster].primary_terpene_drivers.join(', ')}
                          </p>
                          <p>
                            <strong>Tasting Notes:</strong>{' '}
                            {vibeClusterData[conc.vibe_cluster].tasting_notes.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Terpene Profile */}
                    {conc.terpenes?.full_profile && conc.terpenes.full_profile.length > 0 && (
                      <div className="detail-section">
                        <h4>Terpene Profile</h4>
                        <div className="terpene-list">
                          {conc.terpenes.full_profile.map((terp, i) => (
                            <div key={i} className="terpene-item">
                              <span className="terpene-name">{terp.name}</span>
                              <div className="terpene-bar">
                                <div
                                  className="terpene-fill"
                                  style={{ width: `${terp.percentage * 100}%` }}
                                />
                              </div>
                              <span className="terpene-percent">{(terp.percentage * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Potency Details */}
                    {conc.potency && (
                      <div className="detail-section">
                        <h4>Potency Analysis</h4>
                        <div className="potency-details">
                          {conc.potency.thc_percentage && (
                            <p><strong>THC:</strong> {conc.potency.thc_percentage}%</p>
                          )}
                          {conc.potency.cbd_percentage && (
                            <p><strong>CBD:</strong> {conc.potency.cbd_percentage}%</p>
                          )}
                          {conc.potency.total_terpenes && (
                            <p><strong>Total Terpenes:</strong> {conc.potency.total_terpenes}%</p>
                          )}
                        </div>
                      </div>
                    )}

            

                    {/* Batch Info */}
                    {conc.batch_number && (
                      <div className="detail-section">
                        <h4>Batch Information</h4>
                        <p><strong>Batch #:</strong> {conc.batch_number}</p>
                      </div>
                    )}

                    {/* Lab Analysis */}
                    {conc.lab_url && (
                      <div className="detail-section">
                        <h4>Lab Analysis</h4>
                        <p>
                          <a 
                            href={conc.lab_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="lab-url-link"
                          >
                            View Certificate of Analysis →
                          </a>
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {conc.notes && (
                      <div className="detail-section">
                        <h4>Notes</h4>
                        <p className="notes-text">{conc.notes}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {conc.tags && conc.tags.length > 0 && (
                      <div className="detail-section">
                        <h4>Tags</h4>
                        <div className="tags-container">
                          {conc.tags.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date Created */}
                    <div className="detail-section date-section">
                      <p className="date-text">
                        Created: {new Date(conc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
