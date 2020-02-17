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
  validation('create-edit/article'),
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      const { title, body, countryCode, city } = req.body;

      const userId = req.session.user.id;

      let newAritcle = await models.article.create({
        userId,
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
router.get('/', validation('get/article'), async (req, res, next) => {
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
        'title',
        'body',
        'countryCode',
        'city',
        'createdAt',
        'updatedAt'
      ],
      include: [
        { model: models.user, attributes: ['id', 'username'] },
        {
          model: models.articleLikes,
          as: 'likes',
          attributes: ['userId']
        }
      ]
    });

    if (!foundArticle) throw 'article-not-found';

    let user = req.session && req.session.user;
    let currentUserRating = null;

    // Determine if the user who made the request is like
    await foundArticle.likes.find(like => {
      if (!user) return false;

      if (like.userId === user.id) {
        currentUserRating = true;
        return true;
      }
    });

    foundArticle.dataValues.likes = {
      count: foundArticle.likes.length,
      currentUserRating
    };

    foundArticle.dataValues.body = foundArticle.body
      .map(generateJsonToHTML)
      .join('');

    res.json(foundArticle);
  } catch (error) {
    errorHandler(error, 400, res, next);
  }
});

/*
 * Put or remove like
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#a946dce2-bdee-433c-948e-cf5765a6db25
 */
router.put(
  '/like',
  validation('put-remove-like/article'),
  auth,
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { articleId } = req.query;
      let user = req.session.user;

      let foundArticle = await models.article.findOne({
        where: { id: articleId }
      });

      if (!foundArticle) throw 'article-not-found';

      let findOrCreate = await models.articleLikes.findOrCreate({
        where: { articleId, userId: user.id }
      });

      // If the user has liked, then a request to delete it
      if (!findOrCreate[1]) {
        await models.articleLikes.destroy({
          where: {
            articleId,
            userId: user.id
          }
        });
      }

      res.sendStatus(200);
    } catch (error) {
      errorHandler(error, 400, res, next);
    }
  }
);

/*
 * Get an article to edit
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#83e33098-f823-4656-8184-3d1441859b64
 */
router.get(
  '/edit',
  auth,
  validation('get-editing/article'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { id } = req.query;
      let user = req.session.user;

      let foundArticle = await models.article.findOne({
        where: { id, userId: user.id },
        attributes: ['id', 'title', 'body', 'countryCode', 'city'],
        raw: true
      });

      if (!foundArticle) throw 'article-not-found';

      res.json(foundArticle);
    } catch (error) {
      errorHandler(error, 404, res, next);
    }
  }
);

/*
 * Edit article
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#7a9975c4-90cc-4b70-968a-e7397c151e28
 */
router.post(
  '/edit',
  auth,
  validation('edit/article'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { id } = req.query;
      let article = req.body;
      let user = req.session.user;

      let editArticle = await models.article.update(article, {
        where: { id, userId: user.id },
        raw: true
      });

      if (!editArticle[0]) throw 'article-not-found';

      res.sendStatus(200);
    } catch (error) {
      errorHandler(error, 404, res, next);
    }
  }
);

module.exports = router;
