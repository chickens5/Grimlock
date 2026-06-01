import { STAGE_LABELS, getCultivarName } from './observationUtils.js';

export default function ObservationEditorForm({
  editingObservationId,
  selectedPlant,
  selectedHarvestGroup,
  formState,
  onFormChange,
  onObservationImageChange,
  observationImageFile,
  observationImagePreviewUrl,
  resolveImageUrl,
  formSubmitting,
  onSubmit,
  onReset
}) {
  return (
    <section className="editor-card inventory-editor">
      <div className="editor-card-header">
        <div className="section">
          <h2>{editingObservationId ? 'Edit Observation' : 'Create Observation for:'}</h2>
          <h3>{getCultivarName(selectedPlant)} ({selectedHarvestGroup.har_grp})</h3>
        </div>
        <div className="form-actions">
          {editingObservationId && (
            <button type="button" className="ghost-btn" onClick={onReset}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <form className="data-form" onSubmit={onSubmit}>
        <div className="form-grid form-grid-wide">
          <label>
            Recorded At
            <input
              type="datetime-local"
              name="recorded_at"
              value={formState.recorded_at}
              onChange={onFormChange}
            />
          </label>

          <label>
            Growth Stage
            <select name="growth_stage" value={formState.growth_stage} onChange={onFormChange}>
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            Data Quality (0-10)
            <input
              type="number"
              name="data_quality"
              min="0"
              max="10"
              step="0.1"
              value={formState.data_quality}
              onChange={onFormChange}
            />
          </label>

          <label>
            Node Count
            <input type="number" name="node_count" min="0" value={formState.node_count} onChange={onFormChange} />
          </label>

          <label>
            Height (cm)
            <input type="number" name="height_cm" step="0.1" value={formState.height_cm} onChange={onFormChange} />
          </label>

          <label>
            Canopy Width (cm)
            <input type="number" name="canopy_width_cm" step="0.1" value={formState.canopy_width_cm} onChange={onFormChange} />
          </label>

          <label>
            Leaf Count
            <input type="number" name="leaf_count" min="0" value={formState.leaf_count} onChange={onFormChange} />
          </label>

          <label>
            Health Score (0-10)
            <input
              type="number"
              name="overall_score"
              min="0"
              max="10"
              step="0.1"
              value={formState.overall_score}
              onChange={onFormChange}
            />
          </label>

          <label>
            Temp (C)
            <input type="number" name="temp_c" step="0.1" value={formState.temp_c} onChange={onFormChange} />
          </label>

          <label>
            Humidity (%)
            <input type="number" name="humidity_pct" step="0.1" value={formState.humidity_pct} onChange={onFormChange} />
          </label>

          <label>
            VPD (kPa)
            <input type="number" name="vpd_kpa" step="0.01" value={formState.vpd_kpa} onChange={onFormChange} />
          </label>

          <label>
            Recorded By
            <input
              type="text"
              name="recorded_by"
              value={formState.recorded_by}
              onChange={onFormChange}
              placeholder="Operator name"
            />
          </label>

          <label className="form-span-full">
            Observation Image
            <input type="file" accept="image/*" onChange={onObservationImageChange} />
            {(observationImageFile || formState.observ_img) && (
              <img
                className="manage-preview-image"
                src={observationImageFile ? observationImagePreviewUrl : resolveImageUrl(formState.observ_img)}
                alt="Observation preview"
              />
            )}
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-btn" type="submit" disabled={formSubmitting}>
            {formSubmitting ? 'Saving...' : editingObservationId ? 'Update Observation' : 'Create Observation'}
          </button>
          <button className="ghost-btn" type="button" onClick={onReset} disabled={formSubmitting}>
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}
