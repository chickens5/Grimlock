import { getCultivarName } from './observationUtils.js';

export default function HarvestGroupPlantForm({
  selectedHarvestGroup,
  plants,
  selectedPlant,
  isManagingExistingPlant,
  selectedPlantId,
  groupPlantFormState,
  newCultivarName,
  groupPlantFormSubmitting,
  onGroupPlantFormChange,
  onSetNewCultivarName,
  onCreateGroupPlant,
  onDeleteGroupPlant,
  onStartNewPlant,
  onCancelNewPlant
}) {
  return (
    <section className="editor-card manage-card">
      <div className="sidebar-section-header">
        <h3>Plants In Group</h3>
        <span>{selectedHarvestGroup ? plants.length : 0}</span>
      </div>
      <p className="manage-helper-text">
        {selectedHarvestGroup
          ? isManagingExistingPlant
            ? `Editing ${getCultivarName(selectedPlant) || 'plant'}`
            : `Adding a new plant to ${selectedHarvestGroup.har_grp}`
          : 'Select or create a harvest group first'}
      </p>

      {selectedHarvestGroup ? (
        <form className="data-form" onSubmit={onCreateGroupPlant}>
          <div className="form-grid">
            <label>
              Select Plant (to edit or delete)
              <select
                name="plant_id"
                value={isManagingExistingPlant ? selectedPlantId || '' : ''}
                onChange={onGroupPlantFormChange}
              >
                <option value="">Add New</option>
                {plants.map(plant => (
                  <option key={plant._id} value={plant._id}>
                    {getCultivarName(plant)} ({plant.plant_count} plants)
                  </option>
                ))}
              </select>
            </label>

            {isManagingExistingPlant ? (
              <label>
                Cultivar Name
                <input
                  type="text"
                  name="cultivar_name"
                  value={groupPlantFormState.cultivar_name}
                  onChange={onGroupPlantFormChange}
                  placeholder="Cultivar name"
                />
              </label>
            ) : (
              <label>
                Cultivar Name (for new plant)
                <input
                  type="text"
                  name="new_cultivar_name"
                  value={newCultivarName}
                  onChange={event => onSetNewCultivarName(event.target.value)}
                  placeholder="Pimp Juice"
                />
              </label>
            )}

            <label>
              Plant Count
              <input
                type="number"
                min="1"
                name="plant_count"
                value={groupPlantFormState.plant_count}
                onChange={onGroupPlantFormChange}
              />
            </label>

            <label>
              Current Room
              <input
                type="text"
                name="current_room"
                value={groupPlantFormState.current_room}
                onChange={onGroupPlantFormChange}
              />
            </label>

            <label className="form-span-full">
              Notes
              <textarea
                rows="2"
                name="notes"
                value={groupPlantFormState.notes}
                onChange={onGroupPlantFormChange}
              />
            </label>
          </div>

          <div className="inline-actions">
            {isManagingExistingPlant ? (
              <button type="button" className="ghost-btn small" onClick={onStartNewPlant} disabled={groupPlantFormSubmitting}>
                Add New Plant
              </button>
            ) : (
              <button type="button" className="ghost-btn small" onClick={onCancelNewPlant} disabled={groupPlantFormSubmitting || plants.length === 0}>
                Cancel New Plant
              </button>
            )}
          </div>

          <div className="form-actions">
            <button className="primary-btn" type="submit" disabled={groupPlantFormSubmitting}>
              {groupPlantFormSubmitting ? 'Saving...' : isManagingExistingPlant ? 'Update Plant' : 'Add Plant'}
            </button>
            <button
              className="danger-btn"
              type="button"
              onClick={onDeleteGroupPlant}
              disabled={groupPlantFormSubmitting || !isManagingExistingPlant}
            >
              Delete Selected Plant
            </button>
          </div>
        </form>
      ) : (
        <div className="observations-empty-state compact">Select a harvest group first.</div>
      )}
    </section>
  );
}
