const express = require('express');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const validation = require('../middlewares/validation');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');

const router = express.Router();

/*
 * Add trip
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#3f694889-32df-4b6c-902d-d5a91b036ee1
 */
router.post('/', auth, validation('add/trip'), async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    const { countryCode, city, startDate, endDate } = req.body;

    const userId = req.session.user.id;

    await models.trip.create({
      userId,
      countryCode,
      city,
      startDate,
      endDate
    });

    res.sendStatus(201);
  } catch (error) {
    errorHandler(error, 400, res, next);
  }
});

/*
 * Delete trip
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#7c516b70-9e12-4a13-a2be-739e14e52c58
 */
router.delete(
  '/:tripId',
  auth,
  validation('delete/trip'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { tripId } = req.params;
      let user = req.session.user;

      let deleteTrip = await models.sequelize.query(
        `
          DELETE 
          FROM   "trips" 
          WHERE  "id" = ${tripId}
          AND    "userId" = ${user.id}
        `,
        { type: models.sequelize.QueryTypes.DESTROY }
      );

      if (!deleteTrip[1].rowCount) throw 'not-found';

      res.sendStatus(200);
    } catch (error) {
      errorHandler(error, 404, res, next);
    }
  }
);

module.exports = router;
