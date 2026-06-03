import { useState, useMemo } from 'react';
import {
  addPlantToHarvestGroup,
  updatePlantInHarvestGroup,
  deletePlantFromHarvestGroup
} from './observationsApi.js';

const EMPTY_GROUP_PLANT_FORM = {
  cultivar_name: '',
  plant_count: 1,
  current_room: '',
  notes: ''
};

function toOptionalNumber(value) {
  if (value === '' || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function useHarvestGroupPlantCrud(getCultivarName, onSuccess, onError, refreshCurrentData) {
  const [groupPlantFormState, setGroupPlantFormState] = useState(EMPTY_GROUP_PLANT_FORM);
  const [plantManageMode, setPlantManageMode] = useState('edit');
  const [newCultivarName, setNewCultivarName] = useState('');
  const [groupPlantFormSubmitting, setGroupPlantFormSubmitting] = useState(false);

  const handleGroupPlantFormChange = (event) => {
    const { name, value } = event.target;

    if (name === 'plant_id') {
      // This will be handled by parent component
      return;
    } else {
      setGroupPlantFormState(current => ({
        ...current,
        [name]: value
      }));
    }
  };

  const handleCreateGroupPlant = async (event, isManagingExistingPlant, selectedHarvestGroup, selectedPlant) => {
    event.preventDefault();
    if (!selectedHarvestGroup) {
      onError('Select a harvest group before adding plants.');
      return;
    }

    setGroupPlantFormSubmitting(true);

    try {
      if (isManagingExistingPlant) {
        await updatePlantInHarvestGroup(selectedHarvestGroup._id, selectedPlant._id, {
          cultivar_name: groupPlantFormState.cultivar_name,
          strain_name: groupPlantFormState.cultivar_name,
          plant_count: toOptionalNumber(groupPlantFormState.plant_count) || 1,
          current_room: groupPlantFormState.current_room,
          notes: groupPlantFormState.notes
        });

        onSuccess('Plant updated.');
        await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id, preferredPlantId: selectedPlant._id });
        setPlantManageMode('edit');
      } else {
        const cultivarNameValue = (newCultivarName || groupPlantFormState.cultivar_name || '').trim();
        if (!cultivarNameValue) {
          throw new Error('Provide a new cultivar name or select one from the dropdown.');
        }

        const updatedGroup = await addPlantToHarvestGroup(selectedHarvestGroup._id, {
          cultivar_name: cultivarNameValue,
          strain_name: cultivarNameValue,
          plant_count: toOptionalNumber(groupPlantFormState.plant_count) || 1,
          current_room: groupPlantFormState.current_room,
          notes: groupPlantFormState.notes
        });

        const normalizedCultivarName = cultivarNameValue.toLowerCase();
        const updatedPlants = Array.isArray(updatedGroup?.plants) ? updatedGroup.plants : [];
        const createdPlant = [...updatedPlants].reverse().find(plant =>
          getCultivarName(plant).toLowerCase() === normalizedCultivarName
        ) || updatedPlants[updatedPlants.length - 1] || null;

        onSuccess('Plant added to harvest group.');
        await refreshCurrentData({
          preferredGroupId: selectedHarvestGroup._id,
          preferredPlantId: createdPlant?._id || null
        });
        setPlantManageMode('edit');
      }

      setNewCultivarName('');
    } catch (err) {
      onError(err.message);
    } finally {
      setGroupPlantFormSubmitting(false);
    }
  };

  const handleDeleteGroupPlant = async (selectedHarvestGroup, selectedPlant) => {
    if (!selectedHarvestGroup || !selectedPlant) {
      onError('Select a harvest-group plant to delete.');
      return;
    }

    if (!window.confirm(`Delete ${getCultivarName(selectedPlant)} from ${selectedHarvestGroup.har_grp}?`)) {
      return;
    }

    setGroupPlantFormSubmitting(true);

    try {
      await deletePlantFromHarvestGroup(selectedHarvestGroup._id, selectedPlant._id);

      onSuccess('Harvest-group plant deleted.');
      setGroupPlantFormState(EMPTY_GROUP_PLANT_FORM);
      const data = await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id });
      if (data?.resolvedPlant) {
        setPlantManageMode('edit');
      } else {
        setPlantManageMode('create');
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setGroupPlantFormSubmitting(false);
    }
  };

  return useMemo(() => ({
    groupPlantFormState,
    plantManageMode,
    newCultivarName,
    groupPlantFormSubmitting,
    setGroupPlantFormState,
    setPlantManageMode,
    setNewCultivarName,
    handleGroupPlantFormChange,
    handleCreateGroupPlant,
    handleDeleteGroupPlant
  }), [groupPlantFormState, plantManageMode, newCultivarName, groupPlantFormSubmitting]);
}

function mapHarvestPlantToForm(plant, getCultivarName) {
  if (!plant) return EMPTY_GROUP_PLANT_FORM;
  return {
    cultivar_name: getCultivarName(plant),
    plant_count: plant.plant_count || 1,
    current_room: plant.current_room || '',
    notes: plant.notes || ''
  };
}

export { mapHarvestPlantToForm, EMPTY_GROUP_PLANT_FORM };
