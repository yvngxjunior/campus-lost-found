/**
 * Global Express error handler.
 * Catches any error passed via next(err).
 */
function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err);

  // Prisma known request errors (constraint violations, not found…)
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({ error: err.message });
  }

  // Validation errors (Joi)
  if (err.isJoi) {
    return res.status(422).json({ error: err.details.map(d => d.message).join(', ') });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

/**
 * Wraps an async route handler to forward errors to next().
 */
const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

module.exports = { errorHandler, catchAsync };
