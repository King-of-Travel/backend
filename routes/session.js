const express = require('express');
const createError = require('http-errors');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const errorHandler = require('../middlewares/error-handler');
const { validateInputData } = require('../middlewares/validator');
const auth = require('../middlewares/auth');

const models = require('../models');

const router = express.Router();

/*
 * Create session
 */
router.post(
  '/',
  validateInputData('create/session'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { username, password } = req.body;
      let where = {
        [Op.or]: [{ username }, { email: username.toLowerCase() }],
      };

      let foundUser = await models.user.findOne({
        where,
        attributes: ['id', 'email', 'password', 'username'],
      });

      if (!foundUser || !foundUser.isValidPassword(password)) {
        throw 'incorrect-username-password';
      }

      const userResponse = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
      };

      req.session.user = userResponse;
      res.status(201).json(userResponse);
    } catch (error) {
      errorHandler(error, 400, res, next);
    }
  }
);

/*
 * Destroy session
 */
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
