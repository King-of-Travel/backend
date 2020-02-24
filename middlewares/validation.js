const { body, query, param } = require('express-validator');

module.exports = method => {
  switch (method) {
    case 'create/session':
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
    case 'create/user':
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
    case 'get/user':
      return [
        query('username')
          .trim()
          .isLength({ min: 4, max: 30 })
          .withMessage('incorrect-length-username-length')
          .matches('^[a-zA-Z0-9]+$')
          .withMessage('forbidden-symbols-username')
      ];

    case 'add/trip':
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

    case 'signup-username/check':
      return [
        body('value')
          .trim()
          .isLength({ min: 4, max: 30 })
          .withMessage('incorrect-length-username-length')
          .matches('^[a-zA-Z0-9]+$')
          .withMessage('forbidden-symbols-username')
      ];
    case 'signup-email/check':
      return [
        body('value')
          .trim()
          .isEmail()
          .withMessage('not-email')
      ];
    case 'signup-password/check':
      return [
        body('value')
          .trim()
          .isLength({ min: 6, max: 64 })
          .withMessage('incorrect-password-field-length')
      ];
    case 'create-edit/article':
      return [
        body('title', 'no-article-title-field')
          .notEmpty()
          .trim(),
        body('body', 'no-article-body-field').notEmpty()
      ];
    case 'get-articles/user':
      return [
        query('username')
          .trim()
          .isLength({ min: 4, max: 30 })
          .withMessage('incorrect-length-username-length')
          .matches('^[a-zA-Z0-9]+$')
          .withMessage('forbidden-symbols-username'),
        query('offset')
          .if(value => value.length)
          .isNumeric()
          .withMessage('incorrect-get-user-articles-offset-field'),
        query('limit')
          .if(value => value.length)
          .isNumeric()
          .withMessage('incorrect-get-user-articles-limit-field')
      ];

    case 'put-remove-like/article':
      return [
        query('articleId')
          .trim()
          .isLength({ min: 3, max: 7 })
          .withMessage('incorrect-put-remove-like-articleId-field')
      ];

    case 'get/article':
      return [
        query('id')
          .trim()
          .isLength({ min: 3, max: 7 })
          .withMessage('incorrect-get-article-id-field')
      ];

    case 'get-editing/article':
      return [
        query('id')
          .trim()
          .isLength({ min: 3, max: 7 })
          .withMessage('incorrect-edit-article-id-field')
      ];

    case 'edit/article':
      return [
        query('id')
          .trim()
          .isLength({ min: 3, max: 7 })
          .withMessage('incorrect-edit-article-id-field'),
        body('title')
          .trim()
          .isLength({ min: 3, max: 120 })
          .withMessage('incorrect-edit-article-title-field'),
        body('body')
          .isArray()
          .withMessage('incorrect-edit-article-body-field')
      ];

    case 'get-image/article':
      return [
        param('userId')
          .isNumeric()
          .withMessage('incorrect-user-id-param-get-image-article'),
        param('imageId')
          .isString()
          .withMessage('incorrect-image-id-param-get-image-article')
      ];

    default:
      break;
  }
};
