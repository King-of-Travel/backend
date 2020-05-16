const express = require('express');
const multer = require('multer');
const { validationResult } = require('express-validator');

const models = require('../models');
const { validateInputData } = require('../middlewares/validator');

const router = express.Router();
const upload = multer();

/*
 * User Validation, uniqueness check
 */
router.post(
  '/signup/username',
  upload.none(),
  validateInputData('signup-username/check'),
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
 */
router.post(
  '/signup/email',
  upload.none(),
  validateInputData('signup-email/check'),
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
 */
router.post(
  '/signup/password',
  upload.none(),
  validateInputData('signup-password/check'),
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
