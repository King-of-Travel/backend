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
router.post('/', validation('createUser'), async (req, res, next) => {
  try {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    const { email, password, username } = req.body;

    let createdUser = await models.user.create({ email, password, username });

    if (!createdUser) {
      throw createdUser;
    }

    res.sendStatus(201);
  } catch (error) {
    errorHandler(error, 400, res, next);
  }
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
      attributes: ['id', 'username', 'createdAt']
    });

    if (!foundUser) throw 'not-found';

    res.json(foundUser);
  } catch (error) {
    errorHandler(error, 404, res, next);
  }
});

/*
 * Get user articles by user ID
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#6a0094fc-df88-4b49-b4b9-2fc89e769009
 */
router.get(
  '/articles',
  validation('getUserArticles'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { userId, limit = 20, offset = 0 } = req.query;

      let foundArticles = await models.article.findAndCountAll({
        where: { userId },
        attributes: ['id', 'title', 'countryCode', 'city', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      res.json({ count: foundArticles.count, list: foundArticles.rows });
    } catch (error) {
      errorHandler(error, 404, res, next);
    }
  }
);

module.exports = router;
