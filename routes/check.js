const express = require('express');
const multer = require('multer');
const { validationResult } = require('express-validator');

const models = require('../models');
const validation = require('../middlewares/validation');

const router = express.Router();
const upload = multer();

/*
 * User Validation, uniqueness check
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#23851e9c-1418-4b4e-bc7a-4b185d4750d5
 */
router.post(
  '/signup/username',
  upload.none(),
  validation('checkSignupUsername'),
  async (req, res) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors[0].msg;
      }

      const { value } = req.body;

      const user = await models.user.findOne({ where: { username: value } });

      if (user) throw 'not-unique-username';

      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(res.__(error));
    }
  }
);

/*
 * Email validation, uniqueness check
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#8fd91222-8f8d-4b32-a04a-75bfc9af6386
 */
router.post(
  '/signup/email',
  upload.none(),
  validation('checkSignupEmail'),
  async (req, res) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors[0].msg;
      }

      const { value } = req.body;

      const user = await models.user.findOne({ where: { email: value } });

      if (user) throw 'not-unique-email';

      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(res.__(error));
    }
  }
);

/*
 * Password validation
 * https://documenter.getpostman.com/view/9580525/SW7ey5Jy?version=latest#4bf884cb-67f3-4979-8281-63808398c742
 */
router.post(
  '/signup/password',
  upload.none(),
  validation('checkSignupPassword'),
  async (req, res) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors[0].msg;
      }

      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(res.__(error));
    }
  }
);

module.exports = router;
