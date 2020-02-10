const express = require('express');
const sequelize = require('sequelize');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');

const router = express.Router();

/*
 * Get popular articles
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#1e2864f8-ec36-4391-8d44-f945ab4ab293
 */
router.get('/popular', async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    let { limit = 20, offset = 0, period = 'day' } = req.query;

    let date = new Date();

    if (period === 'day') {
      date = date.setDate(date.getDate() - 1);
    }

    if (period === 'week') {
      date = date.setDate(date.getDate() - 7);
    }

    if (period === 'month') {
      date = date.setMonth(date.getMonth() - 1);
    }

    date = new Date(date).toLocaleDateString();

    let foundArticles = await models.sequelize
      .query(
        `
          SELECT    Count("articleId")    AS "likes", 
                    "article"."id"        AS "id", 
                    "article"."title"     AS "title", 
                    "article"."createdAt" AS "createdAt", 
                    "user"."id"           AS "user.id", 
                    "user"."username"     AS "user.username" 
          FROM      "articleLikes" 
          LEFT JOIN "articles" AS "article" 
          ON        "articleLikes"."articleId" = "article"."id" 
          LEFT JOIN "users" AS "user" 
          ON        "article"."userId" = "user"."id" 
          WHERE     "article"."createdAt" >= '${date}' 
          GROUP BY  "article"."id", 
                    "user"."id" 
          ORDER BY  likes DESC limit ${limit} offset ${offset}
        `,
        { type: sequelize.QueryTypes.SELECT }
      )
      .map(article => {
        return {
          ...article,
          user: { id: article['user.id'], username: article['user.username'] },
          'user.id': undefined,
          'user.username': undefined
        };
      });

    let countArticles = await models.sequelize.query(
      `
        SELECT Count(*) 
        FROM   "articleLikes" 
        WHERE  "articleLikes"."createdAt" >= '${date}' 
        GROUP  BY "articleId" 
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({ list: foundArticles, count: countArticles.length });
  } catch (error) {
    errorHandler(error, 400, res, next);
  }
});

module.exports = router;
