import fs from 'fs';
import path from 'path';
import multer from 'multer';

const ALLOWED_CATEGORIES = new Set(['harvest-group', 'observation']);

function resolveCategory(value) {
  if (!value) return 'general';
  return ALLOWED_CATEGORIES.has(value) ? value : 'general';
}

function ensureUploadDir(category) {
  const uploadDir = path.join(process.cwd(), 'uploads', category);
  fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}

function makeSafeFilename(filename) {
  return String(filename || 'image')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const category = resolveCategory(req.query.category);
    cb(null, ensureUploadDir(category));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = makeSafeFilename(path.basename(file.originalname || 'image', ext));
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (typeof file?.mimetype === 'string' && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Only image files are allowed'));
}

export const uploadImageMiddleware = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter
}).single('image');

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  const category = resolveCategory(req.query.category);
  const normalizedPath = req.file.path.replace(/\\/g, '/');
  const marker = `/uploads/${category}/`;
  const markerIndex = normalizedPath.lastIndexOf(marker);
  const relative = markerIndex >= 0 ? normalizedPath.slice(markerIndex) : `/uploads/${category}/${req.file.filename}`;

  return res.status(201).json({
    message: 'Image uploaded',
    url: relative,
    filename: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
};
