import { apiUrl } from '../../lib/api';

async function requestJson(path, options = {}, fallbackMessage = 'Request failed') {
  const response = await fetch(apiUrl(path), options);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export function fetchHarvestGroups() {
  return requestJson('/api/harvest-groups', {}, 'Failed to fetch harvest groups');
}

export function fetchObservationsByPlant(plantId, harGrp) {
  const params = new URLSearchParams({ har_grp: harGrp });
  return requestJson(
    `/api/observations/plant/${plantId}?${params.toString()}`,
    {},
    'Failed to fetch observations'
  );
}

export function uploadObservationImage(file) {
  return uploadImageFile(file, 'observation');
}

export function uploadHarvestGroupImage(file) {
  return uploadImageFile(file, 'harvest-group');
}

async function uploadImageFile(file, category) {
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
}

export function createObservation(payload) {
  return requestJson('/api/observations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Failed to save observation');
}

export function updateObservation(observationId, payload) {
  return requestJson(`/api/observations/${observationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Failed to save observation');
}

export function deleteObservationById(observationId) {
  return requestJson(`/api/observations/${observationId}`, {
    method: 'DELETE'
  }, 'Failed to delete observation');
}

export function createHarvestGroup(payload) {
  return requestJson('/api/harvest-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Failed to create harvest group');
}

export function updateHarvestGroup(groupId, payload) {
  return requestJson(`/api/harvest-groups/${groupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Failed to update harvest group');
}

export function deleteHarvestGroup(groupId) {
  return requestJson(`/api/harvest-groups/${groupId}`, {
    method: 'DELETE'
  }, 'Failed to delete harvest group');
}

export function addPlantToHarvestGroup(groupId, payload) {
  return requestJson(`/api/harvest-groups/${groupId}/plants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Failed to add plant to harvest group');
}

export function updatePlantInHarvestGroup(groupId, plantId, payload) {
  return requestJson(`/api/harvest-groups/${groupId}/plants/${plantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, 'Failed to update harvest-group plant');
}

export function deletePlantFromHarvestGroup(groupId, plantId) {
  return requestJson(`/api/harvest-groups/${groupId}/plants/${plantId}`, {
    method: 'DELETE'
  }, 'Failed to delete harvest-group plant');
}
