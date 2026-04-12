const router     = require('express').Router();
const ctrl       = require('../controllers/search.controller');
const { optionalAuth } = require('../middleware/optionalAuth.middleware');
const validate   = require('../middleware/validate.middleware');
const { searchQuerySchema } = require('../middleware/validators/search.validator');

/**
 * GET /api/search
 * Public endpoint — authenticated users (especially admins) get enriched results.
 *
 * Query params:
 *   keyword, type, categoryId, locationId, from, to, status (admin), page, limit
 */
router.get(
  '/',
  optionalAuth,
  validate(searchQuerySchema, 'query'),
  ctrl.searchItems,
);

module.exports = router;
