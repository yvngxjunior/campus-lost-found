/**
 * catchAsync — encapsule un handler async pour transmettre les erreurs à next()
 */
exports.catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * errorHandler — gestionnaire d'erreurs global Express
 */
exports.errorHandler = (err, req, res, _next) => {
  const status  = err.statusCode || err.status || 500;
  const message = err.message    || 'Erreur interne du serveur';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${status} — ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(status).json({
    error:   message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
