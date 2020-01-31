const Sequelize = require('sequelize');

function errorHandler(errorModel, statusCode, res, next) {
  /*
   * sequelize validator
   */
  if (errorModel instanceof Sequelize.ValidationError) {
    const errors = {};

    errorModel.errors.forEach(error => {
      errors[error.path] = res.__(error.message);
    });

    return res.status(statusCode).send({ errors });
  }

  /*
   * express-validator
   */
  if (typeof errorModel === 'object') {
    const errors = {};

    errorModel.forEach(error => {
      errors[error.param] = res.__(error.msg);
    });

    return res.status(statusCode).send({ errors });
  }

  if (typeof errorModel === 'string') {
    return res.status(statusCode).send(res.__(errorModel));
  }

  return next(errorModel);
}

module.exports = errorHandler;
