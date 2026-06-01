import { formatDate, formatStage, getCultivarName } from './observationUtils.js';

export default function ObservationSummary({
  observation,
  selectedHarvestGroup,
  plants,
  groupPlantTotalCount,
  selectedPlant,
  latestObservation
}) {
  if (!selectedHarvestGroup) {
    return <div className="observations-empty-state compact">Select a harvest group to see summary.</div>;
  }

  return (
    <div className="observation-summary">
      <h2>Observation Summary</h2>
      <p className="observation-footer">
        Recorded by {observation.recorded_by || 'unknown'} on {formatDate(observation.recorded_at)}
      </p>

      <div className="observation-summary-grid">
        <div className="observation-summary-item">
          <span className="summary-label">Harvest Group</span>
          <span className="summary-value">{selectedHarvestGroup.har_grp}</span>
        </div>
        <div className="observation-summary-item">
          <span className="summary-label">Room</span>
          <span className="summary-value">{selectedHarvestGroup.current_room || 'Unassigned'}</span>
        </div>
        <div className="observation-summary-item">
          <span className="summary-label">Total Plants In HG</span>
          <span className="summary-value">{plants.length}</span>
        </div>
        <div className="observation-summary-item">
          <span className="summary-label">Plants In HG</span>
          <span className="summary-value">{groupPlantTotalCount}</span>
        </div>
        <div className="observation-summary-item">
          <span className="summary-label">Selected Cultivar/Plant</span>
          <span className="summary-value">{getCultivarName(selectedPlant) || 'None selected'}</span>
        </div>
        <div className="observation-summary-item">
          <span className="summary-label">Latest Stage</span>
          <span className="summary-value">{latestObservation ? formatStage(latestObservation.growth_stage) : 'No data'}</span>
        </div>

        {observation.har_grp && (
          <div className="observation-summary-item">
            <span className="summary-label">Group</span>
            <span className="summary-value">{observation.har_grp}</span>
          </div>
        )}
      </div>
    </div>
  );
}
