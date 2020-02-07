const express = require('express');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const validation = require('../middlewares/validation');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');
const { generateJsonToHTML } = require('../common/editor');

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

/*
 * Get article
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#80fa3b97-f74d-4960-bf32-a967cfa884a4
 */
router.get('/', async (req, res, next) => {
  try {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    let { id } = req.query;

    let foundArticle = await models.article.findOne({
      where: { id },
      attributes: [
        'id',
        'user',
        'title',
        'body',
        'countryCode',
        'city',
        'createdAt',
        'updatedAt'
      ],
      raw: true
    });

    if (!foundArticle) throw 'not-found';

    foundArticle.body = foundArticle.body.map(generateJsonToHTML).join('');

    let authorUsername = await models.user.findOne({
      where: { id: foundArticle.user },
      attributes: ['username']
    });

    foundArticle.user = authorUsername.username;

    let foundLikes = await models.articleLikes.findAndCountAll({
      where: { idArticle: id },
      raw: true
    });

    let user = req.session && req.session.user;

    let currentUserRating = null;

    await foundLikes.rows.find(like => {
      if (!user) return false;

      if (like.idUser === user.id) {
        currentUserRating = true;
        return true;
      }
    });

    foundArticle.likes = {
      count: foundLikes.count,
      currentUserRating
    };

    res.json(foundArticle);
  } catch (error) {
    errorHandler(error, 400, res, next);
  }
});

/*
 * Put or remove like
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#a946dce2-bdee-433c-948e-cf5765a6db25
 */
router.put('/like', auth, async (req, res, next) => {
  try {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    let { idArticle } = req.query;
    let user = req.session.user;

    let foundArticle = await models.article.findOne({
      where: { id: idArticle }
    });

    if (!foundArticle) throw 'article-not-found';

    let findOrCreate = await models.articleLikes.findOrCreate({
      where: { idArticle, idUser: user.id }
    });

    // If the user has liked, then a request to delete it
    if (!findOrCreate[1]) {
      await models.articleLikes.destroy({
        where: {
          idArticle,
          idUser: user.id
        }
      });
    }

    res.sendStatus(200);
  } catch (error) {
    errorHandler(error, 400, res, next);
  }
});

module.exports = router;
