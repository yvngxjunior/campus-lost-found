const router = require('express').Router();
const ctrl   = require('../controllers/claim.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.use(authenticate);

// POST /api/claims              — submit a claim request
router.post('/',           ctrl.submitClaim);

// GET  /api/claims/my           — user's own claims
router.get('/my',          ctrl.myClaims);

// PATCH /api/claims/:id/approve — admin only
router.patch('/:id/approve', requireRole('ADMIN'), ctrl.approveClaim);

// PATCH /api/claims/:id/reject  — admin only
router.patch('/:id/reject',  requireRole('ADMIN'), ctrl.rejectClaim);

module.exports = router;
