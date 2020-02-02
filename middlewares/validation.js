const { body, query } = require('express-validator');

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
    case 'getUser':
      return [
        query('username')
          .trim()
          .isLength({ min: 4, max: 30 })
          .withMessage('incorrect-length-username-length')
          .matches('^[a-zA-Z0-9]+$')
          .withMessage('forbidden-symbols-username')
      ];

    case 'createTrip':
      return [
        body('countryCode', 'no-country-code-field')
          .notEmpty()
          .trim(),
        body('city', 'no-city-field')
          .notEmpty()
          .trim(),
        body('startDate')
          .if(body('endDate').notEmpty())
          .notEmpty()
          .withMessage('no-start-date-field')
          .trim(),
        body('endDate')
          .if(body('startDate').notEmpty())
          .notEmpty()
          .withMessage('no-end-date-field')
          .trim()
      ];

    case 'checkSignupUsername':
      return [
        body('value')
          .trim()
          .isLength({ min: 4, max: 30 })
          .withMessage('incorrect-length-username-length')
          .matches('^[a-zA-Z0-9]+$')
          .withMessage('forbidden-symbols-username')
      ];
    case 'checkSignupEmail':
      return [
        body('value')
          .trim()
          .isEmail()
          .withMessage('not-email')
      ];
    case 'checkSignupPassword':
      return [
        body('value')
          .trim()
          .isLength({ min: 6, max: 64 })
          .withMessage('incorrect-password-field-length')
      ];
    case 'createOrEditArticle':
      return [
        body('title', 'no-article-title-field')
          .notEmpty()
          .trim(),
        body('body', 'no-article-body-field').notEmpty()
      ];
    case 'getUserArticles':
      return [
        query('userId')
          .isNumeric()
          .withMessage('incorrect-get-user-articles-userId-field'),
        query('offset')
          .if(value => value.length)
          .isNumeric()
          .withMessage('incorrect-get-user-articles-offset-field'),
        query('limit')
          .if(value => value.length)
          .isNumeric()
          .withMessage('incorrect-get-user-articles-limit-field')
      ];
    default:
      break;
  }
};
