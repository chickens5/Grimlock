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
  notes: '',
  image_url: ''
};

const EMPTY_GROUP_PLANT_FORM = {
  cultivar_name: '',
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
  observ_img: '',
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

function getCultivarName(plant) {
  if (!plant || typeof plant !== 'object') return '';
  return (plant.cultivar_name || plant.strain_name || '').trim();
}

function buildObservationPayload(formState, selectedHarvestGroup, selectedPlant) {
  return {
    har_grp: selectedHarvestGroup?.har_grp,
    plant_id: String(selectedPlant?._id || ''),
    hg_plant_id: String(selectedPlant?._id || ''),
    plant_name: getCultivarName(selectedPlant),
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
    observ_img: formState.observ_img || undefined,
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
    observ_img: observation.observ_img ?? '',
    data_quality: observation.data_quality ?? '',
    recorded_by: observation.recorded_by ?? ''
  };
}

function mapHarvestGroupToForm(group) {
  if (!group) return EMPTY_GROUP_FORM;
  return {
    har_grp: group.har_grp || '',
    current_room: group.current_room || '',
    notes: group.notes || '',
    image_url: group.image_url || ''
  };
}

function mapHarvestPlantToForm(plant) {
  if (!plant) return EMPTY_GROUP_PLANT_FORM;
  return {
    cultivar_name: getCultivarName(plant),
    plant_count: plant.plant_count || 1,
    current_room: plant.current_room || '',
    notes: plant.notes || ''
  };
}

function ObservationSummary({
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

function ObservationCardDetails({ observation, resolveImageUrl }) {
  return (
    <>
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

      {observation.observ_img && (
        <section className="observation-section">
          <h4>Observation Image</h4>
          <a href={resolveImageUrl(observation.observ_img)} target="_blank" rel="noopener noreferrer">
            <img
              className="observation-media-image"
              src={resolveImageUrl(observation.observ_img)}
              alt={`${observation.plant_name || 'Plant'} observation`}
              loading="lazy"
            />
          </a>
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
    </>
  );
}

export default function Observations({ onNavigateTo }) {
  const [harvestGroups, setHarvestGroups] = useState([]);
  const [selectedHarvestGroupId, setSelectedHarvestGroupId] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [groupManageMode, setGroupManageMode] = useState('edit'); // 'create' | 'edit'
  const [plantManageMode, setPlantManageMode] = useState('edit'); // 'create' | 'edit'

  const [groupFormState, setGroupFormState] = useState(EMPTY_GROUP_FORM);
  const [newHarvestGroupKey, setNewHarvestGroupKey] = useState('');
  const [groupFormSubmitting, setGroupFormSubmitting] = useState(false);
  const [groupPlantFormState, setGroupPlantFormState] = useState(EMPTY_GROUP_PLANT_FORM);
  const [newCultivarName, setNewCultivarName] = useState('');
  const [groupPlantFormSubmitting, setGroupPlantFormSubmitting] = useState(false);
  const [groupImageFile, setGroupImageFile] = useState(null);
  const [observationImageFile, setObservationImageFile] = useState(null);
  const [groupImagePreviewUrl, setGroupImagePreviewUrl] = useState('');
  const [observationImagePreviewUrl, setObservationImagePreviewUrl] = useState('');

  const [observations, setObservations] = useState([]);
  const [harvestLoading, setHarvestLoading] = useState(true);
  const [observationsLoading, setObservationsLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingObservationId, setEditingObservationId] = useState(null);
  const [formState, setFormState] = useState(EMPTY_OBSERVATION_FORM);
  const [viewMode, setViewMode] = useState('observations'); // 'observations' or 'manage'
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [crudPopup, setCrudPopup] = useState({ open: false, message: '' });

  const selectedHarvestGroup = useMemo(
    () => harvestGroups.find(group => group._id === selectedHarvestGroupId) || null,
    [harvestGroups, selectedHarvestGroupId]
  );

  const plants = selectedHarvestGroup?.plants || [];

  const selectedPlant = useMemo(
    () => plants.find(plant => String(plant._id) === String(selectedPlantId)) || null,
    [plants, selectedPlantId]
  );

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return apiUrl(url.startsWith('/') ? url : `/${url}`);
  };

  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  const showCrudSuccess = (message) => {
    setNotice(message);
    setCrudPopup({ open: true, message });
  };

  const uploadImageFile = async (file, category) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(apiUrl(`/api/uploads/image?category=${encodeURIComponent(category)}`), {
      method: 'POST',
      body: formData
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      throw new Error(payload?.message || 'Image upload failed');
    }

    return payload.url;
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
      return {
        groups,
        resolvedGroup: null,
        resolvedPlant: null
      };
    }

    const groupPlants = resolvedGroup.plants || [];
    const resolvedPlant =
      groupPlants.find(plant => String(plant._id) === String(preferredPlantId)) ||
      groupPlants.find(plant => String(plant._id) === String(selectedPlantId)) ||
      groupPlants[0] ||
      null;

    setSelectedPlantId(resolvedPlant?._id || null);

    return {
      groups,
      resolvedGroup,
      resolvedPlant
    };
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
    if (groupManageMode !== 'edit') return;
    setGroupFormState(mapHarvestGroupToForm(selectedHarvestGroup));
    setGroupImageFile(null);
  }, [selectedHarvestGroup, groupManageMode]);

  useEffect(() => {
    if (plantManageMode !== 'edit') return;
    setGroupPlantFormState(mapHarvestPlantToForm(selectedPlant));
    setNewCultivarName('');
  }, [selectedPlant, plantManageMode]);

  useEffect(() => {
    if (!crudPopup.open) return undefined;

    const timeoutId = window.setTimeout(() => {
      setCrudPopup({ open: false, message: '' });
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [crudPopup]);

  useEffect(() => {
    if (!groupImageFile) {
      setGroupImagePreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(groupImageFile);
    setGroupImagePreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [groupImageFile]);

  useEffect(() => {
    if (!observationImageFile) {
      setObservationImagePreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(observationImageFile);
    setObservationImagePreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [observationImageFile]);

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
    return loadHarvestGroups({ preferredGroupId, preferredPlantId });
  };

  const refreshSelectionAndObservations = async ({ preferredGroupId, preferredPlantId } = {}) => {
    const data = await refreshCurrentData({ preferredGroupId, preferredPlantId });
    const nextGroup = data?.resolvedGroup;
    const nextPlant = data?.resolvedPlant;

    if (nextGroup?.har_grp && nextPlant?._id) {
      await loadObservationsForSelection(nextPlant._id, nextGroup.har_grp);
    } else {
      setObservations([]);
    }

    return data;
  };

  const resetForm = () => {
    setEditingObservationId(null);
    setFormState(EMPTY_OBSERVATION_FORM);
    setObservationImageFile(null);
  };

  const handleEditObservation = (observation) => {
    setEditingObservationId(observation._id);
    setFormState(mapObservationToForm(observation));
  };

  const isManagingExistingGroup = groupManageMode === 'edit' && Boolean(selectedHarvestGroup);
  const isManagingExistingPlant = plantManageMode === 'edit' && Boolean(selectedPlant);

  const startNewHarvestGroup = () => {
    clearMessages();
    setGroupManageMode('create');
    setPlantManageMode('create');
    setSelectedHarvestGroupId(null);
    setSelectedPlantId(null);
    setGroupFormState(EMPTY_GROUP_FORM);
    setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
    setNewHarvestGroupKey('');
    setNewCultivarName('');
    setGroupImageFile(null);
  };

  const startNewPlant = () => {
    clearMessages();
    setPlantManageMode('create');
    setSelectedPlantId(null);
    setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
    setNewCultivarName('');
  };

  const selectGroupById = (groupId) => {
    const group = harvestGroups.find(item => String(item._id) === String(groupId));
    if (!group) {
      startNewHarvestGroup();
      return;
    }

    clearMessages();
    setGroupManageMode('edit');
    setSelectedHarvestGroupId(group._id);
    setGroupFormState(mapHarvestGroupToForm(group));
    setNewHarvestGroupKey('');

    const nextPlant = (group.plants || []).find(item => String(item._id) === String(selectedPlantId)) || (group.plants || [])[0] || null;
    if (!nextPlant) {
      setSelectedPlantId(null);
      setPlantManageMode('create');
      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      setNewCultivarName('');
      return;
    }

    setSelectedPlantId(nextPlant._id);
    setPlantManageMode('edit');
    setGroupPlantFormState(mapHarvestPlantToForm(nextPlant));
    setNewCultivarName('');
  };

  const handleObservationGroupSelection = (groupId) => {
    if (!groupId) {
      setSelectedHarvestGroupId(null);
      setSelectedPlantId(null);
      setPlantManageMode('create');
      return;
    }
    selectGroupById(groupId);
  };

  const handleObservationPlantSelection = (plantId) => {
    if (!plantId) {
      setSelectedPlantId(null);
      setPlantManageMode('create');
      return;
    }

    const plant = plants.find(item => String(item._id) === String(plantId));
    if (!plant) return;
    setSelectedPlantId(plant._id);
    setPlantManageMode('edit');
  };

  const cancelNewHarvestGroup = () => {
    const fallbackGroup = selectedHarvestGroup || harvestGroups[0] || null;
    if (!fallbackGroup) return;
    selectGroupById(fallbackGroup._id);
  };

  const cancelNewPlant = () => {
    const fallbackPlant = selectedPlant || plants[0] || null;
    if (!fallbackPlant) {
      startNewPlant();
      return;
    }

    clearMessages();
    setPlantManageMode('edit');
    setSelectedPlantId(fallbackPlant._id);
    setGroupPlantFormState(mapHarvestPlantToForm(fallbackPlant));
    setNewCultivarName('');
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

      showCrudSuccess('Observation deleted.');
      if (editingObservationId === observationId) {
        resetForm();
      }

      await refreshSelectionAndObservations({
        preferredGroupId: selectedHarvestGroup?._id,
        preferredPlantId: selectedPlant?._id
      });
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

    const isEditing = Boolean(editingObservationId);

    try {
      let observationImageUrl = formState.observ_img;
      if (observationImageFile) {
        observationImageUrl = await uploadImageFile(observationImageFile, 'observation');
      }

      const payload = buildObservationPayload(
        {
          ...formState,
          observ_img: observationImageUrl
        },
        selectedHarvestGroup,
        selectedPlant
      );

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
      showCrudSuccess(isEditing ? 'Observation updated.' : 'Observation created.');

      await refreshSelectionAndObservations({
        preferredGroupId: selectedHarvestGroup._id,
        preferredPlantId: selectedPlant._id
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleGroupFormChange = (event) => {
    const { name, value } = event.target;

    if (name === 'group_id') {
      if (!value) {
        startNewHarvestGroup();
        return;
      }
      selectGroupById(value);
    } else if (name === 'har_grp' && groupManageMode === 'create') {
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
      let groupImageUrl = groupFormState.image_url;
      if (groupImageFile) {
        groupImageUrl = await uploadImageFile(groupImageFile, 'harvest-group');
      }

      if (isManagingExistingGroup) {
        await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_room: groupFormState.current_room,
            notes: groupFormState.notes,
            image_url: groupImageUrl
          })
        }, 'Failed to update harvest group');

        showCrudSuccess(`Harvest group ${selectedHarvestGroup.har_grp} updated.`);
        await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id, preferredPlantId: selectedPlantId });
      } else {
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
            notes: groupFormState.notes,
            image_url: groupImageUrl
          })
        }, 'Failed to create harvest group');

        showCrudSuccess(`Harvest group ${createdGroup.har_grp} created.`);
        await refreshCurrentData({ preferredGroupId: createdGroup._id });
        setGroupManageMode('edit');
        setPlantManageMode('create');
      }
      setNewHarvestGroupKey('');
      setGroupImageFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupFormSubmitting(false);
    }
  };

  const handleDeleteHarvestGroup = async () => {
    if (!isManagingExistingGroup) {
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

      showCrudSuccess(`Harvest group ${selectedHarvestGroup.har_grp} deleted.`);
      setGroupFormState(EMPTY_GROUP_FORM);
      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      setObservations([]);
      setGroupImageFile(null);
      const data = await refreshCurrentData({});

      if (data?.resolvedGroup) {
        setGroupManageMode('edit');
        setPlantManageMode(data.resolvedPlant ? 'edit' : 'create');
      } else {
        setGroupManageMode('create');
        setPlantManageMode('create');
        setSelectedHarvestGroupId(null);
        setSelectedPlantId(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupFormSubmitting(false);
    }
  };

  const handleGroupPlantFormChange = (event) => {
    const { name, value } = event.target;

    if (name === 'plant_id') {
      if (!value) {
        startNewPlant();
        return;
      }

      const plant = plants.find(plant => String(plant._id) === String(value));
      if (plant) {
        setSelectedPlantId(plant._id);
        setPlantManageMode('edit');
        setGroupPlantFormState(mapHarvestPlantToForm(plant));
        setNewCultivarName('');
      }
    } else {
      setGroupPlantFormState(current => ({
        ...current,
        [name]: value
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
      if (isManagingExistingPlant) {
        await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}/plants/${selectedPlant._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cultivar_name: groupPlantFormState.cultivar_name,
            strain_name: groupPlantFormState.cultivar_name,
            plant_count: toOptionalNumber(groupPlantFormState.plant_count) || 1,
            current_room: groupPlantFormState.current_room,
            notes: groupPlantFormState.notes
          })
        }, 'Failed to update harvest-group plant');

        showCrudSuccess('Plant updated.');
        await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id, preferredPlantId: selectedPlant._id });
        setPlantManageMode('edit');
      } else {
        const cultivarNameValue = (newCultivarName || groupPlantFormState.cultivar_name || '').trim();
        if (!cultivarNameValue) {
          throw new Error('Provide a new cultivar name or select one from the dropdown.');
        }

        const updatedGroup = await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}/plants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cultivar_name: cultivarNameValue,
            strain_name: cultivarNameValue,
            plant_count: toOptionalNumber(groupPlantFormState.plant_count) || 1,
            current_room: groupPlantFormState.current_room,
            notes: groupPlantFormState.notes
          })
        }, 'Failed to add plant to harvest group');

        const normalizedCultivarName = cultivarNameValue.toLowerCase();
        const updatedPlants = Array.isArray(updatedGroup?.plants) ? updatedGroup.plants : [];
        const createdPlant = [...updatedPlants].reverse().find(plant =>
          getCultivarName(plant).toLowerCase() === normalizedCultivarName
        ) || updatedPlants[updatedPlants.length - 1] || null;

        showCrudSuccess('Plant added to harvest group.');
        await refreshCurrentData({
          preferredGroupId: selectedHarvestGroup._id,
          preferredPlantId: createdPlant?._id || null
        });
        setPlantManageMode('edit');
      }

      setNewCultivarName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGroupPlantFormSubmitting(false);
    }
  };

  const handleDeleteGroupPlant = async () => {
    if (!selectedHarvestGroup || !isManagingExistingPlant) {
      setError('Select a harvest-group plant to delete.');
      return;
    }

    if (!window.confirm(`Delete ${getCultivarName(selectedPlant)} from ${selectedHarvestGroup.har_grp}?`)) {
      return;
    }

    setGroupPlantFormSubmitting(true);
    clearMessages();

    try {
      await requestJson(`/api/harvest-groups/${selectedHarvestGroup._id}/plants/${selectedPlant._id}`, {
        method: 'DELETE'
      }, 'Failed to delete harvest-group plant');

      showCrudSuccess('Harvest-group plant deleted.');
      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      resetForm();
      setObservations([]);
      const data = await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id });
      if (data?.resolvedPlant) {
        setPlantManageMode('edit');
      } else {
        setPlantManageMode('create');
        setSelectedPlantId(null);
      }
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
    <div className="observations-page">
      
      <div className="observations-nav-bar">
        <button className="nav-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>
        
        <div className="nav-title">Observations</div>

        <button className="nav-btn" onClick={() => onNavigateTo('Plants')}>
          Explore Native Plants →
        </button>
      </div>

    <div className="observations-layout">
      

{/* The main content area conditionally renders either the observations view or the management view based on the selected tab in full CRUD mode */}
      <main className="observations-main">

        <>
            {selectedHarvestGroup ? (
              <div className="hg-highlight-card">
                <h1>Current Harvest Group: {selectedHarvestGroup.har_grp}</h1>
                <h1>Total Plants: {groupPlantTotalCount}</h1>
                <h2>Current Room: {selectedHarvestGroup.current_room || 'Unassigned'}</h2>
                {selectedHarvestGroup.image_url && (
                  <img
                    className="manage-preview-image"
                    src={resolveImageUrl(selectedHarvestGroup.image_url)}
                    alt={`${selectedHarvestGroup.har_grp} harvest group`}
                  />
                )}
                <div className="selected-plant-meta observations-header-actions">
                  <i><strong>Latest Record:</strong> {selectedHarvestGroup.latest_recorded_at ? formatDate(selectedHarvestGroup.latest_recorded_at) : 'No data'}</i>
                  <i><strong>Total Observations:</strong> {selectedHarvestGroup.observations_count || 0}</i>
                </div>
              </div>
            ) : (
              <div className="observations-empty-state compact">
                No harvest group selected. Choose one from Observations, or create one in Manage mode.
              </div>
            )}
              
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

{/* This section renders the observations view (FULL CRUD until we introduce secure mode) */}
            {viewMode === 'observations' ? (
              <>
                <div className="observations-view">
                  <div className="selected-plant-selection">
                    <label>
                      Select Harvest Group:
                      <select value={selectedHarvestGroupId || ''} onChange={(e) => handleObservationGroupSelection(e.target.value)}>
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
                        Select Plant/Cultivar:
                        <select value={selectedPlantId || ''} onChange={(e) => handleObservationPlantSelection(e.target.value)}>
                          <option value="">Choose a plant...</option>
                          {plants.map(plant => (
                            <option key={plant._id} value={plant._id}>
                              {getCultivarName(plant)} ({plant.plant_count || 1} plants)
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  {/* The observation form and timeline are only shown when a plant is selected, 
                  since observations are tied to specific plants within a harvest group */}

                  {!selectedPlant ? (
                    <div className="observations-empty-state compact">Select a plant from the dropdown to manage observations.</div>
                  ) : (
                    <>
                      <section className="editor-card inventory-editor">
                        <div className="editor-card-header">
                          <div className ='section'>
                            <h2>{editingObservationId ? 'Edit Observation' : 'Create Observation for:'}</h2>
                            <h3>
                               {getCultivarName(selectedPlant)} ({selectedHarvestGroup.har_grp})  {/* displays the currently selected plant and harvest group in the form header for context */}
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

                            <label className="form-span-full">
                              Observation Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0] || null;
                                  setObservationImageFile(file);
                                }}
                              />
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

                        <h1 className ='observation-card-header'>Total Observations: {observations.length}</h1>

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
                                  {typeof observation.data_quality === 'number' ? (
                                    <span className="quality-badge">Data Quality Score: {observation.data_quality}/10</span>
                                  ) : (
                                    <span className="quality-badge">Edit to add data quality</span>
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
                      <span className="manage-mode-pill">{isManagingExistingGroup ? 'Edit Mode' : 'Create Mode'}</span>
                    </div>
                    <p className="manage-helper-text">
                      {isManagingExistingGroup
                        ? `Editing ${selectedHarvestGroup?.har_grp}`
                        : 'Creating a new harvest group'}
                    </p>
                    <div className="inline-actions">
                      {isManagingExistingGroup ? (
                        <button type="button" className="ghost-btn small" onClick={startNewHarvestGroup} disabled={groupFormSubmitting}>
                          Start New Group
                        </button>
                      ) : (
                        <button type="button" className="ghost-btn small" onClick={cancelNewHarvestGroup} disabled={groupFormSubmitting || harvestGroups.length === 0}>
                          Cancel New Group
                        </button>
                      )}
                    </div>

                    <form className="data-form" onSubmit={handleCreateHarvestGroup}>
                      <div className="form-grid">
                        <label>
                          Select Group (to edit or delete)
                          <select
                            name="group_id"
                            value={isManagingExistingGroup ? selectedHarvestGroupId || '' : ''}
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
                        {!isManagingExistingGroup && (
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
                        <label className="form-span-full">
                          Harvest Group Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setGroupImageFile(file);
                            }}
                          />
                          {(groupImageFile || groupFormState.image_url) && (
                            <img
                              className="manage-preview-image"
                              src={groupImageFile ? groupImagePreviewUrl : resolveImageUrl(groupFormState.image_url)}
                              alt="Harvest group preview"
                            />
                          )}
                        </label>
                      </div>
                      <div className="form-actions">
                        <button className="primary-btn" type="submit" disabled={groupFormSubmitting}>
                          {groupFormSubmitting ? 'Saving...' : isManagingExistingGroup ? 'Update Group' : 'Create Group'}
                        </button>
                        <button
                          className="danger-btn"
                          type="button"
                          onClick={handleDeleteHarvestGroup}
                          disabled={groupFormSubmitting || !isManagingExistingGroup}
                        >
                          Delete Selected
                        </button>
                      </div>
                    </form>
                  </section>

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
                      <form className="data-form" onSubmit={handleCreateGroupPlant}>
                        <div className="form-grid">
                          <label>
                            Select Plant (to edit or delete)
                            <select
                              name="plant_id"
                              value={isManagingExistingPlant ? selectedPlantId || '' : ''}
                              onChange={handleGroupPlantFormChange}
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
                                onChange={handleGroupPlantFormChange}
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
                                onChange={event => setNewCultivarName(event.target.value)}
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
                        <div className="inline-actions">
                          {isManagingExistingPlant ? (
                            <button type="button" className="ghost-btn small" onClick={startNewPlant} disabled={groupPlantFormSubmitting}>
                              Add New Plant
                            </button>
                          ) : (
                            <button type="button" className="ghost-btn small" onClick={cancelNewPlant} disabled={groupPlantFormSubmitting || plants.length === 0}>
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
                            onClick={handleDeleteGroupPlant}
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
                </div>
              </>
            )}
        </>
      </main>

      {crudPopup.open && (
        <div className="crud-popup-backdrop">
          <div className="crud-popup-card">
            <h3>Operation Successful</h3>
            <p>{crudPopup.message}</p>
            <p className="crud-popup-subtext">You are still on Observations.</p>
            <button className="primary-btn" type="button" onClick={() => setCrudPopup({ open: false, message: '' })}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}