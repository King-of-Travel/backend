const Sequelize = require('sequelize');

function errorHandler(errorModel, statusCode, res, next) {
  res.status(statusCode);

  /*
   * sequelize validator
   */
  if (errorModel instanceof Sequelize.ValidationError) {
    let errors = {};

    errorModel.errors.forEach(error => {
      errors[error.path] = res.__(error.message);
    });

    return res.send({ errors });
  }

  /*
   * express-validator
   */
  if (typeof errorModel === 'object') {
    let errors = {};

    errorModel.forEach(error => {
      errors[error.param] = res.__(error.msg);
    });

    return res.send({ errors });
  }

  if (typeof errorModel === 'string') {
    return res.send({ errors: { message: res.__(errorModel) } });
  }
}

module.exports = errorHandler;
