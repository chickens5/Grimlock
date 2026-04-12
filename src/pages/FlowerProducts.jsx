import React, { useMemo, useState } from 'react';
import './FlowerProducts.css';
import hashHolesData from '../data/hashHoles.json';

const PRODUCT_CATEGORIES = [
  { key: 'hash-holes', label: 'Hash Holes', enabled: true },
  { key: 'pre-rolls', label: 'Pre-Rolls', enabled: false },
  { key: 'bubble-hash', label: 'Bubble Hash', enabled: false },
  { key: 'infused-joints', label: 'Infused Joints', enabled: false }
];

const HASH_HOLES = hashHolesData.rows || [];

function formatDate(dateText) {
  const normalized = String(dateText || '').replace('//', '/');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString();
}

export default function FlowerProducts({ onNavigateTo }) {
  const [selectedCategory, setSelectedCategory] = useState('hash-holes');
  const [releaseFilter, setReleaseFilter] = useState('all');

  const releaseOptions = useMemo(() => {
    const unique = new Set(HASH_HOLES.map(item => item.release));
    return ['all', ...Array.from(unique)];
  }, []);

  const visibleHashHoles = useMemo(() => {
    return HASH_HOLES.filter(item => {
      if (releaseFilter === 'all') return true;
      return item.release === releaseFilter;
    });
  }, [releaseFilter]);

  return (
    <div className="flower-products-page">
      <div className="flower-nav-bar">
        <button className="nav-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>
        <div className="flower-nav-title">Flower Products</div>
        <div className="flower-nav-actions">
          <button className="nav-btn" onClick={() => onNavigateTo('plants')}>
            Cultivars
          </button>
          <button className="nav-btn" onClick={() => onNavigateTo('concentrates')}>
            Vapes →
          </button>
        </div>
      </div>

      <main className="flower-main">
        <section className="flower-card">
          <h1>Flower Product Catalog</h1>
          <p className="flower-subtitle">
            Browse finished flower-based products by category. Hash Holes is loaded from the JSON dataset and the other categories are scaffolded.
          </p>

          <div className="flower-tabs" role="tablist" aria-label="Flower product categories">
            {PRODUCT_CATEGORIES.map(category => (
              <button
                key={category.key}
                type="button"
                className={`flower-tab ${selectedCategory === category.key ? 'active' : ''}`}
                onClick={() => category.enabled && setSelectedCategory(category.key)}
                disabled={!category.enabled}
              >
                {category.label}
                {!category.enabled ? ' (Soon)' : ''}
              </button>
            ))}
          </div>
        </section>

        {selectedCategory === 'hash-holes' ? (
          <section className="flower-card">
            <div className="flower-card-header">
              <h2>Hash Holes</h2>
              <div className="flower-filters">
                <label>
                  Release
                  <select value={releaseFilter} onChange={event => setReleaseFilter(event.target.value)}>
                    {releaseOptions.map(option => (
                      <option key={option} value={option}>
                        {option === 'all' ? 'All Releases' : option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="table-wrap">
              <table className="flower-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hash Hole Name</th>
                    <th>Release</th>
                    <th>Concentrate Infusion</th>
                    <th>Flower Strain (1.5g)</th>
                    <th>Concentrate Strain (0.5g)</th>
                    <th>Link to Lab Results</th>
                    <th>Test Date</th>
                    <th>Total THC %</th>
                    <th>Total Terpene %</th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHashHoles.map(row => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.hashHoleName}</td>
                      <td>{row.release}</td>
                      <td>{row.infusion}</td>
                      <td>{row.flowerStrain}</td>
                      <td>{row.concentrateStrain}</td>
                      <td>
                        <a href="#" className="lab-link" onClick={event => event.preventDefault()}>
                          {row.labResultLabel}
                        </a>
                      </td>
                      <td>{formatDate(row.testDate)}</td>
                      <td>{row.totalThcPct}</td>
                      <td>{row.totalTerpenePct}</td>
                      <td>{row.firstTerpene}</td>
                      <td>{row.secondTerpene}</td>
                      <td>{row.thirdTerpene}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visibleHashHoles.length === 0 && (
              <p className="empty-message">No hash holes match the selected release.</p>
            )}
          </section>
        ) : (
          <section className="flower-card">
            <h2>Coming Soon</h2>
            <p className="flower-subtitle">
              This category is scaffolded and ready for data wiring when you are ready.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
