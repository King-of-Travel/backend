const express = require('express');
const createError = require('http-errors');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const errorHandler = require('../middlewares/error-handler');
const validation = require('../middlewares/validation');

const models = require('../models');

const router = express.Router();

/*
 * Create session
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#7fa8317f-b1d0-45b0-9478-3077f7fd7e38
 */
router.post('/', validation('createSession'), (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return errorHandler(validationErrors.errors, 400, res, next);
  }

  const { username, password } = req.body;
  const where = { [Op.or]: [{ username }, { email: username }] };

  models.user
    .findOne({
      where,
      attributes: ['id', 'email', 'password', 'username']
    })
    .then(user => {
      if (!user || !user.isValidPassword(password)) {
        return next(createError(404, res.__('incorrect-username-password')));
      }

      const userResponse = { email: user.email, username: user.username };

      req.session.user = userResponse;
      res.status(201).json(userResponse);
    })
    .catch(next);
});

module.exports = router;
