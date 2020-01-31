const express = require('express');
const createError = require('http-errors');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const errorHandler = require('../middlewares/error-handler');
const validation = require('../middlewares/validation');
const auth = require('../middlewares/auth');

const models = require('../models');

const router = express.Router();

/*
 * Create session
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#7fa8317f-b1d0-45b0-9478-3077f7fd7e38
 */
router.post('/', validation('createSession'), async (req, res, next) => {
  try {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    let { username, password } = req.body;
    let where = {
      [Op.or]: [{ username }, { email: username.toLowerCase() }]
    };

    let foundUser = await models.user.findOne({
      where,
      attributes: ['id', 'email', 'password', 'username']
    });

    if (!foundUser || !foundUser.isValidPassword(password)) {
      throw 'incorrect-username-password';
    }

    const userResponse = {
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username
    };

    req.session.user = userResponse;
    res.status(201).json(userResponse);
  } catch (error) {
    errorHandler(error, 400, res, next);
  }
});

router.delete('/', auth, async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    await req.session.destroy();

    res.sendStatus(200);
  } catch (error) {
    errorHandler(error, 401, res, next);
  }
});

module.exports = router;
