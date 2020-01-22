const express = require('express');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const validation = require('../middlewares/validation');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');

const router = express.Router();

/*
 * Create new article
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#43fedadc-d6a0-49d3-9597-48941787c49e
 */
router.post(
  '/',
  auth,
  validation('createOrEditArticle'),
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      const { title, body, countryCode, city } = req.body;

      const authorId = req.session.user.id;

      let newAritcle = await models.article.create({
        user: authorId,
        title,
        body,
        countryCode,
        city
      });

      res.status(201).send(newAritcle.id);
    } catch (error) {
      errorHandler(error, 400, res, next);
    }
  }
);

module.exports = router;
