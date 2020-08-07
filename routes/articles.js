const express = require('express');
const sequelize = require('sequelize');
const { validationResult } = require('express-validator');

const { validateInputData } = require('../middlewares/validator');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');

const router = express.Router();

/*
 * Get articles
 */
router.get(
  '/',
  validateInputData('artiles/get-articles'),
  async (req, res, next) => {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return errorHandler(validationErrors.errors, 400, res, next);
    }

    let {
      tag,
      rating = 0,
      offset = 0,
      limit = 20,
      sort = 'top',
      period = 'year',
    } = req.query;

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

    if (period === 'year') {
      date = date.setFullYear(date.getFullYear() - 1);
    }

    date = new Date(date).toLocaleDateString();

    let articles = await models.sequelize
      .query(
        `
        SELECT 
          "article"."title", 
          "article"."createdAt", 
          "article"."id", 
          "user"."id" AS "user.id", 
          "user"."username" AS "user.username",
          "likes" 
        FROM 
          articles AS "article"
        ${
          tag
            ? `
              INNER JOIN "articleTags" as "tag" ON "tag"."articleId" = "article"."id" 
              AND "tag"."value" = '${tag}'          
              `
            : ''
        } 
        ${sort === 'top' || rating >= 1 ? 'INNER' : 'LEFT'} 
        JOIN (
          SELECT 
            Count(1) AS "likes", 
            "articleId" AS id 
          FROM 
            "articleLikes" 
          GROUP BY 
            "articleId" 
          HAVING 
            Count(1)>= '${rating}'
        ) AS "likes" ON "likes"."id" = "article"."id" 
        LEFT JOIN "users" AS "user" ON "article"."userId" = "user"."id"
        ${period ? `WHERE "article"."createdAt" >= '${date}'` : ''} 
        ORDER BY
          ${sort === 'top' || rating >= 1 ? '"likes" DESC,' : ''} 
          "createdAt" DESC 
        limit 
          ${limit} offset ${offset}
        `,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      )
      .map((article) => {
        return {
          ...article,
          user: { id: article['user.id'], username: article['user.username'] },
          'user.id': undefined,
          'user.username': undefined,
        };
      });

    res.json(articles);
  }
);

module.exports = router;
