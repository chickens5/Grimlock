import { useEffect, useMemo, useState } from 'react';
import { fetchHarvestGroups, fetchObservationsByPlant } from './observationsApi.js';

export function useObservationsData() {
  const [harvestGroups, setHarvestGroups] = useState([]);
  const [selectedHarvestGroupId, setSelectedHarvestGroupId] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [observations, setObservations] = useState([]);

  const [harvestLoading, setHarvestLoading] = useState(true);
  const [observationsLoading, setObservationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbSetupPopupOpen, setDbSetupPopupOpen] = useState(false);

  const selectedHarvestGroup = useMemo(
    () => harvestGroups.find(group => group._id === selectedHarvestGroupId) || null,
    [harvestGroups, selectedHarvestGroupId]
  );

  const plants = selectedHarvestGroup?.plants || [];

  const selectedPlant = useMemo(
    () => plants.find(plant => String(plant._id) === String(selectedPlantId)) || null,
    [plants, selectedPlantId]
  );

  const loadObservationsForSelection = async (plantId, harGrp) => {
    const data = await fetchObservationsByPlant(plantId, harGrp);
    setObservations(Array.isArray(data) ? data : []);
  };

  const loadHarvestGroups = async ({ preferredGroupId, preferredPlantId } = {}) => {
    const data = await fetchHarvestGroups();
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
        setDbSetupPopupOpen(true);
      } finally {
        setHarvestLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!selectedPlantId || !selectedHarvestGroup) {
      setObservations([]);
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

  const handleRetryDbConnection = async () => {
    setHarvestLoading(true);
    setError(null);

    try {
      await loadHarvestGroups({});
      setDbSetupPopupOpen(false);
    } catch (err) {
      setError(err.message);
      setDbSetupPopupOpen(true);
    } finally {
      setHarvestLoading(false);
    }
  };

  return {
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
  };
}
