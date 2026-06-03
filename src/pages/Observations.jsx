import React, { useEffect, useState } from 'react';
import './Observations.css';
import { apiUrl } from '../lib/api';

import BlobCursor from '../components/BlobCursor.jsx';

import ObservationCard from './observations/ObservationCard.jsx';
import ObservationEditorForm from './observations/ObservationEditorForm.jsx';

import HarvestGroupManageForm from './observations/HarvestGroupManageForm.jsx';
import HarvestGroupPlantForm from './observations/HarvestGroupPlantForm.jsx';
import DatabaseSetupPopup from './observations/DatabaseSetupPopup.jsx';
import { useObservationsData } from './observations/useObservationsData.js';
import { useObservationCrud } from './observations/useObservationCrud.js';
import { useHarvestGroupCrud, mapHarvestGroupToForm, EMPTY_GROUP_FORM } from './observations/useHarvestGroupCrud.js';
import { useHarvestGroupPlantCrud, mapHarvestPlantToForm, EMPTY_GROUP_PLANT_FORM } from './observations/useHarvestGroupPlantCrud.js';

import { STAGE_LABELS, formatDate, formatStage, getCultivarName } from './observations/observationUtils.js';

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

export default function Observations({ onNavigateTo }) {
  const {
    harvestGroups,
    selectedHarvestGroupId,
    selectedPlantId,
    observations,
    harvestLoading,
    observationsLoading,
    error,
    dbSetupPopupOpen,
    selectedHarvestGroup,
    plants,
    selectedPlant,
    setSelectedHarvestGroupId,
    setSelectedPlantId,
    setObservations,
    setError,
    setDbSetupPopupOpen,
    refreshCurrentData,
    refreshSelectionAndObservations,
    handleRetryDbConnection
  } = useObservationsData();

  // CRUD hooks for form state management
  const observationCrud = useObservationCrud(
    buildObservationPayload,
    (msg) => setNotice(msg) && setCrudPopup({ open: true, message: msg }),
    (err) => setError(err)
  );

  const harvestGroupCrud = useHarvestGroupCrud(
    getCultivarName,
    (msg) => setNotice(msg) && setCrudPopup({ open: true, message: msg }),
    (err) => setError(err),
    refreshCurrentData,
    refreshSelectionAndObservations
  );

  const harvestGroupPlantCrud = useHarvestGroupPlantCrud(
    getCultivarName,
    (msg) => setNotice(msg) && setCrudPopup({ open: true, message: msg }),
    (err) => setError(err),
    refreshCurrentData
  );

  const [viewMode, setViewMode] = useState('observations'); // 'observations' or 'manage'
  const [notice, setNotice] = useState(null);
  const [crudPopup, setCrudPopup] = useState({ open: false, message: '' });

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

  // Update harvest group form when selectedHarvestGroup changes
  useEffect(() => {
    if (harvestGroupCrud.groupManageMode !== 'edit') return;
    harvestGroupCrud.setGroupFormState(mapHarvestGroupToForm(selectedHarvestGroup));
    harvestGroupCrud.setGroupImageFile(null);
  }, [selectedHarvestGroup, harvestGroupCrud.groupManageMode]);

  // Update plant form when selectedPlant changes
  useEffect(() => {
    if (harvestGroupPlantCrud.plantManageMode !== 'edit') return;
    harvestGroupPlantCrud.setGroupPlantFormState(mapHarvestPlantToForm(selectedPlant, getCultivarName));
    harvestGroupPlantCrud.setNewCultivarName('');
  }, [selectedPlant, harvestGroupPlantCrud.plantManageMode]);

  useEffect(() => {
    if (!crudPopup.open) return undefined;

    const timeoutId = window.setTimeout(() => {
      setCrudPopup({ open: false, message: '' });
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [crudPopup]);

  // Update group image preview URL
  useEffect(() => {
    if (!harvestGroupCrud.groupImageFile) {
      harvestGroupCrud.setGroupImagePreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(harvestGroupCrud.groupImageFile);
    harvestGroupCrud.setGroupImagePreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [harvestGroupCrud.groupImageFile]);

  // Update observation image preview URL
  useEffect(() => {
    if (!observationCrud.observationImageFile) {
      observationCrud.setObservationImagePreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(observationCrud.observationImageFile);
    observationCrud.setObservationImagePreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [observationCrud.observationImageFile]);

  // Clear observation form when plant/group selection changes
  useEffect(() => {
    if (!selectedPlantId || !selectedHarvestGroup) {
      observationCrud.resetForm();
    }
  }, [selectedPlantId, selectedHarvestGroup, observationCrud]);

  const isManagingExistingGroup = harvestGroupCrud.groupManageMode === 'edit' && Boolean(selectedHarvestGroup);
  const isManagingExistingPlant = harvestGroupPlantCrud.plantManageMode === 'edit' && Boolean(selectedPlant);

  const startNewHarvestGroup = () => {
    clearMessages();
    harvestGroupCrud.setGroupManageMode('create');
    harvestGroupPlantCrud.setPlantManageMode('create');
    setSelectedHarvestGroupId(null);
    setSelectedPlantId(null);
    harvestGroupCrud.setGroupFormState(EMPTY_GROUP_FORM);
    harvestGroupPlantCrud.setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
    harvestGroupCrud.setNewHarvestGroupKey('');
    harvestGroupPlantCrud.setNewCultivarName('');
    harvestGroupCrud.setGroupImageFile(null);
  };

  const startNewPlant = () => {
    clearMessages();
    harvestGroupPlantCrud.setPlantManageMode('create');
    setSelectedPlantId(null);
    harvestGroupPlantCrud.setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
    harvestGroupPlantCrud.setNewCultivarName('');
  };

  const selectGroupById = (groupId) => {
    const group = harvestGroups.find(item => String(item._id) === String(groupId));
    if (!group) {
      startNewHarvestGroup();
      return;
    }

    clearMessages();
    harvestGroupCrud.setGroupManageMode('edit');
    setSelectedHarvestGroupId(group._id);
    harvestGroupCrud.setGroupFormState(mapHarvestGroupToForm(group));
    harvestGroupCrud.setNewHarvestGroupKey('');

    const nextPlant = (group.plants || []).find(item => String(item._id) === String(selectedPlantId)) || (group.plants || [])[0] || null;
    if (!nextPlant) {
      setSelectedPlantId(null);
      harvestGroupPlantCrud.setPlantManageMode('create');
      harvestGroupPlantCrud.setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      harvestGroupPlantCrud.setNewCultivarName('');
      return;
    }

    setSelectedPlantId(nextPlant._id);
    harvestGroupPlantCrud.setPlantManageMode('edit');
    harvestGroupPlantCrud.setGroupPlantFormState(mapHarvestPlantToForm(nextPlant, getCultivarName));
    harvestGroupPlantCrud.setNewCultivarName('');
  };

  const handleObservationGroupSelection = (groupId) => {
    if (!groupId) {
      setSelectedHarvestGroupId(null);
      setSelectedPlantId(null);
      harvestGroupPlantCrud.setPlantManageMode('create');
      return;
    }
    selectGroupById(groupId);
  };

  const handleObservationPlantSelection = (plantId) => {
    if (!plantId) {
      setSelectedPlantId(null);
      harvestGroupPlantCrud.setPlantManageMode('create');
      return;
    }

    const plant = plants.find(item => String(item._id) === String(plantId));
    if (!plant) return;
    setSelectedPlantId(plant._id);
    harvestGroupPlantCrud.setPlantManageMode('edit');
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
    harvestGroupPlantCrud.setPlantManageMode('edit');
    setSelectedPlantId(fallbackPlant._id);
    harvestGroupPlantCrud.setGroupPlantFormState(mapHarvestPlantToForm(fallbackPlant, getCultivarName));
    harvestGroupPlantCrud.setNewCultivarName('');
  };

  // Wrapper handler for observation deletion with refresh
  const handleDeleteObservationWithRefresh = async (observationId) => {
    clearMessages();
    await observationCrud.handleDeleteObservation(observationId);
    await refreshSelectionAndObservations({
      preferredGroupId: selectedHarvestGroup?._id,
      preferredPlantId: selectedPlant?._id
    });
  };

  // Wrapper handler for observation submit with refresh
  const handleObservationSubmit = async (event) => {
    clearMessages();
    await observationCrud.handleSubmit(event, selectedPlant, selectedHarvestGroup);
    await refreshSelectionAndObservations({
      preferredGroupId: selectedHarvestGroup?._id,
      preferredPlantId: selectedPlant?._id
    });
  };

  // Wrapper for harvest group form change to handle group selection
  const handleGroupFormChangeWrapper = (event) => {
    const { name, value } = event.target;

    if (name === 'group_id') {
      if (!value) {
        startNewHarvestGroup();
        return;
      }
      selectGroupById(value);
    } else {
      harvestGroupCrud.handleGroupFormChange(event, name, value);
    }
  };

  // Wrapper for harvest group creation with extra logic
  const handleCreateHarvestGroupWithRefresh = async (event) => {
    clearMessages();
    await harvestGroupCrud.handleCreateHarvestGroup(event, isManagingExistingGroup, selectedHarvestGroup, selectedPlantId);
    if (!isManagingExistingGroup) {
      harvestGroupCrud.setGroupManageMode('edit');
      harvestGroupPlantCrud.setPlantManageMode('create');
    }
  };

  // Wrapper for harvest group deletion
  const handleDeleteHarvestGroupWithRefresh = async () => {
    if (!isManagingExistingGroup) {
      setError('Select a harvest group to delete.');
      return;
    }
    clearMessages();
    await harvestGroupCrud.handleDeleteHarvestGroup(selectedHarvestGroup);
    setObservations([]);
  };

  // Wrapper for plant form change to handle plant selection
  const handleGroupPlantFormChangeWrapper = (event) => {
    const { name, value } = event.target;

    if (name === 'plant_id') {
      if (!value) {
        startNewPlant();
        return;
      }

      const plant = plants.find(p => String(p._id) === String(value));
      if (plant) {
        setSelectedPlantId(plant._id);
        harvestGroupPlantCrud.setPlantManageMode('edit');
        harvestGroupPlantCrud.setGroupPlantFormState(mapHarvestPlantToForm(plant, getCultivarName));
        harvestGroupPlantCrud.setNewCultivarName('');
      }
    } else {
      harvestGroupPlantCrud.handleGroupPlantFormChange(event);
    }
  };

  // Wrapper for plant creation with refresh
  const handleCreateGroupPlantWithRefresh = async (event) => {
    clearMessages();
    await harvestGroupPlantCrud.handleCreateGroupPlant(event, isManagingExistingPlant, selectedHarvestGroup, selectedPlant);
    if (!isManagingExistingPlant) {
      harvestGroupPlantCrud.setPlantManageMode('edit');
    }
  };

  // Wrapper for plant deletion with refresh
  const handleDeleteGroupPlantWithRefresh = async () => {
    if (!selectedHarvestGroup || !isManagingExistingPlant) {
      setError('Select a harvest-group plant to delete.');
      return;
    }
    clearMessages();
    await harvestGroupPlantCrud.handleDeleteGroupPlant(selectedHarvestGroup, selectedPlant);
    observationCrud.resetForm();
    setObservations([]);
  };

  const latestObservation = observations.length > 0 ? observations[0] : null;
  const groupPlantTotalCount = plants.reduce((total, plant) => total + (Number(plant.plant_count) || 0), 0);

  if (harvestLoading) {
    return <div className="observations-empty-state">Loading observation dashboard...</div>;
  }

  if (error && harvestGroups.length === 0) {
    return (
      <div className="observations-empty-state error observations-setup-state">
        <div className="observations-setup-copy">
          <h2>Observation API setup required</h2>
          <p>{error}</p>
        </div>
        <div className="observations-setup-actions">
          <button className="primary-btn" type="button" onClick={() => setDbSetupPopupOpen(true)}>
            Show Atlas + .env setup
          </button>
          <button className="ghost-btn" type="button" onClick={handleRetryDbConnection}>
            Retry connection
          </button>
        </div>
        <DatabaseSetupPopup
          open={dbSetupPopupOpen}
          error={error}
          onRetry={handleRetryDbConnection}
          onClose={() => setDbSetupPopupOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="observations-page">
      <BlobCursor
  blobType="circle"
  fillColor="#96ff8b"
  trailCount={2}
  sizes={[45,125]}
  innerSizes={[20,35]}
  innerColor="#bf0000"
  opacities={[1,0.6]}
  shadowColor="#ffffff"
  shadowBlur={10}
  shadowOffsetX={-5}
  shadowOffsetY={25}
  filterStdDeviation={30}
  useFilter={true}
  fastDuration={0.01}
  slowDuration={0.5}
  zIndex={100}
  />
      
      <div className="observations-nav-bar">
        <button className="nav-btn" onClick={() => onNavigateTo('home')}>
          ← Home
        </button>

        <div className="nav-title-shell">
          <span className="nav-title-eyebrow">Field Journal</span>
          <div className="nav-title">Observations</div>
        </div>

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
                <div className="hg-highlight-top">
                  <div className="hg-highlight-content">
                    <p className="hg-kicker">Active Crop Group</p>
                    <h1>{selectedHarvestGroup.har_grp}</h1>
                    <p className="hg-subtitle">
                      {selectedHarvestGroup.current_room || 'Unassigned room'} • {groupPlantTotalCount} tracked plants
                    </p>
                    <div className="selected-plant-meta observations-header-actions hg-stat-row">
                      <span className="hg-stat-pill">
                        <strong>Latest Record:</strong> {selectedHarvestGroup.latest_recorded_at ? formatDate(selectedHarvestGroup.latest_recorded_at) : 'No data'}
                      </span>
                      <span className="hg-stat-pill">
                        <strong>Total Observations:</strong> {selectedHarvestGroup.observations_count || 0}
                      </span>
                    </div>
                  </div>
                  {selectedHarvestGroup.image_url && (
                    <img
                      className="hg-highlight-image"
                      src={resolveImageUrl(selectedHarvestGroup.image_url)}
                      alt={`${selectedHarvestGroup.har_grp} harvest group`}
                    />
                  )}
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
                      <ObservationEditorForm
                        editingObservationId={observationCrud.editingObservationId}
                        selectedPlant={selectedPlant}
                        selectedHarvestGroup={selectedHarvestGroup}
                        formState={observationCrud.formState}
                        onFormChange={observationCrud.handleFormChange}
                        onObservationImageChange={observationCrud.handleObservationImageChange}
                        observationImageFile={observationCrud.observationImageFile}
                        observationImagePreviewUrl={observationCrud.observationImagePreviewUrl}
                        resolveImageUrl={resolveImageUrl}
                        formSubmitting={observationCrud.formSubmitting}
                        onSubmit={handleObservationSubmit}
                        onReset={observationCrud.resetForm}
                      />

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
                            <ObservationCard
                              key={observation._id}
                              observation={observation}
                              selectedHarvestGroup={selectedHarvestGroup}
                              selectedPlant={selectedPlant}
                              plants={plants}
                              groupPlantTotalCount={groupPlantTotalCount}
                              latestObservation={latestObservation}
                              resolveImageUrl={resolveImageUrl}
                              onEdit={observationCrud.handleEditObservation}
                              onDelete={handleDeleteObservationWithRefresh}
                              formSubmitting={observationCrud.formSubmitting}
                            />
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
                  <HarvestGroupManageForm
                    isManagingExistingGroup={isManagingExistingGroup}
                    selectedHarvestGroup={selectedHarvestGroup}
                    selectedHarvestGroupId={selectedHarvestGroupId}
                    harvestGroups={harvestGroups}
                    groupFormState={harvestGroupCrud.groupFormState}
                    groupFormSubmitting={harvestGroupCrud.groupFormSubmitting}
                    groupImageFile={harvestGroupCrud.groupImageFile}
                    groupImagePreviewUrl={harvestGroupCrud.groupImagePreviewUrl}
                    resolveImageUrl={resolveImageUrl}
                    onStartNewHarvestGroup={startNewHarvestGroup}
                    onCancelNewHarvestGroup={cancelNewHarvestGroup}
                    onGroupFormChange={handleGroupFormChangeWrapper}
                    onGroupFormSubmit={handleCreateHarvestGroupWithRefresh}
                    onDeleteHarvestGroup={handleDeleteHarvestGroupWithRefresh}
                    onGroupImageFileChange={harvestGroupCrud.handleGroupFormChange}
                    setGroupFormState={harvestGroupCrud.setGroupFormState}
                  />

                  <HarvestGroupPlantForm
                    selectedHarvestGroup={selectedHarvestGroup}
                    plants={plants}
                    selectedPlant={selectedPlant}
                    isManagingExistingPlant={isManagingExistingPlant}
                    selectedPlantId={selectedPlantId}
                    groupPlantFormState={harvestGroupPlantCrud.groupPlantFormState}
                    newCultivarName={harvestGroupPlantCrud.newCultivarName}
                    groupPlantFormSubmitting={harvestGroupPlantCrud.groupPlantFormSubmitting}
                    onGroupPlantFormChange={handleGroupPlantFormChangeWrapper}
                    onSetNewCultivarName={harvestGroupPlantCrud.setNewCultivarName}
                    onCreateGroupPlant={handleCreateGroupPlantWithRefresh}
                    onDeleteGroupPlant={handleDeleteGroupPlantWithRefresh}
                    onStartNewPlant={startNewPlant}
                    onCancelNewPlant={cancelNewPlant}
                  />
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