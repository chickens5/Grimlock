import express from 'express';
import { uploadImage, uploadImageMiddleware } from '../controllers/uploadController.js';
import { requireWriteAccess } from '../middleware/requireWriteAccess.js';

const router = express.Router();

router.use(requireWriteAccess);

router.post('/image', (req, res, next) => {
  uploadImageMiddleware(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || 'Image upload failed' });
    }
    return uploadImage(req, res, next);
  });
});

export default router;
