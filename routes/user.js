const express = require("express");

const models = require("../models");
const { sequelizeValidation } = require("../middlewares/error-handler");

const router = express.Router();

router.put("/", function(req, res, next) {
  const { email, password, username } = req.body;

  models.user
    .create({ email, password, username })
    .then(() => res.sendStatus(201))
    .catch(error => sequelizeValidation(error, 403, res))
    .catch(next);
});

module.exports = router;
