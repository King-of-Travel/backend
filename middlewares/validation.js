const { body } = require('express-validator');

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

    default:
      break;
  }
};
