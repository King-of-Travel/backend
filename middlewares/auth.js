const createError = require('http-errors');

module.exports = function(req, res, next) {
  if (req.session && req.session.user) return next();

  return next(createError(401, res.__('user-not-logged')));
};
