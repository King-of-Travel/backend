const express = require('express');
const createError = require('http-errors');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const validation = require('../middlewares/validation');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');

const router = express.Router();

/*
 * Getting Trip Articles
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#e944b0b0-b7f9-4c86-a284-0918df736035
 */
router.get('/article/:idTrip', (req, res, next) => {
  const { idTrip } = req.params;

  models.trip
    .findOne({
      where: { id: idTrip },
      attributes: [
        'id',
        'author',
        'title',
        'countryCode',
        'article',
        'city',
        'startDate',
        'endDate',
        'createdAt',
        'private'
      ]
    })
    .then(trip => {
      if (!trip || trip.article === null || trip.private)
        return next(createError(404));

      // Need to return user username
      models.user
        .findOne({ where: { id: trip.author }, attributes: ['username'] })
        .then(author => {
          res.status(200).json({ ...trip.dataValues, author: author.username });
        })
        .catch(next);
    });
});

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

    const { title, countryCode, city, startDate, endDate, private } = req.body;
    const { email } = req.session.user;

    models.trip
      .create({
        author: email,
        title,
        countryCode,
        city,
        startDate,
        endDate,
        private
      })
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

  const {
    title,
    countryCode,
    city,
    article,
    startDate,
    endDate,
    private
  } = req.body;
  const { email } = req.session.user;

  models.trip
    .create({
      author: email,
      title,
      countryCode,
      city,
      article,
      startDate,
      endDate,
      private
    })
    .then(({ id }) => res.status(201).json(id))
    .catch(next);
});

module.exports = router;
