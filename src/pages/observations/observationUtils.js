export const STAGE_LABELS = {
  seedling: 'Seedling',
  vegetative: 'Vegetative',
  'pre-flower': 'Pre-Flower',
  flower: 'Flower',
  'late-flower': 'Late Flower',
  harvest: 'Harvest'
};

export function formatDate(value) {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleString();
}

export function formatStage(stage) {
  return STAGE_LABELS[stage] || stage || 'Unknown stage';
}

export function isImageMedia(item) {
  const type = (item?.type || '').toLowerCase();
  const url = item?.url || '';
  if (!url) return false;

  if (['rgb', 'infrared', 'uv', 'microscope', 'image', 'img', 'photo'].includes(type)) {
    return true;
  }

  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

export function getCultivarName(plant) {
  if (!plant || typeof plant !== 'object') return '';
  return (plant.cultivar_name || plant.strain_name || '').trim();
}
