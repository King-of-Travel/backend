const Sequelize = require('sequelize');

function sequelizeValidation(errorModel, statusCode, res, next) {
  if (errorModel instanceof Sequelize.ValidationError) {
    const errors = {};

    errorModel.errors.forEach(error => {
      errors[error.path] = res.__(error.message);
    });

    return res.status(statusCode).send({ errors });
  }

  return next(errorModel);
}

module.exports = { sequelizeValidation };
