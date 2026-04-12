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

const EMPTY_GROUP_FORM = {
  har_grp: '',
  current_room: '',
  notes: ''
};

const EMPTY_GROUP_PLANT_FORM = {
  strain_name: '',
  plant_count: 1,
  current_room: '',
  notes: ''
};

const EMPTY_OBSERVATION_FORM = {
  recorded_at: '',
  growth_stage: 'vegetative',
  node_count: '',
  height_cm: '',
  canopy_width_cm: '',
  leaf_count: '',
  overall_score: '',
  temp_c: '',
  humidity_pct: '',
  vpd_kpa: '',
  data_quality: '',
  recorded_by: ''
};

function toOptionalNumber(value) {
  if (value === '' || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toDateTimeInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - localOffsetMs).toISOString().slice(0, 16);
}

function buildObservationPayload(formState, selectedHarvestGroup, selectedPlant) {
  return {
    har_grp: selectedHarvestGroup?.har_grp,
    plant_id: String(selectedPlant?._id || ''),
    hg_plant_id: String(selectedPlant?._id || ''),
    plant_name: selectedPlant?.strain_name,
    recorded_at: formState.recorded_at ? new Date(formState.recorded_at).toISOString() : new Date().toISOString(),
    growth_stage: formState.growth_stage,
    morphology: {
      node_count: toOptionalNumber(formState.node_count),
      height_cm: toOptionalNumber(formState.height_cm),
      canopy_width_cm: toOptionalNumber(formState.canopy_width_cm),
      leaf_count: toOptionalNumber(formState.leaf_count)
    },
    health: {
      overall_score: toOptionalNumber(formState.overall_score)
    },
    environment_snapshot: {
      temp_c: toOptionalNumber(formState.temp_c),
      humidity_pct: toOptionalNumber(formState.humidity_pct),
      vpd_kpa: toOptionalNumber(formState.vpd_kpa)
    },
    data_quality: toOptionalNumber(formState.data_quality),
    recorded_by: formState.recorded_by || undefined
  };
}

function mapObservationToForm(observation) {
  return {
    recorded_at: toDateTimeInputValue(observation.recorded_at),
    growth_stage: observation.growth_stage || 'vegetative',
    node_count: observation.morphology?.node_count ?? observation.morphology?.cola_count ?? '',
    height_cm: observation.morphology?.height_cm ?? '',
    canopy_width_cm: observation.morphology?.canopy_width_cm ?? '',
    leaf_count: observation.morphology?.leaf_count ?? '',
    overall_score: observation.health?.overall_score ?? '',
    temp_c: observation.environment_snapshot?.temp_c ?? '',
    humidity_pct: observation.environment_snapshot?.humidity_pct ?? '',
    vpd_kpa: observation.environment_snapshot?.vpd_kpa ?? '',
    data_quality: observation.data_quality ?? '',
    recorded_by: observation.recorded_by ?? ''
  };
}

function mapHarvestGroupToForm(group) {
  if (!group) return EMPTY_GROUP_FORM;
  return {
    har_grp: group.har_grp || '',
    current_room: group.current_room || '',
    notes: group.notes || ''
  };
}

function mapHarvestPlantToForm(plant) {
  if (!plant) return EMPTY_GROUP_PLANT_FORM;
  return {
    strain_name: plant.strain_name || '',
    plant_count: plant.plant_count || 1,
    current_room: plant.current_room || '',
    notes: plant.notes || ''
  };
}

export default function Observations({ onNavigateTo }) {
  const [harvestGroups, setHarvestGroups] = useState([]);
  const [selectedHarvestGroupId, setSelectedHarvestGroupId] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);

  const [groupFormState, setGroupFormState] = useState(EMPTY_GROUP_FORM);
  const [newHarvestGroupKey, setNewHarvestGroupKey] = useState('');
  const [groupFormSubmitting, setGroupFormSubmitting] = useState(false);
  const [groupPlantFormState, setGroupPlantFormState] = useState(EMPTY_GROUP_PLANT_FORM);
  const [newStrainName, setNewStrainName] = useState('');
  const [groupPlantFormSubmitting, setGroupPlantFormSubmitting] = useState(false);

  const [observations, setObservations] = useState([]);
  const [harvestLoading, setHarvestLoading] = useState(true);
  const [observationsLoading, setObservationsLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingObservationId, setEditingObservationId] = useState(null);
  const [formState, setFormState] = useState(EMPTY_OBSERVATION_FORM);
  const [viewMode, setViewMode] = useState('observations'); // 'observations' or 'manage'
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const selectedHarvestGroup = useMemo(
    () => harvestGroups.find(group => group._id === selectedHarvestGroupId) || null,
    [harvestGroups, selectedHarvestGroupId]
  );

  const plants = selectedHarvestGroup?.plants || [];

  const selectedPlant = useMemo(
    () => plants.find(plant => String(plant._id) === String(selectedPlantId)) || null,
    [plants, selectedPlantId]
  );

  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  const requestJson = async (path, options = {}, fallbackMessage = 'Request failed') => {
    const response = await fetch(apiUrl(path), options);
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      throw new Error(payload?.message || fallbackMessage);
    }

    return payload;
  };

  const loadObservationsForSelection = async (plantId, harGrp) => {
    const params = new URLSearchParams({ har_grp: harGrp });
    const data = await requestJson(
      `/api/observations/plant/${plantId}?${params.toString()}`,
      {},
      'Failed to fetch observations'
    );
    setObservations(Array.isArray(data) ? data : []);
  };

  const loadHarvestGroups = async ({ preferredGroupId, preferredPlantId } = {}) => {
    const data = await requestJson('/api/harvest-groups', {}, 'Failed to fetch harvest groups');
    const groups = Array.isArray(data) ? data : [];
    setHarvestGroups(groups);

    const resolvedGroup =
      groups.find(group => group._id === preferredGroupId) ||
      groups.find(group => group._id === selectedHarvestGroupId) ||
      groups[0] ||
      null;

    const nextGroupId = resolvedGroup?._id || null;
    setSelectedHarvestGroupId(nextGroupId);

    if (!resolvedGroup) {
      setSelectedPlantId(null);
      return;
    }

    const groupPlants = resolvedGroup.plants || [];
    const resolvedPlant =
      groupPlants.find(plant => String(plant._id) === String(preferredPlantId)) ||
      groupPlants.find(plant => String(plant._id) === String(selectedPlantId)) ||
      groupPlants[0] ||
      null;

    setSelectedPlantId(resolvedPlant?._id || null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        await loadHarvestGroups({});
      } catch (err) {
        setError(err.message);
      } finally {
        setHarvestLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    setGroupFormState(mapHarvestGroupToForm(selectedHarvestGroup));
  }, [selectedHarvestGroup]);

  useEffect(() => {
    setGroupPlantFormState(mapHarvestPlantToForm(selectedPlant));
    setNewStrainName('');
  }, [selectedPlant]);

  useEffect(() => {
    if (!selectedPlantId || !selectedHarvestGroup) {
      setObservations([]);
      setEditingObservationId(null);
      setFormState(EMPTY_OBSERVATION_FORM);
      return;
    }

    const fetchObservations = async () => {
      setObservationsLoading(true);
      setError(null);

      try {
        await loadObservationsForSelection(selectedPlantId, selectedHarvestGroup.har_grp);
      } catch (err) {
        setError(err.message);
        setObservations([]);
      } finally {
        setObservationsLoading(false);
      }
    };

    fetchObservations();
  }, [selectedPlantId, selectedHarvestGroup]);

  const refreshCurrentData = async ({ preferredGroupId, preferredPlantId } = {}) => {
    await loadHarvestGroups({ preferredGroupId, preferredPlantId });
  };

  const resetForm = () => {
    setEditingObservationId(null);
    setFormState(EMPTY_OBSERVATION_FORM);
  };

  const handleEditObservation = (observation) => {
    setEditingObservationId(observation._id);
    setFormState(mapObservationToForm(observation));
  };

  const handleDeleteObservation = async (observationId) => {
    if (!window.confirm('Delete this observation? This cannot be undone.')) {
      return;
    }

    setFormSubmitting(true);
    clearMessages();

    try {
      await requestJson(`/api/observations/${observationId}`, {
        method: 'DELETE'
      }, 'Failed to delete observation');

      setNotice('Observation deleted.');
      if (editingObservationId === observationId) {
        resetForm();
      }

      await refreshCurrentData({ preferredGroupId: selectedHarvestGroup?._id, preferredPlantId: selectedPlant?._id });
      if (selectedPlantId && selectedHarvestGroup?.har_grp) {
        await loadObservationsForSelection(selectedPlantId, selectedHarvestGroup.har_grp);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState(current => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPlantId || !selectedHarvestGroup || !selectedPlant) {
      setError('Select a harvest group and plant before saving.');
      return;
    }

    setFormSubmitting(true);
    clearMessages();

    const payload = buildObservationPayload(formState, selectedHarvestGroup, selectedPlant);
    const isEditing = Boolean(editingObservationId);

    try {
      await requestJson(
        isEditing ? `/api/observations/${editingObservationId}` : '/api/observations',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        },
        'Failed to save observation'
      );

      resetForm();
      setNotice(isEditing ? 'Observation updated.' : 'Observation created.');

      await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id, preferredPlantId: selectedPlant._id });
      await loadObservationsForSelection(selectedPlantId, selectedHarvestGroup.har_grp);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleGroupFormChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'group_id') {
      // Handle group selection by ID
      const group = harvestGroups.find(group => String(group._id) === String(value));
      if (group) {
        setSelectedHarvestGroupId(group._id);
        setGroupFormState(mapHarvestGroupToForm(group));
        setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
        setNewHarvestGroupKey('');
      }
    } else if (name === 'har_grp' && !selectedHarvestGroup) {
      // Only allow har_grp changes when creating new group
      setGroupFormState(current => ({
        ...current,
        [name]: value
      }));
      setNewHarvestGroupKey(value);
    }
  };

  const handleCreateHarvestGroup = async (event) => {
    event.preventDefault();

    setGroupFormSubmitting(true);
    clearMessages();

    try {
      if (selectedHarvestGroup) {
        // Update existing group - cannot modify har_grp
        await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_room: groupFormState.current_room,
            notes: groupFormState.notes
          })
        }, 'Failed to update harvest group');

        setNotice(`Harvest group ${selectedHarvestGroup.har_grp} updated.`);
      } else {
        // Create new group
        const harGrpValue = (newHarvestGroupKey || groupFormState.har_grp || '').trim();
        if (!harGrpValue) {
          throw new Error('Provide a harvest group key.');
        }

        const createdGroup = await requestJson('/api/harvest-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            har_grp: harGrpValue,
            current_room: groupFormState.current_room,
            notes: groupFormState.notes
          })
        }, 'Failed to create harvest group');

        setNotice(`Harvest group ${createdGroup.har_grp} created.`);
        await refreshCurrentData({ preferredGroupId: createdGroup._id });
      }

      setGroupFormState(mapHarvestGroupToForm(selectedHarvestGroup || null));
      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      setNewHarvestGroupKey('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupFormSubmitting(false);
    }
  };

  const handleUpdateHarvestGroup = async () => {
    // This is now handled by handleCreateHarvestGroup
    // Keeping this for backwards compatibility but redirecting to the combined handler
    return handleCreateHarvestGroup({ preventDefault: () => {} });
  };

  const handleDeleteHarvestGroup = async () => {
    if (!selectedHarvestGroup) {
      setError('Select a harvest group to delete.');
      return;
    }

    if (!window.confirm(`Delete harvest group ${selectedHarvestGroup.har_grp}? This will also remove observations in this group.`)) {
      return;
    }

    setGroupFormSubmitting(true);
    clearMessages();

    try {
      await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}`, {
        method: 'DELETE'
      }, 'Failed to delete harvest group');

      setNotice(`Harvest group ${selectedHarvestGroup.har_grp} deleted.`);
      setGroupFormState(EMPTY_GROUP_FORM);
      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      setObservations([]);
      await refreshCurrentData({});
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupFormSubmitting(false);
    }
  };

  const handleGroupPlantFormChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'plant_id') {
      // Handle plant selection by ID
      const plant = plants.find(plant => String(plant._id) === String(value));
      if (plant) {
        setSelectedPlantId(plant._id);
        setGroupPlantFormState(mapHarvestPlantToForm(plant));
      }
    } else {
      // Handle form field changes
      setGroupPlantFormState(current => ({
        ...current,
        [name]: name === 'plant_count' ? value : value
      }));
    }
  };

  const handleCreateGroupPlant = async (event) => {
    event.preventDefault();
    if (!selectedHarvestGroup) {
      setError('Select a harvest group before adding plants.');
      return;
    }

    setGroupPlantFormSubmitting(true);
    clearMessages();

    try {
      if (selectedPlant) {
        // Update existing plant
        await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}/plants/${selectedPlant._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strain_name: groupPlantFormState.strain_name,
            plant_count: toOptionalNumber(groupPlantFormState.plant_count) || 1,
            current_room: groupPlantFormState.current_room,
            notes: groupPlantFormState.notes
          })
        }, 'Failed to update harvest-group plant');

        setNotice('Plant updated.');
      } else {
        // Create new plant
        const strainNameValue = (newStrainName || groupPlantFormState.strain_name || '').trim();
        if (!strainNameValue) {
          throw new Error('Provide a new strain name or select one from the dropdown.');
        }

        await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}/plants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strain_name: strainNameValue,
            plant_count: toOptionalNumber(groupPlantFormState.plant_count) || 1,
            current_room: groupPlantFormState.current_room,
            notes: groupPlantFormState.notes
          })
        }, 'Failed to add plant to harvest group');

        setNotice('Plant added to harvest group.');
      }

      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      setNewStrainName('');
      await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id, preferredPlantId: selectedPlant?._id });
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupPlantFormSubmitting(false);
    }
  };

  const handleUpdateGroupPlant = async () => {
    // This is now handled by handleCreateGroupPlant
    // Keeping this for backwards compatibility but redirecting to the combined handler
    return handleCreateGroupPlant({ preventDefault: () => {} });
  };

  const handleDeleteGroupPlant = async () => {
    if (!selectedHarvestGroup || !selectedPlant) {
      setError('Select a harvest-group plant to delete.');
      return;
    }

    if (!window.confirm(`Delete ${selectedPlant.strain_name} from ${selectedHarvestGroup.har_grp}?`)) {
      return;
    }

    setGroupPlantFormSubmitting(true);
    clearMessages();

    try {
      await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}/plants/${selectedPlant._id}`, {
        method: 'DELETE'
      }, 'Failed to delete harvest-group plant');

      setNotice('Harvest-group plant deleted.');
      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      resetForm();
      setObservations([]);
      await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id });
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupPlantFormSubmitting(false);
    }
  };

  const latestObservation = observations.length > 0 ? observations[0] : null;
  const groupPlantTotalCount = plants.reduce((total, plant) => total + (Number(plant.plant_count) || 0), 0);

  if (harvestLoading) {
    return <div className="observations-empty-state">Loading observation dashboard...</div>;
  }

  if (error && harvestGroups.length === 0) {
    return <div className="observations-empty-state error">Error: {error}</div>;
  }

  return (
    <div className="observations-layout">
      <div className="observations-nav-bar">
        <button className="nav-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>
        <div className="nav-title">Observations</div>
        <button className="nav-btn" onClick={() => onNavigateTo('concentrates')}>
          Vapes →
        </button>
      </div>

      <main className="observations-main">
       
        {selectedHarvestGroup ? (
          <>
          
             <div className="hg-highlight-card">
              <h1>Current Harvest Group: {selectedHarvestGroup.har_grp}</h1>
              <h1>Total Plants: {groupPlantTotalCount}</h1>
              <h2>Current Room: {selectedHarvestGroup.current_room || 'Unassigned'}</h2>
              <div className="selected-plant-meta observations-header-actions">
                    <i><strong>Latest Record:</strong> {selectedHarvestGroup.latest_recorded_at ? formatDate(selectedHarvestGroup.latest_recorded_at) : 'No data'}</i>
                    <i><strong>Total Observations:</strong> {selectedHarvestGroup.observations_count || 0}</i>
                  </div>
                </div>
              
             <div className="view-mode-tabs">
               <button
                 className={`tab-button ${viewMode === 'observations' ? 'active' : ''}`}
                 onClick={() => setViewMode('observations')}
               >
                 Observations
               </button>
               <button
                 className={`tab-button ${viewMode === 'manage' ? 'active' : ''}`}
                 onClick={() => setViewMode('manage')}
               >
                 Manage Harvest & Plants
               </button>
             </div>

            {error && <div className="error">{error}</div>}
            {notice && <div className="notice">{notice}</div>}

            {viewMode === 'observations' ? (
              <>
                <div className="observations-view">
                  <div className="selected-plant-selection">
                    <label>
                      Select Harvest Group:
                      <select value={selectedHarvestGroupId || ''} onChange={(e) => setSelectedHarvestGroupId(e.target.value)}>
                        <option value="">Choose a harvest group...</option>
                        {harvestGroups.map(group => (
                          <option key={group._id} value={group._id}>
                            {group.har_grp} (Room: {group.current_room || 'Unassigned'} • {group.plant_total_count || 0} plants)
                          </option>
                        ))}
                      </select>
                    </label>

                    {plants.length > 0 && (
                      <label>
                        Select Plant/Strain:
                        <select value={selectedPlantId || ''} onChange={(e) => setSelectedPlantId(e.target.value)}>
                          <option value="">Choose a plant...</option>
                          {plants.map(plant => (
                            <option key={plant._id} value={plant._id}>
                              {plant.strain_name} ({plant.plant_count || 1} plants)
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  {!selectedPlant ? (
                    <div className="observations-empty-state compact">Select a plant from the dropdown to manage observations.</div>
                  ) : (
                    <>
                    <div>
                    
                    </div>
                      <section className="editor-card inventory-editor">
                        <div className="editor-card-header">
                          <div className ='section'>
                            <h2>{editingObservationId ? 'Edit Observation' : 'Create Observation for:'}</h2>
                            <h3>
                               {selectedPlant.strain_name} ({selectedHarvestGroup.har_grp})  {/* displays the currently selected plant and harvest group in the form header for context */}
                            </h3>
                          </div>
                          <div className="form-actions">
                            {editingObservationId && (
                              <button type="button" className="ghost-btn" onClick={resetForm}>
                                Cancel Edit
                              </button>
                            )}
                          </div>
                        </div>

                        <form className="data-form" onSubmit={handleSubmit}>
                          <div className="form-grid form-grid-wide">
                            <label>
                              Recorded At
                              <input
                                type="datetime-local"
                                name="recorded_at"
                                value={formState.recorded_at}
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Growth Stage
                              <select name="growth_stage" value={formState.growth_stage} onChange={handleFormChange}>
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
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Node Count
                              <input
                                type="number"
                                name="node_count"
                                min="0"
                                value={formState.node_count}
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Height (cm)
                              <input
                                type="number"
                                name="height_cm"
                                step="0.1"
                                value={formState.height_cm}
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Canopy Width (cm)
                              <input
                                type="number"
                                name="canopy_width_cm"
                                step="0.1"
                                value={formState.canopy_width_cm}
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Leaf Count
                              <input
                                type="number"
                                name="leaf_count"
                                min="0"
                                value={formState.leaf_count}
                                onChange={handleFormChange}
                              />
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
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Temp (C)
                              <input
                                type="number"
                                name="temp_c"
                                step="0.1"
                                value={formState.temp_c}
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Humidity (%)
                              <input
                                type="number"
                                name="humidity_pct"
                                step="0.1"
                                value={formState.humidity_pct}
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              VPD (kPa)
                              <input
                                type="number"
                                name="vpd_kpa"
                                step="0.01"
                                value={formState.vpd_kpa}
                                onChange={handleFormChange}
                              />
                            </label>

                            <label>
                              Recorded By
                              <input
                                type="text"
                                name="recorded_by"
                                value={formState.recorded_by}
                                onChange={handleFormChange}
                                placeholder="Operator name"
                              />
                            </label>
                          </div>

                          <div className="form-actions">
                            <button className="primary-btn" type="submit" disabled={formSubmitting}>
                              {formSubmitting ? 'Saving...' : editingObservationId ? 'Update Observation' : 'Create Observation'}
                            </button>
                            <button className="ghost-btn" type="button" onClick={resetForm} disabled={formSubmitting}>
                              Clear
                            </button>
                          </div>
                        </form>
                      </section>

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
                                  <h2>Plant: {observation.plant_name}</h2>
                                  <h3>Growth Stage: {formatStage(observation.growth_stage)}</h3>
                                  
                                  <p className="observation-date">Observed: {formatDate(observation.recorded_at)}</p>
                                  {observation.har_grp && (
                                    <p className="observation-date">Group: {observation.har_grp}</p>
                                  )}
                                  
                                </div>
                                <div className="observation-card-actions">
                                  {typeof observation.data_quality === 'number' && (
                                    <span className="quality-badge">Data Quality Score: {observation.data_quality}/10</span>
                                  )}
                                  <button type="button" className="ghost-btn small" onClick={() => handleEditObservation(observation)}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="danger-btn small"
                                    onClick={() => handleDeleteObservation(observation._id)}
                                    disabled={formSubmitting}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {(observation.morphology?.height_cm || observation.morphology?.canopy_width_cm || observation.morphology?.leaf_count || observation.morphology?.node_count || observation.morphology?.cola_count) && (
                                <section className="observation-section">
                                  <h4>Morphology</h4>
                                  <div className="observation-grid">
                                    {typeof observation.morphology?.height_cm === 'number' && <p><strong>Height:</strong> {observation.morphology.height_cm} cm</p>}
                                    {typeof observation.morphology?.canopy_width_cm === 'number' && <p><strong>Canopy Width:</strong> {observation.morphology.canopy_width_cm} cm</p>}
                                    {typeof observation.morphology?.leaf_count === 'number' && <p><strong>Leaf Count:</strong> {observation.morphology.leaf_count}</p>}
                                    {typeof (observation.morphology?.node_count ?? observation.morphology?.cola_count) === 'number' && (
                                      <p><strong>Node Count:</strong> {observation.morphology.node_count ?? observation.morphology.cola_count}</p>
                                    )}
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
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="manage-view">
                  <section className="editor-card manage-card">
                    <div className="sidebar-section-header">
                      <h3>Harvest Group Management</h3>
                    </div>

                    <form className="data-form" onSubmit={handleCreateHarvestGroup}>
                      <div className="form-grid">
                        <label>
                          Select Group (to edit or delete)
                          <select
                            name="group_id"
                            value={selectedHarvestGroupId || ''}
                            onChange={handleGroupFormChange}
                          >
                            <option value="">Create New</option>
                            {harvestGroups.map(group => (
                              <option key={group._id} value={group._id}>
                                {group.har_grp} (Room: {group.current_room || 'N/A'})
                              </option>
                            ))}
                          </select>
                        </label>
                        {!selectedHarvestGroup && (
                          <label>
                            HG Key (for new group)
                            <input
                              type="text"
                              name="har_grp"
                              value={groupFormState.har_grp}
                              onChange={handleGroupFormChange}
                              placeholder="HG-APR-2026-A"
                            />
                          </label>
                        )}
                        <label>
                          Current Room
                          <input
                            type="text"
                            name="current_room"
                            value={groupFormState.current_room}
                            onChange={(e) => setGroupFormState(current => ({ ...current, current_room: e.target.value }))}
                            placeholder="Flower Room A"
                          />
                        </label>
                        <label className="form-span-full">
                          Notes
                          <textarea
                            rows="2"
                            name="notes"
                            value={groupFormState.notes}
                            onChange={(e) => setGroupFormState(current => ({ ...current, notes: e.target.value }))}
                          />
                        </label>
                      </div>
                      <div className="form-actions">
                        <button className="primary-btn" type="submit" disabled={groupFormSubmitting}>
                          {selectedHarvestGroup ? 'Update Group' : 'Create Group'}
                        </button>
                        <button
                          className="danger-btn"
                          type="button"
                          onClick={handleDeleteHarvestGroup}
                          disabled={groupFormSubmitting || !selectedHarvestGroup}
                        >
                          Delete Selected
                        </button>
                      </div>
                    </form>
                  </section>

                  <section className="editor-card manage-card">
                    <div className="sidebar-section-header">
                      <h3>Plants In Group</h3>
                      <span>{plants.length}</span>
                    </div>

                    {selectedHarvestGroup ? (
                      <form className="data-form" onSubmit={handleCreateGroupPlant}>
                        <div className="form-grid">
                          <label>
                            Select Plant (to edit or delete)
                            <select
                              name="plant_id"
                              value={selectedPlantId || ''}
                              onChange={handleGroupPlantFormChange}
                            >
                              <option value="">Add New</option>
                              {plants.map(plant => (
                                <option key={plant._id} value={plant._id}>
                                  {plant.strain_name} ({plant.plant_count} plants)
                                </option>
                              ))}
                            </select>
                          </label>
                          {!selectedPlant && (
                            <label>
                              Strain Name (for new plant)
                              <input
                                type="text"
                                name="new_strain_name"
                                value={newStrainName}
                                onChange={event => setNewStrainName(event.target.value)}
                                placeholder="Pimp Juice"
                              />
                            </label>
                          )}
                          {selectedPlant && (
                            <label>
                              Strain Name
                              <input
                                type="text"
                                name="strain_name"
                                value={groupPlantFormState.strain_name}
                                onChange={handleGroupPlantFormChange}
                                placeholder="Strain name"
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
                              onChange={handleGroupPlantFormChange}
                            />
                          </label>
                          <label>
                            Current Room
                            <input
                              type="text"
                              name="current_room"
                              value={groupPlantFormState.current_room}
                              onChange={handleGroupPlantFormChange}
                            />
                          </label>
                          <label className="form-span-full">
                            Notes
                            <textarea
                              rows="2"
                              name="notes"
                              value={groupPlantFormState.notes}
                              onChange={handleGroupPlantFormChange}
                            />
                          </label>
                        </div>
                        <div className="form-actions">
                          <button className="primary-btn" type="submit" disabled={groupPlantFormSubmitting}>
                            {selectedPlant ? 'Update Plant' : 'Add Plant'}
                          </button>
                          <button
                            className="danger-btn"
                            type="button"
                            onClick={handleDeleteGroupPlant}
                            disabled={groupPlantFormSubmitting || !selectedPlant}
                          >
                            Delete Selected Plant
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="observations-empty-state compact">Select a harvest group first.</div>
                    )}
                  </section>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="observations-empty-state">Create or select a harvest group to begin.</div>
        )}
      </main>

      <div className="observations-right">
        {selectedHarvestGroup ? (
          <div className="observations-summary-card">
            <h3>Observation Summary</h3>
            <p><strong>Harvest Group:</strong> {selectedHarvestGroup.har_grp}</p>
            <p><strong>Room:</strong> {selectedHarvestGroup.current_room || 'Unassigned'}</p>
            <p><strong>Strains In HG:</strong> {plants.length}</p>
            <p><strong>Plants In HG:</strong> {groupPlantTotalCount}</p>
            <p><strong>Selected Strain:</strong> {selectedPlant?.strain_name || 'None selected'}</p>
            <p><strong>Total Records (selected strain):</strong> {observations.length}</p>
            <p><strong>Latest Stage:</strong> {latestObservation ? formatStage(latestObservation.growth_stage) : 'No data'}</p>
            <p><strong>Latest Record:</strong> {latestObservation ? formatDate(latestObservation.recorded_at) : 'No data'}</p>
          </div>
        ) : (
          <div className="observations-empty-state compact">Select a harvest group to see summary.</div>
        )}
      </div>
    </div>
  );
}