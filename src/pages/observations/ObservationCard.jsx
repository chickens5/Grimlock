import ObservationSummary from './ObservationSummary.jsx';
import ObservationCardDetails from './ObservationCardDetails.jsx';
import { formatDate, formatStage, getCultivarName } from './observationUtils.js';

export default function ObservationCard({
  observation,
  selectedHarvestGroup,
  selectedPlant,
  plants,
  groupPlantTotalCount,
  latestObservation,
  resolveImageUrl,
  onEdit,
  onDelete,
  formSubmitting
}) {
  return (
    <article className="observation-card">
      <div className="observation-card-shell">
        <div className="observation-card-header">
          <div>
            <h2>Plant: {observation.plant_name || getCultivarName(selectedPlant) || 'Unknown'}</h2>
            <h3>Growth Stage: {formatStage(observation.growth_stage)}</h3>
            <p className="observation-date">Observed: {formatDate(observation.recorded_at)}</p>
            {observation.har_grp && <p className="observation-date">Group: {observation.har_grp}</p>}
          </div>

          <div className="observation-card-actions">
            {typeof observation.data_quality === 'number' && (
              <span className="quality-badge">Data Quality Score: {observation.data_quality}/10</span>
            )}
            <button type="button" className="ghost-btn small" onClick={() => onEdit(observation)}>
              Edit
            </button>
            <button
              type="button"
              className="danger-btn small"
              onClick={() => onDelete(observation._id)}
              disabled={formSubmitting}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="observation-card-layout">
          <ObservationSummary
            observation={observation}
            selectedHarvestGroup={selectedHarvestGroup}
            plants={plants}
            groupPlantTotalCount={groupPlantTotalCount}
            selectedPlant={selectedPlant}
            latestObservation={latestObservation}
          />

          <ObservationCardDetails
            observation={observation}
            resolveImageUrl={resolveImageUrl}
          />
        </div>
      </div>
    </article>
  );
}
