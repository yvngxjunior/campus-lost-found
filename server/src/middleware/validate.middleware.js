/**
 * Validates req.body with a Joi schema.
 * Passes a formatted error to next() on failure.
 */
const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    error.statusCode = 422;
    return next(error);
  }
  req.body = value;
  next();
};

module.exports = validate;
