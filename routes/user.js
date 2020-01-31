const express = require('express');
const { validationResult } = require('express-validator');

const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const validation = require('../middlewares/validation');

const router = express.Router();

/*
 * Create an account
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#f93a6969-8d9d-409e-a583-e549645c8223
 */
router.post('/', validation('createUser'), (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return errorHandler(validationErrors.errors, 400, res, next);
  }

  const { email, password, username } = req.body;

  models.user
    .create({ email, password, username })
    .then(() => res.sendStatus(201))
    .catch(error => errorHandler(error, 400, res, next));
});

/*
 * Get user data
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#737b9a86-a9e0-4334-be7b-0e585ae072d9
 */
router.get('/', validation('getUser'), async (req, res, next) => {
  try {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    let { username } = req.query;

    let foundUser = await models.user.findOne({
      where: { username },
      attributes: ['username', 'createdAt']
    });

    if (!foundUser) throw 'not-found';

    res.json(foundUser);
  } catch (error) {
    errorHandler(error, 404, res, next);
  }
});

module.exports = router;
