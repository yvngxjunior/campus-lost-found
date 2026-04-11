const router   = require('express').Router();
const ctrl     = require('../controllers/photo.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload   = require('../middleware/upload.middleware');

// POST /api/items/:id/photos  — upload photos for an item
router.post(
  '/items/:id/photos',
  authenticate,
  upload.array('photos', 5),
  ctrl.uploadPhotos
);

// DELETE /api/photos/:id  — delete a specific photo
router.delete('/photos/:id', authenticate, ctrl.deletePhoto);

module.exports = router;
