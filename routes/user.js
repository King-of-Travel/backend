const express = require('express');
const { validationResult } = require('express-validator');

const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const { validateInputData } = require('../middlewares/validator');

const router = express.Router();

/*
 * Create an account
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
