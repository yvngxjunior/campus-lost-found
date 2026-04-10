const prisma = require('../config/prisma');
const { catchAsync } = require('../middleware/error.middleware');

const MSG_SELECT = {
  id: true, content: true, sentAt: true, readAt: true,
  sender:    { select: { id: true, username: true } },
  recipient: { select: { id: true, username: true } },
  item:      { select: { id: true, name: true } },
};

/** GET /api/messages — inbox */
exports.getInbox = catchAsync(async (req, res) => {
  const messages = await prisma.message.findMany({
    where:   { recipientId: req.user.id },
    select:  MSG_SELECT,
    orderBy: { sentAt: 'desc' },
  });
  res.json({ messages });
});

/** GET /api/messages/item/:itemId — full thread for an item */
exports.getThreadByItem = catchAsync(async (req, res) => {
  const messages = await prisma.message.findMany({
    where: {
      itemId: req.params.itemId,
      OR: [{ senderId: req.user.id }, { recipientId: req.user.id }],
    },
    select:  MSG_SELECT,
    orderBy: { sentAt: 'asc' },
  });
  res.json({ messages });
});

/** POST /api/messages — send a message */
exports.sendMessage = catchAsync(async (req, res) => {
  const { recipientId, itemId, content } = req.body;
  if (!recipientId || !itemId || !content) {
    return res.status(422).json({ error: 'recipientId, itemId and content are required' });
  }
  if (recipientId === req.user.id) {
    return res.status(400).json({ error: 'Cannot send a message to yourself' });
  }

  const msg = await prisma.message.create({
    data: { senderId: req.user.id, recipientId, itemId, content },
    select: MSG_SELECT,
  });
  res.status(201).json({ message: msg });
});

/** PATCH /api/messages/:id/read */
exports.markRead = catchAsync(async (req, res) => {
  const msg = await prisma.message.findUnique({ where: { id: req.params.id } });
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  if (msg.recipientId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const updated = await prisma.message.update({
    where: { id: req.params.id },
    data:  { readAt: new Date() },
    select: MSG_SELECT,
  });
  res.json({ message: updated });
});
