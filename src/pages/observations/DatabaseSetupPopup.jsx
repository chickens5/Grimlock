import React from 'react';

const DB_SETUP_STEPS = [
  'Create a MongoDB Atlas cluster, or point MONGODB_URI at your own MongoDB instance.',
  'Create a database user with read/write access to the Grimlock database.',
  'Create a root .env file with MONGODB_URI and PORT.',
  'Optionally add LOCAL_ADMIN_TOKEN and OBSERVATION_WRITE_TOKEN for local write protection.',
  'Start the backend with npm run dev:server, or run the full app with npm run dev:all.'
];

export default function DatabaseSetupPopup({ open, error, onRetry, onClose }) {
  if (!open) return null;

  return (
    <div className="crud-popup-backdrop">
      <div className="crud-popup-card setup-popup-card">
        <h3>How to connect Observations</h3>
        <p>
          This workspace loads live harvest groups and observations from your API. The data will populate
          automatically once the backend can connect to MongoDB and your root <code>.env</code> is configured.
        </p>
        <ol className="setup-step-list">
          {DB_SETUP_STEPS.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="setup-env-block">
          <p className="crud-popup-subtext">Example .env</p>
          <pre>{`MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/grimlock\nPORT=5000\nLOCAL_ADMIN_TOKEN=change-me-local-admin\nOBSERVATION_WRITE_TOKEN=change-me-observation-write\nOBSERVATION_SECURE_READS=false`}</pre>
        </div>
        <p className="crud-popup-subtext">Current error: {error}</p>
        <div className="observations-setup-actions">
          <button className="primary-btn" type="button" onClick={onRetry}>
            Retry connection
          </button>
          <button className="ghost-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
