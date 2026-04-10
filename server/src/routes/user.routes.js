const router = require('express').Router();
const ctrl   = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// GET  /api/users/profile        — own profile
router.get('/profile',      ctrl.getProfile);

// PUT  /api/users/profile        — update own profile
router.put('/profile',      ctrl.updateProfile);

module.exports = router;
