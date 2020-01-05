const { body } = require('express-validator');

function validationDateFutureTrip(value) {
  if (isNaN(Date.parse(value))) return false;

  const userDate = new Date(value);
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  if (userDate < yesterday) return false;

  return true;
}

module.exports = method => {
  switch (method) {
    case 'createSession':
      return [
        body('username', 'incorrect-username-or-email-field-length')
          .trim()
          .isLength({
            min: 4,
            max: 255
          }),
        body('password', 'incorrect-password-field-length')
          .trim()
          .isLength({
            min: 6,
            max: 64
          })
      ];
    case 'createUser':
      return [
        body('email', 'no-email-field')
          .notEmpty()
          .trim(),
        body('password', 'no-password-field')
          .notEmpty()
          .trim(),
        body('username', 'no-username-field')
          .notEmpty()
          .trim()
      ];

    case 'createFutureTrip':
      return [
        body('title').trim(),
        body('countryCode', 'no-country-code-field')
          .notEmpty()
          .trim(),
        body('city', 'no-city-field')
          .notEmpty()
          .trim(),
        body('startDate')
          .trim()
          .custom(validationDateFutureTrip)
          .withMessage('incorrect-start-date-trip-field')
          .exists()
          .withMessage('no-start-date-field'),
        body('endDate')
          .trim()
          .custom(validationDateFutureTrip)
          .withMessage('incorrect-end-date-trip-field')
          .exists()
          .withMessage('no-end-date-field')
      ];

    case 'createPastTrip':
      return [
        body('title').trim(),
        body('countryCode', 'no-country-code-field')
          .notEmpty()
          .trim(),
        body('city', 'no-city-field')
          .notEmpty()
          .trim(),
        body('article').trim(),
        body('startDate')
          .if(body('endDate').notEmpty())
          .notEmpty()
          .withMessage('no-start-date-field')
          .trim(),
        body('endDate')
          .if(body('startDate').notEmpty())
          .notEmpty()
          .withMessage('no-end-date-field')
          .trim(),
        body('private').exists()
      ];
    default:
      break;
  }
};
