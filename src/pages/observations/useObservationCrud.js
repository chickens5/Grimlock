import { useState, useMemo } from 'react';
import {
  createObservation,
  updateObservation,
  deleteObservationById,
  uploadObservationImage
} from './observationsApi.js';

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

function toDateTimeInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - localOffsetMs).toISOString().slice(0, 16);
}

function toOptionalNumber(value) {
  if (value === '' || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function useObservationCrud(buildPayloadFn, onSuccess, onError) {
  const [editingObservationId, setEditingObservationId] = useState(null);
  const [formState, setFormState] = useState(EMPTY_OBSERVATION_FORM);
  const [observationImageFile, setObservationImageFile] = useState(null);
  const [observationImagePreviewUrl, setObservationImagePreviewUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const resetForm = () => {
    setEditingObservationId(null);
    setFormState(EMPTY_OBSERVATION_FORM);
    setObservationImageFile(null);
  };

  const handleEditObservation = (observation) => {
    setEditingObservationId(observation._id);
    setFormState(mapObservationToForm(observation));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState(current => ({
      ...current,
      [name]: value
    }));
  };

  const handleObservationImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setObservationImageFile(file);
  };

  const handleSubmit = async (event, selectedPlant, selectedHarvestGroup) => {
    event.preventDefault();
    if (!selectedPlant || !selectedHarvestGroup) {
      onError('Select a harvest group and plant before saving.');
      return;
    }

    setFormSubmitting(true);

    try {
      let observationImageUrl = formState.observ_img;
      if (observationImageFile) {
        observationImageUrl = await uploadObservationImage(observationImageFile);
      }

      const payload = buildPayloadFn(
        {
          ...formState,
          observ_img: observationImageUrl
        },
        selectedHarvestGroup,
        selectedPlant
      );

      const isEditing = Boolean(editingObservationId);
      if (isEditing) {
        await updateObservation(editingObservationId, payload);
      } else {
        await createObservation(payload);
      }

      resetForm();
      onSuccess(isEditing ? 'Observation updated.' : 'Observation created.');
    } catch (err) {
      onError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteObservation = async (observationId) => {
    if (!window.confirm('Delete this observation? This cannot be undone.')) {
      return;
    }

    setFormSubmitting(true);

    try {
      await deleteObservationById(observationId);
      onSuccess('Observation deleted.');
      if (editingObservationId === observationId) {
        resetForm();
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return useMemo(() => ({
    editingObservationId,
    formState,
    observationImageFile,
    observationImagePreviewUrl,
    formSubmitting,
    setFormState,
    setObservationImageFile,
    setObservationImagePreviewUrl,
    resetForm,
    handleEditObservation,
    handleFormChange,
    handleObservationImageChange,
    handleSubmit,
    handleDeleteObservation
  }), [editingObservationId, formState, observationImageFile, observationImagePreviewUrl, formSubmitting]);
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
