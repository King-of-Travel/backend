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
router.get('/article/:idTrip', async (req, res, next) => {
  const { idTrip } = req.params;

  const trip = await models.trip.findOne({
    where: { id: idTrip },
    attributes: [
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
  });

  if (!trip || !trip.article) return next(createError(404));

  const authorUsername = await models.user
    .findOne({ where: { id: trip.author }, attributes: ['username'] })
    .then(author => author.username);

  const usernameRequest =
    (req.session.user && req.session.user.username) || null;

  const dateTrip = {
    ...trip.dataValues,
    author: authorUsername
  };

  if (authorUsername === usernameRequest || !trip.private) {
    return res.status(200).json(dateTrip);
  }

  return next(createError(404));
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
    console.log('TCL: email', email);

    models.trip
      .create({
        author: email,
        title: title || null,
        countryCode,
        city,
        startDate,
        endDate,
        private
      })
      .then(({ id }) => res.status(201).json(id))
      .catch(error => errorHandler(error, 400, res, next));
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
      title: title || null,
      countryCode,
      city,
      article: article || null,
      startDate: startDate || null,
      endDate: endDate || null,
      private
    })
    .then(({ id }) => res.status(201).json(id))
    .catch(error => errorHandler(error, 400, res, next));
});

module.exports = router;
