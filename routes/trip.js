const express = require('express');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const validation = require('../middlewares/validation');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');

const router = express.Router();

/*
 * Add future trip
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#0e2fee61-10b2-4617-ac3b-6ea9c0674208
 */
router.post(
  '/future',
  auth,
  validation('createFutureTrip'),
  (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return errorHandler(validationErrors.errors, 400, res, next);
    }

    const { name, countryCode, city, startDate, endDate } = req.body;

    models.trip
      .create({ name, countryCode, city, startDate, endDate })
      .then(({ id }) => res.status(201).json(id))
      .catch(next);
  }
);

/*
 * Add past trip
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#3f694889-32df-4b6c-902d-d5a91b036ee1
 */
router.post('/past', auth, validation('createPastTrip'), (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return errorHandler(validationErrors.errors, 400, res, next);
  }

  const { name, countryCode, city, description, startDate, endDate } = req.body;

  models.trip
    .create({ name, countryCode, city, description, startDate, endDate })
    .then(({ id }) => res.status(201).json(id))
    .catch(next);
});

module.exports = router;
