const router = require('express').Router();
const ctrl   = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All message routes require authentication
router.use(authenticate);

// GET  /api/messages              — inbox (received messages)
router.get('/',       ctrl.getInbox);

// GET  /api/messages/item/:itemId — thread for an item
router.get('/item/:itemId', ctrl.getThreadByItem);

// POST /api/messages              — send a message
router.post('/',      ctrl.sendMessage);

// PATCH /api/messages/:id/read   — mark as read
router.patch('/:id/read', ctrl.markRead);

module.exports = router;
