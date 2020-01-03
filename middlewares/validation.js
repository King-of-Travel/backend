const { body } = require('express-validator');

const AllCountries = require('../models/countries/en.json');

function validationCountriesName(value) {
  return AllCountries.find(country => country.code === value);
}

function validationDateFutureTrip(value, q, e) {
  if (isNaN(Date.parse(value))) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (value < yesterday) return false;

  return true;
}

module.exports = method => {
  switch (method) {
    case 'createSession':
      return [
        body('username')
          .isLength({
            min: 4,
            max: 255
          })
          .withMessage('not-correct-length-usernameOrEmail'),
        body('password')
          .isLength({
            min: 6,
            max: 64
          })
          .withMessage('not-correct-length-password')
      ];
    case 'createUser':
      return [
        body('email', 'not-email')
          .isEmail()
          .withMessage('not-email'),
        body('password')
          .isLength({
            min: 6,
            max: 64
          })
          .withMessage('not-correct-length-password'),
        body('username')
          .isLength({ min: 4, max: 30 })
          .withMessage('not-correct-length-username')
      ];

    case 'createFutureTrip':
      return [
        body('name')
          .isLength({ max: 150 })
          .withMessage('not-correct-trip-title-length'),
        body('countryCode')
          .custom(validationCountriesName)
          .withMessage('not-correct-trip-country-code'),
        body('city')
          .isLength({ min: 2, max: 300 })
          .withMessage('not-correct-trip-city-length'),
        body('startDate')
          .custom(validationDateFutureTrip)
          .withMessage('not-correct-trip-start-date'),
        body('endDate')
          .custom(validationDateFutureTrip)
          .withMessage('not-correct-trip-end-date')
      ];

    case 'createPastTrip':
      return [
        body('title')
          .isLength({ max: 150 })
          .withMessage('not-correct-trip-title-length'),
        body('countryCode')
          .custom(validationCountriesName)
          .withMessage('not-correct-trip-country-code'),
        body('city')
          .isLength({ min: 2, max: 300 })
          .withMessage('not-correct-trip-city-length'),
        body('article')
          .if(value => !!value)
          .isLength({ max: 2500 })
          .withMessage('not-correct-trip-article-length'),
        body('startDate')
          .if(value => !!value)
          .custom(validationDateFutureTrip)
          .withMessage('not-correct-trip-start-date'),
        body('endDate')
          .if(value => !!value)
          .custom(validationDateFutureTrip)
          .withMessage('not-correct-trip-end-date')
      ];
    default:
      break;
  }
};
