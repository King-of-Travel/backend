const express = require('express');
const multer = require('multer');
const fs = require('fs');
const nanoidNonSecure = require('nanoid/non-secure');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const { validateInputData } = require('../middlewares/validator');
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
  validateInputData('create-edit/article'),
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      const { title, body, countryCode, city, tags } = req.body;

      const userId = req.session.user.id;

      let newAritcle = await models.article.create({
        userId,
        title,
        body,
        countryCode,
        city,
      });

      if (tags.length >= 1) {
        await models.articleTags.bulkCreate(
          tags.map((tag) => {
            return { articleId: newAritcle.id, value: tag.value };
          })
        );
      }

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
router.get('/', validateInputData('get/article'), async (req, res, next) => {
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
        'updatedAt',
      ],
      include: [
        { model: models.user, attributes: ['id', 'username'] },
        {
          model: models.articleLikes,
          as: 'likes',
          attributes: ['userId'],
        },
        {
          model: models.articleTags,
          as: 'tags',
          attributes: ['value'],
        },
      ],
    });

    if (!foundArticle) throw 'article-not-found';

    let user = req.session && req.session.user;
    let currentUserRating = null;

    // Determine if the user who made the request is like
    await foundArticle.likes.find((like) => {
      if (!user) return false;

      if (like.userId === user.id) {
        currentUserRating = true;
        return true;
      }
    });

    foundArticle.dataValues.likes = {
      count: foundArticle.likes.length,
      currentUserRating,
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
  validateInputData('put-remove-like/article'),
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
        where: { id: articleId },
      });

      if (!foundArticle) throw 'article-not-found';

      let findOrCreate = await models.articleLikes.findOrCreate({
        where: { articleId, userId: user.id },
      });

      // If the user has liked, then a request to delete it
      if (!findOrCreate[1]) {
        await models.articleLikes.destroy({
          where: {
            articleId,
            userId: user.id,
          },
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
  validateInputData('get-editing/article'),
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
        include: [
          {
            model: models.articleTags,
            as: 'tags',
            attributes: ['value'],
          },
        ],
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
  validateInputData('edit/article'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { id } = req.query;
      let { title, body, countryCode, city, tags } = req.body;

      let user = req.session.user;

      let editArticle = await models.article.update(
        { title, body, countryCode, city },
        {
          where: { id, userId: user.id },
          raw: true,
        }
      );

      if (!editArticle[0]) throw 'article-not-found';

      await models.articleTags.destroy({
        where: {
          articleId: id,
        },
      });

      if (tags && tags.length >= 1) {
        await models.articleTags.bulkCreate(
          tags.map((tag) => {
            return { articleId: id, value: tag.value };
          })
        );
      }

      res.sendStatus(200);
    } catch (error) {
      errorHandler(error, 404, res, next);
    }
  }
);

/*
 * Add image to article
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#10aa912e-64c4-4add-ae9f-9d3d7b8d2a01
 */

let diskStoringArticleImage = multer.diskStorage({
  destination: function (req, file, cb) {
    let userId = req.session.user.id;
    let dir = `uploads/article/${userId}`;

    fs.exists(dir, (exist) => {
      if (exist) return cb(null, dir);

      return fs.mkdir(dir, (error) => cb(error, dir));
    });
  },
  filename: function (req, file, cb) {
    cb(null, nanoidNonSecure(5) + '.png');
  },
});

let uploadArticleImage = multer({
  storage: diskStoringArticleImage,
});

router.post(
  '/image',
  auth,
  uploadArticleImage.single('image'),
  async (req, res, next) => {
    try {
      let file = req.file;

      if (!file) {
        throw 'no-image-field-adding-image-article';
      }

      let userId = req.session.user.id;

      res.json({
        success: 1,
        file: {
          url: `/api/article/image/${userId}/${file.filename}`,
        },
      });
    } catch (error) {
      errorHandler(error, 400, res, next);
    }
  }
);

/*
 * Get article image
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#48b47816-22ba-4256-a9b4-56bcb004268a
 */
router.get(
  '/image/:userId/:imageId',
  validateInputData('get-image/article'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { userId, imageId } = req.params;

      res.sendFile(`uploads/article/${userId}/${imageId}`, { root: '.' });
    } catch (error) {
      errorHandler(error, 400, res, next);
    }
  }
);

module.exports = router;
