const express = require('express');
const { validationResult } = require('express-validator');

const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const validation = require('../middlewares/validation');

const router = express.Router();

router.put('/', validation('createUser'), (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return errorHandler(validationErrors.errors, 400, res, next);
  }

  const { email, password, username } = req.body;

  models.user
    .create({ email, password, username })
    .then(() => res.sendStatus(201))
    .catch(error => errorHandler(error, 403, res, next))
    .catch(next);
});

module.exports = router;
