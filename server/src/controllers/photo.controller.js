const fs     = require('fs');
const path   = require('path');
const prisma = require('../config/prisma');
const { catchAsync } = require('../middleware/error.middleware');

/**
 * POST /api/items/:id/photos
 * Requires: authenticate + upload.array('photos', 5)
 * Uploads one or more photos linked to an item.
 */
exports.uploadPhotos = catchAsync(async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Item not found' });

  // Only the reporter or an admin may add photos
  if (item.reporterId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  // Enforce global max of 5 photos per item
  const existingCount = await prisma.photo.count({ where: { itemId: req.params.id } });
  if (existingCount + req.files.length > 5) {
    // Remove the just-uploaded temp files
    req.files.forEach(f => fs.unlink(f.path, () => {}));
    return res.status(400).json({
      error: `An item can have at most 5 photos. Currently has ${existingCount}.`,
    });
  }

  const photos = await prisma.$transaction(
    req.files.map(f =>
      prisma.photo.create({
        data: { itemId: req.params.id, url: `/uploads/${f.filename}` },
      })
    )
  );

  res.status(201).json({ photos });
});

/**
 * DELETE /api/photos/:id
 * Deletes a photo record and its file on disk.
 */
exports.deletePhoto = catchAsync(async (req, res) => {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  // Check ownership via the parent item
  const item = await prisma.item.findUnique({ where: { id: photo.itemId } });
  if (item.reporterId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Remove from DB
  await prisma.photo.delete({ where: { id: req.params.id } });

  // Remove from disk (non-blocking — best effort)
  const filename = path.basename(photo.url);
  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  fs.unlink(filePath, () => {});

  res.status(204).send();
});
