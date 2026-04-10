/**
 * validate — middleware générique de validation Joi
 * @param {import('joi').Schema} schema  Schéma Joi à appliquer sur req.body
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map(d => d.message);
    return res.status(422).json({ error: 'Données invalides', details });
  }
  req.body = value; // données nettoyées et validées
  next();
};

module.exports = validate;
