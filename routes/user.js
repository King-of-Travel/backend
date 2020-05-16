const express = require('express');
const { validationResult } = require('express-validator');

const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const { validateInputData } = require('../middlewares/validator');

const router = express.Router();

/*
 * Create an account
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#f93a6969-8d9d-409e-a583-e549645c8223
 */
router.post('/', validateInputData('create/user'), async (req, res, next) => {
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
router.get('/', validateInputData('get/user'), async (req, res, next) => {
  try {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    let { username } = req.query;

    let foundUser = await models.user.findOne({
      where: { username },
      attributes: ['id', 'username', 'createdAt'],
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
  validateInputData('get-articles/user'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { username, limit = 20, offset = 0 } = req.query;

      let foundUser = await models.user.findOne({
        where: { username },
        attributes: ['id'],
        raw: true,
      });

      let foundArticles = await models.sequelize.query(
        `
          SELECT    Count("likes"."articleId") AS "likes", 
                  "article"."id"             AS "id", 
                  "article"."title"          AS "title", 
                  "article"."countryCode"    AS "countryCode", 
                  "article"."city"           AS "city", 
                  "article"."createdAt"      AS "createdAt" 
          FROM      "articles"                 AS "article" 
          LEFT JOIN "articleLikes"             AS "likes" 
          ON        "article"."id" = "likes"."articleId" 
          WHERE     "article"."userId" = ${foundUser.id} 
          GROUP BY  "article"."id" 
          ORDER BY  "createdAt" DESC limit ${limit} offset ${offset}
        `,
        {
          type: models.sequelize.QueryTypes.SELECT,
        }
      );

      res.json(foundArticles);
    } catch (error) {
      errorHandler(error, 404, res, next);
    }
  }
);

/*
 * Get user trips
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#7d651adb-394a-41d8-befa-01bed5786a86
 */
router.get(
  '/trips',
  validateInputData('get-trips/user'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { username, time = 'future', limit = 20, offset = 0 } = req.query;

      let foundUser = await models.user.findOne({
        where: { username },
        attributes: ['id'],
        raw: true,
      });

      if (!foundUser) throw 'not-found';

      let currentDate = new Date().toLocaleDateString();

      if (time === 'past') {
        time = `"endDate" < '${currentDate}'`;
      }

      if (time === 'present') {
        time = `"startDate" < '${currentDate}' AND "endDate" > '${currentDate}'`;
      }

      if (time === 'future') {
        time = `"startDate" > '${currentDate}'`;
      }

      let foundTrips = await models.sequelize.query(
        `
          SELECT  "id",
                  "countryCode", 
                  "city", 
                  "startDate", 
                  "endDate", 
                  "createdAt" 
          FROM   "trips" 
          WHERE  "userId" = ${foundUser.id} AND ${time}
          ORDER BY "endDate" DESC limit ${limit} offset ${offset}
        `,
        {
          type: models.sequelize.QueryTypes.SELECT,
        }
      );

      res.json(foundTrips);
    } catch (error) {
      errorHandler(error, 400, res, next);
    }
  }
);

module.exports = router;
