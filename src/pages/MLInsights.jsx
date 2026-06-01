import React, { useEffect, useMemo, useState } from 'react';
import './MLInsights.css';
import { apiUrl } from '../lib/api';

const MODES = [
  { key: 'hydroponic', label: 'Hydroponic Advisor' },
  { key: 'diagnosis', label: 'Plant Diagnosis' }
];

function formatDate(value) {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleString();
}

export default function MLInsights({ onNavigateTo, launchContext }) {
  const [mode, setMode] = useState('hydroponic');
  const [plantId, setPlantId] = useState('');
  const [harGrp, setHarGrp] = useState('');
  const [observationId, setObservationId] = useState('');
  const [adminToken, setAdminToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyRows, setHistoryRows] = useState([]);

  useEffect(() => {
    if (!launchContext) return;
    if (launchContext.plantId) setPlantId(String(launchContext.plantId));
    if (launchContext.harGrp) setHarGrp(String(launchContext.harGrp));
    if (launchContext.observationId) setObservationId(String(launchContext.observationId));
  }, [launchContext]);

  const endpoint = useMemo(() => {
    return mode === 'hydroponic'
      ? '/api/ml-insights/hydroponic-advice'
      : '/api/ml-insights/plant-diagnosis';
  }, [mode]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const query = new URLSearchParams({ limit: '20' });
      if (plantId) query.set('plant_id', plantId);

      const response = await fetch(apiUrl(`/api/ml-insights?${query.toString()}`));
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to load ML run history');
      }

      setHistoryRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setHistoryError(err.message);
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const runAnalysis = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body = {
        plantId: plantId || undefined,
        harGrp: harGrp || undefined,
        observationId: observationId || undefined
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      if (adminToken.trim()) {
        headers['x-local-admin-token'] = adminToken.trim();
      }

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || 'ML analysis failed');
      }

      setResult(payload);
      await loadHistory();
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-insights-page">
      <header className="ml-insights-nav">
        <button className="nav-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>
        <h1>ML Insights</h1>
        <button className="nav-btn" onClick={() => onNavigateTo('observations')}>
          Observations →
        </button>
      </header>

      <main className="ml-insights-main">
        <section className="ml-card">
          <h2>Run Analysis</h2>
          <p className="ml-subtitle">Generate hydroponic guidance or diagnosis from latest observation data.</p>

          <div className="mode-tabs" role="tablist" aria-label="ML analysis modes">
            {MODES.map(item => (
              <button
                key={item.key}
                type="button"
                className={`mode-tab ${mode === item.key ? 'active' : ''}`}
                onClick={() => setMode(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form className="ml-form" onSubmit={runAnalysis}>
            <label>
              Plant ID
              <input
                type="text"
                value={plantId}
                onChange={event => setPlantId(event.target.value)}
                placeholder="Optional if observation ID is set"
              />
            </label>

            <label>
              Harvest Group
              <input
                type="text"
                value={harGrp}
                onChange={event => setHarGrp(event.target.value)}
                placeholder="Optional"
              />
            </label>

            <label>
              Observation ID
              <input
                type="text"
                value={observationId}
                onChange={event => setObservationId(event.target.value)}
                placeholder="Optional, prioritizes exact observation"
              />
            </label>

            <label>
              Local Admin Token
              <input
                type="password"
                value={adminToken}
                onChange={event => setAdminToken(event.target.value)}
                placeholder="Only needed if LOCAL_ADMIN_TOKEN is set"
              />
            </label>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Running...' : 'Run ML Analysis'}
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="ml-card">
          <h2>Latest Result</h2>
          {!result ? (
            <p className="empty-text">Run an analysis to see recommendations.</p>
          ) : (
            <div className="result-shell">
              <div className="result-top">
                <span className={`risk-badge risk-${result.analysis?.risk_level || 'low'}`}>
                  Risk: {result.analysis?.risk_level || 'unknown'}
                </span>
                <span className="confidence-badge">Confidence: {result.analysis?.confidence ?? 'n/a'}%</span>
              </div>

              <div>
                <h3>Alerts</h3>
                {Array.isArray(result.analysis?.alerts) && result.analysis.alerts.length > 0 ? (
                  <ul>
                    {result.analysis.alerts.map((alert, index) => (
                      <li key={`${alert}-${index}`}>{alert}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No active alerts.</p>
                )}
              </div>

              <div>
                <h3>Likely Issues</h3>
                {Array.isArray(result.analysis?.likely_issues) && result.analysis.likely_issues.length > 0 ? (
                  <ul>
                    {result.analysis.likely_issues.map((issue, index) => (
                      <li key={`${issue}-${index}`}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No likely issues detected.</p>
                )}
              </div>

              <div>
                <h3>Recommendations</h3>
                {Array.isArray(result.analysis?.recommendations) && result.analysis.recommendations.length > 0 ? (
                  <ul>
                    {result.analysis.recommendations.map((rec, index) => (
                      <li key={`${rec}-${index}`}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No recommendations yet.</p>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="ml-card">
          <h2>Recent ML Runs</h2>
          {historyLoading ? (
            <p className="empty-text">Loading run history...</p>
          ) : historyError ? (
            <p className="error-text">{historyError}</p>
          ) : historyRows.length === 0 ? (
            <p className="empty-text">No runs yet.</p>
          ) : (
            <div className="history-grid">
              {historyRows.map(row => (
                <article key={row._id} className="history-card">
                  <div className="history-head">
                    <strong>{row.run_type}</strong>
                    <span>{formatDate(row.created_at)}</span>
                  </div>
                  <p>Risk: {row.analysis?.risk_level || 'unknown'}</p>
                  <p>Confidence: {row.analysis?.confidence ?? 'n/a'}%</p>
                  <p>Plant: {row.plant_id || 'n/a'}</p>
                  <p>Group: {row.har_grp || 'n/a'}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
