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
router.post('/', auth, validation('createTrip'), async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw validationErrors.errors;
    }

    const { countryCode, city, startDate, endDate } = req.body;
    const { id } = req.session.user;

    await models.trip.create({
      user: id,
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

module.exports = router;
