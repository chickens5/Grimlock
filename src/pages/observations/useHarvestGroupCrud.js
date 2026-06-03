import { useState, useMemo } from 'react';
import {
  createHarvestGroup,
  updateHarvestGroup,
  deleteHarvestGroup,
  uploadHarvestGroupImage
} from './observationsApi.js';

const EMPTY_GROUP_FORM = {
  har_grp: '',
  current_room: '',
  notes: '',
  image_url: ''
};

function toOptionalNumber(value) {
  if (value === '' || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function useHarvestGroupCrud(getCultivarName, onSuccess, onError, refreshCurrentData, refreshSelectionAndObservations) {
  const [groupFormState, setGroupFormState] = useState(EMPTY_GROUP_FORM);
  const [groupManageMode, setGroupManageMode] = useState('edit');
  const [newHarvestGroupKey, setNewHarvestGroupKey] = useState('');
  const [groupImageFile, setGroupImageFile] = useState(null);
  const [groupImagePreviewUrl, setGroupImagePreviewUrl] = useState('');
  const [groupFormSubmitting, setGroupFormSubmitting] = useState(false);

  const handleGroupFormChange = (event, name, value) => {
    const actualName = name || event.target.name;
    const actualValue = value !== undefined ? value : event.target.value;

    if (actualName === 'group_id') {
      // This will be handled by parent component
      return;
    } else if (actualName === 'har_grp' && groupManageMode === 'create') {
      setGroupFormState(current => ({
        ...current,
        [actualName]: actualValue
      }));
      setNewHarvestGroupKey(actualValue);
    } else {
      setGroupFormState(current => ({
        ...current,
        [actualName]: actualValue
      }));
    }
  };

  const handleCreateHarvestGroup = async (event, isManagingExistingGroup, selectedHarvestGroup, selectedPlantId) => {
    event.preventDefault();

    setGroupFormSubmitting(true);

    try {
      let groupImageUrl = groupFormState.image_url;
      if (groupImageFile) {
        groupImageUrl = await uploadHarvestGroupImage(groupImageFile);
      }

      if (isManagingExistingGroup) {
        await updateHarvestGroup(selectedHarvestGroup._id, {
          current_room: groupFormState.current_room,
          notes: groupFormState.notes,
          image_url: groupImageUrl
        });

        onSuccess(`Harvest group ${selectedHarvestGroup.har_grp} updated.`);
        await refreshCurrentData({ preferredGroupId: selectedHarvestGroup._id, preferredPlantId: selectedPlantId });
      } else {
        const harGrpValue = (newHarvestGroupKey || groupFormState.har_grp || '').trim();
        if (!harGrpValue) {
          throw new Error('Provide a harvest group key.');
        }

        const createdGroup = await createHarvestGroup({
          har_grp: harGrpValue,
          current_room: groupFormState.current_room,
          notes: groupFormState.notes,
          image_url: groupImageUrl
        });

        onSuccess(`Harvest group ${createdGroup.har_grp} created.`);
        await refreshCurrentData({ preferredGroupId: createdGroup._id });
        setGroupManageMode('edit');
      }
      setNewHarvestGroupKey('');
      setGroupImageFile(null);
    } catch (err) {
      onError(err.message);
    } finally {
      setGroupFormSubmitting(false);
    }
  };

  const handleDeleteHarvestGroup = async (selectedHarvestGroup) => {
    if (!selectedHarvestGroup) {
      onError('Select a harvest group to delete.');
      return;
    }

    if (!window.confirm(`Delete harvest group ${selectedHarvestGroup.har_grp}? This will also remove observations in this group.`)) {
      return;
    }

    setGroupFormSubmitting(true);

    try {
      await deleteHarvestGroup(selectedHarvestGroup._id);

      onSuccess(`Harvest group ${selectedHarvestGroup.har_grp} deleted.`);
      setGroupFormState(EMPTY_GROUP_FORM);
      setGroupImageFile(null);
      const data = await refreshCurrentData({});

      if (data?.resolvedGroup) {
        setGroupManageMode('edit');
      } else {
        setGroupManageMode('create');
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setGroupFormSubmitting(false);
    }
  };

  return useMemo(() => ({
    groupFormState,
    groupManageMode,
    newHarvestGroupKey,
    groupImageFile,
    groupImagePreviewUrl,
    groupFormSubmitting,
    setGroupFormState,
    setGroupManageMode,
    setNewHarvestGroupKey,
    setGroupImageFile,
    setGroupImagePreviewUrl,
    handleGroupFormChange,
    handleCreateHarvestGroup,
    handleDeleteHarvestGroup
  }), [groupFormState, groupManageMode, newHarvestGroupKey, groupImageFile, groupImagePreviewUrl, groupFormSubmitting]);
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

export { mapHarvestGroupToForm, EMPTY_GROUP_FORM };
